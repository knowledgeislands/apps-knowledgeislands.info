import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  checkFeatureAreas,
  type DocsPageRecord,
  type FeatureArea,
  pagesOf,
  permalinkOf
} from './verify-feature-areas.ts'

const skills = new Set(['ki-work', 'ki-next', 'ki-repo-kb'])

const page = (section: string, leaf: string): DocsPageRecord => ({
  path: `src/docs/${section}/${leaf}.md`,
  section,
  permalink: `/docs/${section}/${leaf}/`
})

const area = (overrides: Partial<FeatureArea> = {}): FeatureArea => ({
  slug: 'roadmap-lifecycle',
  title: 'Roadmap lifecycle',
  skills: ['ki-work', 'ki-next'],
  commands: ['ki batch'],
  page: '/docs/ways-of-working/roadmap-lifecycle/',
  ...overrides
})

describe('permalinkOf', () => {
  test('reads the permalink out of a frontmatter block', () => {
    assert.equal(permalinkOf('---\ntitle: T\npermalink: /docs/x/y/\norder: 1\n---\nbody'), '/docs/x/y/')
  })

  test('tolerates a quoted value', () => {
    assert.equal(permalinkOf("---\npermalink: '/docs/x/y/'\n---\n"), '/docs/x/y/')
  })

  test('is undefined without frontmatter', () => {
    assert.equal(permalinkOf('# Heading\n'), undefined)
  })
})

describe('pagesOf', () => {
  test('treats one path and a list alike', () => {
    assert.deepEqual(pagesOf(area({ page: '/docs/a/b/' })), ['/docs/a/b/'])
    assert.deepEqual(pagesOf(area({ page: ['/docs/a/b/', '/docs/a/c/'] })), ['/docs/a/b/', '/docs/a/c/'])
    assert.deepEqual(pagesOf(area({ page: undefined })), [])
  })
})

describe('checkFeatureAreas', () => {
  test('passes a crosswalk whose skills exist and whose pages are each claimed once', () => {
    const failures = checkFeatureAreas([area()], skills, [
      page('ways-of-working', 'roadmap-lifecycle'),
      page('ki', 'commands')
    ])
    assert.deepEqual(failures, [])
  })

  test('fails a skill the catalogue does not hold', () => {
    const failures = checkFeatureAreas([area({ skills: ['ki-work', 'ki-retired'] })], skills, [
      page('ways-of-working', 'roadmap-lifecycle')
    ])
    assert.equal(failures.length, 1)
    assert.match(failures[0] ?? '', /ki-retired/)
  })

  test('fails a page path that matches no Markdown page', () => {
    const failures = checkFeatureAreas([area({ page: '/docs/ways-of-working/missing/' })], skills, [
      page('ways-of-working', 'roadmap-lifecycle')
    ])
    assert.ok(failures.some((failure) => failure.includes('matches no Markdown page')))
    assert.ok(failures.some((failure) => failure.includes('no feature area claims it')))
  })

  test('fails a page in a claimed section that no area names', () => {
    const failures = checkFeatureAreas([area()], skills, [
      page('ways-of-working', 'roadmap-lifecycle'),
      page('knowledge', 'knowledge-bases')
    ])
    assert.deepEqual(failures, [
      "src/docs/knowledge/knowledge-bases.md: no feature area claims it; add its path to an area's page."
    ])
  })

  test('fails a page two areas claim', () => {
    const second = area({ slug: 'tending', title: 'Tending', skills: ['ki-repo-kb'], commands: [] })
    const failures = checkFeatureAreas([area(), second], skills, [page('ways-of-working', 'roadmap-lifecycle')])
    assert.equal(failures.length, 1)
    assert.match(failures[0] ?? '', /claimed by 2 areas \(roadmap-lifecycle, tending\)/)
  })

  test('exempts Skills pages and ignores sections outside the four', () => {
    const failures = checkFeatureAreas([area()], skills, [
      page('ways-of-working', 'roadmap-lifecycle'),
      page('skills', 'catalogue'),
      page('ki-agentic-harness', 'tuning')
    ])
    assert.deepEqual(failures, [])
  })

  test('fails a duplicate or malformed slug and a missing title', () => {
    const failures = checkFeatureAreas(
      [area(), area({ page: undefined }), area({ slug: 'Bad Slug', title: '', page: undefined })],
      skills,
      [page('ways-of-working', 'roadmap-lifecycle')]
    )
    assert.ok(failures.some((failure) => failure.includes('declared twice')))
    assert.ok(failures.some((failure) => failure.includes('kebab-case')))
    assert.ok(failures.some((failure) => failure.includes('missing title')))
  })
})
