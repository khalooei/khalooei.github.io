import { useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nContext'
import { EducationalTip } from '../../components/EducationalTip'
import { formatNumber } from '../../utils/format'
import type { City } from '../../types'

export function TSPResults({
  cities,
  lastRoute,
  lastDistance,
  bestDistance,
  bestRoute,
  optimalDistance,
  optimalRoute,
  attemptCount,
  isMaxStage,
  onTryAnother,
  onNextStage,
}: {
  cities: City[]
  lastRoute: string[]
  lastDistance: number
  bestDistance: number
  bestRoute: string[]
  optimalDistance: number
  optimalRoute: string[]
  attemptCount: number
  isMaxStage: boolean
  onTryAnother: () => void
  onNextStage: () => void
}) {
  const { t, language } = useI18n()
  const [showOptimal, setShowOptimal] = useState(false)
  const byId = new Map(cities.map((c) => [c.id, c]))
  const routeText = (route: string[]) => route.map((id) => byId.get(id)?.icon ?? '?').join(' → ')
  const efficiency = bestDistance > 0 ? Math.min(100, (optimalDistance / bestDistance) * 100) : 100
  const difference = Math.max(0, bestDistance - optimalDistance)

  return (
    <motion.div className="card-surface rounded-3xl p-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h3 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
        <span aria-hidden="true">🏁</span>
        {t('common.stage')} {t('knapsack.resultsTitle')}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {t('tsp.yourRoute')}:{' '}
        <span dir="ltr" className="font-semibold text-slate-700">
          {routeText(lastRoute)}
        </span>{' '}
        — {formatNumber(lastDistance, language)} {t('common.km')}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t('tsp.yourBestDistance')} value={`${formatNumber(bestDistance, language)} ${t('common.km')}`} accent />
        <Stat label={t('tsp.optimalDistance')} value={`${formatNumber(optimalDistance, language)} ${t('common.km')}`} accent />
        <Stat label={t('tsp.difference')} value={`${formatNumber(difference, language)} ${t('common.km')}`} />
        <Stat label={t('tsp.attemptsCount')} value={formatNumber(attemptCount, language)} highlight />
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200/70">
        <div className="h-full rounded-full bg-gradient-to-r from-leaf-500 to-brand-500" style={{ width: `${Math.round(efficiency)}%` }} />
      </div>
      <p className="mt-1 text-end text-xs font-bold text-leaf-600">{formatNumber(Math.round(efficiency), language)}% </p>

      <div className="mt-4">
        <button
          type="button"
          className="focus-ring text-sm font-bold text-brand-600 underline decoration-dotted hover:text-brand-700"
          onClick={() => setShowOptimal((s) => !s)}
        >
          {showOptimal ? t('tsp.hideOptimalCta') : t('tsp.showOptimalCta')}
        </button>
        {showOptimal && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-brand-500/10 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">{t('tsp.yourRoute')}</p>
              <p dir="ltr" className="mt-1 text-sm font-semibold text-slate-700">
                {routeText(bestRoute)}
              </p>
            </div>
            <div className="rounded-xl bg-leaf-500/10 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-leaf-600">{t('tsp.optimalRoute')}</p>
              <p dir="ltr" className="mt-1 text-sm font-semibold text-slate-700">
                {routeText(optimalRoute)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5">
        <EducationalTip text={t('tsp.takeaway')} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="focus-ring rounded-full border border-brand-200 bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-sm hover:bg-brand-50"
          onClick={onTryAnother}
        >
          {t('common.tryAgain')}
        </button>
        {!isMaxStage && (
          <button
            type="button"
            className="focus-ring rounded-full bg-gradient-to-r from-brand-600 to-sunset-500 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-105"
            onClick={onNextStage}
          >
            {t('tsp.nextStage')} →
          </button>
        )}
      </div>
    </motion.div>
  )
}

function Stat({ label, value, accent, highlight }: { label: string; value: string; accent?: boolean; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={'text-lg font-black ' + (highlight ? 'text-leaf-600' : accent ? 'text-sunset-600' : 'text-slate-700')}>{value}</p>
    </div>
  )
}
