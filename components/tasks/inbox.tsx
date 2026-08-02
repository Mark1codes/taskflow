"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Bell, Clock, User, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import supabase from "@/utils/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

function avatarColor(name: string) {
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-pink-500']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

interface InboxProps {
  tasks: any[]
  user: any
  onUpdateTask: (taskId: string, updates: any) => Promise<void> | void
}

export function Inbox({ tasks, user }: InboxProps) {
  const [userMap, setUserMap] = useState<Record<string, {name: string; avatarUrl?: string}>>({})
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

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
          const map: Record<string, {name: string; avatarUrl?: string}> = {}
          json.users?.forEach((u: any) => map[u.id] = { name: u.full_name, avatarUrl: u.avatar_url })
          setUserMap(map)
        }
      } catch (err) {} finally {
        setIsLoadingUsers(false)
      }
    }
    fetchUsers()
  }, [])

  // Filter tasks assigned to the current user that are not completed
  const assignedTasks = tasks.filter(t => 
    t.task_assignees?.some((a: any) => a.user_id === user?.id && a.status === 'accepted') && t.status !== 'completed'
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-600 bg-rose-50 border-rose-200'
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f7f9fc] dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Notifications</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-slate-950 dark:text-white" />
              Inbox
            </h1>
            <p className="mt-1 text-sm text-slate-500">Updates and alerts that need your attention.</p>
          </div>
        </div>

        {assignedTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
            <div className="mx-auto w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Inbox Zero</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You're all caught up! There are no new notifications or alerts right now.
            </p>
          </div>
        ) : isLoadingUsers ? (
          <div className="flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm">
            {[1, 2, 3].slice(0, assignedTasks.length || 3).map((_, i) => (
              <div key={i} className="flex gap-3 p-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <Skeleton className="h-4 w-48" />
                  <div className="flex flex-col gap-2 p-3 rounded-md border border-slate-100 dark:border-slate-800">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-2 mt-1">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm">
            {assignedTasks.map((task) => {
              const isCurrentUserAssigner = task.user_id === user?.id
              const assigner = isCurrentUserAssigner ? { name: user.name, avatarUrl: user.avatar } : userMap[task.user_id]
              const assignerName = assigner?.name || "Someone"
              const assignerAvatar = assigner?.avatarUrl
              const initials = assignerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              
              return (
                <div key={task.id} className="flex gap-3 p-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <Avatar className="h-8 w-8 shrink-0 ring-1 ring-slate-100 dark:ring-slate-800">
                    <AvatarImage src={assignerAvatar || undefined} alt={assignerName} referrerPolicy="no-referrer" className="object-cover" />
                    <AvatarFallback className={assignerAvatar ? "bg-slate-100 dark:bg-slate-800" : `${avatarColor(assignerName)} text-white text-[10px] font-medium`}>
                      {assignerAvatar ? <Skeleton className="h-full w-full rounded-full" /> : initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-700 dark:text-slate-300 mb-2 leading-tight mt-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{assignerName}</span> assigned you a task
                    </div>
                    
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-slate-900/50 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{task.title}</h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 pl-6">
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {task.priority}
                        </span>
                        {task.category && (
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {task.category}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            <Clock className="h-3 w-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
