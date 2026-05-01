import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uniprotId: string }> }
) {
  try {
    const { uniprotId } = await params;
    const evaluation = await db.evaluation.findUnique({
      where: { uniprotId },
      include: {
        pdbStructures: {
          orderBy: { releaseDate: 'desc' },
        },
        blastResults: {
          orderBy: { identity: 'desc' },
        },
      },
    });

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return NextResponse.json({ error: 'Failed to fetch evaluation' }, { status: 500 });
  }
}
