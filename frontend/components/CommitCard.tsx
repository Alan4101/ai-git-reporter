"use client"

import { Commit } from "@/types"
import { Clock, FileCode2, ChevronDown, ChevronUp, Sparkles,  } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import ReactMarkdown from "react-markdown"

interface CommitCardProps {
  commit: Commit
  onAnalyze: (commit: Commit) => void
}

export function CommitCard({ commit, onAnalyze }: CommitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="group border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300 overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] border-white/20 text-muted-foreground uppercase tracking-tighter">
                {commit.hash}
              </Badge>
              <div className="flex items-center text-xs text-muted-foreground font-medium">
                <Clock className="w-3 h-3 mr-1" />
                {commit.time}
                <Separator orientation="vertical" className="h-3 mx-2 bg-white/10" />
                {commit.duration} хв
              </div>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-tight">
              {commit.summary}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-xs"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
              {commit.files.length} файлів
            </Button>
            
            <Button
              size="sm"
              onClick={() => onAnalyze(commit)}
              disabled={commit.isAnalyzing || !!commit.analysis}
              className={cn(
                "font-bold text-xs uppercase tracking-wider h-9",
                commit.analysis ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/20" : "bg-primary shadow-md shadow-primary/20"
              )}
            >
              {commit.isAnalyzing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : commit.analysis ? (
                <>Готово</>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-2 fill-current" />
                  AI Аналіз
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
          <ScrollArea className="h-[120px] rounded-xl border border-white/5 bg-black/20 p-4">
            <div className="space-y-1.5">
              {commit.files.map((file, i) => (
                <div key={i} className="flex items-center text-xs text-muted-foreground hover:text-white transition-colors">
                  <FileCode2 className="w-3 h-3 mr-2 opacity-50" />
                  {file}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}

      {commit.analysis && (
        <CardFooter className="px-6 py-6 border-t border-white/5 bg-primary/5">
          <div className="space-y-3 w-full">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/70">
              <Sparkles className="w-3 h-3" />
              AI Insight
            </div>
            <div className="prose prose-invert prose-xs max-w-none text-muted-foreground leading-relaxed italic">
              <ReactMarkdown>{commit.analysis}</ReactMarkdown>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
