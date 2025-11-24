"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileJson, Package, Loader2, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { exportIconPack, generatePackJSON } from "@/lib/export"
import { StyleConfig } from "@/lib/types"

interface ExportPanelProps {
  selectedIconIds: string[]
  styleConfig: StyleConfig
  packName: string
}

export function ExportPanel({ selectedIconIds, styleConfig, packName }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 })
  const [jsonPreview, setJsonPreview] = useState<string>("")
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handlePreviewJSON = () => {
    const json = generatePackJSON(packName, selectedIconIds, styleConfig)
    setJsonPreview(json)
    setJsonDialogOpen(true)
  }

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(jsonPreview)
      setCopied(true)
      toast.success("JSON copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy JSON")
    }
  }

  const handleExportZIP = async () => {
    if (selectedIconIds.length === 0) {
      toast.error("Please select at least one icon")
      return
    }

    setIsExporting(true)
    setExportProgress({ current: 0, total: selectedIconIds.length })

    try {
      await exportIconPack(
        packName,
        selectedIconIds,
        styleConfig,
        (current, total) => {
          setExportProgress({ current, total })
        }
      )

      toast.success(`Successfully exported ${selectedIconIds.length} icons!`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to export pack")
    } finally {
      setIsExporting(false)
      setExportProgress({ current: 0, total: 0 })
    }
  }

  return (
    <div className="border border-border rounded-lg bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Export Pack</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Download your complete icon pack with metadata. Includes all {selectedIconIds.length} icons as 144×144px PNGs
            plus pack.json for Stream Deck Marketplace.
          </p>

          {isExporting && (
            <div className="mt-4 text-sm text-muted-foreground">
              Exporting {exportProgress.current} of {exportProgress.total} icons...
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <div className="text-sm">
              <span className="text-muted-foreground">Format:</span>
              <span className="ml-2 font-medium">PNG (144×144)</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Icons:</span>
              <span className="ml-2 font-medium">{selectedIconIds.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Metadata:</span>
              <span className="ml-2 font-medium">pack.json</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={jsonDialogOpen} onOpenChange={setJsonDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handlePreviewJSON} disabled={selectedIconIds.length === 0}>
                <FileJson className="h-4 w-4 mr-2" />
                Preview JSON
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Pack JSON Preview</DialogTitle>
                <DialogDescription>Metadata that will be included in your icon pack</DialogDescription>
              </DialogHeader>
              <div className="relative">
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <pre className="text-xs">{jsonPreview}</pre>
                </ScrollArea>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4"
                  onClick={handleCopyJSON}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleExportZIP} disabled={isExporting || selectedIconIds.length === 0}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Export ZIP
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
