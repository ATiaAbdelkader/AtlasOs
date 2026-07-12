import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Target, CheckSquare, Calendar, FolderKanban,
  FlaskConical, BookOpen, Briefcase, Database, BookMarked,
  BarChart3, Settings, Sparkles, Brain, Menu, X,
  PenTool, LineChart, Heart, LogOut, GraduationCap, Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'
import { useAuth } from '@/lib/auth'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Target, label: 'Mission Control', path: '/missions' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: FlaskConical, label: 'Research', path: '/research' },
  { icon: PenTool, label: 'Writing', path: '/writing' },
  { icon: Briefcase, label: 'Business', path: '/business' },
  { icon: Database, label: 'Knowledge Vault', path: '/knowledge' },
  { icon: BookMarked, label: 'Journal', path: '/journal' },
  { icon: Heart, label: 'Habits', path: '/habits' },
  { icon: GraduationCap, label: 'Career Timeline', path: '/career' },
  { icon: Layers, label: 'Skills Radar', path: '/skills' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Sparkles, label: 'AI Assistant', path: '/ai' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function Sidebar() {
  const location = useLocation()
  const { sidebarOpen, toggleSidebar } = useAppStore()
  const { user, signOut } = useAuth()

  const userInitials = user?.email
    ? user.email.charAt(0).toUpperCase() + (user.email.split('@')[0]?.charAt(1)?.toUpperCase() || '')
    : '?'

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-background/80 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex h-16 items-center justify-between px-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight">AtlasOS</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Separator />

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                        />
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </nav>

            <Separator />

            <div className="p-4">
              <div className="mb-3 flex items-center gap-3 rounded-xl p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-violet-500/10 text-violet-500 text-xs">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <button
                  onClick={signOut}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
              <LevelBadge size="sm" />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {!sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 h-10 w-10 rounded-xl border border-border/50 bg-background/80 backdrop-blur-xl"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </>
  )
}
