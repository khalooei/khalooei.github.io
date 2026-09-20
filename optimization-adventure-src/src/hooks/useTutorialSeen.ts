import { useState } from 'react'
import { readJSON, writeJSON } from '../utils/storage'

export function useTutorialSeen(gameId: 'knapsack' | 'tsp'): [boolean, () => void, () => void] {
  const key = `tutorial-seen-${gameId}`
  const [seen, setSeen] = useState<boolean>(() => readJSON(key, false))

  const markSeen = () => {
    setSeen(true)
    writeJSON(key, true)
  }
  const showAgain = () => setSeen(false)

  return [seen, markSeen, showAgain]
}
