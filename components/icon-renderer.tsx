"use client"

import { Icon } from "@iconify/react"
import { StyleConfig } from "@/lib/types"
import { useState, useEffect } from "react"
import { getIconSVG } from "@/lib/iconify"
import { applyStyleToSvg } from "@/lib/export"
import { ICON_LIBRARIES } from "@/components/library-selector"

interface IconRendererProps {
  iconName: string
  prefix: string
  styleConfig: StyleConfig
  size?: number
  className?: string
  accurate?: boolean
}

export function IconRenderer({ iconName, prefix, styleConfig, size = 24, className = "", accurate = false }: IconRendererProps) {
  const [hasError, setHasError] = useState(false)
  const [accurateSvg, setAccurateSvg] = useState<string | null>(null)

  useEffect(() => {
    setHasError(false)
    setAccurateSvg(null)
  }, [iconName, prefix, accurate])

  const library = ICON_LIBRARIES.find((lib) => lib.prefix === prefix)
  const styleMode = library?.styleMode
  const supportsStroke = library?.supportsStroke ?? false

  useEffect(() => {
    if (accurate && !hasError) {
      const loadAccurateSvg = async () => {
        try {
          const svg = await getIconSVG(prefix, iconName)
          // Calculate icon box size matching canvas logic: size - padding * 2
          const paddingPx = (size * styleConfig.padding) / 100
          const iconBoxSize = size - paddingPx * 2
          // Apply foreground-only styling with styleMode
          const styledSvg = applyStyleToSvg(svg, styleConfig, iconBoxSize, styleMode)
          setAccurateSvg(styledSvg)
        } catch (error) {
          console.error("Failed to load accurate SVG:", error)
          setHasError(true)
        }
      }
      loadAccurateSvg()
    }
  }, [accurate, iconName, prefix, styleConfig, size, hasError, styleMode])

  const iconId = `${prefix}:${iconName.toLowerCase().replace(/\s+/g, "-")}`

  // Calculate border radius matching canvas logic
  const borderRadius =
    styleConfig.backgroundShape === "circle"
      ? "50%"
      : styleConfig.backgroundShape === "rounded"
        ? `${size * 0.1}px`
        : "0px"

  // Map effects to box-shadow matching canvas behavior
  const boxShadow =
    styleConfig.effect === "shadow"
      ? "0 8px 16px rgba(0, 0, 0, 0.3)"
      : styleConfig.effect === "glow"
        ? `0 0 20px ${styleConfig.backgroundColor}80`
        : "none"

  // Calculate icon size percentage for padding (matching canvas: iconBoxSize = size - paddingPx * 2)
  const iconSizePercent = 100 - styleConfig.padding

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        backgroundColor: styleConfig.backgroundColor,
        color: styleConfig.foregroundColor,
        borderRadius,
        boxShadow,
        width: size,
        height: size,
      }}
    >
      {hasError ? (
        <div className="text-muted-foreground" style={{ fontSize: size * 0.3 }}>
          ?
        </div>
      ) : accurate && accurateSvg ? (
        // Accurate mode: foreground-only SVG (background handled by wrapper)
        <div
          style={{
            width: `${iconSizePercent}%`,
            height: `${iconSizePercent}%`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(accurateSvg)}`}
            alt={iconName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
            onError={() => setHasError(true)}
          />
        </div>
      ) : (
        // Fast mode: @iconify/react with color/stroke override based on capabilities
        <div
          style={{
            width: `${iconSizePercent}%`,
            height: `${iconSizePercent}%`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            icon={iconId}
            width={size * (iconSizePercent / 100)}
            height={size * (iconSizePercent / 100)}
            style={
              supportsStroke && styleMode === "stroke"
                ? { color: styleConfig.foregroundColor, strokeWidth: styleConfig.strokeWidth }
                : { color: styleConfig.foregroundColor }
            }
            onError={() => setHasError(true)}
          />
        </div>
      )}
    </div>
  )
}

