# Task 3: Onboarding Tour Agent

## Task Description
Add an interactive onboarding tour / feature discovery to the PDB Structure Tracker application.

## Work Completed

### 1. Added Imports
- Added `HelpCircle` to lucide-react imports
- Added `createPortal` from `react-dom`
- Added `useLayoutEffect` to React imports

### 2. Tour State & Refs
- Added `tourActive` (boolean) and `tourStep` (number) state variables
- Added 6 refs for tour target elements:
  - `tourTitleRef` - app title/header area
  - `tourSidebarRef` - sidebar week list area
  - `tourModeSwitcherRef` - Weekly/Evaluation mode switcher
  - `tourSearchRef` - search input container
  - `tourPreviewRef` - preview panel aside element
  - `tourShortcutsRef` - keyboard shortcuts button

### 3. Tour Auto-Start & Completion
- Added `useEffect` that checks localStorage for `pdb-tour-completed` key
- If not found, auto-starts tour after 1.5s delay
- Added `finishTour` callback that:
  - Sets `tourActive` to false
  - Resets `tourStep` to 0
  - Saves `pdb-tour-completed` to localStorage
  - Shows toast: "Tour complete! Explore the app and use ⌘K anytime to search."
- Added `startTour` callback for manual restart
- Added `useEffect` to ensure preview panel is open when tour reaches step 5

### 4. Help Button
- Added HelpCircle button in the header, between keyboard shortcuts popover and dark mode toggle
- Calls `startTour()` on click
- Styled identically to other header buttons

### 5. TourOverlay Component (defined outside PdbTracker)
- Created `TourStepConfig` interface and `TOUR_STEPS` constant with 6 step definitions
- TourOverlay receives props: `tourActive`, `tourStep`, `setTourStep`, `finishTour`, `steps`
- Uses `useLayoutEffect` + `useCallback` for position calculation with RAF debouncing
- Listens to resize and scroll events for position updates
- Uses `createPortal` to render at document.body level with z-[100]

### 6. Tour Overlay Features
- **Spotlight**: Uses box-shadow technique (`0 0 0 9999px rgba(0,0,0,0.4)`) for semi-transparent overlay
- **Highlight border**: Pulsing border-2 border-claude-accent around target element with 4px padding
- **Tooltip card**: `bg-white dark:bg-[#242220] border border-claude-border rounded-xl shadow-2xl p-4 max-w-[280px]`
- **Positioning**: Auto-detects above/below placement based on available viewport space
- **Skip button**: Top-right, `text-[10px] text-claude-text-muted hover:text-claude-text`
- **Step number badge**: `h-5 w-5 rounded-full bg-claude-accent text-white text-[10px] font-bold`
- **Step title**: `text-sm font-semibold text-claude-text`
- **Step description**: `text-xs text-claude-text-secondary leading-relaxed`
- **Step dots**: `h-1.5 w-1.5 rounded-full`, filled (bg-claude-accent) for current, outlined for others
- **Back button**: Ghost style with hover effect
- **Next/Get Started button**: bg-claude-accent with hover:bg-claude-accent-hover
- **AnimatePresence**: Smooth fade + y-movement transitions between steps

### 7. Refs Attached to Target Elements
- `tourTitleRef` → header div containing app title
- `tourSidebarRef` → weekly sidebar content div (p-3 space-y-2)
- `tourModeSwitcherRef` → mode switcher div (p-3 border-b)
- `tourSearchRef` → search input container div (relative flex-1 max-w-xs)
- `tourPreviewRef` → desktop preview panel motion.aside (via React.RefObject cast)
- `tourShortcutsRef` → keyboard shortcuts button (with ref={tourShortcutsRef})

### 8. TourOverlay Rendered in PdbTracker
- Added after AnimatePresence (mobile preview panel) and before TooltipProvider closing
- Conditionally rendered with `mounted &&` guard for SSR safety
- Steps array maps TOUR_STEPS constants to refs with proper type casting

## Verification
- `bun run lint` passes with no errors
- Dev server compiles successfully
- All existing functionality preserved (no breaking changes)
