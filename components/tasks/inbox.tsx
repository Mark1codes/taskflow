"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Bell, Clock, User } from "lucide-react"
import { Card } from "@/components/ui/card"
import supabase from "@/utils/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
      } catch (err) {}
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
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {assignedTasks.length} pending
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
        ) : (
          <div className="space-y-4">
            {assignedTasks.map((task) => {
              const assigner = userMap[task.user_id]
              const assignerName = assigner?.name || "Someone"
              const assignerAvatar = assigner?.avatarUrl
              const initials = assignerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              
              return (
                <Card key={task.id} className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center p-5 gap-4">
                    <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white dark:ring-slate-900 hidden sm:block">
                      <AvatarImage src={assignerAvatar || undefined} alt={assignerName} referrerPolicy="no-referrer" className="object-cover" />
                      <AvatarFallback className={`${avatarColor(assignerName)} text-white font-medium`}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
                        <Avatar className="h-5 w-5 shrink-0 ring-1 ring-slate-200 dark:ring-slate-800 sm:hidden">
                          <AvatarImage src={assignerAvatar || undefined} alt={assignerName} referrerPolicy="no-referrer" className="object-cover" />
                          <AvatarFallback className={`${avatarColor(assignerName)} text-white text-[8px] font-medium`}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          <span className="font-semibold text-slate-900 dark:text-white">{assignerName}</span> has assigned you a task:
                        </span>
                      </p>
                      <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">{task.title}</h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.category && (
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {task.category}
                          </span>
                        )}
                        {task.due_date && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
