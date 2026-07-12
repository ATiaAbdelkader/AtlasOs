import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Moon, Sun, Bell, Shield, Palette, Clock,
  Download, Upload, Trash2, Check, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
} as const

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-blue-600' : 'bg-muted-foreground/30'
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </div>
  )
}

const integrations = [
  { name: 'Google Calendar', icon: '📅', connected: true },
  { name: 'Outlook', icon: '📧', connected: false },
  { name: 'Google Drive', icon: '📁', connected: true },
  { name: 'GitHub', icon: '💻', connected: false },
  { name: 'OpenAI', icon: '🤖', connected: true },
  { name: 'Claude', icon: '🧠', connected: false },
]

export default function Settings() {
  const { user } = useAuth()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [notifications, setNotifications] = useState({
    taskReminders: true,
    deadlineAlerts: true,
    weeklyReports: false,
    aiInsights: true,
  })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
      setName(user.user_metadata?.display_name || user.email?.split('@')[0] || '')
    }
  }, [user])

  const userInitials = email
    ? email.charAt(0).toUpperCase() + (email.split('@')[0]?.charAt(1)?.toUpperCase() || '')
    : '?'

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    setSaved(false)
    const { error } = await (supabase as any)
      .from('profiles')
      .upsert({ id: user.id, display_name: name, updated_at: new Date().toISOString() })
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-3xl space-y-6 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-blue-500" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-violet-500/10 text-lg text-violet-500">{userInitials}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" disabled>Change Avatar</Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input value={email} type="email" disabled className="opacity-60" />
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4 text-violet-500" />
              Theme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Appearance</p>
                <p className="text-xs text-muted-foreground">
                  Toggle between dark and light mode
                </p>
              </div>
              <div className="flex gap-1 rounded-xl border border-border/50 bg-muted/50 p-1">
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                    theme === 'dark' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Moon className="h-3.5 w-3.5" />
                  Dark
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                    theme === 'light' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Sun className="h-3.5 w-3.5" />
                  Light
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-amber-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleSwitch
              checked={notifications.taskReminders}
              onChange={(v) => setNotifications((n) => ({ ...n, taskReminders: v }))}
              label="Task Reminders"
              description="Get notified about upcoming task deadlines"
            />
            <Separator />
            <ToggleSwitch
              checked={notifications.deadlineAlerts}
              onChange={(v) => setNotifications((n) => ({ ...n, deadlineAlerts: v }))}
              label="Deadline Alerts"
              description="Receive alerts for project and mission deadlines"
            />
            <Separator />
            <ToggleSwitch
              checked={notifications.weeklyReports}
              onChange={(v) => setNotifications((n) => ({ ...n, weeklyReports: v }))}
              label="Weekly Reports"
              description="Get a weekly summary of your productivity"
            />
            <Separator />
            <ToggleSwitch
              checked={notifications.aiInsights}
              onChange={(v) => setNotifications((n) => ({ ...n, aiInsights: v }))}
              label="AI Insights"
              description="Receive personalized AI recommendations"
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-emerald-500" />
              Integrations
            </CardTitle>
            <CardDescription>Connect your external accounts and services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between rounded-xl border border-border/50 p-3 transition-colors hover:border-border"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{integration.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{integration.name}</p>
                      {integration.connected && (
                        <div className="flex items-center gap-1 text-xs text-emerald-500">
                          <Check className="h-3 w-3" />
                          Connected
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={integration.connected ? 'outline' : 'default'}
                    size="sm"
                    className="text-xs"
                  >
                    {integration.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-blue-500" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Default View</label>
                <div className="flex gap-1 rounded-xl border border-border/50 bg-muted/50 p-1">
                  {['Dashboard', 'Tasks', 'Calendar'].map((view) => (
                    <button
                      key={view}
                      className={cn(
                        'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                        view === 'Dashboard'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Language</label>
                <div className="flex gap-1 rounded-xl border border-border/50 bg-muted/50 p-1">
                  {['English', 'Spanish', 'French'].map((lang) => (
                    <button
                      key={lang}
                      className={cn(
                        'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                        lang === 'English'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Work Hours / Day</label>
                <Input type="number" defaultValue={8} min={1} max={16} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Focus Time (minutes)</label>
                <Input type="number" defaultValue={25} min={5} max={120} step={5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trash2 className="h-4 w-4 text-rose-500" />
              Data Management
            </CardTitle>
            <CardDescription>Export, import, or clear your application data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import Data
              </Button>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
