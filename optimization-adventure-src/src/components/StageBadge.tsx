import { useI18n } from '../i18n/I18nContext'
import { formatNumber } from '../utils/format'

export function StageBadge({ stage, max }: { stage: number; max: number }) {
  const { t, language } = useI18n()
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-700">
      <span aria-hidden="true">🚩</span>
      {t('common.stage')} {formatNumber(stage, language)} / {formatNumber(max, language)}
    </span>
  )
}
