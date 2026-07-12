export type ReminderMinutes = 5 | 10 | 15 | 30 | 60 | 120 | 1440

const REMINDER_STORAGE_KEY = 'atlasos_reminders'
const PERMISSION_KEY = 'atlasos_notification_permission'

export interface EventReminder {
  eventId: string
  title: string
  eventTime: string
  remindAt: number
  notified: boolean
}

// ── Permission ──

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// ── Send Notification ──

export function sendBrowserNotification(title: string, options?: NotificationOptions): void {
  if (getNotificationPermission() !== 'granted') return
  try {
    const n = new Notification(title, {
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      ...options,
    })
    if (options?.data?.url) {
      n.onclick = () => window.open(options.data.url, '_blank')
    }
    setTimeout(() => n.close(), 8000)
  } catch {
    // Notification API not available
  }
}

// ── Reminder Scheduling ──

export function scheduleReminder(eventId: string, title: string, eventTime: string, minutesBefore: ReminderMinutes): void {
  const eventDate = new Date(eventTime)
  const remindAt = eventDate.getTime() - minutesBefore * 60 * 1000
  const stored = getStoredReminders()
  stored.push({ eventId, title, eventTime, remindAt, notified: false })
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(stored))
}

export function cancelReminder(eventId: string): void {
  const stored = getStoredReminders().filter((r) => r.eventId !== eventId)
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(stored))
}

export function getStoredReminders(): EventReminder[] {
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function checkReminders(): void {
  const stored = getStoredReminders()
  const now = Date.now()
  const updated = stored.map((r) => {
    if (r.notified) return r
    if (now >= r.remindAt) {
      sendBrowserNotification(`📅 Reminder: ${r.title}`, {
        body: `Starts at ${new Date(r.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        tag: r.eventId,
        data: { url: '/calendar' },
      })
      return { ...r, notified: true }
    }
    return r
  })
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(updated))
}

// ── Start reminder checker ──

let intervalId: ReturnType<typeof setInterval> | null = null

export function startReminderChecker(): void {
  if (intervalId) return
  checkReminders()
  intervalId = setInterval(checkReminders, 30000)
}

export function stopReminderChecker(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
