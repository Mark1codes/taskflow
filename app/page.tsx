"use client"

import { useState, useEffect } from "react"
import { LandingPage } from "@/components/landing-page"
import { LoginPage } from "@/components/login-page"
import { SignUpPage } from "@/components/signup-page"
import { TaskManagerApp } from "@/components/task-manager-app"
import supabase from '../utils/supabase'

type AuthState = "landing" | "login" | "signup" | "authenticated"

export default function Home() {
  const [authState, setAuthState] = useState<AuthState>("landing")
  const [user, setUser] = useState<any>(null)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true)

  useEffect(() => {
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase environment variables are not configured')
      setIsSupabaseConfigured(false)
      return
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
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
        if (session?.user) {
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
              }
            } catch (err) {
              console.error("Error exchanging code for session:", err)
            }
          }
          window.history.replaceState({}, document.title, '/')
        }
      } catch (error) {
        console.error("Session check error:", error)
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
        .select('full_name, email')
        .eq('id', authUser.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
            email: authUser.email,
          })

        if (insertError) {
          console.error("Failed to create user record:", insertError)
        }
      }

      return {
        id: authUser.id,
        name: profileData?.full_name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
        email: profileData?.email || authUser.email || "",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.email || ""}`,
      }
    } catch (error) {
      console.error("Error creating user data:", error)
      return {
        id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
        email: authUser.email || "",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.email || ""}`,
      }
    }
  }

  const handleLogin = (userData: any) => {
    setUser(userData)
    setAuthState("authenticated")
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setAuthState("landing")
    } catch (error) {
      console.error("Logout error:", error)
      setUser(null)
      setAuthState("landing")
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
      case "landing":
        return <LandingPage onLogin={() => setAuthState("login")} onSignUp={() => setAuthState("signup")} />
      case "login":
        return (
          <LoginPage
            onLogin={handleLogin}
            onSignUp={() => setAuthState("signup")}
            onBack={() => setAuthState("landing")}
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
      case "authenticated":
        return <TaskManagerApp user={user} onLogout={handleLogout} />
      default:
        return <LandingPage onLogin={() => setAuthState("login")} onSignUp={() => setAuthState("signup")} />
    }
  }

  return <div className="min-h-screen">{renderContent()}</div>
}