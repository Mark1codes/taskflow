"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { BrandLogo } from "@/components/layout/brand-logo"
import { Dashboard } from "@/components/core/dashboard"
import { TaskList } from "@/components/tasks/task-list"
import { SharedTasks } from "@/components/tasks/shared-tasks"
import { AddTask } from "@/components/tasks/add-task"
import { Calendar } from "@/components/tasks/calendar-view"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { Settings } from "@/components/core/settings"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { LogOut, User, SettingsIcon, Menu } from "lucide-react"
import { ProfilePage } from "@/components/core/profile-page"
import { CommandPalette } from "@/components/core/command-palette"
import { AIAssistant } from "@/components/ai/ai-assistant"
import { AIWorkPlanner } from "@/components/ai/ai-work-planner"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { FocusMode } from "@/components/core/focus-mode"
import { ActivityFeed } from "@/components/core/activity-feed"
import { Inbox } from "@/components/tasks/inbox"
import { InvitationsPage } from "@/components/tasks/invitations-page"
import supabase from '@/utils/supabase'

interface Task {
  id: string
  title: string
  status: string
  priority: string
  due_date: string
  assignee?: string
  assignee_id?: string
  assignment_status?: string
  category: string
  created_at: string
  updated_at: string
  user_id: string
  description?: string
  completion_note?: string
  completion_reply?: string
  completed_by_id?: string
  completed_by_name?: string
  completed_at?: string
  subtasks?: { id: string; title: string; completed: boolean }[]
  time_spent_minutes?: number
  task_assignees?: { id: string; user_id: string; user_name: string; status: string }[]
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
  const [focusedTask, setFocusedTask] = useState<Task | null>(null)
  const [aiSessionId, setAiSessionId] = useState<string | null>(null)
  const [pendingInvitations, setPendingInvitations] = useState<Task[]>([])
  const [openTaskId, setOpenTaskId] = useState<string | null>(null)
  const [readInboxTaskIds, setReadInboxTaskIds] = useState<string[]>([])
  const [searchOpen, setSearchOpen] = useState(false)

  const handleViewTaskFromInbox = (task: Task) => {
    const isShared = task.user_id !== currentUser?.id || (task.task_assignees?.length || 0) > 0;
    setActiveView(isShared ? "shared-tasks" : "tasks");
    setOpenTaskId(task.id);
  }

