export interface StyleConfig {
  strokeWidth: number
  foregroundColor: string
  backgroundColor: string
  backgroundShape: "circle" | "rounded" | "square"
  padding: number
  effect: "shadow" | "glow" | "none"
  iconSize?: number
}

export interface IconLibrary {
  id: string
  name: string
  description: string
  iconCount: string
  prefix: string
  supportsStroke: boolean
  supportsCurrentColor: boolean
}

export interface IconData {
  name: string
  prefix: string
  svg?: string
}

