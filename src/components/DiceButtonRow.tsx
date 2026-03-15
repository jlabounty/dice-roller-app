import { useDiceStore } from '../store/diceStore'
import { DIE_BUTTONS } from '../types/dice'

export function DiceButtonRow() {
  const appendDie = useDiceStore((s) => s.appendDie)

  return (
    <div className="grid grid-cols-6 gap-1 px-1">
      {DIE_BUTTONS.slice(0, 6).map((btn) => (
        <button
          key={btn.label}
          onPointerDown={(e) => { e.preventDefault(); appendDie(btn.dieType) }}
          className={`${btn.colorClass} rounded h-10 flex items-center justify-center text-white font-bold text-sm active:brightness-75 no-select`}
        >
          {btn.label}
        </button>
      ))}
      {DIE_BUTTONS.slice(6).map((btn) => (
        <button
          key={btn.label}
          onPointerDown={(e) => { e.preventDefault(); appendDie(btn.dieType) }}
          className={`${btn.colorClass} rounded h-10 flex items-center justify-center text-white font-bold text-sm active:brightness-75 no-select`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
