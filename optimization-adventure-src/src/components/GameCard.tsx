import { motion } from 'framer-motion'
import { useI18n } from '../i18n/I18nContext'
import { formatNumber } from '../utils/format'

interface GameCardProps {
  icon: string
  gradient: string
  title: string
  description: string
  stage: number
  maxStage: number
  cta: string
  onPlay: () => void
  delay?: number
}

export function GameCard({ icon, gradient, title, description, stage, maxStage, cta, onPlay, delay = 0 }: GameCardProps) {
  const { t, language } = useI18n()
  const started = stage > 1
  const pct = Math.round(((stage - 1) / maxStage) * 100)

  return (
    <motion.article
      className="card-surface group relative flex flex-col overflow-hidden rounded-3xl p-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
    >
      <div
        className={`animate-breathe flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-4xl shadow-lg`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-extrabold text-slate-800">{title}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-500">{description}</p>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>
            {t('common.stage')} {formatNumber(stage, language)}/{formatNumber(maxStage, language)}
          </span>
          <span>{formatNumber(pct, language)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-sunset-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <button
        type="button"
        className="focus-ring mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-3 text-sm font-bold text-white shadow-md transition group-hover:brightness-105"
        onClick={onPlay}
      >
        {cta}
        <span aria-hidden="true">{started ? '→' : '▶'}</span>
      </button>
    </motion.article>
  )
}
