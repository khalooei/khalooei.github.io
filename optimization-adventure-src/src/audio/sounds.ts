// Lightweight synthesized sound effects via the Web Audio API — no binary assets to ship,
// and nothing plays until the player has already interacted with the page (autoplay-safe).

export type SoundName = 'click' | 'select' | 'error' | 'travel' | 'complete' | 'win' | 'achievement'

let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtor) return null
  if (!ctx) ctx = new AudioCtor()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(
  audioCtx: AudioContext,
  { freq, start, duration, type = 'sine', gain = 0.08 }: { freq: number; start: number; duration: number; type?: OscillatorType; gain?: number },
) {
  const osc = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start)
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime + start)
  gainNode.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + start + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + start + duration)
  osc.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  osc.start(audioCtx.currentTime + start)
  osc.stop(audioCtx.currentTime + start + duration + 0.02)
}

export function playSound(name: SoundName): void {
  const audioCtx = getContext()
  if (!audioCtx) return

  switch (name) {
    case 'click':
      tone(audioCtx, { freq: 520, start: 0, duration: 0.06, type: 'triangle', gain: 0.05 })
      break
    case 'select':
      tone(audioCtx, { freq: 660, start: 0, duration: 0.1, type: 'sine' })
      tone(audioCtx, { freq: 880, start: 0.06, duration: 0.12, type: 'sine' })
      break
    case 'error':
      tone(audioCtx, { freq: 220, start: 0, duration: 0.16, type: 'sawtooth', gain: 0.07 })
      tone(audioCtx, { freq: 160, start: 0.1, duration: 0.18, type: 'sawtooth', gain: 0.07 })
      break
    case 'travel':
      tone(audioCtx, { freq: 440, start: 0, duration: 0.2, type: 'sine', gain: 0.05 })
      tone(audioCtx, { freq: 550, start: 0.08, duration: 0.2, type: 'sine', gain: 0.05 })
      break
    case 'complete':
      tone(audioCtx, { freq: 523, start: 0, duration: 0.12 })
      tone(audioCtx, { freq: 659, start: 0.1, duration: 0.12 })
      tone(audioCtx, { freq: 784, start: 0.2, duration: 0.2 })
      break
    case 'win':
      tone(audioCtx, { freq: 523, start: 0, duration: 0.1 })
      tone(audioCtx, { freq: 659, start: 0.09, duration: 0.1 })
      tone(audioCtx, { freq: 784, start: 0.18, duration: 0.1 })
      tone(audioCtx, { freq: 1047, start: 0.27, duration: 0.3 })
      break
    case 'achievement':
      tone(audioCtx, { freq: 660, start: 0, duration: 0.1, type: 'triangle' })
      tone(audioCtx, { freq: 990, start: 0.08, duration: 0.15, type: 'triangle' })
      tone(audioCtx, { freq: 1320, start: 0.18, duration: 0.25, type: 'triangle' })
      break
  }
}
