import { NextRequest, NextResponse } from "next/server";

interface PdbeMolecule {
  entity_id: number;
  molecule_type: string;
  molecule_name?: string[];
  synonym?: string;
  description?: string;
  source?: Array<{
    organism_scientific_name?: string;
    tax_id?: number;
  }>;
  gene_name?: string[] | string;
  in_chains?: string[];
  chain_to_asymId?: Record<string, string>;
  length?: number;
  sequence_length?: number;
  chem_comp_ids?: string[];
}

interface PdbeChainDetail {
  chain: string;
  asym_id: string;
  length: number | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pdbId: string }> }
) {
  try {
    const { pdbId } = await params;
    const upperPdbId = pdbId.toUpperCase();

    if (!/^[A-Za-z0-9]{4}$/.test(upperPdbId)) {
      return NextResponse.json(
        { error: "Invalid PDB ID format. Must be 4 alphanumeric characters." },
        { status: 400 }
      );
    }

    const lowerPdbId = upperPdbId.toLowerCase();

    const response = await fetch(
      `https://www.ebi.ac.uk/pdbe/api/pdb/entry/molecules/${lowerPdbId}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: `No entities found for PDB ID: ${upperPdbId}` },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch from PDBe API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const molecules: PdbeMolecule[] = data[lowerPdbId] || [];

    const entities = molecules.map((mol) => {
      const chains: PdbeChainDetail[] = (mol.in_chains || []).map(
        (chainId: string) => {
          const asymId = mol.chain_to_asymId?.[chainId] || chainId;
          return {
            chain: chainId,
            asym_id: asymId,
            length: (mol.molecule_type?.includes('polypeptide') || mol.molecule_type?.includes('nucleotide'))
              ? (mol.length || mol.sequence_length || 0)
              : null,
          };
        }
      );

      return {
        entity_id: mol.entity_id,
        molecule_type: mol.molecule_type,
        description: mol.molecule_name?.[0] || mol.synonym || mol.description || null,
        organism: mol.source?.[0]?.organism_scientific_name || null,
        gene_name: Array.isArray(mol.gene_name)
          ? mol.gene_name.join(", ")
          : mol.gene_name || null,
        chem_comp_ids: mol.chem_comp_ids || [],
        chains,
      };
    });

    const chainCount = entities.reduce((sum, entity) => sum + entity.chains.length, 0);
    const polymerEntities = entities.filter((e) =>
      ["polypeptide(L)", "polyribonucleotide", "polydeoxyribonucleotide", "polydeoxyribonucleotide/polyribonucleotide hybrid"].includes(e.molecule_type)
    ).length;

    return NextResponse.json({
      pdb_id: upperPdbId,
      entities,
      polymer_entities: polymerEntities,
      chain_count: chainCount,
    });
  } catch (error) {
    console.error("[API /entities] Error:", error);
    return NextResponse.json({ error: "Failed to fetch entity data" }, { status: 500 });
  }
}