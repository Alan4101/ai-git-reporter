import axios from "axios"
import type { AnalyzeResponse, AIResponse } from "@/types"

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const api = {
  analyze: (repoPath: string, date: string) =>
    axios.post<AnalyzeResponse>(`${API_BASE}/analyze`, { repo_path: repoPath, date }),

  analyzeCommit: (commitMsg: string, files: string[], durationMins: number) =>
    axios.post<AIResponse>(`${API_BASE}/analyze-ai`, {
      commit_msg: commitMsg,
      files,
      duration_mins: durationMins,
    }),

  sendTelegram: (text: string) =>
    axios.post(`${API_BASE}/send-telegram`, { text }),

  generateSummary: (commits: { summary: string; duration: number }[], date: string) =>
    axios.post<{ summary: string }>(`${API_BASE}/analyze-summary`, { commits, date }),
}
