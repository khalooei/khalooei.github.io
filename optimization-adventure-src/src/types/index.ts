export type Language = 'fa' | 'en' | 'ar'

export interface PlayerProfile {
  name: string
  language: Language
  soundEnabled: boolean
  createdAt: number
}

export interface KnapsackItem {
  id: string
  nameKey: string
  icon: string
  weight: number
  value: number
}

export interface KnapsackChallenge {
  id: string
  seed: string
  level: number
  capacity: number
  items: KnapsackItem[]
}

export interface KnapsackSolution {
  selectedIds: string[]
  totalWeight: number
  totalValue: number
}

export interface KnapsackAttemptResult {
  challengeId: string
  level: number
  studentValue: number
  studentWeight: number
  optimalValue: number
  optimalWeight: number
  efficiency: number
  selectedIds: string[]
  optimalIds: string[]
  timestamp: number
}

export interface City {
  id: string
  nameKey: string
  x: number
  y: number
  icon: string
}

export interface TSPChallenge {
  id: string
  seed: string
  level: number
  cities: City[]
  startCityId: string
}

export interface TSPAttempt {
  id: string
  route: string[]
  distance: number
  valid: boolean
  timestamp: number
}

export interface TSPStageResult {
  challengeId: string
  level: number
  bestDistance: number
  bestRoute: string[]
  optimalDistance: number
  optimalRoute: string[]
  attemptCount: number
  efficiency: number
}

export type AchievementId =
  | 'smart-packer'
  | 'optimization-explorer'
  | 'route-finder'
  | 'route-master'
  | 'constraint-champion'
  | 'search-space-explorer'

export interface Achievement {
  id: AchievementId
  unlockedAt: number
}

export interface GameProgressState {
  version: 1
  knapsackStage: number
  knapsackCompletedStages: number[]
  knapsackBestEfficiency: Record<number, number>
  knapsackAttempts: KnapsackAttemptResult[]
  tspStage: number
  tspCompletedStages: number[]
  tspBestByStage: Record<number, TSPStageResult>
  tspAttemptsByStage: Record<number, TSPAttempt[]>
  achievements: Achievement[]
}

export type GameMode = 'learn' | 'challenge'
