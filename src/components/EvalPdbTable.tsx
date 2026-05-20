'use client';

import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Loader2, ExternalLink, Eye, Copy, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Evaluation, EvaluationReport } from './pdb-helpers';
import { getMethodLabel, getMethodColor, getIfTierStyle, getResolutionColor, formatDate, parseLigands, PAGE_SIZE } from './pdb-helpers';
import type { EvalPdbStructure, EvalBlastResult, LigandInfo } from './pdb-tracker';
import { UniprotBadgeList } from './UniprotBadgeList';

// ─── Local Eval Row Types (same as pdb-tracker.tsx) ─────────────────────────

type EvalRow = (EvalPdbStructure & { _type: 'structure'; _sourceUniport?: string; _sharedCount?: number; _firstUniport?: string; _allSources?: string[] })
  | (EvalBlastResult & { _type: 'blast'; _sourceUniport?: string; _sharedCount?: number; _firstUniport?: string; _allSources?: string[] });

type ComplexGroup = {
  id: string;
  name: string;
  uniprotIds: string[];
  createdAt: number;
};

type EvalBatch = {
  isBatch: true;
  batchId: string;
  title: string;
  subTargetCount: number;
  combinedReport: string;
  createdAt: string;
};

// ─── Props ─────────────────────────────────────────────────────────────────

export interface EvalPdbTableProps {
  paginatedEvalRows: EvalRow[];
  sortedEvalRows: EvalRow[];
  selectedEval: Evaluation | null;
  selectedComplexId: string | null;
  selectedBatchId: string | null;
  complexEvalData: {
    sharedStructureMap: Map<string, number>;
    allStructures: (EvalPdbStructure & { _type: 'structure' })[];
    allBlasts: (EvalBlastResult & { _type: 'blast' })[];
  } | null;
  currentPage: number;
  totalEvalPages: number;
  sortField: string;
  hiddenColumns: Set<string>;
  compactMode: boolean;
  onSort: (field: string) => void;
  onSelectRow: (row: EvalRow) => void;
  onCopyPdbId: (pdbId: string) => void;
  onOpenRcsb: (pdbId: string) => void;
  onSearchPubmed: (row: EvalRow) => void;
  onExportRow: (row: EvalRow) => void;
  setCurrentPage: (page: number) => void;
  // Ligand support
  ligandCache: Record<string, LigandInfo>;
  fetchLigandInfo: (code: string) => void;
  openEvalReport: (uniprotId: string, title: string) => void;
  batchUniprotSources: Map<string, string[]> | null;
  rowAllSources?: string[];
  batchSubTargetMeta: Record<string, { proteinName: string; geneName: string }> | null;
  subTargetColorMap?: Map<string, number> | null;
}

// ─── Shared Tooltip Content Components ─────────────────────────────────────

function PdbTooltipContent({ entry }: { entry: EvalPdbStructure }) {
  return (
    <div className="p-3 space-y-1.5 min-w-[160px]">
      <div className="font-mono font-semibold text-claude-accent text-sm">{entry.pdbId}</div>
      <div className="text-xs text-claude-text-secondary leading-relaxed line-clamp-2">{entry.title || '—'}</div>
      <div className="flex flex-wrap gap-1 mt-1">
        {entry.method && (
          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-mid-bg text-claude-mid">
            {getMethodLabel(entry.method)}
          </span>
        )}
        {entry.resolution != null && (
          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-mid-bg text-claude-mid">
            {entry.resolution.toFixed(2)}Å
          </span>
        )}
        {entry.ifTier && (
          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-mid-bg text-claude-mid">
            {entry.ifTier}
          </span>
        )}
      </div>
      <div className="text-[10px] text-claude-text-muted">{entry.organism || '—'}</div>
    </div>
  );
}

