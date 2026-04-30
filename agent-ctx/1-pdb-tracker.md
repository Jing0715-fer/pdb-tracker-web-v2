# Task: PDB Structure Tracker Application

## Summary
Built a comprehensive PDB Structure Tracker application with Claude-style design in Next.js.

## Files Created
1. `/home/z/my-project/src/app/page.tsx` - Main page component
2. `/home/z/my-project/src/components/pdb-tracker.tsx` - Full PDB Tracker UI component

## Features Implemented

### Layout: 3-Column Design
- Left Sidebar (280px): Mode switcher, week cards/eval list, reports
- Main Area: Toolbar with filters + sortable data table
- Preview Panel (380px, collapsible): Summary and report tabs

### Weekly Mode Features
1. Sidebar with week cards showing date range, structure counts (EM/XR badges)
2. Toolbar: Week select dropdown, Method filter, Search input
3. Data table with all columns: PDB ID, Method, Resolution, IF, Title, Date, Ligands - ALL SORTABLE
4. Method badges with color coding (Cryo-EM=teal, X-ray=purple, NMR=amber, Other=gray)
5. Resolution color coding (Green ≤2.0Å, Amber 2.0-3.5Å, Red >3.5Å)
6. IF tier badges (Top=red, High=amber, Mid=green, Low=gray)
7. Ligand chips with hover popover for detailed info
8. Click PDB ID → opens RCSB page
9. Weekly reports in sidebar
10. Click report → shows in modal

### Evaluation Mode Features
1. Sidebar with search + eval entries with score badges
2. Click eval → loads detailed data (structures + BLAST results)
3. Main table shows structures AND BLAST homologs (with "Homolog" badge)
4. Preview panel with protein metadata, coverage, feasibility scores with progress bars
5. Score progress bars colored by value
6. BLAST results with identity%, e-value, query coverage color coding
7. Hover over homolog badge → shows BLAST stats

### Preview Panel
- Two tabs: Summary / Full Report
- Summary: Stats overview, method distribution, resolution charts, top journals, IF distribution
- Eval: Protein info, coverage %, scores, recommendations
- Report: Renders Markdown reports

### Report Modal
- Full-screen overlay with Markdown rendering
- Close button and click-outside-to-close
- ESC key support

### Tooltips
- PDB tooltip: Preview image, method, resolution, date, journal, IF, ligands, title
- Ligand tooltip: Name, formula, MW, type, 2D structure image
- BLAST homolog tooltip: Identity%, E-value, query coverage, method, resolution

### Claude-Style Design
- Warm cream background (#faf8f5)
- White cards with subtle shadows
- Warm accent color (#c96442)
- Custom color variables in globals.css
- Smooth transitions and hover effects
- Geist Sans/Mono fonts
- Custom scrollbar styling
- Score bar animations
