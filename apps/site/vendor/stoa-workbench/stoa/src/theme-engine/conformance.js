// @ts-check
// A resolver supplies opaque sRGB channels (0..1) and perceptual hue in
// degrees, or null hue for an achromatic colour. CSS parsing stays in the adapter.
/** @typedef {{rgb: [number, number, number], hue: number | null}} ThemeColour */
export const REQUIRED_THEME_FIELDS = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'border',
  'input',
  'ring'
].map((f) => `--stoa-${f}`)
export const MEANING_THEME_FIELDS = [
  ...['pass', 'risk', 'fail', 'ns'].flatMap((s) => ['fg', 'bg'].map((f) => `--stoa-status-${s}-${f}`)),
  ...Array.from({ length: 8 }, (_, i) => ['fill', 'soft', 'text', 'ink'].map((f) => `--stoa-cal-${i + 1}-${f}`)).flat()
]
const pairs = [
  ...['card', 'popover', 'primary', 'muted', 'accent'].map((s) => [`${s}-foreground`, s, 4.5]),
  ['foreground', 'background', 4.5],
  ['muted-foreground', 'background', 4.5],
  ['muted-foreground', 'card', 4.5],
  ['primary', 'background', 4.5],
  ['ring', 'background', 3],
  ...['pass', 'risk', 'fail', 'ns'].map((s) => [`status-${s}-fg`, `status-${s}-bg`, 4.5]),
  ...Array.from({ length: 8 }, (_, i) => [`cal-${i + 1}-text`, `cal-${i + 1}-soft`, 4.5])
]
/** @param {ThemeColour} colour */
function luminance(colour) {
  return colour.rgb
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0)
}
/** @param {ThemeColour} a @param {ThemeColour} b */
export function themeContrast(a, b) {
  const x = luminance(a),
    y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

import { validateThemeConfig } from './core.js'
/** Checks every system theme, both modes and the Cartesian product of axes.
 * Optional meaning fields inherit framework defaults; resolve those defaults too.
 * @param {import('./core.js').ThemeConfig & {resolve: (state: {theme: string, mode: 'light' | 'dark', axes: Record<string, string>}) => Record<string, ThemeColour | undefined>, hueTolerance: number}} config
 */
export function checkThemeSystem(config) {
  validateThemeConfig(config)
  if (!Number.isFinite(config.hueTolerance) || config.hueTolerance < 0 || config.hueTolerance > 180)
    throw new Error('Set a hue tolerance in degrees, from 0 to 180')
  /** @type {{theme: string, mode: string, axes: Record<string, string>, field: string, issue: string, ratio?: number}[]} */
  const issues = []
  let combinations = /** @type {Record<string, string>[]} */ ([{}])
  for (const axis of config.system.axes ?? [])
    combinations = combinations.flatMap((axes) => axis.values.map((v) => ({ ...axes, [axis.id]: v.id })))
  /** @type {Map<string, ThemeColour>} */
  const meanings = new Map()
  for (const axes of combinations) {
    for (const theme of config.system.themes) {
      /** @type {Record<string, ThemeColour | undefined> | undefined} */
      let light
      for (const mode of /** @type {const} */ (['light', 'dark'])) {
        const fields = config.resolve({ theme: theme.id, mode, axes })
        const context = { theme: theme.id, mode, axes }
        const invalid = new Set()
        for (const [field, colour] of Object.entries(fields)) {
          if (
            colour &&
            (colour.rgb.length !== 3 ||
              colour.rgb.some((v) => !Number.isFinite(v) || v < 0 || v > 1) ||
              (colour.hue !== null && !Number.isFinite(colour.hue)))
          ) {
            issues.push({ ...context, field, issue: 'invalid-colour' })
            invalid.add(field)
          }
        }
        for (const field of [...REQUIRED_THEME_FIELDS, ...MEANING_THEME_FIELDS])
          if (!fields[field]) issues.push({ ...context, field, issue: 'missing-field' })
        for (const [fg, bg, minimum] of pairs) {
          const f = `--stoa-${fg}`,
            b = `--stoa-${bg}`
          const a = fields[f],
            z = fields[b]
          if (!a || !z || invalid.has(f) || invalid.has(b)) continue
          const ratio = themeContrast(a, z)
          if (ratio < Number(minimum)) issues.push({ ...context, field: `${f}/${b}`, issue: 'contrast', ratio })
        }
        for (const field of MEANING_THEME_FIELDS) {
          const colour = fields[field]
          if (!colour || invalid.has(field)) continue
          const key = `${mode}/${field}`
          const baseline = meanings.get(key)
          if (
            baseline &&
            (baseline.rgb.some((v, i) => Math.abs(v - colour.rgb[i]) > 1e-6) || baseline.hue !== colour.hue)
          )
            issues.push({ ...context, field, issue: 'meaning-varies' })
          else if (!baseline) meanings.set(key, colour)
        }
        if (light)
          for (const [field, colour] of Object.entries(fields)) {
            const a = light[field]?.hue,
              b = colour?.hue
            if (a == null || b == null || invalid.has(field)) continue
            const delta = Math.abs((((a - b) % 360) + 360) % 360)
            if (Math.min(delta, 360 - delta) > config.hueTolerance)
              issues.push({ ...context, field, issue: 'hue-drift' })
          }
        if (mode === 'light') light = fields
      }
    }
  }
  return { valid: issues.length === 0, issues }
}
