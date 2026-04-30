# Task 3-a and 3-b: PDB Entry Notes/Annotations + Week Diff View

## Agent: Notes & Diff Feature Agent

## Work Completed

### Feature 1: PDB Entry Notes/Annotations (localStorage-based)
- Added `entryNotes` state (`Record<string, string>`) initialized from localStorage key `pdb-tracker-notes`
- Added `noteSavedIndicator` state for the "✓ Saved" indicator
- Added `useEffect` to persist notes to localStorage on change
- Added `updateNote(pdbId, note)` callback using `useCallback` — saves note, shows indicator for 2s, fires toast
- Changed entries fetch to NOT send search query to API — now does client-side search filtering that includes notes text
- Added `StickyNote` icon in detail panel header when note exists
- Added Notes section in detail panel with:
  - Textarea (3 rows) with placeholder
  - Pre-filled with `defaultValue`
  - Auto-save on blur with change detection
  - "✓ Saved" indicator with motion animation (2s timeout)
- Added notes count filter chip with amber styling
- Added `StickyNote` icon in table row next to PDB ID when entry has note

### Feature 2: Week Diff View
- Added `diffMode` boolean state
- Added `prevWeekEntries` state
- Added `prevWeekId` useMemo finding previous week from sorted snapshots
- Added `useEffect` to fetch previous week entries when diff mode active
- Added `diffResult` useMemo computing newIds, removedIds, unchangedIds, removedEntries
- Added "Diff" button in toolbar with `GitDiff` icon, active/inactive styling, toast notifications
- Added Diff Mode Summary bar: colored dots with counts, previous week ID, warning if no prev week
- Added green left border + "NEW" badge on table rows for new entries
- Added "Removed Entries" section below table: red-styled cards with REMOVED badges, PDB ID links, method/resolution info
- Added Diff filter chip with green styling and X to clear
- Wrapped weekly table and diff section in React fragment `<>`

## Files Modified
- `/home/z/my-project/src/components/pdb-tracker.tsx` — Added both features
- `/home/z/my-project/worklog.md` — Appended work record

## Lint Status
- Passes cleanly with no errors
