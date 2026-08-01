"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Calendar, User, MoreHorizontal, Trash2, CheckCircle2, RefreshCw, Plus, ArrowUpDown, Timer, ListChecks, Clock, Lock, Paperclip } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CompleteTaskDialog } from "./complete-task-dialog"
import { TaskDetailModal } from "./task-detail-modal"
import supabase from '@/utils/supabase' // used by fetchTasks for manual refresh

function avatarColor(name: string) {
  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-pink-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function UserAvatar({ name, avatarUrl, size = 'sm' }: { name: string; avatarUrl?: string; size?: 'sm' | 'md' | 'lg' }) {
  let szClass = 'h-8 w-8 text-xs'
  if (size === 'sm') szClass = 'h-6 w-6 text-[10px]'
  if (size === 'lg') szClass = 'h-10 w-10 text-sm'
  
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  
  return (
    <Avatar className={`${szClass} shrink-0 ring-2 ring-white dark:ring-slate-900`}>
      <AvatarImage src={avatarUrl || undefined} alt={name || "User"} referrerPolicy="no-referrer" className="object-cover" />
      <AvatarFallback className={`${avatarColor(name || "")} text-white font-medium`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

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
  completion_note?: string
  subtasks?: { id: string; title: string; completed: boolean }[]
  time_spent_minutes?: number
  blocked_by_id?: string
  task_assignees?: { id: string; user_id: string; user_name: string; status: string }[]
}

interface TaskListProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: any) => void
  onDeleteTask: (taskId: string) => void
  user: any
  isLoading?: boolean
  onStartFocus?: (task: any) => void
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

export function TaskList({ tasks: initialTasks, onUpdateTask, onDeleteTask, user, isLoading = false, onStartFocus }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [attachmentsMap, setAttachmentsMap] = useState<Record<string, any[]>>({})
  const [userMap, setUserMap] = useState<Record<string, {name: string; avatarUrl?: string}>>({})

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      try {
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (res.ok) {
          const json = await res.json()
          const map: Record<string, {name: string; avatarUrl?: string}> = {}
          json.users?.forEach((u: any) => map[u.id] = { name: u.full_name, avatarUrl: u.avatar_url })
          setUserMap(map)
        }
      } catch (err) {
        console.error("Failed to fetch users for task list:", err)
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => { setTasks(initialTasks) }, [initialTasks])

  // Fetch attachments for all visible tasks whenever the task list changes
  useEffect(() => {
    const ids = initialTasks.map(t => t.id)
    if (ids.length === 0) return
    supabase.from('task_attachments').select('id,task_id,file_name,file_type,url').in('task_id', ids)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, any[]> = {}
        data.forEach(att => { if (!map[att.task_id]) map[att.task_id] = []; map[att.task_id].push(att) })
        setAttachmentsMap(map)
      })
  }, [initialTasks])

  // Real-time updates are handled by the parent task-manager-app.tsx.
  // Tasks flow down as props to avoid duplicate Supabase channel subscriptions.

  const fetchTasks = async () => {
    if (!user?.id) return
    setRefreshing(true)
    setError("")
    try {
      const name = user?.name || ''
      let query = supabase
        .from('task')
        .select('*')
        .order('created_at', { ascending: false })

      if (name) {
        query = query.or(`user_id.eq.${user.id},assignee.eq.${name}`)
      } else {
        query = query.eq('user_id', user.id)
      }

      const { data, error: e } = await query
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
    
    if (next === "completed") {
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        setTaskToComplete(task)
        return
      }
    }
    
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: next } : t))
    onUpdateTask(taskId, { status: next })
  }

  const handleConfirmComplete = async (note: string) => {
    if (!taskToComplete) return
    const updates: any = { status: 'completed' }
    if (note) updates.completion_note = note
    
    setTasks(prev => prev.map(t => t.id === taskToComplete.id ? { ...t, status: 'completed', completion_note: note } : t))
    onUpdateTask(taskToComplete.id, updates)
  }

  const handleDelete = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    onDeleteTask(taskId)
  }

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task || !task.subtasks) return
    const newSubtasks = task.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: newSubtasks } : t))
    onUpdateTask(taskId, { subtasks: newSubtasks })
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
                <Card 
                  key={task.id} 
                  onClick={() => setViewingTask(task)}
                  className="group relative bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 dark:bg-slate-900 dark:border-slate-800 cursor-pointer"
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3.5">
                      {/* Status toggle */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleStatus(task.id, task.status); }}
                        className={`mt-0.5 w-5 h-5 flex items-center justify-center shrink-0 transition-all duration-200
                          ${task.status === "completed" ? "bg-emerald-500 text-white" :
                            task.status === "in-progress" ? "border-2 border-blue-500 rounded-full" : "border-2 border-slate-300 rounded-full hover:border-blue-400"}`}>
                        {task.status === "completed" ? (
                          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><CheckCircle2 className="h-3.5 w-3.5 text-white" /></div>
                        ) : null}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                          <h3 className={`text-[15px] font-medium tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5 ${task.status === "completed" ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>
                            {task.blocked_by_id && tasks.find(t => t.id === task.blocked_by_id && t.status !== 'completed') && (
                              <Lock className="h-3.5 w-3.5 text-red-500" />
                            )}
                            {task.title}
                          </h3>
                          {task.priority !== "medium" && (
                            <Badge variant="outline" className={`text-[10px] uppercase tracking-wider px-1.5 py-0 border-transparent bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 ${task.priority === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' : ''}`}>{task.priority}</Badge>
                          )}
                          {task.category && (
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider px-1.5 py-0 border-slate-200 text-slate-500 bg-white dark:bg-transparent dark:border-slate-700 dark:text-slate-400">{task.category}</Badge>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-1 pr-8">{task.description}</p>
                        )}

                        {task.status === 'completed' && task.completion_note && (
                          <div className="mt-3 mb-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-lg text-[13px] text-emerald-800 dark:text-emerald-400">
                            <strong className="font-semibold">Completion Note:</strong> {task.completion_note}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          {task.task_assignees && task.task_assignees.length > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="flex gap-1.5 items-center">
                                {task.task_assignees.map(a => (
                                  <span 
                                    key={a.id} 
                                    className={`px-1.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                                      a.status === 'accepted' ? 'text-slate-600 bg-slate-100' :
                                      a.status === 'pending' ? 'text-blue-600 bg-blue-50' : 
                                      'text-red-500 bg-red-50 line-through opacity-70'
                                    }`}
                                    title={a.status}
                                  >
                                    <UserAvatar name={a.user_name} avatarUrl={userMap[a.user_id]?.avatarUrl} />
                                    {a.user_name}
                                  </span>
                                ))}
                              </span>
                            </span>
                          )}
                          {task.due_date && (
                            <span className={`flex items-center gap-1 ${overdue ? "text-red-500 font-medium" : ""}`}>
                              <Calendar className="h-3 w-3" />
                              {fmt(task.due_date)}
                              {overdue && " · Overdue"}
                            </span>
                          )}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <span className="flex items-center gap-1 text-blue-500">
                              <ListChecks className="h-3 w-3" />
                              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                            </span>
                          )}
                          {task.time_spent_minutes ? (
                            <span className="flex items-center gap-1 text-amber-500">
                              <Clock className="h-3 w-3" />
                              {task.time_spent_minutes}m
                            </span>
                          ) : null}
                          {attachmentsMap[task.id]?.length > 0 && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Paperclip className="h-3 w-3" />
                              {attachmentsMap[task.id].length} {attachmentsMap[task.id].length === 1 ? 'file' : 'files'}
                            </span>
                          )}
                        </div>
                        
                        {/* Attachment thumbnails */}
                        {attachmentsMap[task.id]?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                            {attachmentsMap[task.id].map(att => (
                              <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                className="group relative h-14 w-14 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0 hover:border-blue-300 transition-colors">
                                {att.file_type?.startsWith('image/') ? (
                                  <img src={att.url} alt={att.file_name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full flex-col items-center justify-center gap-0.5 p-1">
                                    <Paperclip className="h-4 w-4 text-slate-400" />
                                    <p className="text-[8px] text-slate-500 text-center leading-tight line-clamp-2">{att.file_name}</p>
                                  </div>
                                )}
                              </a>
                            ))}
                          </div>
                        )}

                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              {task.subtasks.map(st => (
                                <button
                                  key={st.id}
                                  onClick={(e) => { e.stopPropagation(); toggleSubtask(task.id, st.id) }}
                                  className="w-full flex items-start text-left gap-2 p-1.5 hover:bg-slate-50 rounded group transition-colors"
                                >
                                  <div className={`mt-0.5 shrink-0 flex items-center justify-center w-3.5 h-3.5 rounded border transition-colors ${st.completed ? 'bg-blue-500 border-blue-500' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>
                                    {st.completed && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                                  </div>
                                  <span className={`text-xs ${st.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                    {st.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onStartFocus && task.status !== 'completed' && (
                            <DropdownMenuItem onClick={() => onStartFocus(task)} className="gap-2 text-blue-600 focus:text-blue-700">
                              <Timer className="h-3.5 w-3.5" /> Start Focus Mode
                            </DropdownMenuItem>
                          )}
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

      <CompleteTaskDialog
        isOpen={!!taskToComplete}
        onClose={() => setTaskToComplete(null)}
        onConfirm={handleConfirmComplete}
        taskTitle={taskToComplete?.title || ""}
      />

      <TaskDetailModal
        isOpen={!!viewingTask}
        task={viewingTask}
        onClose={() => setViewingTask(null)}
        onComplete={(id) => {
          const t = tasks.find(x => x.id === id)
          if (t) {
            setViewingTask(null)
            setTaskToComplete(t)
          }
        }}
        onUpdateTask={onUpdateTask}
        currentUser={user}
      />
    </div>
  )
}
