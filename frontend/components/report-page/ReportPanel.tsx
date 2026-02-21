"use client"

import {
  CheckCircle2,
  Download,
  RotateCcw,
  Send,
  Sparkles,
  Wand2,
  Loader2,
} from "lucide-react"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ReportPanelProps {
  reportText: string
  commitsCount: number
  isGenerating: boolean
  isSending: boolean
  onGenerateFullReport: () => void
  onReset: () => void
  onDownload: () => void
  onSendTelegram: () => void
}

export function ReportPanel({
  reportText,
  commitsCount,
  isGenerating,
  isSending,
  onGenerateFullReport,
  onReset,
  onDownload,
  onSendTelegram,
}: ReportPanelProps) {
  const hasContent = reportText || commitsCount > 0

  return (
    <div className="lg:col-span-5 relative min-w-0">
      <aside className="sticky top-12 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Final Report
          </h2>
          {hasContent && (
            <div className="flex gap-2">
              {reportText && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    className="h-8 border-white/10 hover:bg-red-500/10 text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-2" />
                    Reset
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDownload}
                    className="h-8 w-8 hover:bg-white/10"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={onSendTelegram}
                    disabled={isSending}
                    size="sm"
                    className="bg-[#0088cc] hover:bg-[#0088cc]/90 h-8"
                  >
                    <Send className="w-3 h-3 mr-2" />
                    Telegram
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <div
          className={cn(
            "relative rounded-4xl border border-white/10 overflow-hidden min-h-[500px] flex flex-col group transition-all duration-500",
            reportText ? "bg-white/3 border-primary/20" : "bg-black/40"
          )}
        >
          {commitsCount > 0 && !reportText && (
            <GenerateReportOverlay
              isGenerating={isGenerating}
              onGenerate={onGenerateFullReport}
            />
          )}

          {reportText ? (
            <ScrollArea className="flex-1 p-8">
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{reportText}</ReactMarkdown>
              </div>
            </ScrollArea>
          ) : (
            <EmptyPreviewState />
          )}

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>

        <ProTip />
      </aside>
    </div>
  )
}

function GenerateReportOverlay({
  isGenerating,
  onGenerate,
}: {
  isGenerating: boolean
  onGenerate: () => void
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 backdrop-blur-[2px]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-1 rounded-full bg-linear-to-r from-primary via-blue-500 to-purple-600 animate-gradient-x shadow-[0_0_20px_rgba(var(--primary),0.3)]"
      >
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          size="lg"
          className="rounded-full px-8 py-6 h-auto text-lg font-bold bg-black hover:bg-black/80 text-white border-0 transition-transform active:scale-95"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
          ) : (
            <Wand2 className="w-5 h-5 mr-3 text-primary" />
          )}
          Згенерувати загальний звіт
        </Button>
      </motion.div>
    </div>
  )
}

function EmptyPreviewState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-20 group-hover:opacity-40 transition-opacity">
      <div className="w-12 h-12 border-2 border-white/20 border-dashed rounded-full flex items-center justify-center mb-4">
        <Sparkles className="w-5 h-5" />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest">
        Preview is empty
      </p>
    </div>
  )
}

function ProTip() {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-xs text-muted-foreground leading-relaxed">
      <strong className="text-white block mb-1">PRO TIP:</strong>
      Натисніть на &quot;AI Аналіз&quot; для кожного коміту окремо, щоб
      деталізувати звіт. AI автоматично обєднає їх у фінальний документ.
    </div>
  )
}
