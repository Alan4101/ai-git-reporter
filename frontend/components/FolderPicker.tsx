"use client"

import { useState } from "react"
import { Folder, Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface FolderPickerProps {
  onAnalyze: (path: string, date: string) => void
  isAnalyzing: boolean
}

export function FolderPicker({ onAnalyze, isAnalyzing }: FolderPickerProps) {
  const [path, setPath] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  return (
    <div className="glass p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-end mb-8">
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium text-muted-foreground ml-1">Git Repository Path</label>
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/Users/andriitolochkevych/project"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <button
            onClick={async () => {
              try {
                const res = await fetch("http://localhost:8000/browse", { method: "POST" });
                const data = await res.json();
                if (data.path) setPath(data.path);
              } catch (err) {
                console.error("Browse error:", err);
                alert("Не вдалося підключитися до сервера. Переконайтеся, що бекенд запущено (порт 8000).");
              }
            }}
            className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase transition-all"
          >
            Browse
          </button>
        </div>
      </div>
      
      <div className="space-y-2 min-w-[180px]">
        <label className="text-sm font-medium text-muted-foreground ml-1">Report Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [color-scheme:dark]"
        />
      </div>

      <button
        onClick={() => onAnalyze(path, date)}
        disabled={isAnalyzing || !path}
        className={cn(
          "h-[50px] px-8 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
          "bg-gradient-to-br from-primary to-blue-900 text-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100",
          "shadow-[0_0_20px_rgba(233,69,96,0.3)] hover:shadow-[0_0_30px_rgba(233,69,96,0.5)]"
        )}
      >
        {isAnalyzing ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            Run Agent
          </>
        )}
      </button>
    </div>
  )
}
