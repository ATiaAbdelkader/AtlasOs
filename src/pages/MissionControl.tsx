import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Target, Plus, X, Pencil, Trash2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useMissionStore } from '@/stores/missionStore'
import { useAuth } from '@/lib/auth'
import { useTaskStore } from '@/stores/taskStore'
import MissionCard from '@/components/missions/MissionCard'
import { useState } from 'react'
import type { Mission } from '@/types'

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

export default function MissionControl() {
  const { user } = useAuth()
  const { missions, isLoading, init, addMissionAsync, updateMissionAsync, deleteMissionAsync } = useMissionStore()
  const { tasks } = useTaskStore()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', color: '#8B5CF6' })

  useEffect(() => {
    if (user) init(user.id)
  }, [user, init])

  const totalTasks = tasks?.filter((t) => t.status !== 'completed').length ?? 0
  const linkedTasks = tasks?.filter(
    (t) => t.status !== 'completed' && (t.missionIds?.length ?? 0) > 0,
  ).length ?? 0
  const alignmentScore = totalTasks > 0 ? Math.round((linkedTasks / totalTasks) * 100) : 0
  const totalTime = missions.reduce((sum, m) => sum + m.progress, 0) || 1

  const openAdd = () => {
    setForm({ title: '', description: '', color: '#8B5CF6' })
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (mission: Mission) => {
    setForm({ title: mission.title, description: mission.description, color: mission.color })
    setEditingId(mission.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    if (editingId) {
      updateMissionAsync(editingId, { title: form.title, description: form.description, color: form.color })
    } else if (user) {
      addMissionAsync(user.id, { title: form.title, description: form.description, color: form.color })
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    deleteMissionAsync(id)
    setConfirmDeleteId(null)
  }

  if (isLoading && missions.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Clock className="h-8 w-8 animate-spin text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Loading missions...</p>
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
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mission Control</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your strategic life operating system
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Mission
          </Button>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-violet-500" />
              Mission Alignment
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {alignmentScore}% linked
            </span>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {missions.map((mission) => {
                const barWidth = (mission.progress / totalTime) * 100
                return (
                  <div key={mission.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium truncate max-w-[60%]">
                        {mission.title}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {Math.round(mission.progress)}%
                      </span>
                    </div>
                    <div className="relative h-5 w-full overflow-hidden rounded-lg bg-muted/50">
                      <motion.div
                        className="h-full rounded-lg transition-all"
                        style={{ backgroundColor: mission.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' } as const}
                      />
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Rocket className="h-4 w-4 text-emerald-500" />
              Alignment Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: 'backOut', delay: 0.3 } as const}
            >
              <svg width={140} height={140} className="-rotate-90">
                <circle
                  cx={70} cy={70} r={60}
                  fill="none" stroke="currentColor" strokeWidth={8}
                  className="text-muted" opacity={0.15}
                />
                <motion.circle
                  cx={70} cy={70} r={60}
                  fill="none" stroke="currentColor" strokeWidth={8}
                  strokeLinecap="round" className="text-violet-500"
                  strokeDasharray={2 * Math.PI * 60}
                  initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 60 - (alignmentScore / 100) * 2 * Math.PI * 60,
                  }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 } as const}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <motion.span
                  className="text-3xl font-bold tabular-nums"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: 'backOut', delay: 0.7 } as const}
                >
                  {alignmentScore}%
                </motion.span>
                <span className="text-[10px] text-muted-foreground">aligned</span>
              </div>
            </motion.div>
            <div className="mt-4 w-full space-y-2 text-center text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">{linkedTasks}</span> of{' '}
                <span className="font-medium text-foreground">{totalTasks}</span> tasks
                linked to missions
              </p>
              <p>{missions.filter((m) => m.isActive).length} active missions</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-violet-500" />
            <h2 className="text-lg font-semibold">All Missions</h2>
            <span className="text-xs text-muted-foreground">{missions.length} missions</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {missions.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <Target className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No missions yet</p>
              <p className="mt-1 text-xs text-muted-foreground/60">Add a mission to get started</p>
            </div>
          ) : (
            missions.map((mission, index) => (
              <div key={mission.id} className="group relative">
                <MissionCard mission={mission} index={index} />
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => openEdit(mission)}
                    className="rounded-lg bg-background/80 p-1.5 text-muted-foreground hover:bg-accent backdrop-blur-sm"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {confirmDeleteId === mission.id ? (
                    <div className="flex gap-1 rounded-lg bg-background/80 p-1 backdrop-blur-sm">
                      <button
                        onClick={() => handleDelete(mission.id)}
                        className="rounded p-1 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded p-1 text-muted-foreground hover:bg-accent"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(mission.id)}
                      className="rounded-lg bg-background/80 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 backdrop-blur-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

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
                  {editingId ? 'Edit Mission' : 'Add New Mission'}
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
                    placeholder="Mission name"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
                  <textarea
                    placeholder="What's this mission about?"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Color</label>
                  <div className="flex gap-2">
                    {['#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#14B8A6', '#EF4444', '#F97316'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm((f) => ({ ...f, color: c }))}
                        className={cn(
                          'h-8 w-8 rounded-full border-2 transition-all',
                          form.color === c ? 'border-foreground scale-110' : 'border-transparent',
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={!form.title.trim()}>
                  {editingId ? 'Save Changes' : 'Add Mission'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
