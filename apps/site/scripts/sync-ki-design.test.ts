import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { buildSymbolSnapshot, extractPlate, PLATE_END, PLATE_START, type UpstreamSymbol } from './sync-ki-design.ts'

const ref = '002a623d0b39d50a1222660acaffd911507f4853'
const categories = ['geography', 'structure', 'role']

const entry = (overrides: Partial<UpstreamSymbol>): UpstreamSymbol => ({
  id: 'island',
  name: 'Island',
  meaning: 'A body of knowledge with its own shores.',
  status: 'canon',
  category: 'geography',
  icon: 'island',
  ...overrides
})

describe('buildSymbolSnapshot', () => {
  test('publishes canon and decided entries and withholds every proposal', () => {
    const snapshot = buildSymbolSnapshot(
      [
        entry({}),
        entry({ id: 'port', name: 'Port', status: 'decided', category: 'structure', icon: 'port' }),
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
