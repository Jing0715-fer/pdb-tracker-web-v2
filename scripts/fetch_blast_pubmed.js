#!/usr/bin/env node
/**
 * Fetch PubMed metadata for evaluation_blast_results missing pubmed_id.
 * Usage: node scripts/fetch_blast_pubmed.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getRcsbPubmed(pdbId) {
  try {
    const url = `https://data.rcsb.org/rest/v1/core/entry/${pdbId}`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) return { pubmedId: null, title: '', authors: '', journal: '' };

    const data = await resp.json();
    const citations = data.citation || [];

    // Find primary citation
    let primary = null;
    for (const c of citations) {
      if (c.rcsb_is_primary === 'Y') { primary = c; break; }
    }
    if (!primary && citations.length > 0) primary = citations[0];
    if (!primary) return { pubmedId: null, title: '', authors: '', journal: '' };

    const pubmedId = primary.pdbx_database_id_PubMed ? String(primary.pdbx_database_id_PubMed) : null;
    const title = primary.title || '';
    const authors = (primary.rcsb_authors || []).join('; ');
    const journal = primary.journal_abbrev || '';

    return { pubmedId, title, authors, journal };
  } catch (e) {
    console.error(`  Error fetching ${pdbId}: ${e.message}`);
    return { pubmedId: null, title: '', authors: '', journal: '' };
  }
}

async function getPubmedAbstract(pubmedId) {
  if (!pubmedId) return '';
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pubmedId}&retmode=json`;
    const resp = await fetch(url, { timeout: 10000 });
    if (!resp.ok) return '';
    const data = await resp.json();
    const result = data.result?.[pubmedId];
    return result?.source || '';
  } catch {
    return '';
  }
}

async function main() {
  // Get all unique PDB IDs in blast results missing pubmed_id
  const blasts = await prisma.evaluation_blast_results.findMany({
    where: {
      pdb_id: { not: null },
      OR: [
        { pubmed_id: null },
        { pubmed_id: '' }
      ]
    },
    select: { pdb_id: true },
    distinct: ['pdb_id']
  });

  const pdbIds = blasts.map(b => b.pdb_id).filter(Boolean);
  console.log(`Found ${pdbIds.length} unique PDB IDs missing pubmed_id`);

  if (pdbIds.length === 0) {
    console.log('Nothing to fetch');
    await prisma.$disconnect();
    return;
  }

  // Get PDB IDs that already have pubmed_id (skip already processed)
  const existing = await prisma.evaluation_blast_results.findMany({
    where: {
      pubmed_id: { not: '', not: null }
    },
    select: { pdb_id: true },
    distinct: ['pdb_id']
  });
  const existingSet = new Set(existing.map(e => e.pdb_id));
  console.log(`PDB IDs already with pubmed_id: ${existingSet.size}`);

  const toFetch = pdbIds.filter(p => !existingSet.has(p));
  console.log(`PDB IDs to fetch: ${toFetch.length}`);

  if (toFetch.length === 0) {
    await prisma.$disconnect();
    return;
  }

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < toFetch.length; i++) {
    const pdbId = toFetch[i];
    if (i > 0 && i % 10 === 0) {
      console.log(`Progress: ${i}/${toFetch.length}`);
    }

    const { pubmedId, title, authors, journal } = await getRcsbPubmed(pdbId);

    if (pubmedId) {
      const abstract = await getPubmedAbstract(pubmedId);

      await prisma.evaluation_blast_results.updateMany({
        where: {
          pdb_id: pdbId,
          OR: [
            { pubmed_id: null },
            { pubmed_id: '' }
          ]
        },
        data: {
          pubmed_id: String(pubmedId),
          pubmed_title: title,
          pubmed_authors: authors,
          pubmed_abstract: abstract
        }
      });

      updated++;
      console.log(`  ${pdbId} -> pubmed:${pubmedId} (${title.substring(0, 50)}...)`);
    } else {
      failed++;
      console.log(`  ${pdbId} -> no pubmed found`);
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nUpdated ${updated} PDB IDs, ${failed} failed`);

  // Verify
  const withPubmed = await prisma.evaluation_blast_results.count({
    where: {
      pubmed_id: { not: '', not: null }
    }
  });
  console.log(`Total blast results with pubmed_id now: ${withPubmed}`);

  await prisma.$disconnect();
}

main().catch(console.error);