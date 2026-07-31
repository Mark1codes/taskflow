"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Calendar, User, ChevronDown, ChevronUp, Bell } from "lucide-react"
import supabase from '@/utils/supabase'

interface PendingTask {
  id: string
  title: string
  description?: string
  priority: string
  due_date?: string
  assignee?: string
  category?: string
  user_id: string
}

interface TaskInvitationsProps {
  invitations: PendingTask[]
  onAccept: (taskId: string) => Promise<void>
  onReject: (taskId: string) => Promise<void>
}

const priorityColors: Record<string, string> = {
  high:   "bg-red-50 text-red-600 border-red-100",
  medium: "bg-amber-50 text-amber-600 border-amber-100",
  low:    "bg-slate-50 text-slate-500 border-slate-100",
}

function fmt(s?: string) {
  if (!s) return null
  try { return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }
  catch { return s }
}

function avatarColor(name: string) {
  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-pink-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function UserAvatar({ name, avatarUrl, size = 'sm' }: { name: string; avatarUrl?: string; size?: 'sm' | 'md' }) {
  if (!name) return <div className={`flex items-center justify-center shrink-0 rounded-full bg-slate-200 ${size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'}`}><User className="h-3 w-3 text-slate-400" /></div>
  const sz = size === 'sm' ? 'h-4 w-4 text-[8px]' : 'h-8 w-8 text-xs'
  
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${sz} rounded-full object-cover shrink-0`} />
  }

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`flex items-center justify-center shrink-0 rounded-full text-white font-medium ${sz} ${avatarColor(name)}`}>
      {initials}
    </div>
  )
}

type UserInfo = { name: string; avatarUrl?: string }

export function TaskInvitations({ invitations, onAccept, onReject }: TaskInvitationsProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [userMap, setUserMap] = useState<Record<string, UserInfo>>({})

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      try {
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (res.ok) {
          const json = await res.json()
          const map: Record<string, UserInfo> = {}
          json.users?.forEach((u: any) => map[u.id] = { name: u.full_name, avatarUrl: u.avatar_url })
          setUserMap(map)
        }
      } catch (err) {
        console.error("Failed to fetch users for invitations:", err)
      }
    }
    fetchUsers()
  }, [])

  if (invitations.length === 0) return null

  const handleAccept = async (id: string) => {
    setLoadingId(id)
    try { await onAccept(id) } finally { setLoadingId(null) }
  }

  const handleReject = async (id: string) => {
    setLoadingId(id)
    try { await onReject(id) } finally { setLoadingId(null) }
  }

  return (
    <div className="mx-4 mt-4 sm:mx-6 lg:mx-8 rounded-xl border border-blue-200 bg-blue-50/60 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-100/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
            <Bell className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-semibold text-blue-900">
            Task Invitations
          </span>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
            {invitations.length}
          </span>
          <span className="text-xs text-blue-600">
            — you must accept before these appear in your workspace
          </span>
        </div>
        {collapsed
          ? <ChevronDown className="h-4 w-4 text-blue-500" />
          : <ChevronUp className="h-4 w-4 text-blue-500" />}
      </button>

      {/* Invitation cards */}
      {!collapsed && (
        <div className="border-t border-blue-200 divide-y divide-blue-100">
          {invitations.map(task => {
            const isLoading = loadingId === task.id
            return (
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 bg-white/60">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900 truncate">{task.title}</span>
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider px-1.5 py-0 border ${priorityColors[task.priority] ?? priorityColors.medium}`}>
                      {task.priority}
                    </Badge>
                    {task.category && (
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider px-1.5 py-0 border-slate-200 text-slate-500">
                        {task.category}
                      </Badge>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-[13px] text-slate-500 line-clamp-1 mb-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Due {fmt(task.due_date)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded-full text-[11px]">
                      <UserAvatar name={userMap[task.user_id]?.name} avatarUrl={userMap[task.user_id]?.avatarUrl} />
                      Assigned by {userMap[task.user_id]?.name || "team member"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(task.id)}
                    disabled={isLoading}
                    className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(task.id)}
                    disabled={isLoading}
                    className="h-8 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 text-xs px-3"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
