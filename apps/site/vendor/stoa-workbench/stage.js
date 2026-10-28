// The stage frame. The workbench draws a story here, in a page of its own: the unit's theme engine, its stored
// choices (all under the `test-` prefix) and its media queries live in this frame and never reach the workbench.
// The workbench drives it through `window.wbStage`.

import { drawIcons } from './icons.js'
import { defineWbSunDial } from './proposals/sun-dial.js'
import { defineStoaCalendar, StoaCalendar } from './stoa/src/calendar/element.js'
import { defineStoaCommandBar } from './stoa/src/command-bar/element.js'
import { defineStoaDiagramViewer } from './stoa/src/diagram-viewer/element.js'
import { defineStoaFilterBar } from './stoa/src/filter-bar/element.js'
import { defineStoaHeader } from './stoa/src/header/element.js'
import { defineStoaPageFoot } from './stoa/src/page-foot/element.js'
import { defineStoaShortcutsHelp } from './stoa/src/shortcuts/element.js'
import { validateThemeConfig } from './stoa/src/theme-engine/core.js'
import { defineStoaAxisSwitch, defineStoaModeSwitch } from './stoa/src/theme-engine/element.js'
import { stoaTheme } from './stoa/src/theme-engine/engine.js'
import { defineStoaThemeMenu } from './stoa/src/theme-menu/element.js'
import { defineStoaTodayBoard } from './stoa/src/today-board/element.js'

/** Every event a unit sends; the stage hands each to the workbench's log. */
const EVENTS = [
  'stoa-theme-change',
  'stoa-theme-applied',
  'stoa-solar-phase',
  'stoa-solar-moment',
  'stoa-solar-preview',
  'stoa-calendar-select',
  'stoa-command-bar-open',
  'stoa-shortcuts-open',
  'stoa-filter-change'
]

const stage = /** @type {HTMLElement} */ (document.querySelector('[data-wb-stage]'))
let current = ''

StoaCalendar.icons = drawIcons
for (const define of [
  defineStoaModeSwitch,
  defineStoaAxisSwitch,
  defineStoaThemeMenu,
  defineStoaHeader,
  defineStoaPageFoot,
  defineStoaCommandBar,
  defineStoaShortcutsHelp,
  defineStoaFilterBar,
  defineStoaCalendar,
  defineStoaTodayBoard,
  defineStoaDiagramViewer,
  defineWbSunDial
])
  define()

for (const name of EVENTS)
  document.addEventListener(name, (event) =>
    parent.postMessage(
      { wb: 'event', name, detail: JSON.parse(JSON.stringify(/** @type {CustomEvent} */ (event).detail ?? null)) },
      location.origin
    )
  )

// The workbench sizes the frame to the story, measured from the story itself: the page's own height is at least
// the frame's, so measuring it would only ever grow the frame.
new ResizeObserver(() =>
  parent.postMessage(
    { wb: 'height', height: Math.ceil(stage.getBoundingClientRect().bottom + scrollY + 16) },
    location.origin
  )
).observe(stage)

window.wbStage = {
  /** Draw a story: restart the theme engine when its config changes, then the story's markup. */
  render(/** @type {string} */ html, /** @type {any} */ theme) {
    const next = JSON.stringify(theme)
    if (next !== current) {
      validateThemeConfig(theme)
      if (stoaTheme.active) stoaTheme.destroy()
      stoaTheme.init(theme)
      current = next
    }
    stage.innerHTML = html
    drawIcons(stage)
  },
  /** The theme engine's state in this frame. */
  theme: () => stoaTheme.state,
  /** The page attributes and each unit's attributes, for the State panel. */
  snapshot() {
    const html = Object.fromEntries([...document.documentElement.attributes].map((a) => [a.name, a.value]))
    const elements = [...stage.querySelectorAll('*')]
      .filter((el) => el.localName.startsWith('stoa-'))
      .map((el) => ({ element: el.localName, ...Object.fromEntries([...el.attributes].map((a) => [a.name, a.value])) }))
    return { html, elements }
  }
}
parent.postMessage({ wb: 'ready' }, location.origin)
