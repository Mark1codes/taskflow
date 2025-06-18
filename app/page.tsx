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

  // Function to create user data object
  const createUserData = async (authUser: any) => {
    // First try to get user data from our users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', authUser.id)
      .single()

    // If user doesn't exist in our users table, create them
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
  }

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = await createUserData(session.user)
        setUser(userData)
        setAuthState("authenticated")
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setAuthState("landing")
      }
      // Handle other events as needed
    })

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const userData = await createUserData(session.user)
        setUser(userData)
        setAuthState("authenticated")
      } else if (window.location.pathname === '/auth/callback') {
        // Handle OAuth redirect
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
        // Clean up URL after processing
        window.history.replaceState({}, document.title, '/')
      }
    }
    
    checkSession()

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogin = (userData: any) => {
    setUser(userData)
    setAuthState("authenticated")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAuthState("landing")
  }

  const renderContent = () => {
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