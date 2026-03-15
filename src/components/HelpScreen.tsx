import { useDiceStore } from '../store/diceStore'

interface Example {
  expr: string
  desc: string
}

interface Section {
  title: string
  body: string
  examples: Example[]
}

const SECTIONS: Section[] = [
  {
    title: 'Basic Rolls',
    body: 'Type a number, tap a die button, then hit ROLL. The number before the die is how many to roll.',
    examples: [
      { expr: '1d20',  desc: 'Roll one 20-sided die' },
      { expr: '2d6',   desc: 'Roll two 6-sided dice and sum' },
      { expr: '4d8',   desc: 'Roll four 8-sided dice and sum' },
      { expr: 'd100',  desc: 'Roll percentile (d100)' },
    ],
  },
  {
    title: 'Bonuses & Penalties',
    body: 'Add or subtract a constant from any roll using + and −.',
    examples: [
      { expr: '1d20+5',  desc: 'Attack roll with +5 modifier' },
      { expr: '2d6+3',   desc: 'Damage with bonus' },
      { expr: '1d8-1',   desc: 'Penalty to roll' },
      { expr: '2d6+1d4', desc: 'Mix different dice types' },
    ],
  },
  {
    title: 'Keep / Drop (kh · kl)',
    body: 'Roll extra dice, keep only the best or worst N. Great for D&D advantage or stat generation.',
    examples: [
      { expr: '2d20kh1',  desc: 'Advantage — roll 2d20, keep highest' },
      { expr: '2d20kl1',  desc: 'Disadvantage — roll 2d20, keep lowest' },
      { expr: '4d6kh3',   desc: 'Stat roll — drop the lowest d6' },
      { expr: '4d6kh3+2', desc: 'Stat roll with racial bonus' },
    ],
  },
  {
    title: 'Rerolling (r)',
    body: 'Reroll any die that meets a condition. Use a plain number for equals, or ≤ / ≥ for ranges. Rerolled dice do not reroll again by default.',
    examples: [
      { expr: '2d6r1',   desc: 'Reroll any 1s once' },
      { expr: '4d6r≤2',  desc: 'Reroll dice showing 2 or lower' },
      { expr: '2d10r≥9', desc: 'Reroll dice showing 9 or higher' },
    ],
  },
  {
    title: 'Exploding Dice (! · !! · !p)',
    body: 'When a die rolls its maximum value, roll it again and add the result. Three flavours:',
    examples: [
      { expr: '3d6!',   desc: '! — Explode: add extra die, can chain' },
      { expr: '2d6!!',  desc: '!! — Compound: extra rolls add to the same die' },
      { expr: '2d6!p',  desc: '!p — Penetrating: subtract 1 from each extra roll' },
      { expr: '2d10!',  desc: 'Savage Worlds trait die' },
    ],
  },
  {
    title: 'Minimum Value (f)',
    body: 'Treat any die result below a threshold as that threshold. Useful for half-damage mechanics.',
    examples: [
      { expr: '4d6f2',  desc: 'Each die is at least 2' },
      { expr: '2d8f3',  desc: 'Each die is at least 3' },
    ],
  },
  {
    title: 'Fudge / Fate Dice (dF)',
    body: 'Each Fudge die rolls −1, 0, or +1 with equal probability. Used in FATE Core and Fudge RPG.',
    examples: [
      { expr: '4dF',    desc: 'Standard Fate roll (−4 to +4)' },
      { expr: '4dF+2',  desc: 'Fate roll with approach bonus' },
    ],
  },
  {
    title: 'Common RPG Examples',
    body: 'Ready-to-use rolls for popular games.',
    examples: [
      { expr: '1d20+7',       desc: 'D&D attack roll (+7 to hit)' },
      { expr: '2d6+5',        desc: 'D&D weapon damage' },
      { expr: '8d6',          desc: 'Fireball damage' },
      { expr: '4d6kh3',       desc: 'D&D ability score generation' },
      { expr: '2d20kh1+5',    desc: 'D&D advantage attack' },
      { expr: '1d8+1d6+3',    desc: 'Sneak attack (1d8 weapon + 1d6 sneak)' },
      { expr: '2d10+10',      desc: 'Savage Worlds wild attack' },
      { expr: '4dF+2',        desc: 'FATE Core action roll' },
    ],
  },
]

