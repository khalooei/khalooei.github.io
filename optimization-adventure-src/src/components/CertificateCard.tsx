import { forwardRef } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { usePlayerStore } from '../hooks/usePlayerStore'
import { ACHIEVEMENT_ICONS } from '../data/achievements'
import { formatDate, formatNumber } from '../utils/format'

interface CertificateCardProps {
  gameLabel: string
  stageText: string
  bestResultText: string
}

export const CertificateCard = forwardRef<HTMLDivElement, CertificateCardProps>(function CertificateCard(
  { gameLabel, stageText, bestResultText },
  ref,
) {
  const { t, language } = useI18n()
  const name = usePlayerStore((s) => s.name) ?? '—'
  const achievements = usePlayerStore((s) => s.progress.achievements)

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-br from-brand-600 via-brand-500 to-sunset-500 p-8 text-white shadow-2xl"
    >
      <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-16 -start-10 h-52 w-52 rounded-full bg-white/10" />

      <div className="relative flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/80">
        <span aria-hidden="true">🎯</span>
        {t('certificate.title')}
      </div>

      <p className="relative mt-4 text-xl font-extrabold leading-snug sm:text-2xl">{t('certificate.participated')}</p>

      <div className="relative mt-6 grid gap-3 rounded-2xl bg-white/15 p-5 backdrop-blur-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">{t('certificate.player')}</p>
          <p className="text-lg font-extrabold">{name}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">{t('certificate.date')}</p>
          <p className="text-lg font-extrabold">{formatDate(Date.now(), language)}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">{t('certificate.game')}</p>
          <p className="text-lg font-extrabold">{gameLabel}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">{t('certificate.stageReached')}</p>
          <p className="text-lg font-extrabold">{stageText}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">{t('certificate.bestResult')}</p>
          <p className="text-lg font-extrabold">{bestResultText}</p>
        </div>
      </div>

      {achievements.length > 0 && (
        <div className="relative mt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">{t('certificate.badgesEarned')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {achievements.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold"
              >
                <span aria-hidden="true">{ACHIEVEMENT_ICONS[a.id]}</span>
                {t(`achievements.${a.id}.name`)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative mt-6 flex items-center justify-between text-xs font-semibold text-white/70">
        <span>khalooei.github.io</span>
        <span>{formatNumber(achievements.length, language)} 🎖</span>
      </div>
    </div>
  )
})
