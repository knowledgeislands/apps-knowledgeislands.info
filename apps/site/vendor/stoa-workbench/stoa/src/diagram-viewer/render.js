// @ts-check
import { esc } from '../internal/html.js'
/**
 * @typedef {object} DiagramViewerConfig
 * @property {string} id Unique document id.
 * @property {string} label Accessible diagram name.
 * @property {{src: string, alt: string, width?: number, height?: number} | {svg: string}} image SVG is trusted build markup, with its own accessible name and unique ids.
 * @property {string} [caption] Plain text.
 * @property {string} [captionHtml] Trusted build-time HTML, mutually exclusive with caption. Sanitise external content first.
 */
/** Complete static figure and enhancement markup. Never pass untrusted SVG.
 * @param {DiagramViewerConfig} config
 */
export function renderDiagramViewer(config) {
  if (!/^[a-zA-Z][\w-]*$/.test(config.id)) throw new Error('Diagram Viewer requires a unique valid id')
  if (!config.label.trim()) throw new Error('Diagram Viewer requires a label')
  if (config.caption !== undefined && config.captionHtml !== undefined)
    throw new Error('Diagram Viewer accepts caption or captionHtml, not both')
  const caption = config.captionHtml ?? (config.caption !== undefined ? esc(config.caption) : '')
  let image
  if ('svg' in config.image) image = config.image.svg
  else {
    const { src, alt, width, height } = config.image
    if (
      !src ||
      [...src].some((char) => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127) ||
      /^(?!https?:)[a-z][a-z\d+.-]*:/i.test(src)
    ) {
      throw new Error('Diagram image URLs must be relative or HTTP(S)')
    }
    for (const size of [width, height]) {
      if (size !== undefined && (!Number.isFinite(size) || size <= 0))
        throw new Error('Diagram dimensions must be positive')
    }
    image = `<img src="${esc(src)}" alt="${esc(alt)}"${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}>`
  }
  /** @param {string} action @param {string} label */
  const button = (action, label) => `<button type="button" data-diagram-action="${action}">${label}</button>`
  return `<stoa-diagram-viewer><figure>
<div data-diagram-preview><div data-diagram-image>${image}</div></div>
${caption ? `<figcaption>${caption}</figcaption>` : ''}
<button type="button" data-diagram-open hidden aria-haspopup="dialog" aria-controls="${config.id}">Explore ${esc(config.label)}</button>
</figure><dialog id="${config.id}" aria-label="${esc(config.label)}" aria-describedby="${config.id}-instructions">
<div class="stoa-diagram__toolbar" role="group" aria-label="Diagram controls">
${button('in', 'Zoom in')}${button('out', 'Zoom out')}${button('fit', 'Fit')}${button('reset', 'Reset')}
${button('left', 'Pan left')}${button('right', 'Pan right')}${button('up', 'Pan up')}${button('down', 'Pan down')}${button('close', 'Close')}
<output data-diagram-status aria-live="polite" aria-atomic="true"></output></div>
<p id="${config.id}-instructions">Drag to pan. Use + and − to zoom, arrow keys to pan, Home to fit, 0 to reset, Escape to close.</p>
<div data-diagram-viewport tabindex="0" role="region" aria-label="Interactive diagram"><div data-diagram-canvas></div></div>
</dialog></stoa-diagram-viewer>`
}
