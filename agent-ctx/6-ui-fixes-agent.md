# Task 6: UI Fixes for PDB Tracker

## Summary
Fixed four UI issues in the PDB Tracker app: preview panel scrolling, dark mode styling, responsive breakpoints, and added a Details tab to the preview panel.

## Changes Made

### 1. Preview Panel Scrolling
- Changed `overflow-hidden` to `overflow-y-auto` on the preview panel content wrapper div
- Added `preview-scroll` class for consistent scrollbar styling

### 2. Dark Mode Fixes
- Organism chips: added `dark:bg-[#2b2926]`
- Resolution bar: added `dark:bg-claude-border`
- Skeleton rows: added `dark:border-[#3d3832]`
- Table row borders: added `dark:border-[#3d3832]`
- BLAST results table: added `dark:border-[#3d3832]/50`
- Organism tooltip: theme-aware with `bg-claude-surface dark:bg-[#2b2926]`
- PDB tooltip popover: added `dark:border-[#4a4540] dark:bg-[#242220]`
- Ligand popovers (3): added `dark:border-[#4a4540] dark:bg-[#242220]`

### 3. Responsive Design
- Changed all `xl:` breakpoints to `lg:` for sidebar, preview panel, mobile overlays, and toggle buttons
- This makes the sidebar and preview panel visible on screens >= 1024px instead of >= 1280px

### 4. Details Tab in Preview Panel
- Added "Details" tab between Summary and Timeline tabs
- Full details view with: header, tags, 3D viewer, title, quality score, resolution, journal, date, organisms, ligands, authors, links, and "Open Full Detail View" button
- Row clicks and timeline entry selections now switch to the Details tab
- Empty state shows "Click a row to view entry details"

## Files Modified
- `/home/z/my-project/src/components/pdb-tracker.tsx` - All UI changes

## Verification
- `bun run lint` passes with no errors
- Dev server compiles successfully
