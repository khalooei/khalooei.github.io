import { useI18n } from '../../i18n/I18nContext'
import type { City } from '../../types'

// Route/itinerary sequences stay LTR-isolated — the standard convention for ordered
// breadcrumbs even inside RTL apps — so the arrow direction never fights the layout order.
export function CurrentRoute({ cities, order }: { cities: City[]; order: string[] }) {
  const { t } = useI18n()
  const byId = new Map(cities.map((c) => [c.id, c]))

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t('tsp.currentRoute')}</p>
      <div dir="ltr" className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {order.map((id, i) => {
          const city = byId.get(id)
          if (!city) return null
          return (
            <span key={i} className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700">
                <span aria-hidden="true">{city.icon}</span>
                {t(city.nameKey)}
              </span>
              {i < order.length - 1 && (
                <span className="text-brand-300" aria-hidden="true">
                  →
                </span>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}
