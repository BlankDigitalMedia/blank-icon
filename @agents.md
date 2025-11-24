# Agents Guide - Stream Deck Icon Pack Generator

## Project Overview

This is a **Stream Deck Icon Pack Generator** built with Next.js 16. The application allows users to:
- Browse curated Stream Deck-focused icon sets (Recommended mode) or access full Iconify libraries (Advanced mode)
- Select icons from various icon libraries (Lucide, Material Symbols, Heroicons, etc.)
- Customize icon styling (stroke width, colors, background shapes, padding, effects)
- Preview icon packs in real-time
- Export complete icon packs as ZIP files with metadata for Stream Deck Marketplace

## Tech Stack

- **Framework**: Next.js 16.0.0 (App Router, Turbopack enabled)
- **React**: 19.2.0
- **TypeScript**: 5.x (strict mode, isolatedModules enabled)
- **Styling**: Tailwind CSS 4.1.9 with custom CSS variables and @theme inline
- **UI Components**: Radix UI primitives via shadcn/ui (New York style)
- **Icons**: Lucide React (UI icons), @iconify/react (icon rendering)
- **Icon API**: Iconify API (https://api.iconify.design) with localStorage caching
- **Export**: JSZip for ZIP generation, Canvas API for PNG rendering
- **Notifications**: Sonner (top-right, richColors, dark theme)
- **Analytics**: Vercel Analytics
- **Form Handling**: React Hook Form + Zod (available but not actively used)
- **Theme**: Dark theme with OKLCH color space and sidebar-specific tokens
- **Build**: Turbopack for development, standard Next.js build for production

## Project Structure

```
/app
  ├── page.tsx          # Main page component (client-side state management)
  ├── layout.tsx        # Root layout with metadata and Toaster
  └── globals.css       # Global styles, OKLCH colors, Tailwind @theme

/components
  ├── header.tsx              # Top header bar with quick export
  ├── sidebar.tsx             # Left sidebar with AI chat and design controls
  ├── icon-grid.tsx           # Icon selection grid for Advanced mode (virtualized)
  ├── curated-grid.tsx        # Curated icon selection grid for Recommended mode
  ├── icon-renderer.tsx       # Reusable icon rendering (fast/accurate modes)
  ├── pack-preview.tsx        # Preview of selected icons (accurate rendering)
  ├── export-panel.tsx        # Export controls with ZIP generation
  ├── library-selector.tsx    # Icon library selection dialog (12 libraries)
  └── ui/                     # shadcn/ui components (7 components)
      ├── button.tsx          # Button component
      ├── dialog.tsx          # Modal dialogs
      ├── input.tsx           # Form inputs
      ├── label.tsx           # Form labels
      ├── scroll-area.tsx     # Custom scrollbars
      ├── slider.tsx          # Range sliders
      └── textarea.tsx        # Text areas

/lib
  ├── utils.ts         # Utility functions (cn helper for className merging)
  ├── types.ts         # Shared TypeScript interfaces (StyleConfig, IconLibrary, CuratedIcon)
  ├── iconify.ts       # Icon fetching and caching utilities (24h expiry)
  ├── curated-sets.ts  # Curated icon sets (61 icons across 3 categories)
  └── export.ts        # Export utilities (foreground-only SVG styling, canvas rendering)
```

## Key Components

### `app/page.tsx` - Main Page
- **Client Component**: Yes (`"use client"`)
- **State Management**: Local React state with localStorage persistence
- **Persistence**: Automatically saves/loads state from localStorage (key: `sd-pack-state-v2`)
- **Key State**:
  - `mode`: Current browsing mode - `"recommended"` (curated sets) or `"advanced"` (full Iconify libraries) (default: `"recommended"`)
  - `currentLibrary`: Currently selected icon library (default: "lucide") - only relevant in Advanced mode
  - `packName`: Name of the icon pack for export
  - `selectedIconIds`: Array of selected icon IDs in format `prefix:name` (e.g., `"lucide:home"`)
  - `styleConfig`: Object containing all styling options
- **State Shape**: `PackState` interface defines the persisted state structure
- **Conditional Rendering**: Renders `CuratedGrid` when `mode === "recommended"`, `IconGrid` when `mode === "advanced"`

### `components/sidebar.tsx` - Sidebar
- **Tabs**: AI Chat (future) and Design (active)
- **Design Tab Controls**:
  - Pack Settings (name, mode toggle, library selector)
  - Mode Toggle: Recommended (curated sets) vs Advanced (full Iconify libraries)
  - Library Selector: Only visible in Advanced mode
  - Style Controls (stroke width, colors, background shape, padding, effects)
- **Stroke Support**: Automatically disables stroke width control for libraries that don't support it (e.g., Material Symbols)
- **Props**: Receives styleConfig, selectedIconIds, library state, packName, mode, and setMode from parent

### `components/icon-grid.tsx` - Icon Selection (Advanced Mode)
- **Mode**: Used in Advanced mode for browsing full Iconify libraries
- **Features**: Search, toggle selection, visual preview with current styling, virtualization for performance
- **Icons**: Fetches icons dynamically from Iconify API based on selected library
- **Icon IDs**: Uses `joinIconId(prefix, name)` to create consistent icon IDs (`prefix:name` format)
- **Loading States**: Shows loading spinner while fetching icons
- **Error Handling**: Displays error message if icon fetch fails
- **Styling**: Uses IconRenderer component to apply styleConfig to preview icons
- **Selection**: Toggles icons by adding/removing icon IDs from selectedIconIds array
- **Virtualization**: Implements custom windowing for large icon lists:
  - Only renders visible icons + buffer rows above/below viewport
  - Calculates visible range based on scroll position and viewport height
  - Uses spacer divs to maintain correct scroll position
  - Constants: 6 columns, ~130px row height, 3 buffer rows, min 18 icons for virtualization

### `components/curated-grid.tsx` - Curated Icon Selection (Recommended Mode)
- **Mode**: Used in Recommended mode for browsing curated Stream Deck-focused icon sets
- **Features**: Search, toggle selection, visual preview with current styling, grouped by category
- **Icons**: Uses pre-defined curated icon sets from `lib/curated-sets.ts`
- **Categories**: Icons grouped by category (System, Streaming, Actions)
- **Icon IDs**: Uses Iconify-compatible IDs (`prefix:name` format) for compatibility with export pipeline
- **Styling**: Uses IconRenderer component to apply styleConfig to preview icons
- **Selection**: Toggles icons by adding/removing icon IDs from selectedIconIds array (same format as IconGrid)
- **No Virtualization**: Curated sets are small enough to render all icons at once

### `components/icon-renderer.tsx` - Icon Rendering Component
- **Purpose**: Reusable component for rendering icons from Iconify with background shapes and effects
- **Props**: iconName, prefix, styleConfig, size, className, accurate (boolean)
- **Features**:
  - Applies all styleConfig properties (colors, shapes, padding, effects)
  - Background rendering: Uses CSS to simulate backgroundShape, shadow/glow effects (mirroring canvas export)
  - Supports two rendering modes:
    - **Fast mode** (`accurate=false`): Uses `@iconify/react` with color/stroke override based on library capabilities
    - **Accurate mode** (`accurate=true`): Fetches SVG, applies precise styling via `applyStyleToSvg()`, renders as sanitized image
  - Library-aware styling: Respects `styleMode` ("stroke", "fill", "mixed") and `supportsStroke` flags
  - Border radius calculation: Matches canvas export logic for consistent appearance
  - Effect simulation: CSS box-shadow for shadow/glow effects
- **Stroke Detection**: Uses library capability matrix to determine stroke application
- **Error Handling**: Shows placeholder ("?") on icon load failure
- **Foreground-only SVG**: In accurate mode, SVG contains only icon data (background handled by wrapper)

### `components/pack-preview.tsx` - Preview Section
- **Display**: Shows first 16 selected icons in an 8-column grid
- **Styling**: Uses IconRenderer component with `accurate=true` for precise preview
- **Library Support**: Renders icons from multiple libraries (parses icon IDs to get prefix)
- **Removal**: Each icon has a remove button (X) that appears on hover
- **Icon Parsing**: Uses `parseIconId()` to extract prefix and name from icon IDs

### `components/export-panel.tsx` - Export Controls
- **Features**: Preview JSON dialog with copy functionality, Export ZIP functionality
- **Status**: Fully functional
- **Export Process**:
  1. Fetches SVG for each selected icon from Iconify API
  2. Renders each icon to PNG canvas (144×144px) with applied styling
  3. Generates pack.json metadata file
  4. Bundles all files into ZIP archive
  5. Triggers browser download
- **Loading States**: Shows progress during export (X of Y icons)
- **Error Handling**: Toast notifications for errors
- **JSON Preview**: Dialog shows formatted pack.json with copy-to-clipboard button

### `components/header.tsx` - Header Component
- **Purpose**: Top navigation bar with title and quick export button
- **Features**: 
  - Displays app title and description
  - Quick export button (duplicates ExportPanel functionality)
  - Shows export progress when exporting
- **Props**: Receives selectedIconIds, styleConfig, and packName

### `components/library-selector.tsx` - Library Selection
- **Libraries**: Supports 12 Iconify collections with full capability matrix:
  - **Lucide** (1,400+): Stroke-based, consistent outlines
  - **Material Symbols** (2,500+): Fill-based, Google's Material Design
  - **Heroicons** (300+): Stroke-based, Tailwind Labs
  - **Tabler** (4,900+): Stroke-based, pixel-perfect
  - **Phosphor** (6,000+): Mixed, flexible family with weights
  - **Carbon** (2,000+): Fill-based, IBM's design system
  - **Iconoir** (1,500+): Stroke-based, simple and definitive
  - **Solar** (7,000+): Fill-based, bold/outlined styles
  - **MingCute** (2,800+): Fill-based, carefully crafted
  - **Fluent** (12,000+): Fill-based, Microsoft design
  - **MDI** (7,000+): Fill-based, Material Design community
  - **Simple Icons** (3,000+): Fill-based, brand logos
- **UI**: Dialog with searchable list showing library name, description, and icon count
- **Visibility**: Only shown in Advanced mode (hidden in Recommended mode)
- **Capability Matrix**: Each library includes comprehensive metadata:
  - `styleMode`: "stroke" (Lucide, Heroicons, Tabler, Iconoir), "fill" (Material Symbols, Carbon, Solar, MingCute, Fluent, MDI, Simple Icons), "mixed" (Phosphor)
  - `supportsStroke`: true for stroke-based libraries, false for fill-based
  - `supportsCurrentColor`: true for all libraries
  - `prefersBold`: true for Solar (bold styling), false for others
- **Functionality**: Library selection immediately updates icon grid and sidebar controls (Advanced mode only)

## State Management Pattern

The application uses **lifted state** pattern:
- All state lives in `app/page.tsx`
- State is passed down as props to child components
- Child components receive both state and setter functions
- No global state management library (Redux, Zustand, etc.)

**State Shape**:
```typescript
interface PackState {
  mode: "recommended" | "advanced"  // Browsing mode: curated sets vs full Iconify libraries
  currentLibrary: string             // Only relevant in Advanced mode
  packName: string
  selectedIconIds: string[]           // Format: "prefix:name" (e.g., "lucide:home")
  styleConfig: StyleConfig
}

interface StyleConfig {
  strokeWidth: number
  foregroundColor: string
  backgroundColor: string
  backgroundShape: "circle" | "rounded" | "square"
  padding: number
  effect: "shadow" | "glow" | "none"
}
```

**Persistence**:
- State is automatically saved to localStorage on every change
- State is loaded from localStorage on app initialization
- Storage key: `sd-pack-state-v2`
- Uses try/catch to handle storage errors gracefully

## Styling System

### Color System
- Uses **OKLCH color space** for better color manipulation
- Dark theme by default
- CSS variables defined in `globals.css`
- Tailwind CSS 4 with `@theme inline` directive

### Design Tokens
- **Border Radius**: `--radius: 0.5rem` (configurable)
- **Colors**: Semantic naming (background, foreground, card, primary, etc.)
- **Sidebar**: Dedicated sidebar color tokens

### Component Styling
- Uses Tailwind utility classes
- shadcn/ui components for consistent UI
- `cn()` utility from `lib/utils.ts` for conditional className merging

### `lib/types.ts` - Shared Type Definitions
- **StyleConfig**: Interface for all styling options (strokeWidth, colors, shapes, padding, effects)
- **IconLibrary**: Interface for icon library metadata:
  - `id`: Unique identifier
  - `name`: Display name
  - `description`: Library description
  - `iconCount`: String representation of icon count (e.g., "1,400+")
  - `prefix`: Iconify API prefix
  - `supportsStroke`: Whether library supports stroke width
  - `supportsCurrentColor`: Whether library supports currentColor
  - `styleMode`: Rendering approach ("stroke" | "fill" | "mixed")
  - `prefersBold`: Whether library prefers bold styling
- **IconData**: Interface for icon information (name, prefix, optional svg)
- **CuratedIcon**: Interface for curated icon sets (id, label, category)
- **Usage**: Import types across components for consistency

### `lib/curated-sets.ts` - Curated Icon Sets
- **Purpose**: Provides Stream Deck-focused curated icon collections organized by workflow
- **CuratedIcon Interface**: `{ id: string, label: string, category: string }`
- **Icon Sets**:
  - `SYSTEM_APPS` (21 icons): Common desktop apps and system icons
    - Browsers, terminals, editors, media players, utilities
  - `STREAMING_APPS` (20 icons): Streaming and content creation tools
    - Recording, cameras, microphones, playback controls, streaming platforms
  - `ACTION_ICONS` (20 icons): Common actions and controls
    - Power, refresh, navigation, editing, system controls
- **Total**: 61 curated icons across 3 categories
- **Icon IDs**: All use Iconify-compatible format (`prefix:name`) for seamless export integration
- **Categories**: "System", "Streaming", "Actions" for logical grouping
- **Helper Functions**:
  - `getCuratedIconsByCategory()`: Returns `Record<string, CuratedIcon[]>` for grouped rendering
  - `ALL_CURATED_ICONS`: Flat array combining all curated icons for search/filtering

### `lib/iconify.ts` - Icon Fetching Utilities
- **fetchIconList(prefix)**: Fetches list of icons from Iconify API for a given prefix
  - Handles both categorized and uncategorized icons from API response
  - Removes duplicates (icons may appear in multiple categories)
  - Returns flat array of icon names
- **getIconSVG(prefix, iconName)**: Fetches SVG data for a specific icon
  - Normalizes icon name before fetching
- **normalizeIconName(name)**: Converts icon names to lowercase with hyphens
- **joinIconId(prefix, name)**: Creates icon ID in format `prefix:name`
- **parseIconId(id)**: Parses icon ID to extract `{ prefix, name }`
- **Caching**: Both fetch functions cache results in localStorage with 24-hour expiry
  - Cache key format: `iconify_cache_list_${prefix}` or `iconify_cache_${prefix}_${iconName}`
  - Cache entries include timestamp for expiry checking

### `lib/export.ts` - Export Utilities
- **applyStyleToSvg(svg, styleConfig, pixelSize, styleMode?)**: Applies foreground-only styling to SVG string
  - **Foreground-only approach**: SVG contains only icon data, no background concerns
  - Uses DOMParser to safely modify SVG markup
  - Respects library capability matrix (`styleMode`: "stroke", "fill", "mixed")
  - For stroke mode: normalizes stroke attributes, removes conflicting fills
  - For fill mode: focuses on fill normalization, avoids artificial strokes
  - For mixed mode: intelligent handling of both stroke and fill elements
  - Sets root `fill` and `color` attributes for monochrome output
  - Handles gradient/pattern preservation (doesn't override `url(...)` fills)
  - Normalizes SVG dimensions for consistent rasterization
- **renderIconToCanvas(svgString, styleConfig, size, styleMode?)**: Renders foreground SVG to PNG with background
  - **Background-first pipeline**:
    1. Prepare canvas and compute padding (`paddingPx = (size * styleConfig.padding) / 100`)
    2. Draw background shape (circle/rounded/square) with `styleConfig.backgroundColor`
    3. Apply effects (shadow/glow) via canvas shadow properties
    4. Draw foreground SVG centered in padded area (`iconBoxSize = size - paddingPx * 2`)
    5. Reset shadows and return PNG blob
  - Border radius calculation matches preview rendering for consistency
  - Uses `applyStyleToSvg()` to get monochrome foreground SVG
- **generatePackJSON(packName, selectedIconIds, styleConfig)**: Creates Stream Deck pack.json metadata
  - Generates icon entries with normalized filenames (`prefix-name.png`)
  - Includes pack metadata (name, version: "1.0.0", author: "User", description)
  - File naming convention: `${prefix}-${normalizeIconName(name)}.png`
- **generateZIP(packName, selectedIconIds, iconBlobs, packJSON)**: Bundles icons and metadata into ZIP
  - Uses JSZip to create archive with all PNG files + pack.json
  - File naming: `${prefix}-${normalizedName}.png` for each icon
- **downloadPack(blob, packName)**: Triggers browser download of ZIP file
- **exportIconPack(packName, selectedIconIds, styleConfig, onProgress?)**: Main export orchestration
  - Fetches SVG for each selected icon using library prefix
  - Applies per-library styleMode for accurate rendering
  - Renders to canvas (144×144px default) with full styling pipeline
  - Progress callback for UI updates (current/total)
  - Comprehensive error handling per icon with descriptive messages

## Key Patterns & Conventions

### Component Structure
1. **Client Components**: All interactive components use `"use client"` directive
2. **TypeScript**: Strict typing with interfaces for all props
3. **Icons**: Import from `lucide-react` for UI icons
4. **Naming**: PascalCase for components, camelCase for functions/variables

### Icon Handling
- **Two Modes**: 
  - **Recommended Mode**: Browse curated Stream Deck-focused icon sets (60 icons, grouped by category)
  - **Advanced Mode**: Browse full Iconify libraries (thousands of icons per library)
- **Integration**: Uses `@iconify/react` for rendering and Iconify API for fetching
- **Icon ID System**: Icons are identified by `prefix:name` format (e.g., `"lucide:home"`)
  - Use `joinIconId(prefix, name)` to create IDs
  - Use `parseIconId(id)` to extract prefix and name
  - Both curated and Iconify icons use the same ID format for seamless export
- **Library Support**: Fully functional - library selection updates icon grid immediately (Advanced mode only)
- **Stroke Support**: Libraries declare `supportsStroke` property and `styleMode` ("stroke", "fill", "mixed")
  - Stroke width control is disabled/greyed out for fill-based libraries (Material Symbols, Carbon, etc.)
  - Sidebar controls adapt based on library capabilities (stroke controls hidden for fill-only libraries)
  - Export pipeline respects `styleMode` for accurate per-library rendering
- **Caching**: Icon lists and SVG data cached in localStorage (24-hour expiry)
- **Rendering**: IconRenderer component applies all styleConfig properties
  - Fast mode: Uses `@iconify/react` for quick previews
  - Accurate mode: Fetches SVG and applies precise styling for export/preview
- **API Endpoints**:
  - Icon list: `https://api.iconify.design/collection?prefix=${prefix}` (returns categorized + uncategorized)
  - Icon SVG: `https://api.iconify.design/${prefix}/${normalizedName}.svg`
- **Curated Icons**: Pre-defined icon sets in `lib/curated-sets.ts` - no API calls needed for icon list

### Color Picker Pattern
- Uses native HTML5 color input via programmatic click
- Pattern found in `sidebar.tsx` for foreground/background colors

## Development Guidelines

### Adding New Features

1. **New Components**: Place in `/components` directory
2. **UI Components**: Use shadcn/ui components from `/components/ui`
3. **State**: Add to `app/page.tsx` if needed globally, or keep local if component-specific
4. **Styling**: Use Tailwind classes and CSS variables from `globals.css`

### Code Style
- **TypeScript**: Always type props with interfaces
- **Imports**: Use `@/` alias for imports (configured in `tsconfig.json`)
- **Formatting**: Follow existing code style (no semicolons in JSX, etc.)

### Testing Considerations
- Components are client-side only
- State management is straightforward (no complex state logic)
- UI components are from shadcn/ui (well-tested)

## Known Limitations & TODOs

1. **AI Chat**: UI exists but functionality not implemented (tab exists with welcome message and input area)
2. **Custom Icons**: "Add Custom Icon" button exists in icon-grid and curated-grid but not functional
3. **Icon Search**: Basic string matching - could be enhanced with fuzzy search or advanced filtering
4. **Performance**: IconGrid uses custom virtualization for large icon lists; CuratedGrid renders all icons (61 icons, small enough)
5. **Error Recovery**: Could add retry logic for failed icon fetches with exponential backoff
6. **Export Size**: Currently fixed at 144×144px - no size selection UI (size parameter exists in export functions)
7. **Curated Sets**: Currently 61 icons across 3 categories - could be expanded with more Stream Deck-specific sets
8. **Icon Size Controls**: Size buttons exist in sidebar but are non-functional (only affect preview, not export)
9. **Theme Switching**: next-themes is installed but not implemented (dark theme hardcoded)

## Dependencies to Know

- **@radix-ui/***: Base primitives for shadcn/ui components (7 components used)
- **@iconify/react**: Icon rendering library with color/stroke override support
- **jszip**: ZIP file generation for export functionality
- **lucide-react**: Icon library for UI icons (Sparkles, Settings2, etc.)
- **sonner**: Toast notifications (top-right positioning, dark theme, richColors)
- **next-themes**: Available but not actively used (dark theme hardcoded)
- **tailwind-merge + clsx**: For className merging (`cn` utility in lib/utils.ts)
- **@vercel/analytics**: Web analytics (configured in layout.tsx)
- **@hookform/resolvers + react-hook-form + zod**: Available but not actively used
- **All other @radix-ui packages**: Installed but unused (technical debt opportunity)

## Path Aliases

Configured in `tsconfig.json`:
- `@/*` → `./*` (root directory)

Common imports:
- `@/components/*` - Components
- `@/lib/*` - Utilities
- `@/components/ui/*` - UI primitives

## Environment & Build

- **Node**: Requires Node.js 18+
- **Package Manager**: npm (package-lock.json present)
- **Dev Server**: `npm run dev` (Next.js dev server)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (ESLint)

## Notes for AI Agents

1. **Always check component props**: Components receive specific typed props - check interfaces before modifying
2. **State is lifted**: Changes to state management should happen in `app/page.tsx`
3. **State persistence**: State automatically persists to localStorage - no need to manually save
4. **Mode awareness**: Check `mode` state when implementing features - Recommended vs Advanced have different UIs
5. **Icon IDs**: Always use `selectedIconIds` (not `selectedIcons`) - format is `prefix:name`
6. **Icon ID utilities**: Use `joinIconId()` and `parseIconId()` from `lib/iconify.ts` for consistency
7. **Curated icons**: Curated icons use same ID format as Iconify icons - export pipeline works identically
8. **Styling consistency**: Use existing CSS variables and Tailwind classes
9. **Icon rendering**: Use IconRenderer component for consistent rendering
   - Use `accurate={true}` for preview/export (slower but precise)
   - Use `accurate={false}` for grid previews (faster)
10. **Icon fetching**: Icons are cached in localStorage - check `lib/iconify.ts` for caching logic
11. **Export functionality**: Export is fully implemented - see `lib/export.ts` for utilities
12. **Client components**: All interactive components must be client components (`"use client"`)
13. **No test pages**: User preference - don't create test pages unless explicitly requested
14. **Modern UI**: User prefers premium, modern look without childish styling or emojis
15. **Type safety**: Use shared types from `lib/types.ts` for consistency
16. **Library stroke support**: Check `library.supportsStroke` before applying stroke-related styling
17. **SVG styling**: Use `applyStyleToSvg()` from `lib/export.ts` for accurate SVG styling (respects stroke vs fill)
18. **Grid selection**: Use CuratedGrid for Recommended mode, IconGrid for Advanced mode - both share same `selectedIconIds` state
19. **Library selector**: Only show library selector in Advanced mode (hidden in Recommended mode)

