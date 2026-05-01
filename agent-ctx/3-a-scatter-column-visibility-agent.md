# Task 3-a and 3-b: Scatter Plot & Column Visibility Agent

## Work Record

**Task ID**: 3-a and 3-b
**Agent**: Scatter Plot & Column Visibility Agent
**Task**: Add Resolution vs IF Scatter Plot and Column Visibility Toggle

### Work Log

- Read worklog.md and full pdb-tracker.tsx (~3500+ lines) to understand current structure
- **Part 1: Resolution vs IF Scatter Plot (Task 3-a)**
  - Added `ScatterChart, Scatter, ZAxis` to recharts imports
  - Created `ClaudeScatterTooltip` component near other custom tooltip components:
    - Shows PDB ID (font-mono, claude-accent), method badge with color
    - Shows title (line-clamp-2), resolution (color-coded), IF value
    - Full dark mode support (bg-[#2b2926], text-[#e8e4dd])
  - Added `scatterData` useMemo in WeeklySummary component:
    - Maps entries to `{ pdbId, resolution, journalIf, method, ifTier, title }`
    - Filters out entries with null resolution or null journalIf
  - Added `scatterMaxIf` useMemo for Y-axis domain (max IF + 10)
  - Added scatter plot chart in WeeklySummary AFTER "Weekly Trends" and BEFORE "Method Details":
    - Uses recharts ScatterChart with XAxis (Resolution, 0-5Å) and YAxis (IF, 0-max+10)
    - ZAxis maps ifTier to point size range
    - Each dot colored by method: Cryo-EM (#2d8f8f), X-ray (#7c5cbf), NMR (#c9872e), Other (#6b7280)
    - Point size based on ifTier: top=6, high=5, mid=4, low=3
    - Custom ClaudeScatterTooltip showing PDB ID, resolution, IF, method, title
    - CartesianGrid with dark/light mode stroke colors
    - Legend row below chart showing method colors
    - Height: 200px with ResponsiveContainer
    - Container: `bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-[10px] p-3`
- **Part 2: Column Visibility Toggle (Task 3-b)**
  - Added `Columns3` icon import from lucide-react
  - Added `DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator` imports
  - Added `hiddenColumns` state as `Set<string>`, initialized from localStorage (`pdb-hidden-columns`) with try/catch fallback
  - Added `useEffect` to persist hiddenColumns to localStorage on every change
  - Added `toggleColumnVisibility(field)` callback using `useCallback`
  - Added Columns dropdown button in weekly mode toolbar (after "structures" count, before Export button):
    - DropdownMenuTrigger with Columns3 icon and "Columns" text
    - Styled same as Export button
    - DropdownMenuContent (w-48, align="end") with:
      - DropdownMenuLabel "Toggle Columns"
      - DropdownMenuSeparator
      - PDB ID checkbox (always checked, disabled)
      - Method, Resolution, IF (Impact Factor), Organism, Title, Date, Ligands checkboxes
      - Each checkbox: `checked={!hiddenColumns.has(col.field)}`, `onCheckedChange={() => toggleColumnVisibility(col.field)}`
  - Updated weekly table headers: `.filter(col => !hiddenColumns.has(col.field))` on column array
  - Updated weekly table body: wrapped each conditional `<td>` with `{!hiddenColumns.has('field') && (...)}`
  - Updated weekly loading skeleton: filtered header array by hiddenColumns, dynamic cols count
  - Updated evaluation table headers: `.filter(col => !hiddenColumns.has(col.field))` on column array
  - Updated evaluation table body: wrapped conditional `<td>` elements
  - Updated evaluation loading skeleton: filtered header array by hiddenColumns, dynamic cols count
- Lint passes with no errors
- Dev server compiling successfully

### Stage Summary

- Resolution vs IF Scatter Plot added to WeeklySummary preview panel
- Custom ClaudeScatterTooltip with method color badges and dark mode
- Scatter dots colored by method, sized by IF tier
- Y-axis domain adapts to data (max IF + 10)
- Column Visibility dropdown in weekly toolbar with localStorage persistence
- 7 toggleable columns + PDB ID (always visible)
- Both weekly and evaluation tables respect column visibility
- Loading skeletons dynamically adjust to visible columns
- All existing functionality preserved
- No lint errors, no compilation errors
