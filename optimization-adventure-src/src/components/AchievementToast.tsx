import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../i18n/I18nContext'
import type { AchievementId } from '../types'
import { ACHIEVEMENT_ICONS } from '../data/achievements'

export function AchievementToast({ achievementId, onDone }: { achievementId: AchievementId | null; onDone: () => void }) {
  const { t } = useI18n()

  useEffect(() => {
    if (!achievementId) return
    const timer = setTimeout(onDone, 4200)
    return () => clearTimeout(timer)
  }, [achievementId, onDone])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[110] flex justify-center px-4">
      <AnimatePresence>
        {achievementId && (
          <motion.div
            className="animate-badge-pop card-surface pointer-events-auto flex items-center gap-3 rounded-2xl px-5 py-3 shadow-xl"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
          >
            <span className="text-2xl" aria-hidden="true">
              {ACHIEVEMENT_ICONS[achievementId]}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">{t('achievements.unlocked')}</p>
              <p className="text-sm font-extrabold text-slate-800">{t(`achievements.${achievementId}.name`)}</p>
              <p className="text-xs text-slate-500">{t(`achievements.${achievementId}.desc`)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
