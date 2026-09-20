import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from './usePlayerStore'
import type { AchievementId } from '../types'

/** Surfaces newly-unlocked achievements as a dismissable queue, without spamming on first load. */
export function useAchievementNotifications() {
  const achievements = usePlayerStore((s) => s.progress.achievements)
  const [queue, setQueue] = useState<AchievementId[]>([])
  const knownIds = useRef<Set<AchievementId>>(new Set())
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      achievements.forEach((a) => knownIds.current.add(a.id))
      initialized.current = true
      return
    }
    const newOnes = achievements.filter((a) => !knownIds.current.has(a.id))
    if (newOnes.length > 0) {
      newOnes.forEach((a) => knownIds.current.add(a.id))
      setQueue((q) => [...q, ...newOnes.map((a) => a.id)])
    }
  }, [achievements])

  const current = queue[0] ?? null
  const dismiss = () => setQueue((q) => q.slice(1))

  return { current, dismiss }
}
