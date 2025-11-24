## Stream Deck Icon Rendering & Library Refactor Plan

Audience: development team  
Goal: make the app feel purpose-built for Stream Deck creators by fixing the rendering model, stabilizing library behavior, improving performance, and preparing for curated icon sets.

---

## 1. Scope & Objectives

**Primary objectives**
- **Stabilize rendering** across mixed SVG libraries (stroke/fill/mixed).
- **Separate icon styling from background rendering** so we stop “fighting” each library’s SVG model.
- **Improve perceived performance** of the icon grid.
- **Prepare for Stream Deck–specific workflows** (curated app/action/category sets, recommended vs advanced modes).

**Out of scope (for now)**
- No backend work.
- No AI chat behavior changes (UI can stay as-is).
- No monetization or marketplace integration yet.

---

## 2. Current State (Summary)

Key files:
- `lib/export.ts`
  - `applyStyleToSvg(svg, styleConfig, pixelSize)`
  - `renderIconToCanvas(svgString, styleConfig, size)`
  - `exportIconPack(...)` and helpers.
- `lib/iconify.ts`
  - `fetchIconList`, `getIconSVG`, `normalizeIconName`, `joinIconId`, `parseIconId`.
- `components/icon-renderer.tsx`
  - Renders icons using `@iconify/react` **or** accurate SVG via `applyStyleToSvg`.
- `components/icon-grid.tsx`
  - Fetches icons from Iconify, renders a big static grid.
- `components/sidebar.tsx` + `components/library-selector.tsx`
  - Library selection, style controls, partial capability matrix (`supportsStroke`, `supportsCurrentColor`).

Current pain points:
- Single styling model stretched across 12+ libraries with different SVG philosophies.
- Background + icon + stroke/fill styling are intertwined.
- Large icon lists rendered without virtualization → sluggish UI.
- No curated, Stream Deck–specific sets; users browse thousands of generic glyphs.

---

## 3. Phase 1 – Rendering Pipeline Refactor (Background-First)

**Goal:** Make rendering deterministic and Stream Deck–friendly by separating background rendering from icon styling.

### 3.1. API contracts (do not break)

- Keep the **external signatures** of:
  - `exportIconPack(packName, selectedIconIds, styleConfig, onProgress?)`
  - `generatePackJSON(...)`, `generateZIP(...)`, `downloadPack(...)`
- Keep the `StyleConfig` shape unchanged for now:
  - `strokeWidth`, `foregroundColor`, `backgroundColor`, `backgroundShape`, `padding`, `effect`.

### 3.2. Refactor `applyStyleToSvg` to focus on foreground only

File: `lib/export.ts`

**Current behavior (high level)**
- Sets width/height on `<svg>`.
- Tries to normalize both fills and strokes.
- Partially acts like a “global styling engine” for each library.

**Target behavior**
- Treat `applyStyleToSvg` strictly as "**foreground icon normalizer**":
  - No background concerns (no shapes, no shadows).
  - No attempt to simulate Stream Deck backgrounds.
  - Its job: return an SVG that:
    - Is monochrome (using `styleConfig.foregroundColor`).
    - Respects library capabilities (stroke vs fill).
    - Is sized appropriately for the requested pixel size.

**Implementation notes**
- Keep `DOMParser` + `XMLSerializer` approach.
- Use the new capability matrix (see Phase 2) to drive behavior:
  - If `styleMode === "stroke"`:
    - Respect strokes, set `stroke` + `stroke-width`.
    - Prefer leaving `fill="none"` where appropriate.
  - If `styleMode === "fill"`:
    - Focus on `fill` normalization, avoid forcing strokes.
  - If `styleMode === "mixed"`:
    - Normalize both, but avoid overwriting gradients/`url(...)` fills.
- Always:
  - Set root `color` to `styleConfig.foregroundColor` for `currentColor` icons.
  - Avoid any background fills; foreground only.

