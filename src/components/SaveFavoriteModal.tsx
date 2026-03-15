import { useState, useEffect, useRef } from 'react'
import { useDiceStore } from '../store/diceStore'

export function SaveFavoriteModal() {
  const pendingSaveFavorite = useDiceStore((s) => s.pendingSaveFavorite)
  const closeSaveFavorite = useDiceStore((s) => s.closeSaveFavorite)
  const addFavorite = useDiceStore((s) => s.addFavorite)
  const favorites = useDiceStore((s) => s.favorites)

  const [label, setLabel] = useState('')
  const [category, setCategory] = useState('')
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false)
  const labelRef = useRef<HTMLInputElement>(null)

  // Existing categories for suggestions
  const existingCategories = Array.from(
    new Set(favorites.map((f) => f.category).filter(Boolean))
  ).sort()

  const filteredSuggestions = existingCategories.filter(
    (c) => c.toLowerCase().includes(category.toLowerCase()) && c !== category
  )

  useEffect(() => {
    if (!pendingSaveFavorite) return
    setLabel('')
    setCategory('')
    setShowCategorySuggestions(false)
    // Focus label input after render
    const timer = setTimeout(() => labelRef.current?.focus(), 50)
    return () => clearTimeout(timer)
  }, [pendingSaveFavorite])

  if (!pendingSaveFavorite) return null

  const handleSave = () => {
    if (!pendingSaveFavorite) return
    addFavorite(pendingSaveFavorite, label.trim(), category.trim())
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70"
      onPointerDown={closeSaveFavorite}
    >
      <div
        className="w-full max-w-lg bg-surface-mid rounded-t-2xl p-5 pb-8 flex flex-col gap-4"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-base">Save to Favorites</h2>
          <button
            onPointerDown={closeSaveFavorite}
            className="text-white/40 text-xl active:text-white no-select"
            aria-label="Cancel"
          >
            ✕
          </button>
        </div>

        {/* Expression preview */}
        <div className="bg-surface rounded px-3 py-2 font-mono text-white/70 text-sm truncate">
          {pendingSaveFavorite}
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-1">
          <label className="text-white/50 text-xs uppercase tracking-wide">Name</label>
          <input
            ref={labelRef}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Battleaxe Attack"
            className="bg-surface rounded px-3 py-2 text-white text-sm outline-none focus:ring-1 focus:ring-[#E65100] placeholder:text-white/25"
          />
        </div>

        {/* Category input */}
        <div className="flex flex-col gap-1 relative">
          <label className="text-white/50 text-xs uppercase tracking-wide">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setShowCategorySuggestions(true) }}
            onFocus={() => setShowCategorySuggestions(true)}
            onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 150)}
            placeholder="e.g. Attack, Damage, Saves…"
            className="bg-surface rounded px-3 py-2 text-white text-sm outline-none focus:ring-1 focus:ring-[#E65100] placeholder:text-white/25"
          />
          {/* Suggestions dropdown */}
          {showCategorySuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-surface-card rounded shadow-xl z-10">
              {filteredSuggestions.map((s) => (
                <button
                  key={s}
                  onPointerDown={() => { setCategory(s); setShowCategorySuggestions(false) }}
                  className="w-full text-left px-3 py-2 text-white/80 text-sm hover:bg-white/10 active:bg-white/20 first:rounded-t last:rounded-b"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          <button
            onPointerDown={closeSaveFavorite}
            className="flex-1 py-3 rounded-xl border border-white/20 text-white/60 text-sm font-semibold active:bg-white/10 no-select"
          >
            Cancel
          </button>
          <button
            onPointerDown={handleSave}
            className="flex-1 py-3 rounded-xl bg-[#E65100] text-white text-sm font-semibold active:brightness-75 no-select"
          >
            Save ♥
          </button>
        </div>
      </div>
    </div>
  )
}
