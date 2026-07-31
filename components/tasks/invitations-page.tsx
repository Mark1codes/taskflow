"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Calendar, User, UserPlus, LayoutDashboard } from "lucide-react"
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

interface InvitationsPageProps {
  invitations: PendingTask[]
  onAccept: (taskId: string) => Promise<void>
  onReject: (taskId: string) => Promise<void>
  onGoToDashboard: () => void
}

const priorityColors: Record<string, string> = {
  high:   "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50",
  medium: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50",
  low:    "bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
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

function UserAvatar({ name, avatarUrl, size = 'sm' }: { name: string; avatarUrl?: string; size?: 'sm' | 'md' | 'lg' }) {
  let szClass = 'h-8 w-8 text-xs'
  if (size === 'sm') szClass = 'h-6 w-6 text-[10px]'
  if (size === 'lg') szClass = 'h-10 w-10 text-sm'

  if (!name) return <div className={`flex items-center justify-center shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 ${szClass}`}><User className="h-4 w-4 text-slate-400" /></div>
  
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${szClass} rounded-full object-cover shrink-0 ring-2 ring-white dark:ring-slate-900`} />
  }

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`flex items-center justify-center shrink-0 rounded-full text-white font-medium ${szClass} ${avatarColor(name)} ring-2 ring-white dark:ring-slate-900`}>
      {initials}
    </div>
  )
}

type UserInfo = { name: string; avatarUrl?: string }

export function InvitationsPage({ invitations, onAccept, onReject, onGoToDashboard }: InvitationsPageProps) {
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

  const handleAccept = async (id: string) => {
    setLoadingId(id)
    try { await onAccept(id) } finally { setLoadingId(null) }
  }

  const handleReject = async (id: string) => {
    setLoadingId(id)
    try { await onReject(id) } finally { setLoadingId(null) }
  }

  if (invitations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-[400px]">
        <div className="h-20 w-20 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100 dark:border-blue-800/50">
          <UserPlus className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">You're all caught up!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-8">
          You don't have any pending task invitations right now. When someone assigns a task to you, it will appear here.
        </p>
        <Button onClick={onGoToDashboard} className="gap-2">
          <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 p-6 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-blue-500" /> Task Invitations
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            You have {invitations.length} pending {invitations.length === 1 ? 'task' : 'tasks'} assigned to you. Review and accept them to add them to your workspace.
          </p>
        </div>

        <div className="grid gap-4">
          {invitations.map(task => {
            const isLoading = loadingId === task.id
            const assigner = userMap[task.user_id]
            
            return (
              <div 
                key={task.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-start gap-5"
              >
                {/* Assigner Info (Desktop Layout) */}
                <div className="hidden sm:flex flex-col items-center shrink-0 w-24">
                  <UserAvatar name={assigner?.name || ""} avatarUrl={assigner?.avatarUrl} size="lg" />
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 text-center leading-tight">
                    {assigner?.name || "Team Member"}
                  </span>
                </div>

                {/* Task Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {/* Assigner Info (Mobile Layout) */}
                      <div className="flex sm:hidden items-center gap-2 mb-3">
                        <UserAvatar name={assigner?.name || ""} avatarUrl={assigner?.avatarUrl} size="sm" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          Assigned by {assigner?.name || "Team Member"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wider px-2 py-0 border ${priorityColors[task.priority] ?? priorityColors.medium}`}>
                          {task.priority} Priority
                        </Badge>
                        {task.category && (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider px-2 py-0 border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {task.due_date && (
                        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                          <Calendar className="h-3.5 w-3.5" /> Due {fmt(task.due_date)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(task.id)}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none h-9 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-900/50 dark:hover:bg-red-900/20 dark:hover:border-red-800"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(task.id)}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
