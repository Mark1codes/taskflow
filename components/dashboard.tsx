"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, TrendingUp, AlertTriangle, Calendar, ArrowUpRight } from "lucide-react"

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

  const fmt = (s: string) => {
    try { return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" }) }
    catch { return s }
  }

  const kpis = [
    { label: "Total Tasks",      value: total,      sub: `${todo} to do`,          icon: CheckCircle2,   accent: "text-slate-600",  bg: "bg-slate-50" },
    { label: "In Progress",      value: inProgress, sub: "Active now",              icon: Clock,          accent: "text-blue-600",   bg: "bg-blue-50"  },
    { label: "Completion Rate",  value: `${rate}%`, sub: `${completed} completed`,  icon: TrendingUp,     accent: "text-emerald-600",bg: "bg-emerald-50"},
    { label: "Overdue",          value: overdue,    sub: "Need attention",          icon: AlertTriangle,  accent: "text-red-600",    bg: "bg-red-50"   },
  ]

  return (
    <div className="p-4 sm:p-6 overflow-y-auto max-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
            {total} total tasks
          </Badge>
        </div>

        {/* KPI row */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {kpis.map((k, i) => {
            const Icon = k.icon
            return (
              <Card key={i} className="border border-slate-100 card-hover">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-500">{k.label}</span>
                    <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${k.accent}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{k.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{k.sub}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Completion bar */}
        <Card className="border border-slate-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Overall progress</span>
              <span className="text-sm font-bold text-slate-900">{rate}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700"
                style={{ width: `${rate}%` }}
              />
            </div>
            <div className="flex gap-4 mt-4">
              {[
                { label: "To Do", count: todo, color: "bg-slate-400" },
                { label: "In Progress", count: inProgress, color: "bg-blue-500" },
                { label: "Completed", count: completed, color: "bg-emerald-500" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-xs text-slate-500">{s.label} <strong className="text-slate-700">{s.count}</strong></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Upcoming */}
          <Card className="border border-slate-100">
            <CardHeader className="pb-3 border-b border-slate-50">
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
          <Card className="border border-slate-100">
            <CardHeader className="pb-3 border-b border-slate-50">
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