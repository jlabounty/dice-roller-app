import { useDiceStore } from '../store/diceStore'
import { formatResult } from '../utils/formatBreakdown'

export function RollResultOverlay() {
  const rollResult = useDiceStore((s) => s.rollResult)
  const showResult = useDiceStore((s) => s.showResult)
  const dismissResult = useDiceStore((s) => s.dismissResult)
  const formula = useDiceStore((s) => s.formula)
  const favorites = useDiceStore((s) => s.favorites)
  const openSaveFavorite = useDiceStore((s) => s.openSaveFavorite)
  const removeFavorite = useDiceStore((s) => s.removeFavorite)

  if (!showResult || !rollResult) return null

  const { groups, total } = formatResult(rollResult)
  const isFav = favorites.some((f) => f.expression === formula)

  const toggleFav = () => {
    if (isFav) {
      const fav = favorites.find((f) => f.expression === formula)
      if (fav) removeFavorite(fav.id)
    } else {
      openSaveFavorite(formula)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 no-select"
      onPointerDown={dismissResult}
    >
      {/* Main result card */}
      <div
        className="bg-[#E65100] rounded-2xl px-10 py-8 flex flex-col items-center gap-3 w-4/5 max-w-sm shadow-2xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Total */}
        <div className="text-white font-bold text-7xl leading-none">{total}</div>

        {/* Expression */}
        <div className="text-white/80 text-base font-mono">{rollResult.expression}</div>

        {/* Breakdown */}
        <div className="w-full mt-1">
          {groups.map((g, gi) => (
            <div key={gi} className="text-white/90 text-sm font-mono flex flex-wrap gap-x-1 justify-center">
              <span className="text-white/50">{g.label}:</span>
              <span>[</span>
              {g.items.map((item, ii) => (
                <span key={ii}>
                  {ii > 0 && <span className="text-white/50">, </span>}
                  {item.kind === 'single' ? (
                    <span className={item.dropped ? 'line-through text-white/40' : 'text-white'}>
                      {item.text}{item.compoundExploded && !item.dropped && '💥'}
                    </span>
                  ) : (
                    /* Explosion chain: (trigger⚡ extra💥⚡ last💥) */
                    <span className={item.dropped ? 'line-through text-white/40' : 'text-white'}>
                      {'('}
                      {item.members.map((m, mi) => (
                        <span key={mi}>
                          {mi > 0 && <span className="text-white/50"> </span>}
                          {m.dieLabel && <span className="text-white/50">{m.dieLabel}:</span>}
                          {m.text}
                          {mi === 0
                            ? '🎆'                    /* triggering die */
                            : m.isSubTrigger
                              ? '💥🎆'               /* exploded and triggered another */
                              : '💥'                 /* final exploded die */
                          }
                        </span>
                      ))}
                      {')'}
                    </span>
                  )}
                </span>
              ))}
              <span>]</span>
              {gi < groups.length - 1 && <span className="text-white/50 ml-1">+</span>}
            </div>
          ))}
        </div>

        {/* Favorite button */}
        <button
          onPointerDown={(e) => { e.stopPropagation(); toggleFav() }}
          className={`mt-2 px-5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
            isFav
              ? 'bg-pink-600 border-pink-600 text-white'
              : 'border-white/40 text-white/70 hover:border-white/70'
          }`}
        >
          {isFav ? '♥ Saved' : '♡ Save to Favorites'}
        </button>
      </div>

      <p className="text-white/40 text-xs mt-4">Tap anywhere to dismiss</p>
    </div>
  )
}
