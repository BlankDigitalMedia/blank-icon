# Agents Guide - Stream Deck Icon Pack Generator

## Project Overview

This is a **Stream Deck Icon Pack Generator** built with Next.js 16. The application allows users to:
- Select icons from various icon libraries (Lucide, Material Symbols, Heroicons, etc.)
- Customize icon styling (stroke width, colors, background shapes, padding, effects)
- Preview icon packs in real-time
- Export complete icon packs as ZIP files with metadata for Stream Deck Marketplace

## Tech Stack

- **Framework**: Next.js 16.0.0 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4.1.9 with custom CSS variables
- **UI Components**: Radix UI primitives via shadcn/ui (New York style)
- **Icons**: Lucide React (for UI icons), @iconify/react (for icon rendering)
- **Icon API**: Iconify API (https://api.iconify.design)
- **Export**: jszip for ZIP generation, Canvas API for PNG rendering
- **Notifications**: Sonner (toast notifications)
- **Analytics**: Vercel Analytics
- **Form Handling**: React Hook Form + Zod (available but not actively used yet)
- **Theme**: Dark theme with OKLCH color space

## Project Structure

```
/app
  ├── page.tsx          # Main page component (client-side)
  ├── layout.tsx        # Root layout with metadata and Toaster
  └── globals.css       # Global styles and CSS variables

/components
  ├── header.tsx              # Top header bar
  ├── sidebar.tsx             # Left sidebar with AI chat and design controls
  ├── icon-grid.tsx           # Main icon selection grid (fetches from Iconify)
  ├── icon-renderer.tsx       # Reusable icon rendering component
  ├── pack-preview.tsx         # Preview of selected icons
  ├── export-panel.tsx         # Export controls with ZIP generation
  ├── library-selector.tsx     # Icon library selection dialog
  └── ui/                     # shadcn/ui components
      ├── button.tsx
      ├── dialog.tsx
      ├── input.tsx
      ├── label.tsx
      ├── scroll-area.tsx
      ├── slider.tsx
      └── textarea.tsx

/lib
  ├── utils.ts         # Utility functions (cn helper for className merging)
  ├── types.ts         # Shared TypeScript interfaces (StyleConfig, IconLibrary, IconData)
  ├── iconify.ts       # Icon fetching and caching utilities
  └── export.ts         # Export utilities (ZIP generation, PNG rendering, pack.json)
```

## Key Components

### `app/page.tsx` - Main Page
- **Client Component**: Yes (`"use client"`)
- **State Management**: Local React state
- **Key State**:
  - `currentLibrary`: Currently selected icon library (default: "lucide")
  - `packName`: Name of the icon pack for export
  - `selectedIcons`: Array of selected icon names
  - `styleConfig`: Object containing all styling options

### `components/sidebar.tsx` - Sidebar
- **Tabs**: AI Chat (future) and Design (active)
- **Design Tab Controls**:
  - Pack Settings (name, library selector, icon size)
  - Style Controls (stroke width, colors, background shape, padding, effects)
- **Props**: Receives styleConfig, selectedIcons, library state, and packName from parent

### `components/icon-grid.tsx` - Icon Selection
- **Features**: Search, toggle selection, visual preview with current styling
- **Icons**: Fetches icons dynamically from Iconify API based on selected library
- **Loading States**: Shows loading spinner while fetching icons
- **Error Handling**: Displays error message if icon fetch fails
- **Styling**: Uses IconRenderer component to apply styleConfig to preview icons

### `components/icon-renderer.tsx` - Icon Rendering Component
- **Purpose**: Reusable component for rendering icons from Iconify
- **Props**: iconName, prefix, styleConfig, size, className
- **Features**: Applies all styleConfig properties (colors, shapes, padding, effects)
- **Error Handling**: Shows placeholder on icon load failure

### `components/pack-preview.tsx` - Preview Section
- **Display**: Shows first 16 selected icons in a grid
- **Styling**: Uses IconRenderer component to apply all styleConfig properties
- **Library Support**: Renders icons from currently selected library

### `components/export-panel.tsx` - Export Controls
- **Features**: Preview JSON dialog, Export ZIP functionality
- **Status**: Fully functional
- **Export Process**:
  1. Fetches SVG for each selected icon from Iconify API
  2. Renders each icon to PNG canvas with applied styling
  3. Generates pack.json metadata file
  4. Bundles all files into ZIP archive
  5. Triggers browser download
- **Loading States**: Shows progress during export (X of Y icons)
- **Error Handling**: Toast notifications for errors

### `components/library-selector.tsx` - Library Selection
- **Libraries**: Supports 12+ Iconify collections (Lucide, Material Symbols, Heroicons, Tabler, etc.)
- **UI**: Dialog with searchable list
- **Data**: ICON_LIBRARIES array exported for use in other components
- **Functionality**: Library selection updates icon grid immediately

## State Management Pattern

The application uses **lifted state** pattern:
- All state lives in `app/page.tsx`
- State is passed down as props to child components
- Child components receive both state and setter functions
- No global state management library (Redux, Zustand, etc.)

**State Shape**:
```typescript
{
  currentLibrary: string
  packName: string
  selectedIcons: string[]
  styleConfig: {
    strokeWidth: number
    foregroundColor: string
    backgroundColor: string
    backgroundShape: "circle" | "rounded" | "square"
    padding: number
    effect: "shadow" | "glow" | "none"
  }
}
```

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
- **IconLibrary**: Interface for icon library metadata
- **IconData**: Interface for icon information
- **Usage**: Import types across components for consistency

### `lib/iconify.ts` - Icon Fetching Utilities
- **fetchIconList(prefix)**: Fetches list of icons from Iconify API for a given prefix
- **getIconSVG(prefix, iconName)**: Fetches SVG data for a specific icon
- **normalizeIconName(name)**: Normalizes icon names for consistent formatting
- **Caching**: Both functions cache results in localStorage with 24-hour expiry

### `lib/export.ts` - Export Utilities
- **renderIconToCanvas(svgString, styleConfig, size)**: Renders SVG icon to PNG Blob with styling applied
- **generatePackJSON(packName, selectedIcons, styleConfig)**: Creates Stream Deck pack.json metadata
- **generateZIP(packName, selectedIcons, iconBlobs, packJSON)**: Bundles icons and metadata into ZIP
- **downloadPack(blob, packName)**: Triggers browser download of ZIP file
- **exportIconPack(...)**: Main export function that orchestrates the entire export process

## Key Patterns & Conventions

### Component Structure
1. **Client Components**: All interactive components use `"use client"` directive
2. **TypeScript**: Strict typing with interfaces for all props
3. **Icons**: Import from `lucide-react` for UI icons
4. **Naming**: PascalCase for components, camelCase for functions/variables

### Icon Handling
- **Current State**: Icons are fetched dynamically from Iconify API
- **Integration**: Uses `@iconify/react` for rendering and Iconify API for fetching
- **Library Support**: Fully functional - library selection updates icon grid
- **Caching**: Icon lists and SVG data cached in localStorage (24-hour expiry)
- **Rendering**: IconRenderer component applies all styleConfig properties
- **API Endpoints**:
  - Icon list: `https://api.iconify.design/collection?prefix=${prefix}`
  - Icon SVG: `https://api.iconify.design/${prefix}/${iconName}.svg`

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

1. **AI Chat**: UI exists but functionality not implemented
2. **Icon Size Selection**: UI buttons exist but not yet wired to state/export
3. **Custom Icons**: "Add Custom Icon" button exists but not functional
4. **Icon Search**: Basic string matching - could be enhanced with fuzzy search
5. **Performance**: Large icon lists could benefit from virtualization
6. **Error Recovery**: Could add retry logic for failed icon fetches

## Dependencies to Know

- **@radix-ui/***: Base primitives for shadcn/ui components
- **@iconify/react**: Icon rendering library (renders icons from Iconify API)
- **jszip**: ZIP file generation for export functionality
- **lucide-react**: Icon library for UI icons
- **sonner**: Toast notifications (configured for top-right, dark theme, richColors)
- **next-themes**: Available but not actively used (theme switching not implemented)
- **tailwind-merge + clsx**: For className merging (`cn` utility)

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
3. **Styling consistency**: Use existing CSS variables and Tailwind classes
4. **Icon rendering**: Icons are now fully functional - use IconRenderer component for consistent rendering
5. **Icon fetching**: Icons are cached in localStorage - check `lib/iconify.ts` for caching logic
6. **Export functionality**: Export is fully implemented - see `lib/export.ts` for utilities
7. **Client components**: All interactive components must be client components (`"use client"`)
8. **No test pages**: User preference - don't create test pages unless explicitly requested
9. **Modern UI**: User prefers premium, modern look without childish styling or emojis
10. **Type safety**: Use shared types from `lib/types.ts` for consistency

