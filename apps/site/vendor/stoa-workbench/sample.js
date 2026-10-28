// Sample data for the workbench: neutral names, nothing from any Stoa site.

export const sources = {
  PLAN: { title: 'Project plan', asOf: '20 Oct 2026' },
  MIN: { title: 'Meeting minutes', asOf: '14 Oct 2026' }
}

/** @type {import('../../packages/stoa/src/calendar/types.js').StoaCalendarSet} */
export const calendarSet = {
  timeZone: 'Europe/Paris',
  secondZone: 'Europe/London',
  zoneLabels: { 'Europe/London': 'UK time' },
  tagGroups: { topic: { label: 'Topic', codes: { A: 'Harbour Survey', B: 'Lighthouse Watch' } } },
  calendars: [
    {
      id: 'meetings',
      title: 'Meetings',
      description: 'Regular calls and workshops.',
      code: 'M',
      colour: 1,
      availability: 'busy',
      entries: [
        {
          id: 'open-session',
          url: '/calendars/meetings/#open-session',
          title: 'Open session',
          start: '2026-10-22',
          time: '14:00',
          kind: 'event',
          status: 'confirmed',
          description: 'Starts at 14:00; the end is not fixed.',
          sources: [{ source: 'PLAN' }]
        },
        {
          id: 'weekly-review-day',
          title: 'Weekly review day',
          start: '2026-10-08',
          repeat: 'weekly',
          until: '2026-11-05',
          exdates: ['2026-10-29'],
          kind: 'review',
          status: 'confirmed',
          description: 'An all-day weekly review; the final October occurrence is excluded.',
          sources: [{ source: 'MIN' }]
        },
        {
          id: 'weekly-call',
          title: 'Weekly call',
          start: '2026-10-08',
          time: '10:30',
          duration: 60,
          repeat: 'weekly',
          exdates: ['2026-10-29'],
          kind: 'meeting',
          status: 'confirmed',
          description: 'Every Thursday.',
          sources: [{ source: 'MIN' }]
        },
        {
          id: 'harbour-workshop',
          title: 'Harbour workshop',
          start: '2026-11-12',
          end: '2026-11-13',
          kind: 'review',
          status: 'target',
          description: 'Two days on the survey results.',
          tags: { topic: ['A'] },
          sources: [{ source: 'PLAN', at: 'Section 4' }]
        }
      ]
    },
    {
      id: 'deadlines',
      title: 'Deadlines',
      description: 'Dates work is due.',
      code: 'D',
      colour: 2,
      availability: 'free',
      entries: [
        {
          id: 'survey-report',
          title: 'Survey report due',
          start: '2026-11-30',
          kind: 'deadline',
          status: 'confirmed',
          description: 'The harbour survey report.',
          tags: { topic: ['A'] },
          sources: [{ source: 'PLAN' }]
        },
        {
          id: 'lamp-review',
          title: 'Lamp review',
          start: '2027-01',
          kind: 'milestone',
          status: 'to-confirm',
          description: 'Some day in January.',
          tags: { topic: ['B'] },
          sources: [{ source: 'MIN', at: 'Item 3' }]
        }
      ]
    }
  ]
}

export const kinds = [
  { key: 'topic', label: 'Topics' },
  { key: 'item', label: 'Items' },
  { key: 'date', label: 'Dates' }
]

export const badges = {
  topic: {
    A: '<span class="cal-tag">A</span>',
    B: '<span class="cal-tag">B</span>'
  }
}

export const searchEntries = [
  { k: 'topic', t: 'Harbour Survey', u: '/topics/#a', c: 'A', a: ['Topic A'], b: ['topic:A'] },
  { k: 'topic', t: 'Lighthouse Watch', u: '/topics/#b', c: 'B', a: ['Topic B'], b: ['topic:B'] },
  { k: 'item', t: 'Survey boat', u: '/topics/#it-001', c: 'IT-001', d: 'Harbour Survey', b: ['topic:A'] },
  { k: 'item', t: 'Lamp parts', u: '/topics/#it-002', c: 'IT-002', d: 'Lighthouse Watch', b: ['topic:B'] },
  ...calendarSet.calendars.flatMap((cal) =>
    cal.entries.map((e) => ({ k: 'date', t: e.title, u: `/calendars/${cal.id}/#${e.id}`, d: cal.title }))
  )
]

// Rows for the Filter Bar story, with the fields each row carries.
export const statusVocabulary = [
  { key: 'open', label: 'Open' },
  { key: 'review', label: 'In review' },
  { key: 'done', label: 'Done' }
]

export const filterFields = [
  { key: 'state', label: 'State', values: statusVocabulary },
  { key: 'topic', label: 'Topic' },
  { key: 'owner', label: 'Owner', quick: false }
]

export const filterRows = [
  { code: 'IT-001', title: 'Survey boat', state: 'done', topic: 'A', owner: 'Ada' },
  { code: 'IT-002', title: 'Lamp parts', state: 'open', topic: 'B', owner: 'Ben' },
  { code: 'IT-003', title: 'Tide tables', state: 'review', topic: 'A', owner: 'Ada' },
  { code: 'IT-004', title: 'Lens cleaning', state: 'open', topic: 'B', owner: 'Cal' },
  { code: 'IT-005', title: 'Chart update', state: 'done', topic: 'A', owner: 'Ben' },
  { code: 'IT-006', title: 'Keeper rota', state: 'review', topic: 'B', owner: 'Cal' }
]

// The workbench's themes: three neutral identities, each a set of hue anchors
// in workbench.css. A site's registry is its own data.
const swatch = (/** @type {string[]} */ colours) =>
  ['Background', 'Primary', 'Accent'].map((label, i) => ({ label, colour: colours[i] }))

export const themes = [
  {
    id: 'harbour',
    name: 'Harbour',
    description: 'Slate and teal',
    detail: 'The default: cool blues over a quiet grey.',
    swatches: {
      light: swatch(['oklch(0.975 0.006 258)', 'oklch(0.485 0.105 224)', 'oklch(0.5 0.11 175)']),
      dark: swatch(['oklch(0.185 0.006 258)', 'oklch(0.765 0.105 224)', 'oklch(0.79 0.11 175)'])
    }
  },
  {
    id: 'meadow',
    name: 'Meadow',
    description: 'Moss and straw',
    detail: 'Greens with a warm accent.',
    swatches: {
      light: swatch(['oklch(0.975 0.006 120)', 'oklch(0.485 0.11 145)', 'oklch(0.5 0.11 85)']),
      dark: swatch(['oklch(0.185 0.006 120)', 'oklch(0.765 0.11 145)', 'oklch(0.79 0.11 85)'])
    }
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Brick and gold',
    detail: 'Warm reds and a golden accent.',
    swatches: {
      light: swatch(['oklch(0.975 0.006 40)', 'oklch(0.485 0.13 30)', 'oklch(0.5 0.11 70)']),
      dark: swatch(['oklch(0.185 0.006 40)', 'oklch(0.765 0.13 30)', 'oklch(0.79 0.11 70)'])
    }
  }
]
