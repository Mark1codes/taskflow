
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon, X, User, Calendar as CalendarDayIcon, Clock, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  due_date: string
  assignee?: string
  category?: string
  created_at: string
  updated_at: string
}

interface CalendarViewProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: any) => void
}

export function Calendar({ tasks, onUpdateTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading (replace with actual data fetching if needed)
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return tasks.filter((task) => {
      if (!task.due_date) return false
      const taskDate = new Date(task.due_date).toISOString().split("T")[0]
      return taskDate === dateString
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(clickedDate)
    setIsPreviewOpen(true)
  }

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const statusOrder = ["todo", "in-progress", "completed"]
    const currentIndex = statusOrder.indexOf(currentStatus)
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
    
    onUpdateTask(taskId, { status: nextStatus })
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDayOfMonth = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const days = []

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "todo":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in-progress":
        return "In Progress"
      case "todo":
        return "To Do"
      case "completed":
        return "Completed"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const isOverdue = (dueDateString: string) => {
    if (!dueDateString) return false
    const dueDate = new Date(dueDateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dueDate < today
  }

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []
  const selectedDateString = selectedDate ? selectedDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : ""

  // Task Preview Component
  const TaskPreview = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{selectedDateString}</h3>
          <p className="text-sm text-muted-foreground">
            {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPreviewOpen(false)}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {selectedDateTasks.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {selectedDateTasks.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${getStatusColor(task.status)}`}></div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h4 className="font-medium text-sm break-words">{task.title}</h4>
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground break-words">{task.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center space-x-1">
                          <CalendarDayIcon className="h-3 w-3" />
                          <span className={isOverdue(task.due_date) ? 'text-red-500' : ''}>
                            {formatDate(task.due_date)}
                            {isOverdue(task.due_date) && ' (Overdue)'}
                          </span>
                        </span>
                        
                        {task.assignee && (
                          <span className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{task.assignee}</span>
                          </span>
                        )}
                        
                        {task.category && (
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    className="h-6 w-6 shrink-0"
                    title="Toggle status"
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {getStatusLabel(task.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Created: {formatDate(task.created_at)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CalendarDayIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tasks scheduled for this date</p>
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto h-[calc(100vh-100px)]">
        <div className="max-w-7xl mx-auto min-h-full space-y-4 sm:space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-muted animate-pulse rounded"></div>
              <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
              <div className="h-10 w-10 bg-muted animate-pulse rounded"></div>
            </div>
          </div>

          {/* Calendar Grid and Sidebar Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Calendar Grid Skeleton */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="h-6 w-40 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {[...Array(7)].map((_, index) => (
                      <div key={index} className="p-2 text-center">
                        <div className="h-4 w-12 bg-muted animate-pulse rounded mx-auto"></div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {[...Array(35)].map((_, index) => (
                      <div key={index} className="p-2 h-20 sm:h-24 border rounded-lg">
                        <div className="h-4 w-6 bg-muted animate-pulse rounded mb-1"></div>
                        <div className="space-y-1">
                          {[...Array(2)].map((_, taskIndex) => (
                            <div key={taskIndex} className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Tasks Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <div className="h-6 w-36 bg-muted animate-pulse rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-muted animate-pulse rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
                            <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                          <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto h-[calc(100vh-100px)]">
      <div className="max-w-7xl mx-auto min-h-full space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Calendar</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2 px-4">
              <CalendarIcon className="h-4 w-4" />
              <span className="font-medium">{monthName}</span>
            </div>
            <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Task Calendar</CardTitle>
                <p className="text-sm text-muted-foreground">Click on any date to view tasks</p>
              </CardHeader>
              <CardContent className="overflow-auto">
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (day === null) {
                      return <div key={index} className="p-2 h-20 sm:h-24"></div>
                    }

                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                    const tasksForDay = getTasksForDate(date)
                    const isToday = date.toDateString() === new Date().toDateString()
                    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

                    return (
                      <div
                        key={day}
                        className={`p-2 h-20 sm:h-24 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          isToday ? "bg-primary/10 border-primary" : 
                          isSelected ? "bg-primary/20 border-primary" : "border-border"
                        } overflow-hidden`}
                        onClick={() => handleDateClick(day)}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? "text-primary" : 
                          isSelected ? "text-primary" : "text-foreground"
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {tasksForDay.slice(0, 2).map((task) => (
                            <div
                              key={task.id}
                              className={`text-xs p-1 rounded border ${getPriorityColor(task.priority)} truncate`}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          ))}
                          {tasksForDay.length > 2 && (
                            <div className="text-xs text-muted-foreground">+{tasksForDay.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Tasks Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
              </CardHeader>
              <CardContent className="overflow-auto">
                {(() => {
                  const today = new Date()
                  const todayString = today.toISOString().split("T")[0]
                  const todayTasks = tasks.filter((task) => {
                    if (!task.due_date) return false
                    const taskDate = new Date(task.due_date).toISOString().split("T")[0]
                    return taskDate === todayString
                  })

                  return todayTasks.length > 0 ? (
                    <div className="space-y-3">
                      {todayTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
                            <div>
                              <p className="font-medium text-sm">{task.title}</p>
                              {task.assignee && (
                                <p className="text-xs text-muted-foreground">{task.assignee}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                task.priority === "high"
                                  ? "destructive"
                                  : task.priority === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>
                            {task.category && <Badge variant="outline" className="text-xs">{task.category}</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No tasks scheduled for today.</p>
                  )
                })()}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Desktop Dialog for Task Preview */}
        <Dialog open={isPreviewOpen && window.innerWidth >= 768} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tasks for {selectedDateString}</DialogTitle>
            </DialogHeader>
            <TaskPreview />
          </DialogContent>
        </Dialog>

        {/* Mobile Sheet for Task Preview */}
        <Sheet open={isPreviewOpen && window.innerWidth < 768} onOpenChange={setIsPreviewOpen}>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Tasks for {selectedDateString}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto">
              <TaskPreview />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
