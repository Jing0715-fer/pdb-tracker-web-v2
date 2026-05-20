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

    // Fetch PDB structures with pubmed metadata
    const pdbStructures = await db.$queryRaw`
      SELECT p.*, a.title AS pubmedTitle, a.authors AS pubmedAuthors, a.abstract AS pubmedAbstract
      FROM evaluation_pdb_structures p
      LEFT JOIN pubmed_articles a ON p.pubmed_id = a.pubmed_id
      WHERE p.uniprot_id = ${uniprotId}
      ORDER BY p.release_date DESC
    `;
    evaluation.pdbStructures = (pdbStructures as any[]).map(toCamelCase);

    // Fetch BLAST results with pubmed metadata
    const blastResults = await db.$queryRaw`
      SELECT b.*, a.title AS pubmedTitle, a.authors AS pubmedAuthors, a.abstract AS pubmedAbstractJoined,
             b.pubmed_abstract AS pubmedAbstract
      FROM evaluation_blast_results b
      LEFT JOIN pubmed_articles a ON b.pubmed_id = a.pubmed_id
      WHERE b.uniprot_id = ${uniprotId}
      ORDER BY b.identity DESC
    `;
    evaluation.blastResults = (blastResults as any[]).map((b: any) => {
      const row = toCamelCase(b);
      // Prefer blast result's own pubmed_abstract over empty joined abstract
      row.pubmedAbstract = b.pubmed_abstract || b.pubmedAbstract || null;
      row.pubmedTitle = b.pubmed_title || b.pubmedTitle || null;
      row.pubmedAuthors = b.pubmed_authors || b.pubmedAuthors || null;
      delete row.pubmedAbstractJoined;
      return row;
    });

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
