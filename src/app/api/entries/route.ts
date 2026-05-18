import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
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
    const week = searchParams.get('week');
    const method = searchParams.get('method');
    const q = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5000');
    const cappedLimit = limit; // no cap

    const conditions: any[] = [];

    if (week) {
      conditions.push(Prisma.sql`week_id = ${week}`);
    }

    if (method && method !== 'all') {
      if (method === 'Cryo-EM') {
        conditions.push(Prisma.sql`method LIKE ${'%Cryo-EM%'}`);
      } else if (method === 'X-RAY DIFFRACTION') {
        conditions.push(Prisma.sql`method LIKE ${'%X-RAY%'}`);
      } else if (method === 'SOLUTION NMR') {
        conditions.push(Prisma.sql`method LIKE ${'%NMR%'}`);
      } else if (method === 'ELECTRON CRYSTALLOGRAPHY') {
        conditions.push(Prisma.sql`method LIKE ${'%ELECTRON CRYSTALLOGRAPHY%'}`);
      }
    }

    if (q) {
      // Escape LIKE wildcards so they match literally
      const escapedQ = q.replace(/[%_]/g, '\\$&');
      const upperEscapedQ = escapedQ.toUpperCase();
      conditions.push(Prisma.sql`(
        pdb_id LIKE ${'%' + upperEscapedQ + '%'} OR
        title LIKE ${'%' + escapedQ + '%'} OR
        journal LIKE ${'%' + escapedQ + '%'} OR
        organisms LIKE ${'%' + escapedQ + '%'} OR
        ligands LIKE ${'%' + upperEscapedQ + '%'}
      )`);
    }

    const whereClause = conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.sql``;

    const entries = await db.$queryRaw`
      SELECT p.*, a.title AS pubmedTitle, a.authors AS pubmedAuthors, a.abstract AS pubmedAbstract
      FROM pdb_structures p
      LEFT JOIN pubmed_articles a ON p.pubmed_id = a.pubmed_id
      ${whereClause}
      ORDER BY p.release_date DESC
      LIMIT ${cappedLimit}
    `;

    return NextResponse.json((entries as any[]).map(toCamelCase));
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}
