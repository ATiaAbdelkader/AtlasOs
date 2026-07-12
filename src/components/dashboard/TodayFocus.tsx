import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Focus, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn, getDaysUntil } from '@/lib/utils'
import { useTaskStore } from '@/stores/taskStore'
import type { Priority } from '@/types'

const priorityConfig: Record<Priority, { label: string; variant: 'destructive' | 'warning' | 'info' | 'secondary'; className: string }> = {
  critical: { label: 'Critical', variant: 'destructive', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  high: { label: 'High', variant: 'warning', className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  medium: { label: 'Medium', variant: 'info', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  low: { label: 'Low', variant: 'secondary', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

export default function TodayFocus() {
  const tasks = useTaskStore((s) => s.tasks)

  const focusTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return tasks
      .filter((t) => {
        if (t.status === 'completed') return false
        if (t.scheduledDate === today) return true
        if (t.deadline && getDaysUntil(t.deadline) <= 0) return true
        return false
      })
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
      .slice(0, 3)
  }, [tasks])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Focus className="h-4 w-4 text-violet-500" />
            Today's Focus
          </CardTitle>
          <span className="text-xs text-muted-foreground">{focusTasks.length} tasks</span>
        </CardHeader>
        <CardContent className="space-y-4">
          {focusTasks.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No tasks scheduled for today</p>
          ) : (
            focusTasks.map((task) => {
              const config = priorityConfig[task.priority]
              return (
                <motion.div
                  key={task.id}
                  variants={itemVariants}
                  className="group space-y-2 rounded-xl border border-border/50 p-3 transition-colors hover:border-border"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{task.title}</p>
                      {task.deadline && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {getDaysUntil(task.deadline) > 0
                              ? `${getDaysUntil(task.deadline)}d remaining`
                              : 'Due today'}
                          </span>
                        </div>
                      )}
                    </div>
                    <Badge variant={config.variant as any} className={cn('shrink-0', config.className)}>
                      {config.label}
                    </Badge>
                  </div>
                  <Progress value={task.progress} className="h-1.5" />
                </motion.div>
              )
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
