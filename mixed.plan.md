<!-- 577ed2d6-2314-4cd3-ae85-4f8164fdb23a 7286a75e-35d6-479f-9c5d-82574a1e94bd -->
# Implement mixed-library selection, accurate preview, and gated design controls

### What we'll do

- **Mixed-library packs**: Store selections as full IDs (`"prefix:icon"`), preview/export combine all.
- **Accurate preview**: For Pack Preview and selected tiles only, render sanitized SVGs using the same styling rules as export; grid remains fast.
- **Gated controls**: Add capability flags per library (e.g., `supportsStroke`, `supportsCurrentColor`) and disable/show unusable state accordingly.
- **Persist state**: Save/rehydrate pack state (name, style, selections, current library) to `localStorage`.

### Key changes

- **State model** (`app/page.tsx`):
  - Change `selectedIcons: string[]` to `selectedIconIds: string[]` storing `"prefix:icon"`.
  - Persist entire state to `localStorage` (e.g., `sd-pack-state-v2`).
- **Icon grid** (`components/icon-grid.tsx`):
  - Build IDs from current library prefix when toggling; check selection by full ID.
  - Only selected tiles use accurate preview; others use current `<Icon>` fast path.
- **Icon renderer** (`components/icon-renderer.tsx`):
  - Add `accurate?: boolean` prop; when true, fetch SVG via `getIconSVG`, apply style, render `<img src="data:image/svg+xml,...">`; container still applies background, radius, glow/shadow, padding.
- **SVG styling util** (`lib/export.ts`):
  - Extract shared `applyStyleToSvg(svg, styleConfig, pixelSize)` used by both export and preview.
- **Export flow** (`components/export-panel.tsx`, `lib/export.ts`):
  - Accept `selectedIconIds` (full IDs). Parse per icon, fetch by its prefix, name. Use `styleConfig.iconSize || 144`.
  - File naming: include prefix to avoid collisions (e.g., `"{prefix}-{name}.png"`) and reflect in `pack.json`.
- **Library capabilities** (`components/library-selector.tsx`):
  - Add flags on each entry (heuristic defaults). Export them for consumers.
- **Design tab gating** (`components/sidebar.tsx`):
  - Disable Stroke Width slider when `supportsStroke=false` with tooltip. Icon Color remains enabled; add hint if preview accuracy differs (but selected/preview will be accurate now).
  - Wire Icon Size buttons to `styleConfig.iconSize` and use in preview/export.
- **Polish**:
  - Default active tab to Design.
  - Replace dynamic color input creation with a hidden `<input type="color">` for each color.
  - (Optional) Debounce search input.

### Affected files

- `app/page.tsx` (state model, persistence)
- `components/icon-grid.tsx` (ID toggling, accurate preview on selected)
- `components/icon-renderer.tsx` (accurate mode)
- `components/pack-preview.tsx` (use ID parsing, accurate preview)
- `components/export-panel.tsx` (pass IDs, counts)
- `components/library-selector.tsx` (capabilities)
- `components/sidebar.tsx` (gated controls, icon size wiring, default tab)
- `lib/export.ts` (refactor styling logic, file naming)
- `lib/iconify.ts` (helpers: parse/join icon IDs)

### Essential snippets (concise)

- **ID helpers** (`lib/iconify.ts`):
```ts
export const joinIconId = (prefix: string, name: string) => `${prefix}:${name}`
export const parseIconId = (id: string) => {
  const [prefix, ...rest] = id.split(":");
  return { prefix, name: rest.join(":") };
}
```

- **Apply style to SVG** (`lib/export.ts`):
```ts
export function applyStyleToSvg(svg: string, cfg: StyleConfig, px: number) {
  let s = svg
    .replace(/fill="[^"]*"/g, `fill="${cfg.foregroundColor}"`)
    .replace(/stroke="[^"]*"/g, `stroke="${cfg.foregroundColor}"`)
    .replace(/stroke-width="[^"]*"/g, `stroke-width="${cfg.strokeWidth}"`);
  if (!/fill=/.test(s)) s = s.replace(/<svg/, `<svg fill="${cfg.foregroundColor}"`);
  if (!/stroke=/.test(s)) s = s.replace(/<svg/, `<svg stroke="${cfg.foregroundColor}"`);
  if (!/stroke-width=/.test(s)) s = s.replace(/<svg/, ` stroke-width="${cfg.strokeWidth}"`);
  s = s.replace(/width="[^"]*"/, `width="${px}"`).replace(/height="[^"]*"/, `height="${px}"`);
  return s;
}
```

- **Export signature** (`lib/export.ts`):
```ts
export async function exportIconPack(
  packName: string,
  selectedIconIds: string[],
  styleConfig: StyleConfig,
  onProgress?: (current: number, total: number) => void,
): Promise<void>
```

### To-dos

- [x] Store selections as full IDs (prefix:icon) and rehydrate from localStorage
- [x] Add join/parse helpers for icon IDs in lib/iconify.ts
- [x] Extract applyStyleToSvg from export.ts and reuse in preview
- [x] Update export flow to handle per-icon prefixes and size
- [x] Include prefix in PNG filenames and pack.json entries
- [x] Add accurate mode to IconRenderer using sanitized SVG image
- [x] Update PackPreview to use accurate preview and parse IDs
- [x] Render selected tiles with accurate preview; keep others fast
- [x] Add supportsStroke/supportsCurrentColor flags to ICON_LIBRARIES
- [x] Disable or hint controls per library capabilities in Sidebar
- [x] Wire Icon Size to styleConfig.iconSize and use in preview/export
- [x] Persist pack state (name, style, selection, library) to localStorage
- [x] Make Design the default active tab
- [x] Replace dynamic color inputs with hidden native color inputs
- [ ] Debounce search input in IconGrid (optional - skipped)

