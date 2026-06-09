"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BrandLogo } from "@/components/brand-logo"
import {
  Calendar, BarChart3, Zap, Shield,
  ArrowRight, LayoutDashboard, Kanban, Clock,
} from "lucide-react"
import { useEffect, useState } from "react"

interface LandingPageProps {
  onLogin: () => void
  onSignUp: () => void
}

const features = [
  { icon: LayoutDashboard, title: "Smart Dashboard", description: "Comprehensive overview of all your tasks with intelligent insights and real-time analytics." },
  { icon: Kanban, title: "Kanban Boards", description: "Visualize your workflow with drag-and-drop Kanban boards for intuitive task management." },
  { icon: Calendar, title: "Calendar View", description: "Never miss a deadline with our integrated calendar and smart scheduling system." },
  { icon: Clock, title: "Time Planning", description: "Plan focused work blocks and keep deadlines visible across your whole workspace." },
  { icon: BarChart3, title: "Progress Tracking", description: "Monitor productivity with detailed analytics and beautiful progress reports." },
  { icon: Shield, title: "Secure & Reliable", description: "Enterprise-grade security with row-level policies and regular encrypted backups." },
]

function HeroIllustration() {
  return (
    <svg viewBox="0 0 520 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xl">
      {/* Background card */}
      <rect x="20" y="30" width="480" height="340" rx="12" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />

      {/* Top bar */}
      <rect x="20" y="30" width="480" height="44" rx="12" fill="#0F172A" />
      <rect x="20" y="62" width="480" height="12" fill="#0F172A" />
      <circle cx="46" cy="52" r="6" fill="#EF4444" opacity="0.8" />
      <circle cx="64" cy="52" r="6" fill="#F59E0B" opacity="0.8" />
      <circle cx="82" cy="52" r="6" fill="#22C55E" opacity="0.8" />
      <text x="240" y="57" textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="Inter, sans-serif">TaskFlow — Project Alpha</text>

      {/* Column headers */}
      <rect x="36" y="90" width="136" height="28" rx="6" fill="#F1F5F9" />
      <text x="104" y="109" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">TO DO</text>
      <rect x="192" y="90" width="136" height="28" rx="6" fill="#EFF6FF" />
      <text x="260" y="109" textAnchor="middle" fill="#2563EB" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">IN PROGRESS</text>
      <rect x="348" y="90" width="136" height="28" rx="6" fill="#F0FDF4" />
      <text x="416" y="109" textAnchor="middle" fill="#16A34A" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">DONE</text>

      {/* TO DO cards */}
      <rect x="36" y="130" width="136" height="68" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="36" y="130" width="3" height="68" rx="1.5" fill="#94A3B8" />
      <text x="50" y="150" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">Design review</text>
      <rect x="50" y="158" width="52" height="16" rx="4" fill="#FEF3C7" />
      <text x="76" y="170" textAnchor="middle" fill="#D97706" fontSize="9" fontFamily="Inter, sans-serif">Medium</text>
      <text x="50" y="188" fill="#94A3B8" fontSize="9" fontFamily="Inter, sans-serif">Due Jun 10</text>

      <rect x="36" y="210" width="136" height="60" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="36" y="210" width="3" height="60" rx="1.5" fill="#94A3B8" />
      <text x="50" y="230" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">Write test cases</text>
      <rect x="50" y="238" width="40" height="16" rx="4" fill="#FEE2E2" />
      <text x="70" y="250" textAnchor="middle" fill="#DC2626" fontSize="9" fontFamily="Inter, sans-serif">High</text>

      <rect x="36" y="282" width="136" height="60" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="36" y="282" width="3" height="60" rx="1.5" fill="#94A3B8" />
      <text x="50" y="302" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">Update docs</text>
      <rect x="50" y="310" width="36" height="16" rx="4" fill="#F0FDF4" />
      <text x="68" y="322" textAnchor="middle" fill="#16A34A" fontSize="9" fontFamily="Inter, sans-serif">Low</text>

      {/* IN PROGRESS cards */}
      <rect x="192" y="130" width="136" height="68" rx="6" fill="white" stroke="#DBEAFE" strokeWidth="1" />
      <rect x="192" y="130" width="3" height="68" rx="1.5" fill="#2563EB" />
      <text x="206" y="150" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">API integration</text>
      <rect x="206" y="158" width="52" height="16" rx="4" fill="#FEF3C7" />
      <text x="232" y="170" textAnchor="middle" fill="#D97706" fontSize="9" fontFamily="Inter, sans-serif">Medium</text>
      {/* Progress bar */}
      <rect x="206" y="183" width="106" height="5" rx="2.5" fill="#E2E8F0" />
      <rect x="206" y="183" width="72" height="5" rx="2.5" fill="#2563EB" />
      <text x="170" y="189" fill="#94A3B8" fontSize="8" fontFamily="Inter, sans-serif">68%</text>

      <rect x="192" y="210" width="136" height="68" rx="6" fill="white" stroke="#DBEAFE" strokeWidth="1" />
      <rect x="192" y="210" width="3" height="68" rx="1.5" fill="#2563EB" />
      <text x="206" y="230" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">UI redesign</text>
      <rect x="206" y="238" width="40" height="16" rx="4" fill="#FEE2E2" />
      <text x="226" y="250" textAnchor="middle" fill="#DC2626" fontSize="9" fontFamily="Inter, sans-serif">High</text>
      <rect x="206" y="263" width="106" height="5" rx="2.5" fill="#E2E8F0" />
      <rect x="206" y="263" width="40" height="5" rx="2.5" fill="#2563EB" />

      {/* DONE cards */}
      <rect x="348" y="130" width="136" height="60" rx="6" fill="white" stroke="#DCFCE7" strokeWidth="1" />
      <rect x="348" y="130" width="3" height="60" rx="1.5" fill="#16A34A" />
      <text x="362" y="150" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">User research</text>
      <text x="362" y="165" fill="#94A3B8" fontSize="9" fontFamily="Inter, sans-serif">Completed Jun 2</text>
      {/* Check icon */}
      <circle cx="466" cy="150" r="9" fill="#16A34A" />
      <path d="M461 150l3.5 3.5 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      <rect x="348" y="202" width="136" height="60" rx="6" fill="white" stroke="#DCFCE7" strokeWidth="1" />
      <rect x="348" y="202" width="3" height="60" rx="1.5" fill="#16A34A" />
      <text x="362" y="222" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">Database schema</text>
      <text x="362" y="237" fill="#94A3B8" fontSize="9" fontFamily="Inter, sans-serif">Completed Jun 1</text>
      <circle cx="466" cy="222" r="9" fill="#16A34A" />
      <path d="M461 222l3.5 3.5 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      <rect x="348" y="274" width="136" height="60" rx="6" fill="white" stroke="#DCFCE7" strokeWidth="1" />
      <rect x="348" y="274" width="3" height="60" rx="1.5" fill="#16A34A" />
      <text x="362" y="294" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">Auth flow</text>
      <text x="362" y="309" fill="#94A3B8" fontSize="9" fontFamily="Inter, sans-serif">Completed May 30</text>
      <circle cx="466" cy="294" r="9" fill="#16A34A" />
      <path d="M461 294l3.5 3.5 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LandingPage({ onLogin, onSignUp }: LandingPageProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <nav className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <BrandLogo
              textClassName="text-slate-900"
              markClassName="bg-blue-600"
              className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
            />
            <div className={`flex items-center gap-3 transition-all duration-500 delay-100 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}>
              <Button variant="ghost" onClick={onLogin} className="text-slate-600 hover:text-slate-900">
                Sign In
              </Button>
              <Button onClick={onSignUp} className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white dot-grid">
        {/* Subtle top-left glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy */}
            <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <Badge className="mb-5 bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50">
                <Zap className="h-3 w-3 mr-1" /> Now with Gemini AI
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                The task manager<br />
                <span className="text-blue-600">built for focus</span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
                Organise, prioritise, and ship faster with TaskFlow. Kanban boards, 
                calendar scheduling, AI insights, and real-time task updates — all in one clean workspace.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" onClick={onSignUp} className="bg-blue-600 hover:bg-blue-700 text-white px-7 h-12 text-base">
                  Start for free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={onLogin} className="h-12 text-base border-slate-200 text-slate-600 hover:text-slate-900">
                  Sign in
                </Button>
              </div>
            </div>

            {/* Right — illustration */}
            <div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-50 rounded-2xl" />
                <div className="relative p-4">
                  <HeroIllustration />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need, nothing you don't</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              A thoughtfully designed toolkit that helps individuals and teams stay organised without the noise.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="p-6 rounded-xl border border-slate-100 bg-white card-hover group">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-200">
                    <Icon className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors duration-200" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Dark CTA band ── */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Built for clear execution</h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Keep priorities, deadlines, and project context together. TaskFlow gives teams a calm workspace
                for planning, tracking, and shipping important work.
              </p>
              <Button onClick={onSignUp} className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6">
                <ArrowRight className="mr-2 h-4 w-4" /> Start Planning Free
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* ── Final CTA ── */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Ready to get organised?</h2>
          <p className="text-slate-500 mb-8">Join thousands of teams already shipping faster with TaskFlow. Free to start, no credit card required.</p>
          <Button size="lg" onClick={onSignUp} className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base">
            Create free account <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <BrandLogo
                className="mb-3"
                markClassName="h-7 w-7 bg-blue-600"
                textClassName="text-base text-white"
              />
              <p className="text-slate-400 text-sm leading-relaxed">The modern task management platform for productive teams.</p>
            </div>
            {[
              { heading: "Product", links: ["Features", "Integrations", "API", "Security"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { heading: "Support", links: ["Help Center", "Documentation", "Community", "Status"] },
            ].map((col, i) => (
              <div key={i}>
                <h3 className="font-semibold text-white mb-4 text-sm">{col.heading}</h3>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l} className="text-slate-400 text-sm hover:text-white cursor-pointer transition-colors">{l}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
            © 2025 TaskFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
