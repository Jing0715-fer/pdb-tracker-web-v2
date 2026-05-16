'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getScoreColor } from './pdb-helpers';

interface Evaluation {
  uniprotId: string;
  pdbStructures?: { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null; pubmedId: string | null }[];
  blastResults?: { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null; pubmedId?: string | null; identity: number | null }[];
  scores?: string;
  coverage?: number;
  sequenceLength?: number;
  report?: string;
}

interface EvaluationReport {
  id: number;
  title: string | null;
  uniprotId: string;
}

interface LigandInfo {
  code: string;
  name: string;
  smiles?: string;
}

export function EvalSummary({ evalData, openReport }: { evalData: Evaluation; openReport: (uniprotId: string, title: string) => void }) {
  const { theme } = 'dark';
  const isDark = false;

  const scores = useMemo(() => {
    try { return evalData.scores ? JSON.parse(evalData.scores) : {}; }
    catch { return {}; }
  }, [evalData.scores]);

  const overallScore = useMemo(() => {
    const vals = Object.values(scores).map(v => typeof v === 'number' ? v : (v as any)?.score ?? 0) as number[];
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [scores]);

  const [evalReport, setEvalReport] = useState<EvaluationReport | null>(null);

  // BLAST table sort state
  const [blastSortField, setBlastSortField] = useState<string>('identity');
  const [blastSortDir, setBlastSortDir] = useState<'asc' | 'desc'>('desc');

  const blastResults = evalData.blastResults || [];
  const pdbStructures = evalData.pdbStructures || [];

  // Ligand cache for PDB structure tooltips
  const [ligandCache, setLigandCache] = useState<Record<string, LigandInfo>>({});
  const fetchLigandInfo = useCallback(async (code: string) => {
    if (ligandCache[code] || !code) return;
    try {
      const res = await fetch(`/api/ligand/${code}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.code) { setLigandCache(prev => ({ ...prev, [code]: data })); }
      }
    } catch { /* ignore */ }
  }, [ligandCache]);

  // Preload all unique ligands on mount
  useEffect(() => {
    const allCodes = new Set<string>();
    pdbStructures.forEach(s => {
      if (s.ligand) {
        s.ligand.split(/[;,\s]+/).filter(Boolean).forEach(c => allCodes.add(c.trim()));
      }
    });
    allCodes.forEach(code => fetchLigandInfo(code));
  }, [evalData.uniprotId, fetchLigandInfo]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/evaluation-reports');
        const data = await res.json();
        const found = data.find((r: EvaluationReport) => r.uniprotId === evalData.uniprotId);
        if (found) setEvalReport(found);
      } catch { /* ignore */ }
    }
    load();
  }, [evalData.uniprotId]);

  // Sort BLAST results
  const sortedBlastResults = useMemo(() => {
    if (!blastResults.length) return [];
    const sorted = [...blastResults].sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;
      switch (blastSortField) {
        case 'accession': aVal = a.uniprotRef || a.pdbId || ''; bVal = b.uniprotRef || b.pdbId || ''; break;
        case 'organism': aVal = a.description || ''; bVal = b.description || ''; break;
        case 'identity': aVal = a.identity ?? -1; bVal = b.identity ?? -1; break;
        case 'evalue': aVal = a.evalue ?? 999; bVal = b.evalue ?? 999; break;
        case 'score': aVal = a.queryCoverage ?? -1; bVal = b.queryCoverage ?? -1; break;
        default: aVal = a.identity ?? -1; bVal = b.identity ?? -1;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return blastSortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return blastSortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [blastResults, blastSortField, blastSortDir]);

  const handleBlastSort = useCallback((field: string) => {
    if (blastSortField === field) {
      setBlastSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setBlastSortField(field);
      setBlastSortDir('desc');
    }
  }, [blastSortField]);

  // Coverage circular progress SVG
  const coveragePct = Math.min(evalData.coverage ?? 0, 100);
  const coverageColor = coveragePct >= 80 ? '#2d8f8f' : coveragePct >= 50 ? '#c9872e' : coveragePct >= 25 ? '#ea580c' : '#dc2626';
  const coverageLabel = coveragePct >= 80 ? 'Excellent' : coveragePct >= 50 ? 'Moderate' : coveragePct >= 25 ? 'Limited' : 'Very Limited';

  // Animated circular progress
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (Math.min(coveragePct, 100) / 100) * circumference;

  return (
    <div className="p-3 space-y-3">
      {/* ── Evaluation Overview Hero Card ── */}
      <div className="rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] p-3 space-y-3">
        <div className="flex items-start gap-3">
          {/* Circular Coverage Indicator */}
          <div className="flex-shrink-0 relative">
            <svg width="88" height="88" viewBox="0 0 88 88">
              {/* Background circle */}
              <circle
                cx="44" cy="44" r="40"
                fill="none"
                stroke={isDark ? '#3d3832' : '#f0ece5'}
                strokeWidth="6"
              />
              {/* Progress circle */}
              <circle
                cx="44" cy="44" r="40"
                fill="none"
                stroke={coverageColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 44 44)"
                style={{ transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.3s ease' }}
              />
              {/* Center text */}
              <text x="44" y="38" textAnchor="middle" className="fill-claude-text" style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-geist-mono), monospace' }}>
                {coveragePct.toFixed(0)}%
              </text>
              <text x="44" y="52" textAnchor="middle" className="fill-[#9b9590]" style={{ fontSize: '8px', fontWeight: 500 }}>
                coverage
              </text>
            </svg>
          </div>

          {/* Score breakdown */}
          <div className="flex-1 min-w-0 space-y-2">
            {Object.entries(scores).map(([key, value]) => {
              // Handle both number scores and {score: number} object format
              const scoreNum = typeof value === 'number' ? value as number : (value as any)?.score ?? 0;
              const score = scoreNum;
              const pct = Math.min((score / 10) * 100, 100);
              const color = score >= 8 ? '#2d8f8f' : score >= 5 ? '#c9872e' : '#dc2626';
              const textColor = score >= 8 ? 'text-claude-cryoem' : score >= 5 ? 'text-claude-nmr' : 'text-claude-top';
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-claude-text-secondary">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                    <span className={`text-[11px] font-mono font-semibold ${textColor}`}>{score.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 bg-claude-border-light dark:bg-[#1a1917] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Overall score bar */}
          {overallScore !== null && (
            <div className="pt-1 mt-1 border-t border-claude-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-claude-text">Overall Score</span>
                <span className="text-xs font-mono font-bold" style={{ color: getScoreColor(overallScore) }}>{overallScore.toFixed(1)}/10</span>
              </div>
              <div className="h-2 bg-claude-border-light dark:bg-[#1a1917] rounded-full overflow-hidden mt-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((overallScore / 10) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getScoreColor(overallScore) }}
                />
              </div>
            </div>
          )}

          {/* Score Radar Chart */}
          {Object.keys(scores).length >= 3 && (
            <div className="pt-2 mt-2 border-t border-claude-border/50">
              <h5 className="text-[11px] font-semibold text-claude-text mb-2">Score Radar</h5>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={Object.entries(scores).map(([key, value]) => {
                  // Handle both number scores and {score: number} object format
                  const scoreNum = typeof value === 'number' ? value : (value as any)?.score ?? 0;
                  return {
                    metric: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                    score: scoreNum,
                    fullMark: 10,
                  };
                })}>
                  <PolarGrid stroke={isDark ? '#3d3832' : '#e8e4dd'} />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: isDark ? '#9b9590' : '#6b6560' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 8, fill: isDark ? '#6b6560' : '#9b9590' }} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke={isDark ? '#d4784f' : '#c96442'} fill={isDark ? '#d4784f' : '#c96442'} fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Protein Sequence Coverage Bar ── */}
      {evalData.sequenceLength != null && evalData.sequenceLength > 0 && (
        <div className="rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-claude-text">Sequence Coverage</h4>
            <span className="text-[10px] font-mono font-medium" style={{ color: coverageColor }}>
              Coverage: {coveragePct.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-claude-border-light dark:bg-[#1a1917] rounded-full overflow-hidden relative">
            {pdbStructures.length > 0 && pdbStructures.map((s, i) => {
              // Simulate coverage segments - spread structures across the protein
              const segmentWidth = Math.max(2, (coveragePct / pdbStructures.length));
              const leftOffset = (i / pdbStructures.length) * (100 - segmentWidth);
              return (
                <motion.div
                  key={`cov-${s.pdbId}-${i}`}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: `${segmentWidth}%`, opacity: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="absolute top-0 h-full rounded-full"
                  style={{
                    left: `${leftOffset}%`,
                    backgroundColor: isDark ? '#d4784f' : '#c96442',
                    opacity: 0.6 + (0.4 / pdbStructures.length) * (i + 1),
                  }}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[9px] text-claude-text-muted">
            <span>1</span>
            <span className="font-mono">{evalData.sequenceLength} aa</span>
          </div>
        </div>
      )}

      {/* ── Recommendations ── */}
      {evalData.report && (
        <div className="rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] p-3 space-y-1.5">
          <h4 className="text-xs font-semibold text-claude-text">Recommendations</h4>
          <div className="p-2.5 rounded-lg bg-claude-border-light/30 dark:bg-[#2b2926] text-[11px] text-claude-text-secondary dark:text-[#9b9590] leading-relaxed">
            {evalData.report
              .replace(/[#*_]/g, '')
              .split('\n')
              .filter(l => l.trim())
              .slice(-3)
              .join(' ')}
          </div>
        </div>
      )}

      {/* ── View Report Button ── */}
      {evalReport && (
        <Button
          onClick={() => openReport(evalData.uniprotId, evalReport.title || 'Evaluation Report')}
          className="w-full text-xs h-8 bg-claude-accent hover:bg-claude-accent-hover text-white"
        >
          <FileText className="h-3.5 w-3.5 mr-1.5" />
          View Full Report
        </Button>
      )}
    </div>
  );
}