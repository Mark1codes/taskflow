"use client"

import {
  LayoutDashboard, Plus, CheckSquare, Calendar, Kanban, Activity,
  Settings, Menu, Bot, Sparkles, Zap,
  ChevronLeft, Bell, UserPlus, Users,
  PanelLeftClose, PanelLeftOpen, Search
} from "lucide-react"
import { BrandLogo } from "@/components/layout/brand-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  invitationsCount?: number
  inboxCount?: number
  onOpenSearch?: () => void
}

const overviewNav = [
  { id: "dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { id: "inbox",       label: "Inbox",       icon: Bell },
  { id: "activity",    label: "Activity",    icon: Activity },
]

const tasksNav = [
  { id: "tasks",       label: "My Tasks",    icon: CheckSquare },
  { id: "add-task",    label: "Add Task",    icon: Plus },
  { id: "kanban",      label: "Board",       icon: Kanban },
  { id: "calendar",    label: "Calendar",    icon: Calendar },
]

const teamNav = [
  { id: "shared-tasks",label: "Shared with Me", icon: Users },
  { id: "invitations", label: "Invitations", icon: UserPlus },
]

const settingsNav = [
  { id: "settings",    label: "Settings",    icon: Settings },
]

const aiNav = [
  { id: "ai-assistant",    label: "AI Assistant",    icon: Bot },
  { id: "smart-suggestions",label: "Smart Suggestions", icon: Sparkles },
]

function NavGroup({ label, items, activeView, onViewChange, collapsed, invitationsCount = 0, inboxCount = 0 }: {
  label: string
  items: typeof overviewNav
  activeView: string
  onViewChange: (v: string) => void
  collapsed: boolean
  invitationsCount?: number
  inboxCount?: number
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
            <div className="relative">
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-500 group-hover:text-white")} />
              {item.id === "invitations" && invitationsCount > 0 && (
                <span className={cn(
                  "absolute flex items-center justify-center rounded-full bg-blue-500 text-white font-bold",
                  collapsed ? "-top-1 -right-1 h-2 w-2" : "hidden"
                )} />
              )}
              {item.id === "inbox" && inboxCount > 0 && (
                <span className={cn(
                  "absolute flex items-center justify-center rounded-full bg-blue-500 text-white font-bold",
                  collapsed ? "-top-1 -right-1 h-2 w-2" : "hidden"
                )} />
              )}
            </div>
            {!collapsed && (
              <div className="flex flex-1 items-center justify-between min-w-0">
                <span className="truncate">{item.label}</span>
                {item.id === "invitations" && invitationsCount > 0 && (
                  <span className="flex h-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white shrink-0">
                    {invitationsCount}
                  </span>
                )}
                {item.id === "inbox" && inboxCount > 0 && (
                  <span className="flex h-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white shrink-0">
                    {inboxCount}
                  </span>
                )}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function Sidebar({ activeView, onViewChange, invitationsCount = 0, inboxCount = 0, onOpenSearch }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      "flex flex-col h-full bg-slate-900 border-r border-slate-800 transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn("h-16 flex items-center px-4 shrink-0", collapsed ? "justify-center" : "")}>
        {!collapsed ? (
          <BrandLogo
            className="w-[136px]"
            markClassName="h-7 w-7 bg-blue-600"
            textClassName="text-base text-white"
            light
          />
        ) : (
          <BrandLogo
            className="w-7 h-7 overflow-hidden"
            markClassName="h-7 w-7 bg-blue-600"
            textClassName="hidden"
            showText={false}
            light
          />
        )}
      </div>

      {/* Search */}
      <div className="px-3 pb-3 border-b border-slate-800 shrink-0">
        <button
          onClick={onOpenSearch}
          title={collapsed ? "Search (Ctrl+K)" : undefined}
          className={cn(
            "w-full flex items-center rounded-md border border-slate-800/60 bg-slate-800/40 px-2 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-300 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-500",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Search</span>}
          </div>
          {!collapsed && (
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-700 bg-slate-800/50 px-1.5 font-mono text-[10px] font-medium text-slate-400">
              Ctrl K
            </kbd>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        <NavGroup label="Overview" items={overviewNav} activeView={activeView} onViewChange={onViewChange} collapsed={collapsed} inboxCount={inboxCount} />
        {!collapsed && <div className="border-t border-slate-800 my-2" />}
        <NavGroup label="Tasks" items={tasksNav} activeView={activeView} onViewChange={onViewChange} collapsed={collapsed} />
        {!collapsed && <div className="border-t border-slate-800 my-2" />}
        <NavGroup label="Team" items={teamNav} activeView={activeView} onViewChange={onViewChange} collapsed={collapsed} invitationsCount={invitationsCount} />
        {!collapsed && <div className="border-t border-slate-800 my-2" />}
        <NavGroup label="AI" items={aiNav} activeView={activeView} onViewChange={onViewChange} collapsed={collapsed} />
        {!collapsed && <div className="border-t border-slate-800 my-2" />}
        <NavGroup label="System" items={settingsNav} activeView={activeView} onViewChange={onViewChange} collapsed={collapsed} />
      </nav>

      {/* Bottom Collapse Button */}
      <div className="p-3 border-t border-slate-800 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group",
            "text-slate-400 hover:text-white hover:bg-slate-800",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-white" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-white" />
              <span className="truncate">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
