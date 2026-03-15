import { describe, it, expect } from 'vitest'
import { parse } from './parser'

describe('parse', () => {
  it('parses a basic die roll', () => {
    const r = parse('2d6')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.expr).toEqual({
      kind: 'group',
      count: 2,
      dieType: { kind: 'numeric', sides: 6 },
      modifiers: [],
    })
  })

  it('parses implicit count of 1', () => {
    const r = parse('d20')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.expr).toMatchObject({ kind: 'group', count: 1, dieType: { kind: 'numeric', sides: 20 } })
  })

  it('parses addition', () => {
    const r = parse('1d20+5')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.expr).toMatchObject({
      kind: 'add',
      left: { kind: 'group', count: 1, dieType: { kind: 'numeric', sides: 20 } },
      right: { kind: 'constant', value: 5 },
    })
  })

  it('parses subtraction', () => {
    const r = parse('2d8-3')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.expr).toMatchObject({ kind: 'subtract' })
  })

  it('parses multi-group expression', () => {
    const r = parse('2d6+1d4+3')
    expect(r.ok).toBe(true)
  })

  it('parses keep highest modifier', () => {
    const r = parse('4d6kh3')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.expr).toMatchObject({
      kind: 'group',
      count: 4,
      modifiers: [{ type: 'keepHighest', count: 3 }],
    })
  })

  it('parses keep lowest modifier', () => {
    const r = parse('2d20kl1')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.expr).toMatchObject({
      kind: 'group',
      modifiers: [{ type: 'keepLowest', count: 1 }],
    })
  })

  it('parses reroll modifier', () => {
    const r = parse('2d6r1')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.expr).toMatchObject({
      kind: 'group',
      modifiers: [{ type: 'reroll', condition: { op: 'eq', value: 1 } }],
    })
  })

  it('parses reroll with lte condition', () => {
    const r = parse('2d6r≤2')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.expr).toMatchObject({
      kind: 'group',
      modifiers: [{ type: 'reroll', condition: { op: 'lte', value: 2 } }],
    })
  })

  it('parses explode modifier', () => {
    const r = parse('3d6!')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.expr).toMatchObject({
      kind: 'group',
      modifiers: [{ type: 'explode' }],
    })
  })

  it('parses fudge dice', () => {
    const r = parse('4dF')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.expr).toMatchObject({ kind: 'group', dieType: { kind: 'fudge' } })
  })

  it('parses percentile dice', () => {
    const r = parse('d100')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.expr).toMatchObject({ kind: 'group', dieType: { kind: 'percentile' } })
  })

  it('returns error for empty input', () => {
    const r = parse('')
    expect(r.ok).toBe(false)
  })

  it('returns error for invalid input', () => {
    const r = parse('abc')
    expect(r.ok).toBe(false)
  })
})
