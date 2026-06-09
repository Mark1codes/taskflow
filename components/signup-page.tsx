"use client"

import type React from "react"
import supabase from '../utils/supabase'
import { useState } from "react"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SignUpPageProps {
  onSignUp: (userData: any) => void
  onLogin: () => void
  onBack: () => void
}

export function SignUpPage({ onSignUp, onLogin, onBack }: SignUpPageProps) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) { setError("Passwords don't match"); setIsLoading(false); return }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters"); setIsLoading(false); return }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.name } },
      })

      if (authError) { setError(authError.message); setIsLoading(false); return }

      if (data.user) {
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          full_name: formData.name,
        })

        if (insertError && !insertError.message.includes('duplicate key')) {
          setError("Failed to create user profile: " + insertError.message)
          setIsLoading(false)
          return
        }

        onSignUp({
          id: data.user.id,
          name: formData.name,
          email: data.user.email || "",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email || ""}`,
        })
      }
    } catch (err: any) {
      setError("An unexpected error occurred: " + err.message)
    }
    setIsLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) setError(error.message)
    } catch (err: any) {
      setError("Google sign-in failed: " + err.message)
    }
    setIsLoading(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 bg-slate-900 p-10">
        <BrandLogo markClassName="bg-blue-600" textClassName="text-white" />

        <div className="flex flex-1 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Everything you need to stay organised</h2>
          <div className="space-y-4">
            {[
              { icon: "✓", text: "Kanban boards & task lists" },
              { icon: "✓", text: "Calendar scheduling" },
              { icon: "✓", text: "Gemini AI assistant" },
              { icon: "✓", text: "Real-time task updates" },
              { icon: "✓", text: "Real-time collaboration" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{item.icon}</span>
                </div>
                <span className="text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        </div>

      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          <Button variant="ghost" onClick={onBack} className="mb-8 -ml-2 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to home
          </Button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-slate-500 mt-1 text-sm">Start your productivity journey — free forever</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="name" type="text" placeholder="Jane Smith" value={formData.name}
                  onChange={e => handleChange("name", e.target.value)}
                  className="pl-9 h-11 border-slate-200 focus-visible:ring-blue-500" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="email" type="email" placeholder="you@company.com" value={formData.email}
                  onChange={e => handleChange("email", e.target.value)}
                  className="pl-9 h-11 border-slate-200 focus-visible:ring-blue-500" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 6 characters"
                  value={formData.password} onChange={e => handleChange("password", e.target.value)}
                  className="pl-9 pr-10 h-11 border-slate-200 focus-visible:ring-blue-500" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-sm font-medium text-slate-700">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="confirm" type={showConfirm ? "text" : "password"} placeholder="Repeat password"
                  value={formData.confirmPassword} onChange={e => handleChange("confirmPassword", e.target.value)}
                  className="pl-9 pr-10 h-11 border-slate-200 focus-visible:ring-blue-500" required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white mt-2" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…
                </span>
              ) : "Create account"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400">or</span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-11 border-slate-200 text-slate-600 hover:text-slate-900" onClick={handleGoogleSignIn} disabled={isLoading}>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
              <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/>
              <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"/>
              <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <button onClick={onLogin} className="text-blue-600 font-medium hover:underline">Sign in</button>
          </p>
          <p className="text-center text-xs text-slate-400 mt-3">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
