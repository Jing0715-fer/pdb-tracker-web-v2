import { NextRequest, NextResponse } from 'next/server';

// Expanded fallback ligand database
const LIGAND_DB: Record<string, { name: string; formula: string; weight: string; type: string; description: string }> = {
  // Nucleotides
  ATP: { name: 'Adenosine-5\'-triphosphate', formula: 'C10H16N5O13P3', weight: '507.18', type: 'NUCLEOTIDE', description: 'ATP is the primary energy currency of cells.' },
  ADP: { name: 'Adenosine-5\'-diphosphate', formula: 'C10H15N5O10P2', weight: '427.20', type: 'NUCLEOTIDE', description: 'ADP is an important organic compound in metabolism.' },
  GTP: { name: 'Guanosine-5\'-triphosphate', formula: 'C10H16N5O14P3', weight: '523.18', type: 'NUCLEOTIDE', description: 'GTP is a nucleotide involved in protein synthesis.' },
  GDP: { name: 'Guanosine-5\'-diphosphate', formula: 'C10H15N5O11P2', weight: '443.20', type: 'NUCLEOTIDE', description: 'GDP is a nucleotide involved in energy transfer.' },
  AMP: { name: 'Adenosine monophosphate', formula: 'C10H14N5O7P', weight: '347.22', type: 'NUCLEOTIDE', description: 'AMP is a nucleotide found in RNA.' },
  GMP: { name: 'Guanosine monophosphate', formula: 'C10H14N5O8P', weight: '363.22', type: 'NUCLEOTIDE', description: 'GMP is a nucleotide found in RNA.' },
  
  // Coenzymes
  NAD: { name: 'Nicotinamide adenine dinucleotide', formula: 'C21H27N7O14P2', weight: '663.43', type: 'COENZYME', description: 'NAD is a coenzyme found in all living cells.' },
  NADP: { name: 'Nicotinamide adenine dinucleotide phosphate', formula: 'C21H28N7O17P3', weight: '743.41', type: 'COENZYME', description: 'NADP is a coenzyme involved in anabolic reactions.' },
  FAD: { name: 'Flavin adenine dinucleotide', formula: 'C27H33N9O15P2', weight: '785.56', type: 'COENZYME', description: 'FAD is a redox cofactor.' },
  FMN: { name: 'Flavin mononucleotide', formula: 'C17H21N4O9P', weight: '456.35', type: 'COENZYME', description: 'FMN is produced by oxidation of riboflavin.' },
  COA: { name: 'Coenzyme A', formula: 'C21H36N7O16P3S', weight: '767.54', type: 'COENZYME', description: 'CoA is involved in fatty acid synthesis.' },
  SAM: { name: 'S-adenosylmethionine', formula: 'C15H22N6O5S', weight: '398.44', type: 'COENZYME', description: 'SAM is involved in methyl group transfers.' },
  SAH: { name: 'S-adenosyl-L-homocysteine', formula: 'C14H20N6O5S', weight: '384.41', type: 'COENZYME', description: 'SAH is formed after SAM donation.' },
  
  // Ions
  MG: { name: 'Magnesium ion', formula: 'Mg', weight: '24.31', type: 'ION', description: 'Magnesium is an essential mineral.' },
  ZN: { name: 'Zinc ion', formula: 'Zn', weight: '65.38', type: 'ION', description: 'Zinc is essential for protein structure.' },
  CA: { name: 'Calcium ion', formula: 'Ca', weight: '40.08', type: 'ION', description: 'Calcium plays roles in signal transduction.' },
  MN: { name: 'Manganese ion', formula: 'Mn', weight: '54.94', type: 'ION', description: 'Manganese is essential for many enzymes.' },
  FE: { name: 'Iron ion', formula: 'Fe', weight: '55.85', type: 'ION', description: 'Iron is essential for many proteins.' },
  CU: { name: 'Copper ion', formula: 'Cu', weight: '63.55', type: 'ION', description: 'Copper is essential for electron transport.' },
  K: { name: 'Potassium ion', formula: 'K', weight: '39.10', type: 'ION', description: 'Potassium is an essential electrolyte.' },
  NA: { name: 'Sodium ion', formula: 'Na', weight: '22.99', type: 'ION', description: 'Sodium is an essential electrolyte.' },
  CL: { name: 'Chloride ion', formula: 'Cl', weight: '35.45', type: 'ION', description: 'Chloride is an essential electrolyte.' },
  
  // Hemes
  HEM: { name: 'Protoporphyrin IX containing Fe', formula: 'C34H32FeN4O4', weight: '616.49', type: 'PROSTHETIC GROUP', description: 'Heme is the iron-containing part of hemoglobin.' },
  HEC: { name: 'Heme C', formula: 'C34H32FeN4O4', weight: '616.49', type: 'PROSTHETIC GROUP', description: 'Heme C is found in cytochromes.' },
  
  // Sugars
  NAG: { name: 'N-Acetyl-D-glucosamine', formula: 'C8H15NO6', weight: '221.21', type: 'SACCHARIDE', description: 'NAG is an amino sugar derivative.' },
  GAL: { name: 'Galactose', formula: 'C6H12O6', weight: '180.16', type: 'SACCHARIDE', description: 'Galactose is a component of lactose.' },
  GLC: { name: 'Glucose', formula: 'C6H12O6', weight: '180.16', type: 'SACCHARIDE', description: 'Glucose is the primary energy source.' },
  MAN: { name: 'Mannose', formula: 'C6H12O6', weight: '180.16', type: 'SACCHARIDE', description: 'Mannose is involved in glycosylation.' },
  
  // Buffers and solvents
  MES: { name: '2-(N-morpholino)ethanesulfonic acid', formula: 'C6H13NO4S', weight: '195.24', type: 'BUFFER', description: 'MES is a buffering agent.' },
  EPE: { name: '4-(2-Hydroxyethyl)-1-piperazine ethanesulfonic acid', formula: 'C8H18N2O4S', weight: '238.30', type: 'BUFFER', description: 'HEPES is a buffering agent.' },
  GOL: { name: 'Glycerol', formula: 'C3H8O3', weight: '92.09', type: 'SOLVENT', description: 'Glycerol is used as cryoprotectant.' },
  EDO: { name: '1,2-Ethanediol', formula: 'C2H6O2', weight: '62.07', type: 'SOLVENT', description: 'Ethylene glycol is used as cryoprotectant.' },
  
  // Common
  SO4: { name: 'Sulfate ion', formula: 'O4S', weight: '96.06', type: 'ION', description: 'Sulfate is a polyatomic ion.' },
  PO4: { name: 'Phosphate ion', formula: 'O4P', weight: '94.97', type: 'ION', description: 'Phosphate is essential for DNA.' },
  FOR: { name: 'Formate ion', formula: 'CHOO', weight: '45.02', type: 'ION', description: 'Formate is the simplest carboxylate.' },
  CIT: { name: 'Citrate', formula: 'C6H5O7', weight: '189.10', type: 'ION', description: 'Citrate is in the citric acid cycle.' },
  ACT: { name: 'Acetate ion', formula: 'C2H3O2', weight: '59.04', type: 'ION', description: 'Acetate is an acetyl group donor.' },
  ARS: { name: 'Arsenic', formula: 'As', weight: '74.92', type: 'ION', description: 'Arsenic is sometimes found in proteins.' },
  CLR: { name: 'Cholesterol', formula: 'C27H46O', weight: '386.65', type: 'LIPID', description: 'Cholesterol is a membrane component.' },
};

