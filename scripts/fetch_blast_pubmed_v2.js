#!/usr/bin/env node
// Re-run pubmed fetch for blast results - fixed version
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getRcsbPubmed(pdbId) {
  try {
    const url = `https://data.rcsb.org/rest/v1/core/entry/${pdbId}`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) return { pubmedId: null, title: '', authors: '', journal: '' };
    const data = await resp.json();
    const citations = data.citation || [];
    let primary = citations.find(c => c.rcsb_is_primary === 'Y') || citations[0];
    if (!primary) return { pubmedId: null, title: '', authors: '', journal: '' };
    return {
      pubmedId: primary.pdbx_database_id_PubMed ? String(primary.pdbx_database_id_PubMed) : null,
      title: primary.title || '',
      authors: (primary.rcsb_authors || []).join('; ')
    };
  } catch (e) {
    return { pubmedId: null, title: '', authors: '', journal: '' };
  }
}

async function main() {
  // Get unique PDB IDs from blast results that are missing pubmed_title
  const blasts = await prisma.evaluationBlastResults.findMany({
    where: {
      AND: [
        { OR: [{ pubmed_id: null }, { pubmed_id: '' }] },
        { pdb_id: { not: null, equals: '' } }
      ]
    },
    select: { pdb_id: true },
    distinct: ['pdb_id']
  });
  
  const pdbIds = blasts.map(b => b.pdb_id).filter(Boolean);
  console.log(`Found ${pdbIds.length} PDB IDs needing pubmed data`);
  
  if (pdbIds.length === 0) {
    // Check if pubmed_id exists but pubmed_title is empty
    const withIdNoTitle = await prisma.evaluationBlastResults.findMany({
      where: {
        AND: [
          { pubmed_id: { not: '' } },
          { pubmed_id: { not: null } },
          { OR: [{ pubmed_title: null }, { pubmed_title: '' }] }
        ]
      },
      select: { pdb_id: true, pubmed_id: true },
      distinct: ['pdb_id']
    });
    console.log(`PDB IDs with pubmed_id but no title: ${withIdNoTitle.length}`);
    if (withIdNoTitle.length > 0) {
      console.log('Sample:', JSON.stringify(withIdNoTitle[0]));
    }
    await prisma.$disconnect();
    return;
  }
  
  let updated = 0;
  for (let i = 0; i < pdbIds.length; i++) {
    const pdbId = pdbIds[i];
    const result = await getRcsbPubmed(pdbId);
    if (result.pubmedId) {
      await prisma.evaluationBlastResults.updateMany({
        where: { pdb_id: pdbId },
        data: {
          pubmed_id: result.pubmedId,
          pubmed_title: result.title,
          pubmed_authors: result.authors
        }
      });
      updated++;
      console.log(`  ${pdbId} -> ${result.pubmedId}: ${result.title.substring(0, 50)}`);
    } else {
      console.log(`  ${pdbId} -> no pubmed`);
    }
    if (i % 20 === 0) console.log(`Progress: ${i}/${pdbIds.length}`);
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\nUpdated ${updated} PDB IDs`);
  await prisma.$disconnect();
}

main().catch(console.error);