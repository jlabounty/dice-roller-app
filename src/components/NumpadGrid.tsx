import { useDiceStore } from '../store/diceStore'

const KEYS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['0', '-', '+'],
]

export function NumpadGrid() {
  const appendChar = useDiceStore((s) => s.appendChar)

  return (
    <div className="flex flex-col gap-1 px-1">
      {KEYS.map((row, ri) => (
        <div key={ri} className="grid grid-cols-3 gap-1">
          {row.map((key) => (
            <button
              key={key}
              onPointerDown={(e) => { e.preventDefault(); appendChar(key) }}
              className="bg-surface-mid rounded h-11 flex items-center justify-center text-white text-xl font-medium active:bg-white/20 no-select"
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
