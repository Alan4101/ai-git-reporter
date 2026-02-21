"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { buildReportFromCommits, buildSummaryReport } from "@/lib/report-utils"
import type { Commit } from "@/types"

export function useReportPage() {
  const [commits, setCommits] = useState<Commit[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [reportDate, setReportDate] = useState("")
  const [reportText, setReportText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isGeneratingFullReport, setIsGeneratingFullReport] = useState(false)

  const handleAnalyzeRepo = useCallback(async (path: string, date: string) => {
    setIsAnalyzing(true)
    setError(null)
    setReportDate(date)
    try {
      const res = await api.analyze(path, date)
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
  }, [])

  const handleAnalyzeCommit = useCallback(
    async (commit: Commit) => {
      setCommits((prev) =>
        prev.map((c) => (c.hash === commit.hash ? { ...c, isAnalyzing: true } : c))
      )

      try {
        const res = await api.analyzeCommit(
          commit.summary,
          commit.files,
          commit.duration
        )
        const analysis = res.data.analysis

        setCommits((prev) =>
          prev.map((c) =>
            c.hash === commit.hash ? { ...c, analysis, isAnalyzing: false } : c
          )
        )

        const updatedCommits = commits.map((c) =>
          c.hash === commit.hash ? { ...c, analysis } : c
        )
        setReportText(buildReportFromCommits(updatedCommits, reportDate))
      } catch {
        setCommits((prev) =>
          prev.map((c) =>
            c.hash === commit.hash ? { ...c, isAnalyzing: false } : c
          )
        )
        setError("AI аналіз завершився помилкою. Перевірте, чи запущена Ollama.")
      }
    },
    [commits, reportDate]
  )

  const handleSendTelegram = useCallback(async () => {
    if (!reportText) return
    setIsSending(true)
    try {
      await api.sendTelegram(reportText)
      toast.success("Звіт успішно надіслано в Telegram!")
    } catch {
      toast.error("Помилка надсилання.")
    } finally {
      setIsSending(false)
    }
  }, [reportText])

  const handleResetReport = useCallback(() => {
    if (confirm("Ви впевнені, що хочете очистити звіт?")) {
      setReportText("")
      setCommits((prev) => prev.map((c) => ({ ...c, analysis: undefined })))
    }
  }, [])

  const handleGenerateFullReport = useCallback(async () => {
    if (commits.length === 0) return
    setIsGeneratingFullReport(true)
    setError(null)
    try {
      const res = await api.generateSummary(
        commits.map((c) => ({ summary: c.summary, duration: c.duration })),
        reportDate
      )
      const total = commits.reduce((acc, c) => acc + c.duration, 0)
      setReportText(buildSummaryReport(res.data.summary, reportDate, total))
    } catch {
      setError("Не вдалося згенерувати загальний звіт.")
    } finally {
      setIsGeneratingFullReport(false)
    }
  }, [commits, reportDate])

  const downloadReport = useCallback(() => {
    const element = document.createElement("a")
    const file = new Blob([reportText], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `report-${reportDate}.txt`
    document.body.appendChild(element)
    element.click()
  }, [reportText, reportDate])

  return {
    commits,
    reportText,
    reportDate,
    error,
    setError,
    isAnalyzing,
    isSending,
    isGeneratingFullReport,
    handleAnalyzeRepo,
    handleAnalyzeCommit,
    handleSendTelegram,
    handleResetReport,
    handleGenerateFullReport,
    downloadReport,
  }
}
