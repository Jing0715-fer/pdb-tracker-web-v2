#!/usr/bin/env node
// Fetch pubmed data for BLAST results missing it - fixed query
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getRcsbPubmed(pdbId) {
  try {
    const url = `https://data.rcsb.org/rest/v1/core/entry/${pdbId}`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) return { pubmedId: null, title: '', authors: '' };
    const data = await resp.json();
    const citations = data.citation || [];
    let primary = citations.find(c => c.rcsb_is_primary === 'Y') || citations[0];
    if (!primary) return { pubmedId: null, title: '', authors: '' };
    return {
      pubmedId: primary.pdbx_database_id_PubMed ? String(primary.pdbx_database_id_PubMed) : null,
      title: primary.title || '',
      authors: (primary.rcsb_authors || []).join('; ')
    };
  } catch (e) {
    return { pubmedId: null, title: '', authors: '' };
  }
}

async function main() {
  // Use raw SQL to find PDB IDs missing pubmed_id
  const rows = await prisma.$queryRawUnsafe(
    "SELECT DISTINCT pdb_id FROM evaluation_blast_results WHERE (pubmed_id IS NULL OR pubmed_id = '') AND pdb_id IS NOT NULL AND pdb_id != ''"
  );
  const pdbIds = rows.map(r => r.pdb_id).filter(Boolean);
  console.log(`Found ${pdbIds.length} PDB IDs needing pubmed data`);

  if (pdbIds.length === 0) {
    await prisma.$disconnect();
    return;
  }

  let updated = 0;
  for (let i = 0; i < pdbIds.length; i++) {
    const pdbId = pdbIds[i];
    const result = await getRcsbPubmed(pdbId);
    if (result.pubmedId) {
      await prisma.$executeRawUnsafe(
        "UPDATE evaluation_blast_results SET pubmed_id = $1, pubmed_title = $2, pubmed_authors = $3 WHERE pdb_id = $4 AND (pubmed_id IS NULL OR pubmed_id = '')",
        result.pubmedId, result.title, result.authors, pdbId
      );
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