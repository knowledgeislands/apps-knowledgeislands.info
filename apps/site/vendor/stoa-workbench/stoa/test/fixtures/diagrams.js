// Neutral sample diagrams shared by package tests and the workbench.
export default {
  svg: {
    id: 'flow-diagram',
    label: 'Example flow',
    captionHtml:
      '<strong>Draft</strong> <span class="site-status">Review</span> — inline SVG; explore to zoom and pan.',
    image: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" role="img" aria-labelledby="flow-title"><title id="flow-title">Input passes through a process to an output</title><defs><marker id="flow-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="currentColor"/></marker></defs><g fill="none" stroke="currentColor" stroke-width="3"><rect x="30" y="130" width="240" height="140" rx="16"/><rect x="380" y="130" width="240" height="140" rx="16"/><rect x="730" y="130" width="240" height="140" rx="16"/><path d="M270 200 H370 M620 200 H720" marker-end="url(#flow-arrow)"/></g><g fill="currentColor" text-anchor="middle" font-family="sans-serif" font-size="32"><text x="150" y="212">Input</text><text x="500" y="212">Process</text><text x="850" y="212">Output</text></g></svg>'
    }
  },
  image: {
    id: 'image-diagram',
    label: 'Example image diagram',
    caption: 'The same interaction also accepts a normal img.',
    image: {
      src: '/assets/diagram-sample.svg',
      alt: 'Three connected steps: Input, Process, Output',
      width: 1200,
      height: 400
    }
  }
}
