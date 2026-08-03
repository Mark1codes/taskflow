"use client"

import { TaskList } from "./task-list"
import { Users } from "lucide-react"

interface SharedTasksProps {
  tasks: any[]
  onUpdateTask: (taskId: string, updates: any) => void
  onDeleteTask: (taskId: string) => void
  user: any
  isLoading?: boolean
  onStartFocus?: (task: any) => void
  openTaskId?: string | null
  onClearOpenTask?: () => void
}

export function SharedTasks({ tasks, onUpdateTask, onDeleteTask, user, isLoading, onStartFocus, openTaskId, onClearOpenTask }: SharedTasksProps) {
  // Filter tasks where the current user is an accepted assignee BUT NOT the creator
  const sharedTasks = tasks.filter(t => 
    t.user_id !== user?.id && 
    t.task_assignees?.some((a: any) => a.user_id === user?.id && a.status === 'accepted')
  )

  if (!isLoading && sharedTasks.length === 0) {
    return (
      <div className="p-4 sm:p-6 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" /> Shared with Me
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tasks assigned to you by other team members</p>
            </div>
          </div>
          <div className="text-center py-24 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800/60 border-dashed flex flex-col items-center justify-center">
            <div className="relative h-48 w-48 mb-8 mt-4">
              <div className="absolute inset-0 bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-3xl animate-pulse"></div>
              <svg viewBox="0 0 200 200" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
                <style>
                  {`
                    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                    .anim-float { animation: float 6s ease-in-out infinite; }
                    .anim-float-delay { animation: float 6s ease-in-out infinite; animation-delay: 1.5s; }
                  `}
                </style>
                <g className="anim-float">
                  <circle cx="85" cy="100" r="32" fill="currentColor" className="text-white dark:text-slate-800 drop-shadow-lg" />
                  <circle cx="85" cy="100" r="30" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="2" />
                  <circle cx="85" cy="90" r="10" fill="currentColor" className="text-slate-200 dark:text-slate-600" />
                  <path d="M65 115 C65 105, 105 105, 105 115" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" className="text-slate-200 dark:text-slate-600" />
                </g>
                <g className="anim-float-delay">
                  <circle cx="125" cy="85" r="28" fill="currentColor" className="text-white dark:text-slate-800 drop-shadow-md" />
                  <circle cx="125" cy="85" r="26" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="2" />
                  <circle cx="125" cy="77" r="8" fill="currentColor" className="text-slate-200 dark:text-slate-600" />
                  <path d="M109 100 C109 92, 141 92, 141 100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" className="text-slate-200 dark:text-slate-600" />
                </g>
                <path d="M160 30 L163 38 L171 41 L163 44 L160 52 L157 44 L149 41 L157 38 Z" fill="currentColor" className="text-violet-400 animate-pulse" />
                <path d="M40 140 L42 145 L47 147 L42 149 L40 154 L38 149 L33 147 L38 145 Z" fill="currentColor" className="text-amber-400 animate-pulse" style={{ animationDelay: '1s' }} />
              </svg>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">No shared tasks yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-base">
              When other team members invite you to collaborate on their tasks and you accept, they will appear here.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="shared-tasks-wrapper">
      <div className="px-4 sm:px-6 pt-6 pb-2 max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" /> Shared with Me
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tasks assigned to you by other team members</p>
      </div>
      <TaskList 
        tasks={sharedTasks} 
        onUpdateTask={onUpdateTask} 
        onDeleteTask={onDeleteTask} 
        user={user} 
        isLoading={isLoading} 
        onStartFocus={onStartFocus} 
        openTaskId={openTaskId}
        onClearOpenTask={onClearOpenTask}
      />
    </div>
  )
}
