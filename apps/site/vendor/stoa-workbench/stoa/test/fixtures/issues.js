const sample = {
  areas: ['Delivery', 'Operations'],
  asOf: '2026-10-22',
  data: {
    issues: [
      {
        id: 'ISS-1',
        title: 'Confirm the handover checklist',
        status: 'open',
        area: 'Delivery',
        owner: 'Ada',
        raised: '2026-10-20',
        forCall: '2026-10-23',
        note: 'Agree the remaining steps.',
        links: [{ label: 'Checklist', url: '#checklist' }]
      },
      {
        id: 'ISS-2',
        title: 'Review a long operational note on a narrow screen',
        status: 'doing',
        area: 'Operations',
        owner: 'Sam',
        raised: '2026-10-21',
        forCall: '2026-10-23',
        note: 'Keep the complete note readable.\nScroll the table on a small display.'
      },
      {
        id: 'ISS-3',
        title: 'Record the first review',
        status: 'done',
        area: 'Delivery',
        owner: 'Ada',
        raised: '2026-10-19',
        forCall: '2026-10-22',
        note: 'Review complete.'
      },
      {
        id: 'ISS-4',
        title: 'Retire the duplicate request',
        status: 'dropped',
        area: 'Operations',
        owner: 'Sam',
        raised: '2026-10-18',
        note: ''
      }
    ]
  }
}

sample.customStatuses = [
  { value: 'waiting', label: 'Awaiting review', closed: false },
  { value: 'later', label: 'Later', closed: true },
  { value: 'resolved', label: 'Resolved', closed: true }
]
sample.customData = {
  issues: sample.data.issues.slice(0, 3).map((issue, index) => {
    const { raised, ...rest } = issue
    return { ...rest, siteCode: `source-${index}`, owner: ['Ada', 'Bo'], status: sample.customStatuses[index].value }
  })
}
export default sample

sample.itemAttributes = (issue, source) => ({
  'data-source-code': source.siteCode,
  'data-filter-item': '',
  'data-filter-text': issue.title,
  'data-f-area': issue.area,
  class: 'site-owned-row'
})

sample.rowId = (issue) => `legacy-${issue.id}`

sample.classifier = { label: 'Action side', values: ['Internal', 'External'] }
sample.richLabels = { area: 'Source', note: 'Holding', forCall: 'For review', nextCall: 'Next review' }
sample.richData = {
  issues: [
    {
      id: 'REG-001',
      title: 'Review shared evidence',
      status: 'open',
      area: 'Delivery',
      classification: 'External',
      forCall: '2026-10-23',
      noteHtml:
        '<p>See the <a href="#evidence">evidence</a> and <code>status</code>.</p><table><thead><tr><th>Item</th><th>State</th></tr></thead><tbody><tr><td>Plan</td><td>Reviewed</td></tr></tbody></table>',
      updateHtml: '<p>Keep <strong>all</strong> rendered Markdown, including links and tables.</p>'
    }
  ]
}

sample.richData.issues[0].updates = [
  { date: '2026-10-20', text: 'Evidence requested from both review areas.' },
  { date: '2026-10-22', html: '<p>Received the <a href="#evidence">evidence</a>; awaiting joint review.</p>' }
]

sample.data.issues[2].resolved = '2026-10-22'
sample.data.issues[3].resolved = '2026-10-21'

sample.multiAreaData = {
  issues: [
    {
      id: 'MULTI-1',
      title: 'Coordinate the joint review',
      status: 'open',
      area: ['Delivery', 'Operations'],
      note: 'Both areas share this review.'
    },
    {
      id: 'MULTI-2',
      title: 'Follow up the delivery checklist',
      status: 'open',
      area: 'Delivery',
      note: 'Delivery only.'
    },
    {
      id: 'MULTI-3',
      title: 'Archive the operational review',
      status: 'done',
      area: 'Operations',
      resolved: '2026-10-22',
      note: 'Operations only.'
    }
  ]
}
sample.multiAreaAttributes = (issue) => ({
  'data-filter-item': '',
  'data-filter-text': issue.title,
  'data-f-area': [issue.area].flat().join('|')
})
