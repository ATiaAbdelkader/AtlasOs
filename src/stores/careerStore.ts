import { create } from 'zustand'
import type { CareerEntry } from '@/types'
import * as api from '@/lib/supabaseService'
import { careerEntries as mockEntries } from '@/data/mockData'

interface CareerState {
  entries: CareerEntry[]
  isLoading: boolean
  error: string | null
  setEntries: (entries: CareerEntry[]) => void
  addEntry: (entry: CareerEntry) => void
  updateEntry: (id: string, updates: Partial<CareerEntry>) => void
  deleteEntry: (id: string) => void
  init: (userId: string) => Promise<void>
  addEntryAsync: (userId: string, entry: Partial<CareerEntry>) => Promise<CareerEntry | null>
  updateEntryAsync: (id: string, updates: Partial<CareerEntry>) => Promise<void>
  deleteEntryAsync: (id: string) => Promise<void>
}

export const useCareerStore = create<CareerState>()((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  setEntries: (entries) => set({ entries }),

  addEntry: (entry) => set((s) => ({ entries: [entry, ...s.entries] })),

  updateEntry: (id, updates) =>
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e)),
    })),

  deleteEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

  init: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const entries = await api.fetchCareerEntries(userId)
      const normalized = entries.map((e: any) => ({
        ...e,
        skillIds: e.skillIds ?? [],
        subtitle: e.subtitle ?? '',
        description: e.description ?? '',
        category: e.category ?? '',
      }))
      set({ entries: normalized, isLoading: false })
    } catch (err: any) {
      console.warn('Failed to fetch career entries from Supabase, using seeded data:', err?.message)
      set({ entries: mockEntries, isLoading: false, error: err?.message })
    }
  },

  addEntryAsync: async (userId, entry) => {
    try {
      const created = await api.createCareerEntry(userId, entry)
      get().addEntry(created)
      return created
    } catch (err: any) {
      console.error('Failed to create career entry:', err?.message)
      return null
    }
  },

  updateEntryAsync: async (id, updates) => {
    get().updateEntry(id, updates)
    try {
      await api.updateCareerEntry(id, updates)
    } catch (err: any) {
      console.error('Failed to update career entry:', err?.message)
    }
  },

  deleteEntryAsync: async (id) => {
    get().deleteEntry(id)
    try {
      await api.deleteCareerEntry(id)
    } catch (err: any) {
      console.error('Failed to delete career entry:', err?.message)
    }
  },
}))
