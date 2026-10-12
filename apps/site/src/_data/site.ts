const site = {
  title: 'Knowledge Islands',
  url: 'https://knowledgeislands.info',
  tagline: 'Knowledge as a civilisation question.',
  ogImage: '/assets/images/og-image.png',
  description:
    'Knowledge Islands is a model for building, governing, and evolving knowledge across individuals, teams, and generations — treating knowledge not as a filing problem but as a civilisation question.',
  // Three entries, because the bar should say what the site is rather than list what it
  // contains. It previously carried six of very unequal weight: four opened a single page
  // while two opened thirty-seven between them, so a reader could not tell which links were
  // destinations and which were bodies of material (KI-WEBSITE-SITE-037). Projects is reachable
  // from the Docs landing page and from the footer; it is a catalogue, not a section.
  nav: [
    { label: 'Philosophy', href: '/philosophy/' },
    { label: 'Model', href: '/model/' },
    { label: 'Docs', href: '/docs/' }
  ]
}

export default site
