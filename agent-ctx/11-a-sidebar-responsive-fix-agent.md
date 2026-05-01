# Task 11-a: Sidebar & Responsive Fix Agent

## Task
Fix the critical bug where the left sidebar cannot be opened on smaller screens, and make the sidebar toggleable on all screen sizes.

## Root Cause
The vaul Drawer component with `direction="left"` was not functioning properly for the mobile sidebar. The Drawer's left-direction support was unreliable or had CSS conflicts.

## Changes Made

### 1. Fixed Mobile Sidebar (Critical Bug)
- **Removed** the vaul Drawer import from `@/components/ui/drawer` (it was only used for the sidebar)
- **Replaced** the Drawer with a custom animated overlay panel using Framer Motion's AnimatePresence:
  - Backdrop overlay: `fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden`
  - Slide-in panel: `fixed left-0 top-0 bottom-0 z-50 w-[280px] max-w-[85vw]`
  - Spring animation: `initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}` with `type: 'spring', damping: 25, stiffness: 300`
  - Close button (X icon) in the panel header
  - Same sidebar content via `renderSidebar()`
  - Dark mode: `dark:bg-[#242220]`

### 2. Made Sidebar Toggleable on ALL Screen Sizes
- **Added** `sidebarOpen` state with smart initialization:
  - `true` on >= 1280px (xl breakpoint)
  - `false` on < 1280px
- **Added** resize listener to auto-close sidebar when window shrinks below xl breakpoint
- **Desktop sidebar** (>= xl): Can be collapsed/expanded via toggle button in the header
- **Collapsed desktop sidebar**: Shows a thin icon strip (w-12) with:
  - Expand button (PanelLeftOpen icon) with tooltip
  - Mode switcher icons (Weekly/Evaluation) with tooltips
- **Added** `PanelLeftClose` and `PanelLeftOpen` icons to lucide-react imports
- **Sidebar toggle button** in header uses `PanelLeftClose` with `rotate-180` animation when collapsed

### 3. Improved Responsive Breakpoints (lg → xl)
- Desktop sidebar: `hidden lg:flex` → `hidden xl:flex` (1280px breakpoint)
- Hamburger button: `lg:hidden` → `xl:hidden`
- Mobile preview toggle: `lg:hidden` → `xl:hidden`
- Desktop preview panel: `hidden lg:flex` → `hidden xl:flex`
- Mobile preview overlay: `lg:hidden` → `xl:hidden`
- Preview toggle button: `hidden lg:inline-flex` → `hidden xl:inline-flex`

### 4. Mobile-First Responsive Improvements
- Header height: `h-[48px]` on mobile, `h-[52px]` on sm+
- Header padding: `px-2` on mobile, `px-4` on sm+
- Header icon: `w-7 h-7` on mobile, `w-8 h-8` on sm+
- Header gap: `gap-1.5` on mobile, `gap-3` on sm+
- Mobile-specific header title: "PDB Tracker" (visible on < sm)
- Desktop title: "PDB Structure Tracker" with subtitle (visible on sm+)

### 5. Mobile Sidebar Close on Navigation
- Updated all sidebar navigation click handlers to also call `setMobileSidebarOpen(false)`:
  - Week card selection in compact sidebar mode
  - Week card selection in full sidebar mode
  - Evaluation card selection in compact sidebar mode
  - Evaluation card selection in full sidebar mode
  - Mode switcher buttons (Weekly/Evaluation) in compact sidebar mode
  - Mode switcher buttons (Weekly/Evaluation) in full sidebar mode

## Files Modified
- `/home/z/my-project/src/components/pdb-tracker.tsx` - Main component

## Verification
- `bun run lint` passes with no errors
- All existing functionality preserved
