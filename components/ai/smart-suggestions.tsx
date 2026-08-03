"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Clock, TrendingUp, Target, Zap, CheckCircle, AlertTriangle } from "lucide-react"

interface SmartSuggestionsProps {
  mode?: "suggestions" | "prioritize"
}

export function SmartSuggestions({ mode = "suggestions" }: SmartSuggestionsProps) {
  const [aiResult, setAiResult] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const suggestions = [
    {
      id: 1,
      type: "productivity",
      icon: TrendingUp,
      title: "Optimize Your Morning Routine",
      description:
        "Based on your completion patterns, you're 40% more productive in the morning. Consider scheduling high-priority tasks between 9-11 AM.",
      priority: "high",
      action: "Schedule Morning Tasks",
    },
    {
      id: 2,
      type: "time",
      icon: Clock,
      title: "Break Down Large Tasks",
      description:
        "Your 'Website Redesign' task has been pending for 5 days. Consider breaking it into smaller, manageable subtasks.",
      priority: "medium",
      action: "Create Subtasks",
    },
    {
      id: 3,
      type: "focus",
      icon: Target,
      title: "Focus Time Blocks",
      description:
        "You have 3 high-priority tasks due this week. Block 2-hour focused sessions to tackle them without interruptions.",
      priority: "high",
      action: "Block Time",
    },
    {
      id: 4,
      type: "automation",
      icon: Zap,
      title: "Automate Recurring Tasks",
      description: "I noticed you create similar tasks weekly. Set up templates to save 15 minutes per week.",
      priority: "low",
      action: "Create Templates",
    },
    {
      id: 5,
      type: "deadline",
      icon: AlertTriangle,
      title: "Upcoming Deadline Alert",
      description:
        "You have 2 tasks due tomorrow. Consider prioritizing them or requesting deadline extensions if needed.",
      priority: "urgent",
      action: "Review Tasks",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "productivity":
        return "bg-blue-100 text-blue-800"
      case "time":
        return "bg-emerald-50 text-emerald-700"
      case "focus":
        return "bg-blue-50 text-blue-700"
      case "automation":
        return "bg-amber-50 text-amber-700"
      case "deadline":
        return "bg-red-50 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  const generateWithAI = async () => {
    setIsGenerating(true)
    setAiResult("")
    const prompt = mode === "prioritize"
      ? "Help me prioritize my work. Give me a concise framework for deciding what to do first, including urgency, impact, effort, and a suggested order."
      : "Give me three practical productivity suggestions for managing tasks, planning focus time, and keeping work moving."

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ type: "user", content: prompt }] }),
      })
      const data = await response.json()
      setAiResult(response.ok ? data.reply : data.error || "The assistant could not generate a response.")
    } catch {
      setAiResult("The assistant is temporarily unavailable. Please try again shortly.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f7f9fc]">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-[0_6px_16px_rgba(37,99,235,0.2)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Workspace intelligence</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{mode === "prioritize" ? "Auto prioritize" : "Smart suggestions"}</h1>
              <p className="mt-1 text-sm text-slate-500">Small improvements that keep your work moving.</p>
            </div>
          </div>
          <Button onClick={generateWithAI} disabled={isGenerating} className="h-9 gap-2 bg-blue-600 text-xs text-white hover:bg-blue-700"><Sparkles className="h-3.5 w-3.5" />{isGenerating ? "Thinking..." : mode === "prioritize" ? "Prioritize with AI" : "Generate with AI"}</Button>
        </div>

        {aiResult && <Card className="border-blue-100 bg-blue-50/60 shadow-[0_2px_8px_rgba(37,99,235,0.06)]"><CardContent className="p-5"><div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white"><Sparkles className="h-4 w-4" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">TaskFlow AI</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{aiResult}</p></div></div></CardContent></Card>}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card className="border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]"><CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Productivity Score</p>
                  <p className="text-2xl font-bold">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]"><CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Suggestions Applied</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]"><CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Time Saved</p>
                  <p className="text-2xl font-bold">2.5h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions List */}
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="relative h-48 w-48 mb-8 mt-4">
                <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <svg viewBox="0 0 200 200" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
                  <style>
                    {`
                      @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                      @keyframes pulseLight { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
                      .anim-float { animation: float 6s ease-in-out infinite; }
                      .anim-pulse { animation: pulseLight 3s ease-in-out infinite; }
                    `}
                  </style>
                  <g className="anim-float">
                    <rect x="45" y="45" width="110" height="110" rx="24" fill="currentColor" className="text-white dark:text-slate-800 drop-shadow-xl" />
                    <rect x="47" y="47" width="106" height="106" rx="22" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="2" />
                    <circle cx="100" cy="90" r="24" fill="currentColor" className="text-blue-50 dark:text-blue-900/30" />
                    <path d="M100 75 L108 85 L120 85 L110 95 L112 107 L100 100 L88 107 L90 95 L80 85 L92 85 Z" fill="currentColor" className="text-blue-500 anim-pulse" />
                    <rect x="75" y="125" width="50" height="6" rx="3" fill="currentColor" className="text-slate-200 dark:text-slate-600" />
                  </g>
                  <path d="M165 35 L168 43 L176 46 L168 49 L165 57 L162 49 L154 46 L162 43 Z" fill="currentColor" className="text-amber-400 animate-pulse" />
                  <path d="M30 140 L32 146 L38 148 L32 150 L30 156 L28 150 L22 148 L28 146 Z" fill="currentColor" className="text-indigo-400 animate-pulse" style={{ animationDelay: '1s' }} />
                </svg>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">No active suggestions</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-base">
                You've cleared all your AI suggestions! Keep working on tasks to generate more intelligent insights.
              </p>
            </div>
          ) : (
            suggestions.map((suggestion) => {
            const Icon = suggestion.icon
            return (
              <Card key={suggestion.id} className="border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-shadow hover:shadow-md">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">{suggestion.title}</h3>
                        <Badge variant={getPriorityColor(suggestion.priority)} className="text-xs">
                          {suggestion.priority}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getTypeColor(suggestion.type)}`}>
                          {suggestion.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{suggestion.description}</p>
                      <div className="flex items-center space-x-2 pt-2">
                        <Button size="sm">{suggestion.action}</Button>
                        <Button variant="ghost" size="sm">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }))}
        </div>

        {/* AI Insights */}
        <Card className="border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
          <CardHeader className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>AI Insights</span>
            </CardTitle>
            <CardDescription>Personalized insights based on your work patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                <h4 className="font-semibold text-blue-900">Peak Performance Hours</h4>
                <p className="text-sm text-blue-700 mt-1">
                  You complete 60% more tasks between 9 AM - 11 AM. Schedule important work during this window.
                </p>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-4">
                <h4 className="font-semibold text-green-900">Task Completion Pattern</h4>
                <p className="text-sm text-green-700 mt-1">
                  You're most likely to complete tasks on Tuesdays and Wednesdays. Plan accordingly.
                </p>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <h4 className="font-semibold text-purple-900">Focus Duration</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Your optimal focus session is 90 minutes. Take breaks to maintain productivity.
                </p>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50/70 p-4">
                <h4 className="font-semibold text-orange-900">Procrastination Alert</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Tasks labeled "Research" tend to be delayed. Consider breaking them into smaller steps.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
