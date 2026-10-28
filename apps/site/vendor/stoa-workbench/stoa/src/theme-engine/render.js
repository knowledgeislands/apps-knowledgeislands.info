// @ts-check
import { esc } from '../internal/html.js'
import { renderThemeMenu } from '../theme-menu/render.js'
import {
  applyTheme,
  defaultModePreference,
  modePreferences,
  previewValues,
  resolveTheme,
  solarEnabled,
  validateThemeConfig
} from './core.js'
import { SOLAR_PHASES, solarState } from './solar.js'

/** JSON safe inside an HTML script, even when a site's labels contain markup.
 * @param {unknown} value
 */
const json = (value) =>
  JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029')

/** Build-only generation; hash covers exactly script, without the surrounding tags.
 * Place html first in head, before styles. CSP uses `'${hash}'`.
 * @param {import('./core.js').ThemeConfig} config
 */
export async function renderThemePrepaint(config) {
  validateThemeConfig(config)
  const data = json(config)
  const script = `(()=>{const c=${data};const pv=(${previewValues.toString()})(typeof location<'u'?location.search:'',c.system);const old={};for(const[n,o]of Object.entries(c.system.previousKeys||{}))old[c.system.keyPrefix+n]=o;const read=k=>{if(pv)return k in pv?pv[k]:null;try{const v=localStorage.getItem(k);return v===null&&old[k]?localStorage.getItem(old[k]):v}catch{return null}};const solar=(${solarState.toString()});const sky=(c.system.solar&&c.system.solar.sky)||'simulated';const sun=(held,place)=>solar(new Date(),{sky,held,place});const state=(${resolveTheme.toString()})(c,read,matchMedia('(prefers-color-scheme: dark)').matches,{},sun);(${applyTheme.toString()})(c,state,document.documentElement)})();`
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(script))
  const hash = `sha256-${btoa(String.fromCharCode(...new Uint8Array(digest)))}`
  return {
    script,
    hash,
    html: `<script>${script}</script><script type="application/json" id="stoa-theme-config">${data}</script>`
  }
}

/** Pure engine-backed menu renderer, with only the stoa's offered themes.
 * @param {import('./core.js').ThemeConfig} config
 * @param {Omit<import('../theme-menu/render.js').ThemeMenuConfig, 'themes' | 'attribute' | 'defaultTheme' | 'storageKey'> & {reset?: boolean}} [menu]
 *   `reset: false` leaves out the Reset to default button.
 */
export function renderThemeEngineMenu(config, menu = {}) {
  validateThemeConfig(config)
  const { system, offer = {} } = config
  const ids = offer.themes ?? system.themes.map((t) => t.id)
  // The foot ends with Reset, back to the site's defaults, unless the site turns it off with `reset: false`.
  const reset =
    menu.reset === false
      ? ''
      : '<button type="button" class="theme-menu__reset" data-theme-reset>Reset to default</button>'
  return renderThemeMenu({
    ...menu,
    foot: `${menu.foot ?? ''}${reset}`,
    single: ids.length === 1,
    themes: ids.map(
      (id) => /** @type {import('../theme-menu/render.js').ThemeOption} */ (system.themes.find((t) => t.id === id))
    ),
    attribute: system.attribute,
    defaultTheme: offer.default ?? ids[0]
  })
}

/** @param {string} tag @param {string} label @param {{id: string, label: string, title?: string, icon?: string}[]} values @param {string} fallback @param {string} attribute @param {string} [extra] @param {string} [after] */
function renderSwitch(tag, label, values, fallback, attribute, extra = '', after = '') {
  const rules = values
    .map((v) => `:root[${attribute}="${v.id}"] ${tag}${extra ? `[axis="${extra}"]` : ''} [data-theme-choice="${v.id}"]`)
    .join(',')
  const fallbackRule = `:root:not([${attribute}]) ${tag}${extra ? `[axis="${extra}"]` : ''} [data-theme-choice="${fallback}"]`
  return `<${tag}${extra ? ` axis="${esc(extra)}"` : ''} hidden><style>@layer stoa-components { ${rules},${fallbackRule} { background: var(--stoa-accent); color: var(--stoa-accent-foreground); } }</style><div class="mode-group${values.some((v) => v.icon) ? ' mode-group--icons' : ''}" role="group" aria-label="${esc(label)}">${values.map((v) => `<button type="button" data-theme-choice="${esc(v.id)}" aria-label="${esc(v.label)}" title="${esc(v.title ?? v.label)}" aria-pressed="${v.id === fallback}">${v.icon ?? esc(v.label)}</button>`).join('')}</div>${after}</${tag}>`
}

