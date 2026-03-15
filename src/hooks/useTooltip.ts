import { useState, useRef, useCallback } from 'react'

export function useTooltip(longPressDelay = 600) {
  const [visible, setVisible] = useState(false)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
    setVisible(true)
    // Auto-dismiss on touch after 3s
    dismissTimer.current = setTimeout(() => setVisible(false), 3000)
  }, [])

  const hide = useCallback(() => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
    setVisible(false)
  }, [])

  const handlers = {
    onMouseEnter: show,
    onMouseLeave: hide,
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType === 'touch') {
        pressTimer.current = setTimeout(show, longPressDelay)
      }
    },
    onPointerUp: () => {
      if (pressTimer.current) clearTimeout(pressTimer.current)
    },
    onPointerCancel: hide,
  }

  return { visible, handlers, hide }
}
