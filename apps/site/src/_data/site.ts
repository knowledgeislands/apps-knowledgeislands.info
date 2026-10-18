const site = {
  title: 'Knowledge Islands',
  url: 'https://knowledgeislands.info',
  tagline: 'Knowledge as a civilisation question.',
  ogImage: '/assets/images/og-image.png',
  description:
    'Knowledge Islands is a model for building, governing, and evolving knowledge across individuals, teams, and generations — treating knowledge not as a filing problem but as a civilisation question.',
  // Two groups, after the ki-design site structure: the Voyage is read once, in order; the Atlas is
  // returned to, to look things up. The bar used to carry three entries (KI-WEBSITE-SITE-037), because
  // six of very unequal weight left a reader unable to tell destinations from bodies of material; the
  // grouping is what lets it carry more without reintroducing that problem.
  //
  // Only routes that exist are listed. The design's Voyage also names Landscapes and Create, and its
  // Atlas Specifications; none of those pages exists yet (/specifications redirects home), so they are
  // left out rather than pointed somewhere they are not (KI-WEBSITE-SITE-044). Arcadia and the call to
  // action go to /arcadia/, the painting beside the chart (KI-WEBSITE-SITE-045); the home page's Arcadia
  // section keeps its #arcadia anchor.
  nav: {
    groups: [
      {
        label: 'Voyage',
        items: [
          { label: 'Philosophy', href: '/philosophy/' },
          { label: 'Model', href: '/model/' },
          { label: 'Arcadia', href: '/arcadia/' }
        ]
      },
      {
        label: 'Atlas',
        items: [
          { label: 'Field Guide', href: '/field-guide/' },
          { label: 'Docs', href: '/docs/' },
          { label: 'Projects', href: '/projects/' }
        ]
      }
    ],
    cta: { label: 'Enter Arcadia', href: '/arcadia/' }
  }
}

export default site
