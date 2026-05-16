'use client';

import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RTooltip } from 'recharts';
import { METHOD_COLORS, RESOLUTION_RANGES, ClaudeChartTooltip, getChartAxisColor, getChartTickColor } from './chart-tooltips';
import type { WeeklySnapshot, PdbEntry } from '@/components/types';

// ─── Delta Indicator ──────────────────────────────────────────────────────────

export function DeltaIndicator({ value, suffix = '', invertColor = false }: { value: number | null; suffix?: string; invertColor?: boolean }) {
  if (value === null || value === 0) return <span className="text-[9px] text-claude-text-muted">—</span>;
  const isPositive = value > 0;
  const isGood = invertColor ? !isPositive : isPositive;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-mono font-semibold ${isGood ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
      {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {isPositive ? '+' : ''}{value.toFixed(value % 1 === 0 ? 0 : 2)}{suffix}
    </span>
  );
}

// ─── Week Comparison View ──────────────────────────────────────────────────────

export function WeekComparisonView({
  snapshotA,
  snapshotB,
  entriesA,
  entriesB,
  snapshots,
}: {
  snapshotA: WeeklySnapshot;
  snapshotB: WeeklySnapshot;
  entriesA: PdbEntry[];
  entriesB: PdbEntry[];
  snapshots: WeeklySnapshot[];
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Method data for both weeks
  const methodDataA = useMemo(() => [
    { name: 'Cryo-EM', value: snapshotA.cryoemCount, color: METHOD_COLORS['Cryo-EM'] },
    { name: 'X-ray', value: snapshotA.xrayCount, color: METHOD_COLORS['X-ray'] },
    { name: 'NMR', value: snapshotA.nmrCount, color: METHOD_COLORS['NMR'] },
    { name: 'Other', value: snapshotA.otherCount, color: METHOD_COLORS['Other'] },
  ].filter(d => (d.value ?? 0) > 0), [snapshotA]);

  const methodDataB = useMemo(() => [
    { name: 'Cryo-EM', value: snapshotB.cryoemCount ?? 0, color: METHOD_COLORS['Cryo-EM'] },
    { name: 'X-ray', value: snapshotB.xrayCount ?? 0, color: METHOD_COLORS['X-ray'] },
    { name: 'NMR', value: snapshotB.nmrCount ?? 0, color: METHOD_COLORS['NMR'] },
    { name: 'Other', value: snapshotB.otherCount ?? 0, color: METHOD_COLORS['Other'] },
  ].filter(d => (d.value ?? 0) > 0), [snapshotB]);

  // Resolution distribution for both weeks
  const resDataA = useMemo(() => {
    const combined: Record<string, number> = {};
    try {
      const xd = snapshotA.xrayResDist ? JSON.parse(snapshotA.xrayResDist) : null;
      const cd = snapshotA.cryoemResDist ? JSON.parse(snapshotA.cryoemResDist) : null;
      if (xd) Object.entries(xd).forEach(([r, c]) => { combined[r] = (combined[r] || 0) + (c as number); });
      if (cd) Object.entries(cd).forEach(([r, c]) => { combined[r] = (combined[r] || 0) + (c as number); });
    } catch { /* ignore */ }
    return RESOLUTION_RANGES.map(r => ({
      range: r.label,
      weekA: combined[r.label.replace('Å', '')] || combined[r.label] || 0,
      weekB: 0,
    }));
  }, [snapshotA]);

  const resDataB = useMemo(() => {
    const combined: Record<string, number> = {};
    try {
      const xd = snapshotB.xrayResDist ? JSON.parse(snapshotB.xrayResDist) : null;
      const cd = snapshotB.cryoemResDist ? JSON.parse(snapshotB.cryoemResDist) : null;
      if (xd) Object.entries(xd).forEach(([r, c]) => { combined[r] = (combined[r] || 0) + (c as number); });
      if (cd) Object.entries(cd).forEach(([r, c]) => { combined[r] = (combined[r] || 0) + (c as number); });
    } catch { /* ignore */ }
    return resDataA.map(d => ({
      ...d,
      weekB: combined[d.range.replace('Å', '')] || combined[d.range] || 0,
    }));
  }, [snapshotB, resDataA]);

  // Delta calculations
  const deltas = useMemo(() => {
    const totalDelta = snapshotB.totalStructures - snapshotA.totalStructures;
    const cryoemDelta = (snapshotB.cryoemCount ?? 0) - (snapshotA.cryoemCount ?? 0);
    const xrayDelta = (snapshotB.xrayCount ?? 0) - (snapshotA.xrayCount ?? 0);
    const nmrDelta = (snapshotB.nmrCount ?? 0) - (snapshotA.nmrCount ?? 0);
    const aCryoem = snapshotA.cryoemCount ?? 0;
    const aXray = snapshotA.xrayCount ?? 0;
    const bCryoem = snapshotB.cryoemCount ?? 0;
    const bXray = snapshotB.xrayCount ?? 0;
    const avgResA = snapshotA.cryoemAvgRes != null && snapshotA.xrayAvgRes != null
      ? ((snapshotA.cryoemAvgRes * aCryoem + snapshotA.xrayAvgRes * aXray) / (aCryoem + aXray || 1))
      : snapshotA.cryoemAvgRes ?? snapshotA.xrayAvgRes ?? null;
    const avgResB = snapshotB.cryoemAvgRes != null && snapshotB.xrayAvgRes != null
      ? ((snapshotB.cryoemAvgRes * bCryoem + snapshotB.xrayAvgRes * bXray) / (bCryoem + bXray || 1))
      : snapshotB.cryoemAvgRes ?? snapshotB.xrayAvgRes ?? null;
    const resDelta = avgResA != null && avgResB != null ? avgResB - avgResA : null;
    return { totalDelta, cryoemDelta, xrayDelta, nmrDelta, resDelta };
  }, [snapshotA, snapshotB]);

  return (
    <div className="p-4 space-y-5">
      {/* Comparison Header */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-semibold text-claude-accent">{snapshotA.weekId}</span>
        <span className="text-[10px] text-claude-text-muted">vs</span>
        <span className="font-mono text-xs font-semibold text-claude-xray">{snapshotB.weekId}</span>
      </div>

      {/* Delta Summary Card */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-2.5 rounded-lg ${isDark ? 'bg-claude-border-light' : 'bg-claude-border-light/50'}`}>
          <div className="text-[9px] text-claude-text-muted mb-0.5">Structures</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-claude-text">{snapshotA.totalStructures}→{snapshotB.totalStructures}</span>
            <DeltaIndicator value={deltas.totalDelta} />
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${isDark ? 'bg-claude-border-light' : 'bg-claude-border-light/50'}`}>
          <div className="text-[9px] text-claude-text-muted mb-0.5">Avg Resolution</div>
          <div className="flex items-center gap-2">
            {deltas.resDelta !== null ? (
              <>
                <span className="text-sm font-semibold text-claude-text">
                  {((snapshotB.cryoemAvgRes ?? snapshotB.xrayAvgRes) ?? 0).toFixed(2)}Å
                </span>
                <DeltaIndicator value={deltas.resDelta} suffix="Å" invertColor />
              </>
            ) : (
              <span className="text-sm text-claude-text-muted">—</span>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${isDark ? 'bg-claude-border-light' : 'bg-claude-cryoem-bg/30'}`}>
          <div className="text-[9px] text-claude-cryoem/70 mb-0.5">Cryo-EM</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-claude-cryoem">{snapshotA.cryoemCount}→{snapshotB.cryoemCount}</span>
            <DeltaIndicator value={deltas.cryoemDelta} />
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${isDark ? 'bg-claude-border-light' : 'bg-claude-xray-bg/30'}`}>
          <div className="text-[9px] text-claude-xray/70 mb-0.5">X-ray</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-claude-xray">{snapshotA.xrayCount}→{snapshotB.xrayCount}</span>
            <DeltaIndicator value={deltas.xrayDelta} />
          </div>
        </div>
      </div>

      {/* Side-by-Side Method Donut Charts */}
      <div className="bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-lg p-3 claude-card-shadow chart-container chart-inner-shadow">
        <h4 className="text-xs font-semibold text-claude-text mb-2">Method Distribution</h4>
        <div className="flex items-center gap-1">
          {/* Week A Donut */}
          <div className="flex-1 min-w-0">
            <div className="text-center text-[9px] font-mono font-semibold text-claude-accent mb-1">{snapshotA.weekId}</div>
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={methodDataA} cx="50%" cy="50%" innerRadius={20} outerRadius={40} paddingAngle={2} dataKey="value" stroke="none" animationDuration={600}>
                  {methodDataA.map((entry, index) => (
                    <Cell key={`cell-a-${index}`} fill={entry.color} className="transition-opacity duration-150 hover:opacity-80" />
                  ))}
                </Pie>
                <RTooltip content={({ active, payload }) => <ClaudeChartTooltip active={active} payload={payload as any} isDark={isDark} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* VS Divider */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center px-1">
            <div className={`w-px h-8 ${isDark ? 'bg-[#4a4540]' : 'bg-claude-border'}`} />
            <span className={`text-[8px] font-bold my-1 text-claude-text-muted`}>VS</span>
            <div className={`w-px h-8 ${isDark ? 'bg-[#4a4540]' : 'bg-claude-border'}`} />
          </div>

          {/* Week B Donut */}
          <div className="flex-1 min-w-0">
            <div className="text-center text-[9px] font-mono font-semibold text-claude-xray mb-1">{snapshotB.weekId}</div>
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={methodDataB} cx="50%" cy="50%" innerRadius={20} outerRadius={40} paddingAngle={2} dataKey="value" stroke="none" animationDuration={600}>
                  {methodDataB.map((entry, index) => (
                    <Cell key={`cell-b-${index}`} fill={entry.color} className="transition-opacity duration-150 hover:opacity-80" />
                  ))}
                </Pie>
                <RTooltip content={({ active, payload }) => <ClaudeChartTooltip active={active} payload={payload as any} isDark={isDark} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grouped Bar Chart: Resolution Distribution */}
      {resDataB.some(d => d.weekA > 0 || d.weekB > 0) && (
        <div className="bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-lg p-3 claude-card-shadow chart-container chart-inner-shadow">
          <h4 className="text-xs font-semibold text-claude-text mb-2">Resolution Comparison</h4>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={resDataB} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#3d3832' : '#f0e8df'} vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 8, fill: getChartAxisColor(isDark) }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: getChartTickColor(isDark) }} axisLine={false} tickLine={false} width={24} />
              <RTooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className={`rounded-lg px-3 py-2 text-xs shadow-lg border bg-white dark:bg-[#2b2926] dark:border-[#4a4540] text-claude-text`}>
                    <div className={`font-semibold mb-1 text-[11px] text-claude-text`}>{label}</div>
                    {payload.map((p: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 py-0.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.fill }} />
                        <span className="text-claude-text-secondary">{p.name}</span>
                        <span className={`font-mono font-medium ml-auto text-claude-text`}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                );
              }} />
              <Legend wrapperStyle={{ fontSize: '9px', color: isDark ? '#9b9590' : '#7c756e' }} />
              <Bar dataKey="weekA" name={snapshotA.weekId} fill="#c4644a" radius={[3, 3, 0, 0]} animationDuration={600} style={{ cursor: 'pointer' }} />
              <Bar dataKey="weekB" name={snapshotB.weekId} fill="#2d8f8f" radius={[3, 3, 0, 0]} animationDuration={600} style={{ cursor: 'pointer' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
