import { AnimatePresence, motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nContext'
import { formatNumber } from '../../utils/format'
import type { KnapsackItem } from '../../types'

export function SelectedItemsList({ items, onRemove }: { items: KnapsackItem[]; onRemove: (id: string) => void }) {
  const { t, language } = useI18n()

  if (items.length === 0) {
    return <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">{t('knapsack.emptyBackpack')}</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="flex items-center justify-between gap-2 rounded-xl bg-brand-50 px-3 py-2"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span aria-hidden="true">{item.icon}</span>
              {t(item.nameKey)}
              <span className="text-xs font-medium text-slate-400">
                ⚖️{formatNumber(item.weight, language)} · 💎{formatNumber(item.value, language)}
              </span>
            </span>
            <button
              type="button"
              className="focus-ring rounded-full px-2 py-1 text-xs font-bold text-rose-500 hover:bg-rose-100"
              onClick={() => onRemove(item.id)}
              aria-label={t('knapsack.removeFromBackpack')}
            >
              ✕
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
