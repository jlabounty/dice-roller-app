import type { RollResult, DiceGroupResult, DieType } from '../types/dice'

function dieLabel(dt: DieType): string {
  if (dt.kind === 'fudge') return 'dF'
  if (dt.kind === 'percentile') return 'd%'
  return `d${dt.sides}`
}

/** A single non-exploding die (or compound-exploded die). */
export interface SingleItem {
  kind: 'single'
  text: string
  dropped: boolean
  /** Die was augmented by compound explode (!!). */
  compoundExploded: boolean
}

/** A member within an explode chain. */
export interface ChainMember {
  text: string
  /** This member also triggered the next die in the chain (all except the last). */
  isSubTrigger: boolean
}

/**
 * A group of dice linked by an explosion.
 * members[0] is the original triggering die; members[1..] are the extra dice.
 */
export interface ChainItem {
  kind: 'chain'
  /** True if the triggering die was dropped by a keep/drop modifier. */
  dropped: boolean
  members: ChainMember[]
}

export type BreakdownItem = SingleItem | ChainItem

export interface GroupBreakdown {
  label: string
  items: BreakdownItem[]
  subtotal: number
}

function buildItems(g: DiceGroupResult): BreakdownItem[] {
  // Build a set of all indices that appear as extras in any chain
  const extraIndices = new Set<number>()
  for (const extras of g.explodeChains.values()) {
    extras.forEach((idx) => extraIndices.add(idx))
  }

  const items: BreakdownItem[] = []

  for (let idx = 0; idx < g.allRolls.length; idx++) {
    // Skip extra dice — they'll be rendered as part of their chain
    if (extraIndices.has(idx)) continue

    const val = g.allRolls[idx]
    const dropped = g.droppedIndices.has(idx)

    if (g.explodeChains.has(idx)) {
      // This die triggered a chain
      const extras = g.explodeChains.get(idx)!
      const members: ChainMember[] = [
        // The triggering die itself — it's a sub-trigger if the chain has ≥1 extra
        { text: String(val), isSubTrigger: extras.length > 0 },
        // Each extra: sub-trigger if it's not the last in the chain
        ...extras.map((extraIdx, i) => ({
          text: String(g.allRolls[extraIdx]),
          isSubTrigger: i < extras.length - 1,
        })),
      ]
      items.push({ kind: 'chain', dropped, members })
    } else if (g.compoundExplodedIndices.has(idx)) {
      items.push({ kind: 'single', text: String(val), dropped, compoundExploded: true })
    } else {
      items.push({ kind: 'single', text: String(val), dropped, compoundExploded: false })
    }
  }

  return items
}

export function formatResult(result: RollResult): { groups: GroupBreakdown[]; total: number } {
  const groups: GroupBreakdown[] = result.groups.map((g: DiceGroupResult) => ({
    label: `${g.allRolls.length}${dieLabel(g.dieType)}`,
    items: buildItems(g),
    subtotal: g.subtotal,
  }))
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
