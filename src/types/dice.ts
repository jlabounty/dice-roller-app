export type DieType =
  | { kind: 'numeric'; sides: number }
  | { kind: 'fudge' }
  | { kind: 'percentile' }

export type CompareCondition =
  | { op: 'eq'; value: number }
  | { op: 'lte'; value: number }
  | { op: 'gte'; value: number }

export type DiceModifier =
  | { type: 'keepHighest'; count: number }
  | { type: 'keepLowest'; count: number }
  | { type: 'dropHighest'; count: number }
  | { type: 'dropLowest'; count: number }
  | { type: 'reroll'; condition: CompareCondition; once: boolean }
  | { type: 'explode' }
  | { type: 'explodeCompound' }
  | { type: 'explodePenetrating' }
  | { type: 'minValue'; value: number }

export type DiceExpression =
  | { kind: 'group'; count: number; dieType: DieType; modifiers: DiceModifier[] }
  | { kind: 'constant'; value: number }
  | { kind: 'add'; left: DiceExpression; right: DiceExpression }
  | { kind: 'subtract'; left: DiceExpression; right: DiceExpression }

export interface DiceGroupResult {
  dieType: DieType
  /** Every individual die result (including exploded dice as separate entries) */
  allRolls: number[]
  /** Indices from allRolls that were dropped (for strikethrough display) */
  droppedIndices: Set<number>
  /** Sum of kept dice */
  subtotal: number
}

export interface RollResult {
  id: string
  expression: string
  total: number
  groups: DiceGroupResult[]
  timestamp: number
}

export interface Favorite {
  id: string
  expression: string
  label: string
  category: string
  createdAt: number
}

/** Die button definitions for the UI */
export interface DieButton {
  label: string
  dieType: DieType
  colorClass: string
}

export const DIE_BUTTONS: DieButton[] = [
  { label: 'dN',   dieType: { kind: 'numeric', sides: 0 },  colorClass: 'bg-dice-dn' },
  { label: 'd100', dieType: { kind: 'percentile' },          colorClass: 'bg-dice-d100' },
  { label: 'd20',  dieType: { kind: 'numeric', sides: 20 },  colorClass: 'bg-dice-d20' },
  { label: 'd12',  dieType: { kind: 'numeric', sides: 12 },  colorClass: 'bg-dice-d12' },
  { label: 'd10',  dieType: { kind: 'numeric', sides: 10 },  colorClass: 'bg-dice-d10' },
  { label: 'd8',   dieType: { kind: 'numeric', sides: 8 },   colorClass: 'bg-dice-d8' },
  { label: 'd6',   dieType: { kind: 'numeric', sides: 6 },   colorClass: 'bg-dice-d6' },
  { label: 'd4',   dieType: { kind: 'numeric', sides: 4 },   colorClass: 'bg-dice-d4' },
  { label: 'd3',   dieType: { kind: 'numeric', sides: 3 },   colorClass: 'bg-dice-d3' },
  { label: 'd2',   dieType: { kind: 'numeric', sides: 2 },   colorClass: 'bg-dice-d2' },
  { label: 'dF',   dieType: { kind: 'fudge' },               colorClass: 'bg-dice-df' },
]
