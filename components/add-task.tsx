"use client"

import type React from "react"
import supabase from '../utils/supabase'
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, CheckCircle2, Sparkles, Wand2, Lightbulb, Search, X, User, Trash2, Link as LinkIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

interface AddTaskProps {
  onAddTask: (task: any) => void
  onBack: () => void
  user: any
  tasks?: any[]
}

type AppUser = { id: string; full_name: string }

// Generate a consistent pastel color from a string
function avatarColor(name: string) {
  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-pink-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function UserAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const sz = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs'
  return (
    <span className={`${sz} ${avatarColor(name)} inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0`}>
      {initials}
    </span>
  )
}

export function AddTask({ onAddTask, onBack, user, tasks = [] }: AddTaskProps) {
  const [formData, setFormData] = useState({
    title: "", description: "", status: "todo", priority: "medium",
    dueDate: "", assignee: "", category: "", blocked_by_id: "none",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Assignee picker state
  const [users, setUsers] = useState<AppUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Subtasks state
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([])
  const [newSubtask, setNewSubtask] = useState("")

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return
    setSubtasks([...subtasks, { id: crypto.randomUUID(), title: newSubtask.trim(), completed: false }])
    setNewSubtask("")
  }

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id))
  }

  // Utility: update a single form field and clear error/success states
  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError("")
    if (success) setSuccess(false)
  }

  // Fetch registered users on mount — always seed with yourself first
  useEffect(() => {
    const load = async () => {
      setUsersLoading(true)
      // Always add current user as the first option so "assign to myself" always works
      const selfEntry: AppUser | null = user?.id && user?.name
        ? { id: user.id, full_name: user.name }
        : null

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          if (selfEntry) setUsers([selfEntry])
          return
        }
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (res.ok) {
          const json = await res.json()
          const fetched: AppUser[] = json.users ?? []
          // Merge: put self first, then everyone else (avoid duplicates)
          const others = fetched.filter(u => u.id !== selfEntry?.id)
          setUsers(selfEntry ? [selfEntry, ...others] : fetched)
        } else {
          // API failed — at minimum show yourself
          if (selfEntry) setUsers([selfEntry])
        }
      } catch {
        if (selfEntry) setUsers([selfEntry])
      } finally {
        setUsersLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close picker when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectAssignee = (u: AppUser) => {
    setSelectedUser(u)
    set('assignee', u.full_name)
    setPickerOpen(false)
    setSearch('')
  }

  const clearAssignee = () => {
    setSelectedUser(null)
    set('assignee', '')
    setSearch('')
  }

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase())
  )

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
        subtasks:    subtasks,
        time_spent_minutes: 0,
        blocked_by_id: formData.blocked_by_id === "none" ? null : formData.blocked_by_id,
      }).select().single()

      if (insertError) {
        setError(`Failed to create task: ${insertError.message}`)
      } else {
        setSuccess(true)
        onAddTask(data)
        setFormData({ title: "", description: "", status: "todo", priority: "medium", dueDate: "", assignee: "", category: "", blocked_by_id: "none" })
        setSubtasks([])
        setTimeout(() => onBack(), 1500)
      }
    } catch { setError("An unexpected error occurred. Please try again.") }
    finally { setIsLoading(false) }
  }

  const handleAIGenerate = async (type: 'description' | 'ideas') => {
    if (!formData.title.trim()) {
      setError("Please enter a task title first so the AI knows what to write about.");
      return;
    }
    
    setIsLoading(true);
    set("description", "AI is thinking...");

    const prompt = type === 'description' 
      ? `Write a short, professional project brief and description for a task titled "${formData.title}". Keep it concise, using markdown. Include Objectives and Next Steps.`
      : `Brainstorm some quick ideas, potential approaches, and risks for a task titled "${formData.title}". Keep it concise and use markdown bullet points.`;

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ type: 'user', content: prompt }] }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate content');
      
      set("description", data.reply?.trim() || "");
    } catch (err: any) {
      setError(err.message || "Failed to generate AI content");
      set("description", "");
    } finally {
      setIsLoading(false);
    }
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
                <div className="relative">
                  <Textarea id="description" placeholder="Add more context (optional)…" value={formData.description}
                    onChange={e => set("description", e.target.value)}
                    rows={4} className="border-slate-200 pr-10 resize-none focus-visible:ring-blue-500" disabled={isLoading} />
                  
                  {/* AI Assistant Button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className="absolute bottom-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-transform hover:scale-110 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1">
                        <Sparkles className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="text-xs text-slate-500">AI Assistant</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleAIGenerate('description')} className="cursor-pointer text-sm">
                        <Wand2 className="mr-2 h-4 w-4 text-blue-600" />
                        Write description
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAIGenerate('ideas')} className="cursor-pointer text-sm">
                        <Lightbulb className="mr-2 h-4 w-4 text-amber-500" />
                        Brainstorm ideas
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Subtasks */}
              <div className="space-y-3 pt-2">
                <Label className="text-sm font-medium text-slate-700">Sub-tasks (Optional)</Label>
                <div className="space-y-2">
                  {subtasks.map((st, i) => (
                    <div key={st.id} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-md px-3 py-2 text-sm">
                      <div className="h-4 w-4 rounded-full border border-slate-300 bg-white" />
                      <span className="flex-1 text-slate-700">{st.title}</span>
                      <button type="button" onClick={() => handleRemoveSubtask(st.id)} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a sub-task…"
                      value={newSubtask}
                      onChange={e => setNewSubtask(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                      className="h-10 border-slate-200 focus-visible:ring-blue-500"
                    />
                    <Button type="button" onClick={handleAddSubtask} variant="secondary" className="h-10 px-3">
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Priority + Status + Blocker */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    <LinkIcon className="h-3.5 w-3.5" /> Blocked By
                  </Label>
                  <Select value={formData.blocked_by_id} onValueChange={(v) => set("blocked_by_id", v)} disabled={isLoading}>
                    <SelectTrigger className="border-slate-200 h-10 focus:ring-blue-500">
                      <SelectValue placeholder="No blockers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No blockers</SelectItem>
                      {tasks.filter(t => t.status !== 'completed').map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                      ))}
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
                  <Input id="category" list="category-options" placeholder="e.g. Design, Dev…" value={formData.category}
                    onChange={e => set("category", e.target.value)}
                    className="h-10 border-slate-200 focus-visible:ring-blue-500" disabled={isLoading} />
                  <datalist id="category-options">
                    <option value="Design" />
                    <option value="Development" />
                    <option value="Marketing" />
                    <option value="Operations" />
                    <option value="Personal" />
                  </datalist>
                </div>
              </div>

              {/* Assignee */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Assignee</Label>
                <div ref={pickerRef} className="relative">
                  {/* Trigger button */}
                  <button
                    type="button"
                    onClick={() => setPickerOpen(v => !v)}
                    className="flex h-10 w-full items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {selectedUser ? (
                      <>
                        <UserAvatar name={selectedUser.full_name} />
                        <span className="flex-1 text-left font-medium text-slate-900">{selectedUser.full_name}</span>
                        <span
                          role="button"
                          onClick={(e) => { e.stopPropagation(); clearAssignee() }}
                          className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <X className="h-3.5 w-3.5" />
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="flex-1 text-left text-slate-400">Assign to someone…</span>
                      </>
                    )}
                  </button>

                  {/* Dropdown */}
                  {pickerOpen && (
                    <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
                      {/* Search input */}
                      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
                        <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search members…"
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                        />
                      </div>

                      {/* User list */}
                      <ul className="max-h-48 overflow-y-auto py-1">
                        {usersLoading && (
                          <li className="px-3 py-4 text-center text-xs text-slate-400">Loading members…</li>
                        )}
                        {!usersLoading && filteredUsers.length === 0 && (
                          <li className="px-3 py-4 text-center text-xs text-slate-400">
                            {search ? `No results for "${search}"` : 'No members found'}
                          </li>
                        )}
                        {filteredUsers.map(u => {
                          const isMe = u.id === user?.id
                          const isSelected = selectedUser?.id === u.id
                          return (
                            <li key={u.id}>
                              <button
                                type="button"
                                onClick={() => selectAssignee(u)}
                                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 ${isSelected ? 'bg-blue-50' : ''}`}
                              >
                                <UserAvatar name={u.full_name} size="md" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                    {u.full_name}
                                    {isMe && (
                                      <span className="text-[10px] font-semibold rounded px-1.5 py-0.5 bg-blue-100 text-blue-600">You</span>
                                    )}
                                  </p>
                                  {isSelected && (
                                    <p className="text-[11px] text-blue-500">Currently assigned</p>
                                  )}
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                                )}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </div>
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
