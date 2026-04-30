# Task 2-b: Batch Operations & Multi-Select for Table Rows

## Agent: Batch Operations Agent
## Status: Completed

## Work Log

### 1. Added New Imports
- Added `BookmarkPlus`, `BookmarkMinus`, `Copy`, `Check`, `Minus` from `lucide-react`
- Added `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuSeparator` from `@/components/ui/context-menu`

### 2. Row Selection State
- Added `selectedRows: Set<string>` state (set of PDB IDs)
- Added `useEffect` to clear selection when switching weeks or modes
- Added selection state computed values: `allPageSelected`, `somePageSelected`

### 3. Checkbox Column
- Added checkbox column as the first column in the weekly table (before the bookmark column)
- Header checkbox: custom button with three states (unchecked, checked with Check icon, indeterminate with Minus icon)
- Individual row checkboxes: using shadcn/ui `Checkbox` component with `data-[state=checked]:bg-claude-accent` styling
- Row checkbox click stops propagation to prevent opening detail panel
- Selected rows get subtle highlight: `bg-claude-accent/5 dark:bg-[#d4784f]/5`
- Updated loading skeleton column count from 2+ to 3+ to account for new checkbox column

### 4. Batch Action Bar
- Floating action bar at `fixed bottom-4 left-1/2 -translate-x-1/2 z-50`
- AnimatePresence with spring animation (y: 60 → 0, stiffness: 400, damping: 30)
- Contains:
  - Selection count: "{n} structures selected"
  - "Bookmark All" button (BookmarkPlus icon) with accent styling
  - "Remove Bookmarks" button (BookmarkMinus icon) with muted styling
  - "Export Selected" button (Download icon) - exports only selected rows as CSV
  - "Clear Selection" button (X icon)
- Style: `bg-white dark:bg-[#242220] border border-claude-border rounded-xl shadow-2xl px-4 py-2.5`
- Only shown when `selectedRows.size > 0` and `mode === 'weekly'`

### 5. Select All Across Pages
- When all rows on current page are selected AND total entries > page size, shows a link:
  "Select all {total} structures" below the action bar
- Clicking it calls `selectAllRows()` which selects all entries in `sortedEntries`

### 6. Right-Click Context Menu
- Wrapped each weekly table row in `<ContextMenu>` + `<ContextMenuTrigger asChild>`
- Context menu options:
  - "View Details" (Eye icon) - opens detail panel
  - "Bookmark / Remove Bookmark" (BookmarkPlus/BookmarkMinus icon) - toggles bookmark
  - "Copy PDB ID" (Copy icon) - copies to clipboard with toast notification
  - "Open in RCSB PDB" (ExternalLink icon) - opens in new tab
  - "Export Row" (Download icon) - exports single row as CSV
- Claude aesthetic styling: rounded-md, focus:bg-claude-accent-light, text-xs

### 7. Integration with Existing Features
- Selection persists across page changes (within same week)
- Selection cleared when switching weeks or modes
- Batch bookmark operations update bookmarks state and show appropriate toasts
- Added "selected" filter chip in toolbar showing count with X to clear
- Batch export generates CSV with same format as regular export
- `handleExportRowCsv` added for single-row export from context menu

### 8. Lint Check
- Lint passes with no errors
- Dev server compiles successfully
