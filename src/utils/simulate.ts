import { parse } from '../engine/parser'
import { evaluate } from '../engine/evaluator'

export interface SimulationResult {
  trials: number
  min: number
  max: number
  mean: number
  median: number
  stdev: number
  buckets: { value: number; count: number; pct: number }[]
  clipped: boolean
}

const MAX_TRIALS = 100_000

export function runSimulation(formula: string, trials: number): SimulationResult | { error: string } {
  const parseResult = parse(formula)
  if (!parseResult.ok) return { error: parseResult.error }

  const n = Math.min(Math.max(1, trials), MAX_TRIALS)
  const totals = new Array<number>(n)

  for (let i = 0; i < n; i++) {
    totals[i] = evaluate(parseResult.expr, formula).total
  }

  // Stats
  let sum = 0
  let min = totals[0]
  let max = totals[0]
  for (let i = 0; i < n; i++) {
    sum += totals[i]
    if (totals[i] < min) min = totals[i]
    if (totals[i] > max) max = totals[i]
  }
  const mean = sum / n

  let variance = 0
  for (let i = 0; i < n; i++) {
    const d = totals[i] - mean
    variance += d * d
  }
  const stdev = Math.sqrt(variance / n)

  const sorted = totals.slice().sort((a, b) => a - b)
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)]

  // Build frequency map
  const freq = new Map<number, number>()
  for (let i = 0; i < n; i++) {
    freq.set(totals[i], (freq.get(totals[i]) ?? 0) + 1)
  }

  const allBuckets = Array.from(freq.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([value, count]) => ({ value, count, pct: count / n }))

  // Clip tail at 99.9% cumulative mass to keep exploding dice charts usable
  let cumulative = 0
  let clipIndex = allBuckets.length
  for (let i = 0; i < allBuckets.length; i++) {
    cumulative += allBuckets[i].pct
    if (cumulative >= 0.999) {
      clipIndex = i + 1
      break
    }
  }

  const clipped = clipIndex < allBuckets.length
  const buckets = allBuckets.slice(0, clipIndex)

  return { trials: n, min, max, mean, median, stdev, buckets, clipped }
}
