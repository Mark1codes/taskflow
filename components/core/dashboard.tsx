"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, TrendingUp, AlertTriangle, Calendar, ArrowUpRight, ArrowRight, Target, Sparkles, Activity } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Task {
  id: string
  title: string
  status: string
  priority: string
  due_date: string
  assignee?: string
  category: string
  created_at: string
  updated_at: string
  user_id: string
  time_spent_minutes?: number
}

interface DashboardProps {
  tasks: Task[]
  isLoading?: boolean
}

const priorityConfig: Record<string, { label: string; class: string }> = {
  high:   { label: "High",   class: "bg-red-50 text-red-600 border-red-100" },
  medium: { label: "Medium", class: "bg-amber-50 text-amber-600 border-amber-100" },
  low:    { label: "Low",    class: "bg-slate-50 text-slate-500 border-slate-100" },
}

const statusConfig: Record<string, { label: string; dot: string }> = {
  completed:   { label: "Completed",   dot: "bg-emerald-500" },
  "in-progress": { label: "In Progress", dot: "bg-blue-500" },
  todo:        { label: "To Do",       dot: "bg-slate-400" },
}

function SkeletonCard() {
  return (
    <Card className="border border-slate-100">
      <CardContent className="p-5 space-y-3">
        <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
        <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
      </CardContent>
    </Card>
  )
}

