import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Sparkles, AlertTriangle, Lightbulb, Trophy, Bell,
  Zap, Brain, BarChart3, CalendarDays, ListTodo, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import ChatMessage from '@/components/ai/ChatMessage'
import { aiRecommendations } from '@/data/mockData'
import type { AIChatMessage } from '@/types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
} as const

const quickActions = [
  { label: 'What should I work on today?', icon: ListTodo },
  { label: 'Analyze my productivity', icon: BarChart3 },
  { label: 'Summarize this week', icon: CalendarDays },
  { label: 'Suggest my schedule', icon: Zap },
]

const recommendationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  warning: AlertTriangle,
  suggestion: Lightbulb,
  insight: Brain,
  achievement: Trophy,
  reminder: Bell,
}

const recommendationColors: Record<string, string> = {
  warning: 'text-amber-500 bg-amber-500/10',
  suggestion: 'text-blue-500 bg-blue-500/10',
  insight: 'text-violet-500 bg-violet-500/10',
  achievement: 'text-emerald-500 bg-emerald-500/10',
  reminder: 'text-rose-500 bg-rose-500/10',
}

const priorityBadgeVariant: Record<string, 'destructive' | 'warning' | 'info' | 'secondary'> = {
  critical: 'destructive',
  high: 'warning',
  medium: 'info',
  low: 'secondary',
}

const initialMessages: AIChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: "Hello! I'm your AI productivity assistant. I can help you:\n\n- **Analyze** your productivity patterns\n- **Suggest** optimal work schedules\n- **Track** your goals and progress\n- **Summarize** your week\n\nHow can I help you today?",
    timestamp: new Date().toISOString(),
  },
]

const botResponses: Record<string, string> = {
  'What should I work on today?':
    "Based on your current priorities, I recommend:\n\n1. **Grant budget spreadsheet** - Due July 20 (high urgency)\n2. **Literature review section 3** - Scheduled for today 8-10 AM\n3. **Review app wireframes** - 11 AM meeting\n\nYour peak focus window is **8-11 AM**, so I suggest tackling the grant budget first.",
  'Analyze my productivity':
    "Here's your productivity analysis:\n\n- **Average score**: 78% this month\n- **Best day**: July 8th (92%)\n- **Deep work**: 4.2h/day average\n- **Task completion**: 72% rate\n\n📈 Your productivity peaks in the **morning hours**. Consider scheduling high-focus work before noon.",
  'Summarize this week':
    "**Weekly Summary (July 6-12):**\n\n- ✅ **18 tasks completed** out of 25\n- 📝 **4,500 words** written across projects\n- 🎯 **5 hours** of deep work\n- 🔥 **Exercise streak**: 7 days\n\nYour most productive day was **Tuesday**. Areas for improvement: writing consistency.",
  'Suggest my schedule':
    "**Optimal Schedule for Tomorrow:**\n\n```\n06:00 - 06:30  Exercise\n08:00 - 10:00  Deep Work (Grant Budget)\n10:00 - 11:00  PhD Supervisor Meeting\n11:00 - 12:00  App Wireframe Review\n14:00 - 15:00  Literature Review\n20:00 - 21:00  Reading\n```\n\n⏰ Block your mornings for high-priority research work!",
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<AIChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (content: string, role: 'user' | 'assistant') => {
    const msg: AIChatMessage = {
      id: `${role}-${Date.now()}`,
      role,
      content,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, msg])
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text || isTyping) return
    setInput('')
    addMessage(text, 'user')
    setIsTyping(true)
    setTimeout(() => {
      const response =
        botResponses[text] ??
        "I'll look into that for you. Could you provide more details so I can give you a more specific recommendation?"
      addMessage(response, 'assistant')
      setIsTyping(false)
    }, 1200)
  }

  const handleQuickAction = (label: string) => {
    if (isTyping) return
    addMessage(label, 'user')
    setIsTyping(true)
    setTimeout(() => {
      addMessage(botResponses[label] ?? "I'll help you with that.", 'assistant')
      setIsTyping(false)
    }, 1200)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-[calc(100vh-4rem)] gap-4 p-4"
    >
      <motion.div variants={itemVariants} className="flex w-full flex-col lg:w-[70%]">
        <Card className="flex flex-1 flex-col overflow-hidden">
          <CardHeader className="shrink-0 border-b border-border/50 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                <Sparkles className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <CardTitle className="text-base">AI Assistant</CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="space-y-3 p-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' } as const}
                  >
                    <ChatMessage message={msg} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start"
                >
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-border/30 bg-muted/60 px-4 py-2.5">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="shrink-0 border-t border-border/50 p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.label)}
                  disabled={isTyping}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:text-foreground disabled:opacity-50"
                >
                  <action.icon className="h-3 w-3" />
                  {action.label}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your productivity..."
                disabled={isTyping}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="hidden lg:block lg:w-[30%]">
        <Card className="h-full overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <ScrollArea className="h-[calc(100%-4rem)]">
            <div className="space-y-2 p-3">
              {aiRecommendations.map((rec) => {
                const Icon = recommendationIcons[rec.type] ?? Lightbulb
                const colorClass = recommendationColors[rec.type] ?? 'bg-slate-500/10 text-slate-500'
                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group rounded-xl border border-border/50 p-3 transition-colors hover:border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">{rec.title}</p>
                          <Badge
                            variant={priorityBadgeVariant[rec.priority] ?? 'secondary'}
                            className="shrink-0 text-[10px] capitalize"
                          >
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>
        </Card>
      </motion.div>
    </motion.div>
  )
}
