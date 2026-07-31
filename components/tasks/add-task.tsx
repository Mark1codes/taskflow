"use client"

import type React from "react"
import supabase from '@/utils/supabase'
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, CheckCircle2, Sparkles, Wand2, Lightbulb, Search, X, User, Trash2, Link as LinkIcon, Paperclip, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

interface AddTaskProps {
  onAddTask: (task: any) => void
  onBack: () => void
  user: any
  tasks?: any[]
}

type AppUser = { id: string; full_name: string; avatar_url?: string }
interface PendingAttachment { id: string; file: File; preview?: string }

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

function UserAvatar({ name, avatarUrl, size = 'sm' }: { name: string; avatarUrl?: string; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs'

  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${sz} rounded-full object-cover shrink-0`} />
  }

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`flex items-center justify-center shrink-0 rounded-full text-white font-medium ${sz} ${avatarColor(name)}`}>
      {initials}
    </div>
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
  const [selectedUsers, setSelectedUsers] = useState<AppUser[]>([])
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

  // Attachments
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const attachmentInputRef = useRef<HTMLInputElement>(null)

  const addFiles = (files: FileList | File[]) => {
    const MAX = 10 * 1024 * 1024
    const next: PendingAttachment[] = []
    Array.from(files).forEach(file => {
      if (file.size > MAX) return
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      next.push({ id: crypto.randomUUID(), file, preview })
    })
    setPendingAttachments(prev => [...prev, ...next])
  }

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
  }

  const removePendingAttachment = (id: string) => {
    setPendingAttachments(prev => {
      const att = prev.find(a => a.id === id)
      if (att?.preview) URL.revokeObjectURL(att.preview)
      return prev.filter(a => a.id !== id)
    })
  }

  // Clipboard paste → attach image
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      const files: File[] = []
      Array.from(items).forEach(item => {
        if (item.kind === 'file') { const f = item.getAsFile(); if (f) files.push(f) }
      })
      if (files.length > 0) addFiles(files)
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        ? { id: user.id, full_name: user.name, avatar_url: user.avatar }
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

  const toggleAssignee = (u: AppUser) => {
    setSelectedUsers(prev => {
      if (prev.some(p => p.id === u.id)) {
        return prev.filter(p => p.id !== u.id)
      }
      return [...prev, u]
    })
    setSearch('')
  }

  const clearAssignees = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSelectedUsers([])
    setSearch('')
  }

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase())
  )

  const uploadAttachments = async (taskId: string) => {
    for (const att of pendingAttachments) {
      try {
        const ext = att.file.name.split('.').pop() || 'bin'
        const filePath = `${taskId}/${att.id}.${ext}`
        const { error: uploadError } = await supabase.storage.from('task-attachments').upload(filePath, att.file)
        if (uploadError) { console.error('Upload error:', uploadError.message); continue }
        const { data: { publicUrl } } = supabase.storage.from('task-attachments').getPublicUrl(filePath)
        await supabase.from('task_attachments').insert({
          task_id: taskId, uploaded_by: user.id, file_name: att.file.name,
          file_path: filePath, file_type: att.file.type || 'application/octet-stream',
          file_size: att.file.size, url: publicUrl,
        })
        if (att.preview) URL.revokeObjectURL(att.preview)
      } catch (err) { console.error('Attachment upload failed:', err) }
    }
  }

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
        category:    formData.category.trim() || null,
        user_id:     user.id,
        subtasks:    subtasks,
        time_spent_minutes: 0,
        blocked_by_id: formData.blocked_by_id === "none" ? null : formData.blocked_by_id,
      }).select().single()

      if (insertError) {
        setError(`Failed to create task: ${insertError.message}`)
      } else {
        if (selectedUsers.length > 0) {
          const assigneesToInsert = selectedUsers.map(u => ({
            task_id: data.id,
            user_id: u.id,
            user_name: u.full_name,
            status: u.id === user.id ? 'accepted' : 'pending'
          }))
          await supabase.from('task_assignees').insert(assigneesToInsert)
        }

        if (pendingAttachments.length > 0) await uploadAttachments(data.id)
        setSuccess(true)
        onAddTask(data)
        setFormData({ title: "", description: "", status: "todo", priority: "medium", dueDate: "", assignee: "", category: "", blocked_by_id: "none" })
        setSubtasks([])
        setSelectedUsers([])
        setPendingAttachments([])
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
                    className="flex min-h-[40px] w-full flex-wrap items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {selectedUsers.length > 0 ? (
                      <>
                        <div className="flex flex-1 flex-wrap gap-1.5">
                          {selectedUsers.map(u => (
                            <span key={u.id} className="flex items-center gap-1.5 rounded-full bg-slate-100 pl-1 pr-2 py-0.5 text-xs font-medium text-slate-700">
                              <UserAvatar name={u.full_name} avatarUrl={u.avatar_url} />
                              {u.full_name}
                              <X 
                                className="h-3 w-3 cursor-pointer text-slate-400 hover:text-slate-600 ml-0.5" 
                                onClick={(e) => { e.stopPropagation(); toggleAssignee(u); }} 
                              />
                            </span>
                          ))}
                        </div>
                        <span
                          role="button"
                          onClick={clearAssignees}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 self-start mt-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </span>
                      </>
                    ) : (
                      <div className="flex w-full items-center gap-2 px-1 py-0.5">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="flex-1 text-left text-slate-400">Assign to people…</span>
                      </div>
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
                          const isSelected = selectedUsers.some(su => su.id === u.id)
                          return (
                            <li key={u.id}>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); toggleAssignee(u); }}
                                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 ${isSelected ? 'bg-blue-50' : ''}`}
                              >
                                <UserAvatar name={u.full_name} avatarUrl={u.avatar_url} size="md" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                    {u.full_name}
                                    {isMe && (
                                      <span className="text-[10px] font-semibold rounded px-1.5 py-0.5 bg-blue-100 text-blue-600">You</span>
                                    )}
                                  </p>
                                  {isSelected && (
                                    <p className="text-[11px] text-blue-500">Selected</p>
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

              {/* Attachments */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5" />
                  Attachments
                  <span className="text-slate-400 font-normal text-xs">(optional · paste, drag &amp; drop, or click)</span>
                </Label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => attachmentInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-5 text-center transition-colors ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/50'
                  }`}
                >
                  <input ref={attachmentInputRef} type="file" multiple accept="image/*,.pdf,.docx,.doc,.txt,.xlsx,.pptx" className="hidden" onChange={handleFilePick} />
                  <Paperclip className="h-6 w-6 text-slate-300 mb-1.5" />
                  <p className="text-sm font-medium text-slate-500">Drop files, paste a screenshot, or click to upload</p>
                  <p className="text-xs text-slate-400 mt-0.5">Images, PDF, DOCX, TXT · Max 10MB each</p>
                </div>
                {pendingAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pendingAttachments.map(att => (
                      <div key={att.id} className="group relative h-16 w-16 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                        {att.preview ? (
                          <img src={att.preview} alt={att.file.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-0.5 p-1">
                            <FileText className="h-5 w-5 text-slate-400" />
                            <p className="text-[8px] text-slate-500 text-center leading-tight line-clamp-2">{att.file.name}</p>
                          </div>
                        )}
                        <button type="button" onClick={(e) => { e.stopPropagation(); removePendingAttachment(att.id) }}
                          className="absolute top-0.5 right-0.5 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
