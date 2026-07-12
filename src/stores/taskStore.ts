import { create } from 'zustand'
import type { Task } from '@/types'
import * as api from '@/lib/supabaseService'
import { tasks as mockTasks } from '@/data/mockData'

interface TaskState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  init: (userId: string) => Promise<void>
  addTaskAsync: (userId: string, task: Partial<Task>) => Promise<Task | null>
  updateTaskAsync: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTaskAsync: (id: string) => Promise<void>
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),

  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)),
    })),

  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  init: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const tasks = await api.fetchTasks(userId)
      const normalized = tasks.map((t) => ({
        ...t,
        missionIds: t.missionIds ?? [],
        dependencies: t.dependencies ?? [],
        subtasks: t.subtasks ?? [],
        tags: t.tags ?? [],
      }))
      set({ tasks: normalized, isLoading: false })
    } catch (err: any) {
      console.warn('Failed to fetch tasks from Supabase, using mock data:', err?.message)
      set({ tasks: mockTasks, isLoading: false, error: err?.message })
    }
  },

  addTaskAsync: async (userId, task) => {
    try {
      const created = await api.createTask(userId, task)
      get().addTask(created)
      return created
    } catch (err: any) {
      console.error('Failed to create task:', err?.message)
      return null
    }
  },

  updateTaskAsync: async (id, updates) => {
    get().updateTask(id, updates)
    try {
      await api.updateTask(id, updates)
    } catch (err: any) {
      console.error('Failed to update task:', err?.message)
    }
  },

  deleteTaskAsync: async (id) => {
    get().deleteTask(id)
    try {
      await api.deleteTask(id)
    } catch (err: any) {
      console.error('Failed to delete task:', err?.message)
    }
  },
}))
