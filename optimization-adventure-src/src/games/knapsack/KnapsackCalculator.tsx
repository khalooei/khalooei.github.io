import { useI18n } from '../../i18n/I18nContext'
import { ProgressBar } from '../../components/ProgressBar'
import { formatNumber } from '../../utils/format'

export function KnapsackCalculator({
  capacity,
  used,
  totalValue,
  itemCount,
  overflow,
}: {
  capacity: number
  used: number
  totalValue: number
  itemCount: number
  overflow: boolean
}) {
  const { t, language } = useI18n()
  const remaining = Math.max(0, capacity - used)

  return (
    <div className="card-surface rounded-2xl p-4">
      <ProgressBar
        value={used}
        max={capacity}
        danger={overflow}
        label={`${t('knapsack.capacity')}: ${formatNumber(capacity, language)} ${t('knapsack.weightUnit')}`}
        valueLabel={`${formatNumber(used, language)} / ${formatNumber(capacity, language)}`}
      />
      <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        <Stat label={t('knapsack.used')} value={`${formatNumber(used, language)}`} />
        <Stat label={t('knapsack.remaining')} value={`${formatNumber(remaining, language)}`} highlight={!overflow} />
        <Stat label={t('knapsack.totalValue')} value={formatNumber(totalValue, language)} accent />
        <Stat label={t('knapsack.itemsCount')} value={formatNumber(itemCount, language)} />
      </div>
    </div>
  )
}

function Stat({ label, value, accent, highlight }: { label: string; value: string; accent?: boolean; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={'text-lg font-black ' + (accent ? 'text-sunset-600' : highlight ? 'text-leaf-600' : 'text-slate-700')}>{value}</p>
    </div>
  )
}
