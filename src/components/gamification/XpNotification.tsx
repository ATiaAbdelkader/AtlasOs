import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'

interface XpNotificationProps {
  amount: number
  source: string
  onComplete: () => void
}

export function XpNotification({ amount, source, onComplete }: XpNotificationProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      onComplete()
    }, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-xl px-5 py-3 shadow-xl"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              +{amount} XP
            </div>
            <div className="text-xs text-muted-foreground">{source}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
