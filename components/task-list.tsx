"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Calendar, User, MoreHorizontal, Trash2, CheckCircle2, RefreshCw, Plus, ArrowUpDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import supabase from '../utils/supabase' // used by fetchTasks for manual refresh

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  due_date: string
  assignee?: string
  category: string
  user_id: string
  created_at: string
  updated_at: string
}

interface TaskListProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: any) => void
  onDeleteTask: (taskId: string) => void
  user: any
  isLoading?: boolean
}

const priorityConfig: Record<string, { label: string; class: string }> = {
  high:   { label: "High",   class: "bg-red-50 text-red-600 border-red-100" },
  medium: { label: "Medium", class: "bg-amber-50 text-amber-600 border-amber-100" },
  low:    { label: "Low",    class: "bg-slate-50 text-slate-500 border-slate-100" },
}

const statusConfig: Record<string, { label: string; border: string; badge: string }> = {
  "todo":        { label: "To Do",       border: "border-l-slate-400",   badge: "bg-slate-50 text-slate-600 border-slate-200" },
  "in-progress": { label: "In Progress", border: "border-l-blue-500",    badge: "bg-blue-50 text-blue-600 border-blue-200" },
  "completed":   { label: "Completed",   border: "border-l-emerald-500", badge: "bg-emerald-50 text-emerald-600 border-emerald-200" },
}

const statusOrder = ["todo", "in-progress", "completed"]

export function TaskList({ tasks: initialTasks, onUpdateTask, onDeleteTask, user, isLoading = false }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => { setTasks(initialTasks) }, [initialTasks])

  // Real-time updates are handled by the parent task-manager-app.tsx.
  // Tasks flow down as props to avoid duplicate Supabase channel subscriptions.

  const fetchTasks = async () => {
    if (!user?.id) return
    setRefreshing(true)
    setError("")
    try {
      const { data, error: e } = await supabase
        .from('task').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (e) setError("Failed to fetch tasks: " + e.message)
      else setTasks(data || [])
    } catch { setError("An unexpected error occurred") }
    finally { setRefreshing(false) }
  }

  const filtered = tasks.filter(t => {
    const q = searchTerm.toLowerCase()
    const matchSearch = t.title.toLowerCase().includes(q)
      || (t.description && t.description.toLowerCase().includes(q))
      || (t.category && t.category.toLowerCase().includes(q))
      || (t.assignee && t.assignee.toLowerCase().includes(q))
    return matchSearch
      && (statusFilter === "all" || t.status === statusFilter)
      && (priorityFilter === "all" || t.priority === priorityFilter)
  })

  const toggleStatus = (taskId: string, current: string) => {
    const next = statusOrder[(statusOrder.indexOf(current) + 1) % statusOrder.length]
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: next } : t))
    onUpdateTask(taskId, { status: next })
  }

  const handleDelete = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    onDeleteTask(taskId)
  }

  const fmt = (s: string) => {
    if (!s) return null
    try { return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }
    catch { return s }
  }

  const isOverdue = (d: string) => {
    if (!d) return false
    const date = new Date(d)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f7f9fc] dark:bg-slate-950">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Work queue</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">Task list</h1>
            <p className="mt-1 text-sm text-slate-500">{filtered.length} of {tasks.length} tasks in your workspace.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchTasks} disabled={refreshing || isLoading}
            className="h-9 gap-1.5 border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {/* Filters */}
        <Card className="border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)] dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search tasks…" value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 border-slate-200 h-9 text-sm" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40 border-slate-200 h-9 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-40 border-slate-200 h-9 text-sm">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || statusFilter !== "all" || priorityFilter !== "all") && (
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 h-9"
                  onClick={() => { setSearchTerm(""); setStatusFilter("all"); setPriorityFilter("all") }}>
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task cards */}
        <div className="space-y-2">
          {isLoading && tasks.length === 0 ? (
            <Card className="border border-slate-100">
              <CardContent className="p-12 text-center">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-400">Loading tasks…</p>
              </CardContent>
            </Card>
          ) : filtered.length > 0 ? (
            filtered.map(task => {
              const sc = statusConfig[task.status] ?? statusConfig["todo"]
              const pc = priorityConfig[task.priority] ?? priorityConfig["medium"]
              const overdue = isOverdue(task.due_date) && task.status !== "completed"
              return (
                <Card key={task.id} className={`border-slate-200/80 border-l-4 ${sc.border} bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900`}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      {/* Status toggle */}
                      <button onClick={() => toggleStatus(task.id, task.status)}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                          ${task.status === "completed" ? "bg-emerald-500 border-emerald-500" :
                            task.status === "in-progress" ? "border-blue-500" : "border-slate-300 hover:border-slate-400"}`}>
                        {task.status === "completed" && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className={`text-sm font-semibold text-slate-900 ${task.status === "completed" ? "line-through text-slate-400" : ""}`}>
                            {task.title}
                          </h3>
                          <Badge className={`text-xs border ${pc.class}`}>{pc.label}</Badge>
                          <Badge className={`text-xs border ${sc.badge}`}>{sc.label}</Badge>
                          {task.category && (
                            <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">{task.category}</Badge>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          {task.assignee && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" /> {task.assignee}
                            </span>
                          )}
                          {task.due_date && (
                            <span className={`flex items-center gap-1 ${overdue ? "text-red-500 font-medium" : ""}`}>
                              <Calendar className="h-3 w-3" />
                              {fmt(task.due_date)}
                              {overdue && " · Overdue"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleStatus(task.id, task.status)} className="gap-2">
                            <ArrowUpDown className="h-3.5 w-3.5" /> Cycle status
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(task.id)} className="gap-2 text-red-500 focus:text-red-600">
                            <Trash2 className="h-3.5 w-3.5" /> Delete task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card className="border border-slate-100">
              <CardContent className="p-12 text-center">
                <Plus className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                <p className="text-sm font-medium text-slate-600">
                  {tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {tasks.length === 0 ? "Create your first task to get started" : "Try adjusting your search or filters"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
