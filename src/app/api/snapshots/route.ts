import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const snapshots = await db.weeklySnapshot.findMany({
      orderBy: { weekStart: 'desc' },
    });
    return NextResponse.json(snapshots);
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    return NextResponse.json([], { status: 500 });
  }
}
