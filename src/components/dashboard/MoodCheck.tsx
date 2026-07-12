import { useState } from 'react'
import { motion } from 'framer-motion'
import { SmilePlus, Smile, Meh, Frown, Angry } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Mood } from '@/types'

const moodOptions: { mood: Mood; icon: typeof SmilePlus; label: string; color: string }[] = [
  { mood: 'great', icon: SmilePlus, label: 'Great', color: 'text-emerald-500' },
  { mood: 'good', icon: Smile, label: 'Good', color: 'text-blue-500' },
  { mood: 'neutral', icon: Meh, label: 'Neutral', color: 'text-amber-500' },
  { mood: 'bad', icon: Frown, label: 'Bad', color: 'text-orange-500' },
  { mood: 'terrible', icon: Angry, label: 'Terrible', color: 'text-red-500' },
]

const moodColors: Record<Mood, string> = {
  great: 'bg-emerald-500',
  good: 'bg-blue-500',
  neutral: 'bg-amber-500',
  bad: 'bg-orange-500',
  terrible: 'bg-red-500',
}

export default function MoodCheck() {
  const [currentMood, setCurrentMood] = useState<Mood | null>(null)
  const [moodHistory, setMoodHistory] = useState<Mood[]>([])

  const handleMoodSelect = (mood: Mood) => {
    setCurrentMood(mood)
    setMoodHistory((prev) => [mood, ...prev].slice(0, 14))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Smile className="h-4 w-4 text-violet-500" />
            Mood Check
          </CardTitle>
          {currentMood && (
            <span className="text-xs text-muted-foreground">
              Today: {moodOptions.find((m) => m.mood === currentMood)?.label}
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            {moodOptions.map(({ mood, icon: Icon, label, color }) => (
              <motion.button
                key={mood}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleMoodSelect(mood)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl p-3 transition-colors',
                  currentMood === mood
                    ? 'bg-accent ring-2 ring-ring'
                    : 'hover:bg-accent/50'
                )}
              >
                <Icon
                  className={cn(
                    'h-6 w-6 transition-colors',
                    currentMood === mood ? color : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    currentMood === mood ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              </motion.button>
            ))}
          </div>

          {moodHistory.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                History
              </p>
              <div className="flex flex-wrap gap-1.5">
                {moodHistory.map((mood, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn('h-2.5 w-2.5 rounded-full', moodColors[mood])}
                    title={mood}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