const MODE_LABELS = /** @type {const} */ ({
  system: { label: 'System', title: 'Follow your computer’s light or dark setting' },
  light: { label: 'Light', title: 'Always light' },
  dark: { label: 'Dark', title: 'Always dark' },
  solar: { label: 'Solar', title: 'Follow the sun where you are: light from sunrise, dark from sunset' }
})

const icon = (/** @type {string} */ body) =>
  `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`

/** Line icons for the mode choices, for a compact switch. */
export const MODE_ICONS = /** @type {const} */ ({
  system: icon('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
  light: icon(
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
  ),
  dark: icon('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
  solar: icon('<path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 6v3M5.6 10.6l1.5 1.5M18.4 10.6l-1.5 1.5M3 22h18"/>')
})

/** Where each scale label sits on the dial, by phase. */
const DIAL_SCALE = /** @type {const} */ ([
  ['solar-midnight', 'Midnight'],
  ['sunrise', 'Sunrise'],
  ['solar-noon', 'Noon'],
  ['sunset', 'Sunset']
])

/**
 * The Solar dial: a slider across the day's phases, in order from solar midnight, to hold the look of the one you
 * like, with Follow the sun to release it; today's sunrise and sunset and where they are for; and, with
 * `solar.location: 'ask'`, Use my location. Without `solar.hold` it shows only the times. The element fills it in;
 * without script it stays hidden. Place it where it suits: in the Mode Switch's panel, or a menu's foot.
 * @param {import('./core.js').ThemeConfig} config
 */
export function renderSolarDial(config) {
  validateThemeConfig(config)
  if (!solarEnabled(config.system)) return ''
  const solar = config.system.solar ?? {}
  const last = SOLAR_PHASES.length
  const at = (/** @type {number} */ i) => `${((i / last) * 100).toFixed(2)}%`
  const dial =
    solar.hold === false
      ? ''
      : `<div class="solar-dial__head"><p class="solar-dial__now"><span data-solar-label>Solar</span><span class="solar-dial__held" data-solar-held hidden>Held</span></p><label class="solar-dial__follow"><span>Follow the sun</span><input type="checkbox" role="switch" data-solar-follow checked></label></div><div class="solar-dial__track"><input type="range" class="solar-dial__range" min="0" max="${last}" step="any" value="0" aria-label="Time of day to hold" data-solar-range><div class="solar-dial__ticks" aria-hidden="true">${SOLAR_PHASES.map((p, i) => `<span class="solar-dial__tick${p.kind === 'moment' ? ' solar-dial__tick--moment' : ''}" style="left:${at(i)}"></span>`).join('')}<span class="solar-dial__tick solar-dial__tick--moment" style="left:${at(last)}"></span></div><div class="solar-dial__scale" aria-hidden="true">${DIAL_SCALE.map(([code, text]) => `<span style="left:${at(SOLAR_PHASES.findIndex((p) => p.code === code))}">${text}</span>`).join('')}<span style="left:${at(last)}">Midnight</span></div></div>`
  const locate =
    solar.location === 'ask'
      ? '<button type="button" class="solar-dial__locate" data-solar-locate>Use my location</button>'
      : ''
  return `<stoa-solar-dial hidden><div class="solar-dial">${dial}<p class="solar-dial__times" data-solar-times></p>${locate}</div></stoa-solar-dial>`
}

/** The mode selection: the site's offered choices of System, Light, Dark and Solar. With `icons` each choice is a
 * line icon, named for assistive technology and in its tooltip. Unless `panel` is false, Solar brings its dial,
 * shown while Solar is selected; a site that places the dial elsewhere (`renderSolarDial`) passes `panel: false`.
 * @param {import('./core.js').ThemeConfig} config
 * @param {{icons?: boolean, panel?: boolean}} [options]
 */
export function renderModeSwitch(config, options = {}) {
  validateThemeConfig(config)
  return renderSwitch(
    'stoa-mode-switch',
    'Colour mode',
    modePreferences(config.system).map((id) => ({
      id,
      ...MODE_LABELS[id],
      ...(options.icons ? { icon: MODE_ICONS[id] } : {})
    })),
    defaultModePreference(config.system),
    'data-mode-preference',
    '',
    solarEnabled(config.system) && options.panel !== false
      ? `<div class="mode-solar" data-mode-solar>${renderSolarDial(config)}</div>`
      : ''
  )
}

/** @param {import('./core.js').ThemeConfig} config @param {string} id */
export function renderAxisSwitch(config, id) {
  validateThemeConfig(config)
  const axis = config.system.axes?.find((a) => a.id === id)
  if (!axis) throw new Error(`Unknown axis ${id}`)
  if (config.offer?.axes?.[id]?.show === false) return ''
  return renderSwitch(
    'stoa-axis-switch',
    axis.label,
    axis.values,
    config.offer?.axes?.[id]?.default ?? axis.default,
    axis.attribute,
    id
  )
}
