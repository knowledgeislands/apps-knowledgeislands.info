// @ts-check
// @externalise later
// The Theme Menu: the markup a build writes from the site's theme registry,
// and <stoa-theme-menu>, which chooses among them. Generic once the Theme
// Engine settles what it hands the menu.

export { defineStoaThemeMenu, StoaThemeMenu } from './element.js'
export { renderThemeMenu, THEME_DEFAULTS, themeCurrentRule } from './render.js'

/** @typedef {import('./render.js').ThemeMenuConfig} ThemeMenuConfig */
/** @typedef {import('./render.js').ThemeOption} ThemeOption */
/** @typedef {import('./render.js').ThemeSwatch} ThemeSwatch */