export function Dashboard({ tasks, isLoading = false }: DashboardProps) {
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="h-7 w-36 bg-slate-100 rounded animate-pulse" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="border border-slate-100">
              <CardContent className="p-5 space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-10 bg-slate-100 rounded animate-pulse" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const total = tasks.length
  const completed  = tasks.filter(t => t.status === "completed").length
  const inProgress = tasks.filter(t => t.status === "in-progress").length
  const todo       = tasks.filter(t => t.status === "todo").length
  const rate       = total > 0 ? Math.round((completed / total) * 100) : 0

  const now = new Date()
  const overdue = tasks.filter(t => {
    if (!t.due_date || t.status === "completed") return false
    return new Date(t.due_date) < now
  }).length

  const upcoming = tasks.filter(t => {
    if (!t.due_date || t.status === "completed") return false
    const d = new Date(t.due_date)
    const week = new Date(now.getTime() + 7 * 86400000)
    return d >= now && d <= week
  }).slice(0, 5)

  const recent = tasks.slice(0, 6)
  const focusTasks = tasks.filter(t => t.status === "in-progress").slice(0, 3)

  const fmt = (s: string) => {
    try { return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" }) }
    catch { return s }
  }

  const totalTimeSpent = tasks.reduce((acc, t) => acc + (t.time_spent_minutes || 0), 0)
  const totalTimeHours = (totalTimeSpent / 60).toFixed(1)

  const kpis = [
    { label: "Total Tasks",      value: total,      sub: `${todo} to do`,          icon: CheckCircle2,   accent: "text-slate-600",  bg: "bg-slate-50" },
    { label: "In Progress",      value: inProgress, sub: "Active now",              icon: Target,         accent: "text-blue-600",   bg: "bg-blue-50"  },
    { label: "Time Tracked",     value: `${totalTimeHours}h`, sub: "Total focus time",  icon: Clock,          accent: "text-indigo-600", bg: "bg-indigo-50"},
    { label: "Overdue",          value: overdue,    sub: "Need attention",          icon: AlertTriangle,  accent: "text-red-600",    bg: "bg-red-50"   },
  ]

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    
    const dateStr = d.toISOString().split('T')[0]
    const shortDayName = d.toLocaleDateString("en-US", { weekday: "short" })
    
    const newTasks = tasks.filter(t => t.created_at && t.created_at.startsWith(dateStr)).length
    // Fallback to created_at if updated_at is missing for some reason
    const completedTasks = tasks.filter(t => t.status === "completed" && ((t.updated_at && t.updated_at.startsWith(dateStr)) || (t.created_at && t.created_at.startsWith(dateStr)))).length

    return {
      date: shortDayName,
      completed: completedTasks,
      new: newTasks
    }
  })

  const chartConfig = {
    completed: {
      label: "Completed Tasks",
      color: "#2563EB",
    },
    new: {
      label: "New Tasks",
      color: "#94A3B8",
    },
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f7f9fc] dark:bg-slate-950">
      <div className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Workspace overview</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">Your workspace at a glance</h1>
            <p className="mt-1 text-sm text-slate-500">A clear view of what is moving, what is next, and what needs attention.</p>
          </div>
          <div className="flex items-center gap-3"><span className="hidden text-xs text-slate-400 sm:block">{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span><Badge variant="outline" className="h-8 border-slate-200 bg-white px-3 text-xs font-medium text-slate-600">{total} total tasks</Badge></div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {kpis.map((k, i) => {
            const Icon = k.icon
            return (
              <Card key={i} className="border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-medium text-slate-500">{k.label}</span>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${k.bg}`}>
                      <Icon className={`h-4 w-4 ${k.accent}`} />
                    </div>
                  </div>
                  <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">{k.value}</div>
                  <div className="mt-3 text-xs text-slate-400">{k.sub}</div>
                  <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${i === 0 ? "w-3/4 bg-slate-400" : i === 1 ? "w-1/2 bg-blue-500" : i === 2 ? "bg-emerald-500" : "w-1/4 bg-red-400"}`} style={i === 2 ? { width: `${rate}%` } : undefined} /></div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Analytics Graph */}
        <Card className="border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)] dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 px-5 py-4 sm:px-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Productivity Trend
            </CardTitle>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal hover:bg-slate-100">Last 7 days</Badge>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pb-2">
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-new)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-new)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={12} fontSize={12} tickFormatter={(value) => value.slice(0, 3)} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} tickMargin={12} fontSize={12} stroke="#94a3b8" />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="new" stroke="var(--color-new)" fillOpacity={1} fill="url(#fillNew)" strokeWidth={2} activeDot={{ r: 4, fill: "var(--color-new)", stroke: "#fff", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="completed" stroke="var(--color-completed)" fillOpacity={1} fill="url(#fillCompleted)" strokeWidth={2} activeDot={{ r: 4, fill: "var(--color-completed)", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Completion bar */}
        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <Card className="border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)] dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div><span className="flex items-center gap-2 text-sm font-semibold text-slate-950"><Target className="h-4 w-4 text-blue-600" /> Delivery health</span><p className="mt-1 text-xs text-slate-400">Your current workload at a glance</p></div>
              <span className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">{rate}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700"
                style={{ width: `${rate}%` }}
              />
            </div>
            <div className="mt-6 grid grid-cols-3 divide-x divide-slate-100">
              {[
                { label: "To Do", count: todo, color: "bg-slate-400" },
                { label: "In Progress", count: inProgress, color: "bg-blue-500" },
                { label: "Completed", count: completed, color: "bg-emerald-500" },
              ].map(s => (
                <div key={s.label} className="pl-4 first:pl-0">
                  <div className="text-xl font-semibold text-slate-950">{s.count}</div>
                  <span className="mt-1 block text-xs text-slate-500">{s.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-blue-100 bg-gradient-to-br from-blue-50/50 to-white text-slate-900 shadow-sm"><div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl" /><CardContent className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6"><div><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-medium text-blue-600"><Sparkles className="h-4 w-4" /> Focus signal</span><span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] text-blue-600">Live</span></div><h2 className="mt-8 max-w-xs text-xl font-semibold leading-tight tracking-[-0.03em]">{focusTasks.length > 0 ? "Keep the momentum going." : "Your next move starts here."}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{focusTasks.length > 0 ? `${focusTasks.length} active ${focusTasks.length === 1 ? "task" : "tasks"} need your attention.` : "Create a task to give your day a clear direction."}</p></div><div className="mt-8 flex items-start flex-col border-t border-slate-100 pt-4 text-xs text-slate-500"><span className="truncate pr-3 font-medium text-slate-700">{focusTasks.length > 0 ? focusTasks[0].title : "No active tasks"}</span></div></CardContent></Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Upcoming */}
          <Card className="border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
            <CardHeader className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                Due this week
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {upcoming.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {upcoming.map(task => (
                    <div key={task.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Due {fmt(task.due_date)}</p>
                      </div>
                      <Badge className={`text-xs border ml-3 shrink-0 ${priorityConfig[task.priority]?.class ?? "bg-slate-50 text-slate-500 border-slate-100"}`}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-8 text-center text-sm text-slate-400">No tasks due this week 🎉</div>
              )}
            </CardContent>
          </Card>

          {/* Recent tasks */}
          <Card className="border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
            <CardHeader className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
                Recent tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recent.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {recent.map(task => {
                    const sc = statusConfig[task.status] ?? { label: task.status, dot: "bg-slate-400" }
                    return (
                      <div key={task.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                          <p className="text-xs text-slate-400">{sc.label} · {task.category}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="px-5 py-8 text-center text-sm text-slate-400">No tasks yet — create your first one!</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
