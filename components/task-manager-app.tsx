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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LogOut, User, SettingsIcon, Menu } from "lucide-react"
import { ProfilePage } from "@/components/profile-page"
import { AIAssistant } from "@/components/ai-assistant"
import { SmartSuggestions } from "@/components/smart-suggestions"
import { MusicPlayer } from "@/components/music-player"
import { Playlists } from "@/components/playlists"
import { FocusSounds } from "@/components/focus-sounds"
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
  onLogout: () => void
}

export function TaskManagerApp({ user: initialUser, onLogout }: TaskManagerAppProps) {
  const [activeView, setActiveView] = useState("dashboard")
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentUser, setCurrentUser] = useState<User>(initialUser)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser)
      fetchTasks(initialUser.id)
    }
  }, [initialUser])

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
                setTasks(prev => [payload.new as Task, ...prev])
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
    setTasks(prevTasks => [newTask, ...prevTasks])
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
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

      if (error) {
        console.error("Error updating task:", error)
        // Revert optimistic update on error
        await fetchTasks(currentUser.id)
      }
    } catch (error) {
      console.error("Error updating task:", error)
      // Revert optimistic update on error
      await fetchTasks(currentUser.id)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      // Optimistic update - remove from UI immediately
      const taskToDelete = tasks.find(task => task.id === taskId)
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))

      // Then sync with database
      const { error } = await supabase
        .from('task')
        .delete()
        .eq('id', taskId)

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
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
      } else {
        setTasks([]) // Clear tasks
        setCurrentUser(null) // Clear user
        onLogout() // Trigger parent logout handler
      }
    } catch (err) {
      console.error("Unexpected error during logout:", err)
    } finally {
      setIsLoading(false)
    }
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
        return <Calendar tasks={tasks} onUpdateTask={updateTask} />
      case "kanban":
        return <KanbanBoard tasks={tasks} onUpdateTask={updateTask} />
      case "settings":
        return <Settings />
      case "profile":
        return <ProfilePage user={currentUser} onUpdateUser={handleUpdateUser} />
      case "ai-assistant":
        return <AIAssistant />
      case "smart-suggestions":
        return <SmartSuggestions />
      case "ai-chat":
        return <AIAssistant />
      case "auto-prioritize":
        return <SmartSuggestions />
      case "music-player":
        return <MusicPlayer />
      case "playlists":
        return <Playlists />
      case "focus-sounds":
        return <FocusSounds />
      default:
        return <Dashboard tasks={tasks} isLoading={isLoading} />
    }
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

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      </div>

      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 fixed top-4 left-4 z-50"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar activeView={activeView} onViewChange={handleViewChange} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 sm:h-16 border-b border-border bg-card px-3 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <h2 className="text-sm sm:text-lg font-semibold capitalize truncate">
              {activeView === "add-task" ? "Add Task" : activeView.replace("-", " ")}
            </h2>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <span className="hidden sm:block text-xs sm:text-sm text-muted-foreground truncate max-w-32 sm:max-w-none">
              Welcome back, {currentUser.name}!
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                    <AvatarFallback className="text-xs sm:text-sm">{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 sm:w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{currentUser.name}</p>
                    <p className="w-[150px] sm:w-[200px] truncate text-xs text-muted-foreground">{currentUser.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleViewChange("settings")}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange("profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogoutClick} disabled={isLoading}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoading ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">{renderContent()}</main>
      </div>
    </div>
  )
}