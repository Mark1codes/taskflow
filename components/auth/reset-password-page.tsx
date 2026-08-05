"use client"

import type React from "react"
import { useState } from "react"
import supabase from "@/utils/supabase"
import { BrandLogo } from "@/components/layout/brand-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, ArrowUpRight } from "lucide-react"

interface ResetPasswordPageProps {
  onSuccess: () => void
}

export function ResetPasswordPage({ onSuccess }: ResetPasswordPageProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setIsLoading(false)
      return
    }

    if (password.length < 8) { setError("Password must be at least 8 characters"); setIsLoading(false); return }
    if (!/[A-Z]/.test(password)) { setError("Password must include at least one uppercase letter"); setIsLoading(false); return }
    if (!/[a-z]/.test(password)) { setError("Password must include at least one lowercase letter"); setIsLoading(false); return }
    if (!/[0-9]/.test(password)) { setError("Password must include at least one number"); setIsLoading(false); return }
    if (!/[^A-Za-z0-9]/.test(password)) { setError("Password must include at least one special character (e.g. !@#$)"); setIsLoading(false); return }
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })
      
      if (updateError) {
        setError(updateError.message)
      } else {
        onSuccess()
      }
    } catch (err: any) {
      setError("An unexpected error occurred: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] lg:grid lg:grid-cols-[minmax(360px,0.85fr)_1.15fr]">
      <aside className="relative hidden overflow-hidden bg-[#0b111b] p-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,#64748b_1px,transparent_1px),linear-gradient(to_bottom,#64748b_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative z-10"><BrandLogo className="w-[130px]" light /></div>
        <div className="relative z-10 mt-auto max-w-md pb-8">
          <div className="mb-7 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-emerald-400">
            <span className="h-px w-8 bg-emerald-500" />
            Identity Verified
          </div>
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.06em]">
            Set your new<br />password.
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
            Please choose a strong password. You'll use this to access your workspace from now on.
          </p>
        </div>
      </aside>
      <main className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-12 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">TASKFLOW / RESET</span>
          </div>
          
          <div className="mb-9">
            <h1 className="text-3xl font-semibold tracking-[-0.055em] text-slate-950">Update password</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter and confirm your new password to secure your account.
            </p>
          </div>

          {error && <Alert variant="destructive" className="mb-5"><AlertDescription>{error}</AlertDescription></Alert>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Min 8 chars, A-z, 0-9, !@#" 
                  value={password} 
                  onChange={e => {setPassword(e.target.value); setError("")}} 
                  className="h-12 rounded-md border-slate-200 bg-white pl-10 pr-10 text-sm shadow-sm focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/15" 
                  required 
                />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="flex gap-1 pt-1">
                  {[
                    password.length >= 8,
                    /[A-Z]/.test(password),
                    /[a-z]/.test(password),
                    /[0-9]/.test(password),
                    /[^A-Za-z0-9]/.test(password)
                  ].map((met, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${met ? "bg-emerald-500" : "bg-slate-200"}`} />
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  id="confirmPassword" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={confirmPassword} 
                  onChange={e => {setConfirmPassword(e.target.value); setError("")}} 
                  className="h-12 rounded-md border-slate-200 bg-white pl-10 pr-10 text-sm shadow-sm focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/15" 
                  required 
                />
              </div>
            </div>
            
            <Button type="submit" className="h-12 w-full rounded-md bg-blue-600 text-sm font-medium text-white shadow-[0_8px_20px_rgba(41,122,255,0.18)] hover:bg-blue-700" disabled={isLoading || !password || !confirmPassword}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Updating password…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">Update Password <ArrowUpRight className="h-4 w-4" /></span>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
