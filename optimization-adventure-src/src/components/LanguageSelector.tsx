import { useI18n } from '../i18n/I18nContext'
import { LANGUAGES } from '../i18n/languages'
import { useSound } from '../hooks/useSound'

export function LanguageSelector() {
  const { language, setLanguage, t } = useI18n()
  const playSound = useSound()

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t('header.language')}</span>
      <select
        className="focus-ring cursor-pointer appearance-none rounded-full border border-brand-200 bg-white/90 py-2 pe-8 ps-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
        value={language}
        onChange={(e) => {
          setLanguage(e.target.value as typeof language)
          playSound('click')
        }}
        aria-label={t('header.language')}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute end-2.5 text-xs text-brand-400">▾</span>
    </label>
  )
}
