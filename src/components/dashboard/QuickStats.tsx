import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FolderKanban,
  ListTodo,
  FileText,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import { writingProjects } from '@/data/mockData'
import { productivityScores } from '@/data/mockData'

function useCounter(end: number, duration = 1200) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let rafId: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * end))
      if (progress < 1) rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [end, duration])

  return value
}

const statConfig = [
  {
    key: 'activeProjects' as const,
    label: 'Active Projects',
    icon: FolderKanban,
    gradient: 'from-violet-500/20 via-violet-500/5 to-transparent',
    iconBg: 'bg-violet-500/10 text-violet-500',
    border: 'border-violet-500/20',
  },
  {
    key: 'pendingTasks' as const,
    label: 'Pending Tasks',
    icon: ListTodo,
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    iconBg: 'bg-blue-500/10 text-blue-500',
    border: 'border-blue-500/20',
  },
  {
    key: 'totalWords' as const,
    label: 'Writing Progress',
    icon: FileText,
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    iconBg: 'bg-emerald-500/10 text-emerald-500',
    border: 'border-emerald-500/20',
  },
  {
    key: 'researchScore' as const,
    label: 'Research Score',
    icon: TrendingUp,
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    iconBg: 'bg-amber-500/10 text-amber-500',
    border: 'border-amber-500/20',
  },
]

export default function QuickStats() {
  const projects = useProjectStore((s) => s.projects)
  const tasks = useTaskStore((s) => s.tasks)

  const stats = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === 'in_progress').length
    const pendingTasks = tasks.filter((t) => t.status !== 'completed').length
    const totalWords = writingProjects.reduce((sum, w) => sum + w.currentWordCount, 0)
    const latestResearch = productivityScores.at(-1)?.researchHours ?? 0
    const researchScore = Math.round((latestResearch / 8) * 100)

    return { activeProjects, pendingTasks, totalWords, researchScore }
  }, [projects, tasks])

  const animatedProjects = useCounter(stats.activeProjects)
  const animatedTasks = useCounter(stats.pendingTasks)
  const animatedWords = useCounter(stats.totalWords)
  const animatedResearch = useCounter(stats.researchScore)

  const counters = {
    activeProjects: animatedProjects,
    pendingTasks: animatedTasks,
    totalWords: animatedWords,
    researchScore: animatedResearch,
  }

  const formatValue = (key: string, value: number): string => {
    if (key === 'totalWords') {
      if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
      return value.toString()
    }
    if (key === 'researchScore') return `${value}%`
    return value.toString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statConfig.map((stat, index) => {
          const Icon = stat.icon
          const rawValue = stats[stat.key]
          const animatedValue = counters[stat.key]
          const label =
            stat.key === 'activeProjects'
              ? 'Active'
              : stat.key === 'pendingTasks'
                ? 'Pending'
                : stat.key === 'totalWords'
                  ? 'Words'
                  : 'Score'

          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div
                className={cn(
                  'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm backdrop-blur-xl',
                  stat.gradient,
                  stat.border,
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', stat.iconBg)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
                </div>
                <div className="mt-3">
                  <motion.p
                    className="text-2xl font-bold tabular-nums"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                  >
                    {formatValue(stat.key, animatedValue)}
                  </motion.p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
