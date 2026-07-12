import { motion } from 'framer-motion'
import { Lock, Check, Award, Flame, BookOpen, FlaskConical, Heart, Target, Brain, Sun, Moon, GraduationCap, Zap, Trophy, Flag, Notebook, Pen, ListChecks, BookMarked } from 'lucide-react'
import { useGamificationStore } from '@/stores/gamificationStore'
import { ACHIEVEMENT_DEFINITIONS } from '@/types/gamification'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, React.ComponentType> = {
  'check-circle': ListChecks, 'list-checks': ListChecks, 'zap': Zap, 'trophy': Trophy,
  'flame': Flame, 'award': Award, 'pen': Pen, 'book-open': BookOpen, 'book': BookOpen,
  'flask': FlaskConical, 'graduation-cap': GraduationCap, 'heart': Heart, 'target': Target,
  'book-marked': BookMarked, 'notebook': BookMarked, 'flag': Flag, 'brain': Brain,
  'sunrise': Sun, 'moon': Moon,
}

export function AchievementsList() {
  const { achievements } = useGamificationStore()
  const unlockedCodes = new Set(achievements.map((a) => a.code))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4 text-amber-500" />
          Achievements
          <Badge variant="secondary" className="ml-auto text-xs">{achievements.length} / {ACHIEVEMENT_DEFINITIONS.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80 px-6 pb-6">
          <div className="space-y-2">
            {ACHIEVEMENT_DEFINITIONS.map((def, i) => {
              const unlocked = unlockedCodes.has(def.code)
              const Icon = ICON_MAP[def.icon] || Award
              return (
                <motion.div
                  key={def.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 transition-all',
                    unlocked ? 'border-amber-500/30 bg-amber-500/5' : 'border-border/50 opacity-50'
                  )}
                >
                  <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    unlocked ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'
                  )}>
                    {unlocked ? <Icon className="h-4.5 w-4.5" /> : <Lock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{def.title}</span>
                      {unlocked && <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{def.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">+{def.xpReward} XP</Badge>
                </motion.div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
