# Task 4-a, 4-b, 4-c: Style Enhancements for PDB Tracker

## Task
Add three style enhancements to the PDB Tracker app.

## Work Completed

### Enhancement 1: Animated Number Counters for Stat Cards
- Replaced `useCountUp` hook (400ms) with `useAnimatedValue` hook (800ms default)
- Returns `{ current, isAnimating }` for both the animated value and animation state
- Uses `requestAnimationFrame` with ease-out-cubic easing
- Resets when target changes (e.g., switching weeks)
- `isAnimating` set inside rAF callback (not synchronously in effect) for lint compliance
- Added `motion.span` scale animation (1.05 → 1.0) when animating
- Applied to all 4 stat cards and all existing AnimatedNumber usages

### Enhancement 2: Table Row Expand/Collapse Animation
- Added `pulsingRowId` state and `pulseTimeoutRef` for click tracking
- CSS `row-pulse` animation: claude-accent-light flash fading over 400ms
- Dark mode `row-pulse-dark` with warm dark tones
- CSS `row-selected` class: 3px left accent border + elevated background
- Applied when `detailPanelOpen && selectedEntry?.pdbId === entry.pdbId`
- Smooth transitions on both effects

### Enhancement 3: Sidebar & Preview Panel Visual Polish
- Gradient mesh overlay: faint radial gradient blobs in sidebar (desktop + mobile)
- Preview panel inner glow: subtle warm box-shadow at top (desktop + mobile)
- Week card hover parallax: 1-2px translate3d shift on mouse move
- Animated gradient border on active week card: 3s infinite gradient animation
- Updated `.sidebar-gradient > *` to exclude mesh overlay

## Files Modified
- `src/components/pdb-tracker.tsx` - Hook replacement, state additions, motion.tr modifications, sidebar/preview class additions, week card parallax handlers
- `src/app/globals.css` - New CSS classes: row-pulse, row-selected, sidebar-mesh-overlay, preview-inner-glow, week-card-parallax, week-card-active-border

## Lint Status
- `bun run lint` passes with no errors
- Dev server compiling successfully
