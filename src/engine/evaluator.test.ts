import { describe, it, expect } from 'vitest'
import { evaluate } from './evaluator'
import { parse } from './parser'

// Seeded deterministic random sequences
function makeRandom(...values: number[]): () => number {
  let i = 0
  return () => values[i++ % values.length]
}

function roll(expr: string, ...randomValues: number[]) {
  const r = parse(expr)
  if (!r.ok) throw new Error(`Parse failed: ${r.error}`)
  return evaluate(r.expr, expr, makeRandom(...randomValues))
}

describe('evaluate', () => {
  it('rolls a single die', () => {
    // random() returns 0.5, ceil(0.5 * 6) = 3
    const result = roll('1d6', 0.5)
    expect(result.total).toBe(3)
    expect(result.groups).toHaveLength(1)
    expect(result.groups[0].allRolls).toEqual([3])
  })

  it('rolls multiple dice and sums them', () => {
    // Two d6: random returns 0.5 (→3), 1.0 (→6)
    const result = roll('2d6', 0.5, 1.0)
    expect(result.total).toBe(9)
    expect(result.groups[0].allRolls).toEqual([3, 6])
  })

  it('applies constant bonus', () => {
    const result = roll('1d6+5', 0.5) // d6=3, +5 = 8
    expect(result.total).toBe(8)
  })

  it('applies constant penalty', () => {
    const result = roll('1d6-2', 1.0) // d6=6, -2 = 4
    expect(result.total).toBe(4)
  })

  it('keep highest - drops lowest', () => {
    // 4d6kh3: rolls [1,2,5,4] (via 1/6, 2/6, 5/6, 4/6 * 6 ceil)
    // Sorted ascending: [1,2,4,5], keep top 3: [2,4,5], drop index 0 (value 1)
    const result = roll('4d6kh3', 1/6, 2/6, 5/6, 4/6)
    expect(result.groups[0].droppedIndices.size).toBe(1)
    expect(result.total).toBe(11) // 2+5+4=11
  })

  it('keep lowest', () => {
    // 2d20kl1: rolls via 0.5 (→10) and 0.9 (→18), keep lowest → 10
    const result = roll('2d20kl1', 0.5, 0.9)
    expect(result.total).toBe(10)
    expect(result.groups[0].droppedIndices.size).toBe(1)
  })

  it('reroll ones', () => {
    // 1d6r1: first roll = 1 (should reroll), second = 4
    // random(1/6) → ceil(1/6*6) = 1, then random(4/6) → 4
    const result = roll('1d6r1', 1/6, 4/6)
    expect(result.total).toBe(4)
  })

  it('fudge dice produce -1, 0, or +1', () => {
    // random 0.1 → ceil(0.6) = 1 → -1 (fudge)
    const result = roll('1dF', 0.1)
    expect([-1, 0, 1]).toContain(result.total)
  })

  it('exploding dice add more rolls', () => {
    // 1d6!: roll 1.0 → 6 (max, explode), then 0.5 → 3, total = 9
    const result = roll('1d6!', 1.0, 0.5)
    expect(result.total).toBe(9)
    expect(result.groups[0].allRolls).toHaveLength(2)
  })

  it('multi-group expression', () => {
    // 2d6+1d4: d6s get 3,3; d4 gets 2 → total 8
    const result = roll('2d6+1d4', 0.5, 0.5, 0.5)
    expect(result.total).toBe(8) // 3+3+2
    expect(result.groups).toHaveLength(2)
  })
})
