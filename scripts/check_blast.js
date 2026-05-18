const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const blasts = await prisma.evaluationBlastResults.findMany({
    where: { uniprot_id: 'O23372' },
    take: 5,
    select: { pdb_id: true, pubmed_id: true, pubmed_title: true }
  });
  console.log('O23372 BLAST sample:');
  blasts.forEach(b => console.log(JSON.stringify(b)));
  const count = await prisma.evaluationBlastResults.count({ where: { pubmed_id: { not: '' } } });
  console.log('Total blasts with pubmed_id:', count);
  await prisma.$disconnect();
}
test().catch(console.error);