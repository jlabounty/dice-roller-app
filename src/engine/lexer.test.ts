import { describe, it, expect } from 'vitest'
import { tokenize, LexError } from './lexer'

describe('tokenize', () => {
  it('tokenizes a basic die expression', () => {
    const tokens = tokenize('2d6')
    expect(tokens).toMatchObject([
      { type: 'number', value: 2 },
      { type: 'die', sides: 6 },
      { type: 'eof' },
    ])
  })

  it('tokenizes d20 without leading count', () => {
    expect(tokenize('d20')).toMatchObject([
      { type: 'die', sides: 20 },
      { type: 'eof' },
    ])
  })

  it('tokenizes d100 as percentile', () => {
    expect(tokenize('d100')).toMatchObject([
      { type: 'dpercentile' },
      { type: 'eof' },
    ])
  })

  it('tokenizes dF as fudge', () => {
    expect(tokenize('4dF')).toMatchObject([
      { type: 'number', value: 4 },
      { type: 'dfudge' },
      { type: 'eof' },
    ])
  })

  it('tokenizes addition', () => {
    expect(tokenize('1d20+5')).toMatchObject([
      { type: 'number', value: 1 },
      { type: 'die', sides: 20 },
      { type: 'plus' },
      { type: 'number', value: 5 },
      { type: 'eof' },
    ])
  })

  it('tokenizes keep highest (kh)', () => {
    expect(tokenize('4d6kh3')).toMatchObject([
      { type: 'number', value: 4 },
      { type: 'die', sides: 6 },
      { type: 'keepHighest' },
      { type: 'number', value: 3 },
      { type: 'eof' },
    ])
  })

  it('tokenizes keep lowest (KL)', () => {
    expect(tokenize('2d20KL1')).toMatchObject([
      { type: 'number', value: 2 },
      { type: 'die', sides: 20 },
      { type: 'keepLowest' },
      { type: 'number', value: 1 },
      { type: 'eof' },
    ])
  })

  it('tokenizes reroll (r)', () => {
    expect(tokenize('2d6r1')).toMatchObject([
      { type: 'number', value: 2 },
      { type: 'die', sides: 6 },
      { type: 'reroll' },
      { type: 'number', value: 1 },
      { type: 'eof' },
    ])
  })

  it('tokenizes reroll with lte (r≤)', () => {
    expect(tokenize('2d6r≤2')).toMatchObject([
      { type: 'number', value: 2 },
      { type: 'die', sides: 6 },
      { type: 'reroll' },
      { type: 'lte' },
      { type: 'number', value: 2 },
      { type: 'eof' },
    ])
  })

  it('tokenizes explode (!)', () => {
    expect(tokenize('3d6!')).toMatchObject([
      { type: 'number', value: 3 },
      { type: 'die', sides: 6 },
      { type: 'explode' },
      { type: 'eof' },
    ])
  })

  it('tokenizes explode compound (!!)', () => {
    expect(tokenize('2d6!!')).toMatchObject([
      { type: 'number', value: 2 },
      { type: 'die', sides: 6 },
      { type: 'explodeCompound' },
      { type: 'eof' },
    ])
  })

  it('tokenizes explode penetrating (!p)', () => {
    expect(tokenize('2d6!p')).toMatchObject([
      { type: 'number', value: 2 },
      { type: 'die', sides: 6 },
      { type: 'explodePenetrating' },
      { type: 'eof' },
    ])
  })

  it('throws on invalid character', () => {
    expect(() => tokenize('2d6@')).toThrow(LexError)
  })
})
