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
        "Hello! I'm your AI assistant powered by Google Gemini. I can help you with task management, productivity tips, prioritisation strategies, and project insights. How can I assist you today?",
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
    <div className="flex-1 p-6 overflow-y-auto max-h-screen">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
              <p className="text-muted-foreground">Powered by Google Gemini</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>Gemini AI</span>
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSendMessage("Give me a productivity analysis and tips")}>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Productivity Analysis</h3>
              <p className="text-sm text-muted-foreground">Get insights on your work patterns</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSendMessage("Give me smart suggestions to boost my productivity")}>
            <CardContent className="p-4 text-center">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h3 className="font-semibold">Smart Suggestions</h3>
              <p className="text-sm text-muted-foreground">AI-powered task recommendations</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSendMessage("How can I optimise my daily schedule for maximum productivity?")}>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Time Optimisation</h3>
              <p className="text-sm text-muted-foreground">Optimise your schedule</p>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>AI Chat</span>
            </CardTitle>
            <CardDescription>Ask me anything about your tasks and productivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    <div className="w-7 h-7 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
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
                  <div className="w-7 h-7 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-lg flex items-center space-x-1">
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
                <p className="text-sm font-medium">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs"
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
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
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
