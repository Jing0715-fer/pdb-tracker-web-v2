import { NextRequest, NextResponse } from 'next/server';

// Expanded ligand database with common PDB ligands
const LIGAND_DB: Record<string, { name: string; formula: string; weight: string; type: string; description: string }> = {
  // Nucleotides
  ATP: { name: 'Adenosine-5\'-triphosphate', formula: 'C10H16N5O13P3', weight: '507.18', type: 'NUCLEOTIDE', description: 'ATP is a nucleotide that provides energy to drive many processes in living cells.' },
  ADP: { name: 'Adenosine-5\'-diphosphate', formula: 'C10H15N5O10P2', weight: '427.20', type: 'NUCLEOTIDE', description: 'ADP is an important organic compound in metabolism.' },
  GTP: { name: 'Guanosine-5\'-triphosphate', formula: 'C10H16N5O14P3', weight: '523.18', type: 'NUCLEOTIDE', description: 'GTP is a nucleotide that functions as an energy source and signaling molecule.' },
  GDP: { name: 'Guanosine-5\'-diphosphate', formula: 'C10H15N5O11P2', weight: '443.20', type: 'NUCLEOTIDE', description: 'GDP is a nucleotide involved in protein synthesis.' },
  AMP: { name: 'Adenosine monophosphate', formula: 'C10H14N5O7P', weight: '347.22', type: 'NUCLEOTIDE', description: 'AMP is a nucleotide found in RNA.' },
  GMP: { name: 'Guanosine monophosphate', formula: 'C10H14N5O8P', weight: '363.22', type: 'NUCLEOTIDE', description: 'GMP is a nucleotide found in RNA.' },
  CMP: { name: 'Cytidine monophosphate', formula: 'C9H14N3O8P', weight: '323.20', type: 'NUCLEOTIDE', description: 'CMP is a nucleotide found in RNA.' },
  UMP: { name: 'Uridine monophosphate', formula: 'C9H13N2O9P', weight: '324.18', type: 'NUCLEOTIDE', description: 'UMP is a nucleotide found in RNA.' },
  
  // Coenzymes
  NAD: { name: 'Nicotinamide adenine dinucleotide', formula: 'C21H27N7O14P2', weight: '663.43', type: 'COENZYME', description: 'NAD is a coenzyme found in all living cells, essential for metabolism.' },
  NADP: { name: 'Nicotinamide adenine dinucleotide phosphate', formula: 'C21H28N7O17P3', weight: '743.41', type: 'COENZYME', description: 'NADP is a coenzyme involved in anabolic reactions.' },
  FAD: { name: 'Flavin adenine dinucleotide', formula: 'C27H33N9O15P2', weight: '785.56', type: 'COENZYME', description: 'FAD is a redox cofactor involved in several important metabolic pathways.' },
  FMN: { name: 'Flavin mononucleotide', formula: 'C17H21N4O9P', weight: '456.35', type: 'COENZYME', description: 'FMN is a biomolecule produced by oxidation of riboflavin.' },
  COA: { name: 'Coenzyme A', formula: 'C21H36N7O16P3S', weight: '767.54', type: 'COENZYME', description: 'CoA is notable for its role in the synthesis and oxidation of fatty acids.' },
  SAM: { name: 'S-adenosylmethionine', formula: 'C15H22N6O5S', weight: '398.44', type: 'COENZYME', description: 'SAM is a common co-substrate involved in methyl group transfers.' },
  SAH: { name: 'S-adenosyl-L-homocysteine', formula: 'C14H20N6O5S', weight: '384.41', type: 'COENZYME', description: 'SAH is formed after donation of the methyl group of SAM.' },
  
  // Ions
  MG: { name: 'Magnesium ion', formula: 'Mg', weight: '24.31', type: 'ION', description: 'Magnesium is an essential mineral for many enzymatic reactions.' },
  ZN: { name: 'Zinc ion', formula: 'Zn', weight: '65.38', type: 'ION', description: 'Zinc is an essential trace element important for protein structure and function.' },
  CA: { name: 'Calcium ion', formula: 'Ca', weight: '40.08', type: 'ION', description: 'Calcium plays important roles in signal transduction and structural stability.' },
  MN: { name: 'Manganese ion', formula: 'Mn', weight: '54.94', type: 'ION', description: 'Manganese is an essential trace element for many enzymes.' },
  FE: { name: 'Iron ion', formula: 'Fe', weight: '55.85', type: 'ION', description: 'Iron is an essential element for many proteins.' },
  CU: { name: 'Copper ion', formula: 'Cu', weight: '63.55', type: 'ION', description: 'Copper is an essential trace element for electron transport.' },
  K: { name: 'Potassium ion', formula: 'K', weight: '39.10', type: 'ION', description: 'Potassium is an essential electrolyte.' },
  NA: { name: 'Sodium ion', formula: 'Na', weight: '22.99', type: 'ION', description: 'Sodium is an essential electrolyte.' },
  CL: { name: 'Chloride ion', formula: 'Cl', weight: '35.45', type: 'ION', description: 'Chloride is an essential electrolyte.' },
  
  // Hemes and prosthetic groups
  HEM: { name: 'Protoporphyrin IX containing Fe', formula: 'C34H32FeN4O4', weight: '616.49', type: 'PROSTHETIC GROUP', description: 'Heme is an iron-containing compound that forms the non-protein part of hemoglobin.' },
  HEC: { name: 'Heme C', formula: 'C34H32FeN4O4', weight: '616.49', type: 'PROSTHETIC GROUP', description: 'Heme C is a covalently bound heme found in cytochromes.' },
  HEMB: { name: 'Heme B', formula: 'C34H32FeN4O4', weight: '616.49', type: 'PROSTHETIC GROUP', description: 'Heme B is the most common heme found in proteins.' },
  
  // Sugars
  NAG: { name: 'N-Acetyl-D-glucosamine', formula: 'C8H15NO6', weight: '221.21', type: 'SACCHARIDE', description: 'NAG is an amino sugar derivative of glucose.' },
  GAL: { name: 'Galactose', formula: 'C6H12O6', weight: '180.16', type: 'SACCHARIDE', description: 'Galactose is a simple sugar and component of lactose.' },
  GLC: { name: 'Glucose', formula: 'C6H12O6', weight: '180.16', type: 'SACCHARIDE', description: 'Glucose is a simple sugar and primary energy source.' },
  MAN: { name: 'Mannose', formula: 'C6H12O6', weight: '180.16', type: 'SACCHARIDE', description: 'Mannose is a simple sugar involved in protein glycosylation.' },
  FUC: { name: 'L-Fucose', formula: 'C6H12O5', weight: '164.16', type: 'SACCHARIDE', description: 'Fucose is a deoxyhexose sugar involved in many biological processes.' },
  SIA: { name: 'N-Acetylneuraminic acid', formula: 'C11H19NO9', weight: '291.26', type: 'SACCHARIDE', description: 'Sialic acid is found at the ends of glycoprotein chains.' },
  
  // Buffers and solvents
  MES: { name: '2-(N-morpholino)ethanesulfonic acid', formula: 'C6H13NO4S', weight: '195.24', type: 'BUFFER', description: 'MES is a buffering agent used in biochemistry.' },
  EPE: { name: '4-(2-Hydroxyethyl)-1-piperazine ethanesulfonic acid', formula: 'C8H18N2O4S', weight: '238.30', type: 'BUFFER', description: 'HEPES is a buffering agent commonly used.' },
  PEG: { name: 'Di(hydroxyethyl)ether', formula: 'C4H10O3', weight: '106.12', type: 'SOLVENT', description: 'PEG is a polyether compound used as precipitant.' },
  GOL: { name: 'Glycerol', formula: 'C3H8O3', weight: '92.09', type: 'SOLVENT', description: 'Glycerol is a simple polyol used as cryoprotectant.' },
  EDO: { name: '1,2-Ethanediol (Ethylene glycol)', formula: 'C2H6O2', weight: '62.07', type: 'SOLVENT', description: 'Ethylene glycol is used as cryoprotectant.' },
  PGE: { name: 'Polyethylene glycol', formula: 'C2n+2H4n+6O-n+2', weight: 'Variable', type: 'SOLVENT', description: 'PEG polymers of varying lengths.' },
  
  // Common ligands
  SO4: { name: 'Sulfate ion', formula: 'O4S', weight: '96.06', type: 'ION', description: 'Sulfate is a polyatomic ion found in many proteins.' },
  PO4: { name: 'Phosphate ion', formula: 'O4P', weight: '94.97', type: 'ION', description: 'Phosphate is essential for DNA and energy metabolism.' },
  ARS: { name: 'Arsenic', formula: 'As', weight: '74.92', type: 'ION', description: 'Arsenic is sometimes found as a structural element.' },
  ACT: { name: 'Acetate ion', formula: 'C2H3O2', weight: '59.04', type: 'ION', description: 'Acetate is an acetyl group donor.' },
  CIT: { name: 'Citrate', formula: 'C6H5O7', weight: '189.10', type: 'ION', description: 'Citrate is an intermediate in the citric acid cycle.' },
  FOR: { name: 'Formate ion', formula: 'CHOO', weight: '45.02', type: 'ION', description: 'Formate is the simplest carboxylate anion.' },
  
  // Lipids
  CLR: { name: 'Cholesterol', formula: 'C27H46O', weight: '386.65', type: 'LIPID', description: 'Cholesterol is a structural component of cell membranes.' },
  OLC: { name: 'Oleic acid', formula: 'C18H34O2', weight: '282.46', type: 'LIPID', description: 'Oleic acid is a fatty acid found in many lipids.' },
  PLM: { name: 'Palmitic acid', formula: 'C16H32O2', weight: '256.42', type: 'LIPID', description: 'Palmitic acid is a saturated fatty acid.' },
  
  // Amino acids and derivatives
  ATP: { name: 'Adenosine-5\'-triphosphate', formula: 'C10H16N5O13P3', weight: '507.18', type: 'NUCLEOTIDE', description: 'ATP is the primary energy currency of cells.' },
  GLU: { name: 'Glutamate', formula: 'C5H8NO4', weight: '146.12', type: 'AMINO ACID', description: 'Glutamate is an important neurotransmitter.' },
  ASP: { name: 'Aspartate', formula: 'C4H6NO4', weight: '133.10', type: 'AMINO ACID', description: 'Aspartate is a naturally occurring amino acid.' },
  GLY: { name: 'Glycine', formula: 'C2H5NO2', weight: '75.07', type: 'AMINO ACID', description: 'Glycine is the simplest amino acid.' },
  ALA: { name: 'Alanine', formula: 'C3H7NO2', weight: '89.09', type: 'AMINO ACID', description: 'Alanine is a non-essential amino acid.' },
  
  // Drug molecules
  STI: { name: 'Streptomycin', formula: 'C21H39N5O12', weight: '581.60', type: 'ANTIBIOTIC', description: 'Streptomycin is an antibiotic.' },
  HDX: { name: 'Heme', formula: 'C34H32FeN4O4', weight: '616.49', type: 'PROSTHETIC GROUP', description: 'Heme is a porphyrin ring with iron.' },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const normalizedCode = code.toUpperCase().trim();
    const ligandInfo = LIGAND_DB[normalizedCode];

    if (ligandInfo) {
      return NextResponse.json({
        code: normalizedCode,
        ...ligandInfo,
        imageUrl: `https://www.ebi.ac.uk/pdbe-srv/pdbechem/image/image/500/${normalizedCode}`,
      });
    }

    // For unknown ligands, try to fetch from RCSB CCD API
    try {
      const rcsbRes = await fetch(`https://data.rcsb.org/rest/v1/core/chemcomp/${normalizedCode}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      
      if (rcsbRes.ok) {
        const rcsbData = await rcsbRes.json();
        const comp = rcsbData?.rcsb_chemcomp_info;
        
        return NextResponse.json({
          code: normalizedCode,
          name: comp?.name || normalizedCode,
          formula: comp?. Formula || 'N/A',
          weight: comp?.molecular_weight || 'N/A',
          type: 'UNKNOWN',
          description: 'Detailed information fetched from RCSB PDB.',
          imageUrl: `https://www.ebi.ac.uk/pdbe-srv/pdbechem/image/image/500/${normalizedCode}`,
        });
      }
    } catch (e) {
      // Fallback to basic response
    }

    // Return basic info for unknown ligands
    return NextResponse.json({
      code: normalizedCode,
      name: normalizedCode,
      formula: 'N/A',
      weight: 'N/A',
      type: 'UNKNOWN',
      description: 'No detailed information available for this ligand.',
      imageUrl: `https://www.ebi.ac.uk/pdbe-srv/pdbechem/image/image/500/${normalizedCode}`,
    });
  } catch (error) {
    console.error('Error fetching ligand:', error);
    return NextResponse.json({ error: 'Failed to fetch ligand info' }, { status: 500 });
  }
}
