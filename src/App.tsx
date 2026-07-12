import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { useAuth } from '@/lib/auth'
import { MainLayout } from '@/components/layout/MainLayout'
import { Loader2 } from 'lucide-react'
import Dashboard from '@/pages/Dashboard'
import MissionControl from '@/pages/MissionControl'
import Tasks from '@/pages/Tasks'
import Calendar from '@/pages/Calendar'
import Projects from '@/pages/Projects'
import Research from '@/pages/Research'
import Writing from '@/pages/Writing'
import Business from '@/pages/Business'
import KnowledgeVault from '@/pages/KnowledgeVault'
import Journal from '@/pages/Journal'
import Habits from '@/pages/Habits'
import Analytics from '@/pages/Analytics'
import AIAssistant from '@/pages/AIAssistant'
import Career from '@/pages/Career'
import Skills from '@/pages/Skills'
import Settings from '@/pages/Settings'
import Auth from '@/pages/Auth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function App() {
  const { theme } = useAppStore()
  const { user } = useAuth()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/missions" element={<MissionControl />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/research" element={<Research />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/business" element={<Business />} />
        <Route path="/knowledge" element={<KnowledgeVault />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/career" element={<Career />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
