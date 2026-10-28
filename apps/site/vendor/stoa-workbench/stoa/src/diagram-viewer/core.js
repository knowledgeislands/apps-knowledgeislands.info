// @ts-check
/** @typedef {{scale: number, x: number, y: number}} DiagramTransform */
/** @param {number} width @param {number} height @param {number} viewportWidth @param {number} viewportHeight */
export function fitScale(width, height, viewportWidth, viewportHeight) {
  return Math.min(1, Math.max(1, viewportWidth) / Math.max(1, width), Math.max(1, viewportHeight) / Math.max(1, height))
}
/** Zoom around a point relative to the viewport centre.
 * @param {DiagramTransform} state @param {number} factor @param {number} minimum
 * @param {{x: number, y: number}} [point]
 * @returns {DiagramTransform}
 */
export function zoomTransform(state, factor, minimum, point = { x: 0, y: 0 }) {
  const scale = Math.max(minimum, Math.min(16, state.scale * factor))
  const ratio = scale / state.scale
  return { scale, x: point.x - (point.x - state.x) * ratio, y: point.y - (point.y - state.y) * ratio }
}
