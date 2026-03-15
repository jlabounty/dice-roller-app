import { DiceBagScreen } from './DiceBagScreen'
import { HistoryPanel } from './HistoryPanel'
import { FavoritesPanel } from './FavoritesPanel'

export function TabletLayout() {
  return (
    <div className="flex h-full gap-0">
      {/* History - left panel */}
      <div className="w-64 border-r border-white/10 flex flex-col overflow-hidden shrink-0">
        <HistoryPanel />
      </div>

      {/* Dice Bag - center */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DiceBagScreen />
      </div>

      {/* Favorites - right panel */}
      <div className="w-64 border-l border-white/10 flex flex-col overflow-hidden shrink-0">
        <FavoritesPanel />
      </div>
    </div>
  )
}
