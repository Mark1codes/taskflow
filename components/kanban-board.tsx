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
  dueDate: string
  assignee: string
  category: string
}

interface KanbanBoardProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: any) => void
}

const columns = [
  { id: "todo", title: "To Do", color: "bg-gray-100" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-100" },
  { id: "completed", title: "Completed", color: "bg-green-100" },
]

export function KanbanBoard({ tasks, onUpdateTask }: KanbanBoardProps) {
  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const moveTask = (taskId: string, newStatus: string) => {
    onUpdateTask(taskId, { status: newStatus })
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("text/plain")
    moveTask(taskId, status)
  }

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto max-h-screen">
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kanban Board</h1>
          <Badge variant="outline" className="text-xs sm:text-sm w-fit">
            {tasks.length} total tasks
          </Badge>
        </div>

        {/* Mobile: Stacked columns, Desktop: Side by side */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6 lg:h-full">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id)

            return (
              <div key={column.id} className="flex flex-col">
                <Card className="flex-1">
                  <CardHeader className={`${column.color} rounded-t-lg`}>
                    <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                      <span>{column.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {columnTasks.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent
                    className="p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-[300px] lg:min-h-[500px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    {columnTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="cursor-move hover:shadow-md transition-shadow touch-manipulation"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-sm leading-tight flex-1">{task.title}</h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => moveTask(task.id, "todo")}>
                                    Move to To Do
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => moveTask(task.id, "in-progress")}>
                                    Move to In Progress
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => moveTask(task.id, "completed")}>
                                    Move to Completed
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {task.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <Badge variant={getPriorityVariant(task.priority)} className="text-xs w-fit">
                                {task.priority}
                              </Badge>
                              {task.category && (
                                <Badge variant="outline" className="text-xs w-fit">
                                  {task.category}
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs text-muted-foreground">
                              {task.assignee && (
                                <span className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span className="truncate">{task.assignee}</span>
                                </span>
                              )}
                              {task.dueDate && (
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{task.dueDate}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {columnTasks.length === 0 && (
                      <div className="flex items-center justify-center h-24 sm:h-32 text-muted-foreground">
                        <div className="text-center">
                          <Plus className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
