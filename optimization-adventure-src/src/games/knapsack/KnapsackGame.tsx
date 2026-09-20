import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nContext'
import { usePlayerStore } from '../../hooks/usePlayerStore'
import { useSound, useVibrate } from '../../hooks/useSound'
import { useTutorialSeen } from '../../hooks/useTutorialSeen'
import { generateKnapsackChallenge, evaluateSelection, solveKnapsackOptimal } from '../../algorithms/knapsack'
import { KNAPSACK_MAX_STAGE_COUNT } from '../../hooks/usePlayerStore'
import { StageBadge } from '../../components/StageBadge'
import { ObjectiveConstraintCard } from '../../components/ObjectiveConstraintCard'
import { TutorialOverlay } from '../../components/TutorialOverlay'
import { Confetti } from '../../components/Confetti'
import { KnapsackItemCard } from './KnapsackItemCard'
import { AnimatedBackpack } from './AnimatedBackpack'
import { KnapsackCalculator } from './KnapsackCalculator'
import { SelectedItemsList } from './SelectedItemsList'
import { KnapsackResults } from './KnapsackResults'
import { formatNumber } from '../../utils/format'
import type { KnapsackAttemptResult } from '../../types'
import type { Route } from '../../hooks/useHashRoute'

export function KnapsackGame({ navigate }: { navigate: (route: Route) => void }) {
  const { t, translation, language } = useI18n()
  const playSound = useSound()
  const vibrate = useVibrate()
  const name = usePlayerStore((s) => s.name) ?? 'guest'
  const progress = usePlayerStore((s) => s.progress)
  const recordKnapsackAttempt = usePlayerStore((s) => s.recordKnapsackAttempt)

  const [currentStage, setCurrentStage] = useState(() => Math.min(progress.knapsackStage, KNAPSACK_MAX_STAGE_COUNT))
  const [round, setRound] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<KnapsackAttemptResult | null>(null)
  const [overflowMsg, setOverflowMsg] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [mode, setMode] = useState<'learn' | 'challenge'>('learn')
  const [tutorialSeen, markTutorialSeen, showTutorialAgain] = useTutorialSeen('knapsack')

  const challenge = useMemo(
    () => generateKnapsackChallenge(currentStage, `${name}-${currentStage}-${round}`),
    [currentStage, round, name],
  )

  const selectedItems = challenge.items.filter((it) => selectedIds.includes(it.id))
  const evaluation = evaluateSelection(challenge.items, selectedIds)
  const overflow = evaluation.totalWeight > challenge.capacity
  const isMaxStage = currentStage >= KNAPSACK_MAX_STAGE_COUNT

  const resetRound = () => {
    setSelectedIds([])
    setSubmitted(false)
    setResult(null)
  }

  const handleToggle = (id: string) => {
    if (submitted) return
    const item = challenge.items.find((it) => it.id === id)
    if (!item) return

    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      playSound('click')
      return
    }

    const prospectiveWeight = evaluation.totalWeight + item.weight
    if (prospectiveWeight > challenge.capacity) {
      setOverflowMsg(
        t('knapsack.capacityExceeded', { remaining: formatNumber(Math.max(0, challenge.capacity - evaluation.totalWeight), language) }),
      )
      setShake(true)
      playSound('error')
      vibrate([40, 40, 40])
      window.setTimeout(() => setShake(false), 500)
      window.setTimeout(() => setOverflowMsg(null), 2800)
      return
    }

    setSelectedIds((prev) => [...prev, id])
    playSound('select')
  }

  const handleSubmit = () => {
    const optimal = solveKnapsackOptimal(challenge.items, challenge.capacity)
    const efficiency = optimal.totalValue > 0 ? (evaluation.totalValue / optimal.totalValue) * 100 : 100
    const attempt: KnapsackAttemptResult = {
      challengeId: challenge.id,
      level: currentStage,
      studentValue: evaluation.totalValue,
      studentWeight: evaluation.totalWeight,
      optimalValue: optimal.totalValue,
      optimalWeight: optimal.totalWeight,
      efficiency,
      selectedIds,
      optimalIds: optimal.selectedIds,
      timestamp: Date.now(),
    }
    recordKnapsackAttempt(attempt)
    setResult(attempt)
    setSubmitted(true)
    playSound('win')
    setShowConfetti(true)
    window.setTimeout(() => setShowConfetti(false), 2600)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6">
      {showConfetti && <Confetti />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="focus-ring rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
            onClick={() => navigate('landing')}
          >
            ← {t('common.home')}
          </button>
          <StageBadge stage={currentStage} max={KNAPSACK_MAX_STAGE_COUNT} />
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {t('knapsack.difficultyItems', { count: formatNumber(challenge.items.length, language) })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle mode={mode} setMode={setMode} />
          <button
            type="button"
            className="focus-ring text-xs font-semibold text-brand-600 underline decoration-dotted"
            onClick={showTutorialAgain}
          >
            {t('tutorial.showAgain')}
          </button>
        </div>
      </div>

      <h1 className="mt-4 text-2xl font-extrabold text-slate-800">{t('games.knapsack.title')}</h1>

      <div className="mt-4">
        <ObjectiveConstraintCard
          objectiveLabel={t('knapsack.objectiveLabel')}
          objectiveValue={t('knapsack.objectiveValue')}
          constraintLabel={t('knapsack.constraintLabel')}
          constraintValue={t('knapsack.constraintValue')}
        />
      </div>

      {mode === 'learn' && (
        <p className="mt-3 rounded-xl bg-brand-50 px-4 py-2.5 text-xs font-medium text-brand-700">💡 {t('knapsack.hint')}</p>
      )}

      <AnimatePresence>
        {overflowMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700"
            role="alert"
          >
            ⚠️ {overflowMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_auto_1fr] lg:items-start">
        <section className="card-surface rounded-3xl p-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">{t('knapsack.shelfTitle')}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {challenge.items.map((item) => (
              <KnapsackItemCard
                key={item.id}
                item={item}
                inBackpack={selectedIds.includes(item.id)}
                disabled={submitted}
                onToggle={() => handleToggle(item.id)}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center gap-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">{t('knapsack.backpackTitle')}</h2>
          <AnimatedBackpack fillPct={(evaluation.totalWeight / challenge.capacity) * 100} shake={shake} overflow={overflow} />
        </section>

        <section className="flex flex-col gap-4">
          <KnapsackCalculator
            capacity={challenge.capacity}
            used={evaluation.totalWeight}
            totalValue={evaluation.totalValue}
            itemCount={selectedItems.length}
            overflow={overflow}
          />
          <div className="card-surface rounded-2xl p-4">
            <h3 className="mb-2 text-sm font-extrabold text-slate-600">{t('knapsack.backpackTitle')}</h3>
            <SelectedItemsList items={selectedItems} onRemove={(id) => handleToggle(id)} />
          </div>
          {!submitted && (
            <button
              type="button"
              className="focus-ring rounded-full bg-gradient-to-r from-brand-600 to-sunset-500 px-6 py-3 text-base font-extrabold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={selectedIds.length === 0}
            >
              {t('knapsack.submitCta')}
            </button>
          )}
        </section>
      </div>

      {submitted && result && (
        <div className="mt-8">
          <KnapsackResults
            challenge={challenge}
            studentIds={result.selectedIds}
            optimalIds={result.optimalIds}
            studentValue={result.studentValue}
            studentWeight={result.studentWeight}
            optimalValue={result.optimalValue}
            optimalWeight={result.optimalWeight}
            efficiency={result.efficiency}
            isMaxStage={isMaxStage}
            onPlayAgain={() => {
              setRound((r) => r + 1)
              resetRound()
            }}
            onNextStage={() => {
              setCurrentStage((s) => Math.min(KNAPSACK_MAX_STAGE_COUNT, s + 1))
              setRound((r) => r + 1)
              resetRound()
            }}
          />
        </div>
      )}

      <TutorialOverlay
        open={!tutorialSeen}
        title={t('tutorial.knapsack.title')}
        steps={translation.tutorial.knapsack.steps}
        onClose={markTutorialSeen}
      />
    </div>
  )
}

function ModeToggle({ mode, setMode }: { mode: 'learn' | 'challenge'; setMode: (m: 'learn' | 'challenge') => void }) {
  const { t } = useI18n()
  return (
    <div className="flex overflow-hidden rounded-full border border-slate-200 bg-white text-xs font-bold">
      <button
        type="button"
        className={'px-3 py-1.5 transition ' + (mode === 'learn' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:bg-slate-50')}
        onClick={() => setMode('learn')}
      >
        {t('modes.learn')}
      </button>
      <button
        type="button"
        className={'px-3 py-1.5 transition ' + (mode === 'challenge' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:bg-slate-50')}
        onClick={() => setMode('challenge')}
      >
        {t('modes.challenge')}
      </button>
    </div>
  )
}
