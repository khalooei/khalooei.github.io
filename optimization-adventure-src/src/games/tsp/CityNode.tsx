import { motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nContext'
import type { City } from '../../types'

export type CityState = 'start' | 'current' | 'visited' | 'not-visited'

export function CityNode({
  city,
  state,
  shake,
  onClick,
  disabled,
}: {
  city: City
  state: CityState
  shake: boolean
  onClick: () => void
  disabled: boolean
}) {
  const { t } = useI18n()

  const ring =
    state === 'current'
      ? 'ring-4 ring-brand-500 animate-pulse-ring'
      : state === 'start'
        ? 'ring-4 ring-sunset-500'
        : state === 'visited'
          ? 'ring-2 ring-leaf-500'
          : 'ring-2 ring-slate-200'

  const bg =
    state === 'current'
      ? 'bg-brand-500 text-white'
      : state === 'start'
        ? 'bg-sunset-500 text-white'
        : state === 'visited'
          ? 'bg-leaf-500 text-white'
          : 'bg-white text-slate-700'

  return (
    <motion.button
      type="button"
      className={
        'focus-ring absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-full ' +
        (shake ? 'animate-shake' : '')
      }
      style={{ left: `${city.x}%`, top: `${city.y}%` }}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.08 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      aria-label={`${t(city.nameKey)} — ${state === 'current' ? t('tsp.youAreHere') : state === 'start' ? t('tsp.startBadge') : state === 'visited' ? t('tsp.visitedBadge') : t('tsp.notVisitedBadge')}`}
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-lg ${ring} ${bg} sm:h-14 sm:w-14`}>
        <span aria-hidden="true">{city.icon}</span>
      </span>
      <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm">{t(city.nameKey)}</span>
      {state === 'current' && (
        <span className="absolute -top-6 rounded-full bg-brand-600 px-2 py-0.5 text-[9px] font-bold text-white shadow">
          {t('tsp.youAreHere')}
        </span>
      )}
    </motion.button>
  )
}
