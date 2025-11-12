"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { exportIconPack } from "@/lib/export"
import { StyleConfig } from "@/lib/types"

interface HeaderProps {
  selectedIconIds: string[]
  styleConfig: StyleConfig
  packName: string
}

export function Header({ selectedIconIds, styleConfig, packName }: HeaderProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportZIP = async () => {
    if (selectedIconIds.length === 0) {
      toast.error("Please select at least one icon")
      return
    }

    setIsExporting(true)

    try {
      await exportIconPack(
        packName,
        selectedIconIds,
        styleConfig,
        (current, total) => {
          // Progress callback - could show progress if needed
        }
      )

      toast.success(`Successfully exported ${selectedIconIds.length} icons!`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to export pack")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Stream Deck Icon Pack Generator</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate complete, consistent icon packs for Stream Deck</p>
        </div>

        <Button size="sm" onClick={handleExportZIP} disabled={isExporting || selectedIconIds.length === 0}>
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export Pack
            </>
          )}
        </Button>
      </div>
    </header>
  )
}
