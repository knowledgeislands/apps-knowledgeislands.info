// @ts-check
// The Theme Menu's markup, as a pure function for a site's build: a menu
// button naming the setting and showing the current theme, and a panel of
// themes from the site's registry, each with its name, an optional line or
// two and its swatches for light and dark. The current theme shows in the
// trigger from the first paint, before any script runs: the build writes
// every theme there and a generated rule shows the one `<html>` names.
//
// The engine owns application when active; standalone menus retain their storage seam.

import { esc } from '../internal/html.js'

/**
 * @typedef {object} ThemeSwatch
 * @property {string} label  What the colour is, such as "Background".
 * @property {string} colour  A CSS colour.
 */

/**
 * One theme in the site's registry.
 * @typedef {object} ThemeOption
 * @property {string} id  The value the menu sets on `<html>`.
 * @property {string} name
 * @property {string} [description]  A short line beside the name, such as the palette's name.
 * @property {string} [detail]  A line beneath.
 * @property {string} [icon]  The theme's icon as trusted markup from the site's build.
 * @property {{ light?: ThemeSwatch[], dark?: ThemeSwatch[] }} [swatches]
 */

/**
 * @typedef {object} ThemeMenuConfig
 * @property {ThemeOption[]} themes  In the order the menu lists them.
 * @property {string} [id]  Names the panel; `theme-menu` by default.
 * @property {string} [label]  The trigger's accessible name; "Theme" by default.
 * @property {string} [heading]  The panel's heading; "Themes" by default.
 * @property {string} [defaultTheme]  The theme when `<html>` names none; the first by default.
 * @property {string} [attribute]  The attribute set on `<html>`; `data-theme` by default.
 * @property {string} [storageKey]  The localStorage key the choice is kept under; none by default.
 * @property {string} [note]  A line in the panel's foot.
 * @property {string} [foot]  Trusted markup for the foot, such as a site's own palette switch.
 * @property {boolean} [single]  The site offers one theme: the menu shows no theme list, only its foot.
 */

export const THEME_DEFAULTS = /** @type {const} */ ({
  id: 'theme-menu',
  label: 'Theme',
  heading: 'Themes',
  attribute: 'data-theme'
})

const CHEVRON =
  '<svg class="theme-menu__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const CHECK =
  '<svg class="theme-menu__check" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

/** An attribute name made safe for a selector. */
const attrName = (/** @type {string} */ name) => name.replace(/[^\w-]/g, '')

/** A value made safe inside a quoted selector. */
const cssString = (/** @type {string} */ value) => value.replace(/["\\]/g, '\\$&').replace(/[<>\n]/g, '')

/**
 * The rule that shows the current theme in the trigger.
 * @param {string[]} ids
 * @param {string} fallback
 * @param {string} attribute
 */
export function themeCurrentRule(ids, fallback, attribute) {
  const a = attrName(attribute)
  const item = (/** @type {string} */ id) => `.theme-menu__current-item[data-theme-current="${cssString(id)}"]`
  const selectors = ids.map((id) => `:root[${a}="${cssString(id)}"] ${item(id)}`)
  selectors.push(`:root:not([${a}]) ${item(fallback)}`)
  return `@layer stoa-components { ${selectors.join(', ')} { display: inline-flex; } }`
}

/**
 * @param {ThemeSwatch[] | undefined} swatches
 * @param {'light' | 'dark'} mode
 */
const swatchRow = (swatches, mode) =>
  swatches?.length
    ? `<span class="theme-menu__swatches theme-menu__swatches--${mode}" aria-hidden="true">${swatches
        .map(
          (s) =>
            `<span class="theme-menu__swatch" title="${esc(s.label)}" style="background: ${esc(s.colour.replace(/[;{}]/g, ''))}"></span>`
        )
        .join('')}</span>`
    : ''

/**
 * <stoa-theme-menu> with its markup.
 * @param {ThemeMenuConfig} config
 */
export function renderThemeMenu(config) {
  const themes = config.themes
  const id = esc(config.id ?? THEME_DEFAULTS.id)
  const attribute = config.attribute ?? THEME_DEFAULTS.attribute
  const fallback = config.defaultTheme ?? themes[0]?.id ?? ''
  const label = esc(config.label ?? THEME_DEFAULTS.label)
  const hasSwatches = themes.some((t) => t.swatches?.light?.length || t.swatches?.dark?.length)

  /** @type {[string, string | undefined][]} */
  const attrs = [
    ['attribute', attribute === THEME_DEFAULTS.attribute ? undefined : attribute],
    ['default', fallback],
    ['storage-key', config.storageKey]
  ]
  const attributes = attrs
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => ` ${k}="${esc(String(v))}"`)
    .join('')

  const current = themes
    .map(
      (t) =>
        `<span class="theme-menu__current-item" data-theme-current="${esc(t.id)}">${t.icon ?? `<span class="theme-menu__current-name">${esc(t.name)}</span>`}</span>`
    )
    .join('')

  const options = themes
    .map((t) => {
      const tid = `${id}-${esc(t.id)}`
      const described = [t.description && `${tid}-description`, t.detail && `${tid}-detail`].filter(Boolean)
      return `<button type="button" class="theme-menu__option" tabindex="-1" role="menuitemradio" aria-checked="${t.id === fallback}" data-theme-value="${esc(t.id)}" aria-labelledby="${tid}"${described.length ? ` aria-describedby="${described.join(' ')}"` : ''}>
          ${t.icon ? `<span class="theme-menu__icon">${t.icon}</span>` : ''}<span class="theme-menu__text">
            <span class="theme-menu__title-row">
              <span class="theme-menu__name" id="${tid}">${esc(t.name)}</span>${t.description ? `\n              <span class="theme-menu__description" id="${tid}-description">${esc(t.description)}</span>` : ''}
              ${CHECK}
            </span>${t.detail ? `\n            <span class="theme-menu__detail" id="${tid}-detail">${esc(t.detail)}</span>` : ''}
          </span>${swatchRow(t.swatches?.light, 'light')}${swatchRow(t.swatches?.dark, 'dark')}
        </button>`
    })
    .join('\n        ')

  const tags = hasSwatches
    ? `
      <span class="theme-menu__mode-tag theme-menu__mode-tag--light">Light swatches</span>
      <span class="theme-menu__mode-tag theme-menu__mode-tag--dark">Dark swatches</span>`
    : ''
  const note = config.note ? `\n      <p class="theme-menu__note">${esc(config.note)}</p>` : ''
  const foot = note || config.foot ? `\n    <div class="theme-menu__foot">${note}${config.foot ?? ''}\n    </div>` : ''

  return `<stoa-theme-menu${attributes}>
<style>${themeCurrentRule(
    themes.map((t) => t.id),
    fallback,
    attribute
  )}</style>
<div class="theme-menu">
  <button type="button" class="theme-menu__trigger" disabled hidden aria-label="${label}" title="${label}" aria-haspopup="true" aria-expanded="false" aria-controls="${id}-panel">
    <span class="theme-menu__current">${current}</span>
    ${CHEVRON}
  </button>
  <div class="theme-menu__panel" id="${id}-panel" hidden>
    <div class="theme-menu__head"${config.single ? ' hidden' : ''}>
      <span class="theme-menu__heading" id="${id}-heading">${esc(config.heading ?? THEME_DEFAULTS.heading)}</span>${tags}
    </div>
    <div class="theme-menu__list" role="menu" aria-labelledby="${id}-heading"${config.single ? ' hidden' : ''}>
        ${options}
    </div>${foot}
  </div>
</div>
</stoa-theme-menu>`
}
