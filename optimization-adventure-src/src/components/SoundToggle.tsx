import { usePlayerStore } from '../hooks/usePlayerStore'
import { useI18n } from '../i18n/I18nContext'
import { playSound } from '../audio/sounds'

export function SoundToggle() {
  const soundEnabled = usePlayerStore((s) => s.soundEnabled)
  const toggleSound = usePlayerStore((s) => s.toggleSound)
  const { t } = useI18n()

  return (
    <button
      type="button"
      className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 bg-white/90 text-lg shadow-sm transition hover:bg-brand-50"
      onClick={() => {
        const next = !soundEnabled
        toggleSound()
        if (next) playSound('click')
      }}
      aria-pressed={soundEnabled}
      aria-label={soundEnabled ? t('header.soundOn') : t('header.soundOff')}
      title={soundEnabled ? t('header.soundOn') : t('header.soundOff')}
    >
      <span aria-hidden="true">{soundEnabled ? '🔊' : '🔇'}</span>
    </button>
  )
}
