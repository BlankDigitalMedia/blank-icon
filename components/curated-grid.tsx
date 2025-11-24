"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Plus, Search } from "lucide-react"
import { IconRenderer } from "@/components/icon-renderer"
import { StyleConfig } from "@/lib/types"
import { parseIconId } from "@/lib/iconify"
import { getCuratedIconsByCategory, ALL_CURATED_ICONS } from "@/lib/curated-sets"

interface CuratedGridProps {
  selectedIconIds: string[]
  setSelectedIconIds: (ids: string[]) => void
  styleConfig: StyleConfig
}

export function CuratedGrid({ selectedIconIds, setSelectedIconIds, styleConfig }: CuratedGridProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const toggleIcon = (iconId: string) => {
    if (selectedIconIds.includes(iconId)) {
      setSelectedIconIds(selectedIconIds.filter((id) => id !== iconId))
    } else {
      setSelectedIconIds([...selectedIconIds, iconId])
    }
  }

  // Filter icons by search query
  const filteredIcons = ALL_CURATED_ICONS.filter((icon) =>
    icon.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    icon.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group filtered icons by category
  const iconsByCategory = getCuratedIconsByCategory()
  const filteredCategories: Record<string, typeof ALL_CURATED_ICONS> = {}
  
  for (const [category, icons] of Object.entries(iconsByCategory)) {
    const categoryFiltered = icons.filter((icon) =>
      icon.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (categoryFiltered.length > 0) {
      filteredCategories[category] = categoryFiltered
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Curated Icons</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Stream Deck-focused icons • {selectedIconIds.length} selected
          </p>
        </div>

        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Icon
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search curated icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredIcons.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No icons found matching "{searchQuery}"
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(filteredCategories).map(([category, icons]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-foreground mb-4">{category}</h3>
              <div className="grid grid-cols-6 gap-3">
                {icons.map((icon) => {
                  const { prefix, name } = parseIconId(icon.id)
                  const isSelected = selectedIconIds.includes(icon.id)
                  return (
                    <button
                      key={icon.id}
                      onClick={() => toggleIcon(icon.id)}
                      className="relative group aspect-square rounded-lg border border-border bg-card hover:bg-accent transition-colors p-4"
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center z-10">
                          <Check className="h-3 w-3" />
                        </div>
                      )}

                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <IconRenderer
                          iconName={name}
                          prefix={prefix}
                          styleConfig={styleConfig}
                          size={48}
                          accurate={isSelected}
                        />
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate w-full text-center">
                          {icon.label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

