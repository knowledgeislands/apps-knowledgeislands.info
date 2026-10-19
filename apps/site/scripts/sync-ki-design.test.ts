import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import type { ArcadiaSnapshot } from './sync-arcadia-snapshot.ts'
import {
  ARCHIPELAGO,
  archipelagoFromSnapshot,
  buildSymbolSnapshot,
  extractPlate,
  ISLAND_GLYPHS,
  islandGlyph,
  PAINTING,
  PLATE_END,
  PLATE_START,
  paintingFallback,
  planPainting,
  renderArchipelagoManifest,
  type UpstreamSymbol
} from './sync-ki-design.ts'

const ref = '002a623d0b39d50a1222660acaffd911507f4853'
const categories = ['geography', 'structure', 'role']

const entry = (overrides: Partial<UpstreamSymbol>): UpstreamSymbol => ({
  id: 'island',
  name: 'Island',
  meaning: 'A body of knowledge with its own shores.',
  status: 'official',
  category: 'geography',
  icon: 'island',
  ...overrides
})

describe('buildSymbolSnapshot', () => {
  test('publishes official and agreed entries and withholds every proposal', () => {
    const snapshot = buildSymbolSnapshot(
      [
        entry({}),
        entry({ id: 'port', name: 'Port', status: 'agreed', category: 'structure', icon: 'port' }),
        entry({ id: 'workshop', name: 'Workshop', status: 'proposed', category: 'structure' }),
        entry({ id: 'role-steward', name: 'Steward', status: 'proposed', category: 'role' })
      ],
      categories,
      ref
    )
    assert.deepEqual(snapshot.counts, { upstream: 4, published: 2, withheldProposed: 2 })
    assert.deepEqual(
      snapshot.categories.map((c) => [c.id, c.symbols.map((s) => s.id)]),
      [
        ['geography', ['island']],
        ['structure', ['port']]
      ]
    )
  })

  test('drops a category whose entries are all proposed', () => {
    const snapshot = buildSymbolSnapshot(
      [entry({}), entry({ id: 'role-scout', status: 'proposed', category: 'role' })],
      categories,
      ref
    )
    assert.equal(
      snapshot.categories.some((c) => c.id === 'role'),
      false
    )
  })

  test('leaves upstream notes behind', () => {
    const snapshot = buildSymbolSnapshot([entry({ notes: 'Open question naming a proposal.' })], categories, ref)
    assert.equal('notes' in snapshot.categories[0].symbols[0], false)
  })

  test('records the source it was taken from', () => {
    const snapshot = buildSymbolSnapshot([entry({})], categories, ref)
    assert.deepEqual(snapshot.source, {
      repository: 'knowledgeislands/ki-design',
      path: 'packages/symbols/src/symbols.ts',
      ref
    })
  })

  test('refuses what it does not recognise', () => {
    assert.throws(() => buildSymbolSnapshot([entry({ status: 'rumoured' })], categories, ref), /unknown status/)
    assert.throws(() => buildSymbolSnapshot([entry({ category: 'weather' })], categories, ref), /unknown category/)
    assert.throws(() => buildSymbolSnapshot([entry({}), entry({})], categories, ref), /duplicate/)
    assert.throws(() => buildSymbolSnapshot([entry({ meaning: ' ' })], categories, ref), /no meaning/)
    assert.throws(() => buildSymbolSnapshot([entry({})], categories, 'main'), /40-character commit/)
    assert.throws(() => buildSymbolSnapshot([entry({ status: 'proposed' })], categories, ref), /empty library/)
  })
})

describe('extractPlate', () => {
  test('returns the one svg between the markers', () => {
    const html = `<p>before</p>\n${PLATE_START}\n<svg viewBox="0 0 1 1"><g/></svg>\n${PLATE_END}\n<p>after</p>`
    assert.equal(extractPlate(html), '<svg viewBox="0 0 1 1"><g/></svg>')
  })

  test('refuses a preview without the markers or without an svg between them', () => {
    assert.throws(() => extractPlate('<svg/>'), /markers were not found/)
    assert.throws(() => extractPlate(`${PLATE_START}<p>no map</p>${PLATE_END}`), /not one <svg>/)
  })
})

