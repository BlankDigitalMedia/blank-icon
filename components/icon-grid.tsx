"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Plus, Search, Loader2 } from "lucide-react"
import { IconRenderer } from "@/components/icon-renderer"
import { fetchIconList } from "@/lib/iconify"
import { ICON_LIBRARIES } from "@/components/library-selector"
import { StyleConfig } from "@/lib/types"
import { joinIconId } from "@/lib/iconify"

interface IconGridProps {
  selectedIconIds: string[]
  setSelectedIconIds: (ids: string[]) => void
  styleConfig: StyleConfig
  currentLibrary: string
}

// Virtualization constants
const COLUMNS = 6
const ROW_HEIGHT = 130 // Approximate height of card + gap (card ~110px + gap ~12px + margin)
const BUFFER_ROWS = 3 // Extra rows to render above/below viewport to prevent pop-in
const MIN_ICONS_FOR_VIRTUALIZATION = COLUMNS * 3 // Skip virtualization for small lists

export function IconGrid({ selectedIconIds, setSelectedIconIds, styleConfig, currentLibrary }: IconGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [allIcons, setAllIcons] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(600)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const library = ICON_LIBRARIES.find((lib) => lib.id === currentLibrary) || ICON_LIBRARIES[0]
  const prefix = library.prefix

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    setAllIcons([])

    fetchIconList(prefix)
      .then((icons) => {
        setAllIcons(icons)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching icons:", err)
        setError("Failed to load icons. Please try again.")
        setIsLoading(false)
      })
  }, [prefix])

  // Reset scroll position when search query changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
      setScrollTop(0)
    }
  }, [searchQuery])

  // Update viewport height on mount, resize, and when container becomes visible
  useEffect(() => {
    if (isLoading || error) return

    const updateViewportHeight = () => {
      if (scrollContainerRef.current) {
        setViewportHeight(scrollContainerRef.current.clientHeight)
      }
    }

    // Measure after DOM is ready
    const timeoutId = setTimeout(() => {
      updateViewportHeight()
    }, 0)

    window.addEventListener("resize", updateViewportHeight)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", updateViewportHeight)
    }
  }, [isLoading, error])

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      setScrollTop(scrollContainerRef.current.scrollTop)
    }
  }, [])

  const toggleIcon = (icon: string) => {
    const iconId = joinIconId(prefix, icon)
    if (selectedIconIds.includes(iconId)) {
      setSelectedIconIds(selectedIconIds.filter((id) => id !== iconId))
    } else {
      setSelectedIconIds([...selectedIconIds, iconId])
    }
  }

  const filteredIcons = allIcons.filter((icon) => icon.toLowerCase().includes(searchQuery.toLowerCase()))

  // Calculate virtualization range
  const shouldVirtualize = !isLoading && !error && filteredIcons.length >= MIN_ICONS_FOR_VIRTUALIZATION
  const rowCount = Math.ceil(filteredIcons.length / COLUMNS)

  let startRow = 0
  let endRow = rowCount
  let visibleIcons = filteredIcons
  let topSpacerHeight = 0
  let bottomSpacerHeight = 0

  if (shouldVirtualize) {
    // Calculate visible row range
    startRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS)
    endRow = Math.min(rowCount, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + BUFFER_ROWS)

    // Convert rows to item indexes
    const startIndex = startRow * COLUMNS
    const endIndex = Math.min(filteredIcons.length, endRow * COLUMNS)

    visibleIcons = filteredIcons.slice(startIndex, endIndex)
    topSpacerHeight = startRow * ROW_HEIGHT
    bottomSpacerHeight = (rowCount - endRow) * ROW_HEIGHT
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Icon Library</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Browsing <span className="font-medium">{currentLibrary}</span> • {selectedIconIds.length} selected
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
          placeholder="Search icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading icons...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12">
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      {!isLoading && !error && (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-y-auto"
          style={{ maxHeight: "70vh", minHeight: "400px" }}
        >
          {filteredIcons.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No icons found matching "{searchQuery}"
            </div>
          ) : (
            <div className="relative">
              {/* Top spacer for virtualized scrolling */}
              {shouldVirtualize && topSpacerHeight > 0 && (
                <div style={{ height: topSpacerHeight }} />
              )}

              {/* Icon grid */}
              <div className="grid grid-cols-6 gap-3">
                {visibleIcons.map((icon) => {
                  const iconId = joinIconId(prefix, icon)
                  const isSelected = selectedIconIds.includes(iconId)
                  return (
                    <button
                      key={icon}
                      onClick={() => toggleIcon(icon)}
                      className="relative group aspect-square rounded-lg border border-border bg-card hover:bg-accent transition-colors p-4"
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center z-10">
                          <Check className="h-3 w-3" />
                        </div>
                      )}

                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <IconRenderer
                          iconName={icon}
                          prefix={prefix}
                          styleConfig={styleConfig}
                          size={48}
                          accurate={isSelected}
                        />
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate w-full text-center">
                          {icon}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Bottom spacer for virtualized scrolling */}
              {shouldVirtualize && bottomSpacerHeight > 0 && (
                <div style={{ height: bottomSpacerHeight }} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
