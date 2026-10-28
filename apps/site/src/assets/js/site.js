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

  // Night toggle (GDR-KI-DESIGN-025). The page follows the OS until a visitor presses the toggle; a choice
  // is stored in this browser only, and the inline script in the head applies it before paint. Choosing the
  // scheme the OS already shows clears the choice, so the page goes back to following the system.
  const toggle = document.querySelector('.theme-toggle')
  if (toggle instanceof HTMLButtonElement) {
    const root = document.documentElement
    const osNight = window.matchMedia('(prefers-color-scheme: dark)')
    const remember = (theme) => {
      try {
        if (theme) localStorage.setItem('ki-theme', theme)
        else localStorage.removeItem('ki-theme')
      } catch {
        // Storage refused (private mode, blocked site data): the choice lasts for this page only.
      }
    }
    const showsNight = () => {
      const forced = root.getAttribute('data-theme')
      return forced === 'night' || (forced !== 'light' && osNight.matches)
    }
    const render = () => toggle.setAttribute('aria-pressed', String(showsNight()))
    toggle.addEventListener('click', () => {
      const night = !showsNight()
      if (night === osNight.matches) {
        root.removeAttribute('data-theme')
        remember(null)
      } else {
        const theme = night ? 'night' : 'light'
        root.setAttribute('data-theme', theme)
        remember(theme)
      }
      render()
    })
    osNight.addEventListener('change', render)
    render()
    toggle.hidden = false
  }

  // Live Stoa stories (the stoaStory and stoaThemes shortcodes). Each frame starts in this page's light or night,
  // following the toggle and the system; a choice the reader makes inside a frame still wins there. The frame
  // reports its height, and takes it, so the story is never cut off or framed in empty space.
  const stories = [...document.querySelectorAll('iframe[data-stoa-story]')]
  if (stories.length) {
    const root = document.documentElement
    const osNight = window.matchMedia('(prefers-color-scheme: dark)')
    const scheme = () => {
      const forced = root.getAttribute('data-theme')
      return forced === 'night' || (forced !== 'light' && osNight.matches) ? 'dark' : 'light'
    }
    const point = () => {
      for (const frame of stories) {
        const url = new URL(frame.getAttribute('src') ?? '', location.href)
        const key = url.searchParams.has('preview-theme') ? 'preview-mode' : 'mode'
        if (url.searchParams.get(key) === scheme()) continue
        url.searchParams.set(key, scheme())
        frame.setAttribute('src', url.href)
      }
    }
    new MutationObserver(point).observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    osNight.addEventListener('change', point)
    point()
    window.addEventListener('message', (event) => {
      if (event.origin !== location.origin || event.data?.wb !== 'height') return
      const frame = stories.find((candidate) => candidate.contentWindow === event.source)
      if (frame) frame.style.height = `${Math.min(Math.max(Number(event.data.height) || 0, 160), 2400)}px`
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
