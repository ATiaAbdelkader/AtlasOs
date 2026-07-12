import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, getDaysUntil, formatDate } from '@/lib/utils'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'

function getDeadlineColor(days: number): { color: string; bg: string; label: string; icon: typeof AlertCircle } {
  if (days <= 3) return { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Urgent', icon: AlertCircle }
  if (days <= 14) return { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Soon', icon: AlertTriangle }
  return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'On Track', icon: CheckCircle2 }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export default function UpcomingDeadlines() {
  const tasks = useTaskStore((s) => s.tasks)
  const projects = useProjectStore((s) => s.projects)

  const deadlines = useMemo(() => {
    return tasks
      .filter((t) => t.deadline && t.status !== 'completed')
      .map((t) => ({
        ...t,
        daysUntil: getDaysUntil(t.deadline!),
        project: t.projectId ? projects.find((p) => p.id === t.projectId) : undefined,
      }))
      .filter((t) => t.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 8)
  }, [tasks, projects])

  const grouped = useMemo(() => {
    const groups: { urgent: typeof deadlines; soon: typeof deadlines; onTrack: typeof deadlines } = { urgent: [], soon: [], onTrack: [] }
    deadlines.forEach((d) => {
      if (d.daysUntil <= 3) groups.urgent.push(d)
      else if (d.daysUntil <= 14) groups.soon.push(d)
      else groups.onTrack.push(d)
    })
    return groups
  }, [deadlines])

  const sections = [
    { key: 'urgent' as const, label: 'Urgent', icon: AlertCircle, color: 'text-red-500', border: 'border-red-500/20' },
    { key: 'soon' as const, label: 'Upcoming', icon: AlertTriangle, color: 'text-amber-500', border: 'border-amber-500/20' },
    { key: 'onTrack' as const, label: 'On Track', icon: CheckCircle2, color: 'text-emerald-500', border: 'border-emerald-500/20' },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-amber-500" />
            Upcoming Deadlines
          </CardTitle>
          <span className="text-xs text-muted-foreground">{deadlines.length} upcoming</span>
        </CardHeader>
        <CardContent className="space-y-4">
          {deadlines.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No upcoming deadlines</p>
          ) : (
            sections.map((section) => {
              const items = grouped[section.key]
              if (items.length === 0) return null
              return (
                <div key={section.key}>
                  <div className={cn('mb-2 flex items-center gap-1.5 text-xs font-medium', section.color)}>
                    <section.icon className="h-3 w-3" />
                    {section.label} ({items.length})
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const { color, bg } = getDeadlineColor(item.daysUntil)
                      return (
                        <motion.div
                          key={item.id}
                          variants={itemVariants}
                          className={cn(
                            'flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:border-border',
                          )}
                        >
                          <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', bg)}>
                            <span className={cn('text-xs font-bold', color)}>{item.daysUntil}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{item.title}</p>
                            {item.project && (
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.project.title}</p>
                            )}
                          </div>
                          <div className="hidden shrink-0 text-right sm:block">
                            <p className="text-xs text-muted-foreground">{formatDate(item.deadline!)}</p>
                            <Badge variant="outline" className={cn('mt-0.5 text-[10px]', color)}>
                              {item.daysUntil === 0 ? 'Today' : `${item.daysUntil}d`}
                            </Badge>
                          </div>
                          <div className={cn('h-2 w-2 shrink-0 rounded-full', bg)} />
                        </motion.div>
                      )
                    })}
                  </div>
                  <Separator className="mt-3" />
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
