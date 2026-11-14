import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  ALLOWED_NAMES,
  checkPage,
  inventoryTokens,
  skillTokens,
  stripFences,
  stripSourcePaths
} from './verify-skill-names.ts'

const catalogue = new Set(['ki-work', 'ki-delegation', 'ki-repo-kb'])
const inventory = new Set(['ki-meta', 'ki-checkpoint'])

describe('stripFences', () => {
  test('removes fenced blocks and keeps the prose around them', () => {
    const body = 'Before `ki-work`.\n\n```toml\n[skills.ki-gone]\n```\n\nAfter.\n'
    assert.equal(stripFences(body), 'Before `ki-work`.\n\n\n\nAfter.\n')
  })

  test('matches a tilde fence and a longer fence only with its own closer', () => {
    const body = '~~~\nki-gone\n~~~\nkept\n````\n```\nki-also-gone\n```\n````\n'
    assert.equal(stripFences(body).includes('ki-gone'), false)
    assert.equal(stripFences(body).includes('kept'), true)
  })
})

describe('stripSourcePaths', () => {
  test('skips a pinned source path but still reads the rest of the frontmatter and the body', () => {
    const body = [
      '---',
      'title: Using ki-work',
      'sources:',
      '  - repository: knowledgeislands/ki-agent-backpack',
      '    path: skills/change-management/ki-gone/SKILL.md',
      '    ref: 0000000000000000000000000000000000000000',
      '---',
      '',
      '    path: ki-kept in an indented body line',
      ''
    ].join('\n')
    assert.equal(stripSourcePaths(body).includes('ki-gone'), false)
    assert.deepEqual(skillTokens(body), ['ki-work', 'ki-agent-backpack', 'ki-kept'])
  })
})

describe('skillTokens', () => {
  test('finds tokens in prose and in inline code, once each, outside fences', () => {
    const body = 'Use `ki-work`, then ki-work again; see `ki-delegation`.\n\n```\nki-fenced\n```\n'
    assert.deepEqual(skillTokens(body), ['ki-work', 'ki-delegation'])
  })

  test('does not match a glob, a bare prefix or a longer word', () => {
    assert.deepEqual(skillTokens('ki- and ki-work- and `ki-repo-*` and wiki-work and ki-Work'), [])
  })
})

describe('inventoryTokens', () => {
  test('collects every token the inventory text uses', () => {
    assert.deepEqual(
      [...inventoryTokens('legacy .ki-meta/ dirs; the ki-checkpoint standard; ki-meta again')],
      ['ki-meta', 'ki-checkpoint']
    )
  })
})

describe('checkPage', () => {
  test('passes catalogue skills, inventory tokens and allowed names', () => {
    const body = '`ki-work`, `.ki-meta/`, `ki-agent-backpack`, `[skills.ki-self]`'
    assert.deepEqual(checkPage('src/docs/x.md', body, catalogue, inventory), [])
  })

  test('fails a retired skill name', () => {
    const failures = checkPage('src/docs/x.md', 'Run `ki-delegate` to hand off.', catalogue, inventory)
    assert.deepEqual(failures, [
      'src/docs/x.md: names "ki-delegate", which is not a catalogue skill, a CLI inventory token or an allowed name.'
    ])
  })

  test('ignores the same name inside a fenced block', () => {
    assert.deepEqual(checkPage('src/docs/x.md', '```\nki-delegate\n```\n', catalogue, inventory), [])
  })

  test('honours a caller-supplied allow-list over the default', () => {
    const failures = checkPage('src/docs/x.md', '`ki-self`', catalogue, inventory, new Map())
    assert.equal(failures.length, 1)
    assert.ok(ALLOWED_NAMES.has('ki-self'))
  })
})
