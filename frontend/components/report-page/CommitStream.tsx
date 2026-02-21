"use client"

import { LayoutDashboard, Bot } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { CommitCard } from "@/components/CommitCard"
import type { Commit } from "@/types"

interface CommitStreamProps {
  commits: Commit[]
  isAnalyzing: boolean
  onAnalyze: (commit: Commit) => void
}

export function CommitStream({ commits, isAnalyzing, onAnalyze }: CommitStreamProps) {
  return (
    <div className="lg:col-span-7 space-y-6 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" />
          Commit Stream
        </h2>
        {commits.length > 0 && (
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-3">
            {commits.length} інсайтів знайдено
          </Badge>
        )}
      </div>

      {commits.length === 0 && !isAnalyzing && (
        <EmptyCommitState />
      )}

      <div className="grid gap-4">
        {commits.map((commit, idx) => (
          <motion.div
            key={commit.hash}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <CommitCard commit={commit} onAnalyze={onAnalyze} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function EmptyCommitState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-10 border-2 border-dashed border-white/5 rounded-4xl bg-white/2">
      <Bot className="w-16 h-16 text-white/10 mb-6" />
      <h3 className="text-xl font-bold text-white/40">Очікування команд...</h3>
      <p className="text-muted-foreground text-center mt-2 max-w-xs">
        Виберіть локальний проект та дату, щоб AI зміг згенерувати звіт.
      </p>
    </div>
  )
}
