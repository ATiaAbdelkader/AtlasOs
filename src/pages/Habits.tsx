import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Flame, CheckCircle2, Circle, Trophy, Target, CalendarDays, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { habits } from '@/data/mockData'
import type { Habit, HabitLog } from '@/types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
} as const

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getMonthDays(year: number, month: number): { day: number; date: Date }[] {
  const days: { day: number; date: Date }[] = []
  const total = getDaysInMonth(year, month)
  for (let i = 1; i <= total; i++) {
    days.push({ day: i, date: new Date(year, month, i) })
  }
  return days
}

function getLogStatus(logs: HabitLog[], date: Date): 'completed' | 'missed' | 'future' {
  const dateStr = date.toISOString().split('T')[0]
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (date > today) return 'future'

  const log = logs.find(
    (l) => new Date(l.date).toISOString().split('T')[0] === dateStr
  )
  if (!log) return 'missed'
  return log.completed ? 'completed' : 'missed'
}

function getCompletionRate(logs: HabitLog[]): number {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthLogs = logs.filter((l) => new Date(l.date) >= startOfMonth)
  if (monthLogs.length === 0) return 0
  const completed = monthLogs.filter((l) => l.completed).length
  return Math.round((completed / monthLogs.length) * 100)
}

function CalendarGrid({ habit }: { habit: Habit }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const days = getMonthDays(year, month)
  const firstDay = new Date(year, month, 1).getDay()
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 gap-0.5">
        {dayLabels.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map(({ day, date }) => {
          const status = getLogStatus(habit.logs, date)
          return (
            <div
              key={day}
              className="flex aspect-square items-center justify-center"
            >
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium',
                  status === 'completed' && 'bg-emerald-500/20 text-emerald-500',
                  status === 'missed' && 'bg-red-500/20 text-red-500',
                  status === 'future' && 'bg-muted/30 text-muted-foreground/40'
                )}
              >
                {day}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Habits() {
  const [checkedHabits, setCheckedHabits] = useState<Set<string>>(new Set())
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null)

  const stats = useMemo(() => {
    const bestStreak = Math.max(...habits.map((h) => h.longestStreak))
    const currentStreak = Math.max(...habits.map((h) => h.currentStreak))
    const avgCompletion =
      habits.reduce((acc, h) => acc + getCompletionRate(h.logs), 0) / habits.length
    return { bestStreak, currentStreak, avgCompletion: Math.round(avgCompletion) }
  }, [])

  const toggleHabit = (id: string) => {
    setCheckedHabits((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and build your daily routines
          </p>
        </div>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.bestStreak}</p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgCompletion}%</p>
              <p className="text-xs text-muted-foreground">Avg Completion Rate</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Today's Habits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {habits.map((habit) => (
                <motion.button
                  key={habit.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleHabit(habit.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all',
                    checkedHabits.has(habit.id)
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border/50 hover:border-border'
                  )}
                >
                  {checkedHabits.has(habit.id) ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        checkedHabits.has(habit.id) && 'text-muted-foreground line-through'
                      )}
                    >
                      {habit.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Target: {habit.targetCount} {habit.frequency}
                    </p>
                  </div>
                  <Flame
                    className={cn(
                      'h-4 w-4 shrink-0',
                      habit.currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground/40'
                    )}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {habit.currentStreak}
                  </span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {habits.map((habit) => (
          <motion.div
            key={habit.id}
            layout
            transition={{ duration: 0.3 }}
          >
            <Card
              className={cn(
                'cursor-pointer transition-all hover:border-border',
                expandedHabit === habit.id && 'md:col-span-2 xl:col-span-3'
              )}
              onClick={() => setExpandedHabit(expandedHabit === habit.id ? null : habit.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{habit.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{habit.description}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {habit.frequency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                    <span className="font-semibold">{habit.currentStreak}</span>
                    <span className="text-muted-foreground">current</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-semibold">{habit.longestStreak}</span>
                    <span className="text-muted-foreground">best</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-blue-500" />
                    <span className="font-semibold">{habit.targetCount}</span>
                    <span className="text-muted-foreground">target</span>
                  </div>
                </div>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    expandedHabit === habit.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="pt-2">
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>June 2026</span>
                    </div>
                    <CalendarGrid habit={habit} />
                  </div>
                </div>
                {expandedHabit !== habit.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedHabit(habit.id)
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Clock className="h-3 w-3" />
                    View monthly calendar
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
