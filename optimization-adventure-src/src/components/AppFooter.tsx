import { useI18n } from '../i18n/I18nContext'

const CONTACT_EMAILS = ['mohammad.khalooei@sharif.edu', 'khalooei@aut.ac.ir']

export function AppFooter() {
  const { t } = useI18n()

  return (
    <footer className="mt-10 border-t border-brand-100/70 bg-white/60 px-4 py-8 text-center">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
        <a
          href="https://khalooei.github.io/"
          className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <span aria-hidden="true">🏠</span>
          {t('header.backToWebsite')}
        </a>

        <p className="text-sm font-semibold text-slate-600">{t('footer.developedBy')}</p>
        <p className="max-w-xl text-xs leading-relaxed text-slate-400">{t('footer.privacyNote')}</p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-brand-600">
          <span>{t('footer.contactPrompt')}</span>
          {CONTACT_EMAILS.map((email) => (
            <a key={email} href={`mailto:${email}`} className="focus-ring underline decoration-dotted hover:text-brand-700">
              {email}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
