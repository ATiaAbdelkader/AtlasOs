import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, GraduationCap, Award, BookOpen, Users, Star,
  Trophy, Calendar, Plus, X, Pencil, Trash2, Link2, Clock,
  BookMarked, Target,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { cn, formatDate, generateId } from '@/lib/utils'
import { useCareerStore } from '@/stores/careerStore'
import { useSkillStore } from '@/stores/skillStore'
import { useAuth } from '@/lib/auth'
import type { CareerEntry, CareerEntryType } from '@/types'

type FilterTab = 'all' | 'role' | 'education' | 'certification' | 'conference' | 'membership' | 'achievement' | 'book' | 'training'

const typeConfig: Record<string, { label: string; icon: typeof Briefcase; className: string }> = {
  role: { label: 'Role', icon: Briefcase, className: 'border-blue-500/20 text-blue-500 bg-blue-500/10' },
  education: { label: 'Education', icon: GraduationCap, className: 'border-violet-500/20 text-violet-500 bg-violet-500/10' },
  certification: { label: 'Certification', icon: Award, className: 'border-amber-500/20 text-amber-500 bg-amber-500/10' },
  conference: { label: 'Conference', icon: Users, className: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10' },
  membership: { label: 'Membership', icon: BookMarked, className: 'border-cyan-500/20 text-cyan-500 bg-cyan-500/10' },
  achievement: { label: 'Achievement', icon: Trophy, className: 'border-rose-500/20 text-rose-500 bg-rose-500/10' },
  book: { label: 'Book', icon: BookOpen, className: 'border-orange-500/20 text-orange-500 bg-orange-500/10' },
  training: { label: 'Training', icon: Target, className: 'border-indigo-500/20 text-indigo-500 bg-indigo-500/10' },
  other: { label: 'Other', icon: Star, className: 'border-slate-500/20 text-slate-500 bg-slate-500/10' },
}

const filterTabs: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'role', label: 'Roles' },
  { value: 'education', label: 'Education' },
  { value: 'certification', label: 'Certifications' },
  { value: 'training', label: 'Training' },
  { value: 'conference', label: 'Conferences' },
  { value: 'membership', label: 'Memberships' },
  { value: 'achievement', label: 'Achievements' },
  { value: 'book', label: 'Books' },
]

const typeOptions: { value: CareerEntryType; label: string }[] = [
  { value: 'role', label: 'Role / Position' },
  { value: 'education', label: 'Education' },
  { value: 'certification', label: 'Certification' },
  { value: 'training', label: 'Training' },
  { value: 'conference', label: 'Conference / Presentation' },
  { value: 'membership', label: 'Membership' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'book', label: 'Book / Publication' },
  { value: 'other', label: 'Other' },
]

const categoryOptions = [
  'Agronomy', 'Animal Production', 'Plant Production', 'Data Analysis',
  'AI & Technology', 'Climate & Environment', 'Education & Training',
  'Research', 'Business & Entrepreneurship', 'Policy & Leadership',
  'Aquaculture', 'Soil Science', 'Beekeeping',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
} as const

const emptyEntry: Partial<CareerEntry> = {
  title: '', subtitle: '', type: 'role', startDate: '', endDate: undefined,
  description: '', category: '', url: '', icon: '', sortOrder: 0, skillIds: [],
}

