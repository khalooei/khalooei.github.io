import { useState, type RefObject } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { useSound } from '../hooks/useSound'

export function ScreenshotButton({
  targetRef,
  fileName,
  label,
}: {
  targetRef: RefObject<HTMLElement | null>
  fileName: string
  label?: string
}) {
  const { t } = useI18n()
  const playSound = useSound()
  const [status, setStatus] = useState<'idle' | 'working' | 'error'>('idle')

  const handleClick = async () => {
    if (!targetRef.current) return
    setStatus('working')
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#f5f3ff',
        scale: Math.min(2, window.devicePixelRatio || 1.5),
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `${fileName}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setStatus('idle')
      playSound('complete')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        className="focus-ring inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-sunset-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-105 disabled:opacity-60"
        onClick={handleClick}
        disabled={status === 'working'}
      >
        <span aria-hidden="true">📸</span>
        {status === 'working' ? t('common.loading') : (label ?? t('certificate.saveResult'))}
      </button>
      {status === 'error' && <p className="text-xs font-medium text-rose-600">{t('errors.screenshotFailed')}</p>}
    </div>
  )
}
