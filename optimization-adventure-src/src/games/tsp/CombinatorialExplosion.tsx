import { motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nContext'
import { TSP_LEVELS } from '../../data/cities'
import { possibleRouteCount } from '../../algorithms/tsp'
import { formatNumber } from '../../utils/format'

export function CombinatorialExplosion({ highlightCities }: { highlightCities: number }) {
  const { t, language } = useI18n()
  const max = possibleRouteCount(TSP_LEVELS[TSP_LEVELS.length - 1])

  return (
    <div className="card-surface rounded-2xl p-4">
      <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
        <span aria-hidden="true">📈</span>
        {t('tsp.combinatorialTitle')}
      </h3>
      <p className="mt-1 text-xs text-slate-500">{t('tsp.combinatorialBody', { cities: formatNumber(highlightCities, language) })}</p>

      <div className="mt-3 flex items-end gap-2">
        {TSP_LEVELS.map((n) => {
          const count = possibleRouteCount(n)
          const heightPct = Math.max(6, (Math.log(count + 1) / Math.log(max + 1)) * 100)
          const active = n === highlightCities
          return (
            <div key={n} className="flex flex-1 flex-col items-center gap-1">
              <motion.div
                className={'w-full rounded-t-lg ' + (active ? 'bg-gradient-to-t from-brand-600 to-sunset-500' : 'bg-slate-200')}
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}px` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ height: `${heightPct}px` }}
              />
              <span className={'text-[10px] font-black ' + (active ? 'text-brand-700' : 'text-slate-400')}>
                {formatNumber(count, language)}
              </span>
              <span className="text-[9px] font-semibold text-slate-400">{formatNumber(n, language)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
