// @ts-check
// The plugin-facing configuration subset, without an Eleventy runtime dependency.
/**
 * @typedef {object} StoaEleventyConfig
 * @property {(name: string, callback: (...args: any[]) => string) => void} addShortcode
 * @property {(name: string, value: () => unknown) => void} addGlobalData
 * @property {(name: string, template: { data: Record<string, unknown>, render: (data: any) => string }) => void} [addTemplate]
 */
export {}
