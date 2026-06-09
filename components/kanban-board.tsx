"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, User, Calendar, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: string
  assignee: string
  category: string
}

interface KanbanBoardProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: any) => void
}

const columns = [
  { id: "todo",        title: "To Do",       count_bg: "bg-slate-100 text-slate-600",  header_bg: "bg-slate-50",  border: "border-slate-200" },
  { id: "in-progress", title: "In Progress", count_bg: "bg-blue-100 text-blue-700",    header_bg: "bg-blue-50",   border: "border-blue-200"  },
  { id: "completed",   title: "Done",        count_bg: "bg-emerald-100 text-emerald-700", header_bg: "bg-emerald-50", border: "border-emerald-200" },
]

const priorityConfig: Record<string, string> = {
  high:   "bg-red-50 text-red-600 border-red-100",
  medium: "bg-amber-50 text-amber-600 border-amber-100",
  low:    "bg-slate-50 text-slate-500 border-slate-100",
}

export function KanbanBoard({ tasks, onUpdateTask }: KanbanBoardProps) {
  const byStatus = (s: string) => tasks.filter(t => t.status === s)

  const move = (taskId: string, status: string) => onUpdateTask(taskId, { status })

  const onDragStart = (e: React.DragEvent, id: string) => e.dataTransfer.setData("text/plain", id)
  const onDragOver  = (e: React.DragEvent) => e.preventDefault()
  const onDrop      = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    move(e.dataTransfer.getData("text/plain"), status)
  }

  const fmt = (s: string) => {
    if (!s) return null
    try { return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" }) }
    catch { return s }
  }

  return (
    <div className="p-4 sm:p-6 overflow-y-auto max-h-screen">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Kanban Board</h1>
            <p className="text-sm text-slate-400 mt-0.5">{tasks.length} total tasks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {columns.map(col => {
            const colTasks = byStatus(col.id)
            return (
              <div key={col.id} className="flex flex-col">
                {/* Column header */}
                <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl border-x border-t ${col.border} ${col.header_bg}`}>
                  <span className="text-sm font-semibold text-slate-700">{col.title}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.count_bg}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Drop zone */}
                <div
                  className={`flex-1 min-h-[500px] border-x border-b ${col.border} rounded-b-xl p-3 space-y-2 bg-white`}
                  onDragOver={onDragOver}
                  onDrop={e => onDrop(e, col.id)}
                >
                  {colTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={e => onDragStart(e, task.id)}
                      className="bg-white border border-slate-100 rounded-lg p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm font-medium text-slate-800 leading-snug flex-1">{task.title}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-slate-300 hover:text-slate-600">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => move(task.id, "todo")}>Move → To Do</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => move(task.id, "in-progress")}>Move → In Progress</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => move(task.id, "completed")}>Move → Done</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mb-2">{task.description}</p>
                      )}

                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Badge className={`text-[10px] border px-1.5 py-0 ${priorityConfig[task.priority] ?? priorityConfig["medium"]}`}>
                          {task.priority}
                        </Badge>
                        {task.category && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-slate-400 border-slate-100">
                            {task.category}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        {task.assignee && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" /> {task.assignee}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {fmt(task.due_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-300">
                      <Plus className="h-6 w-6 mb-1" />
                      <p className="text-xs">Drop tasks here</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
