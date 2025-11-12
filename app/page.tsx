"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { IconGrid } from "@/components/icon-grid"
import { PackPreview } from "@/components/pack-preview"
import { ExportPanel } from "@/components/export-panel"
import { Header } from "@/components/header"
import { StyleConfig } from "@/lib/types"

const STORAGE_KEY = "sd-pack-state-v2"

interface PackState {
  currentLibrary: string
  packName: string
  selectedIconIds: string[]
  styleConfig: StyleConfig
}

function loadState(): PackState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as PackState
  } catch {
    return null
  }
}

function saveState(state: PackState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors
  }
}

export default function Home() {
  const defaultState: PackState = {
    currentLibrary: "lucide",
    packName: "",
    selectedIconIds: [],
    styleConfig: {
      strokeWidth: 2,
      foregroundColor: "#ffffff",
      backgroundColor: "#7c3aed",
      backgroundShape: "rounded",
      padding: 20,
      effect: "shadow",
      iconSize: 144,
    },
  }

  const [currentLibrary, setCurrentLibrary] = useState(defaultState.currentLibrary)
  const [packName, setPackName] = useState(defaultState.packName)
  const [selectedIconIds, setSelectedIconIds] = useState<string[]>(defaultState.selectedIconIds)
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(defaultState.styleConfig)

  useEffect(() => {
    const loaded = loadState()
    if (loaded) {
      setCurrentLibrary(loaded.currentLibrary)
      setPackName(loaded.packName)
      setSelectedIconIds(loaded.selectedIconIds)
      setStyleConfig(loaded.styleConfig)
    }
  }, [])

  useEffect(() => {
    const state: PackState = {
      currentLibrary,
      packName,
      selectedIconIds,
      styleConfig,
    }
    saveState(state)
  }, [currentLibrary, packName, selectedIconIds, styleConfig])

  const handleRemoveIcon = (id: string) => {
    setSelectedIconIds((prev) => prev.filter((x) => x !== id))
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        selectedIconIds={selectedIconIds}
        setSelectedIconIds={setSelectedIconIds}
        styleConfig={styleConfig}
        setStyleConfig={setStyleConfig}
        currentLibrary={currentLibrary}
        setCurrentLibrary={setCurrentLibrary}
        packName={packName}
        setPackName={setPackName}
      />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Pack Preview */}
            <PackPreview selectedIconIds={selectedIconIds} styleConfig={styleConfig} onRemoveIcon={handleRemoveIcon} />

            {/* Icon Grid */}
            <IconGrid
              selectedIconIds={selectedIconIds}
              setSelectedIconIds={setSelectedIconIds}
              styleConfig={styleConfig}
              currentLibrary={currentLibrary}
            />

            {/* Export Panel */}
            <ExportPanel selectedIconIds={selectedIconIds} styleConfig={styleConfig} packName={packName} />
          </div>
        </main>
      </div>
    </div>
  )
}
