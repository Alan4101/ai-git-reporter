"use client"

import { useState } from "react"
import { Folder, Calendar as CalendarIcon, Play } from "lucide-react"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"

interface FolderPickerProps {
  onAnalyze: (path: string, date: string) => void
  isAnalyzing: boolean
}

export function FolderPicker({ onAnalyze, isAnalyzing }: FolderPickerProps) {
  const [path, setPath] = useState("")
  const [date, setDate] = useState<Date>(new Date())

  const handleBrowse = async () => {
    try {
      const res = await fetch("http://localhost:8000/browse", { method: "POST" });
      const data = await res.json();
      if (data.path) setPath(data.path);
    } catch (err) {
      console.error("Browse error:", err);
      alert("Не вдалося підключитися до сервера. Переконайтеся, що бекенд запущено.");
    }
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl mb-8 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 space-y-3 w-full">
            <label className="text-sm font-semibold text-muted-foreground tracking-tight flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Git Repository Path
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/Users/username/project"
                className="bg-white/5 border-white/10 focus-visible:ring-primary/50 h-11"
              />
              <Button 
                variant="secondary" 
                onClick={handleBrowse}
                className="h-11 px-6 font-bold bg-white/10 hover:bg-white/15"
              >
                Browse
              </Button>
            </div>
          </div>

          <div className="space-y-3 w-full md:w-auto min-w-[240px]">
            <label className="text-sm font-semibold text-muted-foreground tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Report Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full h-11 justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: uk }) : <span>Виберіть дату</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-white/10" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  locale={uk}
                  className="bg-zinc-950 text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            size="lg"
            onClick={() => onAnalyze(path, format(date, "yyyy-MM-dd"))}
            disabled={isAnalyzing || !path}
            className="w-full md:w-auto h-11 px-10 font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            {isAnalyzing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Play className="w-4 h-4 fill-current mr-2" />
                Run Agent
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
