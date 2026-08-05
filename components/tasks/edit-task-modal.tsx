"use client"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Search, X, CheckCircle2 } from "lucide-react"
import supabase from '@/utils/supabase'

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: any
  currentUser: any
  onSave: (taskId: string, updates: any) => Promise<void> | void
}

type AppUser = { id: string; full_name: string; avatar_url?: string }

function avatarColor(name: string) {
  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-pink-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function UserAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const szClass = 'h-6 w-6 text-[10px]'
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${szClass} rounded-full object-cover ring-2 ring-white dark:ring-slate-900`} />
  }
  return (
    <div className={`${szClass} flex items-center justify-center rounded-full ${avatarColor(name || "")} text-white font-medium ring-2 ring-white dark:ring-slate-900`}>
      {initials}
    </div>
  )
}

export function EditTaskModal({ isOpen, onClose, task, currentUser, onSave }: EditTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("")
  const [category, setCategory] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Assignee state
  const [users, setUsers] = useState<AppUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<AppUser[]>([])
  const pickerRef = useRef<HTMLDivElement>(null)

  // Fetch users for the picker
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setUsersLoading(true)
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) return
          
          const res = await fetch('/api/users', {
            headers: { Authorization: `Bearer ${session.access_token}` }
          })
          
          if (res.ok) {
            const json = await res.json()
            setUsers(json.users as AppUser[])
          }
        } catch (err) {
          console.error("Error fetching users for edit modal:", err)
        } finally {
          setUsersLoading(false)
        }
      }
      fetchUsers()
    }
  }, [isOpen])

  // Initialize state when task changes OR users finish loading
  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setPriority(task.priority || "low")
      setCategory(task.category || "Work")
      setDueDate(task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : "")
      
      // Populate assignees from existing task, mapping against fetched users to get avatar URLs
      if (task.task_assignees) {
        const existingAssignees = task.task_assignees.map((a: any) => {
          // Try to find the user in the fully loaded users list to get their avatar
          const matchedUser = users.find(u => u.id === a.user_id)
          return {
            id: a.user_id,
            full_name: a.user_name,
            avatar_url: matchedUser?.avatar_url
          }
        })
        setSelectedUsers(existingAssignees)
      } else {
        setSelectedUsers([])
      }
    }
  }, [task, isOpen, users])

  // Click outside to close picker
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
      if (prev.some(p => p.id === u.id)) return prev.filter(p => p.id !== u.id)
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

  const handleSave = async () => {
    if (!task) return
    setIsSaving(true)
    try {
      // 1. Update basic task info
      await onSave(task.id, {
        title,
        description,
        priority,
        category,
        due_date: dueDate ? new Date(dueDate).toISOString() : null
      })

      // 2. Diff and update assignees
      const existingIds = (task.task_assignees || []).map((a: any) => a.user_id)
      const selectedIds = selectedUsers.map(u => u.id)
      
      const toAdd = selectedUsers.filter(u => !existingIds.includes(u.id))
      const toRemove = existingIds.filter((id: string) => !selectedIds.includes(id))

      // Insert new assignees
      if (toAdd.length > 0) {
        const assigneesToInsert = toAdd.map(u => ({
          task_id: task.id,
          user_id: u.id,
          user_name: u.full_name,
          status: u.id === currentUser?.id ? 'accepted' : 'pending' // auto-accept if assigning yourself
        }))
        await supabase.from('task_assignees').insert(assigneesToInsert)
      }

      // Delete removed assignees
      if (toRemove.length > 0) {
        await supabase.from('task_assignees').delete().eq('task_id', task.id).in('user_id', toRemove)
      }

      onClose()
    } catch (err) {
      console.error("Failed to update task", err)
    } finally {
      setIsSaving(false)
    }
  }

  if (!task) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Edit Task
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, links, or notes..."
              className="min-h-[100px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 resize-y"
            />
          </div>
          
          <div className="space-y-2 relative" ref={pickerRef}>
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assignees</Label>
            <button
              type="button"
              onClick={() => setPickerOpen(v => !v)}
              className="flex min-h-[40px] w-full flex-wrap items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {selectedUsers.length > 0 ? (
                <>
                  <div className="flex flex-1 flex-wrap gap-1.5">
                    {selectedUsers.map(u => (
                      <span key={u.id} className="flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-1 pr-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-200">
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
                    className="rounded p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 self-start mt-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                </>
              ) : (
                <div className="flex w-full items-center gap-2 px-1 py-0.5">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="flex-1 text-left text-slate-400">Assign to people...</span>
                </div>
              )}
            </button>

            {pickerOpen && (
              <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 px-3 py-2">
                  <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search members..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400"
                  />
                </div>
                <ul className="max-h-48 overflow-y-auto py-1">
                  {usersLoading && (
                    <li className="px-3 py-4 text-center text-xs text-slate-400">Loading members...</li>
                  )}
                  {!usersLoading && filteredUsers.length === 0 && (
                    <li className="px-3 py-4 text-center text-xs text-slate-400">
                      {search ? `No results for "${search}"` : 'No members found'}
                    </li>
                  )}
                  {filteredUsers.map(u => {
                    const isMe = u.id === currentUser?.id
                    const isSelected = selectedUsers.some(su => su.id === u.id)
                    return (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => toggleAssignee(u)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <UserAvatar name={u.full_name} avatarUrl={u.avatar_url} />
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              {u.full_name}
                            </span>
                            {isMe && (
                              <span className="rounded-full bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                                You
                              </span>
                            )}
                          </div>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-500" />}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Errands">Errands</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Due Date</Label>
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={handleSave} 
            disabled={isSaving || !title.trim()}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
