// @ts-check
import { fitScale, zoomTransform } from './core.js'

const Base = /** @type {typeof HTMLElement} */ (globalThis.HTMLElement ?? class {})

export class StoaDiagramViewer extends Base {
  /** @type {AbortController | undefined} */
  #abort
  /** @type {HTMLDialogElement | null} */
  #dialog = null
  /** @type {HTMLElement | null} */
  #viewport = null
  /** @type {HTMLElement | null} */
  #canvas = null
  /** @type {HTMLElement | null} */
  #image = null
  /** @type {HTMLElement | null} */
  #preview = null
  /** @type {HTMLButtonElement | null} */
  #trigger = null
  /** @type {HTMLElement | null} */
  #returnFocus = null
  /** @type {ResizeObserver | undefined} */
  #resize
  /** @type {{id: number, x: number, y: number} | undefined} */
  #drag
  #width = 1
  #height = 1
  #minimum = 0.01
  #autoFit = true
  #state = { scale: 1, x: 0, y: 0 }

  connectedCallback() {
    if (!this.isConnected || this.#abort) return
    this.#dialog = this.querySelector('dialog')
    this.#viewport = this.querySelector('[data-diagram-viewport]')
    this.#canvas = this.querySelector('[data-diagram-canvas]')
    this.#image = this.querySelector('[data-diagram-image]')
    this.#preview = this.querySelector('[data-diagram-preview]')
    this.#trigger = this.querySelector('[data-diagram-open]')
    if (
      !this.#dialog?.showModal ||
      !this.#viewport ||
      !this.#canvas ||
      !this.#image ||
      !this.#preview ||
      !this.#trigger
    )
      return
    this.#abort = new AbortController()
    const options = { signal: this.#abort.signal }
    this.#trigger.hidden = false
    this.setAttribute('data-ready', '')
    this.#trigger.addEventListener('click', () => this.show(), options)
    this.#preview.addEventListener('click', () => this.show(), options)
    this.#dialog.addEventListener(
      'cancel',
      (event) => {
        event.preventDefault()
        this.close()
      },
      options
    )
    this.#dialog.addEventListener('close', () => this.#restore(), options)
    this.#dialog.addEventListener(
      'keydown',
      (event) => {
        if (event.key !== 'Tab') return
        const stops = [
          ...(this.#dialog?.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          ) ?? [])
        ].filter((node) => node.getClientRects().length)
        const first = /** @type {HTMLElement | undefined} */ (stops[0])
        const last = /** @type {HTMLElement | undefined} */ (stops.at(-1))
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      },
      options
    )

    this.#dialog.addEventListener(
      'click',
      (event) => {
        const button = /** @type {Element | null} */ (event.target)?.closest('[data-diagram-action]')
        if (button) this.#action(button.getAttribute('data-diagram-action') ?? '')
      },
      options
    )
    this.#viewport.addEventListener(
      'keydown',
      (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return
        const actions = /** @type {Record<string, string>} */ ({
          '+': 'in',
          '=': 'in',
          '-': 'out',
          '−': 'out',
          Home: 'fit',
          0: 'reset',
          ArrowLeft: 'left',
          ArrowRight: 'right',
          ArrowUp: 'up',
          ArrowDown: 'down'
        })
        if (actions[event.key]) {
          event.preventDefault()
          event.stopPropagation()
          this.#action(actions[event.key])
        }
      },
      options
    )
    this.#viewport.addEventListener(
      'wheel',
      (event) => {
        if (!this.#dialog?.open || !event.deltaY) return
        event.preventDefault()
        const rect = this.#viewport?.getBoundingClientRect()
        if (!rect) return
        this.#zoom(event.deltaY < 0 ? 1.2 : 1 / 1.2, {
          x: event.clientX - rect.left - rect.width / 2,
          y: event.clientY - rect.top - rect.height / 2
        })
      },
      { ...options, passive: false }
    )
    this.#viewport.addEventListener(
      'pointerdown',
      (event) => {
        if (!event.isPrimary || event.button !== 0 || !this.#dialog?.open) return
        event.preventDefault()
        this.#viewport?.focus()
        this.#autoFit = false
        this.#drag = { id: event.pointerId, x: event.clientX, y: event.clientY }
        this.#viewport?.setPointerCapture(event.pointerId)
      },
      options
    )
    this.#viewport.addEventListener(
      'pointermove',
      (event) => {
        if (this.#drag?.id !== event.pointerId) return
        this.#state.x += event.clientX - this.#drag.x
        this.#state.y += event.clientY - this.#drag.y
        this.#drag.x = event.clientX
        this.#drag.y = event.clientY
        this.#paint()
      },
      options
    )
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      this.#viewport.addEventListener(type, () => this.#release(), options)
    }
    this.#image.addEventListener('dragstart', (event) => event.preventDefault(), options)
    this.#image.addEventListener(
      'load',
      () => {
        if (this.#dialog?.open) {
          this.#measure()
          if (this.#autoFit) this.fit()
        }
      },
      { ...options, capture: true }
    )
    this.#resize = new ResizeObserver(() => {
      if (this.#dialog?.open && this.#autoFit) this.fit()
    })
    this.#resize.observe(this.#viewport)
  }

  show() {
    if (!this.isConnected || !this.#abort || this.#dialog?.open) return
    for (const other of document.querySelectorAll('stoa-diagram-viewer')) {
      if (other !== this && other instanceof StoaDiagramViewer) other.close()
    }
    this.#returnFocus =
      document.activeElement instanceof HTMLElement &&
      this.contains(document.activeElement) &&
      document.activeElement !== document.body
        ? document.activeElement
        : this.#trigger
    this.#measure()
    if (this.#image) this.#canvas?.append(this.#image)
    this.#dialog?.showModal()
    this.fit()
    this.#viewport?.focus()
  }

  #measure() {
    const visual = this.#image?.querySelector('img, svg')
    if (visual instanceof HTMLImageElement) {
      this.#width = visual.naturalWidth || visual.width || 1
      this.#height = visual.naturalHeight || visual.height || 1
    } else if (visual instanceof SVGSVGElement) {
      this.#width = visual.viewBox.baseVal.width || visual.width.baseVal.value || 1
      this.#height = visual.viewBox.baseVal.height || visual.height.baseVal.value || 1
    }
    if (this.#canvas) {
      this.#canvas.style.width = `${this.#width}px`
      this.#canvas.style.height = `${this.#height}px`
    }
  }

  fit() {
    if (!this.#dialog?.open || !this.#viewport) return
    this.#autoFit = true
    const scale = fitScale(this.#width, this.#height, this.#viewport.clientWidth, this.#viewport.clientHeight)
    this.#minimum = Math.min(0.1, scale / 4)
    this.#state = { scale, x: 0, y: 0 }
    this.#paint()
  }

  reset() {
    if (!this.#dialog?.open) return
    this.#autoFit = false
    this.#state = { scale: 1, x: 0, y: 0 }
    this.#paint()
  }

  /** @param {number} factor */
  zoom(factor) {
    if (Number.isFinite(factor) && factor > 0) this.#zoom(factor)
  }

  /** @param {number} factor @param {{x: number, y: number}} [point] */
  #zoom(factor, point) {
    if (!this.#dialog?.open) return
    this.#autoFit = false
    this.#state = zoomTransform(this.#state, factor, this.#minimum, point)
    this.#paint()
  }

  /** @param {string} action */
  #action(action) {
    if (action === 'close') return this.close()
    if (action === 'fit') return this.fit()
    if (action === 'reset') return this.reset()
    if (action === 'in' || action === 'out') return this.zoom(action === 'in' ? 1.25 : 0.8)
    const moves = /** @type {Record<string, [number, number]>} */ ({
      left: [-40, 0],
      right: [40, 0],
      up: [0, -40],
      down: [0, 40]
    })
    const move = moves[action]
    if (move) {
      this.#autoFit = false
      this.#state.x += move[0]
      this.#state.y += move[1]
      this.#paint()
    }
  }

  #paint() {
    if (!this.#canvas) return
    const { scale, x, y } = this.#state
    this.#canvas.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`
    const status = this.querySelector('[data-diagram-status]')
    if (status) status.textContent = `${Math.round(scale * 100)}%`
  }

  #release() {
    const drag = this.#drag
    this.#drag = undefined
    if (drag && this.#viewport?.hasPointerCapture(drag.id)) this.#viewport.releasePointerCapture(drag.id)
  }

  close() {
    if (!this.#dialog?.open) return
    this.#dialog.close()
    this.#restore()
  }

  #restore() {
    // Native close events are queued; never restore over an immediate reopen.
    if (this.#dialog?.open) return
    this.#release()
    if (this.#image && this.#preview && this.#image.parentElement !== this.#preview) this.#preview.append(this.#image)
    const focus = this.#returnFocus
    this.#returnFocus = null
    if (focus?.isConnected) focus.focus()
  }

  disconnectedCallback() {
    this.close()
    this.#abort?.abort()
    this.#abort = undefined
    this.#resize?.disconnect()
    this.#resize = undefined
    if (this.#trigger) this.#trigger.hidden = true
    this.removeAttribute('data-ready')
  }
}

/** Defines the light-DOM viewer once. */
export function defineStoaDiagramViewer(name = 'stoa-diagram-viewer') {
  if (!customElements.get(name)) customElements.define(name, StoaDiagramViewer)
}
