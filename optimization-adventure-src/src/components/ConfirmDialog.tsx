import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../i18n/I18nContext'

export function ConfirmDialog({
  open,
  title,
  body,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  body: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const { t } = useI18n()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          onClick={onCancel}
        >
          <motion.div
            className="card-surface w-full max-w-sm rounded-2xl p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirm-dialog-title" className="text-lg font-extrabold text-slate-800">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="focus-ring rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                onClick={onCancel}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="focus-ring rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-600"
                onClick={onConfirm}
              >
                {t('common.confirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
