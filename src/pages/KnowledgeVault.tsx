import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  FileText,
  Lightbulb,
  Bookmark,
  Video,
  Image as ImageIcon,
  Link,
  Star,
  BookOpen,
  Headphones,
  File,
  Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn, formatDate } from '@/lib/utils'
import { knowledgeItems } from '@/data/mockData'
import type { KnowledgeItem } from '@/types'

const typeIcons: Record<string, typeof FileText> = {
  article: FileText,
  idea: Lightbulb,
  note: FileText,
  bookmark: Bookmark,
  document: File,
  video: Video,
  audio: Headphones,
  image: ImageIcon,
  link: Link,
}

const typeColors: Record<string, string> = {
  article: 'text-blue-500 bg-blue-500/10',
  idea: 'text-amber-500 bg-amber-500/10',
  note: 'text-violet-500 bg-violet-500/10',
  bookmark: 'text-emerald-500 bg-emerald-500/10',
  document: 'text-rose-500 bg-rose-500/10',
  video: 'text-purple-500 bg-purple-500/10',
  audio: 'text-cyan-500 bg-cyan-500/10',
  image: 'text-pink-500 bg-pink-500/10',
  link: 'text-sky-500 bg-sky-500/10',
}

const typeLabels: Record<string, string> = {
  article: 'Article',
  idea: 'Idea',
  note: 'Note',
  bookmark: 'Bookmark',
  document: 'Document',
  video: 'Video',
  audio: 'Audio',
  image: 'Image',
  link: 'Link',
}

const typeOptions = [
  { value: 'all', label: 'All' },
  ...Object.entries(typeLabels).map(([value, label]) => ({ value, label })),
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
} as const

export default function KnowledgeVault() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeType, setActiveType] = useState('all')
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(knowledgeItems.filter((k) => k.isFavorite).map((k) => k.id)),
  )

  const filteredItems = useMemo(() => {
    let result = knowledgeItems

    if (activeType !== 'all') {
      result = result.filter((k) => k.type === activeType)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (k) =>
          k.title.toLowerCase().includes(q) ||
          k.content.toLowerCase().includes(q) ||
          k.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }

    return result
  }, [searchQuery, activeType])

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Vault</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your second brain — capture ideas, articles, and resources
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <Tabs value={activeType} onValueChange={setActiveType}>
          <TabsList className="flex-wrap h-auto">
            {typeOptions.map((opt) => (
              <TabsTrigger key={opt.value} value={opt.value}>
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-16 text-center"
          >
            <BookOpen className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No knowledge items found</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {searchQuery ? 'Try a different search term' : 'Start adding to your vault'}
            </p>
          </motion.div>
        ) : (
          filteredItems.map((item) => {
            const Icon = typeIcons[item.type] ?? FileText
            const colorClass = typeColors[item.type] ?? 'text-slate-500 bg-slate-500/10'
            const isFav = favorites.has(item.id)

            return (
              <motion.div
                key={item.id}
                layout
                variants={itemVariants}
                className="group relative rounded-2xl border border-border/50 bg-card p-5 shadow-sm backdrop-blur-xl transition-all hover:border-border hover:shadow-md"
              >
                <button
                  onClick={(e) => toggleFavorite(item.id, e)}
                  className={cn(
                    'absolute right-3 top-3 rounded-lg p-1.5 transition-all',
                    isFav
                      ? 'text-amber-400 hover:text-amber-500'
                      : 'text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-muted-foreground',
                  )}
                >
                  <Star className={cn('h-4 w-4', isFav && 'fill-amber-400')} />
                </button>

                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                      colorClass,
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">{item.title}</h3>
                    <Badge variant="secondary" className="mt-0.5 text-[10px] px-2 py-0">
                      {typeLabels[item.type] ?? item.type}
                    </Badge>
                  </div>
                </div>

                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {item.content}
                </p>

                <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>

                {item.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0">
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
    </motion.div>
  )
}
