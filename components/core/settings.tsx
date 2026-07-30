"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { Moon, Sun, Bell, Palette, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SettingsProps {
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export function Settings({ user }: SettingsProps) {
  const { theme, setTheme } = useTheme()
  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState({ email: true, push: false, desktop: true })
  const [preferences, setPreferences] = useState({ timezone: "UTC+8", defaultPriority: "medium", defaultAssignee: "", autoAssignDueDates: false })
  const [colorTheme, setColorTheme] = useState("blue")

  useEffect(() => {
    if (user?.name) setPreferences(p => ({ ...p, defaultAssignee: p.defaultAssignee || user.name }))
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("taskflow-color-theme") || "blue"
    setColorTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)
  }, [user])

  const handleThemeChange = (value: string) => {
    setColorTheme(value)
    localStorage.setItem("taskflow-color-theme", value)
    document.documentElement.setAttribute("data-theme", value)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const section = "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)] dark:border-slate-800 dark:bg-slate-900"
  const sectionHeader = "border-b border-slate-100 bg-slate-50/60 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/50"
  const sectionBody = "space-y-5 bg-white px-5 py-5 dark:bg-slate-900"
  const rowBetween = "flex items-center justify-between"
  const labelMain = "text-sm font-medium text-slate-800 dark:text-slate-100"
  const labelSub  = "text-xs text-slate-400 mt-0.5"

  return (
    <div className="h-full overflow-y-auto bg-[#f7f9fc] dark:bg-slate-950">
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Workspace controls</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">Manage how TaskFlow fits your working style.</p>
          </div>
          <Button onClick={handleSave} className="h-9 gap-2 bg-blue-600 text-white hover:bg-blue-700">
            <Save className="h-3.5 w-3.5" /> Save changes
          </Button>
        </div>

        {saved && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <AlertDescription className="text-emerald-700 text-sm">Settings saved successfully.</AlertDescription>
          </Alert>
        )}

        {/* Appearance */}
        <div className={section}>
          <div className={sectionHeader}>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Appearance</span>
            </div>
          </div>
          <div className={sectionBody}>
            {/* 
            <div className={rowBetween}>
              <div>
                <p className={labelMain}>Theme</p>
                <p className={labelSub}>Choose light or dark mode</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-3.5 w-3.5 text-slate-400" />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={v => setTheme(v ? "dark" : "light")}
                />
                <Moon className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
            <Separator className="bg-slate-100 dark:bg-slate-800" />
            */}

            <div className="space-y-1.5">
              <Label className={labelMain}>Accent colour</Label>
              <Select value={colorTheme} onValueChange={handleThemeChange}>
                <SelectTrigger className="h-9 border-slate-200 dark:border-slate-800 w-48 bg-white dark:bg-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Indigo Blue (default)</SelectItem>
                  <SelectItem value="slate">Slate</SelectItem>
                  <SelectItem value="emerald">Emerald</SelectItem>
                  <SelectItem value="violet">Violet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className={section}>
          <div className={sectionHeader}>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notifications</span>
            </div>
          </div>
          <div className={sectionBody}>
            {[
              { key: "email",   label: "Email notifications",   sub: "Receive task updates via email" },
              { key: "push",    label: "Push notifications",    sub: "Get notified on your device" },
              { key: "desktop", label: "Desktop notifications", sub: "Show notifications on this device" },
            ].map((item, i, arr) => (
              <div key={item.key}>
                <div className={rowBetween}>
                  <div>
                    <p className={labelMain}>{item.label}</p>
                    <p className={labelSub}>{item.sub}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={v => setNotifications(n => ({ ...n, [item.key]: v }))}
                  />
                </div>
                {i < arr.length - 1 && <Separator className="bg-slate-100 dark:bg-slate-800 mt-5" />}
              </div>
            ))}
          </div>
        </div>

        {/* Task preferences */}
        <div className={section}>
          <div className={sectionHeader}>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Task Preferences</span>
          </div>
          <div className={sectionBody}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={labelMain}>Default priority</Label>
                <Select value={preferences.defaultPriority} onValueChange={v => setPreferences(p => ({ ...p, defaultPriority: v }))}>
                  <SelectTrigger className="h-9 border-slate-200 dark:border-slate-800"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={labelMain}>Default assignee</Label>
                <Input className="h-9 border-slate-200 dark:border-slate-800" placeholder="Your name…"
                  value={preferences.defaultAssignee}
                  onChange={e => setPreferences(p => ({ ...p, defaultAssignee: e.target.value }))} />
              </div>
            </div>

            <Separator className="bg-slate-100 dark:bg-slate-800" />

            <div className={rowBetween}>
              <div>
                <p className={labelMain}>Auto-assign due dates</p>
                <p className={labelSub}>Automatically set due dates for new tasks</p>
              </div>
              <Switch
                checked={preferences.autoAssignDueDates}
                onCheckedChange={v => setPreferences(p => ({ ...p, autoAssignDueDates: v }))}
              />
            </div>

            <Separator className="bg-slate-100 dark:bg-slate-800" />

            <div className="space-y-1.5">
              <Label className={labelMain}>Timezone</Label>
              <Select value={preferences.timezone} onValueChange={v => setPreferences(p => ({ ...p, timezone: v }))}>
                <SelectTrigger className="h-9 border-slate-200 dark:border-slate-800 w-full"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-56">
                  {[
                    ["UTC-8", "Pacific (UTC-8)"], ["UTC-7", "Mountain (UTC-7)"],
                    ["UTC-6", "Central (UTC-6)"],  ["UTC-5", "Eastern (UTC-5)"],
                    ["UTC+0", "GMT (UTC+0)"],       ["UTC+1", "Central Europe (UTC+1)"],
                    ["UTC+3", "Moscow (UTC+3)"],    ["UTC+5", "Pakistan (UTC+5)"],
                    ["UTC+7", "Indochina (UTC+7)"], ["UTC+8", "China / SGT (UTC+8)"],
                    ["UTC+9", "Japan (UTC+9)"],     ["UTC+10", "AEST (UTC+10)"],
                  ].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
