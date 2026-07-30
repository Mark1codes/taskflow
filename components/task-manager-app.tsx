"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { TaskList } from "@/components/task-list"
import { AddTask } from "@/components/add-task"
import { Calendar } from "@/components/calendar-view"
import { KanbanBoard } from "@/components/kanban-board"
import { Settings } from "@/components/settings"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { LogOut, User, SettingsIcon, Menu } from "lucide-react"
import { ProfilePage } from "@/components/profile-page"
import { AIAssistant } from "@/components/ai-assistant"
import { AIWorkPlanner } from "@/components/ai-work-planner"
import { ThemeProvider } from "@/components/theme-provider"
import supabase from '../utils/supabase'

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
  description?: string
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface TaskManagerAppProps {
  user: User
  onLogout: () => void | Promise<void>
}

export function TaskManagerApp({ user: initialUser, onLogout }: TaskManagerAppProps) {
  const [activeView, setActiveView] = useState("dashboard")
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser)
      fetchTasks(initialUser.id)
    }
  }, [initialUser])

  // Dynamically update the browser tab title on every view change
  useEffect(() => {
    const viewTitles: Record<string, string> = {
      dashboard:    "Dashboard",
      tasks:        "My Tasks",
      "add-task":   "Add Task",
      kanban:       "Kanban Board",
      calendar:     "Calendar",
      "ai-assistant":   "AI Assistant",
      "ai-planner": "AI Work Planner",
      settings:     "Settings",
      profile:      "Profile",
    }
    const pageName = viewTitles[activeView] || "TaskFlow"
    document.title = `${pageName} — TaskFlow`
  }, [activeView])

  // Set up real-time subscription for tasks
  useEffect(() => {
    if (!currentUser?.id) return

    const channel = supabase
      .channel('task_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('Real-time update:', payload)
          
          switch (payload.eventType) {
            case 'INSERT':
              if (payload.new) {
                setTasks(prev => {
                  // Avoid duplicates
                  const exists = prev.some(task => task.id === payload.new.id)
                  if (exists) return prev
                  return [payload.new as Task, ...prev]
                })
              }
              break
            case 'UPDATE':
              if (payload.new) {
                setTasks(prev => prev.map(task => 
                  task.id === payload.new.id ? payload.new as Task : task
                ))
              }
              break
            case 'DELETE':
              if (payload.old) {
                setTasks(prev => prev.filter(task => task.id !== payload.old.id))
              }
              break
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser?.id])

  const fetchTasks = async (userId: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('task')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error("Error fetching tasks:", error)
        setTasks([])
      } else {
        setTasks(data || [])
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser)
  }

  const addTask = (newTask: Task) => {
    setTasks(prevTasks => {
      // Avoid duplicates - check if task already exists
      const exists = prevTasks.some(task => task.id === newTask.id)
      if (exists) return prevTasks
      return [newTask, ...prevTasks]
    })
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!currentUser) return
    try {
      // Optimistic update - update UI immediately
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, ...updates, updated_at: new Date().toISOString() }
            : task
        )
      )

      // Then sync with database
      const { error } = await supabase
        .from('task')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .eq('user_id', currentUser.id) // Ensure user can only update their own tasks

      if (error) {
        console.error("Error updating task:", error)
        // Revert optimistic update on error
        await fetchTasks(currentUser.id)
      }
    } catch (error) {
      console.error("Error updating task:", error)
      // Revert optimistic update on error
      if (currentUser) await fetchTasks(currentUser.id)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!currentUser) return
    try {
      // Optimistic update - remove from UI immediately
      const taskToDelete = tasks.find(task => task.id === taskId)
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))

      // Then sync with database
      const { error } = await supabase
        .from('task')
        .delete()
        .eq('id', taskId)
        .eq('user_id', currentUser.id) // Ensure user can only delete their own tasks

      if (error) {
        console.error("Error deleting task:", error)
        // Revert optimistic update on error
        if (taskToDelete) {
          setTasks(prevTasks => [...prevTasks, taskToDelete])
        }
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const handleViewChange = (view: string) => {
    setActiveView(view)
    setIsMobileSidebarOpen(false)
  }

  const handleLogoutClick = async () => {
    if (isLoading) return

    try {
      setIsLoading(true)

      setTasks([])
      setCurrentUser(null)
      await onLogout()
    } catch (err) {
      console.error("Unexpected error during logout:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter tasks with valid due dates for calendar
  const getCalendarTasks = () => {
    return tasks.filter(task => task.due_date && task.due_date.trim() !== '')
  }

  // Format active view label nicely
  const viewLabel = (v: string) => {
    const map: Record<string, string> = {
      "add-task": "Add Task",
      "ai-assistant": "AI Assistant",
      "smart-suggestions": "Smart Suggestions",
    }
    return map[v] || v.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access the app.</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard tasks={tasks} isLoading={isLoading} />
      case "add-task":
        return <AddTask onAddTask={addTask} onBack={() => setActiveView("dashboard")} user={currentUser} />
      case "tasks":
        return <TaskList tasks={tasks} onUpdateTask={updateTask} onDeleteTask={deleteTask} user={currentUser} isLoading={isLoading} />
      case "calendar":
        return <Calendar tasks={getCalendarTasks()} onUpdateTask={updateTask} />
      case "kanban":
        return <KanbanBoard tasks={tasks} onUpdateTask={updateTask} />
      case "settings":
        return <Settings user={currentUser} />
      case "profile":
        return <ProfilePage user={currentUser} onUpdateUser={handleUpdateUser} />
      case "ai-assistant":
        return <AIAssistant />
      case "smart-suggestions":
        return <AIWorkPlanner tasks={tasks} mode="suggestions" />
      default:
        return <Dashboard tasks={tasks} isLoading={isLoading} />
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
    <div className="flex h-screen bg-slate-50 overflow-hidden dark:bg-slate-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between shrink-0 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            {/* Mobile sidebar */}
            <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-60 border-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Mobile sidebar menu</SheetDescription>
                </SheetHeader>
                <Sidebar activeView={activeView} onViewChange={handleViewChange} />
              </SheetContent>
            </Sheet>

            <h1 className="text-base font-semibold text-slate-900 dark:text-white">{viewLabel(activeView)}</h1>
            {activeView === "calendar" && (
              <span className="hidden sm:inline text-xs text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full dark:border-slate-800">
                {getCalendarTasks().length} scheduled
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-slate-500">
              {currentUser.name}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-8 w-8 rounded-full ring-2 ring-slate-200 hover:ring-blue-500 transition-all">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} />
                    <AvatarFallback className="text-xs bg-blue-600 text-white">{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52" align="end" forceMount>
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-semibold text-sm text-slate-900">{currentUser.name}</p>
                  <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                </div>
                <div className="py-1">
                  <DropdownMenuItem onClick={() => handleViewChange("settings")} className="gap-2">
                    <SettingsIcon className="h-4 w-4 text-slate-400" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewChange("profile")} className="gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    Profile
                  </DropdownMenuItem>
                </div>
                <div className="border-t border-slate-100 py-1">
                  <DropdownMenuItem onClick={handleLogoutClick} disabled={isLoading} className="gap-2 text-red-500 focus:text-red-600">
                    <LogOut className="h-4 w-4" />
                    {isLoading ? "Signing out…" : "Sign out"}
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950">{renderContent()}</main>
      </div>
    </div>
    </ThemeProvider>
  )
}
