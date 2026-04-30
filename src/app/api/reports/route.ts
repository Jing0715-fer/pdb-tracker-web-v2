import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';

    const where: any = {};
    if (type && type !== 'all') {
      where.reportType = type;
    }

    const reports = await db.weeklyReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        weekId: true,
        weekStart: true,
        weekEnd: true,
        reportType: true,
        title: true,
        filename: true,
        createdAt: true,
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
