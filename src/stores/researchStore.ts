import { create } from 'zustand'
import * as api from '@/lib/supabaseService'
import { researchPapers as mockPapers } from '@/data/mockData'
import type { ResearchPaper } from '@/types'

interface ResearchState {
  papers: ResearchPaper[]
  isLoading: boolean
  error: string | null
  setPapers: (papers: ResearchPaper[]) => void
  addPaper: (paper: ResearchPaper) => void
  updatePaper: (id: string, updates: Partial<ResearchPaper>) => void
  deletePaper: (id: string) => void
  init: (userId: string) => Promise<void>
  addPaperAsync: (userId: string, paper: Partial<ResearchPaper>) => Promise<ResearchPaper | null>
  updatePaperAsync: (id: string, updates: Partial<ResearchPaper>) => Promise<void>
  deletePaperAsync: (id: string) => Promise<void>
}

export const useResearchStore = create<ResearchState>()((set, get) => ({
  papers: [],
  isLoading: false,
  error: null,

  setPapers: (papers) => set({ papers }),

  addPaper: (paper) => set((s) => ({ papers: [paper, ...s.papers] })),

  updatePaper: (id, updates) =>
    set((s) => ({
      papers: s.papers.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)),
    })),

  deletePaper: (id) => set((s) => ({ papers: s.papers.filter((p) => p.id !== id) })),

  init: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const papers = await api.fetchResearchPapers(userId)
      const normalized = papers.map((p: any) => ({
        ...p,
        authors: p.authors ?? [],
        tags: p.tags ?? [],
        readingList: p.readingList ?? false,
      }))
      set({ papers: normalized, isLoading: false })
    } catch (err: any) {
      console.warn('Failed to fetch research papers from Supabase, using mock data:', err?.message)
      set({ papers: mockPapers, isLoading: false, error: err?.message })
    }
  },

  addPaperAsync: async (userId, paper) => {
    try {
      const created = await api.createResearchPaper(userId, paper)
      get().addPaper(created)
      return created
    } catch (err: any) {
      console.error('Failed to create paper:', err?.message)
      return null
    }
  },

  updatePaperAsync: async (id, updates) => {
    get().updatePaper(id, updates)
    try {
      await api.updateResearchPaper(id, updates)
    } catch (err: any) {
      console.error('Failed to update paper:', err?.message)
    }
  },

  deletePaperAsync: async (id) => {
    get().deletePaper(id)
    try {
      await api.deleteResearchPaper(id)
    } catch (err: any) {
      console.error('Failed to delete paper:', err?.message)
    }
  },
}))
