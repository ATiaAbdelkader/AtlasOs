import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, TrendingUp, Plus, X, Pencil, Trash2, Clock,
  BarChart3, Layers, Sparkles,
} from 'lucide-react'
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

function RadarChart({ skills }: { skills: Skill[] }) {
  const categories = useMemo(() => {
    const map: Record<string, { total: number; count: number; skills: Skill[] }> = {}
    for (const s of skills) {
      const cat = s.category || 'Other'
      if (!map[cat]) map[cat] = { total: 0, count: 0, skills: [] }
      map[cat].total += s.level
      map[cat].count++
      map[cat].skills.push(s)
    }
    return Object.entries(map)
      .map(([name, data]) => ({ name, avg: Math.round((data.total / data.count) * 10) / 10, skillCount: data.count, skills: data.skills }))
      .sort((a, b) => b.avg - a.avg)
  }, [skills])

  if (categories.length === 0) return null

  const maxLevel = 5
  const size = 260
  const cx = size / 2
  const cy = size / 2
  const radius = 100
  const levels = [1, 2, 3, 4, 5]
  const angleStep = (2 * Math.PI) / categories.length

  const gridPoints = levels.map((level) => {
    const r = (radius * level) / maxLevel
    return categories.map((_, i) => {
      const angle = angleStep * i - Math.PI / 2
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
    })
  })

  const dataPoints = categories.map((cat, i) => {
    const angle = angleStep * i - Math.PI / 2
    const r = (radius * Math.min(cat.avg, maxLevel)) / maxLevel
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {gridPoints.map((points, li) => (
        <polygon
          key={li}
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={0.5}
          className="opacity-40"
        />
      ))}
      {categories.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2
        const x2 = cx + radius * Math.cos(angle)
        const y2 = cy + radius * Math.sin(angle)
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="hsl(var(--border))" strokeWidth={0.5} className="opacity-20" />
      })}
      <polygon points={dataPoints.map((p) => `${p.x},${p.y}`).join(' ')} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={1.5} />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="hsl(var(--primary))" />
      ))}
      {categories.map((cat, i) => {
        const angle = angleStep * i - Math.PI / 2
        const labelR = radius + 22
        const lx = cx + labelR * Math.cos(angle)
        const ly = cy + labelR * Math.sin(angle)
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-muted-foreground text-[8px]"
          >
            {cat.name.length > 12 ? cat.name.slice(0, 12) + '...' : cat.name}
          </text>
        )
      })}
    </svg>
  )
}

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
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Skill>>({ ...emptySkill })

  useEffect(() => {
    if (user) {
      init(user.id)
      initCareer(user.id)
    }
  }, [user, init, initCareer])

  const skillCategories = useMemo(() => {
    const cats = new Set(skills.map((s) => s.category || 'Other'))
    return ['all', ...Array.from(cats).sort()]
  }, [skills])

  const filteredSkills = useMemo(() => {
    if (activeTab === 'all') return skills
    return skills.filter((s) => (s.category || 'Other') === activeTab)
  }, [skills, activeTab])

  const byYear = useMemo(() => {
    const map: Record<number, Skill[]> = {}
    for (const s of skills) {
      const y = s.year || new Date().getFullYear()
      if (!map[y]) map[y] = []
      map[y].push(s)
    }
    return Object.entries(map).sort(([a], [b]) => parseInt(b) - parseInt(a))
  }, [skills])

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

  const totalEntries = entries.length

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
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skills Radar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Map your skills across categories and track growth over time
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold">Skill Radar</h3>
            </div>
            {skills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No skills yet</p>
                <p className="mt-1 text-xs text-muted-foreground/60">Add skills to see your radar chart</p>
              </div>
            ) : (
              <RadarChart skills={skills} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold">Overview</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold tabular-nums">{skills.length}</p>
                <p className="text-xs text-muted-foreground">Total Skills</p>
              </div>
              <Separator />
              <div>
                <p className="text-3xl font-bold tabular-nums">
                  {new Set(skills.map((s) => s.category)).size}
                </p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
              <Separator />
              <div>
                <p className="text-3xl font-bold tabular-nums">
                  {skills.length > 0
                    ? Math.round(skills.reduce((sum, s) => sum + (s.level || 0), 0) / skills.length * 10) / 10
                    : 0}
                </p>
                <p className="text-xs text-muted-foreground">Avg Proficiency</p>
              </div>
              <Separator />
              <div>
                <p className="text-3xl font-bold tabular-nums">{totalEntries}</p>
                <p className="text-xs text-muted-foreground">Linked Career Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            {skillCategories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="gap-1.5">
                {cat === 'all' ? 'All Categories' : cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        {byYear.map(([year, yearSkills]) => {
          const yearFiltered = activeTab === 'all'
            ? yearSkills
            : yearSkills.filter((s) => (s.category || 'Other') === activeTab)
          if (yearFiltered.length === 0) return null
          return (
            <div key={year}>
              <div className="mb-3 flex items-center gap-3">
                <h3 className="text-sm font-bold">{year}</h3>
                <div className="flex-1 border-t border-border/50" />
                <span className="text-xs text-muted-foreground">{yearFiltered.length} skills</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {yearFiltered.map((skill) => {
                  const colorClass = categoryColors[skill.category] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  return (
                    <motion.div
                      key={skill.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all hover:border-border hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0', colorClass)}>
                              {skill.category || 'Other'}
                            </Badge>
                          </div>
                          <h4 className="mt-1.5 text-sm font-semibold">{skill.name}</h4>
                          {skill.description && (
                            <p className="mt-1 text-xs text-muted-foreground/70 line-clamp-2">{skill.description}</p>
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
                            <div
                              className="rounded-full bg-primary transition-all"
                              style={{ width: `${(skill.level / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium tabular-nums text-muted-foreground">{skill.level}/5</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {skills.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Layers className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No skills recorded</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Add your first skill to start building your radar</p>
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
