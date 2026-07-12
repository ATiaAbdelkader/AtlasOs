import { motion } from 'framer-motion'
import { Award, TrendingUp } from 'lucide-react'
import { useGamificationStore } from '@/stores/gamificationStore'
import { Progress } from '@/components/ui/progress'
import { XP_PER_LEVEL } from '@/types/gamification'
import { cn } from '@/lib/utils'

interface LevelBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
}

export function LevelBadge({ size = 'md', showProgress = false }: LevelBadgeProps) {
  const { level, getLevelProgress, getLevelTitle } = useGamificationStore()

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'flex items-center gap-3',
        size === 'sm' && 'gap-2',
        size === 'lg' && 'gap-4'
      )}
    >
      <div className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg',
        size === 'sm' && 'h-8 w-8',
        size === 'md' && 'h-12 w-12',
        size === 'lg' && 'h-16 w-16',
      )}>
        <Award className={cn(
          'text-white',
          size === 'sm' && 'h-4 w-4',
          size === 'md' && 'h-6 w-6',
          size === 'lg' && 'h-8 w-8',
        )} />
      </div>
      <div>
        <div className={cn(
          'font-bold text-foreground',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-lg',
        )}>
          Level {level.level}
        </div>
        <div className={cn(
          'text-muted-foreground',
          size === 'sm' && 'text-[10px]',
          size === 'md' && 'text-xs',
          size === 'lg' && 'text-sm',
        )}>
          {getLevelTitle()}
        </div>
        {showProgress && (
          <div className="mt-1 flex items-center gap-2">
            <Progress value={getLevelProgress()} className="h-1.5 w-20" />
            <span className="text-[10px] text-muted-foreground">{level.xp} / {XP_PER_LEVEL} XP</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
