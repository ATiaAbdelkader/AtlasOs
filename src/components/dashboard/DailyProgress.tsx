import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Target, CheckCircle2, Clock, Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/stores/taskStore'
import { productivityScores } from '@/data/mockData'

function useCounter(end: number, duration = 1500) {
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

function CircularProgress({ value, size = 140, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
          opacity={0.15}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-violet-500"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-2xl font-bold tabular-nums"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'backOut' }}
        >
          {value}%
        </motion.span>
        <span className="text-[10px] text-muted-foreground">complete</span>
      </div>
    </div>
  )
}

export default function DailyProgress() {
  const tasks = useTaskStore((s) => s.tasks)

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.status === 'completed').length
    const todayScores = productivityScores[productivityScores.length - 1]
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      focusHours: todayScores?.focusHours ?? 0,
      deepWorkHours: todayScores?.deepWorkHours ?? 0,
    }
  }, [tasks])

  const animatedPercentage = useCounter(stats.percentage)
  const animatedCompleted = useCounter(stats.completed)
  const animatedTotal = useCounter(stats.total)
  const animatedFocus = useCounter(stats.focusHours * 10)
  const animatedDeep = useCounter(stats.deepWorkHours * 10)

  const statCards = [
    {
      icon: CheckCircle2,
      label: 'Tasks Done',
      value: `${animatedCompleted} / ${animatedTotal}`,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: Clock,
      label: 'Focus Hours',
      value: (animatedFocus / 10).toFixed(1),
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      suffix: 'h',
    },
    {
      icon: Brain,
      label: 'Deep Work',
      value: (animatedDeep / 10).toFixed(1),
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      suffix: 'h',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-violet-500" />
            Daily Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            <CircularProgress value={animatedPercentage} />
            <div className="grid w-full grid-cols-3 gap-3">
              {statCards.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className={cn('flex flex-col items-center gap-1.5 rounded-xl p-3', stat.bg)}
                  >
                    <Icon className={cn('h-4 w-4', stat.color)} />
                    <span className="text-xs font-semibold tabular-nums">
                      {stat.value}
                      {stat.suffix}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