### 3.3. Make `renderIconToCanvas` explicitly background-first

File: `lib/export.ts`

**Target pipeline inside `renderIconToCanvas`**
1. **Prepare canvas**
   - `canvas.width = size`, `canvas.height = size`.
   - Compute `paddingPx = (size * styleConfig.padding) / 100`.
   - Compute `iconBoxSize = size - paddingPx * 2`.
2. **Draw background shape**
   - Based on `styleConfig.backgroundShape`:
     - `circle`: full-radius circle.
     - `rounded`: rounded rect with `size * 0.1` or similar.
     - `square`: plain rect.
   - Fill with `styleConfig.backgroundColor`.
3. **Apply effect (shadow/glow)**
   - If `effect === "shadow"`:
     - Set `ctx.shadowColor`, `shadowBlur`, `offsetX`, `offsetY`.
   - If `effect === "glow"`:
     - `shadowColor = backgroundColor`, `shadowBlur` high, zero offsets.
4. **Draw icon**
   - Call `applyStyleToSvg` to get a **foreground-only SVG** sized to `iconBoxSize`.
   - Render it inside the padded box (`paddingPx` on each side).
   - Ensure image is centered; no background added at SVG level.
5. **Reset shadows**
   - Clear shadow settings after drawing.

**Key change:** The background is always a canvas operation; the SVG never owns the background.

### 3.4. Align `IconRenderer` with the new model

File: `components/icon-renderer.tsx`

**Current behavior**
- Wraps an icon in a div that sets:
  - Background color, border radius, box shadow.
- For `accurate=true`, pulls SVG + `applyStyleToSvg` and displays it via `<img>`.

**Target behavior**
- Conceptually treat `IconRenderer` as "foreground preview with background frame", mirroring the canvas export:
  - Background:
    - Use CSS to simulate `backgroundShape` + shadow/glow similar to canvas logic.
  - Foreground:
    - Fast mode: `@iconify/react` with color/stroke override based on capability matrix.
    - Accurate mode: styled SVG via `applyStyleToSvg`.

**Action items**
- Reuse the same `borderRadius` and effect logic as in `renderIconToCanvas` (centralize the calculation if needed).
- Ensure `supportsStroke` / `styleMode` influences whether `strokeWidth` is actually applied.

---

## 4. Phase 2 – Library Capability Matrix

**Goal:** Make per-library behavior explicit and drive UI + styling decisions from that.

### 4.1. Extend types

File: `lib/types.ts`

Add fields to `IconLibrary`:

```ts
export interface IconLibrary {
  id: string;
  name: string;
  description: string;
  iconCount: string;
  prefix: string;
  supportsStroke: boolean;
  supportsCurrentColor: boolean;

  // New:
  styleMode: "stroke" | "fill" | "mixed";
  prefersBold: boolean;
}
```

### 4.2. Populate capabilities for all libraries

File: `components/library-selector.tsx`

- For each entry in `ICON_LIBRARIES`, set:
  - `styleMode` based on how the library behaves in Iconify:
    - e.g., Lucide/Heroicons/Tabler → `"stroke"`.
    - Material Symbols, MDI, etc. → `"fill"`.
    - Mixed sets as `"mixed"`.
  - `prefersBold` where appropriate (e.g., some filled icon sets).

### 4.3. Drive UI + logic from the matrix

Files:
- `components/sidebar.tsx`
- `components/icon-renderer.tsx`
- `lib/export.ts`

Examples:
- Sidebar:
  - Hide or downgrade stroke controls when `styleMode === "fill"`.
  - Potentially surface “weight”/“boldness” choices only where they make sense later.
- IconRenderer + export:
  - Use `styleMode` to decide how aggressively to override `stroke` vs `fill`.

---

## 5. Phase 3 – Virtualized Icon Grid

**Goal:** Make large libraries usable by rendering only what’s visible.

### 5.1. Choose approach

