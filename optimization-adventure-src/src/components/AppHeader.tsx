import { useI18n } from '../i18n/I18nContext'
import { usePlayerStore } from '../hooks/usePlayerStore'
import { LanguageSelector } from './LanguageSelector'
import { SoundToggle } from './SoundToggle'
import type { Route } from '../hooks/useHashRoute'

export function AppHeader({ navigate }: { navigate: (route: Route) => void }) {
  const { t } = useI18n()
  const name = usePlayerStore((s) => s.name)

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100/70 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          className="focus-ring flex items-center gap-2 rounded-xl px-1 py-1 text-start"
          onClick={() => navigate('landing')}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-sunset-500 text-lg shadow-md">
            🎯
          </span>
          <span className="hidden flex-col sm:flex">
            <span className="text-sm font-extrabold leading-tight text-brand-800">{t('meta.appName')}</span>
            {name && <span className="text-xs text-slate-500">{name}</span>}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <a
            href="https://khalooei.github.io/"
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-lg shadow-sm transition hover:bg-slate-50 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-4 sm:py-2 sm:text-sm sm:font-semibold sm:text-slate-600"
            title={t('header.backToWebsite')}
          >
            <span aria-hidden="true">🏠</span>
            <span className="hidden sm:inline">{t('header.backToWebsite')}</span>
          </a>
          <button
            type="button"
            className="focus-ring hidden rounded-full border border-brand-200 bg-white/90 px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50 sm:inline-flex"
            onClick={() => navigate('landing')}
          >
            {t('header.home')}
          </button>
          <SoundToggle />
          <LanguageSelector />
        </div>
      </div>
    </header>
  )
}
