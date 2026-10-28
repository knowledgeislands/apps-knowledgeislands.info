// The workbench stories: one per unit. A story names its unit, gives sample
// inputs as plain JSON (what the workbench lets you edit) and renders them
// through the unit's own pure render functions, as a site's build would. The
// elements are defined once, in workbench.js, as a site's script would.
//
// A story: { id, group, title, note, inputs, render(inputs, ctx), state?(stage) }
// - render returns trusted HTML for the stage; ctx.theme is the stage's theme config.
// - state(stage) returns what the State panel shows besides the stage page's own attributes; `stage` is the
//   stage frame's window, so a story reads the unit's state there, never in the workbench itself.

import { config } from './config.js'
import { calendarSet, filterFields, filterRows, sources, themes } from './sample.js'
import { renderContext } from './stoa/src/calendar/eleventy.js'
import { renderCalendarView } from './stoa/src/calendar/render.js'
import { renderCommandBar, renderCommandBarTrigger } from './stoa/src/command-bar/render.js'
import { renderDiagramViewer } from './stoa/src/diagram-viewer/render.js'
import { renderFilterBar } from './stoa/src/filter-bar/render.js'
import { renderHeader } from './stoa/src/header/render.js'
import { renderIssuesList } from './stoa/src/issues-list/render.js'
import { renderPageFoot, renderSiteFooter } from './stoa/src/page-foot/render.js'
import { renderShortcutsHelp } from './stoa/src/shortcuts/render.js'
import {
  renderAxisSwitch,
  renderModeSwitch,
  renderSolarDial,
  renderThemeEngineMenu
} from './stoa/src/theme-engine/render.js'
import { renderTimeline } from './stoa/src/timeline/render.js'
import { renderTodayBoard } from './stoa/src/today-board/render.js'
import diagrams from './stoa/test/fixtures/diagrams.js'
import issues from './stoa/test/fixtures/issues.js'

const resolveSource = (/** @type {{source: string}} */ ref) => {
  const found = sources[/** @type {keyof typeof sources} */ (ref.source)]
  return found && { title: found.title, asOf: found.asOf, url: `#${ref.source.toLowerCase()}` }
}

/** The theme config the stage starts with; the Theme Engine story edits it. Its keys carry the stage's prefix,
 * `test-` (config.js), so nothing a story does is stored where the workbench or a real site would read it. */
export const workbenchTheme = {
  system: {
    id: 'workbench',
    themes,
    keyPrefix: config.stagePrefix,
    mode: { offer: ['system', 'light', 'dark', 'solar'], default: 'system' },
    solar: { sky: 'simulated', hold: true, location: 'ask' },
    axes: [
      {
        id: 'density',
        attribute: 'data-density',
        label: 'Density',
        default: 'comfortable',
        values: [
          { id: 'comfortable', label: 'Comfortable' },
          { id: 'compact', label: 'Compact' }
        ]
      }
    ],
    themeColor: true
  }
}

