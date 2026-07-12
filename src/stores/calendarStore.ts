import { create } from 'zustand'
import type { CalendarEvent } from '@/types'
import * as api from '@/lib/supabaseService'
import { calendarEvents as mockEvents } from '@/data/mockData'
import type { SyncedCalendarEvent } from '@/lib/calendarSync'

interface CalendarState {
  events: CalendarEvent[]
  googleEvents: SyncedCalendarEvent[]
  isLoading: boolean
  error: string | null
  setEvents: (events: CalendarEvent[]) => void
  addEvent: (event: CalendarEvent) => void
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void
  setGoogleEvents: (events: SyncedCalendarEvent[]) => void
  init: (userId: string) => Promise<void>
  addEventAsync: (userId: string, event: Partial<CalendarEvent>) => Promise<CalendarEvent | null>
  updateEventAsync: (id: string, updates: Partial<CalendarEvent>) => Promise<void>
  deleteEventAsync: (id: string) => Promise<void>
}

export const useCalendarStore = create<CalendarState>()((set, get) => ({
  events: [],
  googleEvents: [],
  isLoading: false,
  error: null,

  setEvents: (events) => set({ events }),
  setGoogleEvents: (googleEvents) => set({ googleEvents }),

  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),

  updateEvent: (id, updates) =>
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e)),
    })),

  deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

  init: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const events = await api.fetchCalendarEvents(userId)
      set({ events, isLoading: false })
    } catch (err: any) {
      console.warn('Failed to fetch calendar events from Supabase, using mock data:', err?.message)
      set({ events: mockEvents, isLoading: false, error: err?.message })
    }
  },

  addEventAsync: async (userId, event) => {
    try {
      const created = await api.createCalendarEvent(userId, event)
      get().addEvent(created)
      return created
    } catch (err: any) {
      console.error('Failed to create event:', err?.message)
      return null
    }
  },

  updateEventAsync: async (id, updates) => {
    get().updateEvent(id, updates)
    try {
      await api.updateCalendarEvent(id, updates)
    } catch (err: any) {
      console.error('Failed to update event:', err?.message)
    }
  },

  deleteEventAsync: async (id) => {
    get().deleteEvent(id)
    try {
      await api.deleteCalendarEvent(id)
    } catch (err: any) {
      console.error('Failed to delete event:', err?.message)
    }
  },
}))
