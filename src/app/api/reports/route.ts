import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';

    const where: any = {};
    if (type && type !== 'all') {
      where.report_type = type;
    }

    const reports = await db.weekly_reports.findMany({
      where,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        week_id: true,
        report_type: true,
        title: true,
        filename: true,
        created_at: true,
      },
    });

    // Transform to camelCase for frontend
    const result = reports.map((r: any) => ({
      id: r.id,
      weekId: r.week_id,
      reportType: r.report_type,
      title: r.title,
      filename: r.filename,
      createdAt: r.created_at,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json([], { status: 500 });
  }
}