Options:
- Minimal dependency: write a simple windowing layer around the current grid (row/column based).
- Library: integrate a small virtualization lib (e.g. `react-window` style) if acceptable.

Given project size, a **minimal homegrown virtualization** is fine.

### 5.2. Implementation outline

File: `components/icon-grid.tsx`

1. Measure viewport height of the scroll container.
2. Assume fixed row height (based on icon card size + gaps).
3. Compute:
   - `visibleRowStart`, `visibleRowEnd` based on scroll position.
   - Slice `filteredIcons` to that range plus a small buffer.
4. Render:
   - A single grid with:
     - Top spacer div (height of rows before visible window).
     - Visible subset of cards.
     - Bottom spacer div (height of rows after visible window).

Keep the API of `IconGrid` the same (props shape unchanged).

---

## 6. Phase 4 – Curated Sets & Modes (Recommended vs Advanced)

**Goal:** Make the app feel built for Stream Deck by default, while preserving full Iconify power for advanced users.

### 6.1. Data model for curated sets

New file (suggested): `lib/curated-sets.ts` or JSON files under `lib/curated/`.

Shape example:

```ts
export interface CuratedIcon {
  id: string;          // "lucide:chrome" or "custom:obs-scene"
  label: string;       // Display name
  category: string;    // e.g. "System", "Streaming", "Actions"
}

export const SYSTEM_APPS: CuratedIcon[] = [/* ... */];
export const STREAMING_APPS: CuratedIcon[] = [/* ... */];
export const ACTION_ICONS: CuratedIcon[] = [/* ... */];
```

### 6.2. UI surface: Recommended vs Advanced

Files:
- `components/sidebar.tsx` (or a small new toggle component).
- `components/icon-grid.tsx` (or a sibling `CuratedGrid`).

Plan:
- Add a simple mode toggle in the main UI:
  - **Recommended**:
    - Show curated sets only (small, fast, opinionated).
  - **Advanced**:
    - Show current Iconify-powered `IconGrid`.
- Under the hood:
  - Recommended mode uses curated arrays and the same `selectedIconIds` state.
  - Advanced mode keeps current behavior, but now with virtualization.

### 6.3. Reuse selection + export pipeline

- Curated icons should still use the exact same:
  - `selectedIconIds` array.
  - `exportIconPack` pipeline.
- IDs for curated icons must be compatible with `parseIconId` (`prefix:name`).

---

## 7. Testing & Validation Checklist

**Rendering**
- [ ] Lucide icon exports with correct stroke width and colors.
- [ ] Material Symbols icon exports with correct fills (no weird strokes).
- [ ] Mixed libraries (e.g., Tabler/Phosphor) render without missing parts.
- [ ] Background shapes (circle/rounded/square) look identical between preview and exported PNG.
- [ ] Shadow and glow effects look consistent across libraries.

**Performance**
- [ ] Icon grid scrolls smoothly with large libraries.
- [ ] Search + filter still work correctly with virtualization.

**UX**
- [ ] Recommended mode shows small, meaningful curated sets.
- [ ] Advanced mode still exposes all Iconify icons.
- [ ] Switching modes preserves selected icons (or at least doesn’t crash).

**Regression**
- [ ] `exportIconPack` still downloads a valid ZIP with `pack.json` and correctly named PNGs.
- [ ] LocalStorage persistence (`sd-pack-state-v2`) still works after refactor.

---

## 8. Suggested Implementation Order

1. **Phase 1** – Refactor `lib/export.ts` + `IconRenderer` to background-first, foreground-only styling.
2. **Phase 2** – Expand `IconLibrary` capability matrix and wire it into sidebar + rendering/export logic.
3. **Phase 3** – Add virtualization to `IconGrid`.
4. **Phase 4** – Introduce curated sets + Recommended/Advanced mode toggle.

Each phase is shippable independently and reduces risk while moving toward a Stream Deck–first experience.


