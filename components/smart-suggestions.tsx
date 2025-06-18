"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Clock, TrendingUp, Target, Zap, CheckCircle, AlertTriangle } from "lucide-react"

export function SmartSuggestions() {
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
        return "bg-green-100 text-green-800"
      case "focus":
        return "bg-purple-100 text-purple-800"
      case "automation":
        return "bg-orange-100 text-orange-800"
      case "deadline":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto max-h-screen">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Smart Suggestions</h1>
              <p className="text-muted-foreground">AI-powered recommendations to boost your productivity</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>5 New Suggestions</span>
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Productivity Score</p>
                  <p className="text-2xl font-bold">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Suggestions Applied</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
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
          {suggestions.map((suggestion) => {
            const Icon = suggestion.icon
            return (
              <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-white" />
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
          })}
        </div>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>AI Insights</span>
            </CardTitle>
            <CardDescription>Personalized insights based on your work patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Peak Performance Hours</h4>
                <p className="text-sm text-blue-700 mt-1">
                  You complete 60% more tasks between 9 AM - 11 AM. Schedule important work during this window.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">Task Completion Pattern</h4>
                <p className="text-sm text-green-700 mt-1">
                  You're most likely to complete tasks on Tuesdays and Wednesdays. Plan accordingly.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900">Focus Duration</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Your optimal focus session is 90 minutes. Take breaks to maintain productivity.
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
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
