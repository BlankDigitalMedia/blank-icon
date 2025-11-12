import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Stream Deck Icon Pack Generator</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate complete, consistent icon packs for Stream Deck</p>
        </div>

        <Button size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Pack
        </Button>
      </div>
    </header>
  )
}
