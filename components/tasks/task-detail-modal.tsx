"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogClose 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, FileText, CheckCircle2 } from "lucide-react"
import supabase from '@/utils/supabase'

interface TaskDetailModalProps {
  task: any | null
  isOpen: boolean
  onClose: () => void
  onComplete?: (taskId: string) => void
}

const priorityColors: Record<string, string> = {
  high:   "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50",
  medium: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50",
  low:    "bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
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
  if (!name) return <div className={`flex items-center justify-center shrink-0 rounded-full bg-slate-200 ${size === 'sm' ? 'h-5 w-5' : 'h-8 w-8'} `}><User className="h-3 w-3 text-slate-400" /></div>
  const sz = size === 'sm' ? 'h-5 w-5 text-[9px]' : 'h-8 w-8 text-xs'
  if (avatarUrl) return <img src={avatarUrl} alt={name} className={`${sz} rounded-full object-cover shrink-0`} />
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`flex items-center justify-center shrink-0 rounded-full text-white font-medium ${sz} ${avatarColor(name)}`}>
      {initials}
    </div>
  )
}

export function TaskDetailModal({ task, isOpen, onClose, onComplete }: TaskDetailModalProps) {
  const [userMap, setUserMap] = useState<Record<string, {name: string; avatarUrl?: string}>>({})

  useEffect(() => {
    if (!isOpen || !task) return
    const fetchUsers = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      try {
        const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${session.access_token}` } })
        if (res.ok) {
          const json = await res.json()
          const map: Record<string, {name: string; avatarUrl?: string}> = {}
          json.users?.forEach((u: any) => map[u.id] = { name: u.full_name, avatarUrl: u.avatar_url })
          setUserMap(map)
        }
      } catch (err) {
        console.error("Failed to fetch users:", err)
      }
    }
    fetchUsers()
  }, [isOpen, task])

  if (!task) return null

  const isCompleted = task.status === 'completed'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={`uppercase tracking-wider px-2 py-0 border ${priorityColors[task.priority] ?? priorityColors.medium}`}>
              {task.priority} Priority
            </Badge>
            {task.category && (
              <Badge variant="outline" className="uppercase tracking-wider px-2 py-0 border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                {task.category}
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50 uppercase tracking-wider px-2 py-0">
                Completed
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl font-bold leading-tight mt-1 text-slate-900 dark:text-white">
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 my-2">
          {/* Details Row */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            {task.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
            {task.time_spent_minutes !== undefined && task.time_spent_minutes > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>{task.time_spent_minutes}m spent</span>
              </div>
            )}
          </div>

          {/* Assignees */}
          {task.task_assignees && task.task_assignees.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Assignees</h4>
              <div className="flex flex-wrap gap-2">
                {task.task_assignees.map((a: any) => (
                  <div 
                    key={a.id} 
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-sm ${
                      a.status === 'accepted' ? 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300' :
                      a.status === 'pending' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' :
                      'bg-red-50 border-red-200 text-red-600 line-through opacity-70 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                    }`}
                  >
                    <UserAvatar name={a.user_name} avatarUrl={userMap[a.user_id]?.avatarUrl} size="sm" />
                    <span className="font-medium">{a.user_name}</span>
                    {a.status === 'pending' && <span className="text-[10px] uppercase tracking-wide opacity-70 ml-1">(Pending)</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Description</h4>
              <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                {task.description}
              </div>
            </div>
          )}
          
          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Subtasks</h4>
              <div className="space-y-2">
                {task.subtasks.map((st: any) => (
                  <div key={st.id} className="flex items-start gap-3">
                    <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${st.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                    <span className={`text-sm ${st.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion Note */}
          {isCompleted && task.completion_note && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">Completion Note</h4>
              <div className="text-sm text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-100 dark:border-emerald-800/50">
                {task.completion_note}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {!isCompleted && onComplete && (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onComplete(task.id)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
