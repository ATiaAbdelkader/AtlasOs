import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Plus,
  X,
  Sun,
  Moon,
  RefreshCw,
  Smile,
  Meh,
  Frown,
  Angry,
  Laugh,
  Zap,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  BatteryWarning,
  Trophy,
  Swords,
  Lightbulb,
  Heart,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatDate } from '@/lib/utils'
import { journalEntries } from '@/data/mockData'
import type { JournalEntry, Mood, EnergyLevel } from '@/types'

type TabValue = 'morning' | 'evening' | 'overview'

const moodConfig: Record<Mood, { label: string; icon: typeof Smile; color: string; value: number }> = {
  great: { label: 'Great', icon: Laugh, color: 'text-emerald-500', value: 5 },
  good: { label: 'Good', icon: Smile, color: 'text-blue-500', value: 4 },
  neutral: { label: 'Neutral', icon: Meh, color: 'text-amber-500', value: 3 },
  bad: { label: 'Bad', icon: Frown, color: 'text-orange-500', value: 2 },
  terrible: { label: 'Terrible', icon: Angry, color: 'text-red-500', value: 1 },
}

const energyConfig: Record<EnergyLevel, { label: string; icon: typeof Zap; color: string; value: number }> = {
  very_high: { label: 'Very High', icon: Zap, color: 'text-emerald-500', value: 5 },
  high: { label: 'High', icon: BatteryFull, color: 'text-blue-500', value: 4 },
  medium: { label: 'Medium', icon: BatteryMedium, color: 'text-amber-500', value: 3 },
  low: { label: 'Low', icon: BatteryLow, color: 'text-orange-500', value: 2 },
  very_low: { label: 'Very Low', icon: BatteryWarning, color: 'text-red-500', value: 1 },
}

