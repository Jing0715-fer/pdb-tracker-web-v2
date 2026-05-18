const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fetchPubmedArticle(pubmedId) {
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pubmedId}&retmode=json`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    const result = data.result?.[pubmedId];
    if (!result) return null;
    return {
      pubmedId: String(pubmedId),
      title: result.title || '',
      authors: (result.authors || []).map(a => a.name).join('; '),
      journal: result.fulljournaltitle || result.source || '',
      abstract: result.abstract || ''
    };
  } catch (e) { return null; }
}

async function main() {
  // Find pubmed_ids used in blasts but missing from pubmed_articles
  const blastPubmedIds = await prisma.evaluation_blast_results.findMany({
    where: { AND: [{ pubmed_id: { not: null } }, { pubmed_id: { not: '' } }] },
    select: { pubmed_id: true },
    distinct: ['pubmed_id']
  });
  
  const existingArticles = await prisma.pubmed_articles.findMany({
    select: { pubmed_id: true }
  });
  const existingSet = new Set(existingArticles.map(a => a.pubmed_id));
  
  const missingIds = blastPubmedIds
    .map(b => b.pubmed_id)
    .filter(id => id && !existingSet.has(id));
  
  console.log(`Found ${missingIds.length} pubmed IDs in blasts missing from pubmed_articles`);
  
  let updated = 0;
  for (let i = 0; i < missingIds.length; i++) {
    const pubmedId = missingIds[i];
    const article = await fetchPubmedArticle(pubmedId);
    if (article && article.title) {
      await prisma.pubmed_articles.create({
        data: {
          pubmed_id: article.pubmedId,
          title: article.title,
          authors: article.authors,
          journal: article.journal,
          abstract: article.abstract
        }
      });
      updated++;
      console.log(`  + ${pubmedId}: ${article.title.substring(0, 60)}`);
    } else {
      console.log(`  - ${pubmedId}: no data`);
    }
    if (i % 10 === 0) console.log(`Progress: ${i}/${missingIds.length}`);
    await new Promise(r => setTimeout(r, 350));
  }
  
  console.log(`\nAdded ${updated} pubmed articles`);
  await prisma.$disconnect();
}

main().catch(console.error);