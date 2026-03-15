import type { RollResult, DiceGroupResult, DieType } from '../types/dice'

function dieLabel(dt: DieType): string {
  if (dt.kind === 'fudge') return 'dF'
  if (dt.kind === 'percentile') return 'd%'
  return `d${dt.sides}`
}

export interface BreakdownPart {
  text: string
  dropped: boolean
}

export interface GroupBreakdown {
  label: string
  parts: BreakdownPart[]
  subtotal: number
}

export function formatResult(result: RollResult): { groups: GroupBreakdown[]; total: number } {
  const groups: GroupBreakdown[] = result.groups.map((g: DiceGroupResult) => {
    const parts: BreakdownPart[] = g.allRolls.map((v, idx) => ({
      text: String(v),
      dropped: g.droppedIndices.has(idx),
    }))
    return {
      label: `${g.allRolls.length}${dieLabel(g.dieType)}`,
      parts,
      subtotal: g.subtotal,
    }
  })
  return { groups, total: result.total }
}

/** Relative time string */
export function relativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
