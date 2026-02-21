"use client"

import { AnimatePresence } from "framer-motion"
import { FolderPicker } from "@/components/FolderPicker"
import {
  PageHeader,
  ErrorAlert,
  CommitStream,
  ReportPanel,
} from "@/components/report-page"
import { useReportPage } from "@/hooks/useReportPage"

export default function Home() {
  const {
    commits,
    reportText,
    error,
    isAnalyzing,
    isSending,
    isGeneratingFullReport,
    handleAnalyzeRepo,
    handleAnalyzeCommit,
    handleSendTelegram,
    handleResetReport,
    handleGenerateFullReport,
    downloadReport,
  } = useReportPage()

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-primary/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative container max-w-6xl py-12 px-6">
        <PageHeader />

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-12">
            <FolderPicker onAnalyze={handleAnalyzeRepo} isAnalyzing={isAnalyzing} />
          </div>

          <AnimatePresence>
            {error && <ErrorAlert key="error" error={error} />}
          </AnimatePresence>

          <CommitStream
            commits={commits}
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAnalyzeCommit}
          />

          <ReportPanel
            reportText={reportText}
            commitsCount={commits.length}
            isGenerating={isGeneratingFullReport}
            isSending={isSending}
            onGenerateFullReport={handleGenerateFullReport}
            onReset={handleResetReport}
            onDownload={downloadReport}
            onSendTelegram={handleSendTelegram}
          />
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 mt-20 text-center">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-50">
          Powered by Ollama + FastApi + Next.js
        </p>
      </footer>
    </div>
  )
}
