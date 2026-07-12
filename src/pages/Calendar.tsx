import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, Clock, Plus, X, Video, Users, Brain,
  Coffee, CalendarCheck, AlertTriangle, Bell, BellOff,
  Trash2, RefreshCw, Pencil, Check, Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatDate, formatTime, generateId } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { useCalendarStore } from '@/stores/calendarStore'
import { isGoogleConnected, syncGoogleEvents, type SyncedCalendarEvent } from '@/lib/calendarSync'
import { scheduleReminder, cancelReminder, getStoredReminders, startReminderChecker, stopReminderChecker } from '@/lib/notifications'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
} as const

export default function Calendar() {
  const { user } = useAuth()
  const {
    events, googleEvents, isLoading, init,
    addEventAsync, updateEventAsync, deleteEventAsync, setGoogleEvents,
  } = useCalendarStore()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0] ?? '')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', type: 'task' as CalendarEvent['type'],
    start: '', end: '', allDay: false,
  })

  // Start reminder checker on mount
  useEffect(() => {
    startReminderChecker()
    return () => stopReminderChecker()
  }, [])

  useEffect(() => {
    if (user) init(user.id)
  }, [user, init])

  // Sync Google Calendar on mount if connected
  useEffect(() => {
    if (isGoogleConnected()) {
      setSyncing(true)
      syncGoogleEvents().then((gevents) => {
        setGoogleEvents(gevents)
        setSyncing(false)
      })
    }
  }, [setGoogleEvents])

  // Merge local + Google events for display
  const allEvents: (CalendarEvent | SyncedCalendarEvent)[] = useMemo(() => {
    const google = googleEvents.map((g) => ({
      ...g,
      allDay: g.allDay,
      type: 'task' as const,
    }))
    return [...events, ...google].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    )
  }, [events, googleEvents])

  const selectedDateEvents = useMemo(
    () =>
      allEvents
        .filter((e) => e.start.startsWith(selectedDate))
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [allEvents, selectedDate],
  )

  const reminders = useMemo(() => getStoredReminders(), [selectedDateEvents])

  const hasReminder = useCallback(
    (eventId: string) => reminders.some((r) => r.eventId === eventId && !r.notified),
    [reminders],
  )

  const handleSync = async () => {
    setSyncing(true)
    const gevents = await syncGoogleEvents()
    setGoogleEvents(gevents)
    setSyncing(false)
  }

  const openAdd = () => {
    setForm({ title: '', description: '', type: 'task', start: '', end: '', allDay: false })
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (event: CalendarEvent) => {
    setForm({
      title: event.title,
      description: event.description || '',
      type: event.type,
      start: event.start ? new Date(event.start).toISOString().slice(11, 16) : '',
      end: event.end ? new Date(event.end).toISOString().slice(11, 16) : '',
      allDay: event.allDay || false,
    })
    setEditingId(event.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.title.trim() || !form.start || !form.end) return
    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      start: `${selectedDate}T${form.start}:00`,
      end: `${selectedDate}T${form.end}:00`,
      allDay: form.allDay,
      color: form.type === 'focus' ? '#8B5CF6'
        : form.type === 'meeting' ? '#F59E0B'
        : form.type === 'break' ? '#10B981'
        : form.type === 'deadline' ? '#EF4444'
        : form.type === 'appointment' ? '#F43F5E'
        : '#3B82F6',
    }
    if (editingId) {
      updateEventAsync(editingId, payload)
    } else if (user) {
      addEventAsync(user.id, payload)
    }
    setShowModal(false)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    deleteEventAsync(id)
    cancelReminder(id)
    setConfirmDeleteId(null)
  }

  const toggleReminder = (eventId: string, title: string, start: string) => {
    if (hasReminder(eventId)) {
      cancelReminder(eventId)
    } else {
      const stored = localStorage.getItem('atlasos_reminder_minutes')
      const minutes = parseInt(stored || '15')
      scheduleReminder(eventId, title, start, minutes as any)
    }
  }

  const sourceIcon = (source?: string) => {
    if (source === 'google') return <span className="text-[10px] font-medium text-blue-500">G</span>
    return null
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
            {syncing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {isGoogleConnected() && !syncing && (
              <Badge variant="outline" className="gap-1 text-[10px] text-blue-500 border-blue-500/20 bg-blue-500/10">
                <CalendarDays className="h-3 w-3" />
                Google
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Schedule and manage your events
            {isGoogleConnected() && googleEvents.length > 0 && ` — ${googleEvents.length} events synced from Google`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isGoogleConnected() && (
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', syncing && 'animate-spin')} />
              Sync
            </Button>
          )}
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule
          </Button>
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <CalendarView events={allEvents as any} />
        </motion.div>

        {/* Day details */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4 text-violet-500" />
                {formatDate(selectedDate)}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
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
                    {isGoogleConnected() && (
                      <Button variant="outline" size="sm" className="mt-3" onClick={handleSync} disabled={syncing}>
                        <RefreshCw className={cn('mr-1.5 h-3 w-3', syncing && 'animate-spin')} />
                        Sync Google Calendar
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1 p-4">
                    {selectedDateEvents.map((event, index) => {
                      const isGoogle = 'source' in event && event.source === 'google'
                      const config = typeConfig[(event as CalendarEvent).type] ?? typeConfig.task
                      const Icon = config.icon
                      const eventId = isGoogle ? event.id : (event as CalendarEvent).id
                      const hasRemind = hasReminder(eventId)
                      const isGoogleEvent = isGoogle
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className={cn(
                            'group rounded-xl border border-border/50 p-4 transition-all hover:border-border',
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                              isGoogleEvent ? 'bg-blue-500/10' : config.bg,
                            )}>
                              {isGoogleEvent ? (
                                <CalendarDays className="h-4 w-4 text-blue-500" />
                              ) : (
                                <Icon className={cn('h-4 w-4', config.color)} />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-medium">{event.title}</p>
                                    {isGoogleEvent && (
                                      <span className="text-[9px] font-medium text-blue-500/70">Google</span>
                                    )}
                                  </div>
                                  {event.description && (
                                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                      {event.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  {!isGoogleEvent && (
                                    <>
                                      <button
                                        onClick={() => toggleReminder(eventId, event.title, event.start)}
                                        className={cn(
                                          'rounded-lg p-1.5 transition-all',
                                          hasRemind
                                            ? 'text-amber-500 hover:bg-amber-500/10'
                                            : 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent',
                                        )}
                                        title={hasRemind ? 'Remove reminder' : 'Set reminder'}
                                      >
                                        {hasRemind ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                                      </button>
                                      <button
                                        onClick={() => openEdit(event as CalendarEvent)}
                                        className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-all"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>
                                      {confirmDeleteId === eventId ? (
                                        <div className="flex">
                                          <button
                                            onClick={() => handleDelete(eventId)}
                                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                          <button
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setConfirmDeleteId(eventId)}
                                          className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatTime(event.start)} - {formatTime(event.end)}
                                  </span>
                                </div>
                                {hasRemind && (
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-amber-500 border-amber-500/20 bg-amber-500/10">
                                    <Bell className="h-2.5 w-2.5 mr-0.5" />
                                    Reminder
                                  </Badge>
                                )}
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

      {/* Add / Edit Event Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-border/50 bg-card p-6 shadow-xl backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingId ? 'Edit Event' : 'Schedule Event'}
                </h2>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-accent">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Title *</label>
                  <Input
                    placeholder="Event title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CalendarEvent['type'] }))}
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
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.allDay}
                        onChange={(e) => setForm((f) => ({ ...f, allDay: e.target.checked }))}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-muted-foreground">All day</span>
                    </label>
                  </div>
                </div>

                {!form.allDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Start Time</label>
                      <input
                        type="time"
                        value={form.start}
                        onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">End Time</label>
                      <input
                        type="time"
                        value={form.end}
                        onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
                  <textarea
                    placeholder="Event description..."
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>

                {!editingId && (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                    <Bell className="h-4 w-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      A reminder will be set automatically based on your default preference
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={!form.title.trim() || (!form.allDay && (!form.start || !form.end))}>
                  {editingId ? 'Save Changes' : 'Add Event'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
