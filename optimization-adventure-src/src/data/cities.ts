export interface CityDef {
  id: string
  nameKey: string
  icon: string
}

// A pool of well-known Iranian cities (translated per-language in i18n) plus icon variety.
export const CITY_POOL: CityDef[] = [
  { id: 'tehran', nameKey: 'cities.tehran', icon: '🏙️' },
  { id: 'shiraz', nameKey: 'cities.shiraz', icon: '🌷' },
  { id: 'tabriz', nameKey: 'cities.tabriz', icon: '🏔️' },
  { id: 'mashhad', nameKey: 'cities.mashhad', icon: '🕌' },
  { id: 'isfahan', nameKey: 'cities.isfahan', icon: '🕋' },
  { id: 'yazd', nameKey: 'cities.yazd', icon: '🏜️' },
  { id: 'kerman', nameKey: 'cities.kerman', icon: '🐪' },
  { id: 'rasht', nameKey: 'cities.rasht', icon: '🌲' },
  { id: 'ahvaz', nameKey: 'cities.ahvaz', icon: '🌴' },
  { id: 'kish', nameKey: 'cities.kish', icon: '🏖️' },
  { id: 'qom', nameKey: 'cities.qom', icon: '⛲' },
  { id: 'urmia', nameKey: 'cities.urmia', icon: '🦆' },
  { id: 'hamedan', nameKey: 'cities.hamedan', icon: '🏛️' },
  { id: 'zahedan', nameKey: 'cities.zahedan', icon: '⛰️' },
]

export const TSP_LEVELS = [4, 6, 8, 10, 12] as const

export const TSP_START_CITY_ID = 'tehran'
