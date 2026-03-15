import { useEffect, useState } from 'react'
import { TabView } from './components/TabView'
import { TabletLayout } from './components/TabletLayout'

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsTablet(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isTablet
}

export default function App() {
  const isTablet = useIsTablet()
  return (
    <div className="h-full bg-surface text-white overflow-hidden">
      {isTablet ? <TabletLayout /> : <TabView />}
    </div>
  )
}
