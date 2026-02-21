import type { Commit } from "@/types"

export function formatDuration(totalMins: number): string {
  const hours = Math.floor(totalMins / 60)
  const mins = totalMins % 60
  if (hours > 0) {
    return `${hours} год ${mins} хв`
  }
  return `${mins} хв`
}

export function buildReportFromCommits(
  commits: Commit[],
  reportDate: string
): string {
  const analyzedCommits = commits.filter((c) => c.analysis)
  const header = `📊 **ЗВІТ ЗА ${new Date(reportDate).toLocaleDateString("uk-UA")}**\n\n`
  let entries = ""
  analyzedCommits.forEach((c) => {
    entries += `📍 ${c.analysis} (**${c.duration} хв**)\n\n`
  })
  const total = analyzedCommits.reduce((acc, c) => acc + c.duration, 0)
  return header + entries + `\n---\n⏱️ **Всього часу:** ${formatDuration(total)}`
}

export function buildSummaryReport(summary: string, reportDate: string, totalMins: number): string {
  const header = `📊 **ЗАГАЛЬНИЙ ЗВІТ ЗА ${new Date(reportDate).toLocaleDateString("uk-UA")}**\n\n`
  const footer = `\n\n---\n⏱️ **Всього часу:** ${formatDuration(totalMins)}`
  return header + summary + footer
}
