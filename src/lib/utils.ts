import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diff = d.getTime() - now.getTime()
  const absDiff = Math.abs(diff)

  const minutes = Math.floor(absDiff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ${diff >= 0 ? 'from now' : 'ago'}`
  if (hours < 24) return `${hours}h ${diff >= 0 ? 'from now' : 'ago'}`
  if (days < 30) return `${days}d ${diff >= 0 ? 'from now' : 'ago'}`
  return formatDate(date)
}

export function getDaysUntil(date: string | Date): number {
  const now = new Date()
  const d = new Date(date)
  const diff = d.getTime() - now.getTime()
  return Math.ceil(diff / 86400000)
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return 'text-emerald-500'
  if (progress >= 60) return 'text-blue-500'
  if (progress >= 40) return 'text-amber-500'
  if (progress >= 20) return 'text-orange-500'
  return 'text-red-500'
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return 'text-red-500 bg-red-500/10'
    case 'high': return 'text-orange-500 bg-orange-500/10'
    case 'medium': return 'text-blue-500 bg-blue-500/10'
    case 'low': return 'text-slate-500 bg-slate-500/10'
    default: return 'text-slate-500 bg-slate-500/10'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-emerald-500 bg-emerald-500/10'
    case 'in_progress': return 'text-blue-500 bg-blue-500/10'
    case 'blocked': return 'text-red-500 bg-red-500/10'
    case 'delayed': return 'text-amber-500 bg-amber-500/10'
    default: return 'text-slate-500 bg-slate-500/10'
  }
}

export function getEnergyColor(energy: string): string {
  switch (energy) {
    case 'very_high': return 'text-emerald-500'
    case 'high': return 'text-blue-500'
    case 'medium': return 'text-amber-500'
    case 'low': return 'text-orange-500'
    case 'very_low': return 'text-red-500'
    default: return 'text-slate-500'
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}
