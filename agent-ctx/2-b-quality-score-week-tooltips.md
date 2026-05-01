# Task 2-b: Quality Score & Week Tooltips Agent

## Task Summary
Added PDB Entry Quality Score Badge and Enhanced Week Card Tooltips to the PDB Structure Tracker.

## Work Log

### Part 1: PDB Entry Quality Score

1. **computeQualityScore function** (lines ~387-459):
   - Resolution score: ≤1.5Å=35, 1.5-2.0Å=30, 2.0-2.5Å=25, 2.5-3.0Å=18, 3.0-3.5Å=12, >3.5Å=5, null=8
   - Method bonus: X-ray=25, Cryo-EM=22, NMR=15, Other=10
   - IF bonus: ≥20=30, 10-19.9=25, 5-9.9=18, 2-4.9=10, <2=5, null=3
   - Total: 0-90 range, normalized to 0-100
   - Returns: total, resolutionScore, methodScore, ifScore, label (Excellent/Good/Fair/Low), color

2. **Quality Badge in Table** (PDB ID column, ~line 2878):
   - Small colored dot (`h-2 w-2 rounded-full`) after PDB ID
   - Color: ≥80 green (#22c55e), 60-79 teal (#14b8a6), 40-59 amber (#f59e0b), <40 red (#ef4444)
   - Title tooltip shows "Excellent (85)" etc.

3. **Quality Score Card in Detail Panel** (after Title, ~line 3528):
   - SVG circular gauge (88x88) with background circle and color-coded arc
   - Score number centered in gauge with quality color
   - Quality label with breakdown text: "Resolution: 30/35 · Method: 25/25 · IF: 18/30"
   - Three mini progress bars for each component (Resolution=#c96442, Method=#2d8f8f, IF=#7c5cbf)
   - Full dark mode support

4. **Quality Filter in Advanced Filter Panel** (~line 2924):
   - New `qualityFilter` state ('all' | 'excellent' | 'good' | 'fair' | 'low')
   - Select dropdown with color dots for each quality tier
   - Filter chip in active filters section
   - Integrated into sortedEntries useMemo filter chain
   - Included in activeAdvancedFilterCount and clearAdvancedFilters

### Part 2: Enhanced Week Card Tooltips

1. **HoverCard on Week Cards** (~line 4204):
   - Wrapped each week card button in HoverCard with 500ms openDelay
   - HoverCardTrigger wraps the existing button
   - HoverCardContent shows rich tooltip

2. **Tooltip Content**:
   - Week date range as header (font-semibold)
   - Mini method distribution horizontal bars (`h-1.5 rounded-full`) with method colors
   - Method count labels below bars
   - Average resolution with quality color and label (Excellent/Good/Fair/Low)
   - Top journal from snapshot data
   - Reports count (when week is selected)
   - "Click to view" hint at bottom

3. **Styling**:
   - `bg-white dark:bg-[#2b2926]` background
   - `border border-claude-border rounded-xl shadow-xl`
   - `w-64 p-3 space-y-2` content
   - Data rows: `flex justify-between text-[10px]`

### Files Modified
- `/home/z/my-project/src/components/pdb-tracker.tsx` - Main component with all changes

### Imports Added
- `HoverCard, HoverCardTrigger, HoverCardContent` from `@/components/ui/hover-card`

### State Added
- `qualityFilter: string` ('all' by default)

### Lint Status
- Passes cleanly with no errors
- Dev server compiling successfully
