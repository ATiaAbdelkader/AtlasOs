import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  BookOpen,
  PenLine,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  Flame,
  ChevronDown,
  ChevronUp,
  ListTodo,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn, formatDate, getStatusColor, getDaysUntil } from '@/lib/utils'
import { writingProjects } from '@/data/mockData'
import type { WritingProject } from '@/types'

const typeConfig: Record<string, { label: string; className: string }> = {
  book: { label: 'Book', className: 'border-rose-500/20 text-rose-500 bg-rose-500/10' },
  article: { label: 'Article', className: 'border-blue-500/20 text-blue-500 bg-blue-500/10' },
  grant: { label: 'Grant', className: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10' },
  report: { label: 'Report', className: 'border-amber-500/20 text-amber-500 bg-amber-500/10' },
  manual: { label: 'Manual', className: 'border-violet-500/20 text-violet-500 bg-violet-500/10' },
  thesis: { label: 'Thesis', className: 'border-purple-500/20 text-purple-500 bg-purple-500/10' },
  paper: { label: 'Paper', className: 'border-cyan-500/20 text-cyan-500 bg-cyan-500/10' },
  proposal: { label: 'Proposal', className: 'border-orange-500/20 text-orange-500 bg-orange-500/10' },
}

const statusLabel: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
  delayed: 'Delayed',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
} as const

export default function Writing() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const stats = useMemo(() => {
    const totalWords = writingProjects.reduce((sum, p) => sum + p.currentWordCount, 0)
    const totalTarget = writingProjects.reduce((sum, p) => sum + p.targetWordCount, 0)
    const totalProjects = writingProjects.length
    const activeProjects = writingProjects.filter((p) => p.status === 'in_progress').length
    const completionPct = totalTarget > 0 ? Math.round((totalWords / totalTarget) * 100) : 0
    return { totalWords, totalProjects, activeProjects, completionPct }
  }, [])

  const lastSessionDate = useMemo(() => {
    const allDates = writingProjects.flatMap((p) => p.sessions.map((s) => s.date))
    if (allDates.length === 0) return null
    return allDates.sort().reverse()[0]
  }, [])

  const streakDays = useMemo(() => {
    if (!lastSessionDate) return 0
    const last = new Date(lastSessionDate)
    const today = new Date()
    const diff = Math.floor((today.getTime() - last.getTime()) / 86400000)
    return diff
  }, [lastSessionDate])

  const wordsPerDayData = useMemo(() => {
    const map = new Map<string, number>()
    for (const project of writingProjects) {
      for (const session of project.sessions) {
        map.set(session.date, (map.get(session.date) ?? 0) + session.wordCount)
      }
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, words]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        words,
      }))
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Writing Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your writing projects and daily progress
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <PenLine className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats.totalWords.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Words Written</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats.totalProjects}</p>
              <p className="text-xs text-muted-foreground">Total Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ListTodo className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats.activeProjects}</p>
              <p className="text-xs text-muted-foreground">Active Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats.completionPct}%</p>
              <p className="text-xs text-muted-foreground">Completion Forecast</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <h2 className="text-sm font-semibold">Words Per Day</h2>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wordsPerDayData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                  />
                  <Bar
                    dataKey="words"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm font-semibold">Writing Streak</h2>
            </div>
            <div className="flex flex-col items-center justify-center py-4">
              <div
                className={cn(
                  'flex h-20 w-20 items-center justify-center rounded-full border-4 text-2xl font-bold',
                  streakDays === 0
                    ? 'border-emerald-500 text-emerald-500'
                    : streakDays <= 2
                      ? 'border-amber-500 text-amber-500'
                      : 'border-slate-500/30 text-muted-foreground',
                )}
              >
                {streakDays === 0 ? (
                  <Flame className="h-8 w-8 fill-emerald-500" />
                ) : (
                  `${streakDays}d`
                )}
              </div>
              <p className="mt-3 text-sm font-medium">
                {streakDays === 0
                  ? 'Wrote today!'
                  : streakDays === 1
                    ? '1 day since last session'
                    : `${streakDays} days since last session`}
              </p>
              {lastSessionDate && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Last session: {formatDate(lastSessionDate)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4">
        {writingProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <BookOpen className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No writing projects yet</p>
          </motion.div>
        ) : (
          writingProjects.map((project) => {
            const isExpanded = expandedId === project.id
            const type = typeConfig[project.type]!
            const progressPct = Math.round((project.currentWordCount / project.targetWordCount) * 100)

            return (
              <motion.div
                key={project.id}
                layout
                variants={itemVariants}
                className={cn(
                  'rounded-2xl border border-border/50 bg-card shadow-sm backdrop-blur-xl transition-all',
                )}
              >
                <div
                  className="cursor-pointer p-5"
                  onClick={() => toggleExpand(project.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{project.title}</h3>
                        <Badge variant="outline" className={cn('text-[10px]', type.className)}>
                          {type.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px]', getStatusColor(project.status))}
                        >
                          {statusLabel[project.status] ?? project.status}
                        </Badge>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {streakDays <= 2 && (
                        <Flame className="h-4 w-4 text-orange-500" />
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <PenLine className="h-3 w-3" />
                        {project.currentWordCount.toLocaleString()} / {project.targetWordCount.toLocaleString()} words
                      </span>
                      <span>{progressPct}%</span>
                    </div>
                    <Progress value={progressPct} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {project.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due {formatDate(project.deadline)}
                          {getDaysUntil(project.deadline) > 0 && (
                            <span className="ml-1">({getDaysUntil(project.deadline)}d left)</span>
                          )}
                        </span>
                      )}
                      <span>
                        {project.sessions.length} session{project.sessions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' } as const}
                      className="overflow-hidden"
                    >
                      <Separator />
                      <div className="space-y-3 p-5">
                        <h4 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          Writing Sessions
                        </h4>
                        {project.sessions.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No sessions logged yet</p>
                        ) : (
                          <div className="space-y-2">
                            {[...project.sessions]
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((session) => (
                                <div
                                  key={session.id}
                                  className="flex items-start gap-3 rounded-xl border border-border/50 p-3"
                                >
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                                    <PenLine className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="font-medium text-foreground">
                                        +{session.wordCount} words
                                      </span>
                                      <span className="text-muted-foreground">
                                        {formatDate(session.date)}
                                      </span>
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        {Math.floor(session.timeSpent / 60)}h {session.timeSpent % 60}m
                                      </Badge>
                                    </div>
                                    {session.notes && (
                                      <p className="mt-1 text-xs text-muted-foreground">{session.notes}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </motion.div>
    </motion.div>
  )
}
