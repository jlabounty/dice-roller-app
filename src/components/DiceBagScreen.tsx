import { FormulaBar } from './FormulaBar'
import { DiceButtonRow } from './DiceButtonRow'
import { OperatorKeyGrid } from './OperatorKeyGrid'
import { NumpadGrid } from './NumpadGrid'
import { BottomBar } from './BottomBar'
import { RollResultOverlay } from './RollResultOverlay'
import { SaveFavoriteModal } from './SaveFavoriteModal'

export function DiceBagScreen() {
  return (
    <div className="flex flex-col h-full gap-1 pt-1 overflow-hidden">
      <FormulaBar />
      <DiceButtonRow />
      <OperatorKeyGrid />
      <div className="flex-1" />
      <NumpadGrid />
      <BottomBar />
      <RollResultOverlay />
      <SaveFavoriteModal />
    </div>
  )
}