function BlastHomologTooltipContent({ result }: { result: EvalBlastResult & { _type: 'blast' } }) {
  return (
    <div className="p-3 space-y-1.5 min-w-[160px]">
      <div className="font-mono font-semibold text-claude-accent text-sm">{result.pdbId || '—'}</div>
      <div className="text-xs text-claude-text-secondary leading-relaxed line-clamp-2">{result.description || '—'}</div>
      {result.identity != null && (
        <div className="text-[10px] text-claude-text-muted">Identity: {(result.identity * 100).toFixed(1)}%</div>
      )}
      {result.evalue != null && (
        <div className="text-[10px] text-claude-text-muted">E-value: {result.evalue.toExponential(2)}</div>
      )}
    </div>
  );
}

function LigandTooltipContent({ ligand }: { ligand: LigandInfo }) {
  return (
    <div className="p-3 space-y-1.5 min-w-[140px]">
      <div className="font-semibold text-claude-text text-xs">{ligand.name || ligand.code}</div>
      {ligand.formula && <div className="text-[10px] text-claude-text-secondary font-mono">{ligand.formula}</div>}
      {ligand.weight && <div className="text-[10px] text-claude-text-muted">MW: {ligand.weight}</div>}
      {ligand.type && <div className="text-[10px] text-claude-text-muted">Type: {ligand.type}</div>}
      {ligand.description && <div className="text-[10px] text-claude-text-secondary leading-relaxed line-clamp-2">{ligand.description}</div>}
    </div>
  );
}

// ─── Sort Icon ───────────────────────────────────────────────────────────────

function SortIcon({ field, activeField, sortDir }: { field: string; activeField: string; sortDir: string }) {
  if (activeField !== field) {
    return <ArrowUpDown className="h-3 w-3 opacity-30" />;
  }
  return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-claude-accent" /> : <ArrowDown className="h-3 w-3 text-claude-accent" />;
}

import { ArrowUpDown, ArrowUp, ArrowDown, GitMerge } from 'lucide-react';

// ─── Main Component ──────────────────────────────────────────────────────────

