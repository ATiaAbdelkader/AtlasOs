import { create } from 'zustand'
import type { Mission } from '@/types'
import * as api from '@/lib/supabaseService'
import { missions as mockMissions } from '@/data/mockData'

interface MissionState {
  missions: Mission[]
  isLoading: boolean
  error: string | null
  setMissions: (missions: Mission[]) => void
  addMission: (mission: Mission) => void
  updateMission: (id: string, updates: Partial<Mission>) => void
  deleteMission: (id: string) => void
  init: (userId: string) => Promise<void>
  addMissionAsync: (userId: string, mission: Partial<Mission>) => Promise<Mission | null>
  updateMissionAsync: (id: string, updates: Partial<Mission>) => Promise<void>
  deleteMissionAsync: (id: string) => Promise<void>
}

export const useMissionStore = create<MissionState>()((set, get) => ({
  missions: [],
  isLoading: false,
  error: null,

  setMissions: (missions) => set({ missions }),

  addMission: (mission) => set((s) => ({ missions: [...s.missions, mission] })),

  updateMission: (id, updates) =>
    set((s) => ({
      missions: s.missions.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m)),
    })),

  deleteMission: (id) => set((s) => ({ missions: s.missions.filter((m) => m.id !== id) })),

  init: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const missions = await api.fetchMissions(userId)
      const normalized = missions.map((m) => ({
        ...m,
        isActive: m.isActive ?? true,
      }))
      set({ missions: normalized, isLoading: false })
    } catch (err: any) {
      console.warn('Failed to fetch missions from Supabase, using mock data:', err?.message)
      set({ missions: mockMissions, isLoading: false, error: err?.message })
    }
  },

  addMissionAsync: async (userId, mission) => {
    try {
      const created = await api.createMission(userId, mission)
      get().addMission(created)
      return created
    } catch (err: any) {
      console.error('Failed to create mission:', err?.message)
      return null
    }
  },

  updateMissionAsync: async (id, updates) => {
    get().updateMission(id, updates)
    try {
      await api.updateMission(id, updates)
    } catch (err: any) {
      console.error('Failed to update mission:', err?.message)
    }
  },

  deleteMissionAsync: async (id) => {
    get().deleteMission(id)
    try {
      await api.deleteMission(id)
    } catch (err: any) {
      console.error('Failed to delete mission:', err?.message)
    }
  },
}))
