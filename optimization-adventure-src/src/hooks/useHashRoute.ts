import { useEffect, useState } from 'react'

export type Route = 'landing' | 'knapsack' | 'tsp'

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '')
  if (hash.startsWith('knapsack')) return 'knapsack'
  if (hash.startsWith('tsp')) return 'tsp'
  return 'landing'
}

/** Hash-based routing keeps this a static single-page app that survives GitHub Pages refreshes. */
export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(parseHash)

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (next: Route) => {
    window.location.hash = next === 'landing' ? '/' : `/${next}`
  }

  return [route, navigate]
}
