import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Moon, Sun, Bell, Menu, LogOut } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/missions': 'Mission Control',
  '/tasks': 'Tasks',
  '/calendar': 'Calendar',
  '/projects': 'Projects',
  '/research': 'Research Workspace',
  '/writing': 'Writing Center',
  '/business': 'Business Workspace',
  '/knowledge': 'Knowledge Vault',
  '/journal': 'Daily Journal',
  '/habits': 'Habit Tracker',
  '/analytics': 'Analytics',
  '/ai': 'AI Assistant',
  '/settings': 'Settings',
}

export function Header() {
  const location = useLocation()
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useAppStore()
  const { user, signOut } = useAuth()
  const title = pageTitles[location.pathname] || 'Dashboard'

  const userInitials = user?.email
    ? user.email.charAt(0).toUpperCase() + (user.email.split('@')[0]?.charAt(1)?.toUpperCase() || '')
    : '?'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
      {sidebarOpen ? (
        <div className="w-0 lg:w-[60px]" />
      ) : (
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-10 w-10 rounded-xl">
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <motion.h1
        key={title}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold"
      >
        {title}
      </motion.h1>

      <div className="flex-1" />

      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search anything..."
          className="h-9 w-64 rounded-xl border-border/50 bg-accent/50 pl-9 text-sm"
        />
      </div>

      <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl">
        <Bell className="h-4.5 w-4.5" />
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          3
        </span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-9 w-9 rounded-xl"
      >
        {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
      </Button>

      <div className="flex items-center gap-1">
        <Link
          to="/settings"
          className="rounded-lg p-1 text-muted-foreground hover:bg-accent transition-colors"
          title="Settings"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-violet-500/10 text-violet-500 text-xs">{userInitials}</AvatarFallback>
          </Avatar>
        </Link>
        <button
          onClick={signOut}
          className="rounded-lg p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
