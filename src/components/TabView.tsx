import { useState } from 'react'
import { DiceBagScreen } from './DiceBagScreen'
import { HistoryPanel } from './HistoryPanel'
import { FavoritesPanel } from './FavoritesPanel'
import { HelpScreen } from './HelpScreen'
import { SimulationPanel } from './SimulationPanel'

type Tab = 'bag' | 'history' | 'favorites' | 'stats' | 'help'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'history',   label: 'History',   icon: '🕐' },
  { id: 'bag',       label: 'Dice Bag',  icon: '🎲' },
  { id: 'favorites', label: 'Favorites', icon: '♥' },
  { id: 'stats',     label: 'Stats',     icon: '📊' },
  { id: 'help',      label: 'Help',      icon: '?' },
]

export function TabView() {
  const [activeTab, setActiveTab] = useState<Tab>('bag')

  return (
    <div className="flex flex-col h-full">
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className={activeTab === 'bag'       ? 'h-full' : 'hidden h-full'}>
          <DiceBagScreen />
        </div>
        <div className={activeTab === 'history'   ? 'h-full' : 'hidden h-full'}>
          <HistoryPanel onLoadExpression={() => setActiveTab('bag')} />
        </div>
        <div className={activeTab === 'favorites' ? 'h-full' : 'hidden h-full'}>
          <FavoritesPanel onRolled={() => setActiveTab('bag')} />
        </div>
        <div className={activeTab === 'stats'     ? 'h-full' : 'hidden h-full'}>
          <SimulationPanel />
        </div>
        <div className={activeTab === 'help'      ? 'h-full' : 'hidden h-full'}>
          <HelpScreen onExampleClick={() => setActiveTab('bag')} />
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="flex bg-surface-mid border-t border-white/10 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onPointerDown={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs no-select transition-colors ${
              activeTab === tab.id ? 'text-[#E65100]' : 'text-white/40'
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
