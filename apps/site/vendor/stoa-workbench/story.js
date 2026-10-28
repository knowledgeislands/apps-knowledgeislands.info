// One story on a page of its own, for a page about a unit to show it live in a frame: story.html#header.
// It draws the story's sample inputs in the stage (stage.js), under a bar with the stage's own theme menu and
// mode switch and a link to the same story in the workbench, where its inputs can be edited.
//
// The framing page may pass the stage's defaults, `?theme=meadow&mode=dark`, as a site sets its own: a choice the
// reader made in a stage still wins. `?preview-theme=` and `?preview-mode=` show that look whatever was chosen,
// and store nothing (the engine's preview overrides); the bar then offers only the way into the workbench.

import { renderModeSwitch, renderThemeEngineMenu } from './stoa/src/theme-engine/render.js'
import { stories, workbenchTheme } from './stories.js'

const bar = /** @type {HTMLElement} */ (document.querySelector('[data-wb-solo-bar]'))
const stage = /** @type {any} */ (window).wbStage

function show() {
  const id = decodeURIComponent(location.hash.slice(1))
  const story = stories.find((s) => s.id === id)
  if (!story) {
    bar.replaceChildren()
    stage.render(`<p>No story is called “${id.replace(/[<>&"]/g, '')}”.</p>`, workbenchTheme)
    return
  }
  const theme = withDefaults(structuredClone(workbenchTheme), new URLSearchParams(location.search))
  const inputs = story.id === 'theme-engine' ? theme : story.inputs
  stage.render(story.render(inputs, { theme }), theme)
  const previewing = /[?&]preview-(theme|mode|phase)=/.test(location.search)
  const controls =
    story.id === 'theme-engine' || previewing
      ? ''
      : `${renderThemeEngineMenu(theme, { heading: 'Stage theme' })}${renderModeSwitch(theme, { icons: true, panel: false })}`
  bar.innerHTML = `${controls}<a class="wb-solo__open" href="index.html#${story.id}" target="_top">Open in the workbench</a>`
  document.title = `${story.title} · Stoa`
}

/** The page's defaults from the address, when they name a theme or mode the stage offers.
 * @param {any} theme @param {URLSearchParams} params */
function withDefaults(theme, params) {
  const themeId = params.get('theme')
  if (themeId && theme.system.themes.some((/** @type {{id: string}} */ t) => t.id === themeId))
    theme.offer = { ...theme.offer, default: themeId }
  const mode = params.get('mode')
  if (mode && theme.system.mode.offer.includes(mode)) theme.system.mode.default = mode
  return theme
}

addEventListener('hashchange', show)
show()
