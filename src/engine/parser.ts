import { tokenize, Token, LexError } from './lexer'
import type { DiceExpression, DiceModifier, DieType, CompareCondition } from '../types/dice'

export class ParseError extends Error {}

function tokenDisplay(type: Token['type'] | string): string {
  const map: Partial<Record<Token['type'], string>> = {
    lt: '<', gt: '>', eq: '=',
    lte: '≤', gte: '≥',
    plus: '+', minus: '-',
    lparen: '(', rparen: ')',
    eof: 'end of input',
  }
  return map[type as Token['type']] ?? type
}

class Parser {
  private tokens: Token[]
  private pos = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private peek(): Token { return this.tokens[this.pos] }
  private consume(): Token { return this.tokens[this.pos++] }

  private expect(type: Token['type']): Token {
    const t = this.peek()
    if (t.type !== type) throw new ParseError(`Expected ${tokenDisplay(type)} but got ${tokenDisplay(t.type)}`)
    return this.consume()
  }

  parse(): DiceExpression {
    const expr = this.parseExpression()
    if (this.peek().type !== 'eof') {
      throw new ParseError(`Unexpected token: ${tokenDisplay(this.peek().type)}`)
    }
    return expr
  }

  private parseExpression(): DiceExpression {
    let left = this.parseTerm()
    while (this.peek().type === 'plus' || this.peek().type === 'minus') {
      const op = this.consume()
      const right = this.parseTerm()
      left = op.type === 'plus'
        ? { kind: 'add', left, right }
        : { kind: 'subtract', left, right }
    }
    return left
  }

  private parseTerm(): DiceExpression {
    const t = this.peek()

    // Leading number - could be coefficient for a dice group or a standalone constant
    if (t.type === 'number') {
      this.consume()
      const num = (t as Extract<Token, { type: 'number' }>).value

      // If followed by a die token, it's the count for a dice group
      const next = this.peek()
      if (next.type === 'die' || next.type === 'dfudge' || next.type === 'dpercentile') {
        return this.parseDiceGroup(num)
      }
      // Otherwise it's a constant
      return { kind: 'constant', value: num }
    }

    // Die token without leading number (implicit count of 1)
    if (t.type === 'die' || t.type === 'dfudge' || t.type === 'dpercentile') {
      return this.parseDiceGroup(1)
    }

    // Parenthesized expression
    if (t.type === 'lparen') {
      this.consume()
      const inner = this.parseExpression()
      this.expect('rparen')
      return inner
    }

    // Minus followed by number = negative constant
    if (t.type === 'minus') {
      this.consume()
      const numTok = this.expect('number') as Extract<Token, { type: 'number' }>
      return { kind: 'constant', value: -numTok.value }
    }

    throw new ParseError(`Unexpected token: ${tokenDisplay(t.type)}`)
  }

  private parseDiceGroup(count: number): DiceExpression {
    const dieTok = this.consume()
    let dieType: DieType
    if (dieTok.type === 'dfudge') {
      dieType = { kind: 'fudge' }
    } else if (dieTok.type === 'dpercentile') {
      dieType = { kind: 'percentile' }
    } else {
      dieType = { kind: 'numeric', sides: (dieTok as Extract<Token, { type: 'die' }>).sides }
    }

    const modifiers: DiceModifier[] = []
    // Greedily parse modifiers until we hit +, -, or eof
    while (true) {
      const next = this.peek()
      if (
        next.type === 'plus' ||
        next.type === 'minus' ||
        next.type === 'eof' ||
        next.type === 'number' ||
        next.type === 'die' ||
        next.type === 'dfudge' ||
        next.type === 'dpercentile' ||
        next.type === 'rparen' ||
        next.type === 'lt' ||
        next.type === 'gt' ||
        next.type === 'eq' ||
        next.type === 'lte' ||
        next.type === 'gte'
      ) break

      if (next.type === 'keepHighest') {
        this.consume()
        const n = this.parseOptionalNumber(1)
        modifiers.push({ type: 'keepHighest', count: n })
        continue
      }
      if (next.type === 'keepLowest') {
        this.consume()
        const n = this.parseOptionalNumber(1)
        modifiers.push({ type: 'keepLowest', count: n })
        continue
      }
      if (next.type === 'dropHighest') {
        this.consume()
        const n = this.parseOptionalNumber(1)
        modifiers.push({ type: 'dropHighest', count: n })
        continue
      }
      if (next.type === 'dropLowest') {
        this.consume()
        const n = this.parseOptionalNumber(1)
        modifiers.push({ type: 'dropLowest', count: n })
        continue
      }
      if (next.type === 'reroll') {
        this.consume()
        const cond = this.parseCompareCondition()
        modifiers.push({ type: 'reroll', condition: cond, once: false })
        continue
      }
      if (next.type === 'rerollOnce') {
        this.consume()
        const cond = this.parseCompareCondition()
        modifiers.push({ type: 'reroll', condition: cond, once: true })
        continue
      }
      if (next.type === 'explodeCompound') {
        this.consume()
        modifiers.push({ type: 'explodeCompound' })
        continue
      }
      if (next.type === 'explodePenetrating') {
        this.consume()
        modifiers.push({ type: 'explodePenetrating' })
        continue
      }
      if (next.type === 'explodeEscalating') {
        this.consume()
        modifiers.push({ type: 'explodeEscalating' })
        continue
      }
      if (next.type === 'explode') {
        this.consume()
        modifiers.push({ type: 'explode' })
        continue
      }
      if (next.type === 'minValue') {
        this.consume()
        const n = this.parseOptionalNumber(1)
        modifiers.push({ type: 'minValue', value: n })
        continue
      }
      // Unknown modifier token — stop consuming
      break
    }

    return { kind: 'group', count, dieType, modifiers }
  }

  private parseCompareCondition(): CompareCondition {
    const t = this.peek()
    if (t.type === 'lte') {
      this.consume()
      const n = this.expect('number') as Extract<Token, { type: 'number' }>
      return { op: 'lte', value: n.value }
    }
    if (t.type === 'gte') {
      this.consume()
      const n = this.expect('number') as Extract<Token, { type: 'number' }>
      return { op: 'gte', value: n.value }
    }
    if (t.type === 'lt') {
      this.consume()
      const n = this.expect('number') as Extract<Token, { type: 'number' }>
      return { op: 'lt', value: n.value }
    }
    if (t.type === 'gt') {
      this.consume()
      const n = this.expect('number') as Extract<Token, { type: 'number' }>
      return { op: 'gt', value: n.value }
    }
    if (t.type === 'eq') {
      this.consume()
      const n = this.expect('number') as Extract<Token, { type: 'number' }>
      return { op: 'eq', value: n.value }
    }
    // Default: equals the number (no explicit op)
    const n = this.expect('number') as Extract<Token, { type: 'number' }>
    return { op: 'eq', value: n.value }
  }

  private parseOptionalNumber(defaultVal: number): number {
    const t = this.peek()
    if (t.type === 'number') {
      this.consume()
      return (t as Extract<Token, { type: 'number' }>).value
    }
    return defaultVal
  }
}

export type ParseResult =
  | { ok: true; expr: DiceExpression }
  | { ok: false; error: string }

export function parse(input: string): ParseResult {
  if (!input.trim()) return { ok: false, error: 'Empty expression' }
  try {
    const tokens = tokenize(input)
    const parser = new Parser(tokens)
    const expr = parser.parse()
    return { ok: true, expr }
  } catch (e) {
    if (e instanceof LexError || e instanceof ParseError) {
      return { ok: false, error: e.message }
    }
    return { ok: false, error: String(e) }
  }
}
