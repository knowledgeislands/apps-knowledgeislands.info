// @ts-check
/**
 * The signed-in person, owned by the Header. Only when the same origin's Access names a person does the area show:
 * a profile button with the person's initial. It opens a small panel with "Signed in as", the email, a separator
 * and a real Sign out link to /cdn-cgi/access/logout on the same origin. Loading, signed out and errors show
 * nothing. Every part is text or an attribute set through the DOM, never HTML, and nothing about the person is in
 * the built page. Disconnecting clears it; reconnecting asks again.
 * @param {HTMLElement} header @param {AbortSignal} signal
 */
export function installHeaderIdentity(header, signal) {
  const out = header.querySelector('[data-header-identity]')
  if (!(out instanceof HTMLElement)) return
  out.hidden = true
  out.replaceChildren()
  out.dataset.identityState = 'loading'
  signal.addEventListener(
    'abort',
    () => {
      out.hidden = true
      out.replaceChildren()
    },
    { once: true }
  )
  fetch('/cdn-cgi/access/get-identity', { credentials: 'same-origin', redirect: 'error', signal })
    .then(async (response) => {
      if (signal.aborted) return
      if (!response.ok) {
        out.dataset.identityState = [401, 403].includes(response.status) ? 'signed-out' : 'error'
        return
      }
      const identity = await response.json()
      if (signal.aborted) return
      const email = typeof identity?.email === 'string' ? identity.email.trim() : ''
      if (!email) {
        out.dataset.identityState = 'signed-out'
        return
      }
      const name = typeof identity.name === 'string' && identity.name.trim() ? identity.name.trim() : email
      fill(out, header, email, name, signal)
      out.dataset.identityState = 'signed-in'
      out.hidden = false
      header.dispatchEvent(new CustomEvent('stoa-identity', { bubbles: true, detail: { email, name } }))
    })
    .catch(() => {
      if (!signal.aborted) out.dataset.identityState = 'error'
    })
}

/** @param {string} tag @param {string} part @param {string} [text] */
function element(tag, part, text) {
  const node = document.createElement(tag)
  node.className = `stoa-header__identity-${part}`
  if (text !== undefined) node.textContent = text
  return node
}

/** Build the profile button and its panel, and wire opening and closing.
 * @param {HTMLElement} out @param {HTMLElement} header @param {string} email @param {string} name
 * @param {AbortSignal} signal
 */
function fill(out, header, email, name, signal) {
  const panelId = `${header.id || 'stoa-header'}-identity`
  const trigger = /** @type {HTMLButtonElement} */ (element('button', 'trigger'))
  trigger.type = 'button'
  trigger.setAttribute('aria-expanded', 'false')
  trigger.setAttribute('aria-controls', panelId)
  // The initial is decoration; the button's name says what it is and who is signed in.
  const initial = element('span', 'initial', [...name][0]?.toUpperCase() ?? '?')
  initial.setAttribute('aria-hidden', 'true')
  trigger.append(initial, element('span', 'name', `Profile, signed in as ${email}`))
  const panel = element('div', 'panel')
  panel.id = panelId
  panel.hidden = true
  const logout = /** @type {HTMLAnchorElement} */ (element('a', 'signout', 'Sign out'))
  logout.href = '/cdn-cgi/access/logout'
  panel.append(element('p', 'label', 'Signed in as'), element('p', 'email', email), element('hr', 'separator'), logout)
  out.replaceChildren(trigger, panel)

  const listen = { signal }
  const open = (/** @type {boolean} */ value) => {
    panel.hidden = !value
    trigger.setAttribute('aria-expanded', String(value))
  }
  trigger.addEventListener('click', () => open(trigger.getAttribute('aria-expanded') !== 'true'), listen)
  out.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape' || panel.hidden) return
      event.stopPropagation()
      open(false)
      trigger.focus()
    },
    listen
  )
  // A click or focus anywhere else closes it.
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (!panel.hidden && !out.contains(/** @type {Node} */ (event.target))) open(false)
    },
    listen
  )
  out.addEventListener(
    'focusout',
    (event) => {
      const next = /** @type {Node | null} */ (event.relatedTarget)
      if (!panel.hidden && next && !out.contains(next)) open(false)
    },
    listen
  )
}
