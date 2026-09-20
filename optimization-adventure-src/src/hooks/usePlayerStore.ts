import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  Achievement,
  AchievementId,
  GameProgressState,
  KnapsackAttemptResult,
  Language,
  TSPAttempt,
  TSPStageResult,
} from '../types'
import { DEFAULT_LANGUAGE } from '../i18n/languages'
import { storageKey } from '../utils/storage'

const KNAPSACK_MAX_STAGE = 5
const TSP_MAX_STAGE = 5

function emptyProgress(): GameProgressState {
  return {
    version: 1,
    knapsackStage: 1,
    knapsackCompletedStages: [],
    knapsackBestEfficiency: {},
    knapsackAttempts: [],
    tspStage: 1,
    tspCompletedStages: [],
    tspBestByStage: {},
    tspAttemptsByStage: {},
    achievements: [],
  }
}

interface PlayerState {
  name: string | null
  language: Language
  soundEnabled: boolean
  progress: GameProgressState

  setName: (name: string) => void
  setLanguage: (lang: Language) => void
  toggleSound: () => void

  recordKnapsackAttempt: (result: KnapsackAttemptResult) => void
  recordTspAttempt: (stage: number, attempt: TSPAttempt) => void
  completeTspStage: (stage: number, result: TSPStageResult) => void
  resetTspStageAttempts: (stage: number) => void
  unlockAchievement: (id: AchievementId) => void
  resetProgress: () => void
}

function unlock(list: Achievement[], id: AchievementId): Achievement[] {
  if (list.some((a) => a.id === id)) return list
  return [...list, { id, unlockedAt: Date.now() }]
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      name: null,
      language: DEFAULT_LANGUAGE,
      soundEnabled: true,
      progress: emptyProgress(),

      setName: (name) => set({ name: name.trim().slice(0, 40) }),
      setLanguage: (language) => set({ language }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

      recordKnapsackAttempt: (result) =>
        set((s) => {
          const progress = { ...s.progress }
          progress.knapsackAttempts = [...progress.knapsackAttempts, result]

          const prevBest = progress.knapsackBestEfficiency[result.level] ?? 0
          progress.knapsackBestEfficiency = {
            ...progress.knapsackBestEfficiency,
            [result.level]: Math.max(prevBest, result.efficiency),
          }

          const wasFirstCompletion = !progress.knapsackCompletedStages.includes(result.level)
          if (wasFirstCompletion) {
            progress.knapsackCompletedStages = [...progress.knapsackCompletedStages, result.level]
          }
          progress.knapsackStage = Math.min(
            KNAPSACK_MAX_STAGE,
            Math.max(progress.knapsackStage, result.level + 1),
          )

          let achievements = progress.achievements
          if (wasFirstCompletion) achievements = unlock(achievements, 'smart-packer')
          if (result.efficiency >= 90) achievements = unlock(achievements, 'optimization-explorer')
          if (progress.knapsackCompletedStages.length + progress.tspCompletedStages.length >= 5) {
            achievements = unlock(achievements, 'constraint-champion')
          }
          progress.achievements = achievements

          return { progress }
        }),

      recordTspAttempt: (stage, attempt) =>
        set((s) => {
          const progress = { ...s.progress }
          const list = progress.tspAttemptsByStage[stage] ?? []
          progress.tspAttemptsByStage = { ...progress.tspAttemptsByStage, [stage]: [...list, attempt] }
          return { progress }
        }),

      completeTspStage: (stage, result) =>
        set((s) => {
          const progress = { ...s.progress }
          const prevBest = progress.tspBestByStage[stage]
          if (!prevBest || result.bestDistance < prevBest.bestDistance) {
            progress.tspBestByStage = { ...progress.tspBestByStage, [stage]: result }
          }

          const wasFirstCompletion = !progress.tspCompletedStages.includes(stage)
          if (wasFirstCompletion) {
            progress.tspCompletedStages = [...progress.tspCompletedStages, stage]
          }
          progress.tspStage = Math.min(TSP_MAX_STAGE, Math.max(progress.tspStage, stage + 1))

          let achievements = progress.achievements
          if (wasFirstCompletion) achievements = unlock(achievements, 'route-finder')
          if (result.bestDistance <= result.optimalDistance) achievements = unlock(achievements, 'route-master')
          if (progress.knapsackCompletedStages.length + progress.tspCompletedStages.length >= 5) {
            achievements = unlock(achievements, 'constraint-champion')
          }
          progress.achievements = achievements

          return { progress }
        }),

      resetTspStageAttempts: (stage) =>
        set((s) => {
          const progress = { ...s.progress }
          const attempts = { ...progress.tspAttemptsByStage }
          delete attempts[stage]
          progress.tspAttemptsByStage = attempts
          const best = { ...progress.tspBestByStage }
          delete best[stage]
          progress.tspBestByStage = best
          progress.tspCompletedStages = progress.tspCompletedStages.filter((s2) => s2 !== stage)
          return { progress }
        }),

      unlockAchievement: (id) =>
        set((s) => ({ progress: { ...s.progress, achievements: unlock(s.progress.achievements, id) } })),

      resetProgress: () => set({ progress: emptyProgress() }),
    }),
    {
      name: storageKey('store'),
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        name: state.name,
        language: state.language,
        soundEnabled: state.soundEnabled,
        progress: state.progress,
      }),
    },
  ),
)

export const KNAPSACK_MAX_STAGE_COUNT = KNAPSACK_MAX_STAGE
export const TSP_MAX_STAGE_COUNT = TSP_MAX_STAGE
