import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, CheckCircle2, FileText, Target, Brain, Briefcase, ListTodo, Zap, Flame, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { activityLogs } from '@/data/mockData'
import TodayFocus from '@/components/dashboard/TodayFocus'
import { Progress } from '@/components/ui/progress'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { XP_PER_LEVEL } from '@/types/gamification'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
} as const

const activityIcons: Record<string, any> = {
  task: ListTodo,
  writing: FileText,
  research: Brain,
  business: Briefcase,
  project: Target,
  habit: CheckCircle2,
  journal: FileText,
}

const activityColors: Record<string, string> = {
  task: 'bg-blue-500/10 text-blue-500',
  writing: 'bg-purple-500/10 text-purple-500',
  research: 'bg-emerald-500/10 text-emerald-500',
  business: 'bg-amber-500/10 text-amber-500',
  project: 'bg-violet-500/10 text-violet-500',
  habit: 'bg-rose-500/10 text-rose-500',
  journal: 'bg-cyan-500/10 text-cyan-500',
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function QuickStat({ icon: Icon, label, value, color, delay }: {
  icon: any; label: string; value: string | number; color: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-4 shadow-sm backdrop-blur-xl"
    >
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-bold tabular-nums leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const tasks = useTaskStore((s) => s.tasks)
  const projects = useProjectStore((s) => s.projects)
  const { level, achievements, getLevelProgress, getLevelTitle } = useGamificationStore()

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'there'
  const initTasks = useTaskStore((s) => s.init)
  const initProjects = useProjectStore((s) => s.init)

  useEffect(() => {
    if (user) {
      initTasks(user.id)
      initProjects(user.id)
    }
  }, [user, initTasks, initProjects])

  const stats = useMemo(() => {
    const pending = tasks.filter((t) => t.status !== 'completed').length
    const completed = tasks.filter((t) => t.status === 'completed').length
    const activeProjects = projects.filter((p) => p.status === 'in_progress').length
    const overdue = tasks.filter(
      (t) => t.status !== 'completed' && t.deadline && new Date(t.deadline) < new Date(),
    ).length
    return { pending, completed, activeProjects, overdue }
  }, [tasks, projects])

  const recentActivity = useMemo(
    () =>
      activityLogs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 4),
    [],
  )

  const streak = 7
  const levelProgress = getLevelProgress()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 p-6"
    >
      {/* Hero */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, {displayName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card px-4 py-2 shadow-sm">
          <Zap className="h-4 w-4 text-violet-500" />
          <span className="text-sm font-semibold tabular-nums">Lv.{level.level}</span>
          <span className="text-xs text-muted-foreground">{getLevelTitle()}</span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <QuickStat icon={ListTodo} label="Pending Tasks" value={stats.pending} color="bg-blue-500/10 text-blue-500" delay={0.05} />
        <QuickStat icon={CheckCircle2} label="Completed" value={stats.completed} color="bg-emerald-500/10 text-emerald-500" delay={0.1} />
        <QuickStat icon={Target} label="Active Projects" value={stats.activeProjects} color="bg-violet-500/10 text-violet-500" delay={0.15} />
        <QuickStat icon={FileText} label="Overdue" value={stats.overdue} color="bg-red-500/10 text-red-500" delay={0.2} />
      </div>

      {/* Balanced 2-column: left focus + deadlines, right level + activity */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left column - 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          <TodayFocus />
          {/* Recent Activity */}
          <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-violet-500" />
              <h2 className="text-base font-semibold">Recent Activity</h2>
            </div>
            <div className="space-y-2">
              {recentActivity.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No recent activity</p>
              ) : (
                recentActivity.map((log, i) => {
                  const Icon = activityIcons[log.type] ?? Activity
                  const colorClass = activityColors[log.type] ?? 'bg-slate-500/10 text-slate-500'
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:border-border"
                    >
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          <span className="text-muted-foreground">{log.action}</span>{' '}
                          {log.description}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Right column - 1/3: deadlines + level */}
        <div className="space-y-5">
          {/* Upcoming Deadlines (full card) */}
          <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm backdrop-blur-xl">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
              <Target className="h-4 w-4 text-amber-500" />
              Deadlines
            </h2>
            <div className="space-y-2">
              {tasks
                .filter((t) => t.deadline && t.status !== 'completed')
                .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
                .slice(0, 4)
                .map((t) => {
                  const days = Math.ceil((new Date(t.deadline!).getTime() - Date.now()) / 86400000)
                  const isUrgent = days <= 3
                  return (
                    <div key={t.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                      <div className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        isUrgent ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground',
                      )}>
                        {days <= 0 ? '!' : days}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{t.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {days <= 0 ? 'Due today' : `${days}d remaining`}
                        </p>
                      </div>
                    </div>
                  )
                })
                .concat(
                  tasks.filter((t) => t.deadline && t.status !== 'completed').length === 0
                    ? [<div key="empty" className="py-4 text-center text-xs text-muted-foreground">No upcoming deadlines</div>]
                    : [],
                )}
            </div>
          </div>

          {/* Level Card */}
          <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm backdrop-blur-xl">
            <LevelBadge size="sm" />
            <Progress value={levelProgress} className="mt-3 h-2" />
            <p className="mt-1 text-xs text-muted-foreground text-center">
              {level.xp} / {XP_PER_LEVEL} XP to Level {level.level + 1}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-sm font-semibold tabular-nums">{level.totalXpEarned}</p>
                <p className="text-[10px] text-muted-foreground">Total XP</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <div className="flex items-center justify-center gap-0.5 text-sm font-semibold">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {streak}
                </div>
                <p className="text-[10px] text-muted-foreground">Streak</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-sm font-semibold tabular-nums">{achievements.length}</p>
                <p className="text-[10px] text-muted-foreground">Badges</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
