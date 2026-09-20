import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nContext'
import { euclideanDistance } from '../../algorithms/tsp'
import { CityNode, type CityState } from './CityNode'
import { RouteEdge } from './RouteEdge'
import { formatNumber } from '../../utils/format'
import type { City, TSPChallenge } from '../../types'

const DECORATIONS = [
  { icon: '☁️', x: 8, y: 10, size: 'text-3xl' },
  { icon: '☁️', x: 78, y: 6, size: 'text-2xl' },
  { icon: '🌳', x: 4, y: 88, size: 'text-2xl' },
  { icon: '🌳', x: 93, y: 82, size: 'text-2xl' },
  { icon: '🌤️', x: 45, y: 5, size: 'text-2xl' },
]

export function TSPMap({
  challenge,
  visitedOrder,
  shakeCityId,
  invalidTargetId,
  onCityClick,
  showDistances,
  optimalRoute,
  travelHop,
}: {
  challenge: TSPChallenge
  visitedOrder: string[]
  shakeCityId: string | null
  invalidTargetId: string | null
  onCityClick: (cityId: string) => void
  showDistances: boolean
  optimalRoute: string[] | null
  travelHop: { from: City; to: City; key: number } | null
}) {
  const { language } = useI18n()
  const byId = new Map(challenge.cities.map((c) => [c.id, c]))
  const currentCityId = visitedOrder[visitedOrder.length - 1]
  const visitedSet = new Set(visitedOrder)

  const [showMarker, setShowMarker] = useState(false)
  useEffect(() => {
    if (!travelHop) return
    setShowMarker(true)
    const timer = window.setTimeout(() => setShowMarker(false), 650)
    return () => window.clearTimeout(timer)
  }, [travelHop])

  const stateFor = (cityId: string): CityState => {
    if (cityId === challenge.startCityId && cityId === currentCityId && visitedOrder.length === 1) return 'start'
    if (cityId === currentCityId) return 'current'
    if (visitedSet.has(cityId)) return 'visited'
    return 'not-visited'
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 shadow-xl">
      {DECORATIONS.map((d, i) => (
        <span
          key={i}
          className={`pointer-events-none absolute opacity-70 ${d.size}`}
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
          aria-hidden="true"
        >
          {d.icon}
        </span>
      ))}

      <svg viewBox="0 0 100 75" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {challenge.cities.map((a) =>
          challenge.cities.map((b) => {
            if (a.id >= b.id) return null
            return (
              <RouteEdge
                key={`${a.id}-${b.id}`}
                x1={a.x}
                y1={a.y * 0.75}
                x2={b.x}
                y2={b.y * 0.75}
                state="available"
              />
            )
          }),
        )}

        {optimalRoute &&
          optimalRoute.slice(0, -1).map((id, i) => {
            const a = byId.get(id)
            const b = byId.get(optimalRoute[i + 1])
            if (!a || !b) return null
            return <RouteEdge key={`opt-${i}`} x1={a.x} y1={a.y * 0.75} x2={b.x} y2={b.y * 0.75} state="optimal" />
          })}

        {visitedOrder.slice(0, -1).map((id, i) => {
          const a = byId.get(id)
          const b = byId.get(visitedOrder[i + 1])
          if (!a || !b) return null
          const dist = euclideanDistance(a, b)
          return (
            <RouteEdge
              key={`v-${i}`}
              x1={a.x}
              y1={a.y * 0.75}
              x2={b.x}
              y2={b.y * 0.75}
              state="visited"
              showLabel={showDistances}
              label={formatNumber(dist, language)}
            />
          )
        })}

        {invalidTargetId &&
          (() => {
            const a = byId.get(currentCityId)
            const b = byId.get(invalidTargetId)
            if (!a || !b) return null
            return <RouteEdge x1={a.x} y1={a.y * 0.75} x2={b.x} y2={b.y * 0.75} state="invalid" />
          })()}
      </svg>

      <AnimatePresence>
        {showMarker && travelHop && (
          <motion.span
            key={travelHop.key}
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 text-2xl"
            initial={{ left: `${travelHop.from.x}%`, top: `${travelHop.from.y}%`, opacity: 0 }}
            animate={{ left: `${travelHop.to.x}%`, top: `${travelHop.to.y}%`, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            🚗
          </motion.span>
        )}
      </AnimatePresence>

      {challenge.cities.map((city) => (
        <CityNode
          key={city.id}
          city={city}
          state={stateFor(city.id)}
          shake={shakeCityId === city.id}
          disabled={false}
          onClick={() => onCityClick(city.id)}
        />
      ))}
    </div>
  )
}
