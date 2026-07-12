import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant'
    content: string
  }
}

function formatContent(content: string): string {
  const lines = content.split('\n')
  const formatted = lines.map((line) => {
    let processed = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-xs font-mono">$1</code>')
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
    if (/^###\s(.+)/.test(processed)) {
      return `<h3 class="text-sm font-semibold mt-2 mb-1">${processed.replace(/^###\s/, '')}</h3>`
    }
    if (/^##\s(.+)/.test(processed)) {
      return `<h2 class="text-base font-semibold mt-3 mb-1">${processed.replace(/^##\s/, '')}</h2>`
    }
    if (/^#\s(.+)/.test(processed)) {
      return `<h1 class="text-lg font-bold mt-3 mb-1">${processed.replace(/^#\s/, '')}</h1>`
    }
    return `<span>${processed}</span>`
  })
  return formatted.join('<br/>')
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-muted/60 text-foreground rounded-bl-md border border-border/30'
        )}
      >
        <div
          className="[&_strong]:font-semibold [&_em]:italic [&_del]:line-through [&_code]:bg-muted/20 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono"
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
        />
      </div>
    </motion.div>
  )
}
