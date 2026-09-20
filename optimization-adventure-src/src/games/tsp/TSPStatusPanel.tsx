import { useI18n } from '../../i18n/I18nContext'
import { formatNumber } from '../../utils/format'
import { CurrentRoute } from './CurrentRoute'
import type { City, TSPChallenge } from '../../types'

export function TSPStatusPanel({
  challenge,
  visitedOrder,
  distanceSoFar,
}: {
  challenge: TSPChallenge
  visitedOrder: string[]
  distanceSoFar: number
}) {
  const { t, language } = useI18n()
  const byId = new Map<string, City>(challenge.cities.map((c) => [c.id, c]))
  const remaining = challenge.cities.filter((c) => !visitedOrder.includes(c.id))
  const current = byId.get(visitedOrder[visitedOrder.length - 1])
  const start = byId.get(challenge.startCityId)

  return (
    <div className="card-surface flex flex-col gap-4 rounded-2xl p-4">
      <div className="grid grid-cols-2 gap-3 text-center">
        <Stat label={t('tsp.startCity')} value={start ? `${start.icon} ${t(start.nameKey)}` : '—'} />
        <Stat label={t('tsp.currentCity')} value={current ? `${current.icon} ${t(current.nameKey)}` : '—'} accent />
        <Stat label={t('tsp.visited')} value={`${formatNumber(visitedOrder.length, language)}/${formatNumber(challenge.cities.length, language)}`} />
        <Stat label={t('tsp.totalDistance')} value={`${formatNumber(distanceSoFar, language)} ${t('common.km')}`} highlight />
      </div>

      <CurrentRoute cities={challenge.cities} order={visitedOrder} />

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t('tsp.remaining')}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {remaining.length === 0 ? (
            <span className="text-xs text-slate-400">—</span>
          ) : (
            remaining.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                <span aria-hidden="true">{c.icon}</span>
                {t(c.nameKey)}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, accent, highlight }: { label: string; value: string; accent?: boolean; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={'truncate text-sm font-black ' + (highlight ? 'text-leaf-600' : accent ? 'text-brand-600' : 'text-slate-700')}>{value}</p>
    </div>
  )
}
