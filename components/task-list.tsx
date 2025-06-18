"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Calendar, User, MoreHorizontal, Edit, Trash2, CheckCircle, RefreshCw, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import supabase from '../utils/supabase'

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: string
  assignee: string
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

export function TaskList({ tasks: initialTasks, onUpdateTask, onDeleteTask, user, isLoading = false }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  // Update tasks when prop changes
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('task_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time update:', payload)
          
          switch (payload.eventType) {
            case 'INSERT':
              setTasks(prev => [payload.new as Task, ...prev])
              break
            case 'UPDATE':
              setTasks(prev => prev.map(task => 
                task.id === payload.new.id ? payload.new as Task : task
              ))
              break
            case 'DELETE':
              setTasks(prev => prev.filter(task => task.id !== payload.old.id))
              break
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const fetchTasks = async () => {
    if (!user?.id) return

    setRefreshing(true)
    setError("")

    try {
      const { data, error: fetchError } = await supabase
        .from('task')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error("Error fetching tasks:", fetchError)
        setError("Failed to fetch tasks: " + fetchError.message)
      } else {
        setTasks(data || [])
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred while fetching tasks")
    } finally {
      setRefreshing(false)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.category && task.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.assignee && task.assignee.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

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

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const statusOrder = ["todo", "in-progress", "completed"]
    const currentIndex = statusOrder.indexOf(currentStatus)
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
    
    // Update locally first for immediate feedback
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: nextStatus } : task
    ))
    
    // Then call the parent update function
    onUpdateTask(taskId, { status: nextStatus })
  }

  const handleDeleteTask = async (taskId: string) => {
    // Optimistic update
    const taskToDelete = tasks.find(task => task.id === taskId)
    setTasks(prev => prev.filter(task => task.id !== taskId))
    
    // Call parent delete function
    onDeleteTask(taskId)
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

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto max-h-screen">
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Task List</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs sm:text-sm">
              {filteredTasks.length} of {tasks.length} tasks
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchTasks}
              disabled={refreshing || isLoading}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isLoading && tasks.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading tasks...</p>
              </CardContent>
            </Card>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className={`w-3 h-3 rounded-full mt-2 shrink-0 ${getStatusColor(task.status)}`}></div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-semibold break-words">{task.title}</h3>
                          <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getStatusLabel(task.status)}
                          </Badge>
                          {task.category && (
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground break-words">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                          {task.assignee && (
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{task.assignee}</span>
                            </span>
                          )}
                          {task.due_date && (
                            <span className={`flex items-center space-x-1 ${isOverdue(task.due_date) ? 'text-red-500' : ''}`}>
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(task.due_date)}</span>
                              {isOverdue(task.due_date) && <span className="text-xs">(Overdue)</span>}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Created: {formatDate(task.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        title="Toggle status"
                      >
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                            <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="space-y-4">
                  <Plus className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">No tasks found</p>
                    <p className="text-sm text-muted-foreground">
                      {tasks.length === 0 
                        ? "Get started by creating your first task!" 
                        : "No tasks match your current filters."
                      }
                    </p>
                  </div>
                  {searchTerm || statusFilter !== "all" || priorityFilter !== "all" ? (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                        setPriorityFilter("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}