async function fetchFromRCSB(code: string): Promise<{ name: string; formula: string; weight: string; type: string; description: string } | null> {
  try {
    const res = await fetch(`https://data.rcsb.org/rest/v1/core/chemcomp/${code}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    const comp = data?.rcsb_chemcomp_info || {};
    const identifier = data?.rcsb_chemcomp_identifier || {};
    const descriptor = data?.rcsb_chemcomp_descriptor || {};
    
    return {
      name: comp.name || identifier.name || code,
      formula: descriptor.formula || 'N/A',
      weight: comp.molecular_weight?.toString() || 'N/A',
      type: 'UNKNOWN',
      description: comp.description || `Ligand ${code}`,
    };
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const normalizedCode = code.toUpperCase().trim();

    // First check fallback database
    const fallback = LIGAND_DB[normalizedCode];
    if (fallback) {
      return NextResponse.json({
        code: normalizedCode,
        name: fallback.name,
        formula: fallback.formula,
        weight: (() => { const w = parseFloat(fallback.weight); return isNaN(w) ? null : w; })(),
        type: fallback.type,
        description: fallback.description,
        imageUrl: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${normalizedCode}/PNG`,
      });
    }

    // Try RCSB CCD API for unknown ligands
    const rcsb = await fetchFromRCSB(normalizedCode);
    if (rcsb) {
      return NextResponse.json({
        code: normalizedCode,
        name: rcsb.name,
        formula: rcsb.formula,
        weight: (() => { const w = parseFloat(rcsb.weight); return isNaN(w) ? null : w; })(),
        type: rcsb.type,
        description: rcsb.description,
        imageUrl: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${normalizedCode}/PNG`,
      });
    }

    // Return basic unknown response
    return NextResponse.json({
      code: normalizedCode,
      name: normalizedCode,
      formula: 'N/A',
      weight: null,
      type: 'UNKNOWN',
      description: 'No detailed information available for this ligand.',
      imageUrl: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${normalizedCode}/PNG`,
    });
  } catch (error) {
    console.error('Error fetching ligand:', error);
    return NextResponse.json({ error: 'Failed to fetch ligand info' }, { status: 500 });
  }
}
