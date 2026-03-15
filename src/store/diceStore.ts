import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { parse } from '../engine/parser'
import { evaluate } from '../engine/evaluator'
import type { DieType, RollResult, Favorite } from '../types/dice'

function dieToken(dieType: DieType): string {
  if (dieType.kind === 'fudge') return 'dF'
  if (dieType.kind === 'percentile') return 'd100'
  if (dieType.sides === 0) return 'dN'
  return `d${dieType.sides}`
}

/** Smart-append a die to the formula string */
function smartAppendDie(formula: string, dieType: DieType): string {
  if (dieType.kind === 'numeric' && dieType.sides === 0) {
    // dN button: append raw "dN" for user to fill in sides
    return formula + 'dN'
  }
  const token = dieToken(dieType)
  if (!formula) return `1${token}`

  // If formula ends with the same die token, increment the count
  const samePattern = new RegExp(`(\\d+)${token.replace('d', 'd')}$`)
  const match = formula.match(samePattern)
  if (match) {
    const newCount = parseInt(match[1], 10) + 1
    return formula.slice(0, formula.length - match[0].length) + `${newCount}${token}`
  }

  // If formula ends with a number (no die yet), append die token
  if (/\d$/.test(formula)) return formula + token

  // Otherwise append +1dN
  return formula + `+1${token}`
}

interface DiceStore {
  formula: string
  parseError: string | null
  rollResult: RollResult | null
  showResult: boolean

  history: RollResult[]
  favorites: Favorite[]

  appendDie: (dieType: DieType) => void
  appendChar: (ch: string) => void
  backspace: () => void
  clear: () => void
  roll: () => void
  dismissResult: () => void
  loadExpression: (expression: string) => void

  addFavorite: (expression: string, label: string) => void
  removeFavorite: (id: string) => void
  isFavorite: (expression: string) => boolean
  deleteHistoryEntry: (id: string) => void
  clearHistory: () => void
}

function validateFormula(formula: string): string | null {
  if (!formula.trim()) return null
  const result = parse(formula)
  return result.ok ? null : result.error
}

export const useDiceStore = create<DiceStore>()(
  persist(
    (set, get) => ({
      formula: '',
      parseError: null,
      rollResult: null,
      showResult: false,
      history: [],
      favorites: [],

      appendDie: (dieType) => {
        const newFormula = smartAppendDie(get().formula, dieType)
        set({ formula: newFormula, parseError: validateFormula(newFormula) })
      },

      appendChar: (ch) => {
        const newFormula = get().formula + ch
        set({ formula: newFormula, parseError: validateFormula(newFormula) })
      },

      backspace: () => {
        const f = get().formula
        const newFormula = f.slice(0, -1)
        set({ formula: newFormula, parseError: validateFormula(newFormula) })
      },

      clear: () => set({ formula: '', parseError: null }),

      roll: () => {
        const { formula, history } = get()
        const parseResult = parse(formula)
        if (!parseResult.ok) {
          set({ parseError: parseResult.error })
          return
        }
        const result = evaluate(parseResult.expr, formula)
        const newHistory = [result, ...history].slice(0, 200)
        set({ rollResult: result, showResult: true, history: newHistory })
      },

      dismissResult: () => set({ showResult: false }),

      loadExpression: (expression) => {
        set({ formula: expression, parseError: validateFormula(expression), showResult: false })
      },

      addFavorite: (expression, label) => {
        const fav: Favorite = {
          id: crypto.randomUUID(),
          expression,
          label,
          createdAt: Date.now(),
        }
        set((s) => ({ favorites: [...s.favorites, fav] }))
      },

      removeFavorite: (id) => {
        set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) }))
      },

      isFavorite: (expression) => {
        return get().favorites.some((f) => f.expression === expression)
      },

      deleteHistoryEntry: (id) => {
        set((s) => ({ history: s.history.filter((h) => h.id !== id) }))
      },

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'dice-roller-storage',
      partialize: (s) => ({ history: s.history, favorites: s.favorites }),
    },
  ),
)
