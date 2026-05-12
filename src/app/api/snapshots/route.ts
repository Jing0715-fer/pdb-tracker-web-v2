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
    // weekly_snapshots has @@ignore, must use raw SQL
    const snapshots = await db.$queryRaw`
      SELECT * FROM weekly_snapshots ORDER BY week_start DESC
    `;
    return NextResponse.json((snapshots as any[]).map(toCamelCase));
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    return NextResponse.json([], { status: 500 });
  }
}
