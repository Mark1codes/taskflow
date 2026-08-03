"use client"

import type React from "react"
import { useState } from "react"
import supabase from "@/utils/supabase"
import { BrandLogo } from "@/components/layout/brand-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"

interface ForgotPasswordPageProps {
  onBack: () => void
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      })
      
      if (authError) {
        setError(authError.message)
      } else {
        setSuccess(true)
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
          <div className="mb-7 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-blue-400">
            <span className="h-px w-8 bg-blue-500" />
            Secure Access
          </div>
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.06em]">
            Recover your<br />workspace.
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
            We'll send you a secure link to get you back into TaskFlow, so you don't lose momentum.
          </p>
        </div>
      </aside>
      <main className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-12 flex items-center justify-between">
            <button onClick={onBack} className="group flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-950">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to login
            </button>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">TASKFLOW / RECOVERY</span>
          </div>
          
          <div className="mb-9">
            <h1 className="text-3xl font-semibold tracking-[-0.055em] text-slate-950">Forgot password?</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {error && <Alert variant="destructive" className="mb-5"><AlertDescription>{error}</AlertDescription></Alert>}
          
          {success ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mb-2 font-semibold text-emerald-900">Check your email</h3>
              <p className="text-sm text-emerald-700">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email} 
                    onChange={e => {setEmail(e.target.value); setError("")}} 
                    className="h-12 rounded-md border-slate-200 bg-white pl-10 text-sm shadow-sm focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/15" 
                    required 
                  />
                </div>
              </div>
              
              <Button type="submit" className="h-12 w-full rounded-md bg-blue-600 text-sm font-medium text-white shadow-[0_8px_20px_rgba(41,122,255,0.18)] hover:bg-blue-700" disabled={isLoading || !email}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending link…
                  </span>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
