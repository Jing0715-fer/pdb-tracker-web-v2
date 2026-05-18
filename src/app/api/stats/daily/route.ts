import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Return daily structure counts grouped by date
    // Pre-computed group query - no BigInt serialization issues
    const rows = await db.$queryRaw<{ date: string; count: string }[]>`
      SELECT release_date as date, CAST(COUNT(*) AS TEXT) as count
      FROM pdb_structures
      WHERE release_date IS NOT NULL AND release_date != ''
      GROUP BY release_date
      ORDER BY release_date DESC
    `;

    const dailyCounts = rows.map(r => ({
      date: r.date,
      count: parseInt(r.count, 10)
    }));

    return NextResponse.json(dailyCounts);
  } catch (error) {
    console.error('Error fetching daily counts:', error);
    return NextResponse.json({ error: 'Failed to fetch daily counts' }, { status: 500 });
  }
}