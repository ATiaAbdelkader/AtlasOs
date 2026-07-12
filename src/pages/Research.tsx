import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Search, BookmarkCheck, Star, StarHalf, Users,
  Calendar, FileText, Quote, Library, Eye, CheckCircle2,
  BookmarkPlus, Plus, X, Pencil, Trash2, ExternalLink, Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, generateId } from '@/lib/utils'
import { useResearchStore } from '@/stores/researchStore'
import { useAuth } from '@/lib/auth'
import type { ResearchPaper } from '@/types'

type FilterTab = 'all' | 'reading_list' | 'favorites'

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'border-gray-500/20 text-gray-500 bg-gray-500/10' },
  submitted: { label: 'Submitted', className: 'border-sky-500/20 text-sky-500 bg-sky-500/10' },
  review: { label: 'Under Review', className: 'border-yellow-500/20 text-yellow-500 bg-yellow-500/10' },
  accepted: { label: 'Accepted', className: 'border-green-500/20 text-green-500 bg-green-500/10' },
  rejected: { label: 'Rejected', className: 'border-red-500/20 text-red-500 bg-red-500/10' },
  to_read: { label: 'To Read', className: 'border-slate-500/20 text-slate-500 bg-slate-500/10' },
  reading: { label: 'Reading', className: 'border-blue-500/20 text-blue-500 bg-blue-500/10' },
  read: { label: 'Read', className: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10' },
  reviewed: { label: 'Reviewed', className: 'border-violet-500/20 text-violet-500 bg-violet-500/10' },
  cited: { label: 'Cited', className: 'border-amber-500/20 text-amber-500 bg-amber-500/10' },
}

const filterTabs: { value: FilterTab; label: string; icon: typeof Library }[] = [
  { value: 'all', label: 'All Papers', icon: Library },
  { value: 'reading_list', label: 'Reading List', icon: BookmarkCheck },
  { value: 'favorites', label: 'Favorites', icon: Star },
]

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'review', label: 'Under Review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'to_read', label: 'To Read' },
  { value: 'reading', label: 'Reading' },
  { value: 'read', label: 'Read' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'cited', label: 'Cited' },
]

function renderStars(rating: number) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`full-${i}`} className="h-3 w-3 fill-amber-400 text-amber-400" />
      ))}
      {half && <StarHalf className="h-3 w-3 fill-amber-400 text-amber-400" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-3 w-3 text-muted-foreground/30" />
      ))}
    </span>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
} as const

const emptyPaper: Partial<ResearchPaper> = {
  title: '', authors: [], journal: '', year: new Date().getFullYear(),
  doi: '', url: '', abstract: '', notes: '', tags: [],
  status: 'draft', rating: 0, citations: 0, readingList: false,
}

