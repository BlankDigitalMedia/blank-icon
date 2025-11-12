"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Check, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

// Popular Iconify collections
export const ICON_LIBRARIES = [
  {
    id: "lucide",
    name: "Lucide",
    description: "Beautiful & consistent icons",
    iconCount: "1,400+",
    prefix: "lucide",
    supportsStroke: true,
    supportsCurrentColor: true,
  },
  {
    id: "material-symbols",
    name: "Material Symbols",
    description: "Google's Material Design icons",
    iconCount: "2,500+",
    prefix: "material-symbols",
    supportsStroke: false,
    supportsCurrentColor: true,
  },
  {
    id: "heroicons",
    name: "Heroicons",
    description: "Tailwind Labs icon set",
    iconCount: "300+",
    prefix: "heroicons",
    supportsStroke: true,
    supportsCurrentColor: true,
  },
  {
    id: "tabler",
    name: "Tabler Icons",
    description: "Over 4,900 pixel-perfect icons",
    iconCount: "4,900+",
    prefix: "tabler",
    supportsStroke: true,
    supportsCurrentColor: true,
  },
  {
    id: "phosphor",
    name: "Phosphor",
    description: "Flexible icon family",
    iconCount: "6,000+",
    prefix: "ph",
    supportsStroke: false,
    supportsCurrentColor: true,
  },
  {
    id: "carbon",
    name: "Carbon",
    description: "IBM's design system icons",
    iconCount: "2,000+",
    prefix: "carbon",
    supportsStroke: false,
    supportsCurrentColor: true,
  },
  {
    id: "iconoir",
    name: "Iconoir",
    description: "Simple and definitive",
    iconCount: "1,500+",
    prefix: "iconoir",
    supportsStroke: true,
    supportsCurrentColor: true,
  },
  {
    id: "solar",
    name: "Solar",
    description: "Bold, broken, line, outline styles",
    iconCount: "7,000+",
    prefix: "solar",
    supportsStroke: false,
    supportsCurrentColor: true,
  },
  {
    id: "mingcute",
    name: "MingCute",
    description: "Carefully crafted icons",
    iconCount: "2,800+",
    prefix: "mingcute",
    supportsStroke: false,
    supportsCurrentColor: true,
  },
  {
    id: "fluent",
    name: "Fluent",
    description: "Microsoft Fluent design",
    iconCount: "12,000+",
    prefix: "fluent",
    supportsStroke: false,
    supportsCurrentColor: true,
  },
  {
    id: "mdi",
    name: "Material Design Icons",
    description: "Community-maintained Material icons",
    iconCount: "7,000+",
    prefix: "mdi",
    supportsStroke: false,
    supportsCurrentColor: true,
  },
  {
    id: "simple-icons",
    name: "Simple Icons",
    description: "Brand icons for popular services",
    iconCount: "3,000+",
    prefix: "simple-icons",
    supportsStroke: false,
    supportsCurrentColor: true,
  },
]

interface LibrarySelectorProps {
  currentLibrary: string
  onLibraryChange: (libraryId: string) => void
}

export function LibrarySelector({ currentLibrary, onLibraryChange }: LibrarySelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedLibrary = ICON_LIBRARIES.find((lib) => lib.id === currentLibrary) || ICON_LIBRARIES[0]

  const filteredLibraries = ICON_LIBRARIES.filter(
    (lib) =>
      lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lib.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSelect = (libraryId: string) => {
    onLibraryChange(libraryId)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-between w-full bg-transparent">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">{selectedLibrary.prefix[0].toUpperCase()}</span>
            </div>
            <span className="text-sm font-medium">{selectedLibrary.name}</span>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Icon Library</DialogTitle>
          <DialogDescription>Select an Iconify collection to use for your icon pack</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search libraries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {filteredLibraries.map((library) => (
              <button
                key={library.id}
                onClick={() => handleSelect(library.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                  currentLibrary === library.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                }`}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{library.prefix[0].toUpperCase()}</span>
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm">{library.name}</h3>
                    <span className="text-xs text-muted-foreground">{library.iconCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{library.description}</p>
                </div>

                {currentLibrary === library.id && <Check className="h-5 w-5 text-primary flex-shrink-0" />}
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
