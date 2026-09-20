import { describe, expect, it } from 'vitest'
import {
  euclideanDistance,
  generateTSPChallenge,
  isCompleteValidRoute,
  normalizeRouteKey,
  possibleRouteCount,
  routeDistance,
  solveTSPOptimal,
} from '../algorithms/tsp'
import type { City, TSPChallenge } from '../types'

function bruteForceOptimal(challenge: TSPChallenge) {
  const others = challenge.cities.filter((c) => c.id !== challenge.startCityId).map((c) => c.id)
  const permute = (arr: string[]): string[][] => {
    if (arr.length <= 1) return [arr]
    const result: string[][] = []
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)]
      for (const p of permute(rest)) result.push([arr[i], ...p])
    }
    return result
  }
  let best = Infinity
  for (const perm of permute(others)) {
    const route = [challenge.startCityId, ...perm, challenge.startCityId]
    const d = routeDistance(route, challenge)
    if (d < best) best = d
  }
  return best
}

describe('euclideanDistance', () => {
  it('is symmetric and zero for identical points', () => {
    const a: City = { id: 'a', nameKey: '', icon: '', x: 10, y: 10 }
    const b: City = { id: 'b', nameKey: '', icon: '', x: 40, y: 50 }
    expect(euclideanDistance(a, a)).toBe(0)
    expect(euclideanDistance(a, b)).toBe(euclideanDistance(b, a))
    expect(euclideanDistance(a, b)).toBeGreaterThan(0)
  })
})

describe('generateTSPChallenge', () => {
  it('is deterministic for a given seed and produces the right city count', () => {
    const c1 = generateTSPChallenge(2, 'SEED')
    const c2 = generateTSPChallenge(2, 'SEED')
    expect(c1.cities).toEqual(c2.cities)
    expect(c1.cities).toHaveLength(6)
    expect(c1.startCityId).toBe('tehran')
  })

  it('places no two cities on top of each other', () => {
    const challenge = generateTSPChallenge(5, 'DENSE')
    for (let i = 0; i < challenge.cities.length; i++) {
      for (let j = i + 1; j < challenge.cities.length; j++) {
        const d = Math.hypot(
          challenge.cities[i].x - challenge.cities[j].x,
          challenge.cities[i].y - challenge.cities[j].y,
        )
        expect(d).toBeGreaterThan(0)
      }
    }
  })
})

describe('isCompleteValidRoute', () => {
  const challenge = generateTSPChallenge(1, 'VALID')
  const ids = challenge.cities.map((c) => c.id)

  it('accepts a route visiting every city once and returning to start', () => {
    const route = [challenge.startCityId, ...ids.filter((id) => id !== challenge.startCityId), challenge.startCityId]
    expect(isCompleteValidRoute(route, challenge)).toBe(true)
  })

  it('rejects a route that revisits a city', () => {
    const others = ids.filter((id) => id !== challenge.startCityId)
    const route = [challenge.startCityId, others[0], others[0], ...others.slice(1), challenge.startCityId]
    expect(isCompleteValidRoute(route, challenge)).toBe(false)
  })

  it('rejects a route not returning to the start city', () => {
    const others = ids.filter((id) => id !== challenge.startCityId)
    const route = [challenge.startCityId, ...others]
    expect(isCompleteValidRoute(route, challenge)).toBe(false)
  })

  it('rejects a route not starting at the start city', () => {
    const others = ids.filter((id) => id !== challenge.startCityId)
    const route = [others[0], challenge.startCityId, ...others.slice(1), others[0]]
    expect(isCompleteValidRoute(route, challenge)).toBe(false)
  })
})

describe('normalizeRouteKey', () => {
  it('produces identical keys for identical routes and different keys otherwise', () => {
    expect(normalizeRouteKey(['a', 'b', 'c', 'a'])).toBe(normalizeRouteKey(['a', 'b', 'c', 'a']))
    expect(normalizeRouteKey(['a', 'b', 'c', 'a'])).not.toBe(normalizeRouteKey(['a', 'c', 'b', 'a']))
  })
})

describe('possibleRouteCount', () => {
  it('matches (n-1)! for a fixed starting city', () => {
    expect(possibleRouteCount(4)).toBe(6)
    expect(possibleRouteCount(6)).toBe(120)
    expect(possibleRouteCount(8)).toBe(5040)
    expect(possibleRouteCount(10)).toBe(362880)
  })
})

describe('solveTSPOptimal', () => {
  it('matches brute force for small instances (4 and 6 cities)', () => {
    for (const seed of ['s1', 's2', 's3']) {
      const c4 = generateTSPChallenge(1, seed)
      const optimal4 = solveTSPOptimal(c4)
      expect(optimal4.distance).toBe(bruteForceOptimal(c4))
      expect(isCompleteValidRoute(optimal4.route, c4)).toBe(true)

      const c6 = generateTSPChallenge(2, seed)
      const optimal6 = solveTSPOptimal(c6)
      expect(optimal6.distance).toBe(bruteForceOptimal(c6))
      expect(isCompleteValidRoute(optimal6.route, c6)).toBe(true)
    }
  })

  it('produces a valid complete route for a larger instance (12 cities) without excessive cost', () => {
    const challenge = generateTSPChallenge(5, 'BIG')
    const start = performance.now()
    const optimal = solveTSPOptimal(challenge)
    const elapsed = performance.now() - start
    expect(isCompleteValidRoute(optimal.route, challenge)).toBe(true)
    expect(optimal.distance).toBe(routeDistance(optimal.route, challenge))
    expect(elapsed).toBeLessThan(2000)
  })
})
