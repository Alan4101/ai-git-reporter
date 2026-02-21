import { Terminal, History, Bot } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function PageHeader() {
  return (
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
        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-primary to-blue-600 flex items-center justify-center p-[1px]">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  )
}
