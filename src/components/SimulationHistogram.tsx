import type { SimulationResult } from '../utils/simulate'

interface Props {
  buckets: SimulationResult['buckets']
  median: number
}

export function SimulationHistogram({ buckets, median }: Props) {
  if (buckets.length === 0) return null

  const maxPct = Math.max(...buckets.map((b) => b.pct))
  const min = buckets[0].value
  const max = buckets[buckets.length - 1].value
  const medianIdx = buckets.findIndex((b) => b.value >= median)

  return (
    <div className="select-none">
      {/* Bars — flex-1 so they fill available width without scrolling */}
      <div className="flex items-end gap-px" style={{ height: '7rem' }}>
        {buckets.map((b) => (
          <div
            key={b.value}
            className="flex-1 rounded-t-sm bg-[#E65100]/70 hover:bg-[#E65100] transition-colors"
            style={{
              height: `${(b.pct / maxPct) * 100}%`,
              minHeight: 1,
            }}
            title={`${b.value}: ${b.count} (${(b.pct * 100).toFixed(1)}%)`}
          />
        ))}
      </div>

      {/* X-axis labels: min, median, max */}
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-white/40">{min}</span>
        {medianIdx > 0 && medianIdx < buckets.length - 1 && (
          <span className="text-[10px] text-white/40">
            {median % 1 === 0 ? median : median.toFixed(1)}
          </span>
        )}
        <span className="text-[10px] text-white/40">{max}</span>
      </div>
    </div>
  )
}
