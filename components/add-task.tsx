"use client"

import type React from "react"
import supabase from '../utils/supabase'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddTaskProps {
  onAddTask: (task: any) => void
  onBack: () => void
  user: any
}

export function AddTask({ onAddTask, onBack, user }: AddTaskProps) {
  const [formData, setFormData] = useState({
    title: "", description: "", status: "todo", priority: "medium",
    dueDate: "", assignee: "", category: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true); setError(""); setSuccess(false)

    if (!user?.id) { setError("User not authenticated. Please log in."); setIsLoading(false); return }
    if (!formData.title.trim()) { setError("Task title is required"); setIsLoading(false); return }

    try {
      const { data, error: insertError } = await supabase.from('task').insert({
        title:       formData.title.trim(),
        description: formData.description.trim() || null,
        status:      formData.status,
        priority:    formData.priority,
        due_date:    formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        assignee:    formData.assignee.trim() || null,
        category:    formData.category.trim() || null,
        user_id:     user.id,
      }).select().single()

      if (insertError) {
        setError(`Failed to create task: ${insertError.message}`)
      } else {
        setSuccess(true)
        onAddTask(data)
        setFormData({ title: "", description: "", status: "todo", priority: "medium", dueDate: "", assignee: "", category: "" })
        setTimeout(() => onBack(), 1500)
      }
    } catch { setError("An unexpected error occurred. Please try again.") }
    finally { setIsLoading(false) }
  }

  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError("")
    if (success) setSuccess(false)
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f7f9fc] dark:bg-slate-950">
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Task workspace</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">Create a new task</h1>
            <p className="mt-1 text-sm text-slate-500">Capture the work, add context, and give it a clear owner.</p>
          </div>
        </div>

        <Card className="border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-5 sm:p-7">
            {error && <Alert variant="destructive" className="mb-5"><AlertDescription>{error}</AlertDescription></Alert>}

            {success && (
              <Alert className="mb-5 border-emerald-200 bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-700">Task created! Redirecting…</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm font-medium text-slate-700">Title <span className="text-red-500">*</span></Label>
                <Input id="title" placeholder="What needs to be done?" value={formData.title}
                  onChange={e => set("title", e.target.value)}
                  className="h-10 border-slate-200 focus-visible:ring-blue-500" required disabled={isLoading} />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description</Label>
                <Textarea id="description" placeholder="Add more context (optional)…" value={formData.description}
                  onChange={e => set("description", e.target.value)}
                  rows={3} className="border-slate-200 resize-none focus-visible:ring-blue-500" disabled={isLoading} />
              </div>

              {/* Priority + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Priority</Label>
                  <Select value={formData.priority} onValueChange={v => set("priority", v)} disabled={isLoading}>
                    <SelectTrigger className="border-slate-200 h-10 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Status</Label>
                  <Select value={formData.status} onValueChange={v => set("status", v)} disabled={isLoading}>
                    <SelectTrigger className="border-slate-200 h-10 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Due Date + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dueDate" className="text-sm font-medium text-slate-700">Due Date</Label>
                  <Input id="dueDate" type="date" value={formData.dueDate}
                    onChange={e => set("dueDate", e.target.value)}
                    className="h-10 border-slate-200 focus-visible:ring-blue-500" disabled={isLoading} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-sm font-medium text-slate-700">Category</Label>
                  <Input id="category" placeholder="e.g. Design, Dev…" value={formData.category}
                    onChange={e => set("category", e.target.value)}
                    className="h-10 border-slate-200 focus-visible:ring-blue-500" disabled={isLoading} />
                </div>
              </div>

              {/* Assignee */}
              <div className="space-y-1.5">
                <Label htmlFor="assignee" className="text-sm font-medium text-slate-700">Assignee</Label>
                <Input id="assignee" placeholder="Who is responsible?" value={formData.assignee}
                  onChange={e => set("assignee", e.target.value)}
                  className="h-10 border-slate-200 focus-visible:ring-blue-500" disabled={isLoading} />
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <Button type="submit" disabled={isLoading || !user || success}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10">
                  <Plus className="h-4 w-4 mr-1.5" />
                  {isLoading ? "Creating…" : success ? "Created!" : "Create Task"}
                </Button>
                <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}
                  className="flex-1 border-slate-200 text-slate-600 h-10">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
