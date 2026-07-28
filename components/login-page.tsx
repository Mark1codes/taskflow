"use client"

import type React from "react"
import supabase from "../utils/supabase"
import { useState } from "react"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowUpRight, Check, Eye, EyeOff, Lock, Mail } from "lucide-react"

interface LoginPageProps {
  onLogin: (userData: any) => void
  onSignUp: () => void
  onBack: () => void
}

function GoogleIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
}

export function LoginPage({ onLogin, onSignUp, onBack }: LoginPageProps) {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError("")
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password })
      if (authError) { setError(authError.message); setIsLoading(false); return }
      if (data.user) {
        const { data: profileData } = await supabase.from("users").select("full_name").eq("id", data.user.id).single()
        if (!profileData) await supabase.from("users").insert({ id: data.user.id, full_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User" })
        onLogin({ id: data.user.id, name: profileData?.full_name || data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User", email: data.user.email || "", avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email || ""}` })
      }
    } catch (err: any) { setError("An unexpected error occurred: " + err.message) }
    setIsLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true); setError("")
    try { const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } }); if (error) setError(error.message) }
    catch (err: any) { setError("Google sign-in failed: " + err.message) }
    setIsLoading(false)
  }

  const handleChange = (field: string, value: string) => { setFormData(prev => ({ ...prev, [field]: value })); if (error) setError("") }

  return (
    <div className="min-h-screen bg-[#f7f8fa] lg:grid lg:grid-cols-[minmax(360px,0.85fr)_1.15fr]">
      <aside className="relative hidden overflow-hidden bg-[#0b111b] p-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,#64748b_1px,transparent_1px),linear-gradient(to_bottom,#64748b_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative z-10"><BrandLogo className="w-[130px]" light /></div>
        <div className="relative z-10 mt-auto max-w-md pb-8"><div className="mb-7 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-blue-400"><span className="h-px w-8 bg-blue-500" />Your workspace, in motion</div><h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.06em]">Pick up exactly<br />where you left off.</h2><p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">TaskFlow keeps the next right action close, so your team can spend less time finding context and more time moving work forward.</p><div className="mt-10 border-t border-white/10 pt-5"><div className="flex items-center justify-between text-[10px] text-slate-500"><span>PROJECT / WEBSITE REDESIGN</span><span>68% COMPLETE</span></div><div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[68%] rounded-full bg-blue-500" /></div></div></div>
      </aside>
      <main className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-12 flex items-center justify-between"><button onClick={onBack} className="group flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-950"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to home</button><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">TASKFLOW / 01</span></div>
          <div className="mb-9"><h1 className="text-3xl font-semibold tracking-[-0.055em] text-slate-950">Welcome back.</h1><p className="mt-3 text-sm leading-6 text-slate-500">Sign in to return to your focused workspace.</p></div>
          {error && <Alert variant="destructive" className="mb-5"><AlertDescription>{error}</AlertDescription></Alert>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2"><Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-slate-500">Work email</Label><div className="relative"><Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="email" type="email" placeholder="you@company.com" value={formData.email} onChange={e => handleChange("email", e.target.value)} className="h-12 rounded-md border-slate-200 bg-white pl-10 text-sm shadow-sm focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/15" required /></div></div>
            <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-slate-500">Password</Label><Button type="button" variant="link" className="h-auto p-0 text-xs font-medium text-blue-600">Forgot password?</Button></div><div className="relative"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={e => handleChange("password", e.target.value)} className="h-12 rounded-md border-slate-200 bg-white pl-10 pr-10 text-sm shadow-sm focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/15" required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            <Button type="submit" className="h-12 w-full rounded-md bg-blue-600 text-sm font-medium text-white shadow-[0_8px_20px_rgba(41,122,255,0.18)] hover:bg-blue-700" disabled={isLoading}>{isLoading ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Signing in…</span> : <span className="flex items-center justify-center gap-2">Sign in <ArrowUpRight className="h-4 w-4" /></span>}</Button>
          </form>
          <div className="relative my-7"><div className="absolute inset-0 flex items-center"><Separator /></div><div className="relative flex justify-center"><span className="bg-[#f7f8fa] px-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">or continue with</span></div></div>
          <Button variant="outline" className="h-12 w-full rounded-md border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:text-slate-950" onClick={handleGoogleSignIn} disabled={isLoading}><GoogleIcon /> <span className="ml-2">Google</span></Button>
          <p className="mt-8 text-center text-sm text-slate-500">New to TaskFlow? <button onClick={onSignUp} className="font-medium text-blue-600 hover:text-blue-700">Create an account</button></p>
          <div className="mt-14 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-slate-400"><Check className="h-3.5 w-3.5 text-emerald-500" /> Secure workspace access</div>
        </div>
      </main>
    </div>
  )
}
