import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function toCamelCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

export async function GET() {
  try {
    // Count structures from pdb_structures table grouped by week_id
    const structureCounts = await db.$queryRaw<any[]>`
      SELECT week_id,
             COUNT(*) as totalStructures,
             SUM(CASE WHEN method = 'ELECTRON MICROSCOPY' THEN 1 ELSE 0 END) as cryoemCount,
             SUM(CASE WHEN method LIKE '%X-RAY%' THEN 1 ELSE 0 END) as xrayCount,
             MIN(release_date) as minDate,
             MAX(release_date) as maxDate
      FROM pdb_structures
      WHERE week_id IS NOT NULL
      GROUP BY week_id
    `;

    // Get snapshot metadata (for created_at ordering)
    const snapshots = await db.$queryRaw<any[]>`
      SELECT week_id, created_at
      FROM weekly_snapshots
      ORDER BY created_at DESC
    `;

    // Merge with actual counts and compute date ranges from release_date
    const countsMap: Record<string, any> = {};
    for (const c of structureCounts) {
      countsMap[c.week_id] = c;
    }

    // Sort by week number descending (W20, W19, W18...)
    const weekNums: Record<string, number> = {};
    for (const s of structureCounts) {
      const wmatch = s.week_id.match(/W(\d+)/);
      weekNums[s.week_id] = wmatch ? parseInt(wmatch[1]) : 0;
    }

    const result = structureCounts
      .sort((a, b) => {
        // Sort by maxDate descending, then by week number
        const datecmp = (b.maxDate || '').localeCompare(a.maxDate || '');
        if (datecmp !== 0) return datecmp;
        return (weekNums[b.week_id] || 0) - (weekNums[a.week_id] || 0);
      })
      .map(s => {
        const maxDate = s.maxDate || s.week_id;
        // Compute week range: end = maxDate, start = maxDate - 6 days
        const endDate = new Date(maxDate);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        const fmt = (d: Date) => d.toISOString().slice(0, 10);
        return {
          weekId: s.week_id,
          weekStart: fmt(startDate),
          weekEnd: fmt(endDate),
          totalStructures: Number(s.totalStructures) || 0,
          cryoemCount: Number(s.cryoemCount) || 0,
          xrayCount: Number(s.xrayCount) || 0,
          createdAt: s.maxDate,
        };
      });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    return NextResponse.json([], { status: 500 });
  }
}