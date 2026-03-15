import type {
  DiceExpression,
  DiceModifier,
  DieType,
  CompareCondition,
  DiceGroupResult,
  RollResult,
} from '../types/dice'

const MAX_EXPLODE = 100
const MAX_REROLL = 100

export type RandomFn = () => number

function rollDie(dieType: DieType, random: RandomFn): number {
  if (dieType.kind === 'fudge') {
    const r = Math.ceil(random() * 6)
    return r <= 2 ? -1 : r <= 4 ? 0 : 1
  }
  if (dieType.kind === 'percentile') {
    return Math.ceil(random() * 100)
  }
  return Math.ceil(random() * dieType.sides)
}

function maxSides(dieType: DieType): number {
  if (dieType.kind === 'fudge') return 1
  if (dieType.kind === 'percentile') return 100
  return dieType.sides
}

function matchesCondition(value: number, cond: CompareCondition): boolean {
  if (cond.op === 'eq') return value === cond.value
  if (cond.op === 'lte') return value <= cond.value
  return value >= cond.value
}

function rollGroup(
  count: number,
  dieType: DieType,
  modifiers: DiceModifier[],
  random: RandomFn,
): DiceGroupResult {
  // Roll base dice, applying reroll modifier inline
  const rerollMod = modifiers.find((m) => m.type === 'reroll') as
    | Extract<DiceModifier, { type: 'reroll' }>
    | undefined

  const baseRolls: number[] = []
  for (let i = 0; i < count; i++) {
    let val = rollDie(dieType, random)
    if (rerollMod) {
      let attempts = 0
      while (matchesCondition(val, rerollMod.condition) && attempts < MAX_REROLL) {
        val = rollDie(dieType, random)
        attempts++
        if (rerollMod.once) break
      }
    }
    baseRolls.push(val)
  }

  // Apply exploding modifiers — these ADD entries to allRolls
  const allRolls: number[] = [...baseRolls]
  const explodeChains = new Map<number, number[]>()
  const compoundExplodedIndices = new Set<number>()

  const explodeMod = modifiers.find(
    (m) => m.type === 'explode' || m.type === 'explodeCompound' || m.type === 'explodePenetrating',
  ) as Extract<DiceModifier, { type: 'explode' | 'explodeCompound' | 'explodePenetrating' }> | undefined

  if (explodeMod) {
    const max = maxSides(dieType)
    if (explodeMod.type === 'explodeCompound') {
      // Accumulate into a single die value per original die
      for (let i = 0; i < baseRolls.length; i++) {
        let extra = baseRolls[i]
        let accumulated = extra
        let attempts = 0
        while (extra === max && attempts < MAX_EXPLODE) {
          extra = rollDie(dieType, random)
          accumulated += extra
          attempts++
        }
        if (accumulated !== baseRolls[i]) compoundExplodedIndices.add(i)
        allRolls[i] = accumulated
      }
    } else {
      // explode / explodePenetrating: add extra dice as new entries, grouped per trigger
      const penetrate = explodeMod.type === 'explodePenetrating'
      for (let i = 0; i < baseRolls.length; i++) {
        let prev = baseRolls[i]
        let attempts = 0
        while ((penetrate ? prev + 1 : prev) === max && attempts < MAX_EXPLODE) {
          let extra = rollDie(dieType, random)
          if (penetrate) extra -= 1
          const extraIdx = allRolls.length
          allRolls.push(extra)
          if (!explodeChains.has(i)) explodeChains.set(i, [])
          explodeChains.get(i)!.push(extraIdx)
          prev = extra
          attempts++
        }
      }
    }
  }

  // Apply minValue (floor) modifier
  const minMod = modifiers.find((m) => m.type === 'minValue') as
    | Extract<DiceModifier, { type: 'minValue' }>
    | undefined
  const finalRolls = minMod
    ? allRolls.map((v) => Math.max(v, minMod.value))
    : allRolls

  // Determine kept/dropped indices
  const droppedIndices = new Set<number>()

  const keepHighMod = modifiers.find((m) => m.type === 'keepHighest') as
    | Extract<DiceModifier, { type: 'keepHighest' }>
    | undefined
  const keepLowMod = modifiers.find((m) => m.type === 'keepLowest') as
    | Extract<DiceModifier, { type: 'keepLowest' }>
    | undefined
  const dropHighMod = modifiers.find((m) => m.type === 'dropHighest') as
    | Extract<DiceModifier, { type: 'dropHighest' }>
    | undefined
  const dropLowMod = modifiers.find((m) => m.type === 'dropLowest') as
    | Extract<DiceModifier, { type: 'dropLowest' }>
    | undefined

  if (keepHighMod || keepLowMod || dropHighMod || dropLowMod) {
    // Build sorted index array
    const indexed = finalRolls.map((v, idx) => ({ v, idx }))
    indexed.sort((a, b) => a.v - b.v) // ascending

    if (keepHighMod) {
      const keepCount = Math.min(keepHighMod.count, finalRolls.length)
      // Drop all but the top `keepCount`
      indexed.slice(0, finalRolls.length - keepCount).forEach(({ idx }) => droppedIndices.add(idx))
    } else if (keepLowMod) {
      const keepCount = Math.min(keepLowMod.count, finalRolls.length)
      indexed.slice(keepCount).forEach(({ idx }) => droppedIndices.add(idx))
    } else if (dropHighMod) {
      const dropCount = Math.min(dropHighMod.count, finalRolls.length)
      indexed.slice(finalRolls.length - dropCount).forEach(({ idx }) => droppedIndices.add(idx))
    } else if (dropLowMod) {
      const dropCount = Math.min(dropLowMod.count, finalRolls.length)
      indexed.slice(0, dropCount).forEach(({ idx }) => droppedIndices.add(idx))
    }
  }

  const subtotal = finalRolls.reduce((sum, v, idx) => {
    return droppedIndices.has(idx) ? sum : sum + v
  }, 0)

  return { dieType, allRolls: finalRolls, droppedIndices, explodeChains, compoundExplodedIndices, subtotal }
}

function evalExpr(
  expr: DiceExpression,
  groups: DiceGroupResult[],
  random: RandomFn,
): number {
  switch (expr.kind) {
    case 'constant':
      return expr.value
    case 'group': {
      const result = rollGroup(expr.count, expr.dieType, expr.modifiers, random)
      groups.push(result)
      return result.subtotal
    }
    case 'add':
      return evalExpr(expr.left, groups, random) + evalExpr(expr.right, groups, random)
    case 'subtract':
      return evalExpr(expr.left, groups, random) - evalExpr(expr.right, groups, random)
  }
}

export function evaluate(
  expr: DiceExpression,
  rawExpression: string,
  random: RandomFn = Math.random,
): RollResult {
  const groups: DiceGroupResult[] = []
  const total = evalExpr(expr, groups, random)
  return {
    id: crypto.randomUUID(),
    expression: rawExpression,
    total,
    groups,
    timestamp: Date.now(),
  }
}
