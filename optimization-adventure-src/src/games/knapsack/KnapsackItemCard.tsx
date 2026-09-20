import { motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nContext'
import { formatNumber } from '../../utils/format'
import type { KnapsackItem } from '../../types'

export function KnapsackItemCard({
  item,
  inBackpack,
  disabled,
  onToggle,
}: {
  item: KnapsackItem
  inBackpack: boolean
  disabled: boolean
  onToggle: () => void
}) {
  const { t, language } = useI18n()

  return (
    <motion.button
      type="button"
      layout
      onClick={onToggle}
      disabled={disabled && !inBackpack}
      whileTap={{ scale: 0.95 }}
      className={
        'focus-ring flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center shadow-sm transition ' +
        (inBackpack
          ? 'border-brand-500 bg-brand-50 shadow-md'
          : disabled
            ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-50'
            : 'border-transparent bg-white hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md')
      }
      aria-pressed={inBackpack}
    >
      <span className="text-3xl" aria-hidden="true">
        {item.icon}
      </span>
      <span className="text-xs font-bold text-slate-700">{t(item.nameKey)}</span>
      <span className="flex gap-2 text-[11px] font-semibold text-slate-500">
        <span>
          ⚖️ {formatNumber(item.weight, language)} {t('knapsack.weightUnit')}
        </span>
        <span>💎 {formatNumber(item.value, language)}</span>
      </span>
      {inBackpack && <span className="mt-0.5 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">✓</span>}
    </motion.button>
  )
}
