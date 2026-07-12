import { create } from 'zustand'
import type { Project } from '@/types'
import * as api from '@/lib/supabaseService'
import { projects as mockProjects } from '@/data/mockData'

interface ProjectState {
  projects: Project[]
  isLoading: boolean
  error: string | null
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  init: (userId: string) => Promise<void>
  addProjectAsync: (userId: string, project: Partial<Project>) => Promise<Project | null>
  updateProjectAsync: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProjectAsync: (id: string) => Promise<void>
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  setProjects: (projects) => set({ projects }),

  addProject: (project) => set((s) => ({ projects: [project, ...s.projects] })),

  updateProject: (id, updates) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)),
    })),

  deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

  init: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const projects = await api.fetchProjects(userId)
      const normalized = projects.map((p) => ({
        ...p,
        objectives: p.objectives ?? [],
        milestones: p.milestones ?? [],
        tags: p.tags ?? [],
        missionIds: p.missionIds ?? [],
      }))
      set({ projects: normalized, isLoading: false })
    } catch (err: any) {
      console.warn('Failed to fetch projects from Supabase, using mock data:', err?.message)
      set({ projects: mockProjects, isLoading: false, error: err?.message })
    }
  },

  addProjectAsync: async (userId, project) => {
    try {
      const created = await api.createProject(userId, project)
      get().addProject(created)
      return created
    } catch (err: any) {
      console.error('Failed to create project:', err?.message)
      return null
    }
  },

  updateProjectAsync: async (id, updates) => {
    get().updateProject(id, updates)
    try {
      await api.updateProject(id, updates)
    } catch (err: any) {
      console.error('Failed to update project:', err?.message)
    }
  },

  deleteProjectAsync: async (id) => {
    get().deleteProject(id)
    try {
      await api.deleteProject(id)
    } catch (err: any) {
      console.error('Failed to delete project:', err?.message)
    }
  },
}))
