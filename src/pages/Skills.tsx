import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, TrendingUp, Plus, X, Pencil, Trash2, Clock,
  BarChart3, Layers, Search, Zap, Target, BookOpen,
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { cn, generateId } from '@/lib/utils'
import { useSkillStore } from '@/stores/skillStore'
import { useCareerStore } from '@/stores/careerStore'
import { useAuth } from '@/lib/auth'
import type { Skill } from '@/types'

const categoryColors: Record<string, string> = {
  'Agronomy': '#10b981',
  'Animal Production': '#f59e0b',
  'Plant Production': '#22c55e',
  'Data Analysis': '#3b82f6',
  'AI & Technology': '#8b5cf6',
  'Climate & Environment': '#06b6d4',
  'Education & Training': '#f43f5e',
  'Research': '#6366f1',
  'Business & Entrepreneurship': '#f97316',
  'Policy & Leadership': '#64748b',
  'Aquaculture': '#14b8a6',
  'Soil Science': '#eab308',
  'Beekeeping': '#d97706',
}

const categoryBg: Record<string, string> = {
  'Agronomy': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Animal Production': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Plant Production': 'bg-green-500/10 text-green-500 border-green-500/20',
  'Data Analysis': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'AI & Technology': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  'Climate & Environment': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  'Education & Training': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  'Research': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  'Business & Entrepreneurship': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'Policy & Leadership': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  'Aquaculture': 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  'Soil Science': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Beekeeping': 'bg-amber-600/10 text-amber-600 border-amber-600/20',
}

const categoryOptions = Object.keys(categoryColors)

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
} as const

const emptySkill: Partial<Skill> = {
  name: '', category: 'Agronomy', level: 1, year: new Date().getFullYear(), description: '',
}

