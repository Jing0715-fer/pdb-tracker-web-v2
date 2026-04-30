import { db } from '../src/lib/db';

const JOURNAL_IF: Record<string, number> = {
  'Nature': 64.8,
  'Science': 56.9,
  'Cell': 64.5,
  'Nat. Struct. Mol. Biol.': 16.8,
  'Nat. Methods': 48.0,
  'Nature Communications': 16.6,
  'Nat. Chem. Biol.': 14.7,
  'Proc. Natl. Acad. Sci. U.S.A.': 11.1,
  'eLife': 8.7,
  'Sci. Adv.': 14.9,
  'Cell Res.': 44.1,
  'Nat. Commun.': 16.6,
  'J. Biol. Chem.': 5.5,
  'Acta Crystallogr. D Struct. Biol.': 4.6,
  'Structure': 4.4,
  'J. Mol. Biol.': 5.1,
  'Protein Sci.': 4.2,
  'Biochim. Biophys. Acta': 3.5,
  'PLoS ONE': 3.7,
  'IUCrJ': 4.4,
};

function getIfTier(journalIf: number | null): string {
  if (!journalIf) return 'unknown';
  if (journalIf >= 20) return 'top';
  if (journalIf >= 10) return 'high';
  if (journalIf >= 5) return 'mid';
  return 'low';
}

function getMethod(method: string): { method: string; isCryoem: number; isXray: number } {
  const m = method.toUpperCase();
  if (m.includes('CRYO') || m.includes('ELECTRON MICROSCOPY')) {
    return { method: 'Cryo-EM', isCryoem: 1, isXray: 0 };
  }
  if (m.includes('X-RAY') || m.includes('XRAY')) {
    return { method: 'X-RAY DIFFRACTION', isCryoem: 0, isXray: 1 };
  }
  if (m.includes('NMR') || m.includes('SOLUTION NMR')) {
    return { method: 'SOLUTION NMR', isCryoem: 0, isXray: 0 };
  }
  return { method, isCryoem: 0, isXray: 0 };
}

const METHODS = ['X-RAY DIFFRACTION', 'Cryo-EM', 'SOLUTION NMR', 'ELECTRON CRYSTALLOGRAPHY'];
const JOURNALS = Object.keys(JOURNAL_IF);
const LIGANDS_POOL = [
  'ATP', 'ADP', 'GTP', 'GDP', 'NAD', 'FAD', 'HEM', 'MG', 'ZN', 'CA',
  'HEC', 'BCL', 'BPH', 'LIP', 'OLA', 'STE', 'PLM', 'CHL', 'BCT',
  'AMP', 'CMP', 'GMP', 'TMP', 'UMP', 'ALA', 'GLY', 'VAL', 'LEU',
  'FMN', 'THR', 'POR', 'SUC', 'MAL', 'CIT', 'ISC', 'SAM', 'SAH',
  'COA', 'ACP', 'PAL', 'ADR', 'MLI', 'PEG', 'EPE', 'MES', 'TRS',
];

