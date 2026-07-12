export interface UserLevel {
  level: number
  xp: number
  totalXpEarned: number
}

export interface Achievement {
  id: string
  code: string
  title: string
  description: string
  icon: string
  category: string
  xpReward: number
  unlockedAt: string
}

export const XP_PER_LEVEL = 500

export const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  { code: 'first_task', title: 'First Steps', description: 'Complete your first task', icon: 'check-circle', category: 'productivity', xpReward: 50 },
  { code: 'ten_tasks', title: 'Getting Things Done', description: 'Complete 10 tasks', icon: 'list-checks', category: 'productivity', xpReward: 100 },
  { code: 'fifty_tasks', title: 'Power User', description: 'Complete 50 tasks', icon: 'zap', category: 'productivity', xpReward: 250 },
  { code: 'hundred_tasks', title: 'Centurion', description: 'Complete 100 tasks', icon: 'trophy', category: 'productivity', xpReward: 500 },
  { code: 'week_streak', title: 'Week Warrior', description: '7-day task completion streak', icon: 'flame', category: 'consistency', xpReward: 150 },
  { code: 'month_streak', title: 'Monthly Master', description: '30-day task completion streak', icon: 'award', category: 'consistency', xpReward: 500 },
  { code: 'first_writing', title: 'Author Begins', description: 'First writing session', icon: 'pen', category: 'writing', xpReward: 75 },
  { code: 'ten_k_words', title: 'Wordsmith', description: 'Write 10,000 words', icon: 'book-open', category: 'writing', xpReward: 200 },
  { code: 'fifty_k_words', title: 'Novelist', description: 'Write 50,000 words', icon: 'book', category: 'writing', xpReward: 500 },
  { code: 'first_research', title: 'Researcher', description: 'Add first research paper', icon: 'flask', category: 'research', xpReward: 75 },
  { code: 'ten_papers', title: 'Scholar', description: 'Add 10 research papers', icon: 'graduation-cap', category: 'research', xpReward: 300 },
  { code: 'first_habit_streak', title: 'Habit Starter', description: '3-day habit streak', icon: 'heart', category: 'health', xpReward: 50 },
  { code: 'habit_master', title: 'Habit Master', description: '21-day habit streak', icon: 'target', category: 'health', xpReward: 300 },
  { code: 'first_journal', title: 'Journal Keeper', description: 'Write first journal entry', icon: 'book-marked', category: 'mindfulness', xpReward: 50 },
  { code: 'seven_journal', title: 'Daily Reflector', description: '7 journal entries', icon: 'notebook', category: 'mindfulness', xpReward: 150 },
  { code: 'first_milestone', title: 'Milestone Achieved', description: 'Complete first milestone', icon: 'flag', category: 'projects', xpReward: 100 },
  { code: 'deep_work_10', title: 'Deep Focus', description: '10 hours of deep work', icon: 'brain', category: 'productivity', xpReward: 200 },
  { code: 'early_bird', title: 'Early Bird', description: 'Complete 5 tasks before 9 AM', icon: 'sunrise', category: 'habits', xpReward: 100 },
  { code: 'night_owl', title: 'Night Owl', description: 'Complete 5 tasks after 9 PM', icon: 'moon', category: 'habits', xpReward: 100 },
  { code: 'mission_control', title: 'Mission Commander', description: 'Create 3 active missions', icon: 'target', category: 'strategy', xpReward: 150 },
]

export interface AchievementDef {
  code: string
  title: string
  description: string
  icon: string
  category: string
  xpReward: number
}
