import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import type { Language } from '../types'
import { dirFor } from './languages'
import { usePlayerStore } from '../hooks/usePlayerStore'
import en from './en'
import fa from './fa'
import ar from './ar'
import type { Translation } from './types'

const DICTS: Record<Language, Translation> = { en, fa, ar }

type TranslateFn = (path: string, vars?: Record<string, string | number>) => string

interface I18nContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  dir: 'ltr' | 'rtl'
  t: TranslateFn
  translation: Translation
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) return (acc as Record<string, unknown>)[key]
    return undefined
  }, obj)
}

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match))
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = usePlayerStore((s) => s.language)
  const setLanguage = usePlayerStore((s) => s.setLanguage)
  const dir = dirFor(language)
  const translation = DICTS[language]

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = dir
  }, [language, dir])

  const t: TranslateFn = useMemo(() => {
    return (path, vars) => {
      const value = getByPath(translation, path)
      if (typeof value === 'string') return interpolate(value, vars)
      if (import.meta.env.DEV) console.warn(`[i18n] missing key "${path}" for language "${language}"`)
      return path
    }
  }, [translation, language])

  const value: I18nContextValue = useMemo(
    () => ({ language, setLanguage, dir, t, translation }),
    [language, setLanguage, dir, t, translation],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider')
  return ctx
}
