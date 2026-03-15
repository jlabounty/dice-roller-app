import { useRef, useState } from 'react'
import { useDiceStore } from '../store/diceStore'
import type { Favorite } from '../types/dice'

interface Props {
  onRolled?: () => void
}

const UNCATEGORIZED = '(Uncategorized)'

function groupByCategory(favorites: Favorite[]): Map<string, Favorite[]> {
  const map = new Map<string, Favorite[]>()
  for (const fav of favorites) {
    const key = fav.category.trim() || UNCATEGORIZED
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(fav)
  }
  // Sort: named categories first (alphabetically), uncategorized last
  const sorted = new Map(
    [...map.entries()].sort(([a], [b]) => {
      if (a === UNCATEGORIZED) return 1
      if (b === UNCATEGORIZED) return -1
      return a.localeCompare(b)
    })
  )
  return sorted
}

interface EditState {
  id: string
  label: string
  category: string
}

export function FavoritesPanel({ onRolled }: Props) {
  const favorites = useDiceStore((s) => s.favorites)
  const removeFavorite = useDiceStore((s) => s.removeFavorite)
  const updateFavorite = useDiceStore((s) => s.updateFavorite)
  const rollFavorite = useDiceStore((s) => s.rollFavorite)

  const importFavorites = useDiceStore((s) => s.importFavorites)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editState, setEditState] = useState<EditState | null>(null)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [importError, setImportError] = useState<string | null>(null)

  const grouped = groupByCategory(favorites)

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const startEdit = (fav: Favorite) => {
    setEditState({ id: fav.id, label: fav.label, category: fav.category })
  }

  const commitEdit = () => {
    if (!editState) return
    updateFavorite(editState.id, { label: editState.label, category: editState.category })
    setEditState(null)
  }

  const handleRoll = (id: string) => {
    rollFavorite(id)
    onRolled?.()
  }

  const handleExport = () => {
    const json = JSON.stringify(favorites, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'favorites.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!Array.isArray(parsed)) throw new Error('Expected an array')
        const valid = parsed.filter(
          (f): f is Favorite =>
            typeof f === 'object' &&
            f !== null &&
            typeof f.id === 'string' &&
            typeof f.expression === 'string' &&
            typeof f.label === 'string' &&
            typeof f.category === 'string' &&
            typeof f.createdAt === 'number',
        )
        if (valid.length === 0) throw new Error('No valid favorites found')
        importFavorites(valid)
        setImportError(null)
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Invalid file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-3 py-2 bg-surface-mid shrink-0 gap-2">
        <h2 className="text-white font-semibold text-base flex-1">Favorites</h2>
        <button
          onPointerDown={handleExport}
          disabled={favorites.length === 0}
          className="text-white/40 text-xs px-2 py-1 rounded border border-white/15 active:bg-white/10 disabled:opacity-30 no-select"
          aria-label="Export favorites"
        >
          Export
        </button>
        <button
          onPointerDown={() => fileInputRef.current?.click()}
          className="text-white/40 text-xs px-2 py-1 rounded border border-white/15 active:bg-white/10 no-select"
          aria-label="Import favorites"
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
      {importError && (
        <div className="px-3 py-1.5 bg-red-900/40 text-red-300 text-xs shrink-0">
          Import failed: {importError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {favorites.length === 0 ? (
          <p className="text-white/30 text-sm text-center mt-8 px-4">
            No favorites yet. Tap ♥ after building a roll to save it.
          </p>
        ) : (
          [...grouped.entries()].map(([category, items]) => (
            <div key={category}>
              {/* Category header */}
              <button
                className="w-full flex items-center justify-between px-3 py-1.5 bg-surface-card/60 active:bg-white/5 no-select"
                onPointerDown={() => toggleCategory(category)}
              >
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                  {category}
                </span>
                <span className="text-white/30 text-xs">
                  {collapsedCategories.has(category) ? '▶' : '▼'}
                </span>
              </button>

              {/* Items */}
              {!collapsedCategories.has(category) && items.map((fav) => (
                <div key={fav.id}>
                  {editState?.id === fav.id ? (
                    /* Inline edit row */
                    <div className="flex flex-col gap-1.5 px-3 py-2 border-b border-white/5 bg-surface-card/30">
                      <input
                        type="text"
                        value={editState.label}
                        onChange={(e) => setEditState({ ...editState, label: e.target.value })}
                        placeholder="Name"
                        className="bg-surface rounded px-2 py-1 text-white text-sm outline-none focus:ring-1 focus:ring-[#E65100] placeholder:text-white/25"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editState.category}
                        onChange={(e) => setEditState({ ...editState, category: e.target.value })}
                        placeholder="Category"
                        className="bg-surface rounded px-2 py-1 text-white text-sm outline-none focus:ring-1 focus:ring-[#E65100] placeholder:text-white/25"
                      />
                      <div className="flex gap-2">
                        <button
                          onPointerDown={() => setEditState(null)}
                          className="flex-1 py-1 rounded text-white/50 text-xs border border-white/20 active:bg-white/10 no-select"
                        >
                          Cancel
                        </button>
                        <button
                          onPointerDown={commitEdit}
                          className="flex-1 py-1 rounded bg-[#E65100] text-white text-xs font-semibold active:brightness-75 no-select"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal row */
                    <div className="flex items-center px-3 py-2 border-b border-white/5">
                      {/* Roll on tap — the main action */}
                      <button
                        className="flex-1 flex items-center gap-3 min-w-0 active:bg-white/5 -mx-3 px-3 py-0 no-select text-left"
                        onPointerDown={() => handleRoll(fav.id)}
                      >
                        <div className="w-9 h-9 rounded bg-pink-700 flex items-center justify-center text-white shrink-0">
                          ♥
                        </div>
                        <div className="flex-1 min-w-0">
                          {fav.label ? (
                            <>
                              <div className="text-white text-sm font-semibold truncate">{fav.label}</div>
                              <div className="text-white/40 font-mono text-xs truncate">{fav.expression}</div>
                            </>
                          ) : (
                            <div className="text-white font-mono text-sm truncate">{fav.expression}</div>
                          )}
                        </div>
                      </button>

                      {/* Edit */}
                      <button
                        onPointerDown={() => startEdit(fav)}
                        className="ml-1 text-white/25 text-base active:text-white/70 no-select px-1"
                        aria-label="Edit"
                      >
                        ✎
                      </button>

                      {/* Remove */}
                      <button
                        onPointerDown={() => removeFavorite(fav.id)}
                        className="text-white/25 text-lg active:text-red-400 no-select px-1"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
