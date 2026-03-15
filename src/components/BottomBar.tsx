import { useDiceStore } from '../store/diceStore'

export function BottomBar() {
  const clear = useDiceStore((s) => s.clear)
  const roll = useDiceStore((s) => s.roll)
  const formula = useDiceStore((s) => s.formula)
  const parseError = useDiceStore((s) => s.parseError)
  const favorites = useDiceStore((s) => s.favorites)
  const openSaveFavorite = useDiceStore((s) => s.openSaveFavorite)
  const removeFavorite = useDiceStore((s) => s.removeFavorite)
  const isFav = formula ? favorites.some((f) => f.expression === formula) : false

  const canRoll = !!formula && !parseError

  const toggleFavorite = () => {
    if (!formula) return
    if (isFav) {
      const fav = favorites.find((f) => f.expression === formula)
      if (fav) removeFavorite(fav.id)
    } else {
      openSaveFavorite(formula)
    }
  }

  return (
    <div className="flex gap-1 px-1 pb-1">
      {/* Clear */}
      <button
        onPointerDown={(e) => { e.preventDefault(); clear() }}
        className="w-14 h-14 rounded-full bg-red-700 flex items-center justify-center text-white text-2xl active:brightness-75 no-select shrink-0"
        aria-label="Clear"
      >
        ✕
      </button>

      {/* Roll */}
      <button
        onPointerDown={(e) => { e.preventDefault(); if (canRoll) roll() }}
        className={`flex-1 h-14 rounded-full text-white text-2xl font-bold tracking-widest no-select transition-colors ${
          canRoll ? 'bg-[#E65100] active:brightness-75' : 'bg-[#E65100]/40 cursor-not-allowed'
        }`}
        aria-label="Roll"
      >
        ROLL
      </button>

      {/* Favorite */}
      <button
        onPointerDown={(e) => { e.preventDefault(); toggleFavorite() }}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl active:brightness-75 no-select shrink-0 ${
          isFav ? 'bg-pink-600 text-white' : 'bg-surface-mid text-white/50'
        }`}
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        ♥
      </button>
    </div>
  )
}