export function EvalPdbTable({
  paginatedEvalRows,
  sortedEvalRows,
  selectedEval,
  selectedComplexId,
  selectedBatchId,
  complexEvalData,
  currentPage,
  totalEvalPages,
  sortField,
  hiddenColumns,
  compactMode,
  onSort,
  onSelectRow,
  onCopyPdbId,
  onOpenRcsb,
  onSearchPubmed,
  onExportRow,
  setCurrentPage,
  ligandCache,
  fetchLigandInfo,
  batchUniprotSources,
  batchSubTargetMeta,
  subTargetColorMap,
}: EvalPdbTableProps) {
  const totalItems = sortedEvalRows.length;

  return (
    <>
      <table className={`min-w-[700px] w-full text-xs ${compactMode ? 'compact-table' : ''}`}>
        <thead className="sticky top-0 z-10 border-b border-claude-border dark:border-[#3d3832]">
          <tr className="bg-claude-bg dark:bg-[#1a1917]">
            {[
              { field: 'pdbId', label: 'PDB ID', w: 'w-[90px]' },
              { field: '_type', label: 'Type', w: 'w-[70px]' },
              ...(((selectedComplexId && !selectedEval) || (selectedBatchId && !selectedEval)) ? [{ field: '_source', label: 'Source', w: selectedBatchId ? 'w-[130px]' : 'w-[80px]' }] : []),
              { field: 'method', label: 'Method', w: 'w-[90px]' },
              { field: 'resolution', label: 'Resolution', w: 'w-[80px]' },
              { field: 'journalIf', label: 'IF', w: 'w-[55px]' },
              { field: 'title', label: 'Title / Description', w: '' },
              { field: 'releaseDate', label: 'Date', w: 'w-[95px]' },
              { field: '_ligands', label: 'Ligands', w: 'w-[120px]' },
            ].filter(col => !hiddenColumns.has(col.field)).map(col => (
              <th
                key={col.field}
                onClick={() => !['_type', '_ligands'].includes(col.field) && onSort(col.field)}
                className={`px-3 py-3.5 text-left text-[11px] font-semibold text-claude-text-muted uppercase tracking-wide transition-colors duration-200 ${sortField === col.field && !['_type', '_ligands'].includes(col.field) ? 'sort-active' : ''} ${col.w} ${!['_type', '_ligands'].includes(col.field) ? 'sortable-header hover:text-claude-text-secondary' : ''}`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {!['_type', '_ligands'].includes(col.field) && <SortIcon field={col.field} activeField={sortField} sortDir={sortField === col.field ? 'desc' : 'desc'} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedEvalRows.map((row, idx) => {
            const isBlast = row._type === 'blast';
            const mc = getMethodColor(row.method || '');
            const ifStyle = getIfTierStyle(row.ifTier);
            const blastResult = isBlast ? (row as EvalBlastResult & { _type: 'blast' }) : null;
            const structResult = !isBlast ? (row as EvalPdbStructure & { _type: 'structure' }) : null;

            return (
              <ContextMenu key={`${row._type}-${row.pdbId || 'noid'}-${idx}`}>
                <ContextMenuTrigger asChild onClick={() => onSelectRow(row)}>
                  <tr
                    className={`table-row-hover-enhanced border-b border-claude-border-light dark:border-b-[#3d3832] ${idx % 2 === 0 ? 'table-row-even' : 'table-row-odd'} ${isBlast ? 'bg-claude-border-light/30 dark:bg-[#2b2926]/50' : ''} cursor-pointer`}
                    onClick={() => onSelectRow(row)}
                  >
                    {/* PDB ID */}
                    <td className="px-3 py-2">
                      {row.pdbId ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1">
                              <a
                                href={`https://www.rcsb.org/structure/${row.pdbId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono font-semibold text-claude-accent pdb-link external-link-hover link-animated inline-flex items-center gap-0.5"
                              >
                                {row.pdbId}
                                <ExternalLink className="h-2.5 w-2.5 opacity-50 ext-arrow" />
                              </a>
                              {/* Shared structure badge for complex groups */}
                              {selectedComplexId && !selectedEval && complexEvalData?.sharedStructureMap && (
                                (() => {
                                  const sharedCount = complexEvalData.sharedStructureMap.get(row.pdbId) || 0;
                                  if (sharedCount <= 1) return null;
                                  const badgeColor = sharedCount >= 4
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/40'
                                    : sharedCount === 3
                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40'
                                    : 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/40';
                                  return (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className={`inline-flex items-center gap-0.5 px-1 py-0 rounded text-[8px] font-mono font-semibold border ${badgeColor}`}>
                                          <GitMerge className="h-2 w-2" />×{sharedCount}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="right" className="text-[10px]">Shared by {sharedCount} sub-targets</TooltipContent>
                                    </Tooltip>
                                  );
                                })()
                              )}
                              {/* Shared structure badge for batch evals */}
                              {selectedBatchId && !selectedEval && (
                                (() => {
                                  const sharedCount = ((row as EvalRow)._sharedCount) || 0;
                                  if (sharedCount <= 1) return null;
                                  const badgeColor = sharedCount >= 4
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/40'
                                    : sharedCount === 3
                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40'
                                    : 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/40';
                                  const allSources = (row as EvalRow)._allSources || [];
                                  return (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className={`inline-flex items-center gap-0.5 px-1 py-0 rounded text-[8px] font-mono font-semibold border ${badgeColor}`}>
                                          <GitMerge className="h-2 w-2" />×{sharedCount}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="right" className="p-2 text-[10px] max-w-[280px]">
                                        <div className="font-semibold text-claude-text mb-1">Shared by {sharedCount} sub-targets:</div>
                                        <div className="space-y-0.5">
                                          {allSources.map((src) => {
                                            const meta = batchSubTargetMeta?.[src];
                                            return (
                                              <div key={src} className="flex items-start gap-1">
                                                <span className="text-claude-text-muted">•</span>
                                                <span>
                                                  <span className="font-mono font-semibold">{src}</span>
                                                  {meta?.proteinName && <span className="text-claude-text-secondary"> ({meta.proteinName})</span>}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })()
                              )}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="p-0 bg-white border border-claude-border dark:border-[#4a4540] dark:bg-[#242220] shadow-lg rounded-xl">
                            {structResult ? (
                              <PdbTooltipContent entry={structResult} />
                            ) : blastResult ? (
                              <BlastHomologTooltipContent result={blastResult} />
                            ) : null}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-claude-text-muted">—</span>
                      )}
                    </td>
                    {/* Type */}
                    {!hiddenColumns.has('_type') && (
                      <td className="px-3 py-2">
                        {isBlast ? (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20">
                            Homolog
                          </span>
                        ) : (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-mid-bg text-claude-mid">
                            Structure
                          </span>
                        )}
                      </td>
                    )}
                    {/* Source UniProt: batch shows multi-source badges; complex shows single source */}
                    {((selectedComplexId && !selectedEval) || (selectedBatchId && !selectedEval)) && (
                      <td className={`px-3 py-2 ${selectedBatchId && (row._allSources?.length ?? 0) > 1 ? 'bg-teal-50/30 dark:bg-teal-900/8' : ''}`}>
                        {selectedBatchId && !selectedEval && row._allSources ? (
                          <UniprotBadgeList
                            uniprotIds={row._allSources}
                            colorMap={subTargetColorMap ?? null}
                            metaMap={batchSubTargetMeta ?? null}
                            isShared={(row._allSources?.length ?? 0) > 1}
                            size="md"
                            maxVisible={3}
                          />
                        ) : (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-mid-bg/50 text-claude-mid font-mono cursor-default">
                            {row._sourceUniport || '—'}
                          </span>
                        )}
                      </td>
                    )}
                    {/* Method */}
                    {!hiddenColumns.has('method') && (
                      <td className="px-3 py-2">
                        {row.method ? (
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${mc.bg} ${mc.text} method-badge ${
                            row.method?.toUpperCase().includes('CRYO') || row.method?.toUpperCase().includes('ELECTRON MICROSCOPY')
                              ? 'method-badge-cryoem'
                              : row.method?.toUpperCase().includes('X-RAY') || row.method?.toUpperCase().includes('XRAY')
                              ? 'method-badge-xray'
                              : row.method?.toUpperCase().includes('NMR')
                              ? 'method-badge-nmr'
                              : 'method-badge-other'
                          }`}>
                            {getMethodLabel(row.method)}
                          </span>
                        ) : <span className="text-claude-text-muted">—</span>}
                      </td>
                    )}
                    {/* Resolution */}
                    {!hiddenColumns.has('resolution') && (
                      <td className="px-3 py-2 font-mono">
                        {row.resolution != null ? (
                          <span className={`font-medium ${getResolutionColor(row.resolution)}`}>
                            {row.resolution.toFixed(2)}Å
                          </span>
                        ) : <span className="text-claude-text-muted">—</span>}
                      </td>
                    )}
                    {/* IF */}
                    {!hiddenColumns.has('journalIf') && (
                      <td className="px-3 py-2">
                        {'journalIf' in row && row.journalIf != null ? (
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${ifStyle.bg} ${ifStyle.text}`}>
                            {row.journalIf.toFixed(1)}
                          </span>
                        ) : <span className="text-claude-text-muted">—</span>}
                      </td>
                    )}
                    {/* Title */}
                    {!hiddenColumns.has('title') && (
                      <td className="px-3 py-2 max-w-xs">
                        <span className="text-claude-text-secondary line-clamp-2 leading-relaxed">
                          {row.title || (blastResult?.description) || '—'}
                        </span>
                      </td>
                    )}
                    {/* Date */}
                    {!hiddenColumns.has('releaseDate') && (
                      <td className="px-3 py-2 text-claude-text-muted whitespace-nowrap">
                        {formatDate(row.releaseDate)}
                      </td>
                    )}
                    {/* Ligands */}
                    {!hiddenColumns.has('_ligands') && (
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const evalLigands = parseLigands('ligand' in row ? row.ligand : null);
                            if (evalLigands.length === 0) return <span className="text-claude-text-muted">—</span>;
                            return (
                              <>
                                {evalLigands.slice(0, 3).map((lig, li) => (
                                  <HoverCard key={`eval-lig-pop-${li}-${lig}`} openDelay={200} closeDelay={100}>
                                    <HoverCardTrigger asChild>
                                      <span
                                        className="ligand-chip"
                                        onMouseEnter={() => fetchLigandInfo(lig)}
                                      >
                                        {lig}
                                      </span>
                                    </HoverCardTrigger>
                                    <HoverCardContent side="top" className="p-0 w-auto bg-white dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] shadow-lg rounded-xl">
                                      {ligandCache[lig] ? (
                                        <LigandTooltipContent ligand={ligandCache[lig]} />
                                      ) : (
                                        <div className="p-3 flex items-center gap-2">
                                          <Loader2 className="h-3 w-3 animate-spin text-claude-accent" />
                                          <span className="text-xs text-claude-text-muted">Loading...</span>
                                        </div>
                                      )}
                                    </HoverCardContent>
                                  </HoverCard>
                                ))}
                                {evalLigands.length > 3 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="ligand-chip cursor-default">+{evalLigands.length - 3}</span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <div className="flex flex-wrap gap-1 max-w-48">
                                        {evalLigands.map((l, li) => (
                                          <span key={`eval-lig-tt-${li}-${l}`} className="ligand-chip">{l}</span>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                    )}
                  </tr>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-52 bg-claude-surface dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] shadow-xl rounded-lg p-1">
                  <ContextMenuItem
                    className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                    onClick={() => onSelectRow(row)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                    View Detail
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                    onClick={() => row.pdbId && onCopyPdbId(row.pdbId)}
                  >
                    <Copy className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                    Copy PDB ID
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                    onClick={() => row.pdbId && onOpenRcsb(row.pdbId)}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                    Open in RCSB PDB
                  </ContextMenuItem>
                  {('pubmedId' in row && row.pubmedId) || ('journal' in row && row.journal) ? (
                    <ContextMenuItem
                      className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                      onClick={() => onSearchPubmed(row)}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                      Search PubMed
                    </ContextMenuItem>
                  ) : null}
                  <ContextMenuSeparator className="bg-claude-border-light my-1" />
                  <ContextMenuItem
                    className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                    onClick={() => onExportRow(row)}
                  >
                    <Download className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                    Export Row
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {totalItems > PAGE_SIZE && (
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-t border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220]">
          <span className="text-[11px] text-claude-text-muted hidden sm:inline">
            Showing <span className="font-mono font-medium text-claude-text-secondary">{((currentPage - 1) * PAGE_SIZE + 1)}</span>–<span className="font-mono font-medium text-claude-text-secondary">{Math.min(currentPage * PAGE_SIZE, totalItems)}</span> of <span className="font-mono font-medium text-claude-text-secondary">{totalItems}</span> entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="pagination-btn btn-press inline-flex items-center justify-center min-h-[44px] sm:min-h-0 sm:h-7 px-2 rounded-md text-[11px] font-medium border border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border disabled:opacity-40 disabled:cursor-not-allowed claude-focus-ring"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />Prev
            </button>
            {Array.from({ length: totalEvalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), currentPage + 2).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`pagination-btn btn-press inline-flex items-center justify-center min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-7 sm:w-7 rounded-md text-[11px] font-medium claude-focus-ring ${
                  currentPage === p
                    ? 'bg-claude-accent text-white shadow-sm pagination-active'
                    : 'border border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalEvalPages}
              className="pagination-btn btn-press inline-flex items-center justify-center min-h-[44px] sm:min-h-0 sm:h-7 px-2 rounded-md text-[11px] font-medium border border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border disabled:opacity-40 disabled:cursor-not-allowed claude-focus-ring"
            >
              Next<ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}