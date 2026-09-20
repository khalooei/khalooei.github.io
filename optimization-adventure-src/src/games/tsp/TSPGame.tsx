import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nContext'
import { usePlayerStore, TSP_MAX_STAGE_COUNT } from '../../hooks/usePlayerStore'
import { useSound, useVibrate } from '../../hooks/useSound'
import { useTutorialSeen } from '../../hooks/useTutorialSeen'
import {
  generateTSPChallenge,
  isCompleteValidRoute,
  normalizeRouteKey,
  possibleRouteCount,
  routeDistance,
  solveTSPOptimal,
} from '../../algorithms/tsp'
import { StageBadge } from '../../components/StageBadge'
import { ObjectiveConstraintCard } from '../../components/ObjectiveConstraintCard'
import { TutorialOverlay } from '../../components/TutorialOverlay'
import { Confetti } from '../../components/Confetti'
import { TSPMap } from './TSPMap'
import { TSPStatusPanel } from './TSPStatusPanel'
import { RouteHistory } from './RouteHistory'
import { RouteDiscoveryPanel } from './RouteDiscoveryPanel'
import { CombinatorialExplosion } from './CombinatorialExplosion'
import { TSPResults } from './TSPResults'
import { formatNumber } from '../../utils/format'
import type { City, TSPAttempt, TSPStageResult } from '../../types'
import type { Route } from '../../hooks/useHashRoute'

export function TSPGame({ navigate }: { navigate: (route: Route) => void }) {
  const { t, translation, language } = useI18n()
  const playSound = useSound()
  const vibrate = useVibrate()
  const name = usePlayerStore((s) => s.name) ?? 'guest'
  const progress = usePlayerStore((s) => s.progress)
  const recordTspAttempt = usePlayerStore((s) => s.recordTspAttempt)
  const completeTspStage = usePlayerStore((s) => s.completeTspStage)
  const resetTspStageAttempts = usePlayerStore((s) => s.resetTspStageAttempts)

  const [currentStage, setCurrentStage] = useState(() => Math.min(progress.tspStage, TSP_MAX_STAGE_COUNT))
  const [round, setRound] = useState(0)

  const challenge = useMemo(() => generateTSPChallenge(currentStage, `${name}-${currentStage}-${round}`), [currentStage, round, name])

  const [visitedOrder, setVisitedOrder] = useState<string[]>(() => [challenge.startCityId])
  const [justCompleted, setJustCompleted] = useState<TSPAttempt | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [shakeCityId, setShakeCityId] = useState<string | null>(null)
  const [invalidTargetId, setInvalidTargetId] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showDistances, setShowDistances] = useState(false)
  const [travelHop, setTravelHop] = useState<{ from: City; to: City; key: number } | null>(null)
  const [tutorialSeen, markTutorialSeen, showTutorialAgain] = useTutorialSeen('tsp')

  useEffect(() => {
    setVisitedOrder([challenge.startCityId])
    setJustCompleted(null)
  }, [challenge])

  const byId = new Map(challenge.cities.map((c) => [c.id, c]))
  const isMaxStage = currentStage >= TSP_MAX_STAGE_COUNT
  const attempts = progress.tspAttemptsByStage[currentStage] ?? []
  const isStage1 = challenge.cities.length === 4
  const optimal = useMemo(() => solveTSPOptimal(challenge), [challenge])

  const distanceSoFar = useMemo(() => {
    let total = 0
    for (let i = 0; i < visitedOrder.length - 1; i++) {
      const a = byId.get(visitedOrder[i])
      const b = byId.get(visitedOrder[i + 1])
      if (a && b) total += routeDistance([a.id, b.id], challenge)
    }
    return total
  }, [visitedOrder, challenge])

  const handleCityClick = (cityId: string) => {
    if (justCompleted) return
    const current = visitedOrder[visitedOrder.length - 1]
    if (cityId === current) return

    const isStart = cityId === challenge.startCityId

    if (isStart) {
      if (visitedOrder.length < challenge.cities.length) {
        setErrorMsg(t('tsp.mustFinishFirst'))
        setShakeCityId(challenge.startCityId)
        setInvalidTargetId(cityId)
        playSound('error')
        vibrate([40, 40, 40])
        window.setTimeout(() => setShakeCityId(null), 500)
        window.setTimeout(() => setInvalidTargetId(null), 600)
        window.setTimeout(() => setErrorMsg(null), 2600)
        return
      }

      const fullRoute = [...visitedOrder, cityId]
      const distance = routeDistance(fullRoute, challenge)
      const valid = isCompleteValidRoute(fullRoute, challenge)
      const key = normalizeRouteKey(fullRoute)
      const isDuplicate = attempts.some((a) => a.valid && normalizeRouteKey(a.route) === key)

      const fromCity = byId.get(current)
      const toCity = byId.get(cityId)
      if (fromCity && toCity) setTravelHop({ from: fromCity, to: toCity, key: Date.now() })

      const attempt: TSPAttempt = { id: `${Date.now()}`, route: fullRoute, distance, valid, timestamp: Date.now() }

      if (!isDuplicate) {
        recordTspAttempt(currentStage, attempt)
        const updatedAttempts = [...attempts, attempt]
        const bestDistance = updatedAttempts.filter((a) => a.valid).reduce((min, a) => Math.min(min, a.distance), Infinity)
        const bestAttempt = updatedAttempts.find((a) => a.valid && a.distance === bestDistance)
        const stageResult: TSPStageResult = {
          challengeId: challenge.id,
          level: currentStage,
          bestDistance,
          bestRoute: bestAttempt?.route ?? fullRoute,
          optimalDistance: optimal.distance,
          optimalRoute: optimal.route,
          attemptCount: updatedAttempts.length,
          efficiency: bestDistance > 0 ? Math.min(100, (optimal.distance / bestDistance) * 100) : 100,
        }
        completeTspStage(currentStage, stageResult)
        playSound('win')
        setShowConfetti(true)
        window.setTimeout(() => setShowConfetti(false), 2600)
      } else {
        setErrorMsg(t('tsp.duplicateRoute'))
        window.setTimeout(() => setErrorMsg(null), 2600)
      }

      setVisitedOrder(fullRoute)
      setJustCompleted(attempt)
      return
    }

    if (visitedOrder.includes(cityId)) {
      setErrorMsg(t('tsp.alreadyVisited'))
      setShakeCityId(cityId)
      playSound('error')
      vibrate([40, 40, 40])
      window.setTimeout(() => setShakeCityId(null), 500)
      window.setTimeout(() => setErrorMsg(null), 2600)
      return
    }

    const fromCity = byId.get(current)
    const toCity = byId.get(cityId)
    if (fromCity && toCity) setTravelHop({ from: fromCity, to: toCity, key: Date.now() })
    setVisitedOrder((prev) => [...prev, cityId])
    playSound('travel')
  }

  const tryAnother = () => {
    setVisitedOrder([challenge.startCityId])
    setJustCompleted(null)
  }

  const nextStage = () => {
    setCurrentStage((s) => Math.min(TSP_MAX_STAGE_COUNT, s + 1))
    setRound((r) => r + 1)
  }

  const bestStageResult = progress.tspBestByStage[currentStage]

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
          <StageBadge stage={currentStage} max={TSP_MAX_STAGE_COUNT} />
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {t('tsp.difficultyCities', { count: formatNumber(challenge.cities.length, language) })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <input type="checkbox" checked={showDistances} onChange={(e) => setShowDistances(e.target.checked)} className="accent-brand-600" />
            {t('tsp.showDistances')}
          </label>
          <button
            type="button"
            className="focus-ring text-xs font-semibold text-rose-500 underline decoration-dotted"
            onClick={() => resetTspStageAttempts(currentStage)}
          >
            {t('tsp.resetStageCta')}
          </button>
          <button type="button" className="focus-ring text-xs font-semibold text-brand-600 underline decoration-dotted" onClick={showTutorialAgain}>
            {t('tutorial.showAgain')}
          </button>
        </div>
      </div>

      <h1 className="mt-4 text-2xl font-extrabold text-slate-800">{t('games.tsp.title')}</h1>

      <div className="mt-4">
        <ObjectiveConstraintCard
          objectiveLabel={t('knapsack.objectiveLabel')}
          objectiveValue={t('tsp.objectiveValue')}
          constraintLabel={t('knapsack.constraintLabel')}
          constraintValue={t('tsp.constraintValue')}
        />
      </div>

      <p className="mt-3 rounded-xl bg-brand-50 px-4 py-2.5 text-xs font-medium text-brand-700">💡 {t('tsp.hint')}</p>

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700"
            role="alert"
          >
            ⚠️ {errorMsg}
          </motion.div>
        )}
        {!errorMsg && visitedOrder.length === challenge.cities.length && !justCompleted && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 rounded-xl border border-leaf-200 bg-leaf-50 px-4 py-2.5 text-sm font-semibold text-leaf-700"
          >
            🏁 {t('tsp.returnPrompt')}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="flex flex-col gap-4">
          <TSPMap
            challenge={challenge}
            visitedOrder={visitedOrder}
            shakeCityId={shakeCityId}
            invalidTargetId={invalidTargetId}
            onCityClick={handleCityClick}
            showDistances={showDistances}
            optimalRoute={null}
            travelHop={travelHop}
          />
          {isStage1 && <RouteDiscoveryPanel attempts={attempts} cities={challenge.cities} totalPossible={possibleRouteCount(4)} />}
          <CombinatorialExplosion highlightCities={challenge.cities.length} />
        </div>

        <div className="flex flex-col gap-4">
          <TSPStatusPanel challenge={challenge} visitedOrder={visitedOrder} distanceSoFar={distanceSoFar} />
          <div className="card-surface rounded-2xl p-4">
            <h3 className="mb-2 text-sm font-extrabold text-slate-600">{t('tsp.routeHistoryTitle')}</h3>
            <RouteHistory attempts={attempts} cities={challenge.cities} />
          </div>
        </div>
      </div>

      {justCompleted && (
        <div className="mt-8">
          <TSPResults
            cities={challenge.cities}
            lastRoute={justCompleted.route}
            lastDistance={justCompleted.distance}
            bestDistance={bestStageResult?.bestDistance ?? justCompleted.distance}
            bestRoute={bestStageResult?.bestRoute ?? justCompleted.route}
            optimalDistance={optimal.distance}
            optimalRoute={optimal.route}
            attemptCount={bestStageResult?.attemptCount ?? attempts.length}
            isMaxStage={isMaxStage}
            onTryAnother={tryAnother}
            onNextStage={nextStage}
          />
        </div>
      )}

      <TutorialOverlay open={!tutorialSeen} title={t('tutorial.tsp.title')} steps={translation.tutorial.tsp.steps} onClose={markTutorialSeen} />
    </div>
  )
}
