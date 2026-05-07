import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');

    const where: Prisma.EvaluationWhereInput = {};
    if (q) {
      where.OR = [
        { uniprotId: { contains: q.toUpperCase() } },
        { proteinName: { contains: q } },
        { geneNames: { contains: q } },
        { organism: { contains: q } },
      ];
    }

    const evaluations = await db.evaluation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        uniprotId: true,
        entryName: true,
        proteinName: true,
        geneNames: true,
        organism: true,
        sequenceLength: true,
        coverage: true,
        scores: true,
        report: true,
        updatedAt: true,
        pdbStructures: {
          select: {
            pdbId: true,
            method: true,
            resolution: true,
            title: true,
            ligand: true,
          },
        },
        blastResults: {
          select: {
            id: true,
            pdbId: true,
            uniprotRef: true,
            description: true,
            identity: true,
            evalue: true,
            queryCoverage: true,
          },
        },
        _count: {
          select: {
            pdbStructures: true,
            blastResults: true,
          },
        },
      },
    });

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json([], { status: 500 });
  }
}
