export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type Status = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'delayed'
export type EnergyLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible'
export type Category = 'research' | 'writing' | 'business' | 'training' | 'personal' | 'education' | 'health' | 'finance'
export type MissionCategory = 'phd' | 'research' | 'business' | 'writing' | 'training' | 'grants' | 'personal'

export interface Mission {
  id: string
  title: string
  description: string
  category: MissionCategory
  color: string
  icon: string
  progress: number
  deadline?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  category: Category
  missionIds: string[]
  status: Status
  priority: Priority
  progress: number
  deadline?: string
  startDate: string
  budget?: number
  objectives: string[]
  milestones: Milestone[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  title: string
  description: string
  deadline?: string
  status: Status
  completedAt?: string
}

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  importance: number
  urgency: number
  estimatedTime: number
  actualTime: number
  category: Category
  projectId?: string
  missionIds: string[]
  deadline?: string
  dependencies: string[]
  subtasks: SubTask[]
  tags: string[]
  status: Status
  progress: number
  difficulty: number
  energyRequired: EnergyLevel
  location?: string
  context?: string
  aiSuggestion?: string
  reflectionAfter?: string
  scheduledDate?: string
  scheduledStart?: string
  scheduledEnd?: string
  isRecurring: boolean
  recurringPattern?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface SubTask {
  id: string
  title: string
  completed: boolean
}

export interface Habit {
  id: string
  title: string
  description: string
  category: Category
  frequency: 'daily' | 'weekly' | 'monthly'
  targetCount: number
  currentStreak: number
  longestStreak: number
  logs: HabitLog[]
  createdAt: string
  updatedAt: string
}

export interface HabitLog {
  date: string
  count: number
  completed: boolean
}

export interface JournalEntry {
  id: string
  date: string
  type: 'morning' | 'evening' | 'reflection'
  content: string
  mood: Mood
  energy: EnergyLevel
  wins: string[]
  challenges: string[]
  lessonsLearned: string[]
  gratitude: string[]
  createdAt: string
  updatedAt: string
}

export interface KnowledgeItem {
  id: string
  title: string
  content: string
  type: 'article' | 'idea' | 'note' | 'bookmark' | 'document' | 'video' | 'audio' | 'image' | 'link'
  tags: string[]
  projectId?: string
  missionIds: string[]
  source?: string
  url?: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface ResearchPaper {
  id: string
  title: string
  authors: string[]
  journal?: string
  year: number
  doi?: string
  url?: string
  abstract: string
  notes: string
  tags: string[]
  status: 'draft' | 'submitted' | 'review' | 'accepted' | 'rejected' | 'to_read' | 'reading' | 'read' | 'reviewed' | 'cited'
  rating: number
  citations: number
  readingList: boolean
  rejectionJournal?: string
  rejectionCause?: string
  rejectionDate?: string
  createdAt: string
  updatedAt: string
}

export interface WritingProject {
  id: string
  title: string
  type: 'book' | 'article' | 'grant' | 'report' | 'manual' | 'thesis' | 'paper' | 'proposal'
  description: string
  targetWordCount: number
  currentWordCount: number
  status: Status
  deadline?: string
  tags: string[]
  sessions: WritingSession[]
  createdAt: string
  updatedAt: string
}

export interface WritingSession {
  id: string
  date: string
  wordCount: number
  timeSpent: number
  notes: string
}

export interface BusinessClient {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  type: 'client' | 'partner' | 'lead'
  status: 'active' | 'inactive' | 'lead'
  notes: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  clientId: string
  number: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  paidAt?: string
  items: InvoiceItem[]
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface CalendarEvent {
  id: string
  title: string
  description: string
  start: string
  end: string
  allDay: boolean
  type: 'task' | 'meeting' | 'focus' | 'break' | 'appointment' | 'deadline'
  projectId?: string
  color?: string
  recurring?: string
  createdAt: string
  updatedAt: string
}

export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AIRecommendation {
  id: string
  type: 'warning' | 'suggestion' | 'insight' | 'achievement' | 'reminder'
  title: string
  description: string
  priority: Priority
  category?: Category
  actionLabel?: string
  actionLink?: string
  dismissed: boolean
  createdAt: string
}

export interface ProductivityScore {
  date: string
  score: number
  tasksCompleted: number
  tasksTotal: number
  focusHours: number
  deepWorkHours: number
  writingWords: number
  researchHours: number
  businessHours: number
  trainingHours: number
}

export interface ActivityLog {
  id: string
  type: 'task' | 'project' | 'writing' | 'research' | 'business' | 'habit' | 'journal'
  action: string
  description: string
  timestamp: string
}

export type CareerEntryType = 'role' | 'education' | 'certification' | 'conference' | 'membership' | 'achievement' | 'book' | 'training' | 'other'

export interface CareerEntry {
  id: string
  title: string
  subtitle: string
  type: CareerEntryType
  startDate: string
  endDate?: string
  description: string
  category: string
  url?: string
  icon?: string
  sortOrder: number
  skillIds: string[]
  createdAt: string
  updatedAt: string
}

export interface Skill {
  id: string
  name: string
  category: string
  level: number
  year: number
  description: string
  createdAt: string
  updatedAt: string
}