export default function Skills() {
  const { user } = useAuth()
  const { skills, isLoading, init, addSkillAsync, updateSkillAsync, deleteSkillAsync } = useSkillStore()
  const { entries, init: initCareer } = useCareerStore()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Skill>>({ ...emptySkill })
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      init(user.id)
      initCareer(user.id)
    }
  }, [user, init, initCareer])

  // ── Derived data ──
  const skillCategories = useMemo(() => {
    const cats = new Set(skills.map((s) => s.category || 'Other'))
    return ['all', ...Array.from(cats).sort()]
  }, [skills])

  const filteredSkills = useMemo(() => {
    let result = skills
    if (activeTab !== 'all') result = result.filter((s) => (s.category || 'Other') === activeTab)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((s) => s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q))
    }
    return result
  }, [skills, activeTab, searchQuery])

  const byYear = useMemo(() => {
    const map: Record<number, Skill[]> = {}
    for (const s of skills) {
      const y = s.year || new Date().getFullYear()
      if (!map[y]) map[y] = []
      map[y].push(s)
    }
    return Object.entries(map).sort(([a], [b]) => parseInt(b) - parseInt(a))
  }, [skills])

  // ── Radar data ──
  const radarData = useMemo(() => {
    const map: Record<string, { avg: number; count: number }> = {}
    for (const s of skills) {
      const cat = s.category || 'Other'
      if (!map[cat]) map[cat] = { avg: 0, count: 0 }
      map[cat].avg += s.level
      map[cat].count++
    }
    return Object.entries(map)
      .map(([name, d]) => ({ category: name, proficiency: Math.round((d.avg / d.count) * 10) / 10 }))
      .sort((a, b) => b.proficiency - a.proficiency)
  }, [skills])

  // ── Pie data ──
  const pieData = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of skills) {
      const cat = s.category || 'Other'
      map[cat] = (map[cat] || 0) + 1
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [skills])

  // ── Bar data (skills per year) ──
  const barData = useMemo(() => {
    const map: Record<number, { count: number; avg: number; total: number }> = {}
    for (const s of skills) {
      const y = s.year || new Date().getFullYear()
      if (!map[y]) map[y] = { count: 0, avg: 0, total: 0 }
      map[y].count++
      map[y].total += s.level
    }
    return Object.entries(map)
      .map(([year, d]) => ({ year: parseInt(year), count: d.count, avg: Math.round((d.total / d.count) * 10) / 10 }))
      .sort((a, b) => a.year - b.year)
  }, [skills])

  // ── Proficiency distribution ──
  const profDist = useMemo(() => {
    const levels = [1, 2, 3, 4, 5]
    return levels.map((l) => ({
      level: `${l}/5`,
      count: skills.filter((s) => Math.floor(s.level) === l).length,
    }))
  }, [skills])

  const totalEntries = entries.length
  const avgProficiency = skills.length > 0
    ? Math.round(skills.reduce((sum, s) => sum + (s.level || 0), 0) / skills.length * 10) / 10
    : 0

  const openAdd = () => {
    setForm({ ...emptySkill, id: generateId() })
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (skill: Skill) => {
    setForm({
      name: skill.name,
      category: skill.category || '',
      level: skill.level,
      year: skill.year,
      description: skill.description || '',
    })
    setEditingId(skill.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name?.trim()) return
    const payload = {
      name: form.name,
      category: form.category || 'Other',
      level: form.level ?? 1,
      year: form.year ?? new Date().getFullYear(),
      description: form.description || '',
    }
    if (editingId) {
      updateSkillAsync(editingId, payload)
    } else if (user) {
      addSkillAsync(user.id, payload)
    }
    setShowModal(false)
    setEditingId(null)
    setForm({ ...emptySkill })
  }

  const handleDelete = (id: string) => {
    deleteSkillAsync(id)
    setConfirmDeleteId(null)
  }

  if (isLoading && skills.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Clock className="h-8 w-8 animate-spin text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Loading skills...</p>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold tracking-tight">Skills Universe</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Map your expertise across domains and track growth over time
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{skills.length}</p>
              <p className="text-xs text-muted-foreground">Total Skills</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{new Set(skills.map((s) => s.category)).size}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{avgProficiency}</p>
              <p className="text-xs text-muted-foreground">Avg Proficiency</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{totalEntries}</p>
              <p className="text-xs text-muted-foreground">Linked Career Entries</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Radar Chart */}
        <Card className="lg:col-span-1">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
                <Brain className="h-4 w-4 text-violet-500" />
              </div>
              <h3 className="text-sm font-semibold">Category Radar</h3>
            </div>
            {radarData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No skills yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickCount={6} />
                  <Radar name="Proficiency" dataKey="proficiency" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="lg:col-span-1">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                <Layers className="h-4 w-4 text-amber-500" />
              </div>
              <h3 className="text-sm font-semibold">Distribution</h3>
            </div>
            {pieData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No skills yet</p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <ResponsiveContainer width="60%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2} dataKey="value">
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={categoryColors[entry.name] || '#64748b'} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {pieData.sort((a, b) => b.value - a.value).slice(0, 6).map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: categoryColors[entry.name] || '#64748b' }} />
                      <span className="flex-1 truncate text-muted-foreground">{entry.name}</span>
                      <span className="font-medium tabular-nums">{entry.value}</span>
                    </div>
                  ))}
                  {pieData.length > 6 && (
                    <p className="text-[10px] text-muted-foreground/60 pt-1">+{pieData.length - 6} more</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="lg:col-span-1">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold">Growth Over Time</h3>
            </div>
            {barData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No skills yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {barData.length > 0 && (
              <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-muted-foreground/60">
                <span>Skills acquired per year</span>
                <span className="font-medium">Trending {barData.length >= 2 && barData[barData.length - 1]!.count > barData[barData.length - 2]!.count ? '↑' : '↓'}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            {skillCategories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="gap-1.5">
                {cat === 'all' ? 'All Categories' : cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </motion.div>

      {/* Proficiency distribution bar */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-muted-foreground shrink-0">Proficiency</span>
              <div className="flex flex-1 gap-1">
                {profDist.map((d) => (
                  <div key={d.level} className="flex flex-1 flex-col items-center gap-1">
                    <div className="relative h-16 w-full rounded-lg bg-muted/50 overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.count / Math.max(...profDist.map((p) => p.count), 1)) * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="absolute bottom-0 w-full rounded-lg bg-gradient-to-t from-primary/60 to-primary/30"
                      />
                    </div>
                    <span className="text-[10px] font-medium tabular-nums text-muted-foreground">{d.count}</span>
                    <span className="text-[9px] text-muted-foreground/60">{d.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Skills grid by year */}
      <motion.div variants={itemVariants} className="space-y-5">
        {byYear.map(([year, yearSkills]) => {
          const yearFiltered = activeTab === 'all'
            ? yearSkills
            : yearSkills.filter((s) => (s.category || 'Other') === activeTab)
          if (searchQuery) {
            const q = searchQuery.toLowerCase()
            const filtered = yearFiltered.filter((s) => s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q))
            if (filtered.length === 0) return null
          } else if (yearFiltered.length === 0) {
            return null
          }
          const displaySkills = searchQuery
            ? yearFiltered.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
            : yearFiltered
          if (displaySkills.length === 0) return null
          return (
            <div key={year}>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {year.toString().slice(2)}
                </div>
                <h3 className="text-sm font-bold">{year}</h3>
                <div className="flex-1 border-t border-border/30" />
                <span className="text-xs text-muted-foreground">{displaySkills.length} skill{displaySkills.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displaySkills.map((skill) => {
                  const colorClass = categoryBg[skill.category] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  const hexColor = categoryColors[skill.category] || '#64748b'
                  const isHovered = hoveredSkill === skill.id
                  return (
                    <motion.div
                      key={skill.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onHoverStart={() => setHoveredSkill(skill.id)}
                      onHoverEnd={() => setHoveredSkill(null)}
                      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all duration-300 hover:border-border hover:shadow-md"
                    >
                      <div
                        className="absolute inset-0 opacity-[0.03] transition-opacity duration-300"
                        style={{ background: `radial-gradient(120% 120% at 0% 100%, ${hexColor} 0%, transparent 70%)`, opacity: isHovered ? 0.08 : 0.03 }}
                      />
                      <div className="relative">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: hexColor }} />
                              <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0', colorClass)}>
                                {skill.category || 'Other'}
                              </Badge>
                            </div>
                            <h4 className="mt-2 text-sm font-semibold">{skill.name}</h4>
                            {skill.description && (
                              <p className={cn(
                                'mt-1 text-xs leading-relaxed text-muted-foreground/70 transition-all duration-300',
                                isHovered ? '' : 'line-clamp-2',
                              )}>
                                {skill.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                            <button onClick={() => openEdit(skill)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {confirmDeleteId === skill.id ? (
                              <div className="flex">
                                <button onClick={() => handleDelete(skill.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => setConfirmDeleteId(null)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmDeleteId(skill.id)} className="rounded-lg p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1">
                            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(skill.level / 5) * 100}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                                className="rounded-full transition-all"
                                style={{ backgroundColor: hexColor }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-medium tabular-nums text-muted-foreground">{skill.level}/5</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {filteredSkills.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              {searchQuery ? 'No skills match your search' : 'No skills recorded yet'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {searchQuery ? 'Try a different search term' : 'Add your first skill to start building your universe'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Add / Edit Modal */}
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
                  {editingId ? 'Edit Skill' : 'Add Skill'}
                </h2>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-accent">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Skill Name *</label>
                  <Input
                    placeholder="e.g. Power BI, SPSS, AI in Agriculture"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
                    <select
                      value={form.category || 'Agronomy'}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Year</label>
                    <Input
                      type="number"
                      value={form.year || new Date().getFullYear()}
                      onChange={(e) => setForm((f) => ({ ...f, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Proficiency Level</label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setForm((f) => ({ ...f, level: n }))}
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all border',
                          (form.level || 0) >= n
                            ? 'border-violet-500/50 bg-violet-500/10 text-violet-500'
                            : 'border-border text-muted-foreground hover:border-border/80',
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
                  <textarea
                    placeholder="Describe your proficiency and experience with this skill..."
                    rows={3}
                    value={form.description || ''}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={!form.name?.trim()}>
                  {editingId ? 'Save Changes' : 'Add Skill'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
