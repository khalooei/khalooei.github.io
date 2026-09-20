import { useI18n } from '../../i18n/I18nContext'
import { formatNumber } from '../../utils/format'
import type { City, TSPAttempt } from '../../types'

export function RouteDiscoveryPanel({
  attempts,
  cities,
  totalPossible,
}: {
  attempts: TSPAttempt[]
  cities: City[]
  totalPossible: number
}) {
  const { t, language } = useI18n()
  const byId = new Map(cities.map((c) => [c.id, c]))
  const uniqueValid = Array.from(new Map(attempts.filter((a) => a.valid).map((a) => [a.route.join('>'), a])).values())

  return (
    <div className="card-surface rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
          <span aria-hidden="true">🔎</span>
          {t('tsp.routesDiscoveredTitle')}
        </h3>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
          {t('tsp.foundOf', { found: formatNumber(uniqueValid.length, language), total: formatNumber(totalPossible, language) })}
        </span>
      </div>
      <ol className="mt-3 flex flex-col gap-1.5">
        {uniqueValid.map((attempt, i) => (
          <li key={attempt.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs">
            <span className="font-semibold text-slate-600">
              {formatNumber(i + 1, language)}.{' '}
              <span dir="ltr" className="inline-block">
                {attempt.route.map((id) => t(byId.get(id)?.nameKey ?? '')).join(' → ')}
              </span>
            </span>
            <span className="font-black text-brand-600">
              {formatNumber(attempt.distance, language)} {t('common.km')}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
