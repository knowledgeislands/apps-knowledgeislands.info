// Progressive enhancement only: every page reads and navigates fully without this file.
;(() => {
  // The compact menu is a <details>, so it already opens and closes without script. Close it on
  // Escape, returning focus to its summary, and when one of its links is followed.
  const menu = document.querySelector('.nav-menu')
  if (menu instanceof HTMLDetailsElement) {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false
        menu.querySelector('summary')?.focus()
      }
    })
    menu.addEventListener('click', (event) => {
      if (event.target instanceof HTMLAnchorElement) menu.open = false
    })
  }

  // Field Guide: filter the symbol groups by category. Without script the filter row is hidden and
  // every group shows.
  const filters = document.querySelector('.guide-filters')
  if (filters) {
    filters.hidden = false
    const chips = filters.querySelectorAll('.chip[data-filter]')
    const groups = document.querySelectorAll('.guide-section[data-category]')
    for (const chip of chips) {
      chip.addEventListener('click', () => {
        const want = chip.getAttribute('data-filter')
        for (const other of chips) other.setAttribute('aria-pressed', String(other === chip))
        for (const group of groups) {
          group.hidden = want !== 'all' && group.getAttribute('data-category') !== want
        }
      })
    }
  }
})()
