import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';

    // Get batches with sub-target counts
    const batches = await db.$queryRaw<any[]>`
      SELECT 
        b.batch_id as batchId,
        b.title,
        b.combined_report as combinedReport,
        b.created_at as createdAt,
        COUNT(e.uniprot_id) as subTargetCount
      FROM evaluation_batches b
      LEFT JOIN evaluations e ON e.batch_id = b.batch_id
      GROUP BY b.batch_id
      ORDER BY b.created_at DESC
    `;

    const formattedBatches = batches.map(b => ({
      isBatch: true,
      batchId: b.batchId,
      title: b.title || b.batchId || 'Batch',
      subTargetCount: Number(b.subTargetCount) || 0,
      combinedReport: b.combinedReport || '',
      createdAt: b.createdAt || '',
    }));

    // Get sub-targets for each batch (with PDB structure counts)
    const batchIds = batches.map(b => b.batchId as string);
    let batchSubTargets: Record<string, any[]> = {};
    for (const bid of batchIds) {
      const subs = await db.$queryRaw<any[]>`
        SELECT e.uniprot_id, e.protein_name, e.gene_names, e.organism, e.scores,
               COUNT(p.pdb_id) as pdbCount
        FROM evaluations e
        LEFT JOIN evaluation_pdb_structures p ON e.uniprot_id = p.uniprot_id
        WHERE e.batch_id = ${bid}
        GROUP BY e.uniprot_id
        ORDER BY e.created_at DESC
      `;
      batchSubTargets[bid] = subs.map((s: any) => {
        let scoresObj = {};
        try { scoresObj = s.scores ? JSON.parse(s.scores) : {}; } catch { /* ignore */ }
        return { 
          uniprotId: s.uniprot_id, 
          proteinName: s.protein_name || '', 
          geneName: s.gene_names || '', 
          organism: s.organism || '', 
          pdbCount: Number(s.pdbCount) || 0,
          bestScore: scoresObj?.Overall?.score || 0 
        };
      });
    }

    // Get individual evaluations with full data (pdbStructures + blastResults)
    const evalRows = q
      ? await db.$queryRaw<any[]>`
          SELECT e.* FROM evaluations e
          WHERE e.batch_id IS NULL
          AND (e.uniprot_id LIKE ${'%' + q.toUpperCase() + '%'} OR e.protein_name LIKE ${'%' + q + '%'} OR e.gene_names LIKE ${'%' + q + '%'})
          ORDER BY e.updated_at DESC
          LIMIT 100
        `
      : await db.$queryRaw<any[]>`
          SELECT e.* FROM evaluations e
          WHERE e.batch_id IS NULL
          ORDER BY e.updated_at DESC
          LIMIT 100
        `;

    const individualEvals = await Promise.all(evalRows.map(async (e: any) => {
      const pdbRows = await db.$queryRaw<any[]>`SELECT * FROM evaluation_pdb_structures WHERE uniprot_id = ${e.uniprot_id} ORDER BY pdb_id`;
      const blastRows = await db.$queryRaw<any[]>`SELECT * FROM evaluation_blast_results WHERE uniprot_id = ${e.uniprot_id} ORDER BY id`;
      return {
        uniprotId: e.uniprot_id,
        entryName: e.entry_name,
        proteinName: e.protein_name || '',
        geneNames: e.gene_names || '',
        organism: e.organism || '',
        sequenceLength: e.sequence_length,
        coverage: e.coverage,
        scores: e.scores,
        report: e.report,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
        pdbStructures: pdbRows.map((p: any) => ({
          id: p.id,
          uniprotId: p.uniprot_id,
          pdbId: p.pdb_id,
          method: p.method,
          resolution: p.resolution,
          title: p.title,
          depositionDate: p.deposition_date,
          releaseDate: p.release_date,
          ligand: p.ligand,
          ligandNames: p.ligand_names,
          journal: p.journal,
          journalIf: p.journal_if,
          doi: p.doi,
          pubmedId: p.pubmed_id,
          organism: p.organism,
          authors: p.authors,
          isCryoem: p.is_cryoem,
          isXray: p.is_xray,
          isNmr: p.is_nmr,
          ifTier: p.if_tier,
        })),
        blastResults: blastRows.map((b: any) => ({
          id: b.id,
          uniprotId: b.uniprot_id,
          pdbId: b.pdb_id,
          uniprotRef: b.uniprot_ref,
          description: b.description,
          identity: b.identity,
          evalue: b.evalue,
          queryCoverage: b.query_coverage,
          targetCoverage: b.target_coverage,
          method: b.method,
          resolution: b.resolution,
          releaseDate: b.release_date,
          source: b.source,
          taxonomyId: b.taxonomy_id,
          journal: b.journal,
          journalIf: b.journal_if,
          ifTier: b.if_tier,
          ligand: b.ligand,
          title: b.title,
        })),
      };
    }));

    return NextResponse.json({
      batches: formattedBatches,
      batchSubTargets,
      individualEvals,
    });
  } catch (error) {
    console.error('[api/evaluations] Error:', error);
    return NextResponse.json({ batches: [], batchSubTargets: {}, individualEvals: [] }, { status: 500 });
  }
}