"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bot, SendHorizontal, Sparkles, Loader2, AlertCircle, Plus,
  Trash2, History, Paperclip, FileText, MessageSquare
} from "lucide-react"
import supabase from "@/utils/supabase"

interface Task {
  id: string
  title: string
  status: string
  priority: string
  due_date?: string
  assignee?: string
  category?: string
  description?: string
  completion_note?: string
}

interface AIAssistantProps {
  tasks?: Task[]
  user?: { id: string; name: string; email: string } | null
  onTaskCreated?: (task: any) => void
  persistedSessionId?: string | null
  onSessionChange?: (id: string | null) => void
}

interface Session {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  type: "ai" | "user"
  content: string
  created_at: string
}

function cleanAIText(text: string) {
  return text
    .replace(/TASK_CREATE:\{[\s\S]*?\}\s*$/, '')
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim()
}

function parseTaskCreate(text: string): Record<string, string> | null {
  const match = text.match(/TASK_CREATE:(\{[\s\S]*?\})\s*$/)
  if (!match) return null
  try {
    return JSON.parse(match[1])
  } catch {
    return null
  }
}

function TaskCreateCard({ taskData, onConfirm, onCancel }: { taskData: any; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="bg-secondary/50 p-4 rounded-lg border border-border mt-2 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="w-4 h-4 text-primary" />
        Task suggestion found
      </div>
      <div className="text-sm space-y-1 text-muted-foreground">
        <p><strong>Title:</strong> {taskData.title}</p>
        {taskData.priority && <p><strong>Priority:</strong> {taskData.priority}</p>}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onConfirm}>Confirm & Create</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Dismiss</Button>
      </div>
    </div>
  )
}

function AIOnboardingScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#f7f9fc] dark:bg-slate-950 p-6 overflow-y-auto">
      <div className="max-w-2xl w-full mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Animated Illustration Container */}
        <div className="relative h-64 w-64 mx-auto">
          <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <svg viewBox="0 0 200 200" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
            <style>
              {`
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
                @keyframes float-delay { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
                @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: scale(1.3); opacity: 0; } }
                .anim-float { animation: float 6s ease-in-out infinite; }
                .anim-float-delay { animation: float-delay 6s ease-in-out infinite; animation-delay: 2s; }
                .anim-pulse-ring { animation: pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
              `}
            </style>
            
            {/* Background elements */}
            <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" className="text-blue-200 dark:text-blue-900" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="65" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="2 6" />
            
            {/* Pulsing ring */}
            <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" className="text-blue-400 anim-pulse-ring" strokeWidth="2" />
            
            <g className="anim-float">
              {/* Central AI Node */}
              <circle cx="100" cy="100" r="28" fill="currentColor" className="text-white dark:text-slate-800 drop-shadow-xl" />
              <circle cx="100" cy="100" r="26" fill="none" stroke="currentColor" className="text-blue-100 dark:text-blue-900/50" strokeWidth="2" />
              <path d="M92 90h16v10H92z" fill="currentColor" className="text-blue-500" />
              <path d="M85 105h30v4H85z" fill="currentColor" className="text-blue-400" />
              <circle cx="95" cy="95" r="2" fill="white" />
              <circle cx="105" cy="95" r="2" fill="white" />
            </g>

            <g className="anim-float-delay">
              {/* Floating Task / File Cards */}
              <rect x="30" y="50" width="40" height="30" rx="6" fill="currentColor" className="text-white dark:text-slate-800 drop-shadow-md" />
              <rect x="34" y="56" width="20" height="4" rx="2" fill="currentColor" className="text-blue-400" />
              <rect x="34" y="64" width="30" height="4" rx="2" fill="currentColor" className="text-slate-200 dark:text-slate-600" />
              
              <rect x="135" y="115" width="40" height="30" rx="6" fill="currentColor" className="text-white dark:text-slate-800 drop-shadow-md" />
              <rect x="139" y="121" width="15" height="4" rx="2" fill="currentColor" className="text-emerald-400" />
              <rect x="139" y="129" width="32" height="4" rx="2" fill="currentColor" className="text-slate-200 dark:text-slate-600" />
            </g>

            {/* Connecting lines */}
            <path d="M65 75 L80 85" stroke="currentColor" className="text-blue-200 dark:text-blue-800" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M135 125 L115 110" stroke="currentColor" className="text-blue-200 dark:text-blue-800" strokeWidth="2" strokeDasharray="3 3" />
            
            {/* Sparkles */}
            <path d="M150 40 L153 48 L161 51 L153 54 L150 62 L147 54 L139 51 L147 48 Z" fill="currentColor" className="text-amber-400 animate-pulse" />
            <path d="M40 140 L42 145 L47 147 L42 149 L40 154 L38 149 L33 147 L38 145 Z" fill="currentColor" className="text-blue-400 animate-pulse" style={{ animationDelay: '1.2s' }} />
          </svg>
        </div>

        {/* Header Text */}
        <div className="space-y-4">
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 mr-2 inline" /> Introducing
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Meet your TaskFlow AI
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Your personal productivity sidekick. From analyzing documents to prioritizing your day, the assistant helps you stay focused on what matters most.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Smart Conversations</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ask questions about your tasks, request schedule optimizations, or brainstorm ideas instantly.</p>
          </div>
          
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Document Processing</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Upload PDF, DOCX, or TXT files. The AI can summarize content or extract action items.</p>
          </div>
          
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-10 w-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Task Automation</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">The assistant can automatically detect tasks in your conversation and draft them for you.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-8">
          <Button 
            onClick={onComplete} 
            size="lg" 
            className="w-full sm:w-auto px-8 h-12 text-base rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
          >
            Get Started with AI
          </Button>
        </div>

      </div>
    </div>
  )
}

