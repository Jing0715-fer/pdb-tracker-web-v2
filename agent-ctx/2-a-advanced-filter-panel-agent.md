# Task 2-a: Advanced Filter Panel Agent

## Task
Add a comprehensive filter panel to the weekly mode that allows multi-dimensional filtering of PDB entries.

## Work Completed

### 1. New Imports Added
- `SlidersHorizontal`, `RotateCcw` icons from lucide-react
- `Slider` from `@/components/ui/slider` (Radix-based dual-handle slider)
- `Checkbox` from `@/components/ui/checkbox`

### 2. New State Variables
- `advancedFiltersOpen: boolean` (default: false)
- `resolutionRange: [number, number]` (default: [0, 5])
- `ifRange: [number, number]` (default: [0, 50])
- `selectedOrganisms: Set<string>` (default: empty)
- `dateRange: { from: string; to: string }` (default: { from: '', to: '' })

### 3. Computed Values
- `organismOptions`: Extracts unique organisms from current week's entries, sorted by count
- `activeAdvancedFilterCount`: Counts how many advanced filters differ from defaults

### 4. Callbacks
- `clearAdvancedFilters()`: Resets all advanced filters to defaults
- `toggleOrganism(organism)`: Toggles an organism in the selected set
- `toggleAllOrganisms()`: Select all / Clear all organisms

### 5. Filters Button in Toolbar
- Added "Filters" button with `SlidersHorizontal` icon next to "Compare" button
- Shows badge count when active advanced filters > 0
- Styled with accent color when active (matching Compare button pattern)

### 6. Collapsible Filter Panel
- Located below toolbar, above Weekly Stat Cards
- Uses `AnimatePresence` + `motion.div` with height animation (0 → auto)
- Background: `bg-white dark:bg-[#242220]` with border
- Contains:
  - **Active Filter Chips**: Shows current active filters with individual X buttons
  - **Clear All**: Button to reset all filters at once
  - **Resolution Range**: Dual-handle Slider (0–5Å, step 0.1) with claude accent color (#c96442)
  - **Impact Factor Range**: Dual-handle Slider (0–50, step 0.1) with claude accent color
  - **Organism Multi-Select**: Checkboxes with count, Select All/Clear toggle, max-h-32 scroll
  - **Date Range**: Two date inputs (from/to) with dark mode support

### 7. Filter Logic Integration
- Modified `sortedEntries` useMemo to apply all advanced filters with AND logic:
  - Resolution range filter
  - IF range filter
  - Organism filter (matches if any organism in entry's list is selected)
  - Date range filter (from/to comparison)
- Added advanced filter states to dependency array
- Added advanced filter states to page reset effect

### 8. Bug Fix
- Fixed pre-existing `WeeklyTimeline` undefined error by confirming existing definition is complete

## Lint Status
- `bun run lint` passes with no errors
- App compiles and responds with 200 status

## Files Modified
- `/home/z/my-project/src/components/pdb-tracker.tsx`
