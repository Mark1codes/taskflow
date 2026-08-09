"use client"
import Link from "next/link"

import { BrandLogo } from "@/components/layout/brand-logo"
import { Button } from "@/components/ui/button"
import {
  ArrowDown,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Command,
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCheck,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Menu,
  Plus,
  Search,
  Layers3,
  MessageSquare,
  Settings2,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

// Lightweight scroll-reveal hook using IntersectionObserver
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, visible }
}

interface LandingPageProps {
  onLogin: () => void
  onSignUp: () => void
}

const features = [
  { icon: CheckCircle2, title: "Stay focused", description: "A clean workspace that helps you prioritize what matters most." },
  { icon: Users, title: "Work in sync", description: "Keep everyone aligned with clarity across tasks and projects." },
  { icon: Zap, title: "Move faster", description: "From planning to execution, keep momentum without the noise." },
]

const tools = [
  { icon: CheckCircle2, title: "Organize your work", description: "Break down projects into tasks and keep everything in its place." },
  { icon: ListTodo, title: "See the bigger picture", description: "Switch views to track progress your way." },
  { icon: CircleDot, title: "Own your day", description: "Focus on your tasks without distractions." },
  { icon: Bell, title: "Stay on track", description: "Get timely updates and never miss what's important." },
  { icon: Sparkles, title: "Work smarter with AI", description: "Generate subtasks, draft updates, and prioritize your focus instantly." },
]

type NavDetail = { section: string; title: string; description: string; icon: typeof CheckCircle2; primary: string; secondary: string; points: string[]; workflow: string[] }

const navDetails: Record<string, NavDetail> = {
  "Task management": { section: "Product", title: "One clear place for the work that matters.", description: "Turn scattered requests into an organized operating rhythm. TaskFlow gives every project a home, every task an owner, and every deadline a next step.", icon: CheckCheck, primary: "Start organizing", secondary: "View workflow", points: ["Capture work in seconds", "Assign owners and due dates", "See progress without status meetings"], workflow: ["Capture the request", "Shape it into a task", "Move it to done"] },
  Views: { section: "Product", title: "Choose the view that matches the work.", description: "Move from a focused task list to a calendar or Kanban board without copying data or losing context. Your team works from one source of truth.", icon: Layers3, primary: "Explore workspace views", secondary: "See the difference", points: ["List view for daily focus", "Board view for flow", "Calendar view for commitments"], workflow: ["List for clarity", "Board for momentum", "Calendar for timing"] },
  "AI assistant": { section: "Product", title: "Make the next action obvious.", description: "TaskFlow AI turns project context into useful momentum: summarize a thread, break down a goal, or surface the task that needs attention next.", icon: Sparkles, primary: "Try the assistant", secondary: "See example prompts", points: ["Summarize project context", "Break big goals into steps", "Draft updates in your team's voice"], workflow: ["Bring the context", "Ask for a next step", "Keep moving"] },
  "For teams": { section: "Solutions", title: "Keep priorities aligned as work changes.", description: "Give every team a shared operating picture, from weekly planning to the last mile of delivery. Less chasing. More confident decisions.", icon: Users, primary: "Build team alignment", secondary: "See team workflow", points: ["Shared priorities", "Clear ownership", "Progress everyone can trust"], workflow: ["Set the priority", "Share the context", "Ship together"] },
  "For design": { section: "Solutions", title: "Move from a good idea to shipped work.", description: "Keep briefs, decisions, feedback, and delivery connected. TaskFlow gives creative teams room to think and a system to finish.", icon: Command, primary: "Support your design team", secondary: "Explore the process", points: ["Turn briefs into milestones", "Keep feedback attached to work", "Protect deep-work time"], workflow: ["Shape the brief", "Make the decision", "Release the work"] },
  "For operations": { section: "Solutions", title: "Make recurring work repeatable.", description: "Build dependable operating habits with reusable workflows, visible handoffs, and a calm place to manage the details that keep the business moving.", icon: Settings2, primary: "Design your workflow", secondary: "See an operations setup", points: ["Standardize repeatable work", "Spot blockers early", "Create reliable handoffs"], workflow: ["Define the playbook", "Run the workflow", "Improve the system"] },
  Documentation: { section: "Resources", title: "Understand the TaskFlow system.", description: "Find the practical answers you need to set up your workspace, shape your projects, and help your team build a better way of working.", icon: BookOpen, primary: "Read the documentation", secondary: "Browse the basics", points: ["Workspace setup", "Project and task fundamentals", "Team conventions"], workflow: ["Learn the model", "Set up your space", "Make it yours"] },
  Guides: { section: "Resources", title: "Practical ways to work with more clarity.", description: "Short, useful guidance for planning projects, protecting focus, and creating a team rhythm that lasts beyond the kickoff meeting.", icon: MessageSquare, primary: "Read the guides", secondary: "Find a better habit", points: ["Plan a realistic week", "Run sharper check-ins", "Turn review into progress"], workflow: ["Choose the habit", "Try it this week", "Keep what works"] },
  Changelog: { section: "Resources", title: "A product that keeps getting better.", description: "Follow the improvements behind TaskFlow: thoughtful refinements, new capabilities, and the small details that make daily work feel lighter.", icon: BarChart3, primary: "View product updates", secondary: "See recent improvements", points: ["New workflow capabilities", "Faster everyday actions", "Quality-of-life refinements"], workflow: ["Listen to feedback", "Make the improvement", "Put it to work"] },
}

