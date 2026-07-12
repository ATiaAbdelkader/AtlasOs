import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StickyNote, Save, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const MAX_NOTES = 5

export default function QuickNotes() {
  const [notes, setNotes] = useState<string[]>([])
  const [currentNote, setCurrentNote] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editingIndex !== null && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [editingIndex])

  const handleSave = () => {
    const trimmed = currentNote.trim()
    if (!trimmed) return

    if (editingIndex !== null) {
      setNotes((prev) => prev.map((n, i) => (i === editingIndex ? trimmed : n)))
      setEditingIndex(null)
    } else {
      setNotes((prev) => [trimmed, ...prev].slice(0, MAX_NOTES))
    }
    setCurrentNote('')
  }

  const handleEdit = (index: number) => {
    setCurrentNote(notes[index] ?? '')
    setEditingIndex(index)
  }

  const handleDelete = (index: number) => {
    setNotes((prev) => prev.filter((_, i) => i !== index))
    if (editingIndex === index) {
      setEditingIndex(null)
      setCurrentNote('')
    }
  }

  const handleCancel = () => {
    setCurrentNote('')
    setEditingIndex(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <StickyNote className="h-4 w-4 text-amber-500" />
            Quick Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Write a quick note..."
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleSave()
                }
                if (e.key === 'Escape') handleCancel()
              }}
            />
            <div className="flex items-center justify-end gap-2">
              {editingIndex !== null && (
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="mr-1 h-3 w-3" />
                  Cancel
                </Button>
              )}
              <Button variant="default" size="sm" onClick={handleSave} disabled={!currentNote.trim()}>
                <Save className="mr-1 h-3 w-3" />
                {editingIndex !== null ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {notes.length === 0 && (
              <p className="py-2 text-center text-xs text-muted-foreground">No notes yet</p>
            )}
            {notes.map((note, index) => (
              <motion.div
                key={`${note}-${index}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="group flex items-start justify-between gap-2 rounded-lg border border-border/50 p-2.5"
              >
                <p
                  className="flex-1 cursor-pointer text-sm leading-relaxed"
                  onClick={() => handleEdit(index)}
                >
                  {note}
                </p>
                <button
                  onClick={() => handleDelete(index)}
                  className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
