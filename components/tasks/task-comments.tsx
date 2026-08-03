"use client"
import { useState, useEffect, useRef } from "react"
import supabase from '@/utils/supabase'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Paperclip, Send, Loader2, FileText, Image as ImageIcon, X } from "lucide-react"

interface Attachment {
  name: string
  url: string
  type: string
  size: number
}

interface Comment {
  id: string
  user_id: string
  user_name: string
  content: string
  attachments: Attachment[]
  created_at: string
}

interface TaskCommentsProps {
  taskId: string
  currentUser: any
}

function avatarColor(name: string) {
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-pink-500']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function TaskComments({ taskId, currentUser }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [userMap, setUserMap] = useState<Record<string, {name: string; avatarUrl?: string}>>({})

  useEffect(() => {
    fetchUsers()
    fetchComments()
    
    // Set up realtime subscription for comments
    const channel = supabase.channel(`comments_${taskId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_comments', filter: `task_id=eq.${taskId}` }, (payload) => {
        fetchComments() // Re-fetch to get user avatars/data if needed, or simply append
      })
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [taskId])

  // Scroll to bottom when comments change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [comments])

  const fetchUsers = async () => {
    try {
      const { data } = await supabase.from('users').select('id, full_name, avatar_url')
      if (data) {
        const map: Record<string, any> = {}
        data.forEach(u => {
          map[u.id] = { name: u.full_name, avatarUrl: u.avatar_url }
        })
        setUserMap(map)
      }
    } catch (err) {
      console.error("Error fetching users for comments:", err)
    }
  }

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })
        
      if (error) throw error
      setComments(data || [])
    } catch (err) {
      console.error("Error fetching comments:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setAttachments(prev => [...prev, ...filesArray])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const uploadAttachments = async (): Promise<Attachment[]> => {
    const uploadedAttachments: Attachment[] = []
    
    for (const file of attachments) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${taskId}/${fileName}`
      
      const { data, error } = await supabase.storage
        .from('task_attachments')
        .upload(filePath, file)
        
      if (error) {
        console.error("Error uploading file:", error)
        continue
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('task_attachments')
        .getPublicUrl(filePath)
        
      uploadedAttachments.push({
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size
      })
    }
    
    return uploadedAttachments
  }

  const handleSubmit = async () => {
    if ((!newComment.trim() && attachments.length === 0) || !currentUser) return
    
    setIsSubmitting(true)
    try {
      let uploadedFiles: Attachment[] = []
      if (attachments.length > 0) {
        setIsUploading(true)
        uploadedFiles = await uploadAttachments()
        setIsUploading(false)
      }
      
      const { error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: currentUser.id,
          user_name: currentUser.name || "User",
          content: newComment.trim(),
          attachments: uploadedFiles
        })
        
      if (error) throw error
      
      setNewComment("")
      setAttachments([])
      if (fileInputRef.current) fileInputRef.current.value = ""
      
    } catch (err) {
      console.error("Error submitting comment:", err)
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 mt-4">
      {/* Comments List */}
      <div 
        ref={scrollRef}
        className="flex-1 max-h-[300px] overflow-y-auto p-4 space-y-4 min-h-[100px]"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-20 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-slate-400 text-sm">
            <p>No comments yet.</p>
            <p className="text-xs">Start a conversation!</p>
          </div>
        ) : (
          comments.map(comment => {
            const isMe = comment.user_id === currentUser?.id
            const avatarUrl = isMe ? currentUser?.avatar : userMap[comment.user_id]?.avatarUrl
            const commentName = userMap[comment.user_id]?.name || comment.user_name

            return (
              <div key={comment.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-slate-950 shrink-0">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={commentName} className="object-cover" />}
                  <AvatarFallback className={`${avatarColor(commentName)} text-white text-xs`}>
                    {commentName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-1 px-1">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {isMe ? 'You' : commentName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-tl-sm'
                  }`}>
                    {comment.content}
                    
                    {/* Render Attachments */}
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {comment.attachments.map((att, idx) => (
                          <a 
                            key={idx} 
                            href={att.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                              isMe ? 'bg-blue-700/50 hover:bg-blue-700' : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700'
                            } transition-colors`}
                          >
                            {att.type.startsWith('image/') ? (
                              <ImageIcon className="w-4 h-4 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 shrink-0" />
                            )}
                            <span className="truncate max-w-[150px]">{att.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 relative">
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 rounded-md px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 group pr-1">
                {file.type.startsWith('image/') ? <ImageIcon className="w-3 h-3 text-slate-500" /> : <FileText className="w-3 h-3 text-slate-500" />}
                <span className="truncate max-w-[100px] text-slate-600 dark:text-slate-400">{file.name}</span>
                <button 
                  onClick={() => removeAttachment(idx)}
                  className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea 
              placeholder="Write a comment..." 
              className="min-h-[44px] max-h-[120px] resize-none pr-10 py-3 text-sm bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl"
              rows={1}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <button 
              type="button"
              className="absolute right-2 bottom-2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading || (!newComment.trim() && attachments.length === 0)}
            className="h-[44px] w-[44px] rounded-xl p-0 shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            {isSubmitting || isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
