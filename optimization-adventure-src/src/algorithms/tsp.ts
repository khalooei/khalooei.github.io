import { CITY_POOL, TSP_LEVELS, TSP_START_CITY_ID } from '../data/cities'
import type { City, TSPChallenge } from '../types'
import { createRng, hashStringToSeed, shuffleWithRng } from './rng'

const DISTANCE_SCALE = 4.2 // converts map-percentage units into human "km" numbers
const MAP_MARGIN = 10
const MIN_SEPARATION = 16

export function euclideanDistance(a: City, b: City): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.round(Math.sqrt(dx * dx + dy * dy) * DISTANCE_SCALE)
}

export function levelForTspStage(stage: number): number {
  const idx = Math.min(Math.max(stage, 1), TSP_LEVELS.length) - 1
  return TSP_LEVELS[idx]
}

export function generateTSPChallenge(stage: number, seedInput: string): TSPChallenge {
  const cityCount = levelForTspStage(stage)
  const seed = `${seedInput}-tsp`
  const rng = createRng(hashStringToSeed(seed))

  const startDef = CITY_POOL.find((c) => c.id === TSP_START_CITY_ID) ?? CITY_POOL[0]
  const others = shuffleWithRng(
    rng,
    CITY_POOL.filter((c) => c.id !== startDef.id),
  ).slice(0, cityCount - 1)
  const defs = [startDef, ...others]

  const points: { x: number; y: number }[] = []
  for (let i = 0; i < defs.length; i++) {
    let placed: { x: number; y: number } | null = null
    for (let tries = 0; tries < 200 && !placed; tries++) {
      const candidate = {
        x: MAP_MARGIN + rng() * (100 - 2 * MAP_MARGIN),
        y: MAP_MARGIN + rng() * (100 - 2 * MAP_MARGIN),
      }
      const farEnough = points.every(
        (p) => Math.hypot(p.x - candidate.x, p.y - candidate.y) >= MIN_SEPARATION,
      )
      if (farEnough) placed = candidate
    }
    // Fallback: relax the constraint rather than looping forever on dense stages.
    points.push(
      placed ?? {
        x: MAP_MARGIN + rng() * (100 - 2 * MAP_MARGIN),
        y: MAP_MARGIN + rng() * (100 - 2 * MAP_MARGIN),
      },
    )
  }

  const cities: City[] = defs.map((def, i) => ({
    id: def.id,
    nameKey: def.nameKey,
    icon: def.icon,
    x: Math.round(points[i].x * 10) / 10,
    y: Math.round(points[i].y * 10) / 10,
  }))

  return {
    id: `TSP-${seedInput}-S${stage}`,
    seed,
    level: stage,
    cities,
    startCityId: startDef.id,
  }
}

export function buildDistanceMatrix(cities: City[]): number[][] {
  return cities.map((a) => cities.map((b) => euclideanDistance(a, b)))
}

export function routeDistance(cityIds: string[], challenge: TSPChallenge): number {
  const byId = new Map(challenge.cities.map((c) => [c.id, c]))
  let total = 0
  for (let i = 0; i < cityIds.length - 1; i++) {
    const a = byId.get(cityIds[i])
    const b = byId.get(cityIds[i + 1])
    if (!a || !b) return NaN
    total += euclideanDistance(a, b)
  }
  return total
}

/** A complete tour: starts and ends at the start city, visits every other city exactly once. */
export function isCompleteValidRoute(cityIds: string[], challenge: TSPChallenge): boolean {
  const n = challenge.cities.length
  if (cityIds.length !== n + 1) return false
  if (cityIds[0] !== challenge.startCityId || cityIds[n] !== challenge.startCityId) return false
  const middle = cityIds.slice(1, n)
  const uniqueMiddle = new Set(middle)
  if (uniqueMiddle.size !== middle.length) return false
  const expected = new Set(challenge.cities.map((c) => c.id))
  expected.delete(challenge.startCityId)
  for (const id of middle) if (!expected.has(id)) return false
  return true
}

export function normalizeRouteKey(cityIds: string[]): string {
  return cityIds.join('>')
}

/** Number of distinct directional tours with a fixed starting city: (n-1)! */
export function possibleRouteCount(cityCount: number): number {
  let result = 1
  for (let i = 2; i < cityCount; i++) result *= i
  return result
}

export interface TSPOptimalResult {
  route: string[]
  distance: number
}

/**
 * Exact TSP solver using Held-Karp dynamic programming (bitmask DP), O(2^n * n^2).
 * Comfortably handles up to ~13 cities without blocking the main thread.
 */
export function solveTSPOptimal(challenge: TSPChallenge): TSPOptimalResult {
  const cities = challenge.cities
  const n = cities.length
  const startIdx = cities.findIndex((c) => c.id === challenge.startCityId)
  const order = [cities[startIdx], ...cities.filter((_, i) => i !== startIdx)]
  const dist = buildDistanceMatrix(order)
  const m = n - 1 // number of non-start cities

  if (m === 0) return { route: [order[0].id], distance: 0 }
  if (m === 1) {
    return { route: [order[0].id, order[1].id, order[0].id], distance: dist[0][1] + dist[1][0] }
  }

  const FULL = (1 << m) - 1
  // dp[mask][i] = min cost to start at city 0, visit all cities in mask (bit i-1 = city i), end at city i
  const dp: Float64Array[] = Array.from({ length: 1 << m }, () => new Float64Array(m).fill(Infinity))
  const parent: Int8Array[] = Array.from({ length: 1 << m }, () => new Int8Array(m).fill(-1))

  for (let i = 0; i < m; i++) {
    dp[1 << i][i] = dist[0][i + 1]
  }

  for (let mask = 1; mask <= FULL; mask++) {
    for (let i = 0; i < m; i++) {
      if (!(mask & (1 << i))) continue
      const cur = dp[mask][i]
      if (!isFinite(cur)) continue
      for (let j = 0; j < m; j++) {
        if (mask & (1 << j)) continue
        const nextMask = mask | (1 << j)
        const cand = cur + dist[i + 1][j + 1]
        if (cand < dp[nextMask][j]) {
          dp[nextMask][j] = cand
          parent[nextMask][j] = i
        }
      }
    }
  }

  let bestEnd = 0
  let bestCost = Infinity
  for (let i = 0; i < m; i++) {
    const cost = dp[FULL][i] + dist[i + 1][0]
    if (cost < bestCost) {
      bestCost = cost
      bestEnd = i
    }
  }

  const pathIdx: number[] = []
  let mask = FULL
  let cur = bestEnd
  while (cur !== -1) {
    pathIdx.push(cur)
    const p = parent[mask][cur]
    mask ^= 1 << cur
    cur = p
  }
  pathIdx.reverse()

  const route = [order[0].id, ...pathIdx.map((i) => order[i + 1].id), order[0].id]
  return { route, distance: Math.round(bestCost) }
}
