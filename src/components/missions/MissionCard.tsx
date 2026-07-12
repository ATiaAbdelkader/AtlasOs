import { motion } from 'framer-motion'
import { Target, Calendar, Rocket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn, getDaysUntil } from '@/lib/utils'
import type { Mission, MissionCategory } from '@/types'

interface MissionCardProps {
  mission: Mission
  index?: number
}

const categoryConfig: Record<MissionCategory, { label: string; icon: typeof Target }> = {
  phd: { label: 'PhD', icon: Target },
  research: { label: 'Research', icon: Target },
  business: { label: 'Business', icon: Rocket },
  writing: { label: 'Writing', icon: Target },
  training: { label: 'Training', icon: Target },
  grants: { label: 'Grants', icon: Target },
  personal: { label: 'Personal', icon: Target },
}

export default function MissionCard({ mission, index = 0 }: MissionCardProps) {
  const config = categoryConfig[mission.category] ?? categoryConfig.personal
  const Icon = config.icon
  const daysUntil = mission.deadline ? getDaysUntil(mission.deadline) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    >
      <div
        className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md"
      >
        <div
          className="absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.06]"
          style={{ backgroundColor: mission.color }}
        />
        <div
          className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
          style={{ backgroundColor: mission.color }}
        />

        <div className="relative space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold">{mission.title}</h3>
              {mission.description && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {mission.description}
                </p>
              )}
            </div>
            <Badge
              variant="outline"
              className="shrink-0 gap-1 text-[10px]"
              style={{
                borderColor: `${mission.color}30`,
                color: mission.color,
                backgroundColor: `${mission.color}10`,
              }}
            >
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>

          <Progress
            value={mission.progress}
            className="h-2"
            indicatorClassName="transition-all duration-700"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(mission.progress)}% complete</span>
            {daysUntil !== null && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className={daysUntil <= 0 ? 'text-red-500' : ''}>
                  {daysUntil <= 0 ? 'Overdue' : `${daysUntil}d left`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
