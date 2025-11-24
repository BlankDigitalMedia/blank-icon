"use client"

import { useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Settings2, Send } from "lucide-react"
import { LibrarySelector, ICON_LIBRARIES } from "@/components/library-selector"
import { StyleConfig } from "@/lib/types"

interface SidebarProps {
  selectedIconIds: string[]
  setSelectedIconIds: (ids: string[]) => void
  styleConfig: StyleConfig
  setStyleConfig: (config: StyleConfig) => void
  currentLibrary: string
  setCurrentLibrary: (library: string) => void
  packName: string
  setPackName: (name: string) => void
  mode: "recommended" | "advanced"
  setMode: (mode: "recommended" | "advanced") => void
}

export function Sidebar({ styleConfig, setStyleConfig, currentLibrary, setCurrentLibrary, packName, setPackName, mode, setMode }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "design">("design")
  const [prompt, setPrompt] = useState("")
  const foregroundColorInputRef = useRef<HTMLInputElement>(null)
  const backgroundColorInputRef = useRef<HTMLInputElement>(null)

  const library = ICON_LIBRARIES.find((lib) => lib.id === currentLibrary) || ICON_LIBRARIES[0]
  const supportsStroke = library.supportsStroke
  const styleMode = library.styleMode
  const strokeRelevant = supportsStroke && styleMode !== "fill"

  return (
    <aside className="w-80 border-r border-border bg-card flex flex-col">
      <div className="border-b border-border bg-background">
        <div className="flex">
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "ai"
                ? "bg-card text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            AI Chat
          </button>
          <button
            onClick={() => setActiveTab("design")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "design"
                ? "bg-card text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings2 className="h-4 w-4" />
            Design
          </button>
        </div>
      </div>

      {activeTab === "ai" ? (
        // AI Chat Tab Content
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {/* AI Welcome Message */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground leading-relaxed">
                      Describe what icon pack you want and I'll set up the controls for you. Try{" "}
                      <span className="font-medium">"Create a neon gaming icon pack"</span> or{" "}
                      <span className="font-medium">"Make minimalist productivity icons with blue backgrounds"</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat messages would appear here */}
            </div>
          </div>

          {/* AI Input at bottom */}
          <div className="p-4 border-t border-border bg-background">
            <div className="flex gap-2">
              <Textarea
                placeholder="Describe your icon pack..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <Button size="icon" className="h-auto flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Design Tab Content (Manual Controls)
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Pack Settings */}
          <div>
            <h2 className="text-sm font-medium text-foreground mb-4">Pack Settings</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Pack Name</Label>
                <Input 
                  placeholder="My Icon Pack" 
                  className="mt-1.5" 
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                />
              </div>

              {/* Mode Toggle */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Mode</Label>
                <div className="flex gap-2">
                  {(["recommended", "advanced"] as const).map((m) => (
                    <Button
                      key={m}
                      variant={mode === m ? "secondary" : "outline"}
                      size="sm"
                      className="flex-1 capitalize"
                      onClick={() => setMode(m)}
                    >
                      {m}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {mode === "recommended"
                    ? "Browse curated Stream Deck-focused icons"
                    : "Access all icons from Iconify libraries"}
                </p>
              </div>

              {/* Icon Library Selector - Only show in Advanced mode */}
              {mode === "advanced" && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Icon Library</Label>
                  <LibrarySelector currentLibrary={currentLibrary} onLibraryChange={setCurrentLibrary} />
                </div>
              )}
            </div>
          </div>

          {/* Style Controls */}
          <div>
            <h2 className="text-sm font-medium text-foreground mb-4">Style</h2>
            <div className="space-y-6">
              {/* Stroke Width */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className={`text-xs ${strokeRelevant ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                    Stroke Width
                    {!strokeRelevant && (
                      <span className="ml-1 text-[10px]">(not applicable)</span>
                    )}
                  </Label>
                  <span className={`text-xs ${strokeRelevant ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {styleConfig.strokeWidth}px
                  </span>
                </div>
                <Slider
                  value={[styleConfig.strokeWidth]}
                  onValueChange={([value]) => setStyleConfig({ ...styleConfig, strokeWidth: value })}
                  min={1}
                  max={5}
                  step={0.5}
                  className="mt-1"
                  disabled={!strokeRelevant}
                  aria-disabled={!strokeRelevant}
                />
              </div>

              {/* Icon Color */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Icon Color</Label>
                <div className="flex gap-2">
                  <input
                    ref={foregroundColorInputRef}
                    type="color"
                    value={styleConfig.foregroundColor}
                    onChange={(e) => setStyleConfig({ ...styleConfig, foregroundColor: e.target.value })}
                    className="hidden"
                  />
                  <div
                    className="h-10 w-10 rounded border border-border cursor-pointer"
                    style={{ backgroundColor: styleConfig.foregroundColor }}
                    onClick={() => foregroundColorInputRef.current?.click()}
                  />
                  <Input
                    value={styleConfig.foregroundColor}
                    onChange={(e) => setStyleConfig({ ...styleConfig, foregroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Background Shape */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Background Shape</Label>
                <div className="flex gap-2">
                  {(["circle", "rounded", "square"] as const).map((shape) => (
                    <Button
                      key={shape}
                      variant={styleConfig.backgroundShape === shape ? "secondary" : "outline"}
                      size="sm"
                      className="flex-1 capitalize"
                      onClick={() => setStyleConfig({ ...styleConfig, backgroundShape: shape })}
                    >
                      {shape}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Background Color</Label>
                <div className="flex gap-2">
                  <input
                    ref={backgroundColorInputRef}
                    type="color"
                    value={styleConfig.backgroundColor}
                    onChange={(e) => setStyleConfig({ ...styleConfig, backgroundColor: e.target.value })}
                    className="hidden"
                  />
                  <div
                    className="h-10 w-10 rounded border border-border cursor-pointer"
                    style={{ backgroundColor: styleConfig.backgroundColor }}
                    onClick={() => backgroundColorInputRef.current?.click()}
                  />
                  <Input
                    value={styleConfig.backgroundColor}
                    onChange={(e) => setStyleConfig({ ...styleConfig, backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Icon Padding */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Icon Padding</Label>
                  <span className="text-xs text-foreground">{styleConfig.padding}%</span>
                </div>
                <Slider
                  value={[styleConfig.padding]}
                  onValueChange={([value]) => setStyleConfig({ ...styleConfig, padding: value })}
                  min={0}
                  max={40}
                  step={5}
                  className="mt-1"
                />
              </div>

              {/* Effects */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Effects</Label>
                <div className="flex gap-2">
                  {(["shadow", "glow", "none"] as const).map((effect) => (
                    <Button
                      key={effect}
                      variant={styleConfig.effect === effect ? "secondary" : "outline"}
                      size="sm"
                      className="flex-1 capitalize"
                      onClick={() => setStyleConfig({ ...styleConfig, effect })}
                    >
                      {effect}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
