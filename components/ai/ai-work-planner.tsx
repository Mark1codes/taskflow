"use client"

import { useMemo, useState } from "react"
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock3, Sparkles, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PlannerTask {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  due_date?: string
  category?: string
}

interface AIWorkPlannerProps {
  tasks: PlannerTask[]
  mode: "suggestions" | "prioritize"
}

const statusLabels: Record<string, string> = {
  todo: "To do",
  "in-progress": "In progress",
  completed: "Completed",
}

const priorityStyles: Record<string, string> = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-slate-200 bg-slate-50 text-slate-600",
}

function cleanAIText(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
}

export function AIWorkPlanner({ tasks, mode }: AIWorkPlannerProps) {
  const [result, setResult] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const isPrioritizer = mode === "prioritize"

  const activeTasks = useMemo(() => tasks.filter((task) => task.status !== "completed"), [tasks])
  const completedCount = tasks.filter((task) => task.status === "completed").length

  const formatDate = (date?: string) => {
    if (!date) return "No due date"
    const parsed = new Date(date)
    return Number.isNaN(parsed.getTime()) ? "No due date" : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const generateAnalysis = async () => {
    setIsGenerating(true)
    setError("")
    setResult("")

    const taskContext = tasks.length > 0
      ? tasks.slice(0, 30).map((task) => ({
          title: task.title,
          description: task.description || "",
          status: task.status,
          priority: task.priority,
          dueDate: task.due_date || null,
          category: task.category || "Uncategorized",
        }))
      : []

    const prompt = isPrioritizer
      ? `Prioritize the user's real TaskFlow tasks below. Return a concise ordered list with the task title, why it belongs at that position, and the recommended next action. Do not invent tasks or details. If there are no tasks, say that clearly. Tasks: ${JSON.stringify(taskContext)}`
      : `Analyze the user's real TaskFlow tasks below and provide three practical suggestions based only on this data. Mention the relevant task title for each suggestion. Do not invent tasks or claim access to data not provided. If there are no tasks, recommend creating the first task. Tasks: ${JSON.stringify(taskContext)}`

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ type: "user", content: prompt }] }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "The assistant could not analyze your tasks.")
      setResult(data.reply || "The assistant did not return an analysis.")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The assistant is temporarily unavailable.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f7f9fc] dark:bg-slate-950">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Workspace intelligence</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">{isPrioritizer ? "Auto prioritize" : "Smart suggestions"}</h1>
            <p className="mt-1 text-sm text-slate-500">{isPrioritizer ? "Turn your current task list into a clear order of operations." : "Get recommendations grounded in the tasks already in your workspace."}</p>
          </div>
          <Button onClick={generateAnalysis} disabled={isGenerating} className="h-9 gap-2 bg-blue-600 text-xs text-white hover:bg-blue-700"><Sparkles className="h-3.5 w-3.5" />{isGenerating ? "Analyzing..." : isPrioritizer ? "Prioritize my tasks" : "Analyze my tasks"}</Button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"><CardContent className="p-4"><p className="text-xs text-slate-500">Tasks in workspace</p><p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{tasks.length}</p><p className="mt-1 text-xs text-slate-400">Real task records</p></CardContent></Card>
          <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"><CardContent className="p-4"><p className="text-xs text-slate-500">Needs attention</p><p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{activeTasks.length}</p><p className="mt-1 text-xs text-slate-400">Not completed</p></CardContent></Card>
          <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"><CardContent className="p-4"><p className="text-xs text-slate-500">Completed</p><p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{completedCount}</p><p className="mt-1 text-xs text-slate-400">Already shipped</p></CardContent></Card>
          <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"><CardContent className="p-4"><p className="text-xs text-slate-500">AI context</p><p className="mt-2 flex items-center gap-2 text-sm font-semibold text-blue-600"><CheckCircle2 className="h-4 w-4" /> Live task data</p><p className="mt-1 text-xs text-slate-400">Sent when requested</p></CardContent></Card>
        </div>

        {error && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" /> {error}</div>}

        {result && <Card className="border-blue-100 bg-blue-50/60 shadow-[0_4px_16px_rgba(37,99,235,0.06)]"><CardContent className="p-5 sm:p-6"><div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white"><Sparkles className="h-4 w-4" /></span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">AI result from your tasks</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{cleanAIText(result)}</p></div></div></CardContent></Card>}

        <Card className="border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)] dark:border-slate-800 dark:bg-slate-900"><CardHeader className="border-b border-slate-100 px-5 py-4 dark:border-slate-800"><CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white"><Target className="h-4 w-4 text-blue-600" /> Tasks used for analysis <span className="ml-auto text-xs font-normal text-slate-400">{tasks.length} records</span></CardTitle></CardHeader><CardContent className="p-0">{tasks.length > 0 ? <div className="divide-y divide-slate-100 dark:divide-slate-800">{tasks.slice(0, 10).map((task) => <div key={task.id} className="flex items-center gap-3 px-5 py-4 sm:px-6"><span className={`h-2 w-2 shrink-0 rounded-full ${task.status === "completed" ? "bg-emerald-500" : task.status === "in-progress" ? "bg-blue-500" : "bg-slate-300"}`} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{task.title}</p><p className="mt-1 flex items-center gap-2 text-xs text-slate-400"><Clock3 className="h-3 w-3" /> {formatDate(task.due_date)} <span>/</span> {statusLabels[task.status] || task.status}</p></div><Badge className={`shrink-0 border text-[10px] ${priorityStyles[task.priority] || priorityStyles.low}`}>{task.priority || "low"}</Badge><ArrowUpRight className="hidden h-4 w-4 text-slate-300 sm:block" /></div>)}</div> : <div className="px-5 py-12 text-center text-sm text-slate-400">No tasks yet. Create a task, then return here to analyze it.</div>}</CardContent></Card>
      </div>
    </div>
  )
}
