"use client"

import { IconRenderer } from "@/components/icon-renderer"
import { StyleConfig } from "@/lib/types"
import { parseIconId } from "@/lib/iconify"
import { X } from "lucide-react"

interface PackPreviewProps {
  selectedIconIds: string[]
  styleConfig: StyleConfig
  onRemoveIcon: (iconId: string) => void
}

export function PackPreview({ selectedIconIds, styleConfig, onRemoveIcon }: PackPreviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Pack Preview</h2>
        <p className="text-sm text-muted-foreground mt-1">Preview your icon pack with current styling</p>
      </div>

      <div className="border border-border rounded-lg bg-card p-8">
        <div className="grid grid-cols-8 gap-4 max-w-4xl mx-auto">
          {selectedIconIds.slice(0, 16).map((iconId, index) => {
            const { prefix, name } = parseIconId(iconId)
            return (
              <div key={iconId} className="relative group flex flex-col items-center gap-2">
                <button
                  type="button"
                  aria-label="Remove from pack"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveIcon(iconId)
                  }}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 text-foreground/80 hover:bg-background/90 shadow-sm ring-1 ring-border opacity-0 group-hover:opacity-100 transition z-10"
                >
                  <X className="h-3 w-3" />
                </button>
                <IconRenderer
                  iconName={name}
                  prefix={prefix}
                  styleConfig={styleConfig}
                  size={64}
                  accurate={true}
                />
                <span className="text-xs text-muted-foreground text-center truncate w-full">{name}</span>
              </div>
            )
          })}
        </div>

        {selectedIconIds.length > 16 && (
          <p className="text-center text-sm text-muted-foreground mt-8">
            +{selectedIconIds.length - 16} more icons in pack
          </p>
        )}
      </div>
    </div>
  )
}