export const stories = [
  {
    id: 'theme-engine',
    group: 'Theme',
    title: 'Theme Engine',
    note: 'Edit the config to change the offered modes, themes, Solar options and axes; the engine restarts with it. The mode switch in the top bar is the same engine.',
    inputs: workbenchTheme,
    render: (inputs) =>
      `<div class="wb-row">${renderModeSwitch(inputs, { icons: true, panel: false })} ${renderThemeEngineMenu(inputs, { heading: 'Themes', note: 'Swatches follow the mode.' })} ${inputs.system.axes?.length ? renderAxisSwitch(inputs, inputs.system.axes[0].id) : ''}</div><h2>Labelled, with the Solar panel</h2>${renderModeSwitch(inputs)}<h2>Solar dial on its own</h2>${renderSolarDial(inputs)}`,
    state: (stage) => stage.wbStage?.theme()
  },
  {
    id: 'header',
    group: 'Frame',
    title: 'Header',
    note: 'Narrow the stage to Phone or Tablet to see the burger and compact search; collapseAt is the header’s own width. Brand, navigation and slots are site-owned. identity is off: the workbench has no Access to name a signed-in person.',
    inputs: {
      brand: {
        href: '#',
        label: 'Workbench home',
        tag: 'Workbench',
        logo: {
          markup:
            '<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="6" fill="currentColor"/><path d="M8 24V8h16v16M8 16h16M16 8v16" fill="none" stroke="var(--stoa-brand-foreground)" stroke-width="2"/></svg>'
        }
      },
      nav: [
        { name: 'Home', href: '#' },
        {
          groupId: 'units',
          groupName: 'Units',
          items: [
            { name: 'Header', href: '#header' },
            { name: 'Calendar', href: '#calendar' }
          ]
        },
        { separator: true },
        { name: 'Themes', href: '#theme-engine' }
      ],
      currentUrl: '#header',
      collapseAt: 700,
      identity: false
    },
    render: (inputs, { theme }) =>
      renderHeader(inputs, {
        search: {
          compact: renderCommandBarTrigger({ modifier: 'command-bar-trigger--compact' }),
          full: renderCommandBarTrigger()
        },
        prefs: renderModeSwitch(theme)
      })
  },
  {
    id: 'page-foot',
    group: 'Frame',
    title: 'Page Foot and site footer',
    note: 'Notes are trusted HTML; source titles and update text are escaped. The source register belongs to the site.',
    inputs: {
      foot: {
        notes: '<p>This example has notes, sources and a pending update.</p>',
        sources: [{ source: 'PLAN', at: 'Section 2' }],
        pendingUpdates: [{ source: 'MIN', at: 'Decision 4', text: 'Confirmation of the next review date is pending.' }],
        canonicalNote: 'Consult the source register for canonical information.'
      },
      footer: {
        name: 'Example stoa',
        line: 'A site-owned closing line.',
        links: [{ label: 'Help', url: '#' }],
        build: { updated: '22 October 2026', commit: 'sample' }
      }
    },
    render: (inputs) => renderPageFoot({ ...inputs.foot, resolveSource }) + renderSiteFooter(inputs.footer)
  },
  {
    id: 'command-bar',
    group: 'Find',
    title: 'Command Bar and shortcuts',
    note: 'Open with the button, Ctrl+K or /. Press ? for the shortcuts. The index is the sample one the workbench serves.',
    inputs: {
      placeholder: 'Search topics, items and pages',
      emptyKinds: ['page', 'topic'],
      hiddenCodeKinds: ['topic'],
      helpUrl: '#'
    },
    // The workbench may be served from a folder (a published copy is), so the sample index and its results
    // resolve against the workbench's own folder.
    render: (inputs) =>
      `${renderCommandBarTrigger()}${renderCommandBar({ base: new URL('./', import.meta.url).pathname, ...inputs })}<stoa-shortcuts-help>${renderShortcutsHelp([], { helpUrl: '#', helpLabel: 'About the workbench' })}</stoa-shortcuts-help>`
  },
  {
    id: 'filter-bar',
    group: 'Find',
    title: 'Filter Bar',
    note: 'Type state:open and a space, or pick a quick filter. The query is kept in the address.',
    inputs: {
      bar: {
        id: 'items',
        valueSeparator: '|',
        fields: filterFields,
        placeholder: 'Filter items: state:open, topic:A or any word',
        examples: [
          { query: 'state:open', text: 'Open items' },
          { query: 'owner:ada', text: 'Owned by Ada' }
        ]
      },
      rows: filterRows
    },
    render: ({ bar, rows }) =>
      `<section data-filter-scope>${renderFilterBar(bar)}<p>Shown: <strong data-filter-shown>${rows.length}</strong></p><table class="wb-table"><thead><tr><th>Code</th><th>Item</th><th>State</th><th>Topic</th><th>Owner</th></tr></thead><tbody>${rows
        .map(
          (/** @type {any} */ r) =>
            `<tr data-filter-item data-f-state="${r.state}" data-f-topic="${r.topic}" data-f-owner="${String(r.owner).toLowerCase()}"><td>${r.code}</td><td>${r.title}</td><td>${r.state}</td><td>${r.topic}</td><td>${r.owner}</td></tr>`
        )
        .join('')}</tbody></table><p data-filter-empty hidden>No row matches the filter.</p></section>`,
    state: (stage) => ({ address: stage.location.search })
  },
  {
    id: 'calendar',
    group: 'Dates',
    title: 'Calendar',
    note: 'List, Months and Runway views of the sample set; change "today" to move the view.',
    inputs: { today: '2026-10-22', set: calendarSet },
    render: ({ today, set }) =>
      renderCalendarView(
        renderContext({
          set,
          siteUrl: 'https://workbench.example',
          producer: 'Workbench',
          resolveSource,
          now: new Date(`${today}T12:00:00Z`)
        })
      ).replace('<stoa-calendar', `<stoa-calendar today="${today}"`)
  },
  {
    id: 'timeline',
    group: 'Dates',
    title: 'Timeline',
    note: 'Every dated entry grouped by month, with past and next marked as of "today".',
    inputs: { today: '2026-11-01', set: calendarSet },
    render: ({ today, set }) => renderTimeline(set, { today })
  },
  {
    id: 'today-board',
    group: 'Dates',
    title: 'Today board',
    note: 'Each calendar’s entries for one day.',
    inputs: { today: '2026-10-22', set: calendarSet },
    render: ({ today, set }) =>
      renderTodayBoard(set, { today }).replace('<stoa-today-board', `<stoa-today-board today="${today}"`)
  },
  {
    id: 'issues-list',
    group: 'Content',
    title: 'Issues List',
    note: 'A static list grouped by status; no script. Set strict to false to render data that fails validation.',
    inputs: { data: issues.data, options: { areas: issues.areas, asOf: issues.asOf, strict: true, title: null } },
    render: ({ data, options }) => renderIssuesList(data, options)
  },
  {
    id: 'diagram-viewer',
    group: 'Content',
    title: 'Diagram Viewer',
    note: 'Click the diagram or Explore. Zoom, pan, Fit and Reset; Escape closes.',
    inputs: diagrams.svg,
    render: (inputs) => renderDiagramViewer(inputs)
  },
  {
    id: 'sun-dial-proposal',
    group: 'Proposals',
    title: 'Circular Sun Dial and moonlight',
    note: 'A proposal, not shipped (proposals/sun-dial.md). Turn the dial round and round: midnight runs on into the next day and the moon moves on a day each turn. Moon turns through a lunation instead, new to full and back, and the night page takes the moon’s light. Letting go in Day holds the phase, as the straight dial does. The straight dial is below for comparison.',
    inputs: { compare: true },
    render: (inputs, { theme }) =>
      `<div class="wb-row" style="align-items:flex-start;gap:2rem"><wb-sun-dial></wb-sun-dial><div style="flex:1;min-width:16rem"><h2>The page under the dial</h2><p>Cards, text and the background follow the previewed moment. In the dark, they take the moon’s light.</p><div class="wb-moon-sample"><div><strong>Planning</strong><p>Next review on Thursday.</p></div><div><strong>Notes</strong><p>Three open questions.</p></div><div><strong>People</strong><p>Two joining this month.</p></div></div>${inputs.compare ? `<h2>Today’s straight dial</h2>${renderSolarDial(theme)}` : ''}</div></div>`,
    state: (stage) => ({
      engine: stage.wbStage?.theme(),
      moon: stage.document.documentElement.getAttribute('data-moon-phase'),
      illumination: stage.document.documentElement.style.getPropertyValue('--moon-illumination')
    })
  }
]