const navItems = [
  { label: "Product", items: [["Task management", "Plan, track, and finish work"], ["Views", "List, calendar, and Kanban workflows"], ["AI assistant", "Turn context into your next action"]] },
  { label: "Solutions", items: [["For teams", "Keep priorities aligned"], ["For design", "Move from idea to shipped"], ["For operations", "Make recurring work repeatable"]] },
  { label: "Resources", items: [["Documentation", "Learn the TaskFlow system"], ["Guides", "Practical ways to work better"], ["Changelog", "See what is new"]] },
]

function FeatureCarousel() {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsPaused(false)
      }}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent sm:w-16" />
      <div className="no-scrollbar overflow-hidden px-8 pb-3 sm:px-16 lg:px-20">
        <div className="feature-marquee flex w-max gap-4" style={{ animationPlayState: isPaused ? "paused" : "running" }}>
          {[...tools, ...tools].map(({ icon: Icon, title, description }, index) => (
            <article key={`${title}-${index}`} className="w-[calc(100vw-4rem)] shrink-0 border-y border-slate-200 px-1 py-9 sm:w-[calc((100vw-9rem)/2)] sm:px-7 lg:w-[calc((min(1120px,100vw)-11rem)/3)] lg:px-6">
              <Icon className="h-6 w-6 text-blue-600" strokeWidth={1.7} />
              <h3 className="mt-7 text-base font-medium text-slate-950">{title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">{description}</p>
              <div className="mt-9 h-1 w-12 overflow-hidden rounded-full bg-blue-100"><div className="h-full w-2/3 rounded-full bg-blue-600" /></div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

function DetailView({ detail, onBack, onSignUp }: { detail: NavDetail; onBack: () => void; onSignUp: () => void }) {
  const Icon = detail.icon
  return <div className="min-h-[calc(100vh-69px)] bg-[#f8fafc]"><section className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:pb-24 lg:pt-16"><button onClick={onBack} className="mb-14 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Back to TaskFlow</button><div className="grid items-end gap-12 lg:grid-cols-[0.9fr_1.1fr]"><div className="max-w-xl"><div className="flex items-center gap-3 text-sm font-medium text-blue-600"><Icon className="h-5 w-5" /> {detail.section}</div><h1 className="mt-6 text-4xl font-semibold leading-[1.04] tracking-[-0.055em] text-slate-950 sm:text-6xl">{detail.title}</h1><p className="mt-6 max-w-lg text-lg leading-8 text-slate-500">{detail.description}</p><div className="mt-9 flex flex-wrap gap-3"><Button onClick={onSignUp} className="h-11 rounded-md bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700">{detail.primary}<ArrowRight className="ml-2 h-4 w-4" /></Button><button onClick={() => document.getElementById("detail-workflow")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:border-slate-300">{detail.secondary}<ArrowDown className="h-4 w-4" /></button></div></div><div className="rounded-xl border border-slate-200 bg-[#10141c] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.14)] sm:p-7"><div className="flex items-center justify-between border-b border-white/10 pb-5"><div className="flex items-center gap-2 text-sm font-medium text-white"><span className="h-2 w-2 rounded-full bg-blue-400" /> TaskFlow workspace</div><span className="text-xs text-slate-500">Live view</span></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{detail.workflow.map((step, index) => <div key={step} className="rounded-lg border border-white/10 bg-white/[0.04] p-4"><p className="font-mono text-[10px] tracking-[0.18em] text-blue-400">0{index + 1}</p><p className="mt-8 text-sm font-medium leading-5 text-white">{step}</p><div className="mt-5 h-1 rounded-full bg-white/10"><div className={`h-1 rounded-full bg-blue-500 ${index === 0 ? "w-4/5" : index === 1 ? "w-3/5" : "w-2/5"}`} /></div></div>)}</div></div></div></div></section><section id="detail-workflow" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24 lg:py-24"><div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-blue-600">Built for the details</p><h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-slate-950">A more capable way to work, with less overhead.</h2></div><div className="grid divide-y divide-slate-200 border-y border-slate-200">{detail.points.map((point, index) => <div key={point} className="flex items-center gap-5 py-6"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Check className="h-4 w-4" /></span><div><p className="text-base font-medium text-slate-950">{point}</p><p className="mt-1 text-sm text-slate-500">A clear, flexible step in the way your team gets work done.</p></div><span className="ml-auto font-mono text-xs text-slate-400">0{index + 1}</span></div>)}</div></section></div>
}

function WorkspacePreview() {
  const rows = [
    ["Define project scope", "Done", "AD"],
    ["Create wireframes", "In progress", "SC"],
    ["Design system updates", "In progress", "AM"],
    ["Build landing page", "To do", "JS"],
    ["QA and user testing", "To do", "KB"],
    ["Prepare launch assets", "To do", "AD"],
  ]

  return (
    <div className="relative mx-auto w-full max-w-[650px] [perspective:1400px]">
      <div className="absolute -inset-12 bg-blue-500/[0.04] blur-3xl" />
      <div className="relative rotate-[2deg] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.16)] [transform:rotateY(-9deg)_rotateX(3deg)]">
        <div className="flex h-[390px] sm:h-[440px]">
          <aside className="hidden w-40 shrink-0 bg-[#10141c] p-3 text-slate-400 sm:block">
            <div className="mb-7 flex items-center gap-2 px-1 text-[11px] font-medium text-white">
              <BrandLogo className="w-[72px]" light />
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-2 rounded-md bg-white/10 px-2 py-1.5 text-white"><Inbox className="h-3 w-3" /> Inbox</div>
              <div className="flex items-center gap-2 px-2 py-1.5"><ListTodo className="h-3 w-3" /> My tasks</div>
              <div className="flex items-center gap-2 px-2 py-1.5"><LayoutDashboard className="h-3 w-3" /> Today</div>
              <div className="flex items-center gap-2 px-2 py-1.5"><CircleDot className="h-3 w-3" /> Upcoming</div>
              <p className="px-2 pb-1 pt-5 text-[9px] uppercase tracking-widest text-slate-600">Projects</p>
              {['Website redesign', 'Mobile app', 'Marketing launch', 'Q2 planning'].map((item, i) => (
                <div key={item} className="flex items-center gap-2 px-2 py-1.5 text-[10px]">
                  <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-blue-500" : "bg-slate-600"}`} />{item}
                </div>
              ))}
            </div>
          </aside>
          <div className="min-w-0 flex-1 bg-white">
            <div className="flex h-12 items-center justify-between border-b border-slate-100 px-4 sm:px-5">
              <div><p className="text-[11px] font-semibold text-slate-900">Website redesign</p><p className="text-[9px] text-slate-400">Projects / Website redesign</p></div>
              <div className="flex items-center gap-2 text-slate-400"><Search className="h-3.5 w-3.5" /><Bell className="h-3.5 w-3.5" /><span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[8px] font-semibold text-blue-600">SC</span></div>
            </div>
            <div className="border-b border-slate-100 px-4 pt-4 sm:px-5">
              <div className="flex items-center gap-4 text-[10px] text-slate-400"><span className="border-b-2 border-blue-500 pb-3 font-medium text-blue-600">List</span><span className="pb-3">Board</span><span className="pb-3">Timeline</span></div>
            </div>
            <div className="px-4 py-3 sm:px-5">
              <div className="mb-2 grid grid-cols-[1fr_90px_34px] border-b border-slate-100 pb-2 text-[9px] uppercase tracking-wider text-slate-400"><span>Task</span><span>Status</span><span /></div>
              {rows.map(([title, status, initials], i) => (
                <div key={title} className="grid grid-cols-[1fr_90px_34px] items-center border-b border-slate-50 py-3 text-[10px] text-slate-600">
                  <span className="flex min-w-0 items-center gap-2 truncate"><span className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full border ${i === 0 ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>{i === 0 && <Check className="h-2 w-2" />}</span>{title}</span>
                  <span className={status === "Done" ? "text-emerald-600" : status === "In progress" ? "text-blue-600" : "text-slate-400"}><span className="mr-1">●</span>{status}</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[8px] text-slate-500">{initials}</span>
                </div>
              ))}
              <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400"><Plus className="h-3 w-3" /> Add task</div>
            </div>
          </div>
          <div className="hidden w-44 shrink-0 border-l border-slate-100 bg-white p-4 md:block">
            <div className="mb-5 flex items-center justify-between"><ArrowRight className="h-3 w-3 rotate-180 text-slate-400" /><Menu className="h-3 w-3 text-slate-400" /></div>
            <p className="text-[11px] font-semibold text-slate-900">Create wireframes</p>
            <div className="mt-5 space-y-4 text-[9px]"><div><p className="mb-1 text-slate-400">Status</p><p className="text-blue-600">● In progress</p></div><div><p className="mb-1 text-slate-400">Assignee</p><p className="text-slate-700">SC Sarah Chen</p></div><div><p className="mb-1 text-slate-400">Priority</p><p className="text-amber-600">● Medium</p></div><div><p className="mb-1 text-slate-400">Due date</p><p className="text-slate-700">May 24</p></div></div>
            <div className="mt-7 border-t border-slate-100 pt-4"><p className="mb-2 text-[9px] text-slate-400">Description</p><div className="space-y-1.5"><div className="h-1.5 w-full rounded bg-slate-100" /><div className="h-1.5 w-4/5 rounded bg-slate-100" /><div className="h-1.5 w-11/12 rounded bg-slate-100" /></div></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AIAssistantPreview() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const sequence = [800, 2000, 3400, 4800, 6000]
    const timers = sequence.map((delay, i) =>
      setTimeout(() => setStep(i + 1), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (step >= 5) {
      const t = setTimeout(() => setStep(0), 2500)
      return () => clearTimeout(t)
    }
  }, [step])

  const tasks = [
    { label: "Design system & component library", priority: "High", time: "3 days" },
    { label: "User research & stakeholder interviews", priority: "High", time: "2 days" },
    { label: "Wireframes & low-fi prototyping", priority: "Medium", time: "4 days" },
    { label: "Visual design & handoff to dev", priority: "Medium", time: "5 days" },
  ]

  return (
    <div className="flex bg-[#0c121e]" style={{ height: '360px' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
        .fade-up { animation: fadeUp 0.4s ease-out forwards; }
        .typing-dot { animation: typingBounce 1.2s infinite; }
      `}</style>

      {/* Sidebar */}
      <div className="w-[160px] shrink-0 border-r border-white/8 flex flex-col p-3 gap-2">
        <button className="flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 py-1.5 text-[11px] font-medium text-white">
          <span className="text-base leading-none">+</span> New Chat
        </button>
        <p className="px-1 pt-1 text-[9px] uppercase tracking-wider text-slate-600">Recent</p>
        {["Website Redesign", "Prioritize my tasks", "Plan sprint goals", "Weekly wrap-up"].map((item, i) => (
          <div key={item} className={`rounded-md px-2 py-1.5 text-[10px] leading-tight cursor-pointer truncate ${
            i === 0 ? "bg-white/10 text-slate-200" : "text-slate-600"
          }`}>
            {item}
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20">
              <Sparkles className="h-3 w-3 text-blue-400" />
            </div>
            <span className="text-xs font-medium text-slate-200">AI Assistant</span>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ animation: 'pulse 2s infinite' }} />
            AI Ready
          </span>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 py-3">

          {/* User bubble */}
          {step >= 1 && (
            <div className="flex justify-end fade-up">
              <div className="max-w-[76%] rounded-2xl rounded-tr-sm bg-blue-600 px-3.5 py-2 text-[11px] leading-relaxed text-white">
                Break down my &ldquo;Website Redesign&rdquo; project into tasks
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {step === 1 && (
            <div className="flex items-end gap-2 fade-up">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                <Sparkles className="h-3 w-3 text-blue-400" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/6 px-3.5 py-2.5">
                {[0, 1, 2].map(i => (
                  <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-500 block" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* AI response */}
          {step >= 2 && (
            <div className="flex items-start gap-2 fade-up">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 mt-0.5">
                <Sparkles className="h-3 w-3 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm bg-white/6 px-3.5 py-2.5">
                <p className="text-[11px] leading-relaxed text-slate-300 mb-2.5">
                  I&rsquo;ve broken down your project into{" "}
                  <span className="font-semibold text-blue-400">4 tasks</span>{" "}
                  with time estimates and priority levels:
                </p>
                <div className="space-y-1.5">
                  {tasks.slice(0, step >= 3 ? (step >= 4 ? (step >= 5 ? 4 : 3) : 2) : 1).map((task) => (
                    <div key={task.label} className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-2 fade-up">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${task.priority === "High" ? "bg-red-400" : "bg-amber-400"}`} />
                      <span className="flex-1 text-[10px] text-slate-200 truncate">{task.label}</span>
                      <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] text-slate-500">{task.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-white/8 px-3 py-2.5">
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3.5 py-2">
            <span className="flex-1 text-[11px] text-slate-600">Ask me anything, Mark...</span>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600">
              <ArrowRight className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingPage({ onLogin, onSignUp }: LandingPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState<NavDetail | null>(null)

  const openDetail = (title: string) => {
    setSelectedDetail(navDetails[title])
    setOpenMenu(null)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 80)
    return () => clearTimeout(timer)
  }, [])

  const section1 = useReveal()
  const section2 = useReveal()
  const section3 = useReveal()
  const section4 = useReveal()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.desktop-nav-menu')) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#111111]">
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="relative mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandLogo className={`w-[150px] transition-all duration-500 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`} />
          <div className="desktop-nav-menu hidden items-center gap-7 text-sm text-slate-600 md:flex">
            {navItems.map((nav) => <div key={nav.label} className="relative"><button onClick={() => setOpenMenu(openMenu === nav.label ? null : nav.label)} className={`flex items-center gap-1 transition-colors ${openMenu === nav.label ? "text-slate-950" : "hover:text-slate-950"}`} aria-expanded={openMenu === nav.label}>{nav.label}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${openMenu === nav.label ? "rotate-180" : ""}`} /></button>{openMenu === nav.label && <div className="absolute left-1/2 top-9 w-72 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">{nav.items.map(([title, description]) => <button key={title} onClick={() => openDetail(title)} className="block w-full rounded-md px-3 py-3 text-left transition-colors hover:bg-slate-50"><p className="text-sm font-medium text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></button>)}</div>}</div>)}
          </div>
          <div className="flex items-center gap-2"><Button variant="outline" onClick={onLogin} className="hidden h-9 rounded-md border-slate-300 px-4 text-sm font-medium text-slate-900 shadow-none sm:inline-flex">Sign in</Button><Button onClick={onSignUp} className="h-9 rounded-md bg-blue-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700">Create workspace</Button><button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation" aria-expanded={mobileMenuOpen} className="ml-1 rounded-md p-2 text-slate-500 md:hidden"><Menu className="h-5 w-5" /></button></div>
        </div>
        {mobileMenuOpen && <div className="border-t border-slate-100 bg-white px-5 py-4 md:hidden"><div className="mx-auto max-w-7xl space-y-2">{navItems.map((nav) => <details key={nav.label} className="group"><summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-medium text-slate-800">{nav.label}<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary><div className="space-y-1 pb-2 pl-3">{nav.items.map(([title, description]) => <button key={title} onClick={() => openDetail(title)} className="block w-full py-2 text-left"><p className="text-sm text-slate-700">{title}</p><p className="text-xs text-slate-400">{description}</p></button>)}</div></details>)}</div></div>}
      </nav>

      {selectedDetail ? <DetailView detail={selectedDetail} onBack={() => setSelectedDetail(null)} onSignUp={onSignUp} /> : <main>
        <section className="relative border-b border-slate-100 bg-white">
          <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:80px_80px] [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_75%,transparent)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10 lg:pb-28 lg:pt-28">
            <div className={`relative z-10 max-w-xl transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-600 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" /> Powered by Smart AI Assistance
              </div>
              <h1 className="max-w-[620px] text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-slate-950 sm:text-6xl lg:text-[72px]">The AI-powered task manager<br />built for focus.</h1>
              <p className="mt-7 max-w-md text-lg leading-8 text-slate-500">Plan your work with intelligent AI guidance.<br />Stay aligned & move projects forward faster.</p>
              <div className="mt-9 flex items-center gap-4"><Button size="lg" onClick={onSignUp} className="h-12 rounded-md bg-blue-600 px-6 text-base font-medium text-white shadow-[0_8px_20px_rgba(41,122,255,0.22)] hover:bg-blue-700">Create workspace <ArrowRight className="ml-2 h-4 w-4" /></Button><button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="hidden items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 sm:flex">See how it works <ArrowDown className="h-4 w-4" /></button></div>
            </div>
            <div className={`relative transition-all delay-150 duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}><WorkspacePreview /></div>
          </div>
        </section>

        <section id="method" ref={section1.ref} className={`relative overflow-hidden border-y border-white/10 bg-[#0b111b] text-white transition-all duration-700 ${section1.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="absolute inset-y-0 left-1/2 hidden w-px bg-white/[0.035] lg:block" />
          <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:py-24">
            <div className="max-w-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue-400">The TaskFlow method</p>
              <h2 className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.05em] text-white sm:text-4xl">Make progress<br /><span className="text-slate-500">visible.</span></h2>
              <p className="mt-6 text-sm leading-7 text-slate-400">A focused system for turning scattered intent into clear, compounding momentum.</p>
              <div className="mt-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-slate-600"><span className="h-px w-10 bg-blue-500" />Built for the way work moves</div>
            </div>
            <div className="relative grid gap-0 sm:grid-cols-3">
              <div className="absolute left-0 right-0 top-[21px] hidden h-px bg-gradient-to-r from-blue-500/70 via-blue-500/25 to-white/10 sm:block" />
              {features.map(({ icon: Icon, title, description }, index) => (
                <div key={title} className="group relative border-t border-white/10 py-7 sm:border-l sm:border-t-0 sm:px-7 sm:py-0 first:sm:pl-0 last:sm:pr-0">
                  <div className="relative z-10 flex items-center gap-3"><span className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-blue-500/50 bg-[#0b111b] text-blue-400 transition-colors group-hover:border-blue-400 group-hover:bg-blue-500/10"><Icon className="h-5 w-5" strokeWidth={1.7} /></span><span className="font-mono text-[10px] tracking-[0.18em] text-slate-600">0{index + 1} / 03</span></div>
                  <p className="mt-9 font-mono text-[10px] uppercase tracking-[0.2em] text-blue-400">{index === 0 ? "Attention" : index === 1 ? "Alignment" : "Velocity"}</p>
                  <h3 className="mt-3 text-lg font-medium tracking-[-0.03em] text-white">{title}</h3>
                  <p className="mt-3 max-w-[190px] text-sm leading-6 text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dedicated AI Showcase Section */}
        {/* Dedicated AI Showcase Section */}
        <section id="ai-intelligence" ref={section2.ref} className={`relative overflow-hidden bg-[#080d15] py-24 text-white sm:py-32 transition-all duration-700 ${section2.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-blue-600/10 blur-[120px]" />
          
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-medium text-blue-400 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" /> Built-in AI Work Assistant
              </div>
              <h2 className="mt-8 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
                Supercharge your productivity with intelligent AI.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
                TaskFlow AI acts as your personal project strategist. Instantly break down complex goals, generate smart task suggestions, and summarize project context without leaving your workspace.
              </p>
              
              <div className="mt-10 flex flex-wrap justify-center gap-6">
                {[
                  "Natural language task breakdown",
                  "Schedule optimization",
                  "Context-aware summaries"
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm font-medium text-slate-200">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto mt-20 w-full max-w-6xl [perspective:2000px]">
              {/* Immersive background glow */}
              <div className="absolute -inset-10 animate-pulse rounded-full bg-blue-500/20 blur-[100px]" />
              <div className="absolute -inset-10 translate-x-20 translate-y-20 animate-pulse rounded-full bg-indigo-500/20 blur-[120px] delay-700" />
              
              {/* 3D Premium SaaS Isometric Frame */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c121e] shadow-[0_40px_100px_-20px_rgba(37,99,235,0.4)] transition-all duration-1000 ease-out [transform:translateZ(0)_rotateY(-6deg)_rotateX(10deg)_rotateZ(1deg)_scale(1.02)] hover:[transform:translateZ(0)_rotateY(0deg)_rotateX(0deg)_rotateZ(0deg)_scale(1)]">
                
                {/* Mockup Top Bar */}
                <div className="flex h-12 w-full items-center gap-2 border-b border-white/10 bg-[#162032] px-5">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-slate-500/80" />
                    <span className="h-3 w-3 rounded-full bg-slate-500/80" />
                    <span className="h-3 w-3 rounded-full bg-slate-500/80" />
                  </div>
                  <div className="mx-auto flex h-6 items-center rounded-md px-4 text-xs font-medium text-slate-400">
                    TaskFlow AI Assistant
                  </div>
                  <div className="w-12" />
                </div>

                {/* Live AI Assistant Preview */}
                <AIAssistantPreview />
                
              </div>
            </div>
          </div>
        </section>

        <section id="features" ref={section3.ref} className={`overflow-hidden bg-white transition-all duration-700 ${section3.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}><div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32"><div className="mb-14 text-center"><p className="text-sm font-medium text-blue-600">Everything you need to ship work</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">A calmer way to get things done.</h2></div><FeatureCarousel /></div></section>

        <section id="footer" ref={section4.ref} className={`bg-[#0b111b] text-white transition-all duration-700 ${section4.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}><div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24"><div className="flex flex-col justify-between gap-10 border-b border-white/15 pb-16 sm:flex-row sm:items-end"><div><h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Ready to get started?</h2><p className="mt-4 max-w-sm text-base leading-7 text-slate-400">Create your workspace and start getting things done.</p></div><Button onClick={onSignUp} className="h-12 self-start rounded-md bg-blue-600 px-7 text-base text-white hover:bg-blue-700 sm:self-auto">Create workspace <ArrowRight className="ml-2 h-4 w-4" /></Button></div><footer className="grid gap-10 pt-12 sm:grid-cols-[1.5fr_1fr_1fr_1fr]"><div><BrandLogo className="w-[150px]" textClassName="text-white" /><p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">The modern task management platform for productive teams.</p></div>{[ { heading: 'Product', links: [ { label: 'Overview', key: 'Task management' }, { label: 'Integrations', key: null }, { label: 'Changelog', key: 'Changelog' } ] }, { heading: 'Solutions', links: [ { label: 'Teams', key: 'For teams' }, { label: 'Design', key: 'For design' }, { label: 'Operations', key: 'For operations' } ] }, { heading: 'Resources', links: [ { label: 'Docs', key: 'Documentation' }, { label: 'Guides', key: 'Guides' }, { label: 'Help center', key: null } ] } ].map((section) => <div key={section.heading}><p className="text-sm font-medium text-white">{section.heading}</p><div className="mt-4 flex flex-col space-y-3 text-sm text-slate-400">{section.links.map(link => <a key={link.label} href="#" onClick={(e) => { e.preventDefault(); if (link.key) openDetail(link.key); }} className="hover:text-white transition-colors text-left">{link.label}</a>)}</div></div>)}</footer><div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-600 sm:flex-row"><span>© 2025 TaskFlow. All rights reserved.</span><span><Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link> &nbsp;&nbsp; <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link></span></div></div></section>
      </main>}
    </div>
  )
}
