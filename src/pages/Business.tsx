import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Users,
  FileText,
  DollarSign,
  Mail,
  Building2,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Receipt,
  TrendingUp,
  CreditCard,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatDate } from '@/lib/utils'
import { businessClients, invoices } from '@/data/mockData'
import type { BusinessClient, Invoice } from '@/types'

type TabValue = 'crm' | 'invoices' | 'overview'

const clientStatusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10' },
  inactive: { label: 'Inactive', className: 'border-slate-500/20 text-slate-500 bg-slate-500/10' },
  lead: { label: 'Lead', className: 'border-blue-500/20 text-blue-500 bg-blue-500/10' },
}

const clientTypeConfig: Record<string, { label: string; className: string }> = {
  client: { label: 'Client', className: 'border-violet-500/20 text-violet-500 bg-violet-500/10' },
  partner: { label: 'Partner', className: 'border-amber-500/20 text-amber-500 bg-amber-500/10' },
  lead: { label: 'Lead', className: 'border-blue-500/20 text-blue-500 bg-blue-500/10' },
}

const invoiceStatusConfig: Record<string, { label: string; className: string; icon: typeof FileText }> = {
  draft: { label: 'Draft', className: 'border-slate-500/20 text-slate-500 bg-slate-500/10', icon: FileText },
  sent: { label: 'Sent', className: 'border-blue-500/20 text-blue-500 bg-blue-500/10', icon: Send },
  paid: { label: 'Paid', className: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10', icon: CheckCircle2 },
  overdue: { label: 'Overdue', className: 'border-red-500/20 text-red-500 bg-red-500/10', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', className: 'border-slate-500/20 text-slate-500 bg-slate-500/10', icon: X },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
} as const

function getClientName(clientId: string): string {
  return businessClients.find((c) => c.id === clientId)?.name ?? 'Unknown Client'
}

export default function Business() {
  const [activeTab, setActiveTab] = useState<TabValue>('crm')

  const stats = useMemo(() => {
    const totalClients = businessClients.length
    const activeClients = businessClients.filter((c) => c.status === 'active').length
    const totalRevenue = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0)
    const pendingInvoices = invoices.filter((inv) => inv.status === 'sent' || inv.status === 'overdue').length
    return { totalClients, activeClients, totalRevenue, pendingInvoices }
  }, [])

  const pendingRevenue = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amount, 0)
  }, [])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business Workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage clients, invoices, and revenue
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats.totalClients}</p>
              <p className="text-xs text-muted-foreground">Total Clients</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats.activeClients}</p>
              <p className="text-xs text-muted-foreground">Active Clients</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats.pendingInvoices}</p>
              <p className="text-xs text-muted-foreground">Pending Invoices</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList>
            <TabsTrigger value="crm" className="gap-1.5">
              <Users className="h-4 w-4" />
              CRM
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1.5">
              <Receipt className="h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crm" className="mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {businessClients.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <Users className="mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">No clients yet</p>
                </div>
              ) : (
                businessClients.map((client) => {
                  const status = clientStatusConfig[client.status]!
                  const type = clientTypeConfig[client.type]!
                  return (
                    <motion.div
                      key={client.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="group rounded-2xl border border-border/50 bg-card p-5 shadow-sm backdrop-blur-xl transition-all hover:border-border hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="flex gap-1.5">
                          <Badge variant="outline" className={cn('text-[10px]', status.className)}>
                            {status.label}
                          </Badge>
                          <Badge variant="outline" className={cn('text-[10px]', type.className)}>
                            {type.label}
                          </Badge>
                        </div>
                      </div>

                      <h3 className="mt-3 text-sm font-semibold">{client.name}</h3>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        {client.company && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span>{client.company}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>

                      {client.notes && (
                        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                          {client.notes}
                        </p>
                      )}

                      {client.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {client.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="mt-4">
            <Card>
              <ScrollArea className="max-h-[500px]">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-6 gap-4 border-b border-border px-5 py-3 text-xs font-medium text-muted-foreground">
                    <span>Invoice</span>
                    <span>Client</span>
                    <span>Amount</span>
                    <span>Status</span>
                    <span>Due Date</span>
                    <span>Items</span>
                  </div>
                  {invoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Receipt className="mb-3 h-12 w-12 text-muted-foreground/40" />
                      <p className="text-sm font-medium text-muted-foreground">No invoices yet</p>
                    </div>
                  ) : (
                    invoices.map((inv) => {
                      const invStatus = invoiceStatusConfig[inv.status]!
                      const StatusIcon = invStatus.icon
                      return (
                        <motion.div
                          key={inv.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="grid grid-cols-6 gap-4 border-b border-border/50 px-5 py-3 text-sm transition-colors hover:bg-muted/30 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{inv.number}</span>
                          </div>
                          <span className="truncate text-muted-foreground">
                            {getClientName(inv.clientId)}
                          </span>
                          <span className="font-medium tabular-nums">
                            ${inv.amount.toLocaleString()}
                          </span>
                          <div>
                            <Badge
                              variant="outline"
                              className={cn('text-[10px] gap-1', invStatus.className)}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {invStatus.label}
                            </Badge>
                          </div>
                          <span className="text-muted-foreground">
                            {formatDate(inv.dueDate)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {inv.items.length} item{inv.items.length !== 1 ? 's' : ''}
                          </span>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <h2 className="text-sm font-semibold">Revenue Overview</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Collected Revenue</p>
                          <p className="text-lg font-bold tabular-nums">
                            ${stats.totalRevenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pending Revenue</p>
                          <p className="text-lg font-bold tabular-nums">
                            ${pendingRevenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Invoiced</p>
                          <p className="text-lg font-bold tabular-nums">
                            ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-violet-500" />
                    <h2 className="text-sm font-semibold">Client Summary</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Active</p>
                          <p className="text-lg font-bold">{stats.activeClients}</p>
                        </div>
                      </div>
                      <Badge variant="success" className="text-[10px]">
                        {stats.totalClients > 0
                          ? Math.round((stats.activeClients / stats.totalClients) * 100)
                          : 0}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500/10 text-slate-500">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Inactive</p>
                          <p className="text-lg font-bold">
                            {businessClients.filter((c) => c.status === 'inactive').length}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Leads</p>
                          <p className="text-lg font-bold">
                            {businessClients.filter((c) => c.type === 'lead').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
