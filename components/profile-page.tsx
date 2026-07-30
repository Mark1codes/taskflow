"use client"

import type React from "react"
import supabase from '../utils/supabase'
import { AVATAR_BUCKET, getAvatarDisplayUrl } from "@/utils/avatar"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, MapPin, Phone, Camera, Save, Lock, Eye, EyeOff, Shield, Bell, Globe } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProfilePageProps {
  user: any
  onUpdateUser: (userData: any) => void
}

export function ProfilePage({ user, onUpdateUser }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const [profileData, setProfileData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: "",
    location: "",
    bio: "",
    website: "",
    joinDate: "January 2024",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    compactMode: false,
    showCompleted: true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState(user.avatar || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load user profile data on component mount
  useEffect(() => {
    // The authenticated user already contains the core profile fields. Render those
    // immediately and hydrate optional profile fields without blocking navigation.
    setIsInitialLoading(false)
    void loadProfileData()
  }, [user.id])

  useEffect(() => {
    setAvatarSrc(user.avatar || "")
  }, [user.avatar])

  const loadProfileData = async () => {
    try {
      const { data: profileInfo, error: profileError } = await supabase
        .from('profile')
        .select('phone_number, bio, location, website')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile data:', profileError)
      }

      // Optional fields arrive after the page is already usable.
      setProfileData(prev => ({
        ...prev,
        phone: profileInfo?.phone_number || "",
        bio: profileInfo?.bio || "",
        location: profileInfo?.location || "",
        website: profileInfo?.website || "",
      }))
    } catch (error) {
      console.error('Error loading profile:', error)
      setMessage("Failed to load profile data")
      setMessageType("error")
    }
  }

  const clearMessage = useCallback(() => {
    setTimeout(() => {
      setMessage("")
    }, 5000)
  }, [])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setMessage("Saving profile...")
    setMessageType("success")

    try {
      const now = new Date().toISOString()
      const userUpdate = {
        full_name: profileData.name.trim(),
        updated_at: now,
      }
      const profileUpdate = {
        phone_number: profileData.phone.trim(),
        bio: profileData.bio.trim(),
        location: profileData.location.trim(),
        website: profileData.website.trim(),
        updated_at: now,
      }

      const authRequest = profileData.email.trim() !== user.email
        ? supabase.auth.updateUser({ email: profileData.email.trim() })
        : Promise.resolve({ error: null })

      const [userResult, profileResult, authResult] = await Promise.all([
        supabase.from("users").update(userUpdate).eq("id", user.id),
        supabase.from("profile").update(profileUpdate).eq("user_id", user.id),
        authRequest,
      ])

      if (userResult.error) throw userResult.error
      if (profileResult.error) throw profileResult.error
      if (authResult.error) throw authResult.error

      onUpdateUser({ ...user, name: profileData.name.trim(), email: profileData.email.trim() })
      setMessage("Profile updated successfully!")
      clearMessage()
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setMessage("Failed to save profile: " + (error.message || "Please try again."))
      setMessageType("error")
      clearMessage()
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New passwords don't match")
      setMessageType("error")
      setIsLoading(false)
      clearMessage()
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters")
      setMessageType("error")
      setIsLoading(false)
      clearMessage()
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setMessage("Password updated successfully!")
      setMessageType("success")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      clearMessage()
    } catch (error: any) {
      console.error('Error updating password:', error)
      setMessage("Failed to update password: " + (error.message || "Unknown error"))
      setMessageType("error")
      clearMessage()
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferencesSubmit = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      // In a real app, you might store preferences in the database
      // For now, simulate an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMessage("Preferences saved successfully!")
      setMessageType("success")
      clearMessage()
    } catch (error: any) {
      setMessage("Failed to save preferences: " + (error.message || "Unknown error"))
      setMessageType("error")
      clearMessage()
    } finally {
      setIsLoading(false)
    }
  }

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    })

    try {
      return await Promise.race([promise, timeout])
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }

  const optimizeAvatar = (file: File): Promise<File> =>
    new Promise((resolve) => {
      const sourceUrl = URL.createObjectURL(file)
      const image = new Image()
      image.onload = () => {
        const scale = Math.min(1, 320 / Math.max(image.width, image.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext("2d")
        context?.drawImage(image, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(sourceUrl)
          resolve(blob ? new File([blob], "avatar.webp", { type: "image/webp" }) : file)
        }, "image/webp", 0.72)
      }
      image.onerror = () => {
        URL.revokeObjectURL(sourceUrl)
        resolve(file)
      }
      image.src = sourceUrl
    })
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.")
      setMessageType("error")
      clearMessage()
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Please choose an image smaller than 10MB.")
      setMessageType("error")
      clearMessage()
      event.target.value = ""
      return
    }

    const previousAvatar = user.avatar || ""
    const localPreview = URL.createObjectURL(file)
    setIsAvatarUploading(true)
    setAvatarSrc(localPreview)
    onUpdateUser({ ...user, avatar: localPreview })
    setMessage("Processing image...")
    setMessageType("success")

    try {
      const avatarFile = await withTimeout(
        optimizeAvatar(file),
        8000,
        "The image took too long to prepare. Please try a smaller picture."
      )
      const filePath = user.id + "/" + Date.now() + "-" + avatarFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")
      setMessage("Uploading...")
      const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(filePath, avatarFile, {
        upsert: true,
        cacheControl: "31536000",
        contentType: avatarFile.type,
      })
      if (uploadError) {
        throw new Error(
          uploadError.message.includes("bucket")
            ? "The avatars bucket was not found. Create a Supabase Storage bucket named avatars."
            : uploadError.message.includes("policy") || uploadError.message.includes("row-level security")
              ? "Supabase blocked the upload. Check the avatars bucket policies for authenticated users."
              : uploadError.message
        )
      }

      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath)
      if (!data.publicUrl) {
        throw new Error("Supabase did not return an avatar URL.")
      }

      const displayUrl = await getAvatarDisplayUrl(supabase, filePath, data.publicUrl)
      const displayCheck = await fetch(displayUrl, { method: "GET", cache: "no-store" })
      if (!displayCheck.ok) {
        throw new Error(
          "The image uploaded, but the browser cannot read it. Add a select/read policy for authenticated users on the avatars bucket."
        )
      }

      const { error: userError } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl, avatar_path: filePath },
      })
      if (userError) throw new Error(userError.message)

      setAvatarSrc(displayUrl)
      onUpdateUser({ ...user, avatar: displayUrl })
      setMessage("Profile picture updated!")
      clearMessage()
    } catch (error: any) {
      console.error("Error uploading profile picture:", error)
      setAvatarSrc(previousAvatar)
      onUpdateUser({ ...user, avatar: previousAvatar })
      setMessage("Profile picture was not saved: " + (error.message || "Please check your avatars bucket setup."))
      setMessageType("error")
      clearMessage()
    } finally {
      setIsAvatarUploading(false)
      URL.revokeObjectURL(localPreview)
      event.target.value = ""
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Bell },
  ]

  if (isInitialLoading) {
    return (
      <div className="h-full min-h-0 flex-1 overflow-y-auto p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
            <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
          </div>

          {/* Profile Header Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="h-24 w-24 bg-muted animate-pulse rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-40 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
                  <div className="flex items-center space-x-4">
                    <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
                    <div className="h-3 w-40 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Skeleton */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex-1 h-10 bg-muted animate-pulse rounded-md"></div>
            ))}
          </div>

          {/* Profile Tab Content Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-40 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                    <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                    <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                <div className="h-24 w-full bg-muted animate-pulse rounded"></div>
              </div>
              <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 flex-1 overflow-y-auto p-6">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <Badge variant="outline" className="text-sm">
            Member since {profileData.joinDate}
          </Badge>
        </div>

        {message && (
          <Alert variant={messageType === "error" ? "destructive" : "default"}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage key={avatarSrc} src={avatarSrc || undefined} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <input ref={fileInputRef} id="profile-image-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={handleAvatarUpload} />
                <Button
                  type="button"
                  size="icon"
                  disabled={isAvatarUploading}
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload profile picture"
                >
                  <Camera className={isAvatarUploading ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
                </Button>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{profileData.name}</h2>
                <p className="text-muted-foreground">{profileData.email}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {profileData.joinDate}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{profileData.location || "Location not set"}</span>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                        className="pl-10"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, location: e.target.value }))}
                        className="pl-10"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, website: e.target.value }))}
                      className="pl-10"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                    className="w-full p-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === "security" && (
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Lock className="h-4 w-4 mr-2" />
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <Button variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "preferences" && (
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience and notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive task updates via email</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Get notified on your device</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={preferences.pushNotifications}
                      onChange={(e) => setPreferences(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Summary</p>
                      <p className="text-sm text-muted-foreground">Receive weekly productivity reports</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={preferences.weeklyReports}
                      onChange={(e) => setPreferences(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Display</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact Mode</p>
                      <p className="text-sm text-muted-foreground">Show more content in less space</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={preferences.compactMode}
                      onChange={(e) => setPreferences(prev => ({ ...prev, compactMode: e.target.checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Completed Tasks</p>
                      <p className="text-sm text-muted-foreground">Display completed tasks in lists</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={preferences.showCompleted}
                      onChange={(e) => setPreferences(prev => ({ ...prev, showCompleted: e.target.checked }))}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handlePreferencesSubmit} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
