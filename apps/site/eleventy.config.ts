import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import type { UserConfig } from '@11ty/eleventy'
import JSON5 from 'json5'

// ─── Eleventy config ──────────────────────────────────────────────────────────

/** One page in the `docsPages` collection: enough of an Eleventy item to sort it. */
interface DocsPage {
  data: { section?: unknown; order?: number; title?: string }
}

export default function (eleventyConfig: UserConfig) {
  // The build runs from the apps/site workspace (cwd = apps/site), which owns dist/.
  const outputRoot = resolve(process.cwd(), 'dist')

  // ── Relative URL helper ──────────────────────────────────────────────────
  // Converts absolute internal URLs to relative paths from the current output
  // file. This makes the dist/ folder fully portable (no assumed root).
  const toRelativeOutputUrl = (url: string, outputPath: string): string => {
    if (!url.startsWith('/')) return url
    if (url.startsWith('//')) return url

    // A fragment is addressed within the target document, so it is set aside
    // before the path is resolved and reattached afterwards. Without this a
    // link to /projects/#tool normalizes to a bare directory, which a served
    // site resolves and a dist/ opened from the filesystem does not.
    const hash = url.indexOf('#')
    const fragment = hash < 0 ? '' : url.slice(hash)
    const path = hash < 0 ? url : url.slice(0, hash)

    // Make internal page URLs explicit to avoid directory-index assumptions.
    let normalized = path
    if (normalized === '/') normalized = '/index.html'
    else if (normalized.endsWith('/')) normalized = `${normalized}index.html`

    const fromDir = dirname(outputPath)
    const targetPath = resolve(outputRoot, `.${normalized}`)
    const rel = relative(fromDir, targetPath).split(sep).join('/')
    return `${rel || './'}${fragment}`
  }

  // ── Passthrough copies ───────────────────────────────────────────────────
  // Add any static asset directories that should be copied verbatim to dist.
  eleventyConfig.addPassthroughCopy('src/assets/images')
  eleventyConfig.addPassthroughCopy('src/assets/js')
  eleventyConfig.addPassthroughCopy({ 'src/assets/diagrams': 'diagrams' })
  eleventyConfig.addPassthroughCopy({ '../../docs/diagrams/*.html': 'diagrams/site' })
  eleventyConfig.addPassthroughCopy({ '../../docs/diagrams/*.svg': 'diagrams/site' })
  eleventyConfig.addWatchTarget('../../docs/diagrams')
  // The Stoa workbench, vendored by sync:stoa. It lives outside src/ so Eleventy copies its pages rather than
  // rendering them, and it refers to its own files relatively, so it runs from /stoa/workbench/ or a dist/ folder.
  eleventyConfig.addPassthroughCopy({ 'vendor/stoa-workbench': 'stoa/workbench' })
  const escapeHtml = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  function figure(slug: string, caption: string): string {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid figure slug: ${slug}`)
    const site = Bun.TOML.parse(readFileSync('../../docs/diagrams/diagrams.toml', 'utf8')) as Record<string, unknown>
    const vendored = JSON5.parse(readFileSync('src/_data/vendoredDiagrams.json5', 'utf8')) as {
      diagrams: Record<string, { svg: string; html: string }>
    }
    const entry = vendored.diagrams[slug]
    if (site[slug] && entry) throw new Error(`Ambiguous figure slug: ${slug}`)
    if (!site[slug] && !entry) throw new Error(`Unknown figure slug: ${slug}`)
    const files = site[slug]
      ? { svg: `../../docs/diagrams/${slug}.svg`, html: `/diagrams/site/${slug}.html` }
      : {
          svg: `src/assets/diagrams/vendored/ki-agentic-harness/${entry.svg}`,
          html: `/diagrams/vendored/ki-agentic-harness/${entry.html}`
        }
    // The figure lands in Markdown, where markdown-it treats it as one HTML block that ends at the first
    // blank line. Every exported SVG carries blank lines between its parts, so what followed the first one
    // was rendered as prose: a <p> inside the SVG ends it in the browser, and the diagram collapsed. Drop
    // the blank lines so the whole figure stays verbatim; whitespace between SVG elements is not content.
    let svg = readFileSync(files.svg, 'utf8')
      .replace(/<\?xml[^>]*\?>/g, '')
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/^[ \t]*\r?\n/gm, '')
    const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
    const prefix = `figure-${slug}-`
    for (const id of ids) {
      svg = svg
        .replaceAll(`id="${id}"`, `id="${prefix}${id}"`)
        .replaceAll(`url(#${id})`, `url(#${prefix}${id})`)
        .replaceAll(`href="#${id}"`, `href="#${prefix}${id}"`)
    }
    svg = svg.replace(
      /aria-labelledby="([^"]+)"/g,
      (_match, value: string) =>
        `aria-labelledby="${value
          .split(/\s+/)
          .map((id) => `${prefix}${id}`)
          .join(' ')}"`
    )
    // Dual SVG exports carry their own stylesheet. Scope it to this SVG so a vendored chart
    // cannot recolour the site or another inline chart; the copied source stays byte-identical.
    svg = svg
      .replace('<svg ', `<svg id="figure-${slug}" `)
      .replace(
        /<style([^>]*)>([\s\S]*?)<\/style>/g,
        (_match, attributes: string, css: string) => `<style${attributes}>@scope (#figure-${slug}) {${css}}</style>`
      )
    return `<figure class="figure-diagram"><div class="figure-diagram-panel">${svg}</div><figcaption>${escapeHtml(caption)} <a href="${files.html}" target="_blank" rel="noopener">Interactive</a></figcaption></figure>`
  }
  eleventyConfig.addShortcode('figure', figure)

  // ── Live Stoa stories ────────────────────────────────────────────────────
  // A story from the vendored workbench, live in a frame: the frame shows story.html#<id>, which draws the
  // story's sample inputs with its own theme and mode controls. site.js sets the frame's light or dark to match
  // this page and sizes it to the story. `stoaThemes` shows one story once per sample theme, side by side.
  const stoaWorkbench = (): {
    stories: { id: string; title: string }[]
    themes: { id: string; name: string; description: string }[]
  } => JSON5.parse(readFileSync('src/_data/stoaWorkbench.json5', 'utf8'))
  const stoaStoryFor = (id: string) => {
    const story = stoaWorkbench().stories.find((entry) => entry.id === id)
    if (!story) throw new Error(`Unknown Stoa story: ${id}`)
    return story
  }
  eleventyConfig.addShortcode('stoaStory', (id: string, caption: string) => {
    const story = stoaStoryFor(id)
    return `<figure class="stoa-story"><iframe class="stoa-story__frame" src="/stoa/workbench/story.html#${id}" title="${escapeHtml(`${story.title}, live`)}" loading="lazy" data-stoa-story></iframe><figcaption>${escapeHtml(caption)} <a href="/stoa/workbench/index.html#${id}">Edit its inputs in the workbench</a></figcaption></figure>`
  })
  eleventyConfig.addShortcode('stoaThemes', (id: string) => {
    const story = stoaStoryFor(id)
    const frames = stoaWorkbench()
      .themes.map(
        (theme) =>
          `<figure class="stoa-story"><iframe class="stoa-story__frame" src="/stoa/workbench/story.html?preview-theme=${theme.id}#${id}" title="${escapeHtml(`${story.title} in ${theme.name}`)}" loading="lazy" data-stoa-story></iframe><figcaption><strong>${escapeHtml(theme.name)}</strong>: ${escapeHtml(theme.description)}</figcaption></figure>`
      )
      .join('')
    return `<div class="stoa-themes">${frames}</div>`
  })

  // Passthrough copies bypass transforms. Guard viewer URLs too if they ever enter the template pipeline.
  const isPage = (path: string | undefined): path is string =>
    !!path?.endsWith('.html') && !relative(outputRoot, resolve(path)).split(sep).join('/').startsWith('diagrams/')

  // ── Transform: give prose headings a stable id ───────────────────────────
  // Long reference pages need in-page anchors to be navigable at all: the
  // vendored command inventory runs to eighty-four entries, and a link to one
  // section of it is only useful if the section has an address. markdown-it
  // emits bare <h2>/<h3>, so the ids are derived here rather than by adding a
  // plugin dependency for one rule.
  //
  // The slug is the heading's visible text, so an author writing "## Coverage
  // by runtime" can link to "#coverage-by-runtime" without declaring anything.
  // A repeated heading gets a numeric suffix so every id stays unique.
  const headingSlug = (html: string): string =>
    html
      .replace(/<[^>]+>/g, '')
      .replace(/&[a-z]+;|&#\d+;/gi, ' ')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  eleventyConfig.addTransform('heading-anchors', (content: string, outputPath: string | undefined) => {
    if (!isPage(outputPath)) return content
    const used = new Map<string, number>()
    return content.replace(/<(h2|h3|h4)>([\s\S]*?)<\/\1>/gi, (match, tag: string, inner: string) => {
      const base = headingSlug(inner)
      if (base === '') return match
      const seen = used.get(base) ?? 0
      used.set(base, seen + 1)
      const id = seen === 0 ? base : `${base}-${seen + 1}`
      return `<${tag} id="${id}">${inner}</${tag}>`
    })
  })

  // ── Transform: inject external-link icons ────────────────────────────────
  // Marks any prose <a href="https://..."> link with an external-link glyph.
  // The SVG is inlined rather than rendered by an icon runtime: the marker is
  // decorative, and a client-side library to draw it would be a script and a
  // dependency the rest of the site does not need.
  // Sized in em so it tracks the surrounding type; styled by .prose-ext-icon.
  // Skips links already inside named component classes (add your own classes
  // to the exclusion pattern below to protect icon-managed components).
  const externalLinkIcon =
    '<svg class="prose-ext-icon" width="0.85em" height="0.85em" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
    ' stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/>' +
    '<path d="M15 3h6v6"/><path d="M11 13 21 3"/></svg>'

  eleventyConfig.addTransform('external-link-icons', (content: string, outputPath: string | undefined) => {
    if (!isPage(outputPath)) return content
    return content.replace(
      /<a\s+([^>]*href="https?:\/\/[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi,
      (match, attrs: string, inner: string) => {
        // Add class names here to prevent icon injection inside specific components:
        if (/class="[^"]*(?:home-nav-card|tool-card)/.test(attrs)) return match
        if (/class="prose-ext-icon"/.test(inner)) return match
        return `<a ${attrs}>${inner}${externalLinkIcon}</a>`
      }
    )
  })

  // ── Transform: rewrite absolute links to relative ────────────────────────
  // Ensures href/src/srcset attributes pointing at absolute internal paths are
  // rewritten to relative paths, making dist/ portable without a web server.
  eleventyConfig.addTransform('explicit-index-links', (content: string, outputPath: string | undefined) => {
    if (!isPage(outputPath)) return content
    return (
      content
        .replace(/(\s(?:href|src)=)(["'])([^"']+)(\2)/gi, (_match, prefix: string, quote: string, url: string) => {
          if (/^(?:https?:|mailto:|tel:|javascript:|data:|#)/i.test(url)) return `${prefix}${quote}${url}${quote}`
          return `${prefix}${quote}${toRelativeOutputUrl(url, outputPath)}${quote}`
        })
        // A srcset is a list of candidates, each a URL and an optional descriptor, so each URL is rewritten
        // on its own; a <picture>'s responsive images would otherwise stay absolute and fail from a file.
        .replace(/(\ssrcset=)(["'])([^"']+)(\2)/gi, (_match, prefix: string, quote: string, list: string) => {
          const candidates = list.split(',').map((candidate) => {
            const [url = '', ...descriptor] = candidate.trim().split(/\s+/)
            return [toRelativeOutputUrl(url, outputPath), ...descriptor].join(' ')
          })
          return `${prefix}${quote}${candidates.join(', ')}${quote}`
        })
    )
  })

  // ── Tailwind CSS ─────────────────────────────────────────────────────────────
  // In build mode, compile Tailwind as part of the Eleventy lifecycle so the
  // build script only needs to invoke Eleventy once.
  // In serve/watch mode the Tailwind --watch process runs in parallel (see
  // package.json dev script); addWatchTarget ensures the dev server reloads
  // the browser whenever Tailwind writes a new dist/assets/css/main.css.
  eleventyConfig.on('eleventy.before', ({ runMode }: { runMode: string }) => {
    if (runMode !== 'serve' && runMode !== 'watch') {
      // bunx, not npx: Cloudflare Workers Builds installs with Bun, so npm cannot
      // resolve the Tailwind executable there.
      execSync('bunx tailwindcss -i src/assets/css/main.css -o dist/assets/css/main.css --minify', { stdio: 'inherit' })
    }
  })
  // Watch the compiled CSS so the dev server reloads the browser whenever
  // the Tailwind --watch process writes a new dist/assets/css/main.css.
  eleventyConfig.addWatchTarget('dist/assets/css/main.css')
  // The simulator is a standalone Nunjucks page with inline interaction code.
  // Watch it explicitly so a source edit rebuilds the served page before reload.
  eleventyConfig.addWatchTarget('src/simulator')

  // eleventyConfig.addPassthroughCopy('src/assets');
  // Note: image assets embedded as base64 data URIs via _data files (mount restrictions
  // prevent passthrough copy to dist). See src/_data/logoDataUri.ts.

  // ── Data extension: TypeScript ───────────────────────────────────────────
  // Allows .ts files in src/_data/ to be used as global data files.
  // With --import tsx/esm, dynamic import() loads .ts files directly.
  // Mirrors Eleventy's built-in JS handling: calls the export if it's a
  // function (sync or async), otherwise uses the value directly.
  eleventyConfig.addDataExtension('ts', {
    read: false,
    parser: async (filePath: string) => {
      const mod = (await import(filePath)) as { default: unknown }
      const data = mod.default
      return typeof data === 'function' ? await (data as () => unknown)() : data
    }
  })

  // ── Data extension: JSON5 ────────────────────────────────────────────────
  // Allows .json5 files in src/_data/ to be used as global data files.
  // Uses read:false to receive the file path rather than contents, which
  // allows selective exclusion of sub-paths that are aggregated elsewhere
  // (see the comment below - add any such paths here).
  eleventyConfig.addDataExtension('json5', {
    read: false,
    parser: (filePath: string) => {
      // Exclude paths aggregated by a parent data file to prevent double-loading.
      // Example: if (filePath.includes(`${sep}items${sep}records${sep}`)) return {};
      return JSON5.parse(readFileSync(filePath, 'utf-8')) as unknown
    }
  })

  // ── Filters ──────────────────────────────────────────────────────────────

  // JSON dump - useful for debugging data in templates: {{ myData | jsonDump }}
  eleventyConfig.addFilter('jsonDump', (val: unknown) => JSON.stringify(val))

  // unique - deduplicate an array: {{ tags | unique }}
  eleventyConfig.addFilter('unique', (arr: unknown) => {
    if (!Array.isArray(arr)) return arr
    return [...new Set(arr)]
  })

  // groupBy - group an array of objects by a key:
  // {% set grouped = items | groupBy("category") %}
  // {% for group in grouped %}{{ group.key }}: {{ group.values | length }}{% endfor %}
  eleventyConfig.addFilter('groupBy', (arr: unknown, key: string) => {
    if (!Array.isArray(arr)) return []
    const map = new Map<string, unknown[]>()
    for (const item of arr) {
      const k = String((item as Record<string, unknown>)[key] ?? '')
      if (!map.has(k)) map.set(k, [])
      map.get(k)?.push(item)
    }
    return [...map.entries()].map(([k, values]) => ({ key: k, values }))
  })

  // ── Collections ──────────────────────────────────────────────────────────
  // Add collections here as new sections are built out.
  // Standard pattern: tag pages with e.g. `tags: blog` (via front matter or
  // a directory data file) and access them as `collections.blog` in templates.

  // docsPages - every page belonging to a Docs section, in reading order.
  //
  // The binding comes from the directory data file beside the pages
  // (`src/docs/ki/ki.json5`), never from the page itself, so a page added later
  // joins its section because of where it lives rather than because someone
  // remembered a frontmatter line. This is the same rule the guides collection
  // used, generalised from `project` to `section` when guides moved out from
  // under the projects they describe (KI-WEBSITE-SITE-037).
  //
  // `order` is the reading order a section intends; anything without one sorts
  // after those that have one, then by title (KI-WEBSITE-SITE-025).
  eleventyConfig.addCollection('docsPages', (collectionApi: { getAll: () => DocsPage[] }) =>
    collectionApi
      .getAll()
      .filter((item) => typeof item.data.section === 'string')
      .sort((a, b) => {
        const rank = (a.data.order ?? 99) - (b.data.order ?? 99)
        return rank !== 0 ? rank : String(a.data.title).localeCompare(String(b.data.title))
      })
  )

  // ── Project-specific shortcodes ──────────────────────────────────────────
  // Add domain-specific shortcodes here. Example pattern:
  //
  // const myTermData = JSON5.parse(readFileSync('src/_data/myTerms.json5', 'utf-8'))
  //   as Array<{ id: string; name: string; description: string }>;
  // const myTermMap = new Map(myTermData.map(t => [t.name.toLowerCase(), t]));
  //
  // eleventyConfig.addShortcode('term', (name: string) => {
  //   const entry = myTermMap.get(name.toLowerCase());
  //   if (!entry) return name;
  //   return `<abbr title="${entry.description}" class="term">${entry.name}</abbr>`;
  // });

  // ── Return the config ──────────────────────────────────────────────────────────────

  return {
    dir: {
      input: 'src',
      output: 'dist',
      includes: '_includes',
      data: '_data'
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    templateFormats: ['njk', 'md', 'html']
  }
}
