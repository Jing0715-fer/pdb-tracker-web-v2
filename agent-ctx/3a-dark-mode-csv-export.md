# Task 3-a: Dark Mode Toggle & CSV Export

## Summary
Added dark mode toggle functionality and CSV export feature to the PDB Structure Tracker application.

## Changes Made

### 1. layout.tsx
- Added `ThemeProvider` from `next-themes` wrapping children and Toaster
- Configuration: `attribute="class"`, `defaultTheme="light"`, `enableSystem={false}`

### 2. globals.css
- Added comprehensive `.dark` CSS variables section with warm dark mode colors
- Dark backgrounds: #1a1917, #242220, #2b2926
- Dark borders: #3d3832, #4a4540
- Dark text: #e8e4dd (primary), #9b9590 (secondary), #6b6560 (muted)
- Accent adjusted to #d4784f for better dark mode visibility
- All method badges, IF tiers, category colors adjusted for dark backgrounds
- Added dark mode overrides for: markdown content, scrollbar, hover effects, table row hover, ligand chips

### 3. pdb-tracker.tsx
- Added Moon, Sun, Download icons to lucide-react imports
- Added `useTheme` from next-themes import
- Added theme state with `mounted` guard (prevents hydration mismatch)
- Added dark mode toggle button in header (before mobile menu buttons)
- Added `handleExportCsv` callback with proper CSV escaping
- Added Export button in weekly mode toolbar after count text
- Added `dark:` variant classes to all key structural elements (header, sidebar, toolbar, search inputs, table headers, pagination, preview panel, report modal, footer, mode switcher, card elements, tabs, mobile buttons)

## Files Modified
- `/home/z/my-project/src/app/layout.tsx`
- `/home/z/my-project/src/app/globals.css`
- `/home/z/my-project/src/components/pdb-tracker.tsx`
- `/home/z/my-project/worklog.md`

## Verification
- Lint passes with no errors
- Dev server compiles successfully
- All existing functionality preserved