const typeConfig: Record<string, { label: string; icon: typeof Sun; className: string }> = {
  morning: { label: 'Morning Planning', icon: Sun, className: 'border-amber-500/20 text-amber-500 bg-amber-500/10' },
  evening: { label: 'Evening Reflection', icon: Moon, className: 'border-indigo-500/20 text-indigo-500 bg-indigo-500/10' },
  reflection: { label: 'Reflection', icon: RefreshCw, className: 'border-violet-500/20 text-violet-500 bg-violet-500/10' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
} as const

const defaultNewEntry = {
  date: new Date().toISOString().split('T')[0],
  type: 'morning' as 'morning' | 'evening' | 'reflection',
  content: '',
  mood: 'neutral' as Mood,
  energy: 'medium' as EnergyLevel,
  wins: '',
  challenges: '',
  lessonsLearned: '',
  gratitude: '',
}

export default function Journal() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabValue>('morning')
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [newEntry, setNewEntry] = useState(defaultNewEntry)

  const filteredEntries = useMemo(() => {
    if (activeTab === 'overview') return journalEntries
    return journalEntries.filter((e) => e.type === activeTab)
  }, [activeTab])

  const sortedEntries = useMemo(
    () => [...filteredEntries].sort((a, b) => new Date(b.date ?? new Date()).getTime() - new Date(a.date ?? new Date()).getTime()),
    [filteredEntries],
  )

  const chartData = useMemo(() => {
    const now = new Date()
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0] ?? ''
    })

    return days.map((date) => {
      const entry = journalEntries.find((e) => e.date === date)
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: entry ? moodConfig[entry.mood].value : null,
        energy: entry ? energyConfig[entry.energy].value : null,
      }
    })
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const handleCreateEntry = () => {
    setShowNewEntry(false)
    setNewEntry(defaultNewEntry)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Journal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan your mornings, reflect on your evenings
          </p>
        </div>
        <Button onClick={() => setShowNewEntry(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <h2 className="text-sm font-semibold">Mood & Energy (Last 7 Days)</h2>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => {
                      const labels: Record<number, string> = { 1: 'Low', 3: 'Med', 5: 'High' }
                      return labels[v] ?? ''
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeDasharray: '3 3' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', r: 4 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-violet-500" />
              <h2 className="text-sm font-semibold">This Week</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border/50 p-3">
                <span className="text-xs text-muted-foreground">Total Entries</span>
                <span className="text-sm font-bold">{journalEntries.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/50 p-3">
                <span className="text-xs text-muted-foreground">Morning Plans</span>
                <span className="text-sm font-bold">
                  {journalEntries.filter((e) => e.type === 'morning').length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/50 p-3">
                <span className="text-xs text-muted-foreground">Evening Reflections</span>
                <span className="text-sm font-bold">
                  {journalEntries.filter((e) => e.type === 'evening').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList>
            <TabsTrigger value="morning" className="gap-1.5">
              <Sun className="h-4 w-4" />
              Morning Planning
            </TabsTrigger>
            <TabsTrigger value="evening" className="gap-1.5">
              <Moon className="h-4 w-4" />
              Evening Reflection
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="space-y-4">
              {sortedEntries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <BookOpen className="mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">No entries yet</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    Start your journaling practice by creating a new entry
                  </p>
                </motion.div>
              ) : (
                sortedEntries.map((entry) => {
                  const isExpanded = expandedId === entry.id
                  const type = typeConfig[entry.type]!
                  const mood = moodConfig[entry.mood]
                  const energy = energyConfig[entry.energy]
                  const MoodIcon = mood.icon
                  const EnergyIcon = energy.icon

                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-border/50 bg-card shadow-sm backdrop-blur-xl transition-all"
                    >
                      <div
                        className="cursor-pointer p-5"
                        onClick={() => toggleExpand(entry.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div
                              className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                                type.className,
                              )}
                            >
                              <type.icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold">
                                  {formatDate(entry.date)}
                                </span>
                                <Badge variant="outline" className={cn('text-[10px]', type.className)}>
                                  {type.label}
                                </Badge>
                              </div>
                              <div className="mt-1.5 flex items-center gap-3">
                                <span className="flex items-center gap-1 text-xs">
                                  <MoodIcon className={cn('h-3.5 w-3.5', mood.color)} />
                                  <span className={mood.color}>{mood.label}</span>
                                </span>
                                <span className="flex items-center gap-1 text-xs">
                                  <EnergyIcon className={cn('h-3.5 w-3.5', energy.color)} />
                                  <span className={energy.color}>{energy.label}</span>
                                </span>
                              </div>
                              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                {entry.content}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' } as const}
                            className="overflow-hidden"
                          >
                            <Separator />
                            <div className="space-y-5 p-5">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Created: {formatDate(entry.createdAt)}</span>
                              </div>

                              <div>
                                <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
                                  Full Entry
                                </h4>
                                <p className="text-sm leading-relaxed">{entry.content}</p>
                              </div>

                              {entry.wins.length > 0 && (
                                <div>
                                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                                    <Trophy className="h-3.5 w-3.5" />
                                    Wins
                                  </h4>
                                  <div className="space-y-1.5">
                                    {entry.wins.map((win, i) => (
                                      <div
                                        key={i}
                                        className="flex items-start gap-2 rounded-lg border border-border/30 bg-emerald-500/5 p-2.5 text-xs"
                                      >
                                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                        {win}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {entry.challenges.length > 0 && (
                                <div>
                                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-orange-500">
                                    <Swords className="h-3.5 w-3.5" />
                                    Challenges
                                  </h4>
                                  <div className="space-y-1.5">
                                    {entry.challenges.map((challenge, i) => (
                                      <div
                                        key={i}
                                        className="flex items-start gap-2 rounded-lg border border-border/30 bg-orange-500/5 p-2.5 text-xs"
                                      >
                                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                                        {challenge}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {entry.lessonsLearned.length > 0 && (
                                <div>
                                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-violet-500">
                                    <Lightbulb className="h-3.5 w-3.5" />
                                    Lessons Learned
                                  </h4>
                                  <div className="space-y-1.5">
                                    {entry.lessonsLearned.map((lesson, i) => (
                                      <div
                                        key={i}
                                        className="flex items-start gap-2 rounded-lg border border-border/30 bg-violet-500/5 p-2.5 text-xs"
                                      >
                                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                                        {lesson}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {entry.gratitude.length > 0 && (
                                <div>
                                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                                    <Heart className="h-3.5 w-3.5" />
                                    Gratitude
                                  </h4>
                                  <div className="space-y-1.5">
                                    {entry.gratitude.map((item, i) => (
                                      <div
                                        key={i}
                                        className="flex items-start gap-2 rounded-lg border border-border/30 bg-rose-500/5 p-2.5 text-xs"
                                      >
                                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                                        {item}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <AnimatePresence>
        {showNewEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowNewEntry(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-border/50 bg-card p-6 shadow-xl backdrop-blur-xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold">New Journal Entry</h2>
                <button
                  onClick={() => setShowNewEntry(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry((p) => ({ ...p, date: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Type
                    </label>
                    <select
                      value={newEntry.type}
                      onChange={(e) =>
                        setNewEntry((p) => ({ ...p, type: e.target.value as 'morning' | 'evening' | 'reflection' }))
                      }
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="morning">Morning Planning</option>
                      <option value="evening">Evening Reflection</option>
                      <option value="reflection">Reflection</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Mood
                    </label>
                    <select
                      value={newEntry.mood}
                      onChange={(e) => setNewEntry((p) => ({ ...p, mood: e.target.value as Mood }))}
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="great">Great</option>
                      <option value="good">Good</option>
                      <option value="neutral">Neutral</option>
                      <option value="bad">Bad</option>
                      <option value="terrible">Terrible</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Energy Level
                    </label>
                    <select
                      value={newEntry.energy}
                      onChange={(e) =>
                        setNewEntry((p) => ({ ...p, energy: e.target.value as EnergyLevel }))
                      }
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="very_high">Very High</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="very_low">Very Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Content
                  </label>
                  <textarea
                    placeholder="What's on your mind today?"
                    rows={4}
                    value={newEntry.content}
                    onChange={(e) => setNewEntry((p) => ({ ...p, content: e.target.value }))}
                    className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Wins (one per line)
                  </label>
                  <textarea
                    placeholder="What went well today?"
                    rows={2}
                    value={newEntry.wins}
                    onChange={(e) => setNewEntry((p) => ({ ...p, wins: e.target.value }))}
                    className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Challenges (one per line)
                  </label>
                  <textarea
                    placeholder="What was difficult?"
                    rows={2}
                    value={newEntry.challenges}
                    onChange={(e) => setNewEntry((p) => ({ ...p, challenges: e.target.value }))}
                    className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Lessons Learned (one per line)
                  </label>
                  <textarea
                    placeholder="What did you learn?"
                    rows={2}
                    value={newEntry.lessonsLearned}
                    onChange={(e) => setNewEntry((p) => ({ ...p, lessonsLearned: e.target.value }))}
                    className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Gratitude (one per line)
                  </label>
                  <textarea
                    placeholder="What are you grateful for?"
                    rows={2}
                    value={newEntry.gratitude}
                    onChange={(e) => setNewEntry((p) => ({ ...p, gratitude: e.target.value }))}
                    className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowNewEntry(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEntry} disabled={!newEntry.content.trim()}>
                  Create Entry
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
