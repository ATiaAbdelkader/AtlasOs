import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Clock,
  Plus,
  X,
  Video,
  Users,
  Brain,
  Coffee,
  CalendarCheck,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatDate, formatTime, generateId } from '@/lib/utils'
import { calendarEvents as mockEvents } from '@/data/mockData'
import CalendarView from '@/components/calendar/CalendarView'
import type { CalendarEvent } from '@/types'

const typeConfig: Record<
  CalendarEvent['type'],
  { label: string; icon: typeof Video; color: string; bg: string }
> = {
  task: { label: 'Task', icon: CalendarCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  meeting: { label: 'Meeting', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  focus: { label: 'Focus', icon: Brain, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  break: { label: 'Break', icon: Coffee, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  appointment: { label: 'Appointment', icon: Video, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  deadline: { label: 'Deadline', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0] ?? '')
  const [showAdd, setShowAdd] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'task' as CalendarEvent['type'],
    start: '',
    end: '',
  })

  const selectedDateEvents = useMemo(
    () =>
      events
        .filter((e) => e.start.startsWith(selectedDate))
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [events, selectedDate],
  )

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.start || !newEvent.end) return

    const event: CalendarEvent = {
      id: generateId(),
      title: newEvent.title,
      description: newEvent.description,
      type: newEvent.type,
      start: `${selectedDate}T${newEvent.start}:00`,
      end: `${selectedDate}T${newEvent.end}:00`,
      allDay: false,
      color:
        newEvent.type === 'focus'
          ? '#8B5CF6'
          : newEvent.type === 'meeting'
            ? '#F59E0B'
            : newEvent.type === 'break'
              ? '#10B981'
              : '#3B82F6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setEvents((prev) => [...prev, event])
    setNewEvent({ title: '', description: '', type: 'task', start: '', end: '' })
    setShowAdd(false)
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Schedule and manage your events
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule
        </Button>
      </motion.div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Quick Schedule</h3>
                  <button
                    onClick={() => setShowAdd(false)}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Event title..."
                      value={newEvent.title}
                      onChange={(e) =>
                        setNewEvent((p) => ({ ...p, title: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddEvent()
                      }}
                      autoFocus
                    />
                  </div>
                  <div>
                    <select
                      value={newEvent.type}
                      onChange={(e) =>
                        setNewEvent((p) => ({
                          ...p,
                          type: e.target.value as CalendarEvent['type'],
                        }))
                      }
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="task">Task</option>
                      <option value="meeting">Meeting</option>
                      <option value="focus">Focus</option>
                      <option value="break">Break</option>
                      <option value="appointment">Appointment</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="time"
                      value={newEvent.start}
                      onChange={(e) =>
                        setNewEvent((p) => ({ ...p, start: e.target.value }))
                      }
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={newEvent.end}
                      onChange={(e) =>
                        setNewEvent((p) => ({ ...p, end: e.target.value }))
                      }
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Button
                      onClick={handleAddEvent}
                      disabled={!newEvent.title.trim() || !newEvent.start || !newEvent.end}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <CalendarView events={events} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4 text-violet-500" />
                {formatDate(selectedDate)}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {selectedDateEvents.length} events
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {selectedDateEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No events</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      Click Schedule to add an event
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 p-4">
                    {selectedDateEvents.map((event, index) => {
                      const config = typeConfig[event.type] ?? typeConfig.task
                      const Icon = config.icon
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={cn(
                            'group rounded-xl border border-border/50 p-4 transition-colors hover:border-border',
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                                config.bg,
                              )}
                            >
                              <Icon className={cn('h-4 w-4', config.color)} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium">{event.title}</p>
                                  {event.description && (
                                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                      {event.description}
                                    </p>
                                  )}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={cn('shrink-0 text-[10px]', config.color)}
                                >
                                  {config.label}
                                </Badge>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatTime(event.start)} - {formatTime(event.end)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
