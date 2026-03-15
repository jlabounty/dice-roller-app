import { useDiceStore } from '../store/diceStore'

const UPPER_ROW = ['KH', 'KL', 'R', '!', '≤', '≥']
const LOWER_ROW = ['kh', 'kl', 'r', '!!', '!p', 'f']

// Map display label to what gets appended to the formula
const TOKEN_MAP: Record<string, string> = {
  KH: 'kh', KL: 'kl', R: 'r', '!': '!', '≤': '≤', '≥': '≥',
  kh: 'kh', kl: 'kl', r: 'r', '!!': '!!', '!p': '!p', f: 'f',
}

export function OperatorKeyGrid() {
  const appendChar = useDiceStore((s) => s.appendChar)

  const renderKey = (label: string) => (
    <button
      key={label}
      onPointerDown={(e) => { e.preventDefault(); appendChar(TOKEN_MAP[label] ?? label) }}
      className="bg-surface-card rounded h-9 flex items-center justify-center text-white font-mono text-sm font-semibold active:bg-white/20 no-select"
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-col gap-1 px-1">
      <div className="grid grid-cols-6 gap-1">
        {UPPER_ROW.map(renderKey)}
      </div>
      <div className="grid grid-cols-6 gap-1">
        {LOWER_ROW.map(renderKey)}
      </div>
    </div>
  )
}
