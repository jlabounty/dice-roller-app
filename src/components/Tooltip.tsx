import { useEffect, useState, useRef, RefObject } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  visible: boolean
  anchorRef: RefObject<HTMLElement>
  title: string
  example?: string
}

export function Tooltip({ visible, anchorRef, title, example }: Props) {
  const [style, setStyle] = useState<React.CSSProperties>({})
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible || !anchorRef.current) return

    const anchor = anchorRef.current.getBoundingClientRect()
    const vpW = window.innerWidth

    // Default: centered above the key
    let left = anchor.left + anchor.width / 2
    let top = anchor.top - 10

    // Clamp so tooltip doesn't go off-screen edges (assume ~180px width)
    const half = 90
    if (left - half < 8) left = half + 8
    if (left + half > vpW - 8) left = vpW - half - 8

    setStyle({ top, left, transform: 'translate(-50%, -100%)' })
  }, [visible, anchorRef])

  if (!visible) return null

  return createPortal(
    <div
      ref={tooltipRef}
      style={style}
      className="fixed z-[200] pointer-events-none max-w-[200px]"
    >
      <div className="bg-gray-900 border border-white/25 rounded-lg px-3 py-2 shadow-2xl text-left">
        <p className="text-white text-xs leading-snug">{title}</p>
        {example && (
          <p className="text-[#E65100] font-mono text-xs mt-1">{example}</p>
        )}
      </div>
      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900" />
      </div>
    </div>,
    document.body,
  )
}
