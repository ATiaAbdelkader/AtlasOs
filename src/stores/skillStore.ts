import { create } from 'zustand'
import type { Skill } from '@/types'
import * as api from '@/lib/supabaseService'
import { skills as mockSkills } from '@/data/mockData'

interface SkillState {
  skills: Skill[]
  isLoading: boolean
  error: string | null
  setSkills: (skills: Skill[]) => void
  addSkill: (skill: Skill) => void
  updateSkill: (id: string, updates: Partial<Skill>) => void
  deleteSkill: (id: string) => void
  init: (userId: string) => Promise<void>
  addSkillAsync: (userId: string, skill: Partial<Skill>) => Promise<Skill | null>
  updateSkillAsync: (id: string, updates: Partial<Skill>) => Promise<void>
  deleteSkillAsync: (id: string) => Promise<void>
}

export const useSkillStore = create<SkillState>()((set, get) => ({
  skills: [],
  isLoading: false,
  error: null,

  setSkills: (skills) => set({ skills }),

  addSkill: (skill) => set((s) => ({ skills: [skill, ...s.skills] })),

  updateSkill: (id, updates) =>
    set((s) => ({
      skills: s.skills.map((sk) => (sk.id === id ? { ...sk, ...updates, updatedAt: new Date().toISOString() } : sk)),
    })),

  deleteSkill: (id) => set((s) => ({ skills: s.skills.filter((sk) => sk.id !== id) })),

  init: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const skills = await api.fetchSkills(userId)
      set({ skills, isLoading: false })
    } catch (err: any) {
      console.warn('Failed to fetch skills from Supabase, using seeded data:', err?.message)
      set({ skills: mockSkills, isLoading: false, error: err?.message })
    }
  },

  addSkillAsync: async (userId, skill) => {
    try {
      const created = await api.createSkill(userId, skill)
      get().addSkill(created)
      return created
    } catch (err: any) {
      console.error('Failed to create skill:', err?.message)
      return null
    }
  },

  updateSkillAsync: async (id, updates) => {
    get().updateSkill(id, updates)
    try {
      await api.updateSkill(id, updates)
    } catch (err: any) {
      console.error('Failed to update skill:', err?.message)
    }
  },

  deleteSkillAsync: async (id) => {
    get().deleteSkill(id)
    try {
      await api.deleteSkill(id)
    } catch (err: any) {
      console.error('Failed to delete skill:', err?.message)
    }
  },
}))
