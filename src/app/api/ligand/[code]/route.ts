import { NextResponse } from 'next/server';

// Ligand information from RCSB CCD
const LIGAND_DB: Record<string, { name: string; formula: string; weight: string; type: string; description: string }> = {
  ATP: { name: 'Adenosine-5\'-triphosphate', formula: 'C10H16N5O13P3', weight: '507.18', type: 'NUCLEOTIDE', description: 'ATP is a nucleotide that provides energy to drive many processes in living cells.' },
  ADP: { name: 'Adenosine-5\'-diphosphate', formula: 'C10H15N5O10P2', weight: '427.20', type: 'NUCLEOTIDE', description: 'ADP is an important organic compound in metabolism.' },
  GTP: { name: 'Guanosine-5\'-triphosphate', formula: 'C10H16N5O14P3', weight: '523.18', type: 'NUCLEOTIDE', description: 'GTP is a nucleotide that functions as an energy source and signaling molecule.' },
  NAD: { name: 'Nicotinamide adenine dinucleotide', formula: 'C21H27N7O14P2', weight: '663.43', type: 'COENZYME', description: 'NAD is a coenzyme found in all living cells, essential for metabolism.' },
  FAD: { name: 'Flavin adenine dinucleotide', formula: 'C27H33N9O15P2', weight: '785.56', type: 'COENZYME', description: 'FAD is a redox cofactor involved in several important metabolic pathways.' },
  HEM: { name: 'Protoporphyrin IX containing Fe', formula: 'C34H32FeN4O4', weight: '616.49', type: 'PROSTHETIC GROUP', description: 'Heme is an iron-containing compound that forms the non-protein part of hemoglobin.' },
  MG: { name: 'Magnesium ion', formula: 'Mg', weight: '24.31', type: 'ION', description: 'Magnesium is an essential mineral for many enzymatic reactions.' },
  ZN: { name: 'Zinc ion', formula: 'Zn', weight: '65.38', type: 'ION', description: 'Zinc is an essential trace element important for protein structure and function.' },
  CA: { name: 'Calcium ion', formula: 'Ca', weight: '40.08', type: 'ION', description: 'Calcium plays important roles in signal transduction and structural stability.' },
  HEC: { name: 'Heme C', formula: 'C34H32FeN4O4', weight: '616.49', type: 'PROSTHETIC GROUP', description: 'Heme C is a covalently bound heme found in cytochromes.' },
  FMN: { name: 'Flavin mononucleotide', formula: 'C17H21N4O9P', weight: '456.35', type: 'COENZYME', description: 'FMN is a biomolecule produced by oxidation of riboflavin.' },
  SAM: { name: 'S-adenosylmethionine', formula: 'C15H22N6O5S', weight: '398.44', type: 'COENZYME', description: 'SAM is a common co-substrate involved in methyl group transfers.' },
  SAH: { name: 'S-adenosyl-L-homocysteine', formula: 'C14H20N6O5S', weight: '384.41', type: 'COENZYME', description: 'SAH is formed after donation of the methyl group of SAM.' },
  COA: { name: 'Coenzyme A', formula: 'C21H36N7O16P3S', weight: '767.54', type: 'COENZYME', description: 'CoA is notable for its role in the synthesis and oxidation of fatty acids.' },
  AMP: { name: 'Adenosine monophosphate', formula: 'C10H14N5O7P', weight: '347.22', type: 'NUCLEOTIDE', description: 'AMP is a nucleotide found in RNA.' },
  PEG: { name: 'Di(hydroxyethyl)ether', formula: 'C4H10O3', weight: '106.12', type: 'SOLVENT', description: 'PEG is a polyether compound commonly used as a precipitant and cryoprotectant.' },
  EPE: { name: '4-(2-Hydroxyethyl)-1-piperazine ethanesulfonic acid', formula: 'C8H18N2O4S', weight: '238.30', type: 'BUFFER', description: 'HEPES is a buffering agent commonly used in biochemistry.' },
  MES: { name: '2-(N-morpholino)ethanesulfonic acid', formula: 'C6H13NO4S', weight: '195.24', type: 'BUFFER', description: 'MES is a buffering agent used in biochemistry and molecular biology.' },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const ligandInfo = LIGAND_DB[code.toUpperCase()];

    if (ligandInfo) {
      return NextResponse.json({
        code: code.toUpperCase(),
        ...ligandInfo,
        imageUrl: `https://www.rcsb.org/chemical-viewer?chemid=${code.toUpperCase()}&defaultSvg`,
      });
    }

    // Return basic info for unknown ligands
    return NextResponse.json({
      code: code.toUpperCase(),
      name: code.toUpperCase(),
      formula: 'N/A',
      weight: 'N/A',
      type: 'UNKNOWN',
      description: 'No detailed information available for this ligand.',
      imageUrl: `https://www.rcsb.org/chemical-viewer?chemid=${code.toUpperCase()}&defaultSvg`,
    });
  } catch (error) {
    console.error('Error fetching ligand:', error);
    return NextResponse.json({ error: 'Failed to fetch ligand info' }, { status: 500 });
  }
}
