import { useEffect } from 'react'
import { I18nProvider } from './i18n/I18nContext'
import { useHashRoute } from './hooks/useHashRoute'
import { AppHeader } from './components/AppHeader'
import { AppFooter } from './components/AppFooter'
import { AchievementToast } from './components/AchievementToast'
import { LandingPage } from './pages/LandingPage'
import { KnapsackGame } from './games/knapsack/KnapsackGame'
import { TSPGame } from './games/tsp/TSPGame'
import { useAchievementNotifications } from './hooks/useAchievementNotifications'
import { useSound } from './hooks/useSound'

function AppShell() {
  const [route, navigate] = useHashRoute()
  const { current, dismiss } = useAchievementNotifications()
  const playSound = useSound()

  useEffect(() => {
    if (current) playSound('achievement')
  }, [current, playSound])

  return (
    <div className="min-h-screen">
      <AppHeader navigate={navigate} />
      {route === 'landing' && <LandingPage navigate={navigate} />}
      {route === 'knapsack' && <KnapsackGame navigate={navigate} />}
      {route === 'tsp' && <TSPGame navigate={navigate} />}
      <AppFooter />
      <AchievementToast achievementId={current} onDone={dismiss} />
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <AppShell />
    </I18nProvider>
  )
}
