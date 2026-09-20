import { useCallback } from 'react'
import { usePlayerStore } from './usePlayerStore'
import { playSound, type SoundName } from '../audio/sounds'

export function useSound(): (name: SoundName) => void {
  const soundEnabled = usePlayerStore((s) => s.soundEnabled)
  return useCallback(
    (name: SoundName) => {
      if (soundEnabled) playSound(name)
    },
    [soundEnabled],
  )
}

export function useVibrate(): (pattern?: number | number[]) => void {
  return useCallback((pattern: number | number[] = 60) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern)
      } catch {
        // unsupported — ignore
      }
    }
  }, [])
}
