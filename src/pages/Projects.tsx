import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderKanban, CheckCircle2, Circle, ChevronDown, ChevronUp,
  Calendar, Flag, Tag, Target, ArrowRight, Plus, X, Trash2, Pencil,
  Clock,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { cn, formatDate, getStatusColor, generateId } from '@/lib/utils'
import { useProjectStore } from '@/stores/projectStore'
import { useAuth } from '@/lib/auth'
import type { Project, Status, Priority } from '@/types'

type StatusFilter = 'all' | 'in_progress' | 'completed'

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
} as const

const priorityConfig = {
  critical: { label: 'Critical', className: 'border-red-500/20 text-red-500 bg-red-500/10' },
  high: { label: 'High', className: 'border-orange-500/20 text-orange-500 bg-orange-500/10' },
  medium: { label: 'Medium', className: 'border-blue-500/20 text-blue-500 bg-blue-500/10' },
  low: { label: 'Low', className: 'border-slate-500/20 text-slate-500 bg-slate-500/10' },
}

const statusLabel: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
  delayed: 'Delayed',
}

const emptyProject: Partial<Project> = {
  title: '',
  description: '',
  status: 'not_started',
  priority: 'medium',
  category: 'research',
  deadline: undefined,
  tags: [],
  objectives: [],
  milestones: [],
}

export default function Projects() {
  const { user } = useAuth()
  const { projects, isLoading, init, addProjectAsync, updateProjectAsync, deleteProjectAsync } = useProjectStore()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Project>>({ ...emptyProject })

  useEffect(() => {
    if (user) init(user.id)
  }, [user, init])

  const filteredProjects = useMemo(() => {
    if (statusFilter === 'all') return projects
    return projects.filter((p) => p.status === statusFilter)
  }, [projects, statusFilter])

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const openAdd = () => {
    setForm({ ...emptyProject, id: generateId() })
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (project: Project) => {
    setForm({
      title: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority,
      category: project.category,
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
      tags: project.tags,
    })
    setEditingId(project.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.title?.trim()) return
    if (editingId) {
      updateProjectAsync(editingId, {
        title: form.title,
        description: form.description || '',
        status: form.status as Status,
        priority: form.priority as Priority,
        deadline: form.deadline || undefined,
        tags: form.tags || [],
      })
    } else if (user) {
      addProjectAsync(user.id, {
        title: form.title,
        description: form.description || '',
        status: form.status as Status,
        priority: form.priority as Priority,
        deadline: form.deadline || undefined,
        tags: form.tags || [],
        category: form.category || 'research',
      })
    }
    setShowModal(false)
    setEditingId(null)
    setForm({ ...emptyProject })
  }

  const handleDelete = (id: string) => {
    deleteProjectAsync(id)
    setConfirmDeleteId(null)
  }

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Clock className="h-8 w-8 animate-spin text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      <motion.div
        variants={cardVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your projects and track progress
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <TabsList>
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      <motion.div
        variants={cardVariants}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-16 text-center"
          >
            <FolderKanban className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              No projects found
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {statusFilter === 'completed'
                ? 'Complete a project to see it here'
                : 'Add a new project to get started'}
            </p>
          </motion.div>
        ) : (
          filteredProjects.map((project) => {
            const isExpanded = expandedId === project.id
            const priority = priorityConfig[project.priority]
            const completedMilestones = project.milestones?.filter(
              (m) => m.status === 'completed',
            ).length ?? 0
            const totalMilestones = project.milestones?.length ?? 0

            return (
              <motion.div
                key={project.id}
                layout
                variants={cardVariants}
                className={cn(
                  'group rounded-2xl border border-border/50 bg-card shadow-sm backdrop-blur-xl transition-all',
                  isExpanded && 'md:col-span-2 lg:col-span-3',
                )}
              >
                <div
                  className="cursor-pointer p-5"
                  onClick={() => toggleExpand(project.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{project.title}</h3>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px]', getStatusColor(project.status))}
                        >
                          {statusLabel[project.status] ?? project.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px]', priority.className)}
                        >
                          <Flag className="mr-0.5 h-2.5 w-2.5" />
                          {priority.label}
                        </Badge>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(project) }}
                        className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-all"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {confirmDeleteId === project.id ? (
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(project.id) }}
                          className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <Progress value={project.progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{Math.round(project.progress)}% complete</span>
                      <div className="flex items-center gap-3">
                        {project.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(project.deadline)}
                          </span>
                        )}
                        {totalMilestones > 0 && (
                          <span>
                            {completedMilestones}/{totalMilestones} milestones
                          </span>
                        )}
                      </div>
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
                        {project.objectives && project.objectives.length > 0 && (
                          <div>
                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <Target className="h-3.5 w-3.5" />
                              Objectives
                            </h4>
                            <div className="space-y-1.5">
                              {project.objectives.map((obj, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 text-xs text-muted-foreground"
                                >
                                  <ArrowRight className="h-3 w-3 shrink-0 text-violet-500" />
                                  <span>{obj}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {project.milestones && project.milestones.length > 0 && (
                          <div>
                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <Flag className="h-3.5 w-3.5" />
                              Milestones
                            </h4>
                            <div className="space-y-2">
                              {project.milestones.map((milestone) => {
                                const isDone = milestone.status === 'completed'
                                return (
                                  <div
                                    key={milestone.id}
                                    className={cn(
                                      'flex items-start gap-3 rounded-xl border border-border/50 p-3 transition-colors',
                                      isDone && 'opacity-60',
                                    )}
                                  >
                                    {isDone ? (
                                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                    ) : (
                                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={cn(
                                            'text-sm font-medium',
                                            isDone && 'line-through text-muted-foreground',
                                          )}
                                        >
                                          {milestone.title}
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className={cn('text-[10px]', getStatusColor(milestone.status))}
                                        >
                                          {statusLabel[milestone.status] ?? milestone.status}
                                        </Badge>
                                      </div>
                                      <p className="mt-0.5 text-xs text-muted-foreground">
                                        {milestone.description}
                                      </p>
                                      {milestone.deadline && (
                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                          Due: {formatDate(milestone.deadline)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {project.tags && project.tags.length > 0 && (
                          <div>
                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <Tag className="h-3.5 w-3.5" />
                              Tags
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {project.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-[10px] px-2 py-0.5"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {(!project.objectives || project.objectives.length === 0) &&
                          (!project.milestones || project.milestones.length === 0) &&
                          (!project.tags || project.tags.length === 0) && (
                            <p className="text-center text-xs text-muted-foreground py-4">
                              No additional details
                            </p>
                          )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </motion.div>

      {/* Add/Edit Modal */}
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
              className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-xl backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingId ? 'Edit Project' : 'Add New Project'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Title</label>
                  <Input
                    placeholder="Project name"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
                  <textarea
                    placeholder="Project description..."
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Deadline</label>
                  <input
                    type="date"
                    value={form.deadline || ''}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={!form.title?.trim()}>
                  {editingId ? 'Save Changes' : 'Add Project'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
