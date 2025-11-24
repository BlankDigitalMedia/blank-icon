export interface CuratedIcon {
  id: string // Iconify-compatible ID like "lucide:chrome"
  label: string // Display name
  category: string // e.g. "System", "Streaming", "Actions"
}

// System Applications - Common desktop apps and system icons
export const SYSTEM_APPS: CuratedIcon[] = [
  { id: "lucide:globe", label: "Browser", category: "System" },
  { id: "lucide:folder", label: "Folder", category: "System" },
  { id: "lucide:file", label: "File", category: "System" },
  { id: "lucide:settings", label: "Settings", category: "System" },
  { id: "lucide:terminal", label: "Terminal", category: "System" },
  { id: "lucide:code", label: "Code Editor", category: "System" },
  { id: "lucide:music", label: "Music", category: "System" },
  { id: "lucide:video", label: "Video", category: "System" },
  { id: "lucide:image", label: "Image", category: "System" },
  { id: "lucide:mail", label: "Mail", category: "System" },
  { id: "lucide:calendar", label: "Calendar", category: "System" },
  { id: "lucide:clock", label: "Clock", category: "System" },
  { id: "lucide:calculator", label: "Calculator", category: "System" },
  { id: "lucide:trash", label: "Trash", category: "System" },
  { id: "lucide:download", label: "Download", category: "System" },
  { id: "lucide:upload", label: "Upload", category: "System" },
  { id: "lucide:search", label: "Search", category: "System" },
  { id: "lucide:home", label: "Home", category: "System" },
  { id: "lucide:monitor", label: "Monitor", category: "System" },
  { id: "lucide:laptop", label: "Laptop", category: "System" },
]

// Streaming Applications - Popular streaming and content creation tools
export const STREAMING_APPS: CuratedIcon[] = [
  { id: "lucide:radio", label: "Radio", category: "Streaming" },
  { id: "lucide:mic", label: "Microphone", category: "Streaming" },
  { id: "lucide:video", label: "Video Camera", category: "Streaming" },
  { id: "lucide:camera", label: "Camera", category: "Streaming" },
  { id: "lucide:play", label: "Play", category: "Streaming" },
  { id: "lucide:pause", label: "Pause", category: "Streaming" },
  { id: "lucide:stop", label: "Stop", category: "Streaming" },
  { id: "lucide:skip-forward", label: "Skip Forward", category: "Streaming" },
  { id: "lucide:skip-back", label: "Skip Back", category: "Streaming" },
  { id: "lucide:volume-2", label: "Volume", category: "Streaming" },
  { id: "lucide:volume-x", label: "Mute", category: "Streaming" },
  { id: "lucide:headphones", label: "Headphones", category: "Streaming" },
  { id: "lucide:speaker", label: "Speaker", category: "Streaming" },
  { id: "lucide:circle", label: "Live", category: "Streaming" },
  { id: "lucide:users", label: "Viewers", category: "Streaming" },
  { id: "lucide:heart", label: "Like", category: "Streaming" },
  { id: "lucide:message-circle", label: "Chat", category: "Streaming" },
  { id: "lucide:share", label: "Share", category: "Streaming" },
  { id: "lucide:film", label: "Film", category: "Streaming" },
  { id: "lucide:tv", label: "TV", category: "Streaming" },
]

// Action Icons - Common actions and controls
export const ACTION_ICONS: CuratedIcon[] = [
  { id: "lucide:power", label: "Power", category: "Actions" },
  { id: "lucide:refresh-cw", label: "Refresh", category: "Actions" },
  { id: "lucide:rotate-cw", label: "Rotate", category: "Actions" },
  { id: "lucide:zoom-in", label: "Zoom In", category: "Actions" },
  { id: "lucide:zoom-out", label: "Zoom Out", category: "Actions" },
  { id: "lucide:maximize", label: "Maximize", category: "Actions" },
  { id: "lucide:minimize", label: "Minimize", category: "Actions" },
  { id: "lucide:x", label: "Close", category: "Actions" },
  { id: "lucide:check", label: "Check", category: "Actions" },
  { id: "lucide:plus", label: "Add", category: "Actions" },
  { id: "lucide:minus", label: "Remove", category: "Actions" },
  { id: "lucide:edit", label: "Edit", category: "Actions" },
  { id: "lucide:save", label: "Save", category: "Actions" },
  { id: "lucide:copy", label: "Copy", category: "Actions" },
  { id: "lucide:cut", label: "Cut", category: "Actions" },
  { id: "lucide:clipboard", label: "Paste", category: "Actions" },
  { id: "lucide:undo", label: "Undo", category: "Actions" },
  { id: "lucide:redo", label: "Redo", category: "Actions" },
  { id: "lucide:lock", label: "Lock", category: "Actions" },
  { id: "lucide:unlock", label: "Unlock", category: "Actions" },
]

// Combine all curated icons for easy access
export const ALL_CURATED_ICONS: CuratedIcon[] = [
  ...SYSTEM_APPS,
  ...STREAMING_APPS,
  ...ACTION_ICONS,
]

// Group icons by category for rendering
export function getCuratedIconsByCategory(): Record<string, CuratedIcon[]> {
  const grouped: Record<string, CuratedIcon[]> = {}
  for (const icon of ALL_CURATED_ICONS) {
    if (!grouped[icon.category]) {
      grouped[icon.category] = []
    }
    grouped[icon.category].push(icon)
  }
  return grouped
}

