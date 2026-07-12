import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Tags, AlignLeft,
  Pencil, Trash2, X, Check,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { cn, getDaysUntil, formatDate, getPriorityColor } from '@/lib/utils'
import type { Task, Priority } from '@/types'

interface TaskCardProps {
  task: Task
  onUpdate: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
}

const priorityLabel: Record<Priority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export default function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    deadline: task.deadline ? task.deadline.split('T')[0] : '',
  })

  const isCompleted = task.status === 'completed'
  const daysUntil = task.deadline ? getDaysUntil(task.deadline) : null

  const toggleComplete = () => {
    if (isCompleted) {
      onUpdate(task.id, { status: 'not_started', progress: 0, completedAt: undefined })
    } else {
      onUpdate(task.id, { status: 'completed', progress: 100, completedAt: new Date().toISOString() })
    }
  }

  const handleSaveEdit = () => {
    if (!editForm.title.trim()) return
    onUpdate(task.id, {
      title: editForm.title,
      description: editForm.description,
      priority: editForm.priority,
      deadline: editForm.deadline || undefined,
    })
    setEditing(false)
  }

  const handleDelete = () => {
    onDelete(task.id)
    setConfirmDelete(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group rounded-2xl border border-border/50 bg-card p-4 shadow-sm backdrop-blur-xl transition-all',
        isCompleted && 'opacity-60',
      )}
    >
      {editing ? (
        <div className="space-y-3">
          <Input
            value={editForm.title}
            onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit() }}
            autoFocus
            className="text-sm font-medium"
          />
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full resize-none rounded-xl border border-border bg-background p-2.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
          />
          <div className="flex items-center gap-2">
            <select
              value={editForm.priority}
              onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value as Priority }))}
              className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input
              type="date"
              value={editForm.deadline}
              onChange={(e) => setEditForm((f) => ({ ...f, deadline: e.target.value }))}
              className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="ml-auto flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500" onClick={handleSaveEdit}>
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <button onClick={toggleComplete} className="mt-0.5 shrink-0">
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className={cn('text-sm font-medium', isCompleted && 'line-through text-muted-foreground')}>
                  {task.title}
                </h3>
                {task.estimatedTime > 0 && (
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{task.estimatedTime}m</span>
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Badge variant="outline" className={cn('text-[10px] px-2 py-0', getPriorityColor(task.priority))}>
                  {priorityLabel[task.priority]}
                </Badge>
                <button
                  onClick={(e) => { e.stopPropagation(); setEditing(true) }}
                  className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-muted-foreground hover:bg-accent transition-all"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {confirmDelete ? (
                  <div className="flex gap-1">
                    <button
                      onClick={handleDelete}
                      className="rounded-lg p-1 text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-lg p-1 text-muted-foreground hover:bg-accent transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
                    className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setExpanded((e) => !e)}
                >
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {daysUntil !== null && (
              <p className={cn('mt-1 text-xs', daysUntil <= 0 ? 'text-red-500' : 'text-muted-foreground')}>
                {daysUntil <= 0 ? 'Overdue' : `${daysUntil}d remaining`}
                {task.deadline && ` · ${formatDate(task.deadline)}`}
              </p>
            )}

            <Progress value={task.progress} className="mt-2 h-1.5" />
          </div>
        </div>
      )}

      <AnimatePresence>
        {expanded && !editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3 border-t border-border/50 pt-3">
              {task.description && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlignLeft className="mt-0.5 h-3 w-3 shrink-0" />
                  <p className="leading-relaxed">{task.description}</p>
                </div>
              )}

              {task.subtasks.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
                  </p>
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 text-xs">
                      {subtask.completed ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {task.tags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tags className="h-3 w-3 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {tag}
                      </Badge>
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
}
