'use client';

import { useTheme } from 'next-themes';
import { useMemo, useRef, useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { METHOD_COLORS } from './chart-tooltips';

// ─── Types ────────────────────────────────────────────────────────────────────

export type EvalTimelineItem = {
  pdbId: string;
  method: string | null;
  resolution: number | null;
  title: string | null;
  ligand: string | null;
  releaseDate: string | null;
  journal: string | null;
  journalIf: number | null;
  isBlast: boolean;
  identity?: number | null;
  _sourceUniport?: string;
  _sharedCount?: number;
};

export type EvalLitItem = EvalTimelineItem & {
  pubmedId: string | null;
  _idx?: number;
};

// ─── Evaluation Timeline ───────────────────────────────────────────────────────

export function EvaluationTimeline({
  pdbStructures,
  blastResults,
  onSelectPdb,
}: {
  pdbStructures: { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null; _sourceUniport?: string; _sharedCount?: number }[];
  blastResults: { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null; identity: number | null; _sourceUniport?: string; _sharedCount?: number }[];
  onSelectPdb: (pdbId: string) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(350);
  const [tooltipData, setTooltipData] = useState<{
    item: EvalTimelineItem;
    x: number;
    y: number;
  } | null>(null);

  // Combine PDB structures and BLAST results
  const allItems: EvalTimelineItem[] = useMemo(() => {
    const pdbItems: EvalTimelineItem[] = pdbStructures.map(s => ({
      ...s,
      isBlast: false,
    }));
    const blastItems: EvalTimelineItem[] = blastResults.map(b => ({
      pdbId: b.pdbId || '',
      method: b.method,
      resolution: b.resolution,
      title: b.title,
      ligand: b.ligand,
      releaseDate: b.releaseDate,
      journal: b.journal,
      journalIf: b.journalIf,
      isBlast: true,
      identity: b.identity,
      _sourceUniport: (b as any)._sourceUniport,
      _sharedCount: (b as any)._sharedCount,
    }));
    // Deduplicate by pdbId (prefer structure over blast for same pdbId)
    const seen = new Set<string>();
    const deduped = [...pdbItems, ...blastItems].filter(item => {
      if (!item.pdbId || !item.releaseDate) return false;
      if (seen.has(item.pdbId)) return false;
      seen.add(item.pdbId);
      return true;
    });
    return deduped;
  }, [pdbStructures, blastResults]);

  // Responsive container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Date range
  const dateRange = useMemo(() => {
    if (allItems.length === 0) return { start: new Date(), end: new Date() };
    const dates = allItems.map(i => new Date(i.releaseDate!)).filter(d => !isNaN(d.getTime()));
    if (dates.length === 0) return { start: new Date(), end: new Date() };
    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }, [allItems]);

  const totalDays = Math.max(1, Math.round((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Generate day labels
  const dayLabels = useMemo(() => {
    const days: { date: Date; dayName: string; dateLabel: string }[] = [];
    const startMs = dateRange.start.getTime();
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startMs + i * 86400000);
      days.push({
        date: d,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    return days;
  }, [dateRange, totalDays]);

  // Group entries by day
  const entriesByDay = useMemo(() => {
    const groups: Record<string, EvalTimelineItem[]> = {};
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(dateRange.start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      groups[key] = [];
    }
    allItems.forEach(item => {
      if (!item.releaseDate) return;
      const entryDate = item.releaseDate.split('T')[0];
      if (groups[entryDate]) {
        groups[entryDate].push(item);
      } else {
        const closest = Object.keys(groups).reduce((prev, curr) =>
          Math.abs(new Date(curr).getTime() - new Date(entryDate).getTime()) <
          Math.abs(new Date(prev).getTime() - new Date(entryDate).getTime()) ? curr : prev
        );
        groups[closest].push(item);
      }
    });
    return groups;
  }, [allItems, dateRange, totalDays]);

  // Timeline stats
  const timelineStats = useMemo(() => {
    const dayCounts = Object.values(entriesByDay).map(e => e.length);
    const maxCount = Math.max(...dayCounts, 0);
    const peakDayIdx = dayCounts.indexOf(maxCount);
    const peakDay = peakDayIdx >= 0 ? dayLabels[peakDayIdx] : null;
    const avgPerDay = allItems.length > 0 ? (allItems.length / totalDays).toFixed(1) : '0';
    return { maxCount, peakDay, avgPerDay };
  }, [entriesByDay, dayLabels, allItems, totalDays]);

  // SVG dimensions
  const svgHeight = 280;
  const marginLeft = 8;
  const marginRight = 8;
  const marginTop = 24;
  const axisY = svgHeight - 50;
  const dayLabelY = axisY + 14;
  const dateLabelY = dayLabelY + 12;
  const usableWidth = containerWidth - marginLeft - marginRight;
  const dayWidth = totalDays > 0 ? usableWidth / totalDays : usableWidth;

  // Get dot color by method
  const getDotColor = (item: EvalTimelineItem): string => {
    const m = item.method?.toUpperCase() || '';
    if (m.includes('CRYO') || m.includes('ELECTRON MICROSCOPY')) return METHOD_COLORS['Cryo-EM'];
    if (m.includes('X-RAY') || m.includes('XRAY')) return METHOD_COLORS['X-ray'];
    if (m.includes('NMR')) return METHOD_COLORS['NMR'];
    return METHOD_COLORS['Other'];
  };

  // Get dot size by IF
  const getDotSize = (item: EvalTimelineItem): number => {
    const if_ = item.journalIf ?? 0;
    return Math.min(16, Math.max(6, (if_ / 50) * 10 + 6));
  };

  // Calculate dot positions
  const dotPositions = useMemo(() => {
    const positions: { item: EvalTimelineItem; cx: number; cy: number; size: number; color: string; dayIndex: number }[] = [];
    const dayKeys = Object.keys(entriesByDay).sort();
    const maxDotsPerStack = 8;
    const dotSpacing = 10;

    dayKeys.forEach((dayKey, dayIdx) => {
      const dayEntries = entriesByDay[dayKey];
      const cx = marginLeft + dayIdx * dayWidth + dayWidth / 2;

      const sortedEntries = [...dayEntries].sort((a, b) => (b.journalIf ?? 0) - (a.journalIf ?? 0));

      sortedEntries.forEach((item, stackIdx) => {
        const size = getDotSize(item);
        const stackGroup = Math.floor(stackIdx / maxDotsPerStack);
        const stackPos = stackIdx % maxDotsPerStack;
        const actualStackPos = stackGroup % 2 === 0 ? stackPos : maxDotsPerStack - 1 - stackPos;
        const rawCY = axisY - 5 - actualStackPos * (size + 2);
        const cy = Math.max(rawCY, marginTop + 10);
        const groupOffset = stackGroup * dotSpacing;
        positions.push({
          item,
          cx: cx + groupOffset,
          cy,
          size,
          color: getDotColor(item),
          dayIndex: dayIdx,
        });
      });
    });
    return positions;
  }, [entriesByDay, dayWidth, marginLeft, axisY]);

  const axisStroke = isDark ? '#4a4540' : '#e8e4dd';
  const textColor = isDark ? '#9b9590' : '#7c756e';

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted dark:text-[#9b9590]">
        <Clock className="h-8 w-8 mb-2 opacity-30" />
        <p className="text-xs">No structures with release dates</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4" ref={containerRef}>
      {/* Timeline Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-claude-text">Publication Timeline</h4>
          <span className="text-[10px] text-claude-text-muted">{allItems.length} structures</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-claude-text-secondary">
            Peak day: <span className="font-semibold text-claude-text">{timelineStats.peakDay?.dayName || '—'}</span>
            <span className="text-claude-text-muted"> ({timelineStats.maxCount} structures)</span>
          </span>
          <span className="text-claude-text-muted">·</span>
          <span className="text-claude-text-secondary">
            Avg/day: <span className="font-semibold text-claude-text">{timelineStats.avgPerDay}</span>
          </span>
        </div>
      </div>

      {/* Timeline SVG Chart */}
      <div className="relative">
        <svg width={containerWidth} height={svgHeight} className="overflow-visible">
          {/* Axis line */}
          <line
            x1={marginLeft}
            y1={axisY}
            x2={containerWidth - marginRight}
            y2={axisY}
            stroke={axisStroke}
            strokeWidth={1}
          />

          {/* Day labels */}
          {dayLabels.filter((_, i) => i % Math.max(1, Math.floor(totalDays / 7)) === 0).map((day, i) => {
            const x = marginLeft + i * Math.max(1, Math.floor(totalDays / 7)) * dayWidth + dayWidth / 2;
            return (
              <g key={`day-${i}`}>
                <line x1={x} y1={axisY} x2={x} y2={axisY + 4} stroke={axisStroke} strokeWidth={1} />
                <text x={x} y={dayLabelY} textAnchor="middle" className="text-[9px] fill-current" style={{ color: textColor }}>
                  {day.dayName}
                </text>
                <text x={x} y={dateLabelY} textAnchor="middle" className="text-[8px] fill-current" style={{ color: textColor }}>
                  {day.dateLabel}
                </text>
              </g>
            );
          })}

          {/* Dots */}
          {dotPositions.map((pos, i) => (
            <circle
              key={`dot-${i}-${pos.item.pdbId}`}
              cx={pos.cx}
              cy={pos.cy}
              r={pos.size / 2}
              fill={pos.color}
              fillOpacity={pos.item.isBlast ? 0.6 : 0.9}
              stroke={isDark ? '#242220' : 'white'}
              strokeWidth={1}
              className="cursor-pointer transition-all duration-150 hover:stroke-[2px] hover:stroke-claude-accent"
              onClick={() => { setTooltipData({ item: pos.item, x: pos.cx, y: pos.cy }); }}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {tooltipData && (
          <div
            className="absolute z-50 w-48 p-2 rounded-lg border border-claude-border dark:border-[#4a4540] bg-white dark:bg-[#242220] shadow-lg text-xs space-y-1"
            style={{
              left: Math.min(tooltipData.x + 10, containerWidth - 200),
              top: Math.max(tooltipData.y - 60, 10),
            }}
            onClick={() => onSelectPdb(tooltipData.item.pdbId)}
          >
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-semibold text-claude-accent">{tooltipData.item.pdbId}</span>
              {tooltipData.item.isBlast && (
                <span className="text-[9px] px-1 py-0.5 rounded bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent">Homolog</span>
              )}
            </div>
            <p className="text-claude-text-secondary dark:text-[#9b9590] line-clamp-2 text-[10px]">{tooltipData.item.title || 'No title'}</p>
            <div className="flex items-center gap-2 text-[10px] text-claude-text-muted">
              {tooltipData.item.resolution && <span>{tooltipData.item.resolution}Å</span>}
              {tooltipData.item.journalIf && <span>IF: {tooltipData.item.journalIf}</span>}
            </div>
            {tooltipData.item.isBlast && tooltipData.item.identity && (
              <div className="text-[10px] text-claude-text-muted">Identity: {tooltipData.item.identity}%</div>
            )}
            <div className="text-[9px] text-claude-accent mt-1">Click to view details →</div>
          </div>
        )}
      </div>

      {/* Click hint */}
      <p className="text-[9px] text-claude-text-muted text-center">Click a dot to view structure details</p>
    </div>
  );
}

// ─── Evaluation Heatmap ────────────────────────────────────────────────────────

export function EvaluationHeatmap({
  pdbStructures,
  blastResults,
  onSelectPdb,
}: {
  pdbStructures: { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null; pubmedId: string | null; _sourceUniport?: string; _sharedCount?: number }[];
  blastResults: { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null; pubmedId?: string | null; identity: number | null; _sourceUniport?: string; _sharedCount?: number }[];
  onSelectPdb: (pdbId: string) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sortDesc, setSortDesc] = useState(true);

  // Combine and sort by IF (deduplicate by pdbId, structure preferred over blast)
  const allLiterature: EvalLitItem[] = useMemo(() => {
    const pdbItems: EvalLitItem[] = pdbStructures.map((s, i) => ({
      ...s, isBlast: false, _idx: i,
      _sourceUniport: (s as any)._sourceUniport,
      _sharedCount: (s as any)._sharedCount,
    }));
    const blastItems: EvalLitItem[] = blastResults.map((b, i) => ({
      ...b,
      pubmedId: b.pubmedId ?? null,
      isBlast: true,
      identity: b.identity,
      _idx: i + pdbStructures.length,
      _sourceUniport: (b as any)._sourceUniport,
      _sharedCount: (b as any)._sharedCount,
    }));
    // Deduplicate: same pdbId prefers structure (isBlast=false) over blast
    const seen = new Set<string>();
    const deduped: EvalLitItem[] = [];
    // First add all structures
    pdbItems.forEach(item => {
      if (item.pdbId) {
        seen.add(item.pdbId);
        deduped.push(item);
      }
    });
    // Then add blasts only if pdbId not already added
    blastItems.forEach(item => {
      if (item.pdbId && !seen.has(item.pdbId)) {
        seen.add(item.pdbId);
        deduped.push(item);
      }
    });
    return deduped;
  }, [pdbStructures, blastResults]);

  // Sort all literature by IF
  const sortedLiterature = useMemo(() => {
    return [...allLiterature].sort((a, b) => {
      const ifA = a.journalIf ?? 0;
      const ifB = b.journalIf ?? 0;
      return sortDesc ? ifB - ifA : ifA - ifB;
    });
  }, [allLiterature, sortDesc]);

  // Group literature by title (same title = same paper = same PubMed ID)
  const literatureByTitle: Record<string, {
    title: string | null;
    journal: string | null;
    journalIf: number | null;
    pubmedId: string | null;
    items: EvalLitItem[];
  }> = useMemo(() => {
    const groups: Record<string, { title: string | null; journal: string | null; journalIf: number | null; pubmedId: string | null; items: EvalLitItem[] }> = {};
    sortedLiterature.forEach(item => {
      // Use pubmedId as key if available, otherwise use title
      const key = item.pubmedId ? `pmid:${item.pubmedId}` : (item.title || `no-title:${item.pdbId}`);
      if (!groups[key]) {
        groups[key] = { title: item.title, journal: item.journal, journalIf: item.journalIf, pubmedId: item.pubmedId, items: [] };
      }
      groups[key].items.push(item);
    });
    return groups;
  }, [sortedLiterature]);

  const groupedLiterature = useMemo(() => {
    return Object.values(literatureByTitle).sort((a, b) => {
      const ifA = a.journalIf ?? 0;
      const ifB = b.journalIf ?? 0;
      return sortDesc ? ifB - ifA : ifA - ifB;
    });
  }, [literatureByTitle, sortDesc]);

  const getMethodColor = (m: string | null) => {
    if (!m) return 'text-claude-text-muted';
    const u = m.toUpperCase();
    if (u.includes('CRYO') || u.includes('ELECTRON')) return 'text-claude-cryoem';
    if (u.includes('X-RAY') || u.includes('XRAY')) return 'text-claude-xray';
    if (u.includes('NMR')) return 'text-claude-nmr';
    return 'text-claude-text-secondary';
  };

  if (allLiterature.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-claude-text-muted dark:text-[#9b9590]">
        <p className="text-xs">No literature data</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-claude-text-muted">{groupedLiterature.reduce((sum, g) => sum + g.items.length, 0)} entries</span>
        <button
          onClick={() => setSortDesc(!sortDesc)}
          className="text-[9px] text-claude-accent hover:text-claude-accent-hover flex items-center gap-0.5"
        >
          {sortDesc ? '↓' : '↑'} IF
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 px-1 min-h-0">
        {groupedLiterature.map((group, gi) => {
          const first = group.items[0];
          const sharedCount = group.items.filter(i => (i._sharedCount ?? 0) > 1).length;
          return (
            <div key={gi} className="rounded-lg border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] overflow-hidden">
              {/* Card header: title as primary heading */}
              <div className="px-2.5 pt-2 pb-1.5 cursor-pointer" onClick={() => group.items.length === 1 ? onSelectPdb(first.pdbId) : null}>
                <p className="text-[11px] font-medium text-claude-text dark:text-[#d4d0c8] leading-relaxed line-clamp-2 mb-1">
                  {group.title || 'No title'}
                </p>
                {/* Meta row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* All PDB IDs in this group */}
                  {group.items.map((item, ii) => (
                    <span
                      key={ii}
                      onClick={(e) => { e.stopPropagation(); onSelectPdb(item.pdbId); }}
                      className={`inline-flex items-center gap-0.5 font-mono text-[10px] font-semibold cursor-pointer hover:text-claude-accent-hover ${ii === 0 ? 'text-claude-accent' : 'text-claude-text-secondary'}`}
                    >
                      {item.pdbId}
                      {item.isBlast && <span className="text-[8px] text-claude-accent">H</span>}
                      {ii < group.items.length - 1 && <span className="text-claude-text-muted font-light">·</span>}
                    </span>
                  ))}
                  <span className={`text-[9px] px-1 py-0.5 rounded ${getMethodColor(first.method)} bg-claude-border-light dark:bg-[#2b2926]`}>
                    {first.method ? first.method.replace(/_/g, ' ').split(' ')[0] : '—'}
                  </span>
                  {(first._sharedCount ?? 0) > 1 && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      +{(first._sharedCount ?? 0) - 1} more source{(first._sharedCount ?? 0) > 2 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              {/* Card footer: journal IF + PubMed */}
              <div className="flex items-center justify-between px-2.5 pb-1.5">
                <span className="text-[10px] text-claude-text-muted">{group.journal || 'Unknown journal'}</span>
                <div className="flex items-center gap-2">
                  {group.journalIf ? (
                    <span className={`text-[11px] font-semibold ${group.journalIf >= 10 ? 'text-claude-accent' : 'text-claude-text-secondary'}`}>
                      IF {group.journalIf.toFixed(1)}
                    </span>
                  ) : null}
                  {group.pubmedId && (
                    <a
                      href={`https://pubmed.gov/${group.pubmedId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] text-claude-accent hover:text-claude-accent-hover flex items-center gap-0.5"
                    >
                      PubMed
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}