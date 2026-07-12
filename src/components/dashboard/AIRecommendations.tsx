import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Brain,
  Award,
  Bell,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { aiRecommendations } from '@/data/mockData'
import type { AIRecommendation } from '@/types'

const iconMap: Record<AIRecommendation['type'], typeof Lightbulb> = {
  warning: AlertTriangle,
  suggestion: Lightbulb,
  insight: Brain,
  achievement: Award,
  reminder: Bell,
}

const gradientMap: Record<AIRecommendation['type'], string> = {
  warning: 'from-red-500/20 via-red-500/5 to-transparent',
  suggestion: 'from-blue-500/20 via-blue-500/5 to-transparent',
  insight: 'from-purple-500/20 via-purple-500/5 to-transparent',
  achievement: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
  reminder: 'from-amber-500/20 via-amber-500/5 to-transparent',
}

const iconBgMap: Record<AIRecommendation['type'], string> = {
  warning: 'bg-red-500/10 text-red-500',
  suggestion: 'bg-blue-500/10 text-blue-500',
  insight: 'bg-purple-500/10 text-purple-500',
  achievement: 'bg-emerald-500/10 text-emerald-500',
  reminder: 'bg-amber-500/10 text-amber-500',
}

function getPriorityVariant(priority: AIRecommendation['priority']): 'destructive' | 'warning' | 'info' | 'secondary' {
  switch (priority) {
    case 'critical': return 'destructive'
    case 'high': return 'warning'
    case 'medium': return 'info'
    case 'low': return 'secondary'
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16, transition: { duration: 0.2 } },
}

export default function AIRecommendations() {
  const [recommendations, setRecommendations] = useState(aiRecommendations.filter((r) => !r.dismissed))

  const dismiss = (id: string) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-purple-500" />
            AI Recommendations
          </CardTitle>
          <span className="text-xs text-muted-foreground">{recommendations.length} insights</span>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence mode="popLayout">
            {recommendations.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-4 text-center text-sm text-muted-foreground"
              >
                No recommendations right now
              </motion.p>
            ) : (
              recommendations.map((rec) => {
                const Icon = iconMap[rec.type]
                return (
                  <motion.div
                    key={rec.id}
                    layout
                    variants={itemVariants}
                    exit="exit"
                    className={cn(
                      'group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br p-4 transition-colors hover:border-border',
                      gradientMap[rec.type],
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', iconBgMap[rec.type])}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{rec.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{rec.description}</p>
                          </div>
                          <Badge variant={getPriorityVariant(rec.priority)} className="shrink-0 capitalize">
                            {rec.priority}
                          </Badge>
                        </div>
                        {rec.actionLabel && (
                          <Button variant="outline" size="sm" className="mt-3 h-8 text-xs" onClick={() => rec.actionLink && window.open(rec.actionLink, '_blank')}>
                            {rec.actionLabel}
                          </Button>
                        )}
                      </div>
                      <button
                        onClick={() => dismiss(rec.id)}
                        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