interface Props {
  onExampleClick?: () => void
}

export function HelpScreen({ onExampleClick }: Props) {
  const loadExpression = useDiceStore((s) => s.loadExpression)

  const handleExample = (expr: string) => {
    loadExpression(expr)
    onExampleClick?.()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-3 py-2 bg-surface-mid shrink-0">
        <h2 className="text-white font-semibold text-base">Help & Reference</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        {/* Quick notation reference */}
        <div className="bg-surface-mid rounded-xl p-3">
          <p className="text-white/50 text-xs uppercase tracking-wider font-semibold mb-2">Notation at a glance</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {[
              ['NdX', 'Roll N dice with X sides'],
              ['kh N', 'Keep N highest'],
              ['kl N', 'Keep N lowest'],
              ['r N', 'Reroll equal to N'],
              ['r≤N', 'Reroll ≤ N'],
              ['!', 'Explode on max'],
              ['!!', 'Compound explode'],
              ['!p', 'Penetrating explode'],
              ['f N', 'Minimum value N'],
              ['dF', 'Fudge die (−1/0/+1)'],
            ].map(([code, desc]) => (
              <div key={code} className="flex gap-2 items-baseline">
                <code className="text-[#E65100] font-mono text-xs shrink-0">{code}</code>
                <span className="text-white/60 text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Operator key reference */}
        <div className="bg-surface-mid rounded-xl p-3">
          <p className="text-white/50 text-xs uppercase tracking-wider font-semibold mb-2">Keyboard key reference</p>
          <p className="text-white/40 text-xs mb-3">
            On mobile: long-press any operator key to see its tooltip.
          </p>
          <div className="space-y-1.5">
            {[
              ['KH / kh', 'Keep Highest', '4d6kh3'],
              ['KL / kl', 'Keep Lowest', '2d20kl1'],
              ['R / r', 'Reroll', '2d6r1'],
              ['!', 'Explode on max', '3d6!'],
              ['!!', 'Compound explode', '2d6!!'],
              ['!p', 'Penetrating explode', '2d6!p'],
              ['≤', 'Less-than-or-equal condition', 'r≤2'],
              ['≥', 'Greater-than-or-equal condition', 'r≥5'],
              ['f', 'Minimum (floor) value', '4d6f2'],
            ].map(([key, desc, ex]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-14 text-center bg-surface-card rounded px-1 py-0.5 font-mono text-white text-xs shrink-0">{key}</span>
                <span className="text-white/60 text-xs flex-1">{desc}</span>
                <button
                  onPointerDown={() => handleExample(ex)}
                  className="text-[#E65100] font-mono text-xs active:text-white no-select shrink-0"
                >
                  {ex}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="text-white font-semibold text-sm mb-1">{section.title}</h3>
            <p className="text-white/50 text-xs mb-2 leading-relaxed">{section.body}</p>
            <div className="flex flex-col gap-1.5">
              {section.examples.map((ex) => (
                <button
                  key={ex.expr}
                  onPointerDown={() => handleExample(ex.expr)}
                  className="flex items-center justify-between bg-surface-mid rounded-lg px-3 py-2 active:bg-surface-card no-select text-left w-full"
                >
                  <span className="text-white/60 text-xs flex-1 mr-2">{ex.desc}</span>
                  <span className="text-[#E65100] font-mono text-sm font-semibold shrink-0">{ex.expr}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="h-4" /> {/* bottom padding */}
      </div>
    </div>
  )
}
