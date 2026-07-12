import { motion } from 'framer-motion'
import { Zap, Flame, Target, Award } from 'lucide-react'
import { useGamificationStore } from '@/stores/gamificationStore'
import { LevelBadge } from './LevelBadge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { XP_PER_LEVEL } from '@/types/gamification'

export function GamificationPanel() {
  const { level, achievements, getLevelProgress, getLevelTitle } = useGamificationStore()
  const streak = 7

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <LevelBadge showProgress />
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-medium">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>{level.totalXpEarned}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total XP</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-medium">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span>{streak}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Day Streak</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-medium">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              <span>{achievements.length}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Badges</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
