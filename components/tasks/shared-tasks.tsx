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
}

export function SharedTasks({ tasks, onUpdateTask, onDeleteTask, user, isLoading, onStartFocus }: SharedTasksProps) {
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
          <div className="text-center py-24 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
            <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No shared tasks yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
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
      {/* We reuse TaskList for the heavy lifting but pass the filtered shared tasks */}
      <TaskList 
        tasks={sharedTasks} 
        onUpdateTask={onUpdateTask} 
        onDeleteTask={onDeleteTask} 
        user={user} 
        isLoading={isLoading} 
        onStartFocus={onStartFocus} 
      />
    </div>
  )
}