export function AIAssistant({ tasks = [], user, onTaskCreated, persistedSessionId, onSessionChange }: AIAssistantProps) {
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there"

  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null)
  
  useEffect(() => {
    const onboarded = localStorage.getItem('taskflow_ai_onboarded')
    setHasOnboarded(onboarded === 'true')
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem('taskflow_ai_onboarded', 'true')
    setHasOnboarded(true)
  }

  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(persistedSessionId ?? null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [attachedFile, setAttachedFile] = useState<{ name: string; text: string } | null>(null)
  const [isParsingFile, setIsParsingFile] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [creatingTaskId, setCreatingTaskId] = useState<string | null>(null)

  // Syncs session ID to parent so it survives navigation
  const updateActiveSessionId = (id: string | null) => {
    setActiveSessionId(id)
    onSessionChange?.(id)
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const welcomeMessage: Message = {
    id: "welcome",
    type: "ai",
    content: tasks.length > 0
      ? `Hi ${firstName}! I have access to your ${tasks.length} task${tasks.length !== 1 ? "s" : ""} (${tasks.filter(t => t.status === "completed").length} completed, ${tasks.filter(t => t.status !== "completed").length} pending). Ask me anything — I can analyse patterns, suggest priorities, or help you plan your day!`
      : `Hi ${firstName}! I'm your AI assistant. How can I help you today? You can also upload a PDF, DOCX, or TXT file for me to analyse.`,
    created_at: new Date().toISOString(),
  }

  const suggestions = [
    "Analyse my task completion patterns",
    "Suggest an optimal work schedule",
    "Help me prioritise my tasks",
    "Create a project timeline",
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const fetchSessions = useCallback(async () => {
    if (!user?.id) return
    setSessionsLoading(true)
    try {
      const { data } = await supabase
        .from("ai_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
      setSessions(data || [])
    } finally {
      setSessionsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // If returning to the page with an existing session, reload its messages
  useEffect(() => {
    if (persistedSessionId && !messages.length) {
      loadSession(persistedSessionId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show welcome message when no active session
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([welcomeMessage])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId, tasks.length])

  const loadSession = async (sessionId: string) => {
    setError(null)
    setAttachedFile(null)
    const { data } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
    setMessages(data || [])
    updateActiveSessionId(sessionId)
  }

  const createSession = async (firstMessage: string): Promise<string | null> => {
    const title = firstMessage.slice(0, 70) + (firstMessage.length > 70 ? "…" : "")
    const { data } = await supabase
      .from("ai_sessions")
      .insert({ user_id: user!.id, title })
      .select()
      .single()
    if (data) {
      setSessions(prev => [data, ...prev])
      updateActiveSessionId(data.id)
      return data.id
    }
    return null
  }

  const saveMessage = async (sessionId: string, type: "user" | "ai", content: string) => {
    await supabase.from("ai_messages").insert({ session_id: sessionId, type, content })
    await supabase.from("ai_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId)
  }

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    await supabase.from("ai_sessions").delete().eq("id", sessionId)
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    if (activeSessionId === sessionId) {
      updateActiveSessionId(null)
    }
  }

  const handleNewChat = () => {
    updateActiveSessionId(null)
    setAttachedFile(null)
    setError(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.")
      return
    }

    setIsParsingFile(true)
    setError(null)

    try {
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text()
        setAttachedFile({ name: file.name, text: text.slice(0, 8000) })
      } else {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/parse-file", { method: "POST", body: formData })
        const data = await res.json()
        if (data.text) {
          setAttachedFile({ name: file.name, text: data.text })
          if (data.truncated) {
            setError(`Note: File was truncated to 8,000 characters (original: ${data.originalLength.toLocaleString()} chars).`)
          }
        } else {
          setError(data.error || "Could not parse file.")
        }
      }
    } catch {
      setError("Failed to process file.")
    } finally {
      setIsParsingFile(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSendMessage = async (text?: string) => {
    const content = (text ?? inputMessage).trim()
    if (!content || isLoading) return

    setError(null)
    setInputMessage("")

    const displayContent = attachedFile
      ? `${content}\n\n📎 ${attachedFile.name}`
      : content

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: displayContent,
      created_at: new Date().toISOString(),
    }

    // Filter out the welcome message for sending to API (it's not a real DB message)
    const priorMessages = messages.filter(m => m.id !== "welcome")
    const updatedMessages = [...priorMessages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    // Create or use session
    let sessionId = activeSessionId
    if (!sessionId && user?.id) {
      sessionId = await createSession(content)
    }
    if (sessionId) {
      await saveMessage(sessionId, "user", displayContent)
    }

    const fileToSend = attachedFile
    setAttachedFile(null)

    try {
      const taskSummary = tasks.length > 0
        ? tasks.map(t =>
            `- [${t.status}] (${t.priority}) "${t.title}"${t.due_date ? ` due ${t.due_date}` : ""}${t.assignee ? ` → ${t.assignee}` : ""}${t.category ? ` [${t.category}]` : ""}${t.completion_note ? ` | Note: ${t.completion_note}` : ""}`
          ).join("\n")
        : null

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ type: m.type, content: m.content })),
          taskContext: taskSummary,
          userName: user?.name ?? null,
          fileContext: fileToSend ? `File: "${fileToSend.name}"\n\n${fileToSend.text}` : null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Failed to get a response. Please try again.")
      } else {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: data.reply,
          created_at: new Date().toISOString(),
        }
        setMessages(prev => [...prev, aiMessage])
        if (sessionId) {
          await saveMessage(sessionId, "ai", data.reply)
          fetchSessions() // refresh sidebar order
        }
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async (messageId: string, taskData: any) => {
    if (!user?.id || creatingTaskId) return
    setCreatingTaskId(messageId)
    try {
      const newTask = {
        title: taskData.title || 'Untitled Task',
        status: 'todo',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'General',
        description: taskData.description || null,
        due_date: taskData.due_date && taskData.due_date !== 'null' ? taskData.due_date : null,
        user_id: user.id,
      }
      const { data, error } = await supabase.from('task').insert(newTask).select().single()
      if (error) {
        setError('Failed to create task: ' + error.message)
      } else if (data) {
        onTaskCreated?.(data)
        setMessages(prev => prev.map(m =>
          m.id === messageId
            ? { ...m, content: m.content.replace(/TASK_CREATE:\{[\s\S]*?\}\s*$/, '').trim() + '\n\n✅ Task created successfully!' }
            : m
        ))
      }
    } finally {
      setCreatingTaskId(null)
    }
  }

  if (hasOnboarded === null) {
    return <div className="h-full bg-[#f7f9fc] dark:bg-slate-950" />
  }

  if (hasOnboarded === false) {
    return <AIOnboardingScreen onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="h-full flex overflow-hidden bg-[#f7f9fc] dark:bg-slate-950">
      {/* Sessions Sidebar */}
      <div
        className={`${isSidebarOpen ? "w-64" : "w-0"} transition-all duration-200 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden`}
      >
        <div className="p-3 border-b border-slate-100 shrink-0">
          <Button
            onClick={handleNewChat}
            className="w-full h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {sessionsLoading ? (
            <div className="py-8 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-slate-300" /></div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">No past sessions yet</div>
          ) : (
            sessions.map(session => (
              <div
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={`group flex items-start justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                  activeSessionId === session.id
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate leading-snug">{session.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(session.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 transition-opacity shrink-0 ml-1 mt-0.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <div className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
              title="Toggle history"
            >
              <History className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-none">AI Assistant</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {activeSessionId ? "Continuing session" : "New conversation"}
                </p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs border-slate-200 text-slate-500 gap-1">
            <Sparkles className="h-3 w-3 text-blue-600" />
            AI ready
          </Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map(message => {
            const taskData = message.type === 'ai' ? parseTaskCreate(message.content) : null
            const isCreated = message.content.includes('✅ Task created successfully!')
            return (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "ai" && (
                  <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[72%] px-4 py-2.5 rounded-2xl shadow-sm ${
                    message.type === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{cleanAIText(message.content)}</p>
                  <p className="text-[10px] opacity-50 mt-1">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {taskData && !isCreated && (
                    <TaskCreateCard
                      taskData={taskData}
                      onConfirm={() => handleCreateTask(message.id, taskData)}
                      onCancel={() => setMessages(prev => prev.map(m =>
                        m.id === message.id
                          ? { ...m, content: m.content.replace(/TASK_CREATE:\{[\s\S]*?\}\s*$/, '').trim() }
                          : m
                      ))}
                    />
                  )}
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Quick suggestions — show only on new chat */}
          {!activeSessionId && messages.length <= 1 && !isLoading && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Quick prompts</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(suggestion)}
                    disabled={isLoading}
                    className="text-xs border border-slate-200 bg-white text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-4 pb-2">
            <Alert variant={error.startsWith("Note:") ? "default" : "destructive"} className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Attached file indicator */}
        {attachedFile && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 truncate font-medium">{attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)} className="hover:text-blue-900 font-bold ml-1">✕</button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 border-slate-200 hover:bg-slate-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsingFile || isLoading}
              title="Attach file (PDF, DOCX, TXT)"
            >
              {isParsingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4 text-slate-500" />}
            </Button>
            <Input
              placeholder={`Ask me anything, ${firstName}…`}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              className="h-10 flex-1 border-slate-200 bg-slate-50 text-sm focus-visible:ring-blue-500"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="h-10 w-10 shrink-0 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Supports PDF, DOCX, and TXT file uploads · Sessions saved to your account
          </p>
        </div>
      </div>
    </div>
  )
}
