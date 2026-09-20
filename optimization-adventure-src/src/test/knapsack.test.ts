import { describe, expect, it } from 'vitest'
import {
  evaluateSelection,
  generateKnapsackChallenge,
  isWithinCapacity,
  levelForKnapsackStage,
  solveKnapsackOptimal,
} from '../algorithms/knapsack'
import type { KnapsackItem } from '../types'

describe('solveKnapsackOptimal', () => {
  it('solves the textbook example correctly', () => {
    const items: KnapsackItem[] = [
      { id: 'a', nameKey: '', icon: '', weight: 2, value: 3 },
      { id: 'b', nameKey: '', icon: '', weight: 3, value: 4 },
      { id: 'c', nameKey: '', icon: '', weight: 4, value: 5 },
      { id: 'd', nameKey: '', icon: '', weight: 5, value: 6 },
    ]
    const result = solveKnapsackOptimal(items, 5)
    expect(result.totalValue).toBe(7) // items a + b: weight 5, value 7
    expect(result.totalWeight).toBeLessThanOrEqual(5)
  })

  it('never exceeds capacity', () => {
    const items: KnapsackItem[] = [
      { id: 'a', nameKey: '', icon: '', weight: 10, value: 60 },
      { id: 'b', nameKey: '', icon: '', weight: 20, value: 100 },
      { id: 'c', nameKey: '', icon: '', weight: 30, value: 120 },
    ]
    const result = solveKnapsackOptimal(items, 50)
    expect(result.totalWeight).toBeLessThanOrEqual(50)
    expect(result.totalValue).toBe(220) // b + c
  })

  it('returns zero value for zero capacity', () => {
    const items: KnapsackItem[] = [{ id: 'a', nameKey: '', icon: '', weight: 1, value: 5 }]
    const result = solveKnapsackOptimal(items, 0)
    expect(result.totalValue).toBe(0)
    expect(result.selectedIds).toEqual([])
  })
})

describe('evaluateSelection / isWithinCapacity', () => {
  const items: KnapsackItem[] = [
    { id: 'a', nameKey: '', icon: '', weight: 2, value: 3 },
    { id: 'b', nameKey: '', icon: '', weight: 3, value: 4 },
  ]

  it('sums weight and value of the selection', () => {
    expect(evaluateSelection(items, ['a', 'b'])).toEqual({
      selectedIds: ['a', 'b'],
      totalWeight: 5,
      totalValue: 7,
    })
  })

  it('flags a selection exceeding capacity', () => {
    expect(isWithinCapacity(items, ['a', 'b'], 4)).toBe(false)
    expect(isWithinCapacity(items, ['a'], 4)).toBe(true)
  })
})

describe('generateKnapsackChallenge', () => {
  it('is deterministic for a given seed', () => {
    const c1 = generateKnapsackChallenge(1, 'SEED1')
    const c2 = generateKnapsackChallenge(1, 'SEED1')
    expect(c1.items).toEqual(c2.items)
    expect(c1.capacity).toEqual(c2.capacity)
  })

  it('produces the item count expected for the stage', () => {
    expect(generateKnapsackChallenge(1, 'X').items).toHaveLength(levelForKnapsackStage(1))
    expect(generateKnapsackChallenge(3, 'X').items).toHaveLength(levelForKnapsackStage(3))
  })

  it('avoids trivial challenges (not everything fits, not almost nothing fits)', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      for (let stage = 1; stage <= 5; stage++) {
        const challenge = generateKnapsackChallenge(stage, seed)
        const optimal = solveKnapsackOptimal(challenge.items, challenge.capacity)
        expect(optimal.selectedIds.length).toBeGreaterThan(1)
        expect(optimal.selectedIds.length).toBeLessThan(challenge.items.length)
      }
    }
  })
})
