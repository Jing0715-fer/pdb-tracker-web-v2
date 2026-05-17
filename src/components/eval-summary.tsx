import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Database, FileSearch, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';
import type { Evaluation } from './pdb-tracker';

interface EvaluationReport {
  id: number;
  uniprotId: string;
  title: string | null;
  createdAt: string;
}

interface EvalSummaryProps {
  evalData: Evaluation;
  openReport: (uniprotId: string, title: string) => void;
}

function getScoreColor(score: number): string {
  if (score >= 8) return '#2d8f8f';
  if (score >= 5) return '#c9872e';
  return '#dc2626';
}

export function EvalSummary({ evalData, openReport }: EvalSummaryProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const pdbStructures = evalData.pdbStructures ?? [];
  const blastResults = evalData.blastResults ?? [];
  const evalReport: EvaluationReport | undefined = (evalData as any).evaluation_report;

  const [pdbSortField, setPdbSortField] = useState<'date' | 'resolution' | 'method'>('date');
  const [pdbSortDir, setPdbSortDir] = useState<'asc' | 'desc'>('desc');
  const [blastSortField, setBlastSortField] = useState<'evalDate' | 'identity' | 'coverage'>('evalDate');
  const [blastSortDir, setBlastSortDir] = useState<'asc' | 'desc'>('desc');

  // Scores from evaluation data
  const scores = useMemo(() => {
    if (!evalData.scores) return {};
    try {
      const parsed = JSON.parse(evalData.scores);
      const s: Record<string, number> = {};
      Object.entries(parsed).forEach(([key, val]) => {
        s[key] = typeof val === 'number' ? val : (val as any)?.score ?? 0;
      });
      return s;
    } catch { return {}; }
  }, [evalData.scores]);

  const overallScore = useMemo(() => {
    const vals = Object.values(scores);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [scores]);

  // Sort PDB structures
  const sortedPdb = useMemo(() => {
    return [...pdbStructures].sort((a, b) => {
      let cmp = 0;
      if (pdbSortField === 'date') cmp = (a.releaseDate || '').localeCompare(b.releaseDate || '');
      else if (pdbSortField === 'resolution') cmp = (a.resolution || 999) - (b.resolution || 999);
      else if (pdbSortField === 'method') cmp = (a.method || '').localeCompare(b.method || '');
      return pdbSortDir === 'asc' ? cmp : -cmp;
    });
  }, [pdbStructures, pdbSortField, pdbSortDir]);

  // Sort BLAST results
  const sortedBlast = useMemo(() => {
    return [...blastResults].sort((a, b) => {
      let cmp = 0;
      if (blastSortField === 'evalDate') cmp = (a.updatedAt || '').localeCompare(b.updatedAt || '');
      else if (blastSortField === 'identity') cmp = (a.identity ?? 0) - (b.identity ?? 0);
      else if (blastSortField === 'coverage') cmp = (a.queryCoverage ?? 0) - (b.queryCoverage ?? 0);
      return blastSortDir === 'asc' ? cmp : -cmp;
    });
  }, [blastResults, blastSortField, blastSortDir]);

  const handlePdbSort = (field: typeof pdbSortField) => {
    if (pdbSortField === field) setPdbSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setPdbSortField(field); setPdbSortDir('desc'); }
  };
  const handleBlastSort = (field: typeof blastSortField) => {
    if (blastSortField === field) setBlastSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setBlastSortField(field); setBlastSortDir('desc'); }
  };

  // Coverage circular progress SVG
  const coveragePct = Math.min(evalData.coverage ?? 0, 100);
  const coverageColor = coveragePct >= 80 ? '#2d8f8f' : coveragePct >= 50 ? '#c9872e' : coveragePct >= 25 ? '#ea580c' : '#dc2626';

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
    </div>
  );
}