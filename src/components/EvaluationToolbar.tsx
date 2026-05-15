'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, Tag, FileDiff, StickyNote, Columns,
  Dna, Sparkles, Eye, Star, FlaskConical, Activity, Clock, CheckCheck,
  Trash2, Columns3, AlignJustify, AlignVerticalSpaceAround, Download,
  ChevronDown, Layers,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { PdbEntry, SortField, SortDir, WeeklySnapshot, SearchSuggestionItem } from './types';



interface EvaluationToolbarProps {
  mode: 'weekly' | 'evaluation';
  methodFilter: string;
  searchQuery: string;
  selectedTagFilter: string | null;
  showBookmarksOnly: boolean;
  compactMode: boolean;
  compareMode: boolean;
  compareWeekId: string | null;
  advancedFiltersOpen: boolean;
  activeAdvancedFilterCount: number;
  resolutionRange: [number, number];
  ifRange: [number, number];
  selectedOrganisms: Set<string>;
  organismOptions: { name: string; count: number }[];
  dateRange: { from: string; to: string };
  qualityFilter: string;
  hasLigandsFilter: boolean;
  selectedRows: Set<string>;
  entryCompareCount: number;
  entryNotes: Record<string, string>;
  entries: PdbEntry[];
  snapshots: WeeklySnapshot[];
  sortedEntries: PdbEntry[];
  selectedWeekId: string | null;
  handleExportCsv: () => void;
  handleExportJson: () => void;
  handleExportJsonFull: () => void;
  handleExportMarkdown: () => void;
  handleExportClipboard: () => void;
  clearAdvancedFilters: () => void;
  clearSelection: () => void;
  clearEntryComparison: () => void;
  setEntryCompareModalOpen: (open: boolean) => void;
  setAdvancedFiltersOpen: (open: boolean) => void;
  setMethodFilter: (method: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTagFilter: (tag: string | null) => void;
  setShowBookmarksOnly: (show: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setCompareWeekId: (weekId: string | null) => void;
  setResolutionRange: (range: [number, number]) => void;
  setIfRange: (range: [number, number]) => void;
  setSelectedOrganisms: (organisms: Set<string>) => void;
  setDateRange: React.Dispatch<React.SetStateAction<{ from: string; to: string }>>;
  setQualityFilter: (filter: string) => void;
  setHasLigandsFilter: (has: boolean) => void;
  searchDropdownOpen: boolean;
  searchHighlightIndex: number;
  searchSuggestions: SearchSuggestionItem[];
  searchHistory: string[];
  totalSuggestionCount: number;
  addToSearchHistory: (term: string) => void;
  clearSearchHistory: () => void;
  setSearchDropdownOpen: (open: boolean) => void;
  setSearchHighlightIndex: (index: number) => void;
  diffMode: boolean;
  setDiffMode: (diff: boolean) => void;
  toggleAllOrganisms: () => void;
  setHiddenColumns: React.Dispatch<React.SetStateAction<Set<string>>>;
  hiddenColumns: Set<string>;
  generateTags: (entry: PdbEntry, isNewEntry?: boolean) => { label: string; category: string }[];
  tagCategoryStyles: Record<string, { bg: string; text: string; border: string; darkBg: string; darkText: string }>;
  getMethodLabel: (method: string) => string;
  selectedEval: any;
  selectedComplexId: string | null;
  complexEvalData: any;
  selectedBatchId: string | null;
  evalBatches: any[];
  evaluations: any[];
}

export function EvaluationToolbar({
  mode,
  methodFilter,
  searchQuery,
  selectedTagFilter,
  showBookmarksOnly,
  compactMode,
  compareMode,
  compareWeekId,
  advancedFiltersOpen,
  activeAdvancedFilterCount,
  resolutionRange,
  ifRange,
  selectedOrganisms,
  organismOptions,
  dateRange,
  qualityFilter,
  hasLigandsFilter,
  selectedRows,
  entryCompareCount,
  entryNotes,
  entries,
  snapshots,
  sortedEntries,
  selectedWeekId,
  handleExportCsv,
  handleExportJson,
  handleExportJsonFull,
  handleExportMarkdown,
  handleExportClipboard,
  clearAdvancedFilters,
  clearSelection,
  clearEntryComparison,
  setEntryCompareModalOpen,
  setAdvancedFiltersOpen,
  setMethodFilter,
  setSearchQuery,
  setSelectedTagFilter,
  setShowBookmarksOnly,
  setCompactMode,
  setCompareWeekId,
  setResolutionRange,
  setIfRange,
  setSelectedOrganisms,
  setDateRange,
  setQualityFilter,
  setHasLigandsFilter,
  searchDropdownOpen,
  searchHighlightIndex,
  searchSuggestions,
  searchHistory,
  totalSuggestionCount,
  addToSearchHistory,
  clearSearchHistory,
  setSearchDropdownOpen,
  setSearchHighlightIndex,
  diffMode,
  setDiffMode,
  toggleAllOrganisms,
  setHiddenColumns,
  hiddenColumns,
  generateTags,
  tagCategoryStyles,
  getMethodLabel,
  selectedEval,
  selectedComplexId,
  complexEvalData,
  selectedBatchId,
  evalBatches,
  evaluations,
}: EvaluationToolbarProps) {
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchHighlightIndex(Math.min(searchHighlightIndex + 1, totalSuggestionCount - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchHighlightIndex(Math.max(searchHighlightIndex - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchHighlightIndex >= 0) {
        if (searchQuery.trim()) {
          const item = searchSuggestions[searchHighlightIndex];
          if (item) {
            setSearchQuery(item.text);
            addToSearchHistory(item.text);
            setSearchDropdownOpen(false);
            setSearchHighlightIndex(-1);
          }
        } else {
          const term = searchHistory[searchHighlightIndex];
          if (term) {
            setSearchQuery(term);
            addToSearchHistory(term);
            setSearchDropdownOpen(false);
            setSearchHighlightIndex(-1);
          }
        }
      } else {
        addToSearchHistory(searchQuery);
        setSearchDropdownOpen(false);
      }
    } else if (e.key === 'Escape') {
      setSearchDropdownOpen(false);
      setSearchHighlightIndex(-1);
    }
  };

  if (mode !== 'weekly') {
    return (
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 border-b border-claude-border dark:border-[#3d3832] bg-claude-surface/80 dark:bg-[#242220]/90 backdrop-blur-sm no-print overflow-x-auto h-12">
        <FlaskConical className="h-4 w-4 text-claude-accent" />
        <span className="text-sm font-semibold text-claude-text">
          {selectedEval ? selectedEval.proteinName || selectedEval.uniprotId : selectedComplexId && complexEvalData ? complexEvalData.group.name : selectedBatchId ? (evalBatches.find((b: any) => b.batchId === selectedBatchId)?.title || 'Batch') : 'Select a protein'}
        </span>
        {selectedEval && (
          <span className="font-mono text-xs text-claude-accent">{selectedEval.uniprotId}</span>
        )}
        {selectedComplexId && complexEvalData && !selectedEval && (
          <span className="inline-flex items-center gap-1 text-[10px] text-claude-text-muted">
            <Layers className="h-3 w-3" />
            {complexEvalData.subEvals.length} sub-targets
          </span>
        )}
        <span className="text-[10px] text-claude-text-muted ml-auto whitespace-nowrap">
          {selectedEval
            ? `${(selectedEval.pdbStructures || []).length} structures · ${(selectedEval.blastResults || []).length} BLAST`
            : selectedComplexId && complexEvalData
              ? `${complexEvalData.allStructures.length} structures · ${complexEvalData.allBlasts.length} BLAST`
              : `${evaluations.length} evaluations`}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 border-b border-claude-border dark:border-[#3d3832] bg-claude-surface/80 dark:bg-[#242220]/90 backdrop-blur-sm no-print overflow-x-auto h-12">
      {/* Advanced Filters Button */}
      <button
        onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
        className={`inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-[11px] font-medium border transition-colors duration-150 relative claude-focus-ring ${
          advancedFiltersOpen || activeAdvancedFilterCount > 0
            ? 'border-claude-accent bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent'
            : 'border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border'
        }`}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span>Filters</span>
        {activeAdvancedFilterCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[14px] h-[14px] px-[3px] rounded-full text-[8px] font-bold bg-claude-accent text-white leading-none ml-1">
            {activeAdvancedFilterCount}
          </span>
        )}
      </button>

      {/* Search */}
      <div className="relative flex-1 min-w-[120px] max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-claude-text-muted z-10" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search PDB ID, title, journal..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setSearchDropdownOpen(true); setSearchHighlightIndex(-1); }}
          onFocus={() => setSearchDropdownOpen(true)}
          onBlur={() => { setTimeout(() => { setSearchDropdownOpen(false); setSearchHighlightIndex(-1); }, 200); }}
          onKeyDown={handleSearchKeyDown}
          className="w-full pl-8 pr-3 h-8 text-xs rounded-md border border-claude-border dark:border-[#3d3832] bg-white dark:bg-[#1a1917] dark:text-[#e8e4dd] focus:outline-none focus:ring-2 focus:ring-claude-accent/40 focus:border-claude-accent/40 placeholder:text-claude-text-muted/60 input-focus-glow"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
            <X className="h-3 w-3 text-claude-text-muted hover:text-claude-text" />
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      <div className="hidden sm:flex items-center gap-1.5 flex-wrap no-print">
        {methodFilter !== 'all' && (
          <AnimatePresence>
            <motion.span
              initial={{ opacity: 0, x: -8, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20"
            >
              Method: {getMethodLabel(methodFilter === 'Cryo-EM' ? 'CRYO-EM' : methodFilter === 'X-RAY DIFFRACTION' ? 'X-RAY DIFFRACTION' : methodFilter === 'SOLUTION NMR' ? 'SOLUTION NMR' : methodFilter)}
              <button onClick={() => setMethodFilter('all')} className="hover:text-claude-accent/80 transition-colors">
                <X className="h-2.5 w-2.5" />
              </button>
            </motion.span>
          </AnimatePresence>
        )}
        {searchQuery && (
          <AnimatePresence>
            <motion.span
              initial={{ opacity: 0, x: -8, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20"
            >
              Search: {searchQuery.length > 12 ? searchQuery.slice(0, 12) + '…' : searchQuery}
              <button onClick={() => setSearchQuery('')} className="hover:text-claude-accent/80 transition-colors">
                <X className="h-2.5 w-2.5" />
              </button>
            </motion.span>
          </AnimatePresence>
        )}
        {showBookmarksOnly && (
          <AnimatePresence>
            <motion.span
              initial={{ opacity: 0, x: -8, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20"
            >
              Bookmarked
              <button onClick={() => setShowBookmarksOnly(false)} className="hover:text-claude-accent/80 transition-colors">
                <X className="h-2.5 w-2.5" />
              </button>
            </motion.span>
          </AnimatePresence>
        )}
        {selectedTagFilter && (() => {
          const tagInfo = (() => {
            for (const entry of entries) {
              const tags = generateTags(entry, diffMode);
              const found = tags.find((t: any) => t.label === selectedTagFilter);
              if (found) return found;
            }
            return null;
          })();
          const tagStyle = tagInfo ? tagCategoryStyles[tagInfo.category] : null;
          return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${tagStyle ? `${tagStyle.bg} ${tagStyle.text} ${tagStyle.border} ${tagStyle.darkBg} ${tagStyle.darkText}` : 'bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20'}`}>
              <Tag className="h-2.5 w-2.5" />
              {selectedTagFilter}
              <button onClick={() => setSelectedTagFilter(null)} className="hover:opacity-70 transition-opacity">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          );
        })()}
        {diffMode && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30">
            <FileDiff className="h-2.5 w-2.5" />
            Diff
            <button onClick={() => setDiffMode(false)} className="hover:text-green-600 dark:hover:text-green-300 transition-colors">
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        )}
        {Object.keys(entryNotes).length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
            <StickyNote className="h-2.5 w-2.5" />
            {Object.keys(entryNotes).length} note{Object.keys(entryNotes).length !== 1 ? 's' : ''}
          </span>
        )}
        {selectedRows.size > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20">
            {selectedRows.size} selected
            <button onClick={clearSelection} className="hover:text-claude-accent/80 transition-colors">
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        )}
        {entryCompareCount > 0 && (
          <button
            onClick={() => {
              if (entryCompareCount === 2) {
                setEntryCompareModalOpen(true);
              } else {
                toast('Select one more entry to compare', { description: 'Click the compare icon on another row' });
              }
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/30 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
          >
            <Columns className="h-2.5 w-2.5" />
            Comparing {entryCompareCount}/2
            <span
              onClick={(e) => { e.stopPropagation(); clearEntryComparison(); }}
              className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors ml-0.5"
            >
              <X className="h-2.5 w-2.5" />
            </span>
          </button>
        )}
        {hasLigandsFilter && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30">
            <Dna className="h-2.5 w-2.5" />
            Ligands
            <button onClick={() => setHasLigandsFilter(false)} className="hover:text-rose-600 dark:hover:text-rose-300 transition-colors">
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        )}
      </div>

      {/* Presets Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="hidden sm:inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-[11px] font-medium border border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150 claude-focus-ring btn-press"
          >
            <Sparkles className="h-3 w-3" />
            Presets
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-[10px] text-claude-text-muted">Quick Filter Presets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={() => {
              setResolutionRange([0, 2.0]);
              setAdvancedFiltersOpen(true);
              toast('Applied preset: High Resolution', { description: 'Resolution ≤ 2.0Å' });
            }}
          >
            <Eye className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
            High Resolution
            <span className="ml-auto text-[9px] text-claude-text-muted">≤ 2.0Å</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={() => {
              setIfRange([10, 50]);
              setAdvancedFiltersOpen(true);
              toast('Applied preset: Top Journals', { description: 'Impact Factor ≥ 10' });
            }}
          >
            <Star className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mr-2 flex-shrink-0" />
            Top Journals
            <span className="ml-auto text-[9px] text-claude-text-muted">IF ≥ 10</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={() => {
              setMethodFilter('Cryo-EM');
              toast('Applied preset: Cryo-EM Only', { description: 'Showing only Cryo-EM structures' });
            }}
          >
            <FlaskConical className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 mr-2 flex-shrink-0" />
            Cryo-EM Only
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={() => {
              setMethodFilter('X-RAY DIFFRACTION');
              toast('Applied preset: X-ray Only', { description: 'Showing only X-ray structures' });
            }}
          >
            <Activity className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0" />
            X-ray Only
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={() => {
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              const fromStr = sevenDaysAgo.toISOString().slice(0, 10);
              setDateRange(prev => ({ ...prev, from: fromStr }));
              setAdvancedFiltersOpen(true);
              toast('Applied preset: Recent (7 days)', { description: `From ${fromStr}` });
            }}
          >
            <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
            Recent (7 days)
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={() => {
              setHasLigandsFilter(true);
              setAdvancedFiltersOpen(true);
              toast('Applied preset: With Ligands', { description: 'Showing entries that have ligands' });
            }}
          >
            <Dna className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 mr-2 flex-shrink-0" />
            With Ligands
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={() => {
              setQualityFilter('high');
              setAdvancedFiltersOpen(true);
              toast('Applied preset: High Quality', { description: 'Quality score ≥ 70' });
            }}
          >
            <CheckCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mr-2 flex-shrink-0" />
            High Quality
            <span className="ml-auto text-[9px] text-claude-text-muted">≥ 70</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-xs cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
            onClick={() => {
              setMethodFilter('all');
              setSearchQuery('');
              setShowBookmarksOnly(false);
              clearAdvancedFilters();
              toast('All filters cleared');
            }}
          >
            <Trash2 className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
            Clear All Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Column Visibility Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="hidden sm:inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-[11px] font-medium border border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150 claude-focus-ring btn-press"
          >
            <Columns3 className="h-3 w-3" />
            Columns
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-[10px] text-claude-text-muted">Toggle Columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={true} disabled className="text-xs">
            PDB ID
          </DropdownMenuCheckboxItem>
          {[
            { field: 'method', label: 'Method' },
            { field: 'resolution', label: 'Resolution' },
            { field: 'journalIf', label: 'IF (Impact Factor)' },
            { field: 'organisms', label: 'Organism' },
            { field: 'title', label: 'Title' },
            { field: 'releaseDate', label: 'Date' },
            { field: '_ligands', label: 'Ligands' },
          ].map(col => (
            <DropdownMenuCheckboxItem
              key={col.field}
              checked={!hiddenColumns.has(col.field)}
              onCheckedChange={() => {
                setHiddenColumns(prev => {
                  const next = new Set(prev);
                  if (next.has(col.field)) {
                    next.delete(col.field);
                  } else {
                    next.add(col.field);
                  }
                  return next;
                });
              }}
              className="text-xs"
            >
              {col.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Data Density Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setCompactMode(!compactMode)}
            className={`hidden sm:inline-flex items-center justify-center h-7 w-7 rounded-md text-[11px] font-medium border transition-colors duration-150 claude-focus-ring ${
              compactMode
                ? 'border-claude-accent bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent'
                : 'border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border'
            }`}
            aria-label={compactMode ? 'Switch to comfortable mode' : 'Switch to compact mode'}
          >
            {compactMode ? <AlignJustify className="h-3 w-3" /> : <AlignVerticalSpaceAround className="h-3 w-3" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span className="text-[10px]">{compactMode ? 'Compact mode' : 'Comfortable mode'}</span>
        </TooltipContent>
      </Tooltip>

      {sortedEntries.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="hidden sm:inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-[11px] font-medium border border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150 claude-focus-ring btn-press"
            >
              <Download className="h-3 w-3" />
              Export
              <ChevronDown className="h-3 w-3 ml-0.5 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-[10px] text-claude-text-muted">Export Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportCsv} className="text-xs cursor-pointer">
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJson} className="text-xs cursor-pointer">
              JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJsonFull} className="text-xs cursor-pointer">
              JSON (Full)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportMarkdown} className="text-xs cursor-pointer">
              Markdown Table
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportClipboard} className="text-xs cursor-pointer">
              Copy to Clipboard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Compare Week Selector */}
      {compareMode && (
        <Select value={compareWeekId || ''} onValueChange={setCompareWeekId}>
          <SelectTrigger className="w-[140px] h-7 min-h-[44px] sm:min-h-0 text-[11px]">
            <SelectValue placeholder="Compare with..." />
          </SelectTrigger>
          <SelectContent className="text-[11px]">
            {snapshots
              .filter(s => s.weekId !== selectedWeekId)
              .map(s => (
                <SelectItem key={s.weekId} value={s.weekId} className="text-[11px] py-1">
                  <span className="font-mono">{s.weekId}</span>
                  <span className="text-claude-text-muted ml-2">({s.totalStructures})</span>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}