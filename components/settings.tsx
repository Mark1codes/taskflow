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
import { SettingsIcon, Moon, Sun, Bell, User, Palette, Save, Mail, UserIcon } from "lucide-react"

interface SettingsProps {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  profileData?: {
    name: string
    email: string
  }
}

export function Settings({ user, profileData }: SettingsProps) {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    desktop: true,
  })
  const [preferences, setPreferences] = useState({
    timezone: "UTC-5",
    defaultPriority: "medium",
    defaultAssignee: "",
    autoAssignDueDates: false,
  })

  // Initialize preferences with user data
  useEffect(() => {
    if (user || profileData) {
      setPreferences(prev => ({
        ...prev,
        defaultAssignee: profileData?.name || user?.name || "",
      }))
    }
  }, [user, profileData])

  const handleSave = () => {
    // Here you would typically save settings to a backend
    console.log("Settings saved:", { theme, notifications, preferences })
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto max-h-screen">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>Customize the look and feel of your task manager</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Theme</Label>
                <div className="text-sm text-muted-foreground">Choose between light and dark mode</div>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
                <Moon className="h-4 w-4" />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
              <Select defaultValue="blue">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select accent color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>Configure how you want to be notified about tasks and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <div className="text-sm text-muted-foreground">Receive task updates via email</div>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Push Notifications</Label>
                <div className="text-sm text-muted-foreground">Get notified on your mobile device</div>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Desktop Notifications</Label>
                <div className="text-sm text-muted-foreground">Show notifications on your desktop</div>
              </div>
              <Switch
                checked={notifications.desktop}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, desktop: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <span>General Preferences</span>
            </CardTitle>
            <CardDescription>Configure your timezone and other general settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC-12">Baker Island Time (UTC-12)</SelectItem>
                  <SelectItem value="UTC-11">Niue Time (UTC-11)</SelectItem>
                  <SelectItem value="UTC-10">Hawaii-Aleutian Standard Time (UTC-10)</SelectItem>
                  <SelectItem value="UTC-9">Alaska Standard Time (UTC-9)</SelectItem>
                  <SelectItem value="UTC-8">Pacific Standard Time (UTC-8)</SelectItem>
                  <SelectItem value="UTC-7">Mountain Standard Time (UTC-7)</SelectItem>
                  <SelectItem value="UTC-6">Central Standard Time (UTC-6)</SelectItem>
                  <SelectItem value="UTC-5">Eastern Standard Time (UTC-5)</SelectItem>
                  <SelectItem value="UTC-4">Atlantic Standard Time (UTC-4)</SelectItem>
                  <SelectItem value="UTC-3">Argentina Time (UTC-3)</SelectItem>
                  <SelectItem value="UTC-2">South Georgia Time (UTC-2)</SelectItem>
                  <SelectItem value="UTC-1">Azores Time (UTC-1)</SelectItem>
                  <SelectItem value="UTC+0">Greenwich Mean Time (UTC+0)</SelectItem>
                  <SelectItem value="UTC+1">Central European Time (UTC+1)</SelectItem>
                  <SelectItem value="UTC+2">Eastern European Time (UTC+2)</SelectItem>
                  <SelectItem value="UTC+3">Moscow Time (UTC+3)</SelectItem>
                  <SelectItem value="UTC+4">Gulf Standard Time (UTC+4)</SelectItem>
                  <SelectItem value="UTC+5">Pakistan Standard Time (UTC+5)</SelectItem>
                  <SelectItem value="UTC+6">Bangladesh Standard Time (UTC+6)</SelectItem>
                  <SelectItem value="UTC+7">Indochina Time (UTC+7)</SelectItem>
                  <SelectItem value="UTC+8">China Standard Time (UTC+8)</SelectItem>
                  <SelectItem value="UTC+9">Japan Standard Time (UTC+9)</SelectItem>
                  <SelectItem value="UTC+10">Australian Eastern Standard Time (UTC+10)</SelectItem>
                  <SelectItem value="UTC+11">Solomon Islands Time (UTC+11)</SelectItem>
                  <SelectItem value="UTC+12">Fiji Time (UTC+12)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <span>Task Preferences</span>
            </CardTitle>
            <CardDescription>Configure default settings for new tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default-priority">Default Priority</Label>
                <Select 
                  value={preferences.defaultPriority}
                  onValueChange={(value) => setPreferences((prev) => ({ ...prev, defaultPriority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select default priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-assignee">Default Assignee</Label>
                <Input 
                  id="default-assignee" 
                  placeholder="Enter default assignee" 
                  value={preferences.defaultAssignee}
                  onChange={(e) => setPreferences((prev) => ({ ...prev, defaultAssignee: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-assign due dates</Label>
                <div className="text-sm text-muted-foreground">Automatically set due dates for new tasks</div>
              </div>
              <Switch 
                checked={preferences.autoAssignDueDates}
                onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, autoAssignDueDates: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}