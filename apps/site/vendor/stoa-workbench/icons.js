// The workbench's SVG adapter for icon placeholders. Units remain independent of any icon library.
const paths = {
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'calendar-days': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8 15h1M15 15h1"/>',
  'chart-gantt': '<path d="M3 3v18h18M7 7h7M10 11h9M7 15h5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/>',
  'panel-left-close': '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m7-13-4 4 4 4"/>',
  'panel-left-open': '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m4-13 4 4-4 4"/>',
  'refresh-cw': '<path d="M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 3M18 18A8 8 0 0 1 5 15"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  'calendar-plus':
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18M12 14v5M9.5 16.5h5"/>',
  'file-text': '<path d="M14 2H4v20h16V8Zm0 0v6h6M8 13h8M8 17h8"/>'
}

export function drawIcons(root) {
  for (const placeholder of root.querySelectorAll('[data-lucide]')) {
    const name = placeholder.getAttribute('data-lucide')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    for (const attr of placeholder.attributes) if (attr.name !== 'data-lucide') svg.setAttribute(attr.name, attr.value)
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('width', '20')
    svg.setAttribute('height', '20')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('stroke-width', '2')
    svg.setAttribute('aria-hidden', 'true')
    svg.innerHTML = paths[name] ?? '<circle cx="12" cy="12" r="8"/><path d="M8 12h8M12 8v8"/>'
    placeholder.replaceWith(svg)
  }
}