const PROTEIN_NAMES = [
  'Structure of human protein kinase domain in complex with inhibitor',
  'Cryo-EM structure of the ribosomal large subunit',
  'Crystal structure of SARS-CoV-2 main protease with N3 inhibitor',
  'Structure of GPCR in active state bound to G protein',
  'NMR structure of a zinc finger domain from transcription factor',
  'Cryo-EM structure of ATP synthase from mitochondria',
  'Crystal structure of DNA polymerase in complex with DNA substrate',
  'Structure of antibody-antigen complex at high resolution',
  'Cryo-EM structure of the spliceosome complex',
  'Crystal structure of histone deacetylase with small molecule inhibitor',
  'Structure of EGF receptor kinase domain with allosteric inhibitor',
  'Cryo-EM structure of the nuclear pore complex',
  'Crystal structure of caspase-3 in complex with peptide inhibitor',
  'NMR solution structure of calmodulin in calcium-bound state',
  'Structure of bacterial RNA polymerase transcription elongation complex',
  'Cryo-EM structure of TRPV1 ion channel in lipid nanodisc',
  'Crystal structure of CDK2-cyclin A complex with ATP analog',
  'Structure of F1-ATPase from bovine heart mitochondria',
  'Cryo-EM structure of the human 80S ribosome',
  'Crystal structure of tumor suppressor p53 DNA-binding domain',
  'Structure of BCL-2 family protein in complex with BH3 peptide',
  'Cryo-EM structure of the autophagy initiator complex',
  'Crystal structure of carbonic anhydrase with sulfonamide inhibitor',
  'NMR structure of intrinsically disordered protein tau fragment',
  'Structure of integrin in extended open conformation',
  'Cryo-EM structure of the inflammasome complex',
  'Crystal structure of JAK2 kinase domain with type II inhibitor',
  'Structure of the proteasome regulatory particle at atomic resolution',
  'Cryo-EM structure of the telomerase holoenzyme',
  'Crystal structure of PD-1 in complex with PD-L1',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

function generatePdbId(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = chars[Math.floor(Math.random() * 26) + 10]; // First char: letter
  for (let i = 0; i < 3; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function generateDate(weeksAgo: number, dayOffset: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - weeksAgo * 7 + dayOffset);
  return d.toISOString().split('T')[0];
}

function getWeekId(dateStr: string): string {
  const d = new Date(dateStr);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - startOfYear.getTime();
  const week = Math.ceil((diff / (1000 * 60 * 60 * 24) + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

async function seed() {
  console.log('Seeding database...');

  // Clear existing data
  await db.evaluationBlastResult.deleteMany();
  await db.evaluationPdbStructure.deleteMany();
  await db.evaluationReport.deleteMany();
  await db.evaluation.deleteMany();
  await db.weeklyReport.deleteMany();
  await db.weeklySnapshot.deleteMany();
  await db.pdbChain.deleteMany();
  await db.pdbStructure.deleteMany();

  const usedPdbIds = new Set<string>();
  const structures: any[] = [];
  const snapshots: any[] = [];

  // Generate 12 weeks of data
  for (let week = 0; week < 12; week++) {
    const weekStart = generateDate(week, 1);
    const weekEnd = generateDate(week, 7);
    const weekId = getWeekId(weekStart);

    const totalCryoem = randomInt(8, 25);
    const totalXray = randomInt(15, 45);
    const totalNmr = randomInt(1, 8);
    const totalOther = randomInt(0, 3);

    let cryoemCount = 0, xrayCount = 0, nmrCount = 0, otherCount = 0;
    const weekStructures: any[] = [];

    // Generate structures for this week
    const totalStructures = totalCryoem + totalXray + totalNmr + totalOther;

    for (let i = 0; i < totalStructures; i++) {
      let method: string;
      if (cryoemCount < totalCryoem) { method = 'Cryo-EM'; cryoemCount++; }
      else if (xrayCount < totalXray) { method = 'X-RAY DIFFRACTION'; xrayCount++; }
      else if (nmrCount < totalNmr) { method = 'SOLUTION NMR'; nmrCount++; }
      else { method = 'ELECTRON CRYSTALLOGRAPHY'; otherCount++; }

      let pdbId: string;
      do { pdbId = generatePdbId(); } while (usedPdbIds.has(pdbId));
      usedPdbIds.add(pdbId);

      const methodInfo = getMethod(method);
      const journal = Math.random() > 0.15 ? randomFrom(JOURNALS) : null;
      const journalIf = journal ? (JOURNAL_IF[journal] || null) : null;
      const hasLigands = Math.random() > 0.3;
      const ligandCount = hasLigands ? randomInt(1, 4) : 0;
      const ligandList: string[] = [];
      for (let l = 0; l < ligandCount; l++) {
        ligandList.push(randomFrom(LIGANDS_POOL));
      }

      const resolution = method === 'SOLUTION NMR'
        ? null
        : method === 'Cryo-EM'
          ? parseFloat(randomRange(2.0, 4.5).toFixed(2))
          : parseFloat(randomRange(0.8, 3.5).toFixed(2));

      const releaseDate = generateDate(week, randomInt(1, 7));

      structures.push({
        pdbId,
        method: methodInfo.method,
        releaseDate,
        resolution,
        resolutionHigh: resolution ? parseFloat((resolution + randomRange(0.1, 1.0)).toFixed(2)) : null,
        title: randomFrom(PROTEIN_NAMES),
        doi: journal ? `10.1038/s41586-025-${randomInt(10000, 99999)}` : null,
        journal,
        journalIf,
        authors: `Smith,A.B.; Johnson,C.D.; Lee,E.F.; Wang,H.I.; Brown,K.L.`,
        organisms: Math.random() > 0.4 ? 'Homo sapiens' : randomFrom(['Mus musculus', 'Escherichia coli', 'Saccharomyces cerevisiae', 'Rattus norvegicus', 'Drosophila melanogaster', 'Arabidopsis thaliana']),
        ligands: ligandList.length > 0 ? ligandList.join('|') : null,
        pubmedId: String(randomInt(30000000, 40000000)),
        fetchDate: generateDate(week, 8),
        weekId,
        isCryoem: methodInfo.isCryoem,
        isXray: methodInfo.isXray,
        ifTier: getIfTier(journalIf),
      });
    }

    snapshots.push({
      weekId,
      weekStart,
      weekEnd,
      totalStructures,
      cryoemCount: totalCryoem,
      xrayCount: totalXray,
      nmrCount: totalNmr,
      otherCount: totalOther,
      cryoemAvgRes: totalCryoem > 0 ? parseFloat(randomRange(2.5, 3.8).toFixed(2)) : null,
      xrayAvgRes: totalXray > 0 ? parseFloat(randomRange(1.5, 2.5).toFixed(2)) : null,
      topJournals: JSON.stringify([
        { name: 'Nature', count: randomInt(2, 5) },
        { name: 'Science', count: randomInt(1, 4) },
        { name: 'Cell', count: randomInt(1, 3) },
        { name: 'Nat. Struct. Mol. Biol.', count: randomInt(3, 8) },
        { name: 'eLife', count: randomInt(5, 12) },
      ]),
      ifDist: JSON.stringify({ top: randomInt(3, 8), high: randomInt(5, 15), mid: randomInt(10, 25), low: randomInt(8, 20), unknown: randomInt(2, 8) }),
      cryoemResDist: JSON.stringify({ '0-2': randomInt(0, 3), '2-3': randomInt(5, 12), '3-4': randomInt(3, 8), '4+': randomInt(1, 4) }),
      xrayResDist: JSON.stringify({ '0-1.5': randomInt(3, 8), '1.5-2.0': randomInt(8, 15), '2.0-2.5': randomInt(5, 10), '2.5-3.0': randomInt(3, 8), '3.0+': randomInt(1, 5) }),
      createdAt: generateDate(week, 8),
    });
  }

  // Insert snapshots
  console.log(`Creating ${snapshots.length} weekly snapshots...`);
  for (const snap of snapshots) {
    await db.weeklySnapshot.create({ data: snap });
  }

  // Insert structures in batches
  console.log(`Creating ${structures.length} PDB structures...`);
  const batchSize = 100;
  for (let i = 0; i < structures.length; i += batchSize) {
    const batch = structures.slice(i, i + batchSize);
    await db.pdbStructure.createMany({ data: batch });
  }

  // Create some evaluations
  const evalData = [
    {
      uniprotId: 'P00533',
      entryName: 'EGFR_HUMAN',
      proteinName: 'Epidermal growth factor receptor',
      geneNames: 'EGFR, ERBB1',
      organism: 'Homo sapiens',
      sequenceLength: 1210,
      coverage: 78.5,
      scores: JSON.stringify({ xray: 8.5, cryoem: 7.2, nmr: 3.0 }),
    },
    {
      uniprotId: 'P04637',
      entryName: 'P53_HUMAN',
      proteinName: 'Cellular tumor antigen p53',
      geneNames: 'TP53, P53',
      organism: 'Homo sapiens',
      sequenceLength: 393,
      coverage: 65.2,
      scores: JSON.stringify({ xray: 7.0, cryoem: 6.5, nmr: 4.5 }),
    },
    {
      uniprotId: 'P15056',
      entryName: 'BRAF_HUMAN',
      proteinName: 'Serine/threonine-protein kinase B-raf',
      geneNames: 'BRAF, RAFB1',
      organism: 'Homo sapiens',
      sequenceLength: 766,
      coverage: 72.1,
      scores: JSON.stringify({ xray: 7.8, cryoem: 6.8, nmr: 2.5 }),
    },
    {
      uniprotId: 'Q9GZU1',
      entryName: 'MUC1_HUMAN',
      proteinName: 'Mucin-1',
      geneNames: 'MUC1',
      organism: 'Homo sapiens',
      sequenceLength: 1255,
      coverage: 15.3,
      scores: JSON.stringify({ xray: 3.5, cryoem: 4.8, nmr: 2.0 }),
    },
    {
      uniprotId: 'Q16543',
      entryName: 'CDC37_HUMAN',
      proteinName: 'Hsp90 co-chaperone Cdc37',
      geneNames: 'CDC37',
      organism: 'Homo sapiens',
      sequenceLength: 378,
      coverage: 42.0,
      scores: JSON.stringify({ xray: 5.5, cryoem: 5.0, nmr: 3.5 }),
    },
    {
      uniprotId: 'P62988',
      entryName: 'UBIQ_HUMAN',
      proteinName: 'Ubiquitin',
      geneNames: 'UBB, UBC',
      organism: 'Homo sapiens',
      sequenceLength: 76,
      coverage: 98.7,
      scores: JSON.stringify({ xray: 9.5, cryoem: 9.0, nmr: 9.0 }),
    },
    {
      uniprotId: 'P42345',
      entryName: 'PK3CA_HUMAN',
      proteinName: 'Phosphatidylinositol 4,5-bisphosphate 3-kinase catalytic subunit alpha isoform',
      geneNames: 'PIK3CA',
      organism: 'Homo sapiens',
      sequenceLength: 1068,
      coverage: 55.8,
      scores: JSON.stringify({ xray: 6.5, cryoem: 7.5, nmr: 2.0 }),
    },
    {
      uniprotId: 'O75400',
      entryName: 'FZD4_HUMAN',
      proteinName: 'Frizzled-4',
      geneNames: 'FZD4',
      organism: 'Homo sapiens',
      sequenceLength: 537,
      coverage: 22.0,
      scores: JSON.stringify({ xray: 3.0, cryoem: 5.5, nmr: 2.5 }),
    },
  ];

  console.log(`Creating ${evalData.length} evaluations...`);
  for (const ev of evalData) {
    const evaluation = await db.evaluation.create({
      data: {
        ...ev,
        report: `# ${ev.proteinName} Evaluation Report\n\n## Overview\n- **UniProt ID**: ${ev.uniprotId}\n- **Gene**: ${ev.geneNames}\n- **Organism**: ${ev.organism}\n- **Sequence Length**: ${ev.sequenceLength} aa\n- **Structure Coverage**: ${ev.coverage}%\n\n## Feasibility Scores\n| Method | Score |\n|--------|-------|\n| X-ray  | ${JSON.parse(ev.scores).xray}/10 |\n| Cryo-EM | ${JSON.parse(ev.scores).cryoem}/10 |\n| NMR | ${JSON.parse(ev.scores).nmr}/10 |\n\n## Recommendations\nBased on the analysis, ${ev.proteinName} shows ${ev.coverage > 50 ? 'good' : 'limited'} structural coverage. ${ev.coverage > 50 ? 'Further high-resolution studies are recommended.' : 'Additional structural studies are needed to improve coverage.'}\n`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      },
    });

    // Add some PDB structures for this evaluation
    const structCount = randomInt(3, 10);
    for (let i = 0; i < structCount; i++) {
      const method = randomFrom(['X-RAY DIFFRACTION', 'Cryo-EM', 'SOLUTION NMR']);
      const methodInfo = getMethod(method);
      const res = method === 'SOLUTION NMR' ? null : parseFloat(randomRange(0.8, 4.0).toFixed(2));
      const journal = randomFrom(JOURNALS);
      const journalIf = JOURNAL_IF[journal] || null;

      await db.evaluationPdbStructure.create({
        data: {
          uniprotId: ev.uniprotId,
          pdbId: (() => { let id; do { id = generatePdbId(); } while (usedPdbIds.has(id)); usedPdbIds.add(id); return id; })(),
          method: methodInfo.method,
          resolution: res,
          title: randomFrom(PROTEIN_NAMES),
          releaseDate: generateDate(randomInt(0, 52)),
          journal,
          journalIf,
          isCryoem: methodInfo.isCryoem,
          isXray: methodInfo.isXray,
          isNmr: method === 'SOLUTION NMR' ? 1 : 0,
          ifTier: getIfTier(journalIf),
          updatedAt: new Date().toISOString().split('T')[0],
        },
      });
    }

    // Add some BLAST results for this evaluation
    const blastCount = randomInt(2, 8);
    for (let i = 0; i < blastCount; i++) {
      const method = randomFrom(['X-RAY DIFFRACTION', 'Cryo-EM']);
      const methodInfo = getMethod(method);
      const identity = randomInt(30, 95);
      const evalue = parseFloat(randomRange(1e-50, 1e-3).toExponential(2));
      const journal = Math.random() > 0.3 ? randomFrom(JOURNALS) : null;

      await db.evaluationBlastResult.create({
        data: {
          uniprotId: ev.uniprotId,
          pdbId: (() => { let id; do { id = generatePdbId(); } while (usedPdbIds.has(id)); usedPdbIds.add(id); return id; })(),
          description: randomFrom(PROTEIN_NAMES),
          identity,
          evalue,
          queryCoverage: randomInt(50, 100),
          targetCoverage: randomInt(40, 100),
          method: methodInfo.method,
          resolution: parseFloat(randomRange(1.0, 4.0).toFixed(2)),
          source: Math.random() > 0.5 ? 'BLAST' : 'taxonomy',
          journal,
          journalIf: journal ? (JOURNAL_IF[journal] || null) : null,
          ifTier: getIfTier(journal ? JOURNAL_IF[journal] || null : null),
          updatedAt: new Date().toISOString().split('T')[0],
        },
      });
    }
  }

  // Create some weekly reports
  for (let week = 0; week < Math.min(6, snapshots.length); week++) {
    const snap = snapshots[week];
    for (const type of ['all', 'cryoem', 'xray']) {
      await db.weeklyReport.create({
        data: {
          weekId: snap.weekId,
          weekStart: snap.weekStart,
          weekEnd: snap.weekEnd,
          reportType: type,
          title: `Weekly Report ${snap.weekId} (${type})`,
          content: `# PDB Weekly Report - ${snap.weekId}\n\n## Overview\n- **Period**: ${snap.weekStart} to ${snap.weekEnd}\n- **Total Structures**: ${snap.totalStructures}\n- **Cryo-EM**: ${snap.cryoemCount}\n- **X-ray**: ${snap.xrayCount}\n- **NMR**: ${snap.nmrCount}\n\n## Highlights\nThis week saw ${snap.totalStructures} new structures released in the PDB database. ${snap.cryoemCount > 15 ? 'Cryo-EM continues to be a dominant method.' : 'X-ray crystallography remains the primary method.'}\n`,
          createdAt: snap.createdAt,
        },
      });
    }
  }

  // Create evaluation reports
  for (const ev of evalData.slice(0, 5)) {
    await db.evaluationReport.create({
      data: {
        uniprotId: ev.uniprotId,
        title: `Evaluation Report - ${ev.proteinName}`,
        content: `# ${ev.proteinName} - LLM Generated Report\n\n## Summary\n${ev.proteinName} (${ev.uniprotId}) is a ${ev.sequenceLength} amino acid protein from ${ev.organism}.\n\nCurrent structural coverage is ${ev.coverage}%, with ${ev.coverage > 50 ? 'moderate to good' : 'limited'} representation in the PDB.\n\n## Experimental Recommendations\n- **X-ray Crystallography**: Score ${JSON.parse(ev.scores).xray}/10\n- **Cryo-EM**: Score ${JSON.parse(ev.scores).cryoem}/10\n- **NMR**: Score ${JSON.parse(ev.scores).nmr}/10\n`,
        createdAt: new Date().toISOString().split('T')[0],
      },
    });
  }

  console.log('Seeding complete!');
  console.log(`  - ${snapshots.length} weekly snapshots`);
  console.log(`  - ${structures.length} PDB structures`);
  console.log(`  - ${evalData.length} evaluations`);
  console.log(`  - Weekly reports and evaluation reports created`);
}

seed().catch(console.error);
