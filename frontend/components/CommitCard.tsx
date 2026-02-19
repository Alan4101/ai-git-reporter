"use client"

import { useState } from "react"
import { ChevronDown, FileCode, Clock, Hash, CheckCircle2, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { Commit } from "@/types"
import ReactMarkdown from "react-markdown"

interface CommitCardProps {
  commit: Commit
  onAnalyze: (commit: Commit) => void
}

export function CommitCard({ commit, onAnalyze }: CommitCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="glass rounded-2xl overflow-hidden mb-4 transition-all duration-300 hover:border-white/20">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="bg-primary/10 p-2 rounded-xl">
          <FileCode className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{commit.summary}</h3>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {commit.time}
            </span>
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {commit.hash}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-primary border border-primary/20">
              {commit.duration} хв
            </span>
          </div>
        </div>

        <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
      </div>

      <div className={cn(
        "grid transition-all duration-300 ease-in-out",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {commit.files.map((file, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground">
                  {file.split('/').pop()}
                </span>
              ))}
            </div>

            <div className="relative min-h-[100px] bg-black/20 rounded-xl p-4">
              {!commit.analysis && !commit.isAnalyzing && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAnalyze(commit); }}
                  className="absolute inset-0 w-full h-full flex items-center justify-center gap-2 text-primary font-bold hover:bg-primary/5 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Аналізувати за допомогою AI
                </button>
              )}

              {commit.isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-xs animate-pulse">AI думає...</span>
                </div>
              )}

              {commit.analysis && (
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="flex items-center gap-2 text-xs text-green-400 mb-2 font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    AI ANALYSIS COMPLETED
                  </div>
                  <ReactMarkdown>{commit.analysis}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
