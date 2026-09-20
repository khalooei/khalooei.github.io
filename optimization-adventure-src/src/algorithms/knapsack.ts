import { KNAPSACK_ITEM_POOL, KNAPSACK_LEVELS } from '../data/knapsackItems'
import type { KnapsackChallenge, KnapsackItem, KnapsackSolution } from '../types'
import { createRng, hashStringToSeed, rngInt, shuffleWithRng } from './rng'

/**
 * Exact 0/1 knapsack solver via dynamic programming.
 * Weights are generated as small integers so a capacity-indexed DP table is exact and fast.
 */
export function solveKnapsackOptimal(items: KnapsackItem[], capacity: number): KnapsackSolution {
  const n = items.length
  // table[i][c] = best value achievable using the first i items with capacity c
  const table: number[][] = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1]
    for (let c = 0; c <= capacity; c++) {
      table[i][c] = table[i - 1][c]
      if (weight <= c) {
        table[i][c] = Math.max(table[i][c], table[i - 1][c - weight] + value)
      }
    }
  }

  const selectedIds: string[] = []
  let c = capacity
  for (let i = n; i >= 1; i--) {
    if (table[i][c] !== table[i - 1][c]) {
      const item = items[i - 1]
      selectedIds.push(item.id)
      c -= item.weight
    }
  }

  const totalValue = table[n][capacity]
  const totalWeight = items
    .filter((it) => selectedIds.includes(it.id))
    .reduce((s, it) => s + it.weight, 0)

  return { selectedIds, totalValue, totalWeight }
}

export function evaluateSelection(items: KnapsackItem[], selectedIds: string[]): KnapsackSolution {
  const selected = items.filter((it) => selectedIds.includes(it.id))
  return {
    selectedIds,
    totalWeight: selected.reduce((s, it) => s + it.weight, 0),
    totalValue: selected.reduce((s, it) => s + it.value, 0),
  }
}

export function isWithinCapacity(items: KnapsackItem[], selectedIds: string[], capacity: number): boolean {
  return evaluateSelection(items, selectedIds).totalWeight <= capacity
}

export function levelForKnapsackStage(stage: number): number {
  const idx = Math.min(Math.max(stage, 1), KNAPSACK_LEVELS.length) - 1
  return KNAPSACK_LEVELS[idx]
}

/**
 * Generates a random-but-meaningful knapsack challenge for the given stage/seed.
 * Rejects trivial layouts: everything fitting, almost nothing fitting, or the
 * naive best-value-to-weight-ratio item alone already being optimal.
 */
export function generateKnapsackChallenge(stage: number, seedInput: string): KnapsackChallenge {
  const itemCount = levelForKnapsackStage(stage)
  let attempt = 0
  const maxAttempts = 40

  while (attempt < maxAttempts) {
    const seed = `${seedInput}-${attempt}`
    const rng = createRng(hashStringToSeed(seed))
    const pool = shuffleWithRng(rng, KNAPSACK_ITEM_POOL).slice(0, itemCount)

    const items: KnapsackItem[] = pool.map((def, i) => ({
      id: `${def.id}-${i}`,
      nameKey: def.nameKey,
      icon: def.icon,
      weight: rngInt(rng, def.weightRange[0], def.weightRange[1]),
      value: rngInt(rng, def.valueRange[0], def.valueRange[1]),
    }))

    const totalWeight = items.reduce((s, it) => s + it.weight, 0)
    const ratio = 0.4 + rng() * 0.15 // capacity is 40-55% of combined weight
    const capacity = Math.max(
      Math.min(...items.map((it) => it.weight)) + 1,
      Math.round(totalWeight * ratio),
    )

    const optimal = solveKnapsackOptimal(items, capacity)

    const everythingFits = optimal.selectedIds.length === items.length
    const almostNothingFits = optimal.selectedIds.length <= 1
    const bestRatioItem = [...items].sort((a, b) => b.value / b.weight - a.value / a.weight)[0]
    const greedyByRatioOnlyMatchesOptimal =
      optimal.selectedIds.length === 1 && optimal.selectedIds[0] === bestRatioItem.id

    if (!everythingFits && !almostNothingFits && !greedyByRatioOnlyMatchesOptimal) {
      return {
        id: `KNAP-${seedInput}-S${stage}`,
        seed,
        level: stage,
        capacity,
        items,
      }
    }

    attempt++
  }

  // Fallback: accept the last generated attempt even if a heuristic flagged it,
  // so generation always terminates.
  const seed = `${seedInput}-${maxAttempts}`
  const rng = createRng(hashStringToSeed(seed))
  const pool = shuffleWithRng(rng, KNAPSACK_ITEM_POOL).slice(0, itemCount)
  const items: KnapsackItem[] = pool.map((def, i) => ({
    id: `${def.id}-${i}`,
    nameKey: def.nameKey,
    icon: def.icon,
    weight: rngInt(rng, def.weightRange[0], def.weightRange[1]),
    value: rngInt(rng, def.valueRange[0], def.valueRange[1]),
  }))
  const totalWeight = items.reduce((s, it) => s + it.weight, 0)
  const capacity = Math.round(totalWeight * 0.45)
  return { id: `KNAP-${seedInput}-S${stage}`, seed, level: stage, capacity, items }
}
