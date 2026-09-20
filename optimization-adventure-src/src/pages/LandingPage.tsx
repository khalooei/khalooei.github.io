import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../i18n/I18nContext'
import { usePlayerStore } from '../hooks/usePlayerStore'
import { GameCard } from '../components/GameCard'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CertificateCard } from '../components/CertificateCard'
import { ScreenshotButton } from '../components/ScreenshotButton'
import { ACHIEVEMENT_ICONS, ALL_ACHIEVEMENT_IDS } from '../data/achievements'
import { formatNumber } from '../utils/format'
import { useSound } from '../hooks/useSound'
import type { Route } from '../hooks/useHashRoute'

const KNAPSACK_MAX_STAGE = 5
const TSP_MAX_STAGE = 5

export function LandingPage({ navigate }: { navigate: (route: Route) => void }) {
  const { t, language } = useI18n()
  const playSound = useSound()
  const name = usePlayerStore((s) => s.name)
  const setName = usePlayerStore((s) => s.setName)
  const progress = usePlayerStore((s) => s.progress)
  const resetProgress = usePlayerStore((s) => s.resetProgress)

  const [nameInput, setNameInput] = useState('')
  const [nameError, setNameError] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const certRef = useRef<HTMLDivElement>(null)

  const hasProgress = progress.knapsackCompletedStages.length > 0 || progress.tspCompletedStages.length > 0

  if (!name) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <motion.div
          className="card-surface w-full max-w-md rounded-3xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="animate-breathe mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-sunset-500 text-4xl shadow-lg">
            🎯
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-800">{t('landing.title')}</h1>
          <p className="mt-2 text-sm text-slate-500">{t('landing.subtitle')}</p>
          <p className="mt-4 text-base font-bold text-brand-700">{t('landing.namePrompt')}</p>
          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              const trimmed = nameInput.trim()
              if (!trimmed) {
                setNameError(true)
                playSound('error')
                return
              }
              setName(trimmed)
              playSound('select')
            }}
          >
            <input
              type="text"
              className="focus-ring rounded-xl border border-brand-200 bg-white px-4 py-3 text-center text-lg font-semibold text-slate-800 shadow-sm"
              placeholder={t('landing.namePlaceholder')}
              value={nameInput}
              maxLength={40}
              onChange={(e) => {
                setNameInput(e.target.value)
                setNameError(false)
              }}
              autoFocus
            />
            {nameError && <p className="text-sm font-medium text-rose-600">{t('landing.nameRequired')}</p>}
            <button
              type="submit"
              className="focus-ring rounded-full bg-gradient-to-r from-brand-600 to-sunset-500 px-6 py-3 text-base font-extrabold text-white shadow-md transition hover:brightness-105"
            >
              {t('landing.nameCta')}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10">
      <motion.section
        className="text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm font-bold text-brand-600">{t('landing.welcomeBack', { name })}</p>
        <h1 className="mt-2 bg-gradient-to-r from-brand-700 via-brand-500 to-sunset-500 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
          {t('landing.title')}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">{t('landing.intro')}</p>
      </motion.section>

      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        <GameCard
          icon="🎒"
          gradient="from-brand-400 to-brand-600"
          title={t('games.knapsack.title')}
          description={t('games.knapsack.short')}
          stage={progress.knapsackStage}
          maxStage={KNAPSACK_MAX_STAGE}
          cta={t('games.knapsack.cta')}
          onPlay={() => navigate('knapsack')}
          delay={0.05}
        />
        <GameCard
          icon="🗺️"
          gradient="from-sunset-400 to-sunset-600"
          title={t('games.tsp.title')}
          description={t('games.tsp.short')}
          stage={progress.tspStage}
          maxStage={TSP_MAX_STAGE}
          cta={t('games.tsp.cta')}
          onPlay={() => navigate('tsp')}
          delay={0.15}
        />
      </section>

      {hasProgress && (
        <section className="mt-12">
          <h2 className="text-lg font-extrabold text-slate-800">{t('landing.progressOverview')}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="card-surface rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t('landing.knapsackStageLabel')}</p>
              <p className="mt-1 text-2xl font-black text-brand-700">
                {formatNumber(progress.knapsackStage, language)} / {formatNumber(KNAPSACK_MAX_STAGE, language)}
              </p>
            </div>
            <div className="card-surface rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t('landing.tspStageLabel')}</p>
              <p className="mt-1 text-2xl font-black text-sunset-600">
                {formatNumber(progress.tspStage, language)} / {formatNumber(TSP_MAX_STAGE, language)}
              </p>
            </div>
            <div className="card-surface rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t('landing.achievementsEarned')}</p>
              <p className="mt-1 text-2xl font-black text-leaf-600">
                {formatNumber(progress.achievements.length, language)} / {formatNumber(ALL_ACHIEVEMENT_IDS.length, language)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {ALL_ACHIEVEMENT_IDS.map((id) => {
              const earned = progress.achievements.some((a) => a.id === id)
              return (
                <span
                  key={id}
                  className={
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ' +
                    (earned ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400 opacity-60')
                  }
                  title={t(`achievements.${id}.desc`)}
                >
                  <span aria-hidden="true">{ACHIEVEMENT_ICONS[id]}</span>
                  {t(`achievements.${id}.name`)}
                </span>
              )
            })}
          </div>

          <div className="mt-8">
            <CertificateCard
              ref={certRef}
              gameLabel={`${t('games.knapsack.title')} · ${t('games.tsp.title')}`}
              stageText={`${t('common.stage')} ${formatNumber(progress.knapsackStage, language)} / ${formatNumber(progress.tspStage, language)}`}
              bestResultText={`${t('landing.achievementsEarned')}: ${formatNumber(progress.achievements.length, language)}`}
            />
            <div className="mt-4">
              <ScreenshotButton targetRef={certRef} fileName={`optimization-adventure-${name}`} label={t('certificate.saveImage')} />
            </div>
          </div>
        </section>
      )}

      {hasProgress && (
        <section className="mt-14 flex flex-col items-center border-t border-brand-100 pt-8 text-center">
          <button
            type="button"
            className="focus-ring text-xs font-semibold text-rose-500 underline decoration-dotted hover:text-rose-600"
            onClick={() => setConfirmReset(true)}
          >
            {t('header.resetProgress')}
          </button>
        </section>
      )}

      <ConfirmDialog
        open={confirmReset}
        title={t('landing.resetConfirmTitle')}
        body={t('landing.resetConfirmBody')}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetProgress()
          setConfirmReset(false)
        }}
      />
    </div>
  )
}
