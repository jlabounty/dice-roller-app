import { useDiceStore } from '../store/diceStore'

export function FormulaBar() {
  const formula = useDiceStore((s) => s.formula)
  const parseError = useDiceStore((s) => s.parseError)
  const backspace = useDiceStore((s) => s.backspace)

  return (
    <div className="bg-surface-mid px-3 py-2 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 font-mono text-2xl text-white min-h-[2rem] tracking-wide truncate">
          {formula || <span className="text-white/30 text-lg">tap dice to build a roll…</span>}
        </div>
        <button
          onPointerDown={(e) => { e.preventDefault(); backspace() }}
          className="w-10 h-10 flex items-center justify-center rounded bg-white/10 active:bg-white/20 text-white text-xl no-select"
          aria-label="Backspace"
        >
          ⌫
        </button>
      </div>
      {parseError && formula && (
        <p className="text-red-400 text-xs">{parseError}</p>
      )}
    </div>
  )
}
