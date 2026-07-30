"use client"

import { useState } from "react"
import { CheckCircle2, Bell, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CompleteTaskDialog } from "./complete-task-dialog"

interface InboxProps {
  tasks: any[]
  user: any
  onUpdateTask: (taskId: string, updates: any) => Promise<void> | void
}

export function Inbox({ tasks, user, onUpdateTask }: InboxProps) {
  const [taskToComplete, setTaskToComplete] = useState<any>(null)

  // Determine user's name for matching assignees
  const userName = user?.name || user?.user_metadata?.full_name || user?.email

  // Filter tasks assigned to the current user that are not completed
  const assignedTasks = tasks.filter(t => 
    t.assignee === userName && t.status !== 'completed'
  )

  const handleConfirmComplete = async (note: string) => {
    if (!taskToComplete) return
    const updates: any = { status: 'completed' }
    if (note) updates.completion_note = note
    
    await onUpdateTask(taskToComplete.id, updates)
  }

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
            <p className="mt-1 text-sm text-slate-500">Tasks assigned specifically to you that need attention.</p>
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
              You're all caught up! There are no pending tasks assigned to you right now.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1 p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.category && (
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {task.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                        {task.description}
                      </p>
                    )}
                    {task.due_date && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-3">
                        <Clock className="h-3.5 w-3.5" />
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 flex sm:flex-col items-center justify-center sm:w-48 gap-3">
                    <Button 
                      onClick={() => setTaskToComplete(task)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CompleteTaskDialog
        isOpen={!!taskToComplete}
        onClose={() => setTaskToComplete(null)}
        onConfirm={handleConfirmComplete}
        taskTitle={taskToComplete?.title || ""}
      />
    </div>
  )
}
