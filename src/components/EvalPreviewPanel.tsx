'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3, LayoutGrid, BookOpen, FileText,
  Info, ChevronLeft, X, Clock,
} from 'lucide-react';
import { EvaluationTimeline, EvaluationHeatmap } from './evaluation-timeline';
import { ActivityHeatmap } from './activity-heatmap';
import { YearCalendar } from './YearCalendar';
import { WeeklySummary } from './WeeklySummary';
import { WeeklyTimeline } from './WeeklyTimeline';
import { LiteratureSection } from './LiteratureSection';
import { EvalSummary } from './eval-summary';
import { ComplexEvalSummary } from './ComplexEvalSummary';
import { BatchPreviewContent } from './BatchPreviewContent';
import type { Evaluation, EvaluationReport } from './pdb-helpers';
import type { EvalPdbStructure, EvalBlastResult, EvalRow } from './pdb-tracker';
import type { WeeklySnapshot, PdbEntry } from './types';
import { formatDate } from './pdb-helpers';

// ─── Types ──────────────────────────────────────────────────────────────────

type PreviewTab = 'summary' | 'timeline' | 'heatmap' | 'report';
type Mode = 'weekly' | 'evaluation';

// ─── Props ──────────────────────────────────────────────────────────────────

export interface EvalPreviewPanelProps {
  mode: Mode;
  previewTab: PreviewTab;
  setPreviewTab: (tab: string) => void;
  setPreviewOpen: (open: boolean) => void;
  setSelectedBatchId: (id: string | null) => void;
  setSelectedEval: (evaluation: Evaluation | null) => void;
  setSelectedEvalId: (id: string | null) => void;
  // State
  selectedSnapshot: WeeklySnapshot | null;
  selectedEval: Evaluation | null;
  selectedBatchId: string | null;
  selectedComplexId: string | null;
  complexEvalData: {
    subEvals: Evaluation[];
    group: { id: string; name: string; uniprotIds: string[]; createdAt: number };
    allStructures: (EvalPdbStructure & { _type: 'structure' })[];
    allBlasts: (EvalBlastResult & { _type: 'blast' })[];
    sharedStructureMap: Map<string, number>;
  } | null;
  sortedEvalRows: EvalRow[];
  selectedEvalId: string | null;
  // Data
  entries: PdbEntry[];
  heatmapEntries: PdbEntry[];
  heatmapLoading: boolean;
  snapshots: WeeklySnapshot[];
  weeklyReports: { id: number; title: string | null; createdAt: string }[];
  evalReports: EvaluationReport[];
  evaluations: Evaluation[];
  evalBatches: { batchId: string; title: string }[];
  evalBatchSubTargets: Record<string, { uniprotId: string; proteinName?: string; pdbCount?: number; blastCount?: number }[]>;
  batchFetchedEvals: Record<string, Evaluation>;
  // Callbacks
  setSelectedEntry: (entry: PdbEntry | null) => void;
  setDetailPanelOpen: (open: boolean) => void;
  setSelectedEvalStructure: (s: (EvalPdbStructure & { isBlast?: boolean }) | null) => void;
  openReport: (id: number, title: string) => void;
  openBatchReport: (batchId: string, title: string) => void;
  openEvalReport: (uniprotId: string, title: string) => void;
  setReportModal: (modal: { isOpen: boolean; title: string; content: string }) => void;
  setHighlightedEntry: (id: string | null) => void;
  highlightedEntry: string | null;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function EvalPreviewPanel({
  mode,
  previewTab,
  setPreviewTab,
  setPreviewOpen,
  selectedSnapshot,
  selectedEval,
  selectedBatchId,
  selectedComplexId,
  complexEvalData,
  sortedEvalRows,
  selectedEvalId,
  entries,
  heatmapEntries,
  heatmapLoading,
  snapshots,
  weeklyReports,
  evalReports,
  evaluations,
  evalBatches,
  evalBatchSubTargets,
  batchFetchedEvals,
  setSelectedEntry,
  setDetailPanelOpen,
  setSelectedEvalStructure,
  setSelectedEvalId,
  setSelectedEval,
  setSelectedBatchId,
  openReport,
  openBatchReport,
  openEvalReport,
  setReportModal,
  setHighlightedEntry,
  highlightedEntry,
}: EvalPreviewPanelProps) {
  const weeklyTabs = [
    { value: 'summary', icon: <BarChart3 className="h-3 w-3 mr-1" />, label: 'Summary' },
    { value: 'timeline', icon: <Clock className="h-3 w-3 mr-1" />, label: 'Timeline' },
    { value: 'heatmap', icon: <BookOpen className="h-3 w-3 mr-1" />, label: 'Literature' },
    { value: 'report', icon: <FileText className="h-3 w-3 mr-1" />, label: 'Report' },
  ];
  const evalTabs = [
    { value: 'summary', icon: <BarChart3 className="h-3 w-3 mr-1" />, label: 'Summary' },
    { value: 'timeline', icon: <Clock className="h-3 w-3 mr-1" />, label: 'Timeline' },
    { value: 'heatmap', icon: <BookOpen className="h-3 w-3 mr-1" />, label: 'Literature' },
    { value: 'report', icon: <FileText className="h-3 w-3 mr-1" />, label: 'Report' },
  ];
  const previewTabs = mode === 'weekly' ? weeklyTabs : evalTabs;

  return (
    <Tabs value={previewTab} onValueChange={setPreviewTab} className="h-full flex flex-col min-h-0">
      {/* Tab Header */}
      <div className="relative px-2 pr-9 border-b border-claude-border dark:border-[#3d3832] h-12 flex items-center">
        <TabsList className="w-full h-8 bg-claude-border-light dark:bg-[#2b2926] p-0.5 relative rounded-md">
          {previewTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="tab-gradient-active flex-1 text-[9px] h-7 relative z-[1] data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors duration-200 rounded-md"
            >
              {previewTab === tab.value && (
                <motion.div
                  layoutId="preview-tab-indicator"
                  className="absolute inset-0 rounded-md"
                  style={{ background: 'linear-gradient(135deg, var(--color-claude-accent), var(--color-claude-accent-hover))' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-[2] flex items-center justify-center gap-0.5">
                {tab.icon}
                {tab.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        <button
          onClick={() => setPreviewOpen(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-7 w-7 flex items-center justify-center rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150"
          aria-label="Close preview panel"
        >
          <X className="h-4 w-4 text-claude-text-muted" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto preview-scroll min-h-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={previewTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col min-h-0 flex-1"
          >
            {/* Summary Tab */}
            {previewTab === 'summary' ? (
              mode === 'weekly' && selectedSnapshot ? (
                <WeeklySummary snapshot={selectedSnapshot} snapshots={snapshots} entries={entries} />
              ) : mode === 'evaluation' && selectedBatchId && !selectedEval ? (
                <BatchPreviewContent
                  batchId={selectedBatchId}
                  onSelectSubTarget={(uniprotId) => { setSelectedBatchId(null); setSelectedEval(null); setSelectedEvalId(uniprotId); }}
                  selectedSubTargetId={selectedEvalId}
                  allEvals={evaluations}
                  batchFetchedEvals={batchFetchedEvals}
                  evalBatches={evalBatches}
                  evalBatchSubTargets={evalBatchSubTargets}
                  onOpenBatchReport={openBatchReport}
                />
              ) : mode === 'evaluation' && selectedEval && selectedBatchId ? (
                <div>
                  <button
                    onClick={() => { setSelectedEvalId(null); setSelectedEval(null); }}
                    className="flex items-center gap-1 px-2 py-1.5 mb-2 rounded-md text-[10px] text-claude-text-muted hover:text-claude-accent hover:bg-claude-border-light/50 dark:hover:bg-[#3d3832]/50 transition-colors"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Back to batch
                  </button>
                  <EvalSummary evalData={selectedEval as any} openReport={openEvalReport} />
                </div>
              ) : mode === 'evaluation' && selectedComplexId && complexEvalData && !selectedEval ? (
                <ComplexEvalSummary
                  subEvals={complexEvalData.subEvals}
                  group={complexEvalData.group}
                  openReport={openEvalReport}
                  onSelectEval={(uniprotId) => setSelectedEvalId(uniprotId)}
                />
              ) : mode === 'evaluation' && selectedEval && selectedComplexId && complexEvalData ? (
                <div>
                  <button
                    onClick={() => { setSelectedEvalId(null); setSelectedEval(null); }}
                    className="flex items-center gap-1 px-2 py-1.5 mb-2 rounded-md text-[10px] text-claude-text-muted hover:text-claude-accent hover:bg-claude-border-light/50 dark:hover:bg-[#3d3832]/50 transition-colors"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Back to {complexEvalData.group.name}
                  </button>
                  <EvalSummary evalData={selectedEval as any} openReport={openEvalReport} />
                </div>
              ) : mode === 'evaluation' && selectedEval ? (
                <EvalSummary evalData={selectedEval as any} openReport={openEvalReport} />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted dark:text-[#9b9590]">
                  <Info className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">Select an item to view summary</p>
                </div>
              )
            ) : previewTab === 'timeline' ? (
              /* Timeline Tab - year calendar for weekly, evaluation timeline for eval */
              mode === 'weekly' && entries.length > 0 ? (
                <YearCalendar
                  entries={heatmapEntries.length > 0 ? heatmapEntries : entries}
                  snapshots={snapshots}
                  className="flex-1 min-h-0"
                />
              ) : mode === 'evaluation' && selectedEval && ((selectedEval.pdbStructures?.length || 0) + (selectedEval.blastResults?.length || 0)) > 0 ? (
                <EvaluationTimeline
                  pdbStructures={selectedEval.pdbStructures as unknown as { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null }[]}
                  blastResults={selectedEval.blastResults as unknown as { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null; identity: number | null }[]}
                  onSelectPdb={(pdbId) => {
                    const struct = selectedEval.pdbStructures?.find(s => s.pdbId === pdbId);
                    const blast = selectedEval.blastResults?.find(b => b.pdbId === pdbId);
                    if (struct) {
                      setSelectedEvalStructure(null);
                      setSelectedEntry({ ...struct, _type: 'evaluation' } as unknown as PdbEntry);
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    } else if (blast?.pdbId) {
                      setSelectedEvalStructure(null);
                      setSelectedEntry({ ...blast, _type: 'evaluation' } as unknown as PdbEntry);
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    } else if (blast) {
                      setSelectedEvalStructure({ ...blast, isBlast: true } as unknown as EvalPdbStructure & { isBlast: boolean });
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    }
                  }}
                />
              ) : mode === 'evaluation' && selectedBatchId && !selectedEval && sortedEvalRows.length > 0 ? (
                <EvaluationTimeline
                  pdbStructures={sortedEvalRows.filter(r => r._type === 'structure') as any}
                  blastResults={sortedEvalRows.filter(r => r._type === 'blast') as any}
                  onSelectPdb={(pdbId) => {
                    const struct = sortedEvalRows.find(r => r._type === 'structure' && r.pdbId === pdbId);
                    const blast = sortedEvalRows.find(r => r._type === 'blast' && r.pdbId === pdbId);
                    if (struct) {
                      setSelectedEvalStructure(null);
                      setSelectedEntry({ ...struct, _type: 'evaluation' } as unknown as PdbEntry);
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    } else if (blast?.pdbId) {
                      setSelectedEvalStructure(null);
                      setSelectedEntry({ ...blast, _type: 'evaluation' } as unknown as PdbEntry);
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    } else if (blast) {
                      setSelectedEvalStructure({ ...blast, isBlast: true } as unknown as EvalPdbStructure & { isBlast: boolean });
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    }
                  }}
                />
              ) : mode === 'evaluation' && selectedComplexId && complexEvalData && !selectedEval && ((complexEvalData.allStructures?.length || 0) + (complexEvalData.allBlasts?.length || 0)) > 0 ? (
                <EvaluationTimeline
                  pdbStructures={complexEvalData.allStructures as any}
                  blastResults={complexEvalData.allBlasts.filter(b => b.pdbId) as any}
                  onSelectPdb={(pdbId) => {
                    const struct = complexEvalData.allStructures.find(s => s.pdbId === pdbId);
                    const blast = complexEvalData.allBlasts.find(b => b.pdbId === pdbId);
                    if (struct) {
                      setSelectedEvalStructure(null);
                      setSelectedEntry({ ...struct, _type: 'evaluation' } as unknown as PdbEntry);
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    } else if (blast?.pdbId) {
                      setSelectedEvalStructure(null);
                      setSelectedEntry({ ...blast, _type: 'evaluation' } as unknown as PdbEntry);
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    } else if (blast) {
                      setSelectedEvalStructure({ ...blast, isBlast: true } as unknown as EvalPdbStructure & { isBlast: boolean });
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted dark:text-[#9b9590]">
                  <Clock className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">{mode === 'evaluation' ? 'No PDB structures for timeline' : 'Select a week to view timeline'}</p>
                </div>
              )
            ) : previewTab === 'heatmap' ? (
              /* Literature Tab */
              mode === 'weekly' ? (
                <LiteratureSection
                  entries={entries}
                  onSelectPdb={(pdbId) => {
                    const entry = entries.find(e => e.pdbId === pdbId);
                    if (entry) { setSelectedEntry(entry); setDetailPanelOpen(true); setPreviewTab('summary'); }
                  }}
                />
              ) : mode === 'evaluation' && selectedEval && ((selectedEval.pdbStructures?.length || 0) + (selectedEval.blastResults?.length || 0)) > 0 ? (
                <LiteratureSection
                  pdbStructures={selectedEval.pdbStructures as any}
                  blastResults={selectedEval.blastResults as any}
                  onSelectPdb={(pdbId) => {
                    const struct = selectedEval.pdbStructures?.find((s: any) => s.pdbId === pdbId);
                    const blast = selectedEval.blastResults?.find((b: any) => b.pdbId === pdbId);
                    if (struct) {
                      setSelectedEvalStructure(null);
                      setSelectedEntry({ ...struct, _type: 'evaluation' } as unknown as PdbEntry);
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    } else if (blast?.pdbId) {
                      setSelectedEvalStructure({ ...blast, isBlast: true } as unknown as EvalPdbStructure & { isBlast: boolean });
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    }
                  }}
                />
              ) : mode === 'evaluation' && selectedComplexId && complexEvalData && !selectedEval && ((complexEvalData.allStructures?.length || 0) + (complexEvalData.allBlasts?.length || 0)) > 0 ? (
                <LiteratureSection
                  pdbStructures={complexEvalData.allStructures as any}
                  blastResults={complexEvalData.allBlasts.filter((b: any) => b.pdbId) as any}
                  onSelectPdb={(pdbId) => {
                    const struct = complexEvalData.allStructures.find((s: any) => s.pdbId === pdbId);
                    const blast = complexEvalData.allBlasts.find((b: any) => b.pdbId === pdbId);
                    if (struct) {
                      setSelectedEvalStructure(null);
                      setSelectedEntry({ ...struct, _type: 'evaluation' } as unknown as PdbEntry);
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    } else if (blast?.pdbId) {
                      setSelectedEvalStructure(null);
                      setSelectedEntry({ ...blast, _type: 'evaluation' } as unknown as PdbEntry);
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    } else if (blast) {
                      setSelectedEvalStructure({ ...blast, isBlast: true } as unknown as EvalPdbStructure & { isBlast: boolean });
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    }
                  }}
                />
              ) : mode === 'evaluation' && selectedBatchId && !selectedEval && sortedEvalRows.length > 0 ? (
                <LiteratureSection
                  pdbStructures={sortedEvalRows.filter(r => r._type === 'structure') as any}
                  blastResults={sortedEvalRows.filter(r => r._type === 'blast') as any}
                  onSelectPdb={(pdbId) => {
                    const struct = sortedEvalRows.find((r: any) => r._type === 'structure' && r.pdbId === pdbId);
                    const blast = sortedEvalRows.find((r: any) => r._type === 'blast' && r.pdbId === pdbId);
                    if (struct) {
                      setSelectedEvalStructure(null);
                      setSelectedEntry({ ...struct, _type: 'evaluation' } as unknown as PdbEntry);
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    } else if (blast) {
                      setSelectedEvalStructure({ ...blast, isBlast: true } as unknown as EvalPdbStructure & { isBlast: boolean });
                      setDetailPanelOpen(true);
                      setPreviewTab('summary');
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted dark:text-[#9b9590]">
                  <BookOpen className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">{mode === 'evaluation' ? 'No literature data available' : 'Literature available in evaluation mode'}</p>
                </div>
              )
            ) : (
              /* Report Tab */
              mode === 'weekly' && selectedSnapshot && weeklyReports.length > 0 ? (
                <div className="p-4 space-y-2">
                  {weeklyReports.map(report => (
                    <button
                      key={report.id}
                      onClick={() => openReport(report.id, report.title || 'Weekly Report')}
                      className="w-full text-left p-3 rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] hover:bg-claude-border-light dark:hover:bg-[#2b2926] transition-all duration-150 claude-hover"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-3.5 w-3.5 text-claude-accent" />
                        <span className="text-xs font-medium text-claude-text">{report.title || 'Weekly Report'}</span>
                      </div>
                      <div className="text-[10px] text-claude-text-muted">{formatDate(report.createdAt)}</div>
                    </button>
                  ))}
                </div>
              ) : mode === 'evaluation' && selectedBatchId ? (
                <div className="p-4 space-y-2">
                  <button
                    onClick={() => openBatchReport(selectedBatchId, evalBatches.find(b => b.batchId === selectedBatchId)?.title || 'Batch Report')}
                    className="w-full text-left p-3 rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] hover:border-claude-accent/40 hover:bg-claude-border-light/30 dark:hover:bg-[#3d3832]/30 transition-all duration-150"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-3.5 w-3.5 text-claude-accent" />
                      <span className="text-xs font-semibold text-claude-text">SDG2-CDKC Complex Structure Feasibility Report</span>
                    </div>
                    <div className="text-[10px] text-claude-text-muted">Full batch evaluation report</div>
                  </button>
                  {(evalBatchSubTargets[selectedBatchId] || []).length > 0 && (evalBatchSubTargets[selectedBatchId] || []).map(sub => {
                    const subEval = evaluations.find(e => e.uniprotId === sub.uniprotId) || batchFetchedEvals[sub.uniprotId];
                    return subEval?.report ? (
                      <button
                        key={sub.uniprotId}
                        onClick={() => openEvalReport(sub.uniprotId, subEval.proteinName || subEval.uniprotId + ' Report')}
                        className="w-full text-left p-3 rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] hover:bg-claude-border-light dark:hover:bg-[#2b2926] transition-all duration-150 claude-hover"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-3.5 w-3.5 text-claude-accent" />
                          <span className="text-xs font-medium text-claude-text">{subEval.proteinName || subEval.uniprotId}</span>
                          <span className="text-[9px] text-claude-text-muted font-mono ml-auto">{sub.uniprotId}</span>
                        </div>
                        <div className="text-[10px] text-claude-text-muted">Sub-target evaluation report</div>
                      </button>
                    ) : null;
                  })}
                </div>
              ) : mode === 'evaluation' && selectedEval ? (
                (() => {
                  const filteredReports = evalReports.filter(r => r.uniprotId === selectedEval.uniprotId);
                  return (
                    <div className="p-4 space-y-2">
                      {filteredReports.length > 0 ? filteredReports.map(report => (
                        <button
                          key={report.id}
                          onClick={() => openEvalReport(report.uniprotId, report.title || 'Evaluation Report')}
                          className="w-full text-left p-3 rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] hover:bg-claude-border-light dark:hover:bg-[#2b2926] transition-all duration-150 claude-hover"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-3.5 w-3.5 text-claude-accent" />
                            <span className="text-xs font-medium text-claude-text">{report.title?.startsWith('#') ? 'Evaluation Report' : report.title || 'Evaluation Report'}</span>
                          </div>
                          <div className="text-[10px] text-claude-text-muted">{formatDate(report.createdAt || null)}</div>
                        </button>
                      )) : null}
                      {selectedEval.report ? (
                        <button
                          key="embedded-report"
                          onClick={() => setReportModal({ isOpen: true, title: selectedEval.proteinName || selectedEval.uniprotId + ' Report', content: selectedEval.report || '' })}
                          className="w-full text-left p-3 rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] hover:bg-claude-border-light dark:hover:bg-[#2b2926] transition-all duration-150 claude-hover"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-3.5 w-3.5 text-claude-accent" />
                            <span className="text-xs font-medium text-claude-text">Embedded Report</span>
                          </div>
                          <div className="text-[10px] text-claude-text-muted">Full evaluation report</div>
                        </button>
                      ) : null}
                      {filteredReports.length === 0 && !selectedEval.report ? (
                        <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted">
                          <FileText className="h-8 w-8 mb-2 opacity-30" />
                          <p className="text-xs">No evaluation reports for this entry</p>
                        </div>
                      ) : null}
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted">
                  <FileText className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">No reports available</p>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Tabs>
  );
}
