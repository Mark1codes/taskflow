"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CheckCircle2, Plus, RefreshCw, User, Target, Timer } from "lucide-react"
import supabase from '@/utils/supabase'

interface ActivityEvent {
  id: string
  title: string
  action: 'created' | 'completed' | 'updated' | 'focused'
  user_name: string
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
        .select(`id, title, status, created_at, updated_at, assignee, user_id, time_spent_minutes`)
        .order('updated_at', { ascending: false })
        .limit(20)

      if (error) throw error

      // Transform into a feed of events based on timestamps
      const events: ActivityEvent[] = []
      
      const getActorName = (task: any, action: string) => {
        if (action === 'created') {
          return task.user_id === user?.id ? "Me" : "A team member"
        }
        if (task.assignee) {
          return task.assignee === user?.name ? "Me" : task.assignee
        }
        return task.user_id === user?.id ? "Me" : "Someone"
      }

      data.forEach((task: any) => {
        
        // Did they just create it?
        if (task.created_at === task.updated_at) {
          events.push({
            id: task.id + '-create',
            title: task.title,
            action: 'created',
            user_name: getActorName(task, 'created'),
            timestamp: task.created_at
          })
        } else if (task.status === 'completed') {
          events.push({
            id: task.id + '-complete',
            title: task.title,
            action: 'completed',
            user_name: getActorName(task, 'completed'),
            timestamp: task.updated_at
          })
        } else if (task.time_spent_minutes > 0) {
          events.push({
            id: task.id + '-focus',
            title: task.title,
            action: 'focused',
            user_name: getActorName(task, 'focused'),
            timestamp: task.updated_at
          })
        } else {
          events.push({
            id: task.id + '-update',
            title: task.title,
            action: 'updated',
            user_name: getActorName(task, 'updated'),
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
            <div className="p-12 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin mb-4" />
              <p>Loading activity...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No recent activity found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activities.map((item) => {
                const config = getActionConfig(item.action)
                const Icon = config.icon
                return (
                  <div key={item.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
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
