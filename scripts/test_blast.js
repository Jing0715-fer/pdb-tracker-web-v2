#!/usr/bin/env node
// Quick script to check and update blast pubmed data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getRcsb(pdbId) {
  const url = `https://data.rcsb.org/rest/v1/core/entry/${pdbId}`;
  const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!resp.ok) return null;
  const data = await resp.json();
  const citations = data.citation || [];
  let primary = citations.find(c => c.rcsb_is_primary === 'Y') || citations[0];
  if (!primary) return null;
  return {
    pubmedId: primary.pdbx_database_id_PubMed ? String(primary.pdbx_database_id_PubMed) : null,
    title: primary.title || '',
    authors: (primary.rcsb_authors || []).join('; ')
  };
}

async function main() {
  // Check current state
  const blasts = await prisma.evaluationBlastResults.findMany({
    where: { pubmed_id: { not: '' } },
    select: { pdb_id: true, pubmed_id: true, pubmed_title: true },
    take: 3
  });
  console.log('Current DB state (with pubmed_id):', JSON.stringify(blasts, null, 2));
  
  // Get one PDB ID to test
  const test = await prisma.evaluationBlastResults.findFirst({
    where: { OR: [{ pubmed_id: '' }, { pubmed_id: null }] },
    select: { pdb_id: true }
  });
  console.log('Test PDB to fetch:', test?.pdb_id);
  
  if (test?.pdb_id) {
    const result = await getRcsb(test.pdb_id);
    console.log('RCSB result:', result);
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);