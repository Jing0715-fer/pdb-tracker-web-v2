# Task 2-b: PDB Structure Timeline Visualization Agent

## Task Summary
Added a visual timeline/gantt-style view to the preview panel showing when PDB structures were released within the selected week.

## Work Completed

### 1. Added Timeline Tab to Preview Panel
- Added third tab "Timeline" between "Summary" and "Full Report" in the preview panel
- Tabs now: Summary | Timeline | Full Report
- Added `Clock` icon import from lucide-react
- Adjusted tab text size to `text-[10px]` for better fit with 3 tabs

### 2. Added `highlightedEntry` State
- Added `highlightedEntry` state (`string | null`) for timeline-table hover interaction
- When a dot is hovered in the timeline, the corresponding table row gets a subtle glow effect (ring + shadow)
- Applied highlight class to weekly table `motion.tr`: `ring-1 ring-claude-accent/30 ring-inset shadow-[0_0_8px_rgba(196,100,74,0.15)]`

### 3. Modified `renderPreviewPanel` for 3 Tabs
- Changed ternary logic from 2-tab to 3-tab: `summary ? ... : timeline ? ... : report`
- Timeline tab renders `WeeklyTimeline` component when weekly mode + snapshot + entries exist
- Empty state shows Clock icon with "Select a week to view timeline" message

### 4. Removed Old Basic `WeeklyTimeline` Component
- Removed the old simple list-based `WeeklyTimeline` component (lines 2994-3069) that was from a previous agent
- Replaced with new comprehensive SVG-based timeline component

### 5. Created New `WeeklyTimeline` SVG Component (Full Implementation)

**Props:**
- `entries: PdbEntry[]` - all entries for the week
- `snapshot: WeeklySnapshot` - selected week snapshot
- `onSelectEntry: (entry: PdbEntry) => void` - click handler for dot
- `onHighlightEntry: (id: string | null) => void` - hover handler for row highlighting
- `highlightedEntry: string | null` - currently highlighted PDB ID

**Features:**
- **Responsive SVG**: Uses ResizeObserver to track container width, SVG stretches to fill preview panel
- **Timeline Stats**: Peak day with count, average per day, method distribution mini stacked bar
- **Method Legend**: Color-coded legend for Cryo-EM (#2d8f8f), X-ray (#7c5cbf), NMR (#c9872e), Other (#6b7280) with "Dot size ∝ Impact Factor" hint
- **Day Labels**: Vertical grid lines for each day, day names (Mon, Tue...) and date labels (May 1, May 2...) below axis
- **Color-coded Dots**: Each entry positioned by releaseDate, colored by method, sized by IF (min 6px, max 16px, scale: IF/50 * 10 + 6)
- **Stacked Dots**: Multiple entries on same day stack vertically with slight offset
- **Hover Tooltip**: SVG foreignObject tooltip showing PDB ID, method badge, title (truncated), resolution, IF
- **Interactive**: Clicking dot opens detail panel, hovering highlights corresponding table row
- **Dot Enter Animations**: Framer Motion staggered animation (delay: idx * 0.03, capped at 20)
- **Highlight Effect**: Highlighted dots get white stroke and slightly larger radius
- **Day Count Indicators**: Below the SVG, counts per day in accent color
- **Dark Mode**: Full support with `useTheme` - axis strokes, text colors, tooltip, backgrounds all adapt

**Styling:**
- Container: `rounded-[10px] border border-claude-border p-3 bg-claude-bg/30 dark:bg-[#1a1917]/30`
- Axis lines: `stroke: #e8e4dd` (light), `stroke: #4a4540` (dark)
- Day labels: `fontSize={10}` with theme-aware fill colors
- Stats: `text-[10px]` with appropriate Claude text colors
- Tooltip: Claude styled matching existing chart tooltips

### Technical Details
- SVG height: 280px
- SVG used instead of canvas for better interactivity
- ResponsiveContainer via ResizeObserver (not recharts)
- Framer Motion for dot animations
- All useMemo hooks properly memoized
- Lint passes cleanly
- Dev server compiles successfully
