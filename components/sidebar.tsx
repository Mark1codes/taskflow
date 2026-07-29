"use client"

import {
  LayoutDashboard, Plus, CheckSquare, Calendar, Kanban,
  Settings, Menu, Bot, Sparkles, Zap,
  ChevronLeft,
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

const mainNav = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "add-task",  label: "Add Task",   icon: Plus },
  { id: "tasks",     label: "Task List",  icon: CheckSquare },
  { id: "calendar",  label: "Calendar",   icon: Calendar },
  { id: "kanban",    label: "Kanban",     icon: Kanban },
  { id: "settings",  label: "Settings",   icon: Settings },
]

const aiNav = [
  { id: "ai-assistant",    label: "AI Assistant",    icon: Bot },
  { id: "smart-suggestions",label: "Smart Suggestions", icon: Sparkles },
]

function NavGroup({ label, items, activeView, onViewChange, collapsed }: {
  label: string
  items: typeof mainNav
  activeView: string
  onViewChange: (v: string) => void
  collapsed: boolean
}) {
  return (
    <div className="mb-2">
      {!collapsed && (
        <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500 select-none">
          {label}
        </p>
      )}
      {items.map(item => {
        const Icon = item.icon
        const active = activeView === item.id
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            title={collapsed ? item.label : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group",
              active
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-500 group-hover:text-white")} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      "flex flex-col h-full bg-slate-900 border-r border-slate-800 transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
        {!collapsed && (
          <BrandLogo
            className="w-[136px]"
            markClassName="h-7 w-7 bg-blue-600"
            textClassName="text-base text-white"
            light
          />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        <NavGroup label="Main" items={mainNav} activeView={activeView} onViewChange={onViewChange} collapsed={collapsed} />
        {!collapsed && <div className="border-t border-slate-800 my-2" />}
        <NavGroup label="AI" items={aiNav} activeView={activeView} onViewChange={onViewChange} collapsed={collapsed} />
      </nav>

      {/* Bottom hint */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800 shrink-0">
          <div className="text-[10px] text-slate-600 text-center">TaskFlow v2.0</div>
        </div>
      )}
    </div>
  )
}
