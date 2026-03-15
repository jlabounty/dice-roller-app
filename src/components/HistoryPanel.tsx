import { useDiceStore } from '../store/diceStore'
import { relativeTime } from '../utils/formatBreakdown'

interface Props {
  onLoadExpression?: (expr: string) => void
}

export function HistoryPanel({ onLoadExpression }: Props) {
  const history = useDiceStore((s) => s.history)
  const deleteHistoryEntry = useDiceStore((s) => s.deleteHistoryEntry)
  const clearHistory = useDiceStore((s) => s.clearHistory)
  const loadExpression = useDiceStore((s) => s.loadExpression)

  const load = (expr: string) => {
    loadExpression(expr)
    onLoadExpression?.(expr)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 bg-surface-mid">
        <h2 className="text-white font-semibold text-base">History</h2>
        {history.length > 0 && (
          <button
            onPointerDown={() => clearHistory()}
            className="text-white/50 text-xs active:text-white"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-white/30 text-sm text-center mt-8">No rolls yet</p>
        ) : (
          history.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center px-3 py-2 border-b border-white/5 active:bg-white/5"
            >
              {/* Total badge */}
              <div className="w-10 h-10 rounded bg-[#E65100] flex items-center justify-center text-white font-bold text-lg shrink-0 mr-3">
                {entry.total}
              </div>

              {/* Expression + time */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onPointerDown={() => load(entry.expression)}
              >
                <div className="text-white font-mono text-sm truncate">{entry.expression}</div>
                <div className="text-white/40 text-xs">{relativeTime(entry.timestamp)}</div>
              </div>

              {/* Delete */}
              <button
                onPointerDown={() => deleteHistoryEntry(entry.id)}
                className="ml-2 text-white/30 text-lg active:text-red-400 no-select"
                aria-label="Delete"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
