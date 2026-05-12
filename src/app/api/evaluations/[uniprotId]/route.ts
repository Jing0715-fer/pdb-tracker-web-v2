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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uniprotId: string }> }
) {
  try {
    const { uniprotId } = await params;

    // evaluations has @@ignore, must use raw SQL
    const evalRows = await db.$queryRaw`
      SELECT * FROM evaluations WHERE uniprot_id = ${uniprotId}
    `;

    if (!evalRows || (evalRows as any[]).length === 0) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    const evaluation = toCamelCase((evalRows as any[])[0]);

    // Fetch PDB structures
    const pdbStructures = await db.$queryRaw`
      SELECT * FROM evaluation_pdb_structures WHERE uniprot_id = ${uniprotId} ORDER BY release_date DESC
    `;
    evaluation.pdbStructures = (pdbStructures as any[]).map(toCamelCase);

    // Fetch BLAST results
    const blastResults = await db.$queryRaw`
      SELECT * FROM evaluation_blast_results WHERE uniprot_id = ${uniprotId} ORDER BY identity DESC
    `;
    evaluation.blastResults = (blastResults as any[]).map(toCamelCase);

    // Count
    evaluation._count = {
      pdbStructures: (pdbStructures as any[]).length,
      blastResults: (blastResults as any[]).length,
    };

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return NextResponse.json({ error: 'Failed to fetch evaluation' }, { status: 500 });
  }
}
