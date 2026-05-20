'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Layers, ChevronDown, X } from 'lucide-react';
import type { Evaluation } from './pdb-helpers';
import { getScoreColor } from './pdb-helpers';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ComplexGroup = {
  id: string;
  name: string;
  uniprotIds: string[];
  createdAt: number;
};

export type EvalBatch = {
  isBatch: true;
  batchId: string;
  title: string;
  subTargetCount: number;
  combinedReport: string;
  createdAt: string;
};

export type EvalBatchSubTarget = {
  uniprotId: string;
  proteinName: string;
  geneName: string;
  organism: string;
  bestScore: number;
  pdbCount: number;
  blastCount: number;
};

// ─── Helper: Average Score ──────────────────────────────────────────────────

function getAvgScore(scores: string | null): number {
  if (!scores) return 0;
  try {
    const s = JSON.parse(scores);
    const vals = Object.values(s).map(v => typeof v === 'number' ? v : (v as any)?.score ?? 0) as number[];
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  } catch { return 0; }
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface EvalModeSwitcherProps {
  // Complex groups
  complexGroups: ComplexGroup[];
  selectedComplexId: string | null;
  expandedComplexId: string | null;
  selectedEvalId: string | null;
  evaluations: Evaluation[];
  complexFetchedEvals: Record<string, Evaluation>;
  onSelectComplexGroup: (id: string) => void;
  onToggleExpandedComplex: (id: string | null) => void;
  onRemoveComplexGroup: (id: string) => void;
  // Eval batches
  evalBatches: EvalBatch[];
  evalBatchSubTargets: Record<string, EvalBatchSubTarget[]>;
  selectedBatchId: string | null;
  expandedEvalGroups: Set<string>;
  batchFetchedEvals: Record<string, Evaluation>;
  onSelectBatch: (id: string) => void;
  onSelectBatchSubTarget: (batchId: string, uniprotId: string) => void;
  onToggleExpandedBatch: (id: string, expanded: boolean) => void;
  // Dialog
  showComplexDialog: boolean;
  onOpenComplexDialog: () => void;
}

// ─── Sub-Component: Complex Group Card ────────────────────────────────────

function ComplexGroupCard({
  group,
  isExpanded,
  isSelected,
  selectedEvalId,
  evaluations,
  complexFetchedEvals,
  onToggle,
  onRemove,
  onSelect,
  onSelectSubTarget,
}: {
  group: ComplexGroup;
  isExpanded: boolean;
  isSelected: boolean;
  selectedEvalId: string | null;
  evaluations: Evaluation[];
  complexFetchedEvals: Record<string, Evaluation>;
  onToggle: () => void;
  onRemove: () => void;
  onSelect: () => void;
  onSelectSubTarget: (uid: string) => void;
}) {
  const totalPdbs = group.uniprotIds.reduce((sum, uid) => {
    const ev = evaluations.find(e => e.uniprotId === uid);
    return sum + (ev?._count?.pdbStructures || 0);
  }, 0);
  const totalBlasts = group.uniprotIds.reduce((sum, uid) => {
    const ev = evaluations.find(e => e.uniprotId === uid);
    return sum + (ev?._count?.blastResults || 0);
  }, 0);
  const groupScores = group.uniprotIds.map(uid => {
    const ev = evaluations.find(e => e.uniprotId === uid);
    return ev ? getAvgScore(ev.scores) : null;
  }).filter((s): s is number => s !== null);
  const groupAvgScore = groupScores.length > 0 ? groupScores.reduce((a, b) => a + b, 0) / groupScores.length : null;
  const groupScoreColor = groupAvgScore !== null ? getScoreColor(groupAvgScore) : '#9b9590';
  const groupCoverages = group.uniprotIds.map(uid => {
    const ev = evaluations.find(e => e.uniprotId === uid);
    if (!ev) return null;
    const computedCoverage = ev.pdbStructures?.length > 0
      ? Math.max(...(ev.pdbStructures || []).map((s: any) => s.coverage || 0))
      : null;
    return Math.min((ev.coverage != null && ev.coverage > 0) ? ev.coverage : computedCoverage ?? 0, 100);
  }).filter((c): c is number => c !== null && c > 0);
  const groupAvgCoverage = groupCoverages.length > 0 ? groupCoverages.reduce((a, b) => a + b, 0) / groupCoverages.length : null;

  return (
    <div key={group.id}>
      <div
        onClick={onSelect}
        className={`w-full text-left p-3 rounded-[10px] border transition-all duration-200 claude-hover btn-press active:scale-[0.97] cursor-pointer ${
          isSelected
            ? 'bg-purple-50/80 dark:bg-purple-900/15 border-purple-300/50 dark:border-purple-700/40 shadow-sm border-l-[3px] border-l-purple-500'
            : 'bg-claude-surface dark:bg-[#242220] border-claude-border dark:border-[#3d3832] hover:border-claude-border-light dark:hover:border-[#4a4540] claude-card-shadow'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-claude-accent flex-shrink-0" />
              <span className="text-xs font-semibold text-claude-text dark:text-[#e8e4dd] truncate">{group.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {groupAvgScore !== null && (
              <span
                className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                style={{ color: groupScoreColor, backgroundColor: `${groupScoreColor}15` }}
              >
                {groupAvgScore.toFixed(1)}
              </span>
            )}
            <button
              onClick={onToggle}
              className="h-5 w-5 flex items-center justify-center rounded hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150"
            >
              <ChevronDown className={`h-3 w-3 text-claude-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            <button
              onClick={onRemove}
              className="h-5 w-5 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
            >
              <X className="h-3 w-3 text-claude-text-muted hover:text-red-500" />
            </button>
          </div>
        </div>
        <div className="text-[11px] text-claude-text-secondary dark:text-[#9b9590] line-clamp-1 leading-tight">
          {group.uniprotIds.length} UniProt IDs
        </div>
        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-claude-text-muted dark:text-[#6b6560]">
          {groupAvgCoverage !== null && <span>{groupAvgCoverage.toFixed(1)}% coverage</span>}
          <span>·</span>
          <span>{totalPdbs} PDB</span>
          <span>{totalBlasts} BLAST</span>
        </div>
        {/* Expanded sub-entries */}
        {isExpanded && (
          <div className="mt-2 pt-2 space-y-1 border-t border-claude-border/50 dark:border-[#3d3832]/50" onClick={(e) => e.stopPropagation()}>
            {group.uniprotIds.map(uid => {
              const subEv = evaluations.find(e => e.uniprotId === uid) || complexFetchedEvals[uid];
              const subScore = subEv ? getAvgScore(subEv.scores) : null;
              const subColor = subScore !== null ? getScoreColor(subScore) : '#9b9590';
              return (
                <button
                  key={uid}
                  onClick={(e) => { e.stopPropagation(); onSelectSubTarget(uid); }}
                  className={`w-full text-left p-1.5 rounded-md transition-colors duration-150 flex items-center gap-1.5 ${
                    selectedEvalId === uid && isSelected
                      ? 'bg-claude-accent-light dark:bg-[#3d2a22] border border-claude-accent/30'
                      : 'hover:bg-claude-border-light dark:hover:bg-claude-border'
                  }`}
                >
                  <span className="font-mono text-[10px] font-semibold text-claude-accent">{uid}</span>
                  {subEv && (
                    <>
                      <span className="text-[9px] text-claude-text-muted dark:text-[#6b6560] truncate flex-1">{subEv.proteinName || subEv.entryName}</span>
                      {subScore !== null && (
                        <span className="text-[9px] font-mono font-bold" style={{ color: subColor }}>
                          {subScore.toFixed(1)}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-Component: Eval Batch Card ───────────────────────────────────────

function EvalBatchCard({
  batch,
  isExpanded,
  isSelected,
  subs,
  evaluations,
  batchFetchedEvals,
  selectedEvalId,
  onToggle,
  onSelect,
  onSelectSubTarget,
}: {
  batch: EvalBatch;
  isExpanded: boolean;
  isSelected: boolean;
  subs: EvalBatchSubTarget[];
  evaluations: Evaluation[];
  batchFetchedEvals: Record<string, Evaluation>;
  selectedEvalId: string | null;
  onToggle: () => void;
  onSelect: () => void;
  onSelectSubTarget: (uniprotId: string) => void;
}) {
  const totalPDB = subs.reduce((sum, sub) => sum + (sub.pdbCount || 0), 0);
  const totalBLAST = subs.reduce((sum, sub) => sum + (sub.blastCount || 0), 0);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div
        onClick={onSelect}
        className={`w-full text-left p-3 rounded-[10px] border transition-all duration-200 claude-hover btn-press active:scale-[0.97] cursor-pointer ${
          isSelected
            ? 'bg-purple-50/80 dark:bg-purple-900/15 border-purple-300/50 dark:border-purple-700/40 shadow-sm border-l-[3px] border-l-purple-500'
            : 'bg-claude-surface dark:bg-[#242220] border-claude-border dark:border-[#3d3832] hover:border-claude-border-light dark:hover:border-[#4a4540] claude-card-shadow'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-purple-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-claude-text dark:text-[#e8e4dd] truncate">{batch.title || batch.batchId}</span>
              <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">{batch.subTargetCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onToggle}
              className="h-5 w-5 flex items-center justify-center rounded hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150"
            >
              <ChevronDown className={`h-3 w-3 text-claude-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
            </button>
          </div>
        </div>
        <div className="text-[11px] text-claude-text-secondary dark:text-[#9b9590] line-clamp-1 leading-tight">
          {subs.length} sub-targets
        </div>
        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-claude-text-muted dark:text-[#6b6560]">
          <span>{totalPDB} PDB</span>
          <span>·</span>
          <span>{totalBLAST} BLAST</span>
        </div>
        <CollapsibleContent>
          <div className="mt-2 pt-2 space-y-1 border-t border-claude-border/50 dark:border-[#3d3832]/50" onClick={(e) => e.stopPropagation()}>
            {subs.map((sub) => {
              const subEv = evaluations.find(e => e.uniprotId === sub.uniprotId) || batchFetchedEvals[sub.uniprotId];
              const subScore = subEv ? getAvgScore(subEv.scores) : (sub.bestScore || null);
              const subColor = subScore !== null ? getScoreColor(subScore) : '#9b9590';
              return (
                <button
                  key={sub.uniprotId}
                  onClick={(e) => { e.stopPropagation(); onSelectSubTarget(sub.uniprotId); }}
                  className={`w-full text-left p-1.5 rounded-md transition-colors duration-150 flex items-center gap-1.5 ${
                    selectedEvalId === sub.uniprotId && isSelected
                      ? 'bg-purple-100 dark:bg-purple-900/25 border border-purple-300/40 dark:border-purple-600/30'
                      : 'hover:bg-claude-border-light dark:hover:bg-claude-border'
                  }`}
                >
                  <span className="font-mono text-[10px] font-semibold text-purple-600 dark:text-purple-400">{sub.uniprotId}</span>
                  <span className="text-[9px] text-claude-text-muted dark:text-[#6b6560] truncate flex-1">{subEv ? (subEv.proteinName || subEv.entryName) : (sub.proteinName || '')}</span>
                  {subScore !== null && (
                    <span className="text-[9px] font-mono font-bold" style={{ color: subColor }}>
                      {subScore.toFixed(1)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function EvalModeSwitcher({
  complexGroups,
  selectedComplexId,
  expandedComplexId,
  selectedEvalId,
  evaluations,
  complexFetchedEvals,
  onSelectComplexGroup,
  onToggleExpandedComplex,
  onRemoveComplexGroup,
  evalBatches,
  evalBatchSubTargets,
  selectedBatchId,
  expandedEvalGroups,
  batchFetchedEvals,
  onSelectBatch,
  onSelectBatchSubTarget,
  onToggleExpandedBatch,
  showComplexDialog,
  onOpenComplexDialog,
}: EvalModeSwitcherProps) {
  return (
    <>
      {/* Complex Groups (user-created) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-claude-text-muted">Complex Evaluation</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenComplexDialog}
                className="h-5 w-5 flex items-center justify-center rounded text-claude-accent hover:bg-claude-accent-light dark:hover:bg-[#3d2a22] transition-colors duration-150"
              >
                <Layers className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Create complex group</TooltipContent>
          </Tooltip>
        </div>
        {complexGroups.length > 0 ? (
          complexGroups.map(group => (
            <ComplexGroupCard
              key={group.id}
              group={group}
              isExpanded={expandedComplexId === group.id}
              isSelected={selectedComplexId === group.id}
              selectedEvalId={selectedEvalId}
              evaluations={evaluations}
              complexFetchedEvals={complexFetchedEvals}
              onToggle={() => onToggleExpandedComplex(expandedComplexId === group.id ? null : group.id)}
              onRemove={() => onRemoveComplexGroup(group.id)}
              onSelect={() => onSelectComplexGroup(group.id)}
              onSelectSubTarget={(uid) => onSelectComplexGroup(group.id)} // Complex groups handle sub-target via parent
            />
          ))
        ) : (
          <div className="text-[10px] text-claude-text-muted/60 dark:text-[#9b9590] text-center py-1.5">
            Click + to create a complex group
          </div>
        )}
      </div>

      <Separator className="my-2" />

      {/* Eval Batches */}
      {evalBatches.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-claude-text-muted mb-1 flex items-center gap-1">
            <Layers className="h-3 w-3 text-purple-500" />
            Complex Evaluation
          </div>
          <div className="space-y-1.5">
            {evalBatches.map(batch => (
              <EvalBatchCard
                key={batch.batchId}
                batch={batch}
                isExpanded={expandedEvalGroups.has(batch.batchId)}
                isSelected={selectedBatchId === batch.batchId}
                subs={evalBatchSubTargets[batch.batchId] || []}
                evaluations={evaluations}
                batchFetchedEvals={batchFetchedEvals}
                selectedEvalId={selectedEvalId}
                onToggle={() => onToggleExpandedBatch(batch.batchId, !expandedEvalGroups.has(batch.batchId))}
                onSelect={() => onSelectBatch(batch.batchId)}
                onSelectSubTarget={(uid) => onSelectBatchSubTarget(batch.batchId, uid)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}