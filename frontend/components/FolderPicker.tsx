"use client"

import { useState } from "react"
import { Folder, Calendar as CalendarIcon, Play, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
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
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiBase}/browse`, { method: "POST" });
      const data = await res.json();
      if (data.path) setPath(data.path);
    } catch (err) {
      console.error("Browse error:", err);
      toast.error("Не вдалося підключитися до сервера. Переконайтеся, що бекенд запущено.");
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
            className={cn(
               "w-full md:w-auto h-12 px-12 font-black uppercase tracking-[0.15em] transition-all duration-300",
               "bg-linear-to-r from-primary via-primary/90 to-primary/80 text-white",
               "shadow-[0_0_30px_rgba(var(--primary),0.2)] hover:shadow-[0_0_40px_rgba(var(--primary),0.4)]",
               "hover:scale-[1.03] active:scale-95",
               "border-0 relative overflow-hidden group/btn",
               isAnalyzing && "opacity-80 scale-100"
            )}
          >
            {/* Gloss shine effect */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shine" />
            
            {isAnalyzing ? (
              <div className="flex items-center gap-3 relative z-10">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="drop-shadow-sm">Йде аналіз...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                   <div className="absolute inset-0 bg-white/40 rounded-full animate-ping opacity-30" />
                   <div className="bg-white/10 p-1.5 rounded-full backdrop-blur-sm">
                      <Play className="w-4 h-4 fill-current" />
                   </div>
                </div>
                <span className="drop-shadow-sm">Run Agent</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
