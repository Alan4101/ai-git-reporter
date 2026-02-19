"use client"

import { useState } from "react"
import axios from "axios"
import { FolderPicker } from "@/components/FolderPicker"
import { CommitCard } from "@/components/CommitCard"
import { Commit, AnalyzeResponse, AIResponse } from "@/types"
import { Send, Download, Bot, Sparkles, CheckCircle2, History, LayoutDashboard, Terminal, RotateCcw, Wand2, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const formatDuration = (totalMins: number) => {
  const hours = Math.floor(totalMins / 60)
  const mins = totalMins % 60
  if (hours > 0) {
    return `${hours} год ${mins} хв`
  }
  return `${mins} хв`
}

export default function Home() {
  const [commits, setCommits] = useState<Commit[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [reportDate, setReportDate] = useState("")
  const [reportText, setReportText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isGeneratingFullReport, setIsGeneratingFullReport] = useState(false)

  const handleAnalyzeRepo = async (path: string, date: string) => {
    setIsAnalyzing(true)
    setError(null)
    setReportDate(date)
    console.log("Analyzing repo:", path, "date:", date)
    try {
      const res = await axios.post<AnalyzeResponse>(`${API_BASE}/analyze`, {
        repo_path: path,
        date: date
      })
      setCommits(res.data.commits)
      if (res.data.commits.length === 0) {
        setError("Комітів не знайдено за вказану дату.")
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Помилка підключення до сервера.")
      } else {
        setError("Виникла неочікувана помилка.")
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnalyzeCommit = async (commit: Commit) => {
    setCommits(prev => prev.map(c => c.hash === commit.hash ? { ...c, isAnalyzing: true } : c))
    
    try {
      const res = await axios.post<AIResponse>(`${API_BASE}/analyze-ai`, {
        commit_msg: commit.summary,
        files: commit.files,
        duration_mins: commit.duration
      })
      
      const analysis = res.data.analysis
      setCommits(prev => prev.map(c => c.hash === commit.hash ? { ...c, analysis, isAnalyzing: false } : c))
      
      setReportText(() => {
        const analyzedCommits = commits.map(c => c.hash === commit.hash ? { ...c, analysis } : c).filter(c => c.analysis)
        const header = `📊 **ЗВІТ ЗА ${new Date(reportDate).toLocaleDateString("uk-UA")}**\n\n`
        let entries = ""
        analyzedCommits.forEach(c => {
          entries += `📍 ${c.analysis} (**${c.duration} хв**)\n\n`
        })
        const total = analyzedCommits.reduce((acc, c) => acc + c.duration, 0)
        return header + entries + `\n---\n⏱️ **Всього часу:** ${formatDuration(total)}`
      })
    } catch {
      setCommits(prev => prev.map(c => c.hash === commit.hash ? { ...c, isAnalyzing: false } : c))
      setError("AI аналіз завершився помилкою. Перевірте, чи запущена Ollama.")
    }
  }

  const handleSendTelegram = async () => {
    if (!reportText) return
    setIsSending(true)
    try {
      await axios.post(`${API_BASE}/send-telegram`, { text: reportText })
      toast.success("Звіт успішно надіслано в Telegram!")
    } catch {
      toast.error("Помилка надсилання.")
    } finally {
      setIsSending(false)
    }
  }

  const handleResetReport = () => {
    if (confirm("Ви впевнені, що хочете очистити звіт?")) {
      setReportText("")
      setCommits(prev => prev.map(c => ({ ...c, analysis: undefined })))
    }
  }

  const handleGenerateFullReport = async () => {
    if (commits.length === 0) return
    setIsGeneratingFullReport(true)
    setError(null)
    try {
      const res = await axios.post<{ summary: string }>(`${API_BASE}/analyze-summary`, {
        commits: commits.map(c => ({ summary: c.summary, duration: c.duration })),
        date: reportDate
      })
      
      const summary = res.data.summary
      const total = commits.reduce((acc, c) => acc + c.duration, 0)
      const header = `📊 **ЗАГАЛЬНИЙ ЗВІТ ЗА ${new Date(reportDate).toLocaleDateString("uk-UA")}**\n\n`
      const footer = `\n\n---\n⏱️ **Всього часу:** ${formatDuration(total)}`
      setReportText(header + summary + footer)
    } catch {
      setError("Не вдалося згенерувати загальний звіт.")
    } finally {
      setIsGeneratingFullReport(false)
    }
  }

  const downloadReport = () => {
    const element = document.createElement("a")
    const file = new Blob([reportText], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `report-${reportDate}.txt`
    document.body.appendChild(element)
    element.click()
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-primary/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative container max-w-6xl py-12 px-6">
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-xs">
              <Terminal className="w-4 h-4" />
              Automated Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Git <span className="text-primary">Reporter</span> Pro
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-white/10 bg-white/5 py-1.5 px-3">
              <History className="w-3 h-3 mr-2" />
              v2.1.0 Stable
            </Badge>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center p-[1px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                 <Bot className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Action Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-12">
            <FolderPicker onAnalyze={handleAnalyzeRepo} isAnalyzing={isAnalyzing} />
          </div>

          {/* Error Feed */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="lg:col-span-12"
              >
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground">
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Помилка</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Feed */}
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
              <div className="flex flex-col items-center justify-center py-20 px-10 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
                <Bot className="w-16 h-16 text-white/10 mb-6" />
                <h3 className="text-xl font-bold text-white/40">Очікування команд...</h3>
                <p className="text-muted-foreground text-center mt-2 max-w-xs">
                  Виберіть локальний проект та дату, щоб AI зміг згенерувати звіт.
                </p>
              </div>
            )}

            <div className="grid gap-4">
              {commits.map((commit, idx) => (
                <motion.div
                  key={commit.hash}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <CommitCard 
                    commit={commit} 
                    onAnalyze={handleAnalyzeCommit} 
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Side Panel / Preview */}
          <div className="lg:col-span-5 relative min-w-0">
            <aside className="sticky top-12 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Final Report
                </h2>
                {(reportText || commits.length > 0) && (
                  <div className="flex gap-2">

                    
                    {reportText && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleResetReport} 
                          className="h-8 border-white/10 hover:bg-red-500/10 text-xs"
                        >
                          <RotateCcw className="w-3 h-3 mr-2" />
                          Reset
                        </Button>
                        <Button variant="ghost" size="icon" onClick={downloadReport} className="h-8 w-8 hover:bg-white/10">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={handleSendTelegram} 
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

              <div className={cn(
                "relative rounded-4xl border border-white/10 overflow-hidden min-h-[500px] flex flex-col group transition-all duration-500",
                reportText ? "bg-white/3 border-primary/20" : "bg-black/40"
              )}>
                {commits.length > 0 && !reportText && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 backdrop-blur-[2px]">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-1 rounded-full bg-linear-to-r from-primary via-blue-500 to-purple-600 animate-gradient-x shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                    >
                      <Button 
                        onClick={handleGenerateFullReport}
                        disabled={isGeneratingFullReport}
                        size="lg"
                        className="rounded-full px-8 py-6 h-auto text-lg font-bold bg-black hover:bg-black/80 text-white border-0 transition-transform active:scale-95"
                      >
                        {isGeneratingFullReport ? (
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        ) : (
                          <Wand2 className="w-5 h-5 mr-3 text-primary" />
                        )}
                        Згенерувати загальний звіт
                      </Button>
                    </motion.div>
                  </div>
                )}

                {reportText ? (
                  <ScrollArea className="flex-1 p-8">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{reportText}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-20 group-hover:opacity-40 transition-opacity">
                    <div className="w-12 h-12 border-2 border-white/20 border-dashed rounded-full flex items-center justify-center mb-4">
                       <Sparkles className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest">Preview is empty</p>
                  </div>
                )}
                
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              </div>

              {/* Tips Section */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-xs text-muted-foreground leading-relaxed">
                <strong className="text-white block mb-1">PRO TIP:</strong>
                Натисніть на &quot;AI Аналіз&quot; для кожного коміту окремо, щоб деталізувати звіт. AI автоматично обєднає їх у фінальний документ.
              </div>
            </aside>
          </div>
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