  // Sync activeView with URL hash so refreshes stay on the same page
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash) {
        setActiveView(hash)
      } else {
        setActiveView("dashboard")
      }
    }
    
    handleHashChange() // Read initial hash on mount

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  useEffect(() => {
    const currentHash = window.location.hash.replace("#", "")
    // Update hash when activeView changes (except if it's the default dashboard without a hash)
    if (currentHash !== activeView && !(currentHash === "" && activeView === "dashboard")) {
      window.location.hash = activeView
    }
  }, [activeView])

  useEffect(() => {
    const saved = localStorage.getItem('read_inbox_task_ids')
    if (saved) {
      try { setReadInboxTaskIds(JSON.parse(saved)) } catch {}
    }
  }, [])

  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser)
      fetchTasks(initialUser.id)
      fetchPendingInvitations(initialUser.id)
    }
  }, [initialUser?.id])
  // Load color theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("taskflow-color-theme") || "blue"
    document.documentElement.setAttribute("data-theme", savedTheme)
  }, [])

  // Dynamically update the browser tab title on every view change
  useEffect(() => {
    const viewTitles: Record<string, string> = {
      dashboard:    "Dashboard",
      tasks:        "My Tasks",
      "add-task":   "Add Task",
      kanban:       "Kanban Board",
      calendar:     "Calendar",
      invitations:  "Invitations",
      "ai-assistant":   "AI Assistant",
      "ai-planner": "AI Work Planner",
      settings:     "Settings",
      profile:      "Profile",
    }
    const pageName = viewTitles[activeView] || "TaskFlow"
    document.title = `${pageName} — TaskFlow`
  }, [activeView])

  // Set up real-time subscription for tasks.
  // Own tasks update live for assigners. Shared tasks are also refreshed when
  // assignment rows change so assignee/assigner views do not drift apart.
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
          // No filter here so we receive updates for shared tasks too
        },
        (payload: any) => {
          console.log('Real-time update:', payload)
          
          switch (payload.eventType) {
            case 'INSERT':
              // Only auto-insert if we are the owner. Otherwise, wait for the assignee trigger.
              if (payload.new && payload.new.user_id === currentUser.id) {
                setTasks(prev => {
                  const exists = prev.some(task => task.id === payload.new.id)
                  if (exists) return prev
                  return [payload.new as Task, ...prev]
                })
              }
              break
            case 'UPDATE':
              if (payload.new) {
                setTasks(prev => {
                  // Only update if we already have this task in our UI (either as owner or assignee)
                  const exists = prev.some(task => task.id === payload.new.id)
                  if (!exists) return prev
                  
                  return prev.map(task => {
                    if (task.id === payload.new.id) {
                      // Preserve the task_assignees data which isn't in the flat task payload
                      return { ...task, ...payload.new } as Task
                    }
                    return task
                  })
                })
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

    const assigneeChannel = supabase
      .channel('task_assignee_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_assignees',
          filter: `user_id=eq.${currentUser.id}`
        },
        () => {
          void fetchTasks(currentUser.id)
          void fetchPendingInvitations(currentUser.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(assigneeChannel)
    }
  }, [currentUser?.id])

  // Fetch tasks where current user is the creator OR the named assignee (accepted only)
  const fetchTasks = async (userId: string) => {
    try {
      setIsLoading(true)

      // 1. Fetch tasks I own
      const { data: ownedTasks, error: err1 } = await supabase
        .from('task')
        .select('*, task_assignees(*)')
        .eq('user_id', userId)

      // 2. Fetch tasks assigned to me (accepted)
      const { data: assignmentRefs } = await supabase
        .from('task_assignees')
        .select('task_id')
        .eq('user_id', userId)
        .eq('status', 'accepted')

      let assignedTasks: any[] = []
      if (assignmentRefs && assignmentRefs.length > 0) {
        const ids = assignmentRefs.map(r => r.task_id)
        const uniqueIds = ids.filter(id => !ownedTasks?.some(t => t.id === id))
        if (uniqueIds.length > 0) {
          const { data } = await supabase
            .from('task')
            .select('*, task_assignees(*)')
            .in('id', uniqueIds)
          assignedTasks = data || []
        }
      }

      if (err1) console.error('Error fetching tasks:', err1)

      const allTasks = [...(ownedTasks || []), ...assignedTasks]
      allTasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      setTasks(allTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch tasks assigned to me that are still pending acceptance
  const fetchPendingInvitations = async (userId: string) => {
    const { data: refs } = await supabase
      .from('task_assignees')
      .select('task_id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      
    if (!refs || refs.length === 0) {
      setPendingInvitations([])
      return
    }

    const { data } = await supabase
      .from('task')
      .select('*, task_assignees(*)')
      .in('id', refs.map(r => r.task_id))
      
    setPendingInvitations(data || [])
  }

  const handleAcceptInvitation = async (taskId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch('/api/tasks/respond-invitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ taskId, action: 'accept' }),
    })
    if (res.ok) {
      setPendingInvitations(prev => prev.filter(t => t.id !== taskId))
      if (currentUser) fetchTasks(currentUser.id)
      setActiveView('shared-tasks')
    }
  }

  const handleRejectInvitation = async (taskId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch('/api/tasks/respond-invitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ taskId, action: 'reject' }),
    })
    if (res.ok) {
      setPendingInvitations(prev => prev.filter(t => t.id !== taskId))
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
      const existingTask = tasks.find(task => task.id === taskId)
      const now = new Date().toISOString()
      const enrichedUpdates: Partial<Task> = {
        ...updates,
        updated_at: now,
      }

      if (updates.status === 'completed') {
        enrichedUpdates.completed_by_id = currentUser.id
        enrichedUpdates.completed_by_name = currentUser.name
        enrichedUpdates.completed_at = now
      }

      // Optimistic update - update UI immediately
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, ...enrichedUpdates }
            : task
        )
      )

      // Then sync with database
      let query = supabase
        .from('task')
        .update(enrichedUpdates)
        .eq('id', taskId)

      // Owners can update their own tasks. Accepted assignees can update shared
      // task progress fields when Supabase RLS allows it.
      if (existingTask?.user_id === currentUser.id) {
        query = query.eq('user_id', currentUser.id)
      }

      const { error } = await query

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
      case "inbox":
        return <Inbox tasks={tasks} user={currentUser} onUpdateTask={updateTask} onViewTask={handleViewTaskFromInbox} />
      case "add-task":
        return <AddTask tasks={tasks} onAddTask={addTask} onBack={() => setActiveView("tasks")} user={currentUser} />
      case "tasks":
        return <TaskList tasks={tasks} onUpdateTask={updateTask} onDeleteTask={deleteTask} user={currentUser} isLoading={isLoading} onStartFocus={setFocusedTask} openTaskId={openTaskId} onClearOpenTask={() => setOpenTaskId(null)} />
      case "shared-tasks":
        return <SharedTasks tasks={tasks} onUpdateTask={updateTask} onDeleteTask={deleteTask} user={currentUser} isLoading={isLoading} onStartFocus={setFocusedTask} openTaskId={openTaskId} onClearOpenTask={() => setOpenTaskId(null)} />
      case "calendar":
        return <Calendar tasks={getCalendarTasks()} onUpdateTask={updateTask} />
      case "kanban":
        return <KanbanBoard tasks={tasks} onUpdateTask={updateTask} onStartFocus={setFocusedTask} user={currentUser} />
      case "activity":
        return <ActivityFeed user={currentUser} />
      case "invitations":
        return (
          <InvitationsPage
            invitations={pendingInvitations}
            onAccept={handleAcceptInvitation}
            onReject={handleRejectInvitation}
            onGoToDashboard={() => handleViewChange("dashboard")}
          />
        )
      case "settings":
        return <Settings user={currentUser} />
      case "profile":
        return <ProfilePage user={currentUser} onUpdateUser={handleUpdateUser} />
      case "ai-assistant":
        return <AIAssistant tasks={tasks} user={currentUser} onTaskCreated={addTask} persistedSessionId={aiSessionId} onSessionChange={setAiSessionId} />
      case "smart-suggestions":
        return <AIWorkPlanner tasks={tasks} mode="suggestions" />
      default:
        return <Dashboard tasks={tasks} isLoading={isLoading} />
    }
  }

  const inboxNotificationKeys = tasks
    .filter(t =>
      (
        t.user_id !== currentUser?.id &&
        t.task_assignees?.some(a => a.user_id === currentUser?.id && a.status === 'accepted') &&
        t.status !== 'completed'
      ) ||
      (
        t.user_id === currentUser?.id &&
        t.status === 'completed' &&
        t.completed_by_id &&
        t.completed_by_id !== currentUser?.id
      )
    )
    .map(t => t.status === 'completed' ? `${t.id}:completed` : `${t.id}:assigned`)
  const inboxNotificationKeySignature = inboxNotificationKeys.join('|')

  useEffect(() => {
    if (activeView === 'inbox' && inboxNotificationKeys.length > 0) {
      const newIds = Array.from(new Set([...readInboxTaskIds, ...inboxNotificationKeys]))
      if (newIds.length !== readInboxTaskIds.length) {
        setReadInboxTaskIds(newIds)
        localStorage.setItem('read_inbox_task_ids', JSON.stringify(newIds))
      }
    }
  }, [activeView, inboxNotificationKeySignature, readInboxTaskIds])

  const inboxCount = inboxNotificationKeys.filter(id => !readInboxTaskIds.includes(id)).length

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
    <div className="flex h-screen bg-slate-50 overflow-hidden dark:bg-slate-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar activeView={activeView} onViewChange={handleViewChange} invitationsCount={pendingInvitations.length} inboxCount={inboxCount} onOpenSearch={() => setSearchOpen(true)} />
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
                <Sidebar activeView={activeView} onViewChange={handleViewChange} invitationsCount={pendingInvitations.length} inboxCount={inboxCount} onOpenSearch={() => setSearchOpen(true)} />
              </SheetContent>
            </Sheet>


            <h1 className="text-base font-semibold text-slate-900 dark:text-white ml-2">{viewLabel(activeView)}</h1>
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
                    <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} referrerPolicy="no-referrer" className="object-cover" />
                    <AvatarFallback className={currentUser.avatar ? "bg-slate-100 dark:bg-slate-800" : "text-xs bg-blue-600 text-white font-medium"}>
                      {currentUser.avatar ? <Skeleton className="h-full w-full rounded-full" /> : currentUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
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
    
    {focusedTask && (
      <FocusMode 
        task={focusedTask} 
        onClose={(minutesSpent: number) => {
          if (minutesSpent > 0) {
            updateTask(focusedTask.id, { time_spent_minutes: (focusedTask.time_spent_minutes || 0) + minutesSpent })
          }
          setFocusedTask(null)
        }} 
        onComplete={(minutesSpent: number) => {
          updateTask(focusedTask.id, { 
            status: 'completed',
            time_spent_minutes: (focusedTask.time_spent_minutes || 0) + minutesSpent 
          })
          setFocusedTask(null)
        }} 
      />
    )}

    <CommandPalette 
      open={searchOpen} 
      setOpen={setSearchOpen} 
      tasks={tasks}
      onSelectTask={(taskId) => {
        const isShared = tasks.find(t => t.id === taskId)?.user_id !== currentUser?.id
        setActiveView(isShared ? "shared-tasks" : "tasks")
        setOpenTaskId(taskId)
      }}
      onNavigate={handleViewChange}
    />
    </ThemeProvider>
  )
}
