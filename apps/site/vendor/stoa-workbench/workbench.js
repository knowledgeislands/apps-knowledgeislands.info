// The workbench: pick a unit, edit its inputs as JSON, and watch the events it sends and the state it leaves.
// Each story lives in stories.js. The unit runs in the stage frame (stage.html), a page of its own, so changing
// its theme or mode never changes the workbench; the workbench's own appearance has its own switch and keys.

import { config } from './config.js'
import { themes } from './sample.js'
import { validateThemeConfig } from './stoa/src/theme-engine/core.js'
import { defineStoaModeSwitch } from './stoa/src/theme-engine/element.js'
import { stoaTheme } from './stoa/src/theme-engine/engine.js'
import { renderModeSwitch, renderThemeEngineMenu } from './stoa/src/theme-engine/render.js'
import { defineStoaThemeMenu } from './stoa/src/theme-menu/element.js'
import { stories, workbenchTheme } from './stories.js'

const $ = (/** @type {string} */ name) => /** @type {HTMLElement} */ (document.querySelector(`[data-wb-${name}]`))
const frame = /** @type {HTMLIFrameElement} */ ($('frame'))
const inputsBox = /** @type {HTMLTextAreaElement} */ ($('inputs'))
let theme = structuredClone(workbenchTheme)
let story = stories[0]
let inputs = story.inputs
let ready = false

// The workbench's own appearance: the sample themes in System, Light or Dark, kept under its own prefix, so it
// can wear what the stage is showing without either changing the other.
const chrome = {
  system: {
    id: 'workbench',
    themes,
    keyPrefix: config.keyPrefix,
    mode: { offer: ['system', 'light', 'dark'], default: 'system' }
  }
}
stoaTheme.init(chrome)
defineStoaModeSwitch()
defineStoaThemeMenu()
$('mode').innerHTML =
  `${renderThemeEngineMenu(chrome, { heading: 'Workbench theme' })}${renderModeSwitch(chrome, { icons: true })}`

// The list of stories, grouped.
$('list').innerHTML = [...Map.groupBy(stories, (s) => s.group)]
  .map(
    ([group, items]) =>
      `<h2>${group}</h2>${items.map((s) => `<a href="#${s.id}" data-id="${s.id}">${s.title}</a>`).join('')}`
  )
  .join('')

const stageWindow = () => /** @type {any} */ (frame.contentWindow)

/** Draw the current story in the stage; show an error instead of a broken stage. */
function draw() {
  if (!ready) return
  try {
    if (story.id === 'theme-engine') {
      validateThemeConfig(inputs)
      theme = structuredClone(inputs)
    }
    stageWindow().wbStage.render(story.render(inputs, { theme }), theme)
    $('error').textContent = ''
  } catch (error) {
    $('error').textContent = String(error instanceof Error ? error.message : error)
  }
  showState()
}

function open(/** @type {string} */ id) {
  story = stories.find((s) => s.id === id) ?? stories[0]
  for (const a of $('list').querySelectorAll('a'))
    if (a.dataset.id === story.id) a.setAttribute('aria-current', 'page')
    else a.removeAttribute('aria-current')
  $('title').textContent = story.title
  $('note').textContent = story.note
  inputs = story.id === 'theme-engine' ? theme : story.inputs
  inputsBox.value = JSON.stringify(inputs, null, 2)
  $('events').replaceChildren()
  draw()
}

inputsBox.addEventListener('input', () => {
  try {
    inputs = JSON.parse(inputsBox.value)
    draw()
  } catch (error) {
    $('error').textContent = `Not valid JSON yet: ${error instanceof Error ? error.message : error}`
  }
})
$('reset').addEventListener('click', () => {
  inputs = story.id === 'theme-engine' ? structuredClone(workbenchTheme) : story.inputs
  inputsBox.value = JSON.stringify(inputs, null, 2)
  draw()
})
$('clear').addEventListener('click', () => $('events').replaceChildren())

// Messages from the stage: ready, its height, and every event a unit sends.
addEventListener('message', (event) => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow) return
  const data = event.data ?? {}
  if (data.wb === 'ready') markReady()
  else if (data.wb === 'height') frame.style.height = `${Math.max(240, data.height)}px`
  else if (data.wb === 'event') {
    const item = document.createElement('li')
    item.textContent = `${new Date().toLocaleTimeString()} ${data.name}${data.detail === null ? '' : ` ${JSON.stringify(data.detail)}`}`
    $('events').prepend(item)
    showState()
  }
})

/** Draw once the stage is ready; it says so by message, and its load event covers a message sent early. */
function markReady() {
  if (ready || !stageWindow()?.wbStage) return
  ready = true
  draw()
}

// The state: the story's own, then the stage page's attributes and each unit's.
function showState() {
  const w = stageWindow()
  if (!ready || !w?.wbStage) return
  $('state').textContent = JSON.stringify({ story: story.state?.(w), ...w.wbStage.snapshot() }, null, 2)
}
setInterval(showState, 2000)

// Stage widths: the frame takes the width, so the units' own breakpoints and container queries apply.
for (const button of document.querySelectorAll('[data-width]'))
  button.addEventListener('click', () => {
    for (const other of document.querySelectorAll('[data-width]'))
      other.setAttribute('aria-pressed', String(other === button))
    frame.style.width = button.getAttribute('data-width') ? `${button.getAttribute('data-width')}px` : '100%'
  })

addEventListener('hashchange', () => open(location.hash.slice(1)))
open(location.hash.slice(1))
// The stage may be ready before this script listens, so check on its load as well as on its message.
frame.addEventListener('load', markReady)
markReady()