export default function Research() {
  const { user } = useAuth()
  const { papers, isLoading, init, addPaperAsync, updatePaperAsync, deletePaperAsync } = useResearchStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<ResearchPaper>>({ ...emptyPaper })
  const [authorsInput, setAuthorsInput] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [rejectionForm, setRejectionForm] = useState<{ journalName: string; cause: string; date: string }>({ journalName: '', cause: '', date: '' })

  useEffect(() => {
    if (user) init(user.id)
  }, [user, init])

  const stats = useMemo(() => {
    const total = papers.length
    const reading = papers.filter((p) => p.status === 'reading').length
    const completed = papers.filter((p) => ['read', 'reviewed', 'cited'].includes(p.status)).length
    const citations = papers.reduce((sum, p) => sum + (p.citations || 0), 0)
    return { total, reading, completed, citations }
  }, [papers])

  const filteredPapers = useMemo(() => {
    let result = papers
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.authors || []).some((a) => a.toLowerCase().includes(q)) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q)),
      )
    }
    switch (activeTab) {
      case 'reading_list':
        result = result.filter((p) => p.readingList)
        break
      case 'favorites':
        result = result.filter((p) => (p.rating || 0) >= 4)
        break
    }
    return result
  }, [papers, searchQuery, activeTab])

  const openAdd = () => {
    setForm({ ...emptyPaper, id: generateId() })
    setEditingId(null)
    setAuthorsInput('')
    setTagsInput('')
    setShowModal(true)
  }

  const openEdit = (paper: ResearchPaper) => {
    setForm({
      title: paper.title,
      authors: paper.authors || [],
      journal: paper.journal || '',
      year: paper.year || new Date().getFullYear(),
      doi: paper.doi || '',
      url: paper.url || '',
      abstract: paper.abstract || '',
      notes: paper.notes || '',
      tags: paper.tags || [],
      status: paper.status || 'to_read',
      rating: paper.rating || 0,
      citations: paper.citations || 0,
      readingList: paper.readingList || false,
      rejectionJournal: paper.rejectionJournal || undefined,
      rejectionCause: paper.rejectionCause || undefined,
      rejectionDate: paper.rejectionDate || undefined,
    })
    setAuthorsInput((paper.authors || []).join(', '))
    setTagsInput((paper.tags || []).join(', '))
    setEditingId(paper.id)
    setShowModal(true)
  }

  const handleStatusChange = (newStatus: string) => {
    setForm((f) => ({ ...f, status: newStatus as ResearchPaper['status'] }))
    if (newStatus === 'rejected') {
      setRejectionForm({
        journalName: form.rejectionJournal || '',
        cause: form.rejectionCause || '',
        date: (form.rejectionDate ?? new Date().toISOString().split('T')[0]) as string,
      })
      setShowRejectionModal(true)
    }
  }

  const handleSaveRejection = () => {
    setForm((f) => ({
      ...f,
      rejectionJournal: rejectionForm.journalName || undefined,
      rejectionCause: rejectionForm.cause || undefined,
      rejectionDate: rejectionForm.date || undefined,
    }))
    setShowRejectionModal(false)
  }

  const handleSave = () => {
    if (!form.title?.trim()) return
    const payload = {
      ...form,
      authors: authorsInput.split(',').map((a) => a.trim()).filter(Boolean),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    }
    if (editingId) {
      updatePaperAsync(editingId, payload)
    } else if (user) {
      addPaperAsync(user.id, payload)
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    deletePaperAsync(id)
    setConfirmDeleteId(null)
  }

  if (isLoading && papers.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Clock className="h-8 w-8 animate-spin text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Loading papers...</p>
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
          <h1 className="text-2xl font-bold tracking-tight">Research Workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your paper database and reading list
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Paper
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <Library className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Papers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats.reading}</p>
              <p className="text-xs text-muted-foreground">Currently Reading</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Quote className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats.citations}</p>
              <p className="text-xs text-muted-foreground">Citations</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
          <TabsList>
            {filterTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPapers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-16 text-center"
          >
            <BookOpen className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No papers found</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {searchQuery ? 'Try a different search term' : 'Add a paper to get started'}
            </p>
          </motion.div>
        ) : (
          filteredPapers.map((paper) => {
            const status = statusConfig[paper.status] ?? { label: 'To Read', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' }
            return (
              <motion.div
                key={paper.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-2xl border border-border/50 bg-card p-5 shadow-sm backdrop-blur-xl transition-all hover:border-border hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn('text-[10px]', status.className)}>
                        {status.label}
                      </Badge>
                      {paper.readingList && (
                        <BookmarkPlus className="h-3.5 w-3.5 text-blue-500" />
                      )}
                    </div>
                    <h3 className="mt-2 text-sm font-semibold leading-snug">{paper.title}</h3>
                  </div>
                  <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => openEdit(paper)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {confirmDeleteId === paper.id ? (
                      <div className="flex">
                        <button
                          onClick={() => handleDelete(paper.id)}
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
                        onClick={() => setConfirmDeleteId(paper.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3 w-3 shrink-0" />
                    <span className="truncate">{(paper.authors || []).join(', ')}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {paper.journal && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {paper.journal}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {paper.year}
                    </span>
                    {paper.doi && (
                      <span className="flex items-center gap-1 text-blue-500">
                        <ExternalLink className="h-3 w-3" />
                        DOI
                      </span>
                    )}
                  </div>
                </div>

                {paper.abstract && (
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {paper.abstract}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {renderStars(paper.rating || 0)}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Quote className="h-3 w-3" />
                    {paper.citations || 0}
                  </span>
                </div>

                {(paper.tags || []).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(paper.tags || []).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })
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
                  {editingId ? 'Edit Paper' : 'Add Research Paper'}
                </h2>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-accent">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Title *</label>
                  <Input
                    placeholder="Paper title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Authors (comma-separated)</label>
                    <Input
                      placeholder="Author, A., Author, B."
                      value={authorsInput}
                      onChange={(e) => setAuthorsInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Year</label>
                    <Input
                      type="number"
                      value={form.year || ''}
                      onChange={(e) => setForm((f) => ({ ...f, year: parseInt(e.target.value) || undefined }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Journal</label>
                    <Input
                      placeholder="Journal name"
                      value={form.journal || ''}
                      onChange={(e) => setForm((f) => ({ ...f, journal: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label>
                    <select
                      value={form.status || 'draft'}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {statusOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    {form.rejectionJournal && (
                      <p className="mt-1 text-xs text-red-500">
                        Rejected by {form.rejectionJournal}{form.rejectionDate ? ` on ${form.rejectionDate}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">DOI</label>
                    <Input
                      placeholder="10.xxxx/xxxxx"
                      value={form.doi || ''}
                      onChange={(e) => setForm((f) => ({ ...f, doi: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">URL</label>
                    <Input
                      placeholder="https://..."
                      value={form.url || ''}
                      onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Abstract</label>
                  <textarea
                    placeholder="Paper abstract..."
                    rows={3}
                    value={form.abstract || ''}
                    onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))}
                    className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Notes</label>
                  <textarea
                    placeholder="Your notes..."
                    rows={2}
                    value={form.notes || ''}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tags (comma-separated)</label>
                    <Input
                      placeholder="ai, agriculture, deep-learning"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Rating (0-5)</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setForm((f) => ({ ...f, rating: (f.rating || 0) === n ? n - 1 : n }))}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={cn(
                              'h-5 w-5',
                              (form.rating || 0) >= n ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="readingList"
                    checked={form.readingList || false}
                    onChange={(e) => setForm((f) => ({ ...f, readingList: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <label htmlFor="readingList" className="text-sm text-muted-foreground">Add to Reading List</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Citations"
                    value={form.citations || 0}
                    onChange={(e) => setForm((f) => ({ ...f, citations: parseInt(e.target.value) || 0 }))}
                    className="w-24 rounded-xl border border-border bg-background p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-xs text-muted-foreground">Citations</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={!form.title?.trim()}>
                  {editingId ? 'Save Changes' : 'Add Paper'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rejection Details Modal */}
      <AnimatePresence>
        {showRejectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowRejectionModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-xl backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-red-500">Rejection Details</h2>
                <button onClick={() => setShowRejectionModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-accent">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Journal Name</label>
                  <Input
                    placeholder="Journal that rejected the paper"
                    value={rejectionForm.journalName}
                    onChange={(e) => setRejectionForm((f) => ({ ...f, journalName: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Rejection Cause</label>
                  <textarea
                    placeholder="Reason for rejection..."
                    rows={4}
                    value={rejectionForm.cause}
                    onChange={(e) => setRejectionForm((f) => ({ ...f, cause: e.target.value }))}
                    className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Date</label>
                  <Input
                    type="date"
                    value={rejectionForm.date}
                    onChange={(e) => setRejectionForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowRejectionModal(false)}>Cancel</Button>
                <Button onClick={handleSaveRejection}>Save Details</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
