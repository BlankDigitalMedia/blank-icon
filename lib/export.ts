import JSZip from "jszip"
import { StyleConfig } from "@/lib/types"
import { getIconSVG, normalizeIconName, parseIconId } from "@/lib/iconify"

/**
 * Safely applies styling to an SVG string without corrupting markup
 * and without forcing stroke attributes on fill-only icons.
 *
 * Strategy:
 * - Parse to DOM, edit attributes, serialize back to string
 * - Always set root fill to foreground to unify monochrome output
 * - Only set stroke and stroke-width if the icon actually uses stroke
 * - Explicitly set width/height to requested pixel size
 */
export function applyStyleToSvg(svg: string, styleConfig: StyleConfig, pixelSize: number): string {
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

    // Determine if the icon actually uses strokes
    const usesStroke =
      doc.querySelector("[stroke]") !== null || doc.querySelector("[stroke-width]") !== null

    // Set both `fill` and CSS `color` on root:
    // - `fill` controls elements without an explicit fill
    // - `color` ensures elements using `currentColor` resolve to our chosen color
    svgEl.setAttribute("fill", styleConfig.foregroundColor)
    svgEl.setAttribute("color", styleConfig.foregroundColor)

    // Normalize fills on child elements to a single foreground color, but
    // respect 'none' and gradient/pattern fills.
    const nodesWithFill = svgEl.querySelectorAll<SVGElement>("[fill]")
    nodesWithFill.forEach((el) => {
      const val = el.getAttribute("fill") || ""
      const isNone = val === "none"
      const isUrlRef = val.startsWith("url(")
      if (!isNone && !isUrlRef) {
        el.setAttribute("fill", styleConfig.foregroundColor)
      }
    })

    // Apply stroke color/width only if strokes are present
    if (usesStroke) {
      const nodesWithStroke = svgEl.querySelectorAll<SVGElement>("[stroke], [stroke-width]")
      nodesWithStroke.forEach((el) => {
        el.setAttribute("stroke", styleConfig.foregroundColor)
        el.setAttribute("stroke-width", String(styleConfig.strokeWidth))
      })
    } else {
      // Remove stray stroke attributes to avoid unexpected outlines on fill-only icons
      const nodesWithStroke = svgEl.querySelectorAll<SVGElement>("[stroke], [stroke-width]")
      nodesWithStroke.forEach((el) => {
        el.removeAttribute("stroke")
        el.removeAttribute("stroke-width")
      })
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
  size: number = 144
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

    const padding = (size * styleConfig.padding) / 100
    const iconSize = size - padding * 2

    const modifiedSvg = applyStyleToSvg(svgString, styleConfig, iconSize)

    const img = new Image()
    const svgBlob = new Blob([modifiedSvg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      URL.revokeObjectURL(url)

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

      ctx.fillStyle = styleConfig.backgroundColor
      ctx.fillRect(0, 0, size, size)

      ctx.restore()

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

      ctx.drawImage(img, padding, padding, iconSize, iconSize)

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
  const iconSize = styleConfig.iconSize || 144

  for (let i = 0; i < selectedIconIds.length; i++) {
    const iconId = selectedIconIds[i]
    onProgress?.(i + 1, selectedIconIds.length)

    try {
      const { prefix, name } = parseIconId(iconId)
      const svg = await getIconSVG(prefix, name)
      const blob = await renderIconToCanvas(svg, styleConfig, iconSize)
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

