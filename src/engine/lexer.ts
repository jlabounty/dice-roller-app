export type Token =
  | { type: 'number'; value: number }
  | { type: 'die'; sides: number }       // d6 -> sides=6
  | { type: 'dfudge' }                   // dF
  | { type: 'dpercentile' }              // d100 (alias, but also explicit)
  | { type: 'plus' }
  | { type: 'minus' }
  | { type: 'lparen' }                   // (
  | { type: 'rparen' }                   // )
  | { type: 'keepHighest' }              // kh / KH
  | { type: 'keepLowest' }               // kl / KL
  | { type: 'dropHighest' }              // dh / DH
  | { type: 'dropLowest' }              // dl / DL
  | { type: 'rerollOnce' }              // ro
  | { type: 'reroll' }                  // r / R
  | { type: 'explodeCompound' }         // !!
  | { type: 'explodePenetrating' }      // !p
  | { type: 'explode' }                 // !
  | { type: 'minValue' }                // f (floor / min value)
  | { type: 'lte' }                     // ≤ or <=
  | { type: 'gte' }                     // ≥ or >=
  | { type: 'eof' }

export class LexError extends Error {}

const MAX_NUMBER = 10_000

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const s = input.trim()

  while (i < s.length) {
    // Skip whitespace
    if (s[i] === ' ' || s[i] === '\t') { i++; continue }

    // Unicode comparison operators
    if (s[i] === '≤') { tokens.push({ type: 'lte' }); i++; continue }
    if (s[i] === '≥') { tokens.push({ type: 'gte' }); i++; continue }

    // Two-char operators (must check before single-char)
    if (s.slice(i, i + 2) === '!!') { tokens.push({ type: 'explodeCompound' }); i += 2; continue }
    if (s.slice(i, i + 2) === '!p') { tokens.push({ type: 'explodePenetrating' }); i += 2; continue }
    if (s.slice(i, i + 2) === '<=') { tokens.push({ type: 'lte' }); i += 2; continue }
    if (s.slice(i, i + 2) === '>=') { tokens.push({ type: 'gte' }); i += 2; continue }

    // Case-insensitive two-char modifiers: kh, kl, dh, dl, ro
    const twoLower = s.slice(i, i + 2).toLowerCase()
    if (twoLower === 'kh') { tokens.push({ type: 'keepHighest' }); i += 2; continue }
    if (twoLower === 'kl') { tokens.push({ type: 'keepLowest' }); i += 2; continue }
    if (twoLower === 'ro') { tokens.push({ type: 'rerollOnce' }); i += 2; continue }

    // Single char !
    if (s[i] === '!') { tokens.push({ type: 'explode' }); i++; continue }

    // + - ( )
    if (s[i] === '+') { tokens.push({ type: 'plus' }); i++; continue }
    if (s[i] === '-') { tokens.push({ type: 'minus' }); i++; continue }
    if (s[i] === '(') { tokens.push({ type: 'lparen' }); i++; continue }
    if (s[i] === ')') { tokens.push({ type: 'rparen' }); i++; continue }

    // Die notation: d / D followed by F, % or digits
    if (s[i].toLowerCase() === 'd') {
      // Check for dh/dl (drop high/low) BEFORE treating as die
      const twoL = s.slice(i, i + 2).toLowerCase()
      if (twoL === 'dh') { tokens.push({ type: 'dropHighest' }); i += 2; continue }
      if (twoL === 'dl') { tokens.push({ type: 'dropLowest' }); i += 2; continue }

      i++ // consume 'd'
      if (i < s.length && s[i].toLowerCase() === 'f') {
        tokens.push({ type: 'dfudge' })
        i++
        continue
      }
      if (i < s.length && s[i] === '%') {
        tokens.push({ type: 'dpercentile' })
        i++
        continue
      }
      // Read digits
      let numStr = ''
      while (i < s.length && s[i] >= '0' && s[i] <= '9') { numStr += s[i++] }
      if (numStr === '') {
        throw new LexError(`Expected number after 'd' at position ${i}`)
      }
      const sides = parseInt(numStr, 10)
      if (sides > MAX_NUMBER) throw new LexError(`Die sides too large (max ${MAX_NUMBER})`)
      if (sides === 100) {
        tokens.push({ type: 'dpercentile' })
      } else {
        tokens.push({ type: 'die', sides })
      }
      continue
    }

    // Single-char modifiers (case-sensitive or case-insensitive)
    if (s[i] === 'r' || s[i] === 'R') { tokens.push({ type: 'reroll' }); i++; continue }
    if (s[i] === 'f') { tokens.push({ type: 'minValue' }); i++; continue }

    // Numbers
    if (s[i] >= '0' && s[i] <= '9') {
      let numStr = ''
      while (i < s.length && s[i] >= '0' && s[i] <= '9') { numStr += s[i++] }
      const value = parseInt(numStr, 10)
      if (value > MAX_NUMBER) throw new LexError(`Number too large (max ${MAX_NUMBER})`)
      tokens.push({ type: 'number', value })
      continue
    }

    throw new LexError(`Unexpected character '${s[i]}' at position ${i}`)
  }

  tokens.push({ type: 'eof' })
  return tokens
}
