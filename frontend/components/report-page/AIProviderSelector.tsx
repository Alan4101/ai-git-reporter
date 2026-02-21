"use client"

import { Bot, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { AIProvider } from "@/hooks/useReportPage"

interface AIProviderSelectorProps {
  value: AIProvider
  onChange: (provider: AIProvider) => void
}

const activeStyles = [
  "bg-primary text-white font-semibold",
  "border-2 border-white/40",
  "shadow-[0_0_20px_rgba(236,72,153,0.4)]",
  "scale-[1.03]",
]
const inactiveStyles = [
  "bg-transparent text-slate-500",
  "border-2 border-transparent",
  "hover:bg-white/5 hover:text-slate-300",
]
const disabledStyles = [
  "opacity-50 cursor-not-allowed",
  "text-slate-600",
  "border-2 border-transparent",
]

export function AIProviderSelector({ value, onChange }: AIProviderSelectorProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex rounded-xl border border-white/10 bg-black/30 p-1.5">
        <button
          type="button"
          onClick={() => onChange("ollama")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200",
            value === "ollama" ? activeStyles : inactiveStyles
          )}
        >
          <Bot className="w-4 h-4" />
          Ollama
        </button>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "flex cursor-not-allowed items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200",
                disabledStyles
              )}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.preventDefault()}
            >
              <Zap className="w-4 h-4" />
              Grok
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[240px] text-center">
            Grok тимчасово недоступний, в процесі реалізації
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
