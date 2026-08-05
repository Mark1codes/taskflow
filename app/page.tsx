"use client"

import { useState, useEffect } from "react"
import { LandingPage } from "@/components/core/landing-page"
import { LoginPage } from "@/components/auth/login-page"
import { SignUpPage } from "@/components/auth/signup-page"
import { TaskManagerApp } from "@/components/core/task-manager-app"
import { ForgotPasswordPage } from "@/components/auth/forgot-password-page"
import { ResetPasswordPage } from "@/components/auth/reset-password-page"
import supabase from '../utils/supabase'
import { getAvatarDisplayUrl } from "@/utils/avatar"
import { Loader2 } from "lucide-react"

type AuthState = "initializing" | "landing" | "login" | "signup" | "authenticated" | "forgot-password" | "reset-password"

let isRecovering = false
if (typeof window !== 'undefined') {
  if (window.location.hash.includes("type=recovery") || window.location.search.includes("type=recovery")) {
    isRecovering = true
  }
}

export default function Home() {
  const [authState, setAuthState] = useState<AuthState>(isRecovering ? "reset-password" : "initializing")
  const [user, setUser] = useState<any>(null)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true)

  
  useEffect(() => {
    const titles: Record<AuthState, string> = {
      initializing: "TaskFlow",
      landing:      "TaskFlow — Focused Task Management",
      login:        "Sign In — TaskFlow",
      signup:       "Create Account — TaskFlow",
      authenticated: "TaskFlow",
      "forgot-password": "Forgot Password — TaskFlow",
      "reset-password": "Reset Password — TaskFlow",
    }
    document.title = titles[authState] ?? "TaskFlow"
  }, [authState])

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase environment variables are not configured')
      setIsSupabaseConfigured(false)
      return
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY' || isRecovering) {
        isRecovering = true
        setAuthState("reset-password")
      } else if (event === 'SIGNED_IN' && session?.user && !isRecovering) {
        const userData = await createUserData(session.user)
        setUser(userData)
        setAuthState("authenticated")
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setAuthState("landing")
      }
    })

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        // Prevent redirecting to dashboard if we are in the password recovery flow
        if (isRecovering || window.location.hash.includes("type=recovery")) {
          isRecovering = true
          setAuthState("reset-password")
          return
        }

        if (session?.user && !isRecovering) {
          const userData = await createUserData(session.user)
          setUser(userData)
          setAuthState("authenticated")
        } else if (window.location.pathname === '/auth/callback') {
          const urlParams = new URLSearchParams(window.location.search)
          const code = urlParams.get('code')
          if (code) {
            try {
              const { data, error } = await supabase.auth.exchangeCodeForSession(code)
              if (error) {
                console.error("OAuth exchange error:", error)
              } else if (data.session?.user) {
                const userData = await createUserData(data.session.user)
                setUser(userData)
                setAuthState("authenticated")
                return
              }
            } catch (err) {
              console.error("Error exchanging code for session:", err)
            }
          }
          window.history.replaceState({}, document.title, '/')
          setAuthState("landing")
        } else {
          // No active session — show landing page
          setAuthState("landing")
        }
      } catch (error) {
        console.error("Session check error:", error)
        setAuthState("landing")
      }
    }

    checkSession()

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const createUserData = async (authUser: any) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', authUser.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
          })

        if (insertError) {
          console.error("Failed to create user record:", insertError)
        }
      }

      const avatar = await getAvatarDisplayUrl(
        supabase,
        authUser.user_metadata?.avatar_path,
        authUser.user_metadata?.avatar_url || ""
      )

      return {
        id: authUser.id,
        name: profileData?.full_name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
        email: authUser.email || "",
        avatar,
      }
    } catch (error) {
      console.error("Error creating user data:", error)
      const avatar = await getAvatarDisplayUrl(
        supabase,
        authUser.user_metadata?.avatar_path,
        authUser.user_metadata?.avatar_url || ""
      )

      return {
        id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
        email: authUser.email || "",
        avatar,
      }
    }
  }

  const handleLogin = (userData: any) => {
    setUser(userData)
    setAuthState("authenticated")
  }

  const handleLogout = async () => {
    setUser(null)
    setAuthState("landing")

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Logout error:", error)
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const renderContent = () => {
    if (!isSupabaseConfigured) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h2>
            <p className="text-gray-700 mb-4">
              Supabase environment variables are not configured. Please add the following to your Vercel environment variables:
            </p>
            <ul className="text-left text-sm bg-gray-100 p-4 rounded mb-4">
              <li className="mb-2"><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
              <li><code>NEXT_PUBLIC_SUPABASE_KEY</code></li>
            </ul>
            <p className="text-sm text-gray-600">
              You can find these values in your Supabase project settings.
            </p>
          </div>
        </div>
      )
    }

    switch (authState) {
      case "initializing":
        // Block rendering entirely until session check resolves — prevents any flash
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f9fc]">
            <div className="flex flex-col items-center gap-8">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51 41" role="img" aria-label="TaskFlow" width="32" height="26">
                  <path d="M43 31L31 40H5L7 35L12 31H29L32 35L40 11L45 7H50L43 31ZM43 5L38 9H21L18 5L10 29L5 33H0L7 9L19 0H45L43 5ZM24 13H35L29 31L26 27H15L21 9L24 13Z" fill="#297AFF"/>
                </svg>
                <span className="text-xl font-bold text-slate-900 tracking-tight">TaskFlow</span>
              </div>

              {/* Animated progress bar */}
              <div className="w-48 h-0.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    animation: "taskflow-load 1.4s ease-in-out infinite",
                  }}
                />
              </div>

              {/* Pulsing dots */}
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-blue-400"
                    style={{ animation: `taskflow-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>

              <style>{`
                @keyframes taskflow-load {
                  0% { transform: translateX(-100%); width: 40%; }
                  50% { width: 60%; }
                  100% { transform: translateX(300%); width: 40%; }
                }
                @keyframes taskflow-dot {
                  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
                  40% { opacity: 1; transform: scale(1.2); }
                }
              `}</style>
            </div>
          </div>
        )


      case "landing":
        return <LandingPage onLogin={() => setAuthState("login")} onSignUp={() => setAuthState("signup")} />

      case "login":
        return (
          <LoginPage
            onLogin={handleLogin}
            onSignUp={() => setAuthState("signup")}
            onBack={() => setAuthState("landing")}
            onForgotPassword={() => setAuthState("forgot-password")}
          />
        )

      case "signup":
        return (
          <SignUpPage
            onSignUp={handleLogin}
            onLogin={() => setAuthState("login")}
            onBack={() => setAuthState("landing")}
          />
        )

      case "forgot-password":
        return <ForgotPasswordPage onBack={() => setAuthState("login")} />

      case "reset-password":
        return <ResetPasswordPage onSuccess={() => setAuthState("login")} />

      case "authenticated":
        return <TaskManagerApp user={user} onLogout={handleLogout} />

      default:
        return <LandingPage onLogin={() => setAuthState("login")} onSignUp={() => setAuthState("signup")} />
    }
  }

  return (
    <div className="min-h-screen">
      <div key={authState} className="animate-page-enter">
        {renderContent()}
      </div>
    </div>
  )
}
