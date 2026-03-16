import { useState } from 'react'
import { DiceBagScreen } from './DiceBagScreen'
import { HistoryPanel } from './HistoryPanel'
import { FavoritesPanel } from './FavoritesPanel'
import { HelpScreen } from './HelpScreen'
import { SimulationPanel } from './SimulationPanel'

type RightPanel = 'favorites' | 'stats' | 'help'

export function TabletLayout() {
  const [rightPanel, setRightPanel] = useState<RightPanel>('favorites')

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

      {/* Right panel: Favorites or Help */}
      <div className="w-72 border-l border-white/10 flex flex-col overflow-hidden shrink-0">
        {/* Panel switcher tabs */}
        <div className="flex bg-surface-mid border-b border-white/10 shrink-0">
          {(['favorites', 'stats', 'help'] as RightPanel[]).map((p) => (
            <button
              key={p}
              onPointerDown={() => setRightPanel(p)}
              className={`flex-1 py-2 text-xs font-semibold no-select transition-colors capitalize ${
                rightPanel === p ? 'text-[#E65100] border-b-2 border-[#E65100]' : 'text-white/40'
              }`}
            >
              {p === 'help' ? '? Help' : p === 'stats' ? '📊 Stats' : '♥ Favorites'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          {rightPanel === 'favorites' ? (
            <FavoritesPanel />
          ) : rightPanel === 'stats' ? (
            <SimulationPanel />
          ) : (
            <HelpScreen />
          )}
        </div>
      </div>
    </div>
  )
}
