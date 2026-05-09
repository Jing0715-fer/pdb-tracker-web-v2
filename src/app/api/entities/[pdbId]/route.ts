import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pdbId: string }> }
) {
  const { pdbId } = await params;
  
  try {
    // Fetch from PDBe API
    const url = `https://www.ebi.ac.uk/pdbe/api/pdb/entry/molecules/${pdbId.toLowerCase()}`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      return NextResponse.json({ entities: [], chains: [] }, { status: 200 });
    }
    
    const data = await res.json();
    const entries = data[pdbId.toLowerCase()] || [];
    
    const entities = entries.map((ent: any) => ({
      entity_id: ent.entity_id,
      molecule_type: ent.molecule_type || '',
      description: ent.molecule_name?.[0] || ent.synonym || '',
      organism: ent.source?.[0]?.organism_scientific_name || '',
      gene_name: ent.gene_name?.[0] || '',
      // For non-polypeptide entities, length is undefined (they're small molecules)
      // Only show length for polypeptide entities
      chains: (ent.in_chains || []).map((chain: string) => ({
        chain,
        asym_id: chain,
        length: ent.molecule_type && ent.molecule_type.includes('polypeptide') ? (ent.length || 0) : null
      }))
    }));
    
    return NextResponse.json({
      entities,
      pdb_id: pdbId,
      polymer_entities: entities.filter((e: any) => e.molecule_type === 'polypeptide').length,
      chain_count: entities.reduce((sum: number, e: any) => sum + e.chains.length, 0)
    });
  } catch (error) {
    console.error('Error fetching entities:', error);
    return NextResponse.json({ entities: [], chains: [] }, { status: 200 });
  }
}
