import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/appStore'

const WORK_MINUTES = 25
const BREAK_MINUTES = 5

export default function Pomodoro() {
  const { pomodoroActive, pomodoroMinutes, pomodoroSeconds, setPomodoroActive, setPomodoroTime } = useAppStore()
  const [isBreak, setIsBreak] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSeconds = (isBreak ? BREAK_MINUTES : WORK_MINUTES) * 60
  const elapsedSeconds = (isBreak ? BREAK_MINUTES * 60 : WORK_MINUTES * 60) - (pomodoroMinutes * 60 + pomodoroSeconds)
  const progress = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    const mins = useAppStore.getState().pomodoroMinutes
    const secs = useAppStore.getState().pomodoroSeconds

    if (mins === 0 && secs === 0) {
      clearTimer()
      setRunning(false)
      setPomodoroActive(false)
      if (isBreak) {
        setIsBreak(false)
        setPomodoroTime(WORK_MINUTES, 0)
      } else {
        setSessions((s) => s + 1)
        setIsBreak(true)
        setPomodoroTime(BREAK_MINUTES, 0)
      }
      return
    }

    if (secs === 0) {
      setPomodoroTime(mins - 1, 59)
    } else {
      setPomodoroTime(mins, secs - 1)
    }
  }, [isBreak, clearTimer, setPomodoroActive, setPomodoroTime])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      clearTimer()
    }
    return clearTimer
  }, [running, tick, clearTimer])

  const handleStartPause = () => {
    if (pomodoroMinutes === 0 && pomodoroSeconds === 0) return
    setRunning((r) => !r)
    setPomodoroActive(!running)
  }

  const handleReset = () => {
    clearTimer()
    setRunning(false)
    setPomodoroActive(false)
    setIsBreak(false)
    setPomodoroTime(WORK_MINUTES, 0)
  }

  const radius = 72
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {isBreak ? <Coffee className="h-4 w-4 text-amber-500" /> : <Brain className="h-4 w-4 text-violet-500" />}
            {isBreak ? 'Break Time' : 'Pomodoro'}
          </CardTitle>
          <span className="text-xs text-muted-foreground">{sessions} sessions</span>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="relative inline-flex items-center justify-center">
              <svg width={160} height={160} className="-rotate-90">
                <circle
                  cx={80}
                  cy={80}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={6}
                  className="text-muted"
                  opacity={0.15}
                />
                <motion.circle
                  cx={80}
                  cy={80}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={6}
                  strokeLinecap="round"
                  className={isBreak ? 'text-amber-500' : 'text-violet-500'}
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold tabular-nums tracking-tight">
                  {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
                </span>
                <span className="mt-0.5 text-xs text-muted-foreground">
                  {isBreak ? 'break' : 'focus'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleStartPause}
                disabled={pomodoroMinutes === 0 && pomodoroSeconds === 0}
              >
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
