import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  theme: 'dark' | 'light'
  sidebarOpen: boolean
  activeView: string
  pomodoroActive: boolean
  pomodoroMinutes: number
  pomodoroSeconds: number
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveView: (view: string) => void
  setPomodoroActive: (active: boolean) => void
  setPomodoroTime: (minutes: number, seconds: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      activeView: 'dashboard',
      pomodoroActive: false,
      pomodoroMinutes: 25,
      pomodoroSeconds: 0,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveView: (view) => set({ activeView: view }),
      setPomodoroActive: (active) => set({ pomodoroActive: active }),
      setPomodoroTime: (minutes, seconds) => set({ pomodoroMinutes: minutes, pomodoroSeconds: seconds }),
    }),
    { name: 'atlasos-app' }
  )
)
