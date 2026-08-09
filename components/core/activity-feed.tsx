"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CheckCircle2, Plus, RefreshCw, User, Target, Timer } from "lucide-react"
import supabase from '@/utils/supabase'
import { getAvatarDisplayUrl } from "@/utils/avatar"

interface ActivityEvent {
  id: string
  title: string
  action: 'created' | 'completed' | 'updated' | 'focused'
  user_name: string
  avatar?: string
  timestamp: string
}

interface ActivityFeedProps {
  user?: any
}

export function ActivityFeed({ user }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      // Fetch the 20 most recently updated tasks
      const { data, error } = await supabase
        .from('task')
        .select(`id, title, status, created_at, updated_at, assignee, user_id, time_spent_minutes, completed_by_name, completed_by_id`)
        .order('updated_at', { ascending: false })
        .limit(20)

      if (error) throw error

      // Fetch owner and completer details for avatars and names
      const userIds = Array.from(new Set(
        data.flatMap(t => [t.user_id, t.completed_by_id]).filter(Boolean)
      ))
      
      let usersData: any[] = []
      if (userIds.length > 0) {
        const { data: ud } = await supabase.from('users').select('id, full_name, avatar_url, avatar_path').in('id', userIds)
        if (ud) usersData = ud
      }

      const userMap = new Map()
      for (const u of usersData) {
        const avatar = await getAvatarDisplayUrl(supabase, u.avatar_path, u.avatar_url || "")
        userMap.set(u.id, { name: u.full_name, avatar })
      }

      // Transform into a feed of events based on timestamps
      const events: ActivityEvent[] = []
      
      const getActor = (task: any, action: string) => {
        const owner = userMap.get(task.user_id) || { name: "A team member", avatar: undefined }
        
        if (action === 'completed' && task.completed_by_name) {
          if (task.completed_by_name === user?.name) return { name: "Me", avatar: user?.avatar }
          
          const completer = task.completed_by_id ? userMap.get(task.completed_by_id) : undefined
          return { name: task.completed_by_name, avatar: completer?.avatar }
        }
        
        if (action === 'created') {
          if (task.user_id === user?.id) return { name: "Me", avatar: user?.avatar }
          return owner
        }
        
        if (task.assignee) {
          if (task.assignee === user?.name) return { name: "Me", avatar: user?.avatar }
          return { name: task.assignee, avatar: undefined }
        }
        
        if (task.user_id === user?.id) return { name: "Me", avatar: user?.avatar }
        return owner
      }

      data.forEach((task: any) => {
        const isCreate = task.created_at === task.updated_at
        
        if (isCreate) {
          const actor = getActor(task, 'created')
          events.push({
            id: task.id + '-create',
            title: task.title,
            action: 'created',
            user_name: actor.name,
            avatar: actor.avatar,
            timestamp: task.created_at
          })
        } else if (task.status === 'completed') {
          const actor = getActor(task, 'completed')
          events.push({
            id: task.id + '-complete',
            title: task.title,
            action: 'completed',
            user_name: actor.name,
            avatar: actor.avatar,
            timestamp: task.updated_at
          })
        } else if (task.time_spent_minutes > 0) {
          const actor = getActor(task, 'focused')
          events.push({
            id: task.id + '-focus',
            title: task.title,
            action: 'focused',
            user_name: actor.name,
            avatar: actor.avatar,
            timestamp: task.updated_at
          })
        } else {
          const actor = getActor(task, 'updated')
          events.push({
            id: task.id + '-update',
            title: task.title,
            action: 'updated',
            user_name: actor.name,
            avatar: actor.avatar,
            timestamp: task.updated_at
          })
        }
      })

      // Sort by newest first
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      setActivities(events)
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const fmtTime = (ts: string) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'created':   return { icon: Plus, color: 'text-blue-500', bg: 'bg-blue-50', text: 'created task' }
      case 'completed': return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', text: 'completed task' }
      case 'focused':   return { icon: Timer, color: 'text-amber-500', bg: 'bg-amber-50', text: 'logged focus time on' }
      default:          return { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-50', text: 'updated task' }
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f7f9fc] dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Workspace</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">Activity Feed</h1>
            <p className="mt-1 text-sm text-slate-500">Real-time updates on what's happening.</p>
          </div>
          <button onClick={fetchActivities} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <RefreshCw className={`h-4 w-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading && activities.length === 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-4 sm:p-5 flex items-start gap-4 animate-pulse">
                  <div className="mt-0.5 h-10 w-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center dark:bg-slate-950/50">
              <div className="relative h-48 w-48 mb-8 mt-4">
                <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <svg viewBox="0 0 200 200" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
                  <style>
                    {`
                      @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                      @keyframes slideRight { 0% { opacity: 0; transform: translateX(-10px); } 100% { opacity: 1; transform: translateX(0); } }
                      .anim-float { animation: float 6s ease-in-out infinite; }
                      .anim-slide-1 { animation: slideRight 0.5s ease-out forwards; animation-delay: 0.2s; opacity: 0; }
                      .anim-slide-2 { animation: slideRight 0.5s ease-out forwards; animation-delay: 0.4s; opacity: 0; }
                      .anim-slide-3 { animation: slideRight 0.5s ease-out forwards; animation-delay: 0.6s; opacity: 0; }
                    `}
                  </style>
                  <g className="anim-float">
                    <rect x="40" y="40" width="120" height="120" rx="16" fill="currentColor" className="text-white dark:text-slate-800 drop-shadow-xl" />
                    <rect x="42" y="42" width="116" height="116" rx="14" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="2" />
                    
                    <g className="anim-slide-1">
                      <circle cx="65" cy="70" r="8" fill="currentColor" className="text-blue-500" />
                      <rect x="85" y="67" width="55" height="6" rx="3" fill="currentColor" className="text-slate-200 dark:text-slate-600" />
                    </g>
                    
                    <g className="anim-slide-2">
                      <circle cx="65" cy="100" r="8" fill="currentColor" className="text-emerald-500" />
                      <rect x="85" y="97" width="40" height="6" rx="3" fill="currentColor" className="text-slate-200 dark:text-slate-600" />
                    </g>
                    
                    <g className="anim-slide-3">
                      <circle cx="65" cy="130" r="8" fill="currentColor" className="text-amber-500" />
                      <rect x="85" y="127" width="65" height="6" rx="3" fill="currentColor" className="text-slate-200 dark:text-slate-600" />
                    </g>
                  </g>
                  <path d="M165 35 L168 43 L176 46 L168 49 L165 57 L162 49 L154 46 L162 43 Z" fill="currentColor" className="text-amber-400 animate-pulse" />
                  <path d="M25 140 L27 146 L33 148 L27 150 L25 156 L23 150 L17 148 L23 146 Z" fill="currentColor" className="text-indigo-400 animate-pulse" style={{ animationDelay: '1s' }} />
                </svg>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">No recent activity</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-base">
                Looks like things are quiet right now. Check back later for updates on your workspace.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activities.map((item) => {
                const config = getActionConfig(item.action)
                const Icon = config.icon
                return (
                  <div key={item.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden ${config.bg}`}>
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.user_name} className="h-full w-full object-cover" />
                      ) : (
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 leading-snug">
                        <span className="font-semibold">{item.user_name}</span>{' '}
                        <span className="text-slate-500">{config.text}</span>{' '}
                        <span className="font-medium">"{item.title}"</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1.5">{fmtTime(item.timestamp)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
