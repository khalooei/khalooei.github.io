import type { Language } from '../types'

const LOCALE_MAP: Record<Language, string> = {
  fa: 'fa-IR',
  en: 'en-US',
  ar: 'ar-SA',
}

// Latin digits everywhere keeps numbers unambiguous inside RTL layouts.
export function formatNumber(n: number, language: Language): string {
  return new Intl.NumberFormat(LOCALE_MAP[language], { numberingSystem: 'latn' }).format(n)
}

export function formatDate(timestamp: number, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE_MAP[language], {
    numberingSystem: 'latn',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(timestamp))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
