import * as React from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { CheckSquare, LayoutDashboard, Settings, Activity, Calendar, Kanban, Users, User, Bot, Sparkles, Plus, Bell } from "lucide-react"
import { useRouter } from "next/navigation"

interface Task {
  id: string
  title: string
  status: string
}

interface CommandPaletteProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  tasks: Task[]
  onSelectTask: (taskId: string) => void
  onNavigate: (view: string) => void
}

export function CommandPalette({ open, setOpen, tasks, onSelectTask, onNavigate }: CommandPaletteProps) {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setOpen])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search tasks..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {tasks.length > 0 && (
          <CommandGroup heading="Tasks">
            {tasks.map(task => (
              <CommandItem
                key={task.id}
                value={task.title}
                onSelect={() => {
                  onSelectTask(task.id)
                  setOpen(false)
                }}
              >
                <CheckSquare className="mr-2 h-4 w-4 text-blue-500" />
                <span className="truncate">{task.title}</span>
                <span className="ml-auto text-xs text-slate-400 capitalize">{task.status.replace("-", " ")}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => { onNavigate("dashboard"); setOpen(false) }}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-slate-500" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("tasks"); setOpen(false) }}>
            <CheckSquare className="mr-2 h-4 w-4 text-slate-500" />
            <span>My Tasks</span>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("add-task"); setOpen(false) }}>
            <Plus className="mr-2 h-4 w-4 text-slate-500" />
            <span>Create Task</span>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("kanban"); setOpen(false) }}>
            <Kanban className="mr-2 h-4 w-4 text-slate-500" />
            <span>Board</span>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("calendar"); setOpen(false) }}>
            <Calendar className="mr-2 h-4 w-4 text-slate-500" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("activity"); setOpen(false) }}>
            <Activity className="mr-2 h-4 w-4 text-slate-500" />
            <span>Activity Feed</span>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("shared-tasks"); setOpen(false) }}>
            <Users className="mr-2 h-4 w-4 text-slate-500" />
            <span>Shared with Me</span>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("inbox"); setOpen(false) }}>
            <Bell className="mr-2 h-4 w-4 text-slate-500" />
            <span>Inbox</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Tools">
          <CommandItem onSelect={() => { onNavigate("ai-assistant"); setOpen(false) }}>
            <Bot className="mr-2 h-4 w-4 text-purple-500" />
            <span>AI Assistant</span>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("smart-suggestions"); setOpen(false) }}>
            <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
            <span>Smart Suggestions</span>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("settings"); setOpen(false) }}>
            <Settings className="mr-2 h-4 w-4 text-slate-500" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("profile"); setOpen(false) }}>
            <User className="mr-2 h-4 w-4 text-slate-500" />
            <span>Profile</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
