import { useDiceStore } from '../store/diceStore'

interface Props {
  onLoadExpression?: (expr: string) => void
}

export function FavoritesPanel({ onLoadExpression }: Props) {
  const favorites = useDiceStore((s) => s.favorites)
  const removeFavorite = useDiceStore((s) => s.removeFavorite)
  const loadExpression = useDiceStore((s) => s.loadExpression)

  const load = (expr: string) => {
    loadExpression(expr)
    onLoadExpression?.(expr)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-3 py-2 bg-surface-mid">
        <h2 className="text-white font-semibold text-base">Favorites</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {favorites.length === 0 ? (
          <p className="text-white/30 text-sm text-center mt-8">
            No favorites yet.{'\n'}Tap ♥ after a roll to save it.
          </p>
        ) : (
          favorites.map((fav) => (
            <div
              key={fav.id}
              className="flex items-center px-3 py-2 border-b border-white/5 active:bg-white/5"
            >
              {/* Pink heart badge */}
              <div className="w-10 h-10 rounded bg-pink-700 flex items-center justify-center text-white text-lg shrink-0 mr-3">
                ♥
              </div>

              {/* Expression + label */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onPointerDown={() => load(fav.expression)}
              >
                <div className="text-white font-mono text-sm truncate">{fav.expression}</div>
                {fav.label && (
                  <div className="text-white/50 text-xs truncate">{fav.label}</div>
                )}
              </div>

              {/* Remove */}
              <button
                onPointerDown={() => removeFavorite(fav.id)}
                className="ml-2 text-white/30 text-lg active:text-red-400 no-select"
                aria-label="Remove favorite"
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
