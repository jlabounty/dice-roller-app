import { useRef } from 'react'
import { useDiceStore } from '../store/diceStore'
import { useTooltip } from '../hooks/useTooltip'
import { Tooltip } from './Tooltip'

interface KeyDef {
  label: string
  token: string
  title: string
  example?: string
}

const KEYS: KeyDef[] = [
  // Row 1
  { label: 'KH', token: 'kh', title: 'Keep Highest — keep the N highest dice', example: '4d6kh3' },
  { label: 'KL', token: 'kl', title: 'Keep Lowest — keep the N lowest dice (disadvantage)', example: '2d20kl1' },
  { label: 'R',  token: 'r',  title: 'Reroll — reroll dice matching a value', example: '2d6r1' },
  { label: '!',  token: '!',  title: 'Explode — roll again when max is rolled, add result', example: '3d6!' },
  { label: '≤',  token: '≤',  title: 'Less than or equal — use after r or f', example: '4d6r≤2' },
  { label: '≥',  token: '≥',  title: 'Greater than or equal — use after r or f', example: '2d6r≥5' },
  // Row 2
  { label: 'kh', token: 'kh', title: 'Keep Highest (lowercase alias)', example: '4d6kh3' },
  { label: 'kl', token: 'kl', title: 'Keep Lowest (lowercase alias)', example: '2d20kl1' },
  { label: 'r',  token: 'r',  title: 'Reroll (lowercase alias)', example: '2d6r1' },
  { label: '!!', token: '!!', title: 'Compound Explode — extra rolls accumulate on the same die', example: '2d6!!' },
  { label: '!p', token: '!p', title: 'Penetrating Explode — explode but subtract 1 from each extra roll', example: '2d6!p' },
  { label: 'f',  token: 'f',  title: 'Minimum (floor) — treat any roll below N as N', example: '4d6f2' },
]

function TooltipKey({ def }: { def: KeyDef }) {
  const appendChar = useDiceStore((s) => s.appendChar)
  const { visible, handlers, hide } = useTooltip()
  const ref = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button
        ref={ref}
        onMouseEnter={handlers.onMouseEnter}
        onMouseLeave={handlers.onMouseLeave}
        onPointerDown={(e) => {
          e.preventDefault()
          appendChar(def.token)
          hide()
          handlers.onPointerDown(e)
        }}
        onPointerUp={handlers.onPointerUp}
        onPointerCancel={handlers.onPointerCancel}
        className="bg-surface-card rounded h-9 flex items-center justify-center text-white font-mono text-sm font-semibold active:bg-white/20 no-select"
      >
        {def.label}
      </button>
      <Tooltip
        visible={visible}
        anchorRef={ref}
        title={def.title}
        example={def.example}
      />
    </>
  )
}

export function OperatorKeyGrid() {
  const row1 = KEYS.slice(0, 6)
  const row2 = KEYS.slice(6, 12)

  return (
    <div className="flex flex-col gap-1 px-1">
      <div className="grid grid-cols-6 gap-1">
        {row1.map((def) => <TooltipKey key={def.label + '1'} def={def} />)}
      </div>
      <div className="grid grid-cols-6 gap-1">
        {row2.map((def) => <TooltipKey key={def.label + '2'} def={def} />)}
      </div>
    </div>
  )
}
