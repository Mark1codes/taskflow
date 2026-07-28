"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bot, Send, Sparkles, Lightbulb, TrendingUp, Clock, MessageSquare, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Message {
  id: number
  type: "ai" | "user"
  content: string
  timestamp: Date
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content:
        "Hello! I'm your AI assistant. I can help you with task management, productivity tips, prioritisation strategies, and project insights. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestions = [
    "Analyse my task completion patterns",
    "Suggest an optimal work schedule",
    "Help me prioritise my tasks",
    "Create a project timeline",
  ]

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (text?: string) => {
    const content = (text ?? inputMessage).trim()
    if (!content || isLoading) return

    setError(null)
    setInputMessage("")

    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Send only content + role — exclude timestamps to keep payload lean
          messages: updatedMessages.map((m) => ({ type: m.type, content: m.content })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Failed to get a response. Please try again.")
      } else {
        const aiMessage: Message = {
          id: updatedMessages.length + 1,
          type: "ai",
          content: data.reply,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f7f9fc]">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-[0_6px_16px_rgba(37,99,235,0.2)]">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Workspace intelligence</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950">AI Assistant</h1>
              <p className="mt-1 text-sm text-slate-500">Turn your task context into a clear next step.</p>
            </div>
          </div>
          <Badge variant="outline" className="flex h-8 items-center gap-1 border-slate-200 bg-white px-3 text-xs font-medium text-slate-600">
            <Sparkles className="h-3 w-3 text-blue-600" />
            <span>AI ready</span>
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card className="cursor-pointer border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-shadow hover:shadow-md" onClick={() => handleSendMessage("Give me a productivity analysis and tips")}>
            <CardContent className="flex items-start gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><TrendingUp className="h-4 w-4" /></span>
              <div><h3 className="text-sm font-semibold text-slate-900">Productivity analysis</h3><p className="mt-1 text-xs leading-5 text-slate-500">Get insights on your work patterns</p></div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-shadow hover:shadow-md" onClick={() => handleSendMessage("Give me smart suggestions to boost my productivity")}>
            <CardContent className="flex items-start gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Lightbulb className="h-4 w-4" /></span>
              <div><h3 className="text-sm font-semibold text-slate-900">Smart suggestions</h3><p className="mt-1 text-xs leading-5 text-slate-500">AI-powered task recommendations</p></div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-shadow hover:shadow-md" onClick={() => handleSendMessage("How can I optimise my daily schedule for maximum productivity?")}>
            <CardContent className="flex items-start gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Clock className="h-4 w-4" /></span>
              <div><h3 className="text-sm font-semibold text-slate-900">Time optimisation</h3><p className="mt-1 text-xs leading-5 text-slate-500">Optimise your schedule</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
          <CardHeader className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span>AI Chat</span>
            </CardTitle>
            <CardDescription>Ask me anything about your tasks and productivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5 sm:p-6">
            {/* Error banner */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Messages */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.type === "ai" && (
                    <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions — only show when chat is short */}
            {messages.length <= 2 && !isLoading && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Quick prompts</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="border-slate-200 text-xs text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      disabled={isLoading}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                placeholder="Ask me anything about your tasks…"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                className="h-10 flex-1 border-slate-200 bg-slate-50 text-sm focus-visible:ring-blue-500"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="h-10 w-10 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
