'use client';

import { useTheme } from 'next-themes';
import { useMemo, useState } from 'react';
import type { PdbEntry, WeeklySnapshot } from '@/components/types';

// ─── Activity Heatmap ─────────────────────────────────────────────────────────

export function ActivityHeatmap({
  entries,
  snapshots,
  loading,
}: {
  entries: PdbEntry[];
  snapshots: WeeklySnapshot[];
  loading: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  // Calculate date range from all data (snapshots)
  const dateRange = useMemo(() => {
    if (snapshots.length === 0) return { start: new Date(), end: new Date() };
    const sorted = [...snapshots].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
    const start = new Date(sorted[0].weekStart);
    const end = new Date(sorted[sorted.length - 1].weekEnd);
    return { start, end };
  }, [snapshots]);

  // Count entries per day
  const dailyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(entry => {
      if (!entry.releaseDate) return;
      const dateKey = entry.releaseDate.split('T')[0];
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });
    return counts;
  }, [entries]);

  // Build grid data (weeks as rows, days as columns)
  const gridData = useMemo(() => {
    const { start, end } = dateRange;
    const weeks: { date: Date; count: number; dayOfWeek: number }[][] = [];
    let current = new Date(start);
    // Align to start of week (Sunday)
    current.setDate(current.getDate() - current.getDay());

    while (current <= end) {
      const week: { date: Date; count: number; dayOfWeek: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const dateKey = current.toISOString().split('T')[0];
        week.push({
          date: new Date(current),
          count: dailyCounts[dateKey] || 0,
          dayOfWeek: d,
        });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  }, [dateRange, dailyCounts]);

  const maxCount = useMemo(() => {
    return Math.max(...Object.values(dailyCounts), 1);
  }, [dailyCounts]);

  const getColor = (count: number) => {
    if (count === 0) return isDark ? '#2b2926' : '#f0ebe5';
    const intensity = Math.min(count / maxCount, 1);
    const colors = isDark
      ? ['#1a3a3a', '#2d5a5a', '#3d7a7a', '#4d9a9a', '#5dbaba']
      : ['#cce8e8', '#2d8f8f', '#238f8f', '#1a7a7a', '#116a6a'];
    const idx = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
    return colors[idx];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-claude-text-muted">
        <div className="animate-pulse text-xs">Loading activity...</div>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-claude-text-muted dark:text-[#9b9590]">
        <p className="text-xs">No weekly data available</p>
      </div>
    );
  }

  const cellSize = 12;
  const gap = 2;
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 overflow-x-auto pb-1">
        {/* Day labels column */}
        <div className="flex-shrink-0 space-y-0.5">
          {dayLabels.map((day, i) => (
            <div key={day} className="text-[8px] text-claude-text-muted flex items-center" style={{ height: cellSize, lineHeight: `${cellSize}px` }}>
              {i % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5">
          {gridData.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => {
                const dateKey = day.date.toISOString().split('T')[0];
                return (
                  <div
                    key={`${wi}-${di}`}
                    className="rounded-sm cursor-pointer transition-opacity duration-150 hover:opacity-80"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: getColor(day.count),
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredCell({ date: dateKey, count: day.count, x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="absolute z-50 px-2 py-1 text-[10px] rounded border bg-white dark:bg-[#242220] border-claude-border dark:border-[#4a4540] shadow-lg text-claude-text pointer-events-none"
          style={{
            left: Math.min(hoveredCell.x, window.innerWidth - 120),
            top: hoveredCell.y - 30,
          }}
        >
          <span className="font-semibold">{hoveredCell.date}</span>: {hoveredCell.count} {hoveredCell.count === 1 ? 'structure' : 'structures'}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-1 text-[9px] text-claude-text-muted">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-sm"
            style={{
              backgroundColor: intensity === 0
                ? (isDark ? '#2b2926' : '#f0ebe5')
                : (isDark
                    ? ['#1a3a3a', '#2d5a5a', '#3d7a7a', '#4d9a9a', '#5dbaba'][Math.floor(intensity * 5)]
                    : ['#cce8e8', '#2d8f8f', '#238f8f', '#1a7a7a', '#116a6a'][Math.floor(intensity * 5)])
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}