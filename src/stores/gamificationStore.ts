import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserLevel, Achievement } from '@/types/gamification'
import { XP_PER_LEVEL, ACHIEVEMENT_DEFINITIONS } from '@/types/gamification'

interface GamificationState {
  level: UserLevel
  achievements: Achievement[]
  addXp: (amount: number, source: string) => void
  unlockAchievement: (code: string) => void
  getLevelProgress: () => number
  getLevelTitle: () => string
}

const LEVEL_TITLES = [
  'Beginner', 'Apprentice', 'Achiever', 'Scholar', 'Expert',
  'Master', 'Visionary', 'Legend', 'Titan', 'Atlas',
]

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      level: { level: 1, xp: 0, totalXpEarned: 0 },
      achievements: [],

      addXp: (amount, source) => {
        set((state) => {
          let { level, xp, totalXpEarned } = state.level
          xp += amount
          totalXpEarned += amount
          let newLevel = level
          while (xp >= XP_PER_LEVEL) {
            xp -= XP_PER_LEVEL
            newLevel++
          }
          return { level: { level: newLevel, xp, totalXpEarned } }
        })
      },

      unlockAchievement: (code) => {
        const { achievements } = get()
        if (achievements.some((a) => a.code === code)) return
        const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.code === code)
        if (!def) return
        const achievement: Achievement = {
          id: crypto.randomUUID(),
          code,
          title: def.title,
          description: def.description,
          icon: def.icon,
          category: def.category,
          xpReward: def.xpReward,
          unlockedAt: new Date().toISOString(),
        }
        set((s) => ({ achievements: [...s.achievements, achievement] }))
        get().addXp(def.xpReward, `Achievement: ${def.title}`)
      },

      getLevelProgress: () => {
        const { level } = get()
        return (level.xp / XP_PER_LEVEL) * 100
      },

      getLevelTitle: () => {
        const { level } = get()
        const idx = Math.min(level.level - 1, LEVEL_TITLES.length - 1)
        return LEVEL_TITLES[idx] || 'Atlas'
      },
    }),
    { name: 'atlasos-gamification' }
  )
)
