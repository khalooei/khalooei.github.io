import { useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nContext'
import { EducationalTip } from '../../components/EducationalTip'
import { formatNumber } from '../../utils/format'
import type { KnapsackChallenge } from '../../types'

export function KnapsackResults({
  challenge,
  studentIds,
  optimalIds,
  studentValue,
  studentWeight,
  optimalValue,
  optimalWeight,
  efficiency,
  isMaxStage,
  onNextStage,
  onPlayAgain,
}: {
  challenge: KnapsackChallenge
  studentIds: string[]
  optimalIds: string[]
  studentValue: number
  studentWeight: number
  optimalValue: number
  optimalWeight: number
  efficiency: number
  isMaxStage: boolean
  onNextStage: () => void
  onPlayAgain: () => void
}) {
  const { t, language } = useI18n()
  const [showSolver, setShowSolver] = useState(false)
  const itemById = new Map(challenge.items.map((it) => [it.id, it]))

  return (
    <motion.div
      className="card-surface rounded-3xl p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
        <span aria-hidden="true">🏁</span>
        {t('knapsack.resultsTitle')}
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <ResultStat label={t('knapsack.yourValue')} value={formatNumber(studentValue, language)} accent />
        <ResultStat label={t('knapsack.yourWeight')} value={formatNumber(studentWeight, language)} />
        <ResultStat label={t('knapsack.optimalValue')} value={formatNumber(optimalValue, language)} accent />
        <ResultStat label={t('knapsack.optimalWeight')} value={formatNumber(optimalWeight, language)} />
        <ResultStat label={t('knapsack.efficiency')} value={`${formatNumber(Math.round(efficiency), language)}%`} highlight />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t('knapsack.yourCombination')}</p>
          <ItemChips ids={studentIds} itemById={itemById} nameFn={t} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t('knapsack.optimalCombination')}</p>
          <ItemChips ids={optimalIds} itemById={itemById} nameFn={t} highlight />
        </div>
      </div>

      <div className="mt-5">
        <EducationalTip text={t('knapsack.takeaway')} />
      </div>

      <div className="mt-5">
        <button
          type="button"
          className="focus-ring text-sm font-bold text-brand-600 underline decoration-dotted hover:text-brand-700"
          onClick={() => setShowSolver((s) => !s)}
        >
          {showSolver ? t('knapsack.hideSolverCta') : t('knapsack.showSolverCta')}
        </button>
        {showSolver && (
          <p className="mt-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
            {t('knapsack.solverExplanation', { capacity: formatNumber(challenge.capacity, language) })}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="focus-ring rounded-full border border-brand-200 bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-sm hover:bg-brand-50"
          onClick={onPlayAgain}
        >
          {t('knapsack.playAgain')}
        </button>
        {!isMaxStage && (
          <button
            type="button"
            className="focus-ring rounded-full bg-gradient-to-r from-brand-600 to-sunset-500 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-105"
            onClick={onNextStage}
          >
            {t('knapsack.nextStage')} →
          </button>
        )}
      </div>
    </motion.div>
  )
}

function ResultStat({ label, value, accent, highlight }: { label: string; value: string; accent?: boolean; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={'text-lg font-black ' + (highlight ? 'text-leaf-600' : accent ? 'text-sunset-600' : 'text-slate-700')}>{value}</p>
    </div>
  )
}

function ItemChips({
  ids,
  itemById,
  nameFn,
  highlight,
}: {
  ids: string[]
  itemById: Map<string, { icon: string; nameKey: string }>
  nameFn: (key: string) => string
  highlight?: boolean
}) {
  if (ids.length === 0) return <p className="mt-1 text-xs text-slate-400">—</p>
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const item = itemById.get(id)
        if (!item) return null
        return (
          <span
            key={id}
            className={
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ' +
              (highlight ? 'bg-leaf-500/15 text-leaf-700' : 'bg-brand-500/10 text-brand-700')
            }
          >
            <span aria-hidden="true">{item.icon}</span>
            {nameFn(item.nameKey)}
          </span>
        )
      })}
    </div>
  )
}
