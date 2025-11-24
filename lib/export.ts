import JSZip from "jszip"
import { StyleConfig } from "@/lib/types"
import { getIconSVG, normalizeIconName, parseIconId } from "@/lib/iconify"
import { ICON_LIBRARIES } from "@/components/library-selector"

/**
 * Applies foreground-only styling to an SVG string.
 * This function focuses solely on normalizing the foreground icon:
 * - Sets size, monochrome color, and stroke/fill behavior
 * - No background shapes or effects (handled separately in canvas)
 * - Behavior driven by styleMode when provided
 *
 * Strategy:
 * - Parse to DOM, edit attributes, serialize back to string
 * - Set root fill and color to foreground for monochrome output
 * - Apply stroke/fill normalization based on styleMode
 * - Explicitly set width/height to requested pixel size
 */
export function applyStyleToSvg(
  svg: string,
  styleConfig: StyleConfig,
  pixelSize: number,
  styleMode?: "stroke" | "fill" | "mixed"
): string {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svg, "image/svg+xml")
    const svgEl = doc.querySelector("svg")
    if (!svgEl) {
      return svg
    }

    // Normalize dimensions for rasterization
    svgEl.setAttribute("width", String(pixelSize))
    svgEl.setAttribute("height", String(pixelSize))

    // Set both `fill` and CSS `color` on root:
    // - `fill` controls elements without an explicit fill
    // - `color` ensures elements using `currentColor` resolve to our chosen color
    svgEl.setAttribute("fill", styleConfig.foregroundColor)
    svgEl.setAttribute("color", styleConfig.foregroundColor)

    // Determine if the icon actually uses strokes (for fallback behavior)
    const hasStrokeElements =
      doc.querySelector("[stroke]") !== null || doc.querySelector("[stroke-width]") !== null

    // Apply styling based on styleMode
    if (styleMode === "stroke") {
      // Stroke-centric: normalize strokes, keep fills as "none" where appropriate
      const nodesWithStroke = svgEl.querySelectorAll<SVGElement>("[stroke], [stroke-width]")
      nodesWithStroke.forEach((el) => {
        el.setAttribute("stroke", styleConfig.foregroundColor)
        el.setAttribute("stroke-width", String(styleConfig.strokeWidth))
      })

      // Set fill to "none" for elements that should be stroke-only
      const allElements = svgEl.querySelectorAll<SVGElement>("*")
      allElements.forEach((el) => {
        const currentFill = el.getAttribute("fill")
        // Only set to "none" if not already a special fill (none, url, etc.)
        if (currentFill && !currentFill.startsWith("url(") && currentFill !== "none") {
          // Check if this element has stroke attributes - if so, prefer stroke
          if (el.hasAttribute("stroke") || el.hasAttribute("stroke-width")) {
            el.setAttribute("fill", "none")
          }
        }
      })
    } else if (styleMode === "fill") {
      // Fill-centric: prioritize fills, avoid introducing artificial strokes
      const nodesWithFill = svgEl.querySelectorAll<SVGElement>("[fill]")
      nodesWithFill.forEach((el) => {
        const val = el.getAttribute("fill") || ""
        const isNone = val === "none"
        const isUrlRef = val.startsWith("url(")
        if (!isNone && !isUrlRef) {
          el.setAttribute("fill", styleConfig.foregroundColor)
        }
      })

      // Remove stroke attributes to avoid unexpected outlines
      const nodesWithStroke = svgEl.querySelectorAll<SVGElement>("[stroke], [stroke-width]")
      nodesWithStroke.forEach((el) => {
        el.removeAttribute("stroke")
        el.removeAttribute("stroke-width")
      })
    } else {
      // Mixed mode or fallback: normalize both carefully
      // Normalize fills, but respect gradients and patterns
      const nodesWithFill = svgEl.querySelectorAll<SVGElement>("[fill]")
      nodesWithFill.forEach((el) => {
        const val = el.getAttribute("fill") || ""
        const isNone = val === "none"
        const isUrlRef = val.startsWith("url(")
        if (!isNone && !isUrlRef) {
          el.setAttribute("fill", styleConfig.foregroundColor)
        }
      })

      // Apply stroke only if strokes are actually present
      if (hasStrokeElements) {
        const nodesWithStroke = svgEl.querySelectorAll<SVGElement>("[stroke], [stroke-width]")
        nodesWithStroke.forEach((el) => {
          el.setAttribute("stroke", styleConfig.foregroundColor)
          el.setAttribute("stroke-width", String(styleConfig.strokeWidth))
        })
      } else {
        // Remove stray stroke attributes
        const nodesWithStroke = svgEl.querySelectorAll<SVGElement>("[stroke], [stroke-width]")
        nodesWithStroke.forEach((el) => {
          el.removeAttribute("stroke")
          el.removeAttribute("stroke-width")
        })
      }
    }

    // Serialize back to string
    const serializer = new XMLSerializer()
    return serializer.serializeToString(doc)
  } catch {
    // In case DOMParser fails (shouldn't in browsers), fall back to original SVG
    return svg
  }
}

