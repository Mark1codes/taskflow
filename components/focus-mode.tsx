"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Square, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FocusModeProps {
  task: any
  onClose: (minutesSpent: number) => void
  onComplete: (minutesSpent: number) => void
}

export function FocusMode({ task, onClose, onComplete }: FocusModeProps) {
  const FOCUS_TIME = 25 * 60 // 25 minutes in seconds
  const BREAK_TIME = 5 * 60 // 5 minutes in seconds

  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [totalSecondsSpent, setTotalSecondsSpent] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1)
        if (mode === 'focus') {
          setTotalSecondsSpent(s => s + 1)
        }
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      // Play sound
      const audio = new Audio('/bell.mp3') // Optional if exists
      audio.play().catch(() => {})
      
      // Auto-switch mode
      setIsActive(false)
      if (mode === 'focus') {
        setMode('break')
        setTimeLeft(BREAK_TIME)
      } else {
        setMode('focus')
        setTimeLeft(FOCUS_TIME)
      }
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, mode])

  const toggleTimer = () => setIsActive(!isActive)
  const stopTimer = () => {
    setIsActive(false)
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progress = mode === 'focus' 
    ? ((FOCUS_TIME - timeLeft) / FOCUS_TIME) * 100 
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080d15] text-white animate-in fade-in duration-500">
      <button 
        onClick={() => onClose(Math.floor(totalSecondsSpent / 60))}
        className="absolute right-6 top-6 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="mb-12 text-center max-w-lg px-6">
        <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 mb-6 border border-blue-500/20">
          {mode === 'focus' ? 'Deep Work Mode' : 'Take a Break'}
        </span>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {task.title}
        </h2>
        {task.description && (
          <p className="mt-4 text-slate-400 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Timer Circle */}
      <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-4 border-white/5 bg-white/[0.02] shadow-[0_0_100px_rgba(37,99,235,0.1)]">
        {/* Progress indicator */}
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle 
            cx="50" cy="50" r="48" 
            fill="none" 
            stroke={mode === 'focus' ? '#3b82f6' : '#10b981'} 
            strokeWidth="4" 
            strokeDasharray="301.59" 
            strokeDashoffset={301.59 - (progress / 100) * 301.59}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="text-center font-mono">
          <div className="text-6xl font-light tracking-tighter">{formatTime(timeLeft)}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-12 flex items-center gap-6">
        <Button
          onClick={stopTimer}
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        >
          <Square className="h-5 w-5" />
        </Button>
        <Button
          onClick={toggleTimer}
          className={`h-20 w-20 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${
            mode === 'focus' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isActive ? <Pause className="h-8 w-8 text-white fill-current" /> : <Play className="h-8 w-8 ml-1 text-white fill-current" />}
        </Button>
        <Button
          onClick={() => {
            const minutes = Math.floor(totalSecondsSpent / 60)
            onComplete(minutes)
            onClose(minutes)
          }}
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full border-white/10 bg-white/5 text-white hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30"
          title="Mark task complete"
        >
          <CheckCircle2 className="h-6 w-6" />
        </Button>
      </div>

      <p className="absolute bottom-8 text-sm text-slate-500">
        Stay focused. All notifications are muted.
      </p>
    </div>
  )
}
