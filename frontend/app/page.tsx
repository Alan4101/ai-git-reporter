"use client"

import { useState } from "react"
import axios from "axios"
import { FolderPicker } from "@/components/FolderPicker"
import { CommitCard } from "@/components/CommitCard"
import { Commit, AnalyzeResponse, AIResponse } from "@/types"
import { Send, Download, Bot, CheckCircle2, AlertCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"

const API_BASE = "http://localhost:8000"

export default function Home() {
  const [commits, setCommits] = useState<Commit[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [reportDate, setReportDate] = useState("")
  const [reportText, setReportText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

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
      
      // Update the cumulative report text
      setReportText(prev => {
        const header = prev || `📊 *ЗВІТ ЗА ${new Date(reportDate).toLocaleDateString("uk-UA")}*\n\n`
        const entry = `🔹 *${commit.summary}* (${commit.duration} хв)\n${analysis}\n\n`
        return header + entry
      })
    } catch (err) {
      setCommits(prev => prev.map(c => c.hash === commit.hash ? { ...c, isAnalyzing: false } : c))
      alert("AI аналіз завершився помилкою. Перевірте, чи запущена Ollama.")
    }
  }

  const handleSendTelegram = async () => {
    if (!reportText) return
    setIsSending(true)
    try {
      await axios.post(`${API_BASE}/send-telegram`, { text: reportText })
      alert("Звіт успішно надіслано в Telegram!")
    } catch (err) {
      alert("Помилка надсилання.")
    } finally {
      setIsSending(false)
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
    <main className="container max-w-4xl py-12 px-4 animate-in fade-in duration-700">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 mb-4 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
          <Bot className="w-5 h-5 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Next Generation</span>
        </div>
        <h1 className="text-5xl font-black bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent mb-4">
          Git AI Report Agent
        </h1>
        <p className="text-muted-foreground text-lg">
          Автоматизуйте ваші щоденні звіти за допомогою AI та Git
        </p>
      </header>

      <FolderPicker onAnalyze={handleAnalyzeRepo} isAnalyzing={isAnalyzing} />

      {error && (
        <div className="glass border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-400 mb-8 animate-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {commits.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Знайдено комітів: {commits.length}
            </h2>
          </div>
          
          <div className="grid gap-4">
            {commits.map(commit => (
              <CommitCard 
                key={commit.hash} 
                commit={commit} 
                onAnalyze={handleAnalyzeCommit} 
              />
            ))}
          </div>
        </div>
      )}

      {reportText && (
        <div className="mt-12 glass p-8 rounded-3xl animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Попередній перегляд звіту</h2>
            <div className="flex gap-2">
              <button 
                onClick={downloadReport}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                title="Скачати TXT"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSendTelegram}
                disabled={isSending}
                className="flex items-center gap-2 px-6 py-2 bg-primary rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50"
              >
                {isSending ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <Send className="w-4 h-4" />}
                Надіслати у Telegram
              </button>
            </div>
          </div>
          
          <div className="bg-black/40 rounded-2xl p-6 border border-white/5 prose prose-invert max-w-none">
            <ReactMarkdown>{reportText}</ReactMarkdown>
          </div>
        </div>
      )}
    </main>
  )
}
