import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const week = searchParams.get('week');
    const method = searchParams.get('method');
    const q = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '200');

    const where: Prisma.PdbStructureWhereInput = {};

    if (week) {
      where.weekId = week;
    }

    if (method && method !== 'all') {
      if (method === 'Cryo-EM') {
        where.isCryoem = 1;
      } else if (method === 'X-RAY DIFFRACTION') {
        where.isXray = 1;
      } else if (method === 'SOLUTION NMR') {
        where.method = { contains: 'NMR' };
      } else if (method === 'ELECTRON CRYSTALLOGRAPHY') {
        where.method = { contains: 'ELECTRON CRYSTALLOGRAPHY' };
      }
    }

    if (q) {
      where.OR = [
        { pdbId: { contains: q.toUpperCase() } },
        { title: { contains: q } },
        { journal: { contains: q } },
        { organisms: { contains: q } },
        { ligands: { contains: q.toUpperCase() } },
      ];
    }

    const entries = await db.pdbStructure.findMany({
      where,
      orderBy: { releaseDate: 'desc' },
      take: limit,
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json([], { status: 500 });
  }
}
