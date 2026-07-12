import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
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

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500'
  if (score >= 60) return 'text-blue-500'
  if (score >= 40) return 'text-amber-500'
  return 'text-red-500'
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/10'
  if (score >= 60) return 'bg-blue-500/10'
  if (score >= 40) return 'bg-amber-500/10'
  return 'bg-red-500/10'
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Great'
  if (score >= 70) return 'Good'
  if (score >= 60) return 'Fair'
  if (score >= 40) return 'Needs Work'
  return 'Critical'
}

interface ProductivityScoreProps {
  score?: number
}

export default function ProductivityScore({ score }: ProductivityScoreProps) {
  const latestScore = score ?? productivityScores[productivityScores.length - 1]?.score ?? 0
  const animatedScore = useCounter(latestScore)

  const last7Days = useMemo(() => {
    return productivityScores.slice(-7).map((d) => ({
      ...d,
      day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    }))
  }, [])

  const maxScore = Math.max(...last7Days.map((d) => d.score), 100)
  const prevScore = productivityScores[productivityScores.length - 2]?.score ?? latestScore
  const trend = latestScore - prevScore
  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown
  const trendColor = trend >= 0 ? 'text-emerald-500' : 'text-red-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Productivity Score
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className={cn('flex flex-col items-center')}>
            <motion.span
              className={cn('text-5xl font-bold tabular-nums', getScoreColor(latestScore))}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'backOut' }}
            >
              {animatedScore}
            </motion.span>
            <div className="mt-1 flex items-center gap-2">
              <span className={cn('text-xs font-medium', getScoreColor(latestScore))}>
                {getScoreLabel(latestScore)}
              </span>
              <div className={cn('flex items-center gap-0.5 text-xs', trendColor)}>
                <TrendIcon className="h-3 w-3" />
                <span className="tabular-nums">{Math.abs(trend)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 w-full">
            <div className="mb-2 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Last 7 days</span>
              <span className="tabular-nums">{maxScore} max</span>
            </div>
            <div className="flex items-end gap-1.5" style={{ height: 64 }}>
              {last7Days.map((d, i) => {
                const height = Math.max(8, (d.score / maxScore) * 56)
                return (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                    <motion.div
                      className={cn(
                        'w-full rounded-sm transition-colors',
                        getScoreBg(d.score),
                      )}
                      style={{ height }}
                      initial={{ height: 0 }}
                      animate={{ height }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                    >
                      <motion.div
                        className={cn('h-full w-full rounded-sm opacity-80', getScoreBg(d.score))}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ duration: 0.3, delay: i * 0.08 + 0.3 }}
                      />
                    </motion.div>
                    <span className="text-[9px] text-muted-foreground">{d.day[0]}</span>
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
