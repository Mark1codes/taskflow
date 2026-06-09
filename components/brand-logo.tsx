"use client"

import { cn } from "@/lib/utils"

interface BrandLogoProps {
  className?: string
  markClassName?: string
  textClassName?: string
  showText?: boolean
}

export function BrandLogo({
  className,
  markClassName,
  textClassName,
  showText = true,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm ring-1 ring-white/10",
          markClassName
        )}
      >
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
          <path
            d="M9 10.5h8.5c3.3 0 5.5 2.1 5.5 5.2s-2.2 5.2-5.5 5.2H14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M9 10.5v11"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M14 16h6.5"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="9" cy="10.5" r="2" fill="#60A5FA" />
          <circle cx="14" cy="21" r="2" fill="#60A5FA" />
        </svg>
      </div>
      {showText && (
        <span className={cn("text-xl font-bold tracking-tight", textClassName)}>
          TaskFlow
        </span>
      )}
    </div>
  )
}
