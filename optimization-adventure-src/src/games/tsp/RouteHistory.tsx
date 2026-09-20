import { useI18n } from '../../i18n/I18nContext'
import { formatNumber } from '../../utils/format'
import type { City, TSPAttempt } from '../../types'

export function RouteHistory({ attempts, cities }: { attempts: TSPAttempt[]; cities: City[] }) {
  const { t, language } = useI18n()
  const byId = new Map(cities.map((c) => [c.id, c]))
  const bestDistance = attempts.filter((a) => a.valid).reduce((min, a) => Math.min(min, a.distance), Infinity)

  const routeLabel = (route: string[]) => route.map((id) => byId.get(id)?.icon ?? '?').join(' → ')

  if (attempts.length === 0) {
    return <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400">—</p>
  }

  return (
    <ol className="flex max-h-64 flex-col gap-2 overflow-y-auto pe-1">
      {[...attempts].reverse().map((attempt, idx) => {
        const isBest = attempt.valid && attempt.distance === bestDistance
        return (
          <li
            key={attempt.id}
            className={
              'flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs ' +
              (isBest ? 'bg-amber-50 ring-1 ring-amber-300' : 'bg-slate-50')
            }
          >
            <span className="flex flex-col gap-0.5">
              <span className="font-bold text-slate-600">
                {t('tsp.attempt')} #{formatNumber(attempts.length - idx, language)} {isBest && '🏆'}
              </span>
              <span dir="ltr" className="text-slate-500">
                {routeLabel(attempt.route)}
              </span>
            </span>
            <span className="whitespace-nowrap font-black text-brand-600">
              {formatNumber(attempt.distance, language)} {t('common.km')}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
