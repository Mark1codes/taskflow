"use client"

import {
  LayoutDashboard,
  Plus,
  CheckSquare,
  Calendar,
  Kanban,
  Settings,
  Menu,
  Bot,
  Sparkles,
  MessageSquare,
  Zap,
  Music,
  PlayCircle,
  ListMusic,
  Radio,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "add-task", label: "Add Task", icon: Plus },
  { id: "tasks", label: "Task List", icon: CheckSquare },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "kanban", label: "Kanban Board", icon: Kanban },
  { id: "settings", label: "Settings", icon: Settings },
]

const musicFeatures = [
  { id: "music-player", label: "Music Player", icon: PlayCircle },
  { id: "playlists", label: "Playlists", icon: ListMusic },
  { id: "focus-sounds", label: "Focus Sounds", icon: Radio },
]

const aiFeatures = [
  { id: "ai-assistant", label: "AI Assistant", icon: Bot },
  { id: "smart-suggestions", label: "Smart Suggestions", icon: Sparkles },
  { id: "ai-chat", label: "AI Chat", icon: MessageSquare },
  { id: "auto-prioritize", label: "Auto Prioritize", icon: Zap },
]

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col h-full",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 border-b border-border shrink-0">
          {!isCollapsed && <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">TaskFlow</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-1 sm:space-y-2 p-2 sm:p-4">
            {!isCollapsed && (
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Main</div>
            )}
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sm h-9 sm:h-10",
                    isCollapsed ? "px-2" : "px-3",
                    !isCollapsed && "text-left",
                  )}
                  onClick={() => onViewChange(item.id)}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-2 sm:mr-3")} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Button>
              )
            })}

            <Separator className="my-3 sm:my-4" />

            {!isCollapsed && (
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex items-center">
                <Music className="h-3 w-3 mr-1" />
                Music & Focus
              </div>
            )}
            {musicFeatures.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sm h-9 sm:h-10",
                    isCollapsed ? "px-2" : "px-3",
                    !isCollapsed && "text-left",
                    activeView === item.id &&
                      "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700",
                  )}
                  onClick={() => onViewChange(item.id)}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-2 sm:mr-3")} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Button>
              )
            })}

            <Separator className="my-3 sm:my-4" />

            {!isCollapsed && (
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Features
              </div>
            )}
            {aiFeatures.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sm h-9 sm:h-10",
                    isCollapsed ? "px-2" : "px-3",
                    !isCollapsed && "text-left",
                  )}
                  onClick={() => onViewChange(item.id)}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-2 sm:mr-3")} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Button>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
