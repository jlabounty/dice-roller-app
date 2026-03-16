import { useEffect, useState } from 'react'
import { useDiceStore } from '../store/diceStore'
import { runSimulation, type SimulationResult } from '../utils/simulate'
import { SimulationHistogram } from './SimulationHistogram'

const PRESETS = [100, 1_000, 10_000]

export function SimulationPanel() {
  const formula = useDiceStore((s) => s.formula)
  const parseError = useDiceStore((s) => s.parseError)

  const [trials, setTrials] = useState(1000)
  const [inputVal, setInputVal] = useState('1000')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [simError, setSimError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  // Clear stale results when formula changes
  useEffect(() => {
    setResult(null)
    setSimError(null)
  }, [formula])

  const canSimulate = !!formula && !parseError

  function handleInputBlur() {
    const n = Math.min(Math.max(1, parseInt(inputVal, 10) || 1000), 100_000)
    setTrials(n)
    setInputVal(String(n))
  }

  function handleSimulate() {
    if (!canSimulate) return
    setRunning(true)
    requestAnimationFrame(() => {
      const r = runSimulation(formula, trials)
      if ('error' in r) {
        setSimError(r.error)
        setResult(null)
      } else {
        setSimError(null)
        setResult(r)
      }
      setRunning(false)
    })
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex flex-col gap-3 p-3">
        {/* Formula preview */}
        <div className="font-mono text-sm bg-surface-mid rounded px-3 py-2 min-h-[2.25rem] text-white/80 truncate">
          {formula || <span className="text-white/30">No formula — build one in Dice Bag</span>}
        </div>

        {/* Trial count controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p}
              onPointerDown={(e) => {
                e.preventDefault()
                setTrials(p)
                setInputVal(p >= 1000 ? `${p / 1000}k` : String(p))
              }}
              className={`px-2 py-1 rounded text-xs font-semibold no-select transition-colors ${
                trials === p ? 'bg-[#E65100] text-white' : 'bg-surface-mid text-white/50 hover:text-white/80'
              }`}
            >
              {p >= 1000 ? `${p / 1000}k` : p}
            </button>
          ))}
          <div className="flex items-center gap-1 ml-auto">
            <input
              type="number"
              min={1}
              max={100000}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onBlur={handleInputBlur}
              className="w-20 bg-surface-mid text-white text-xs text-right rounded px-2 py-1 border border-white/10 focus:outline-none focus:border-[#E65100]/60"
            />
            <span className="text-xs text-white/40">trials</span>
          </div>
        </div>

        {trials > 100_000 && (
          <p className="text-xs text-red-400">Max 100,000 trials</p>
        )}

        {/* Simulate button */}
        <button
          onPointerDown={(e) => { e.preventDefault(); handleSimulate() }}
          disabled={!canSimulate || running}
          className={`w-full h-11 rounded-full text-white font-bold tracking-widest no-select transition-colors ${
            canSimulate && !running
              ? 'bg-[#E65100] active:brightness-75'
              : 'bg-[#E65100]/40 cursor-not-allowed'
          }`}
        >
          {running ? 'Simulating…' : 'SIMULATE'}
        </button>

        {simError && (
          <p className="text-xs text-red-400">{simError}</p>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-3 px-3 pb-3">
          {/* Stats row */}
          <div className="grid grid-cols-5 gap-1">
            {[
              { label: 'Mean',   value: result.mean.toFixed(2) },
              { label: 'Median', value: result.median % 1 === 0 ? String(result.median) : result.median.toFixed(1) },
              { label: 'Stdev',  value: result.stdev.toFixed(2) },
              { label: 'Min',    value: String(result.min) },
              { label: 'Max',    value: String(result.max) },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center bg-surface-mid rounded py-2 gap-0.5">
                <span className="text-[10px] text-white/40 uppercase tracking-wide">{label}</span>
                <span className="font-mono text-sm text-white leading-none">{value}</span>
              </div>
            ))}
          </div>

          {/* Histogram */}
          <SimulationHistogram buckets={result.buckets} median={result.median} />

          {result.clipped && (
            <p className="text-[10px] text-white/30">Rare high-value results not shown</p>
          )}

          <p className="text-[10px] text-white/30">{result.trials.toLocaleString()} trials</p>
        </div>
      )}

      {!result && !running && !formula && (
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <p className="text-sm text-white/30">Build a formula in Dice Bag, then simulate here.</p>
        </div>
      )}
    </div>
  )
}