export default function Career() {
  const { user } = useAuth()
  const { entries, isLoading, init, addEntryAsync, updateEntryAsync, deleteEntryAsync } = useCareerStore()
  const { skills, init: initSkills } = useSkillStore()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<CareerEntry>>({ ...emptyEntry })
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      init(user.id)
      initSkills(user.id)
    }
  }, [user, init, initSkills])

  const filteredEntries = useMemo(() => {
    if (activeTab === 'all') return entries
    return entries.filter((e) => e.type === activeTab)
  }, [entries, activeTab])

  const groupedByYear = useMemo(() => {
    const groups: Record<string, CareerEntry[]> = {}
    for (const entry of filteredEntries) {
      const year = entry.startDate ? new Date(entry.startDate).getFullYear().toString() : 'Unknown'
      if (!groups[year]) groups[year] = []
      groups[year].push(entry)
    }
    return Object.entries(groups).sort(([a], [b]) => parseInt(b) - parseInt(a))
  }, [filteredEntries])

  const openAdd = () => {
    setForm({ ...emptyEntry, id: generateId() })
    setSelectedSkillIds([])
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (entry: CareerEntry) => {
    setForm({
      title: entry.title,
      subtitle: entry.subtitle || '',
      type: entry.type,
      startDate: entry.startDate ? entry.startDate.split('T')[0] : '',
      endDate: entry.endDate ? entry.endDate.split('T')[0] : undefined,
      description: entry.description || '',
      category: entry.category || '',
      url: entry.url || '',
      icon: entry.icon || '',
      sortOrder: entry.sortOrder || 0,
      skillIds: entry.skillIds || [],
    })
    setSelectedSkillIds(entry.skillIds || [])
    setEditingId(entry.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.title?.trim() || !form.startDate) return
    const payload = {
      ...form,
      skillIds: selectedSkillIds,
      endDate: form.endDate || undefined,
      url: form.url || undefined,
      icon: form.icon || undefined,
    }
    if (editingId) {
      updateEntryAsync(editingId, payload)
    } else if (user) {
      addEntryAsync(user.id, payload)
    }
    setShowModal(false)
    setEditingId(null)
    setForm({ ...emptyEntry })
    setSelectedSkillIds([])
  }

  const handleDelete = (id: string) => {
    deleteEntryAsync(id)
    setConfirmDeleteId(null)
  }

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId],
    )
  }

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Clock className="h-8 w-8 animate-spin text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Loading career timeline...</p>
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
          <h1 className="text-2xl font-bold tracking-tight">Career Timeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your professional growth, education, certifications, and achievements
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{entries.filter((e) => e.type === 'role').length}</p>
              <p className="text-xs text-muted-foreground">Roles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{entries.filter((e) => e.type === 'certification' || e.type === 'training').length}</p>
              <p className="text-xs text-muted-foreground">Certs & Training</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{entries.filter((e) => e.type === 'education').length}</p>
              <p className="text-xs text-muted-foreground">Education</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{entries.filter((e) => e.type === 'conference').length}</p>
              <p className="text-xs text-muted-foreground">Conferences</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
          <TabsList className="flex-wrap">
            {filterTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-8">
        {groupedByYear.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No entries found</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Add your first career entry to start tracking your growth</p>
          </div>
        ) : (
          groupedByYear.map(([year, yearEntries]) => (
            <div key={year}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-lg font-bold">{year}</h2>
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">{yearEntries.length} entries</span>
              </div>
              <div className="relative space-y-3 pl-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-12px)] before:w-[2px] before:bg-border/50">
                {yearEntries.map((entry) => {
                  const config = (typeConfig[entry.type] || typeConfig.other)!
                  const Icon = config.icon
                  const linkedSkills = skills.filter((s) => (entry.skillIds || []).includes(s.id))
                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all hover:border-border hover:shadow-md group"
                    >
                      <div className="absolute -left-[22px] top-4 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-border bg-background">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn('text-[10px] gap-1', config.className)}>
                              <Icon className="h-3 w-3" />
                              {config.label}
                            </Badge>
                            {entry.category && (
                              <Badge variant="secondary" className="text-[10px]">{entry.category}</Badge>
                            )}
                          </div>
                          <h3 className="mt-2 text-sm font-semibold">{entry.title}</h3>
                          {entry.subtitle && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{entry.subtitle}</p>
                          )}
                          {entry.description && (
                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80 line-clamp-2">{entry.description}</p>
                          )}
                          {linkedSkills.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {linkedSkills.map((sk) => (
                                <Badge key={sk.id} variant="outline" className="text-[9px] px-1.5 py-0 gap-0.5 border-violet-500/20 text-violet-500 bg-violet-500/10">
                                  <Link2 className="h-2.5 w-2.5" />
                                  {sk.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(entry.startDate)}
                            {entry.endDate ? ` - ${formatDate(entry.endDate)}` : ''}
                          </span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => openEdit(entry)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {confirmDeleteId === entry.id ? (
                              <div className="flex">
                                <button
                                  onClick={() => handleDelete(entry.id)}
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
                                onClick={() => setConfirmDeleteId(entry.id)}
                                className="rounded-lg p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))
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
              className="w-full max-w-xl rounded-2xl border border-border/50 bg-card p-6 shadow-xl backdrop-blur-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingId ? 'Edit Entry' : 'Add Career Entry'}
                </h2>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-accent">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type *</label>
                    <select
                      value={form.type || 'other'}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CareerEntryType }))}
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {typeOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
                    <select
                      value={form.category || ''}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">None</option>
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Title *</label>
                  <Input
                    placeholder="e.g. PhD in Agronomy"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Organization / Institution</label>
                  <Input
                    placeholder="e.g. Hamma Lakhdar University"
                    value={form.subtitle || ''}
                    onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Start Date *</label>
                    <Input
                      type="date"
                      value={form.startDate || ''}
                      onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">End Date (leave blank if ongoing)</label>
                    <Input
                      type="date"
                      value={form.endDate || ''}
                      onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value || undefined }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
                  <textarea
                    placeholder="Describe this entry..."
                    rows={3}
                    value={form.description || ''}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">URL (optional)</label>
                  <Input
                    placeholder="https://..."
                    value={form.url || ''}
                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Linked Skills</label>
                  <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-background p-3">
                    {skills.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No skills added yet. Create skills in the Skills Radar page.</p>
                    ) : (
                      skills.map((sk) => (
                        <button
                          key={sk.id}
                          onClick={() => toggleSkill(sk.id)}
                          className={cn(
                            'rounded-lg px-2.5 py-1 text-xs font-medium transition-all border',
                            selectedSkillIds.includes(sk.id)
                              ? 'border-violet-500/50 bg-violet-500/10 text-violet-500'
                              : 'border-border text-muted-foreground hover:border-border/80 hover:bg-accent',
                          )}
                        >
                          {sk.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={!form.title?.trim() || !form.startDate}>
                  {editingId ? 'Save Changes' : 'Add Entry'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