export async function renderIconToCanvas(
  svgString: string,
  styleConfig: StyleConfig,
  size: number = 144,
  styleMode?: "stroke" | "fill" | "mixed"
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    // Step 1: Prepare canvas and compute dimensions
    const paddingPx = (size * styleConfig.padding) / 100
    const iconBoxSize = size - paddingPx * 2

    // Step 2: Draw background shape first
    const borderRadius =
      styleConfig.backgroundShape === "circle"
        ? size / 2
        : styleConfig.backgroundShape === "rounded"
          ? size * 0.1
          : 0

    ctx.save()

    if (borderRadius > 0) {
      ctx.beginPath()
      if (styleConfig.backgroundShape === "circle") {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      } else {
        // Rounded rectangle
        ctx.moveTo(borderRadius, 0)
        ctx.lineTo(size - borderRadius, 0)
        ctx.quadraticCurveTo(size, 0, size, borderRadius)
        ctx.lineTo(size, size - borderRadius)
        ctx.quadraticCurveTo(size, size, size - borderRadius, size)
        ctx.lineTo(borderRadius, size)
        ctx.quadraticCurveTo(0, size, 0, size - borderRadius)
        ctx.lineTo(0, borderRadius)
        ctx.quadraticCurveTo(0, 0, borderRadius, 0)
        ctx.closePath()
      }
      ctx.clip()
    }

    // Fill background with backgroundColor
    ctx.fillStyle = styleConfig.backgroundColor
    ctx.fillRect(0, 0, size, size)

    ctx.restore()

    // Step 3: Apply effect (shadow/glow) before drawing icon
    if (styleConfig.effect === "shadow") {
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 16
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 8
    } else if (styleConfig.effect === "glow") {
      ctx.shadowColor = styleConfig.backgroundColor
      ctx.shadowBlur = 20
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }

    // Step 4: Draw icon (foreground-only SVG, centered in padded box)
    // Get foreground-only SVG styled for the icon box size
    const foregroundSvg = applyStyleToSvg(svgString, styleConfig, iconBoxSize, styleMode)

    const img = new Image()
    const svgBlob = new Blob([foregroundSvg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Draw the icon centered in the padded box
      ctx.drawImage(img, paddingPx, paddingPx, iconBoxSize, iconBoxSize)

      // Step 5: Reset shadows after drawing
      if (styleConfig.effect !== "none") {
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to create blob"))
          }
        },
        "image/png",
        1.0
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load SVG image"))
    }

    img.src = url
  })
}

export function generatePackJSON(
  packName: string,
  selectedIconIds: string[],
  styleConfig: StyleConfig
): string {
  const pack = {
    name: packName || "My Icon Pack",
    version: "1.0.0",
    author: "User",
    description: `Generated icon pack with ${selectedIconIds.length} icons`,
    icons: selectedIconIds.map((iconId) => {
      const { prefix, name } = parseIconId(iconId)
      const normalizedName = normalizeIconName(name)
      return {
        name: normalizedName,
        file: `${prefix}-${normalizedName}.png`,
      }
    }),
  }

  return JSON.stringify(pack, null, 2)
}

export async function generateZIP(
  packName: string,
  selectedIconIds: string[],
  iconBlobs: Map<string, Blob>,
  packJSON: string
): Promise<Blob> {
  const zip = new JSZip()

  iconBlobs.forEach((blob, iconId) => {
    const { prefix, name } = parseIconId(iconId)
    const normalizedName = normalizeIconName(name)
    zip.file(`${prefix}-${normalizedName}.png`, blob)
  })

  zip.file("pack.json", packJSON)

  return zip.generateAsync({ type: "blob" })
}

export function downloadPack(blob: Blob, packName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${packName || "icon-pack"}.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportIconPack(
  packName: string,
  selectedIconIds: string[],
  styleConfig: StyleConfig,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const iconBlobs = new Map<string, Blob>()
  const iconSize = 144

  for (let i = 0; i < selectedIconIds.length; i++) {
    const iconId = selectedIconIds[i]
    onProgress?.(i + 1, selectedIconIds.length)

    try {
      const { prefix, name } = parseIconId(iconId)
      const library = ICON_LIBRARIES.find((lib) => lib.prefix === prefix)
      const styleMode = library?.styleMode
      
      const svg = await getIconSVG(prefix, name)
      const blob = await renderIconToCanvas(svg, styleConfig, iconSize, styleMode)
      iconBlobs.set(iconId, blob)
    } catch (error) {
      console.error(`Failed to export icon ${iconId}:`, error)
      throw new Error(`Failed to export icon: ${iconId}`)
    }
  }

  const packJSON = generatePackJSON(packName, selectedIconIds, styleConfig)
  const zipBlob = await generateZIP(packName, selectedIconIds, iconBlobs, packJSON)
  downloadPack(zipBlob, packName)
}