describe('planPainting', () => {
  test('plans AVIF and WebP at every width and one JPEG fallback, keeping the aspect ratio', () => {
    const plan = planPainting(PAINTING.width, PAINTING.height)
    assert.deepEqual(
      plan.map((v) => `${v.format}@${v.width}x${v.height}`),
      [
        'avif@1672x941',
        'avif@960x540',
        'avif@480x270',
        'webp@1672x941',
        'webp@960x540',
        'webp@480x270',
        'jpeg@1672x941'
      ]
    )
    assert.equal(paintingFallback(plan), '/assets/images/ki-design/arcadia/arcadia-painting-1672.jpg')
  })

  test('refuses to upscale a smaller source', () => {
    assert.throws(() => planPainting(1200, 675), /would upscale/)
  })

  test('pins the painting to a commit and records its licence state', () => {
    assert.match(PAINTING.ref, /^[0-9a-f]{40}$/)
    assert.match(PAINTING.licence, /KI-DESIGN-ART-002/)
  })
})

const snapshot = (roles: string[]): ArcadiaSnapshot => ({
  source: {
    repository: 'knowledgeislands/ki-principal',
    path: 'Admin/Governance/Known Lands.md',
    roster: '.ki.toml',
    ref: 'df270aa2f24c95be72205403c94d3d6b63e20602'
  },
  charted: '2026-10-19',
  islands: roles.map((role, i) => ({
    name: `island-${i}`,
    repository: `https://github.com/knowledgeislands/island-${i}`,
    role,
    concern: `Concern ${i}`
  }))
})

describe('archipelagoFromSnapshot', () => {
  test('links every island to its repository, titled with its role and concern, in snapshot order', () => {
    const archipelago = archipelagoFromSnapshot(snapshot(['Capital', 'Tool', 'MCP', 'Capability']))
    assert.equal(archipelago.name, 'The islands of Arcadia, charted 2026-10-19')
    assert.deepEqual(
      archipelago.islands.map((i) => [i.id, i.href, i.glyph, i.title, i.capital ?? false]),
      [
        ['island-0', 'https://github.com/knowledgeislands/island-0', 'capital', 'island-0 — Capital · Concern 0', true],
        ['island-1', 'https://github.com/knowledgeislands/island-1', 'workshop', 'island-1 — Tool · Concern 1', false],
        ['island-2', 'https://github.com/knowledgeislands/island-2', 'causeway', 'island-2 — MCP · Concern 2', false],
        [
          'island-3',
          'https://github.com/knowledgeislands/island-3',
          'island',
          'island-3 — Capability · Concern 3',
          false
        ]
      ]
    )
  })

  test('refuses a snapshot without exactly one Capital', () => {
    assert.throws(() => archipelagoFromSnapshot(snapshot(['Tool'])), /0 Capitals/)
    assert.throws(() => archipelagoFromSnapshot(snapshot(['Capital', 'Capital'])), /2 Capitals/)
  })

  test('types an island by role, falling back to the island glyph', () => {
    assert.equal(islandGlyph('Capital'), 'capital')
    assert.equal(islandGlyph('Standards'), ISLAND_GLYPHS.default)
  })
})

describe('renderArchipelagoManifest', () => {
  test('is a generated JSON5 file naming the renderer, the snapshot and the ref', () => {
    const text = renderArchipelagoManifest({
      source: { repository: 'knowledgeislands/ki-design', path: ARCHIPELAGO.renderer, ref },
      drawnFrom: { path: ARCHIPELAGO.snapshot, ref, charted: '2026-10-19', islands: ['a'] },
      glyphs: ISLAND_GLYPHS,
      files: { wide: ARCHIPELAGO.layouts.wide.file, tall: ARCHIPELAGO.layouts.tall.file }
    })
    assert.match(text, /GENERATED FILE/)
    assert.match(text, new RegExp(`Drawn at ${ref}\\.`))
    assert.equal(JSON.parse(text.slice(text.indexOf('{'))).source.path, 'packages/hexmap/src/archipelago.ts')
  })
})
