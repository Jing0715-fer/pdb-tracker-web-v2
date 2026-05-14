import { NextResponse } from 'next/server';
import { PDBParser } from '@/lib/biopython_server';

interface RamaPoint {
  resId: number;
  resName: string;
  chain: string;
  phi: number;
  psi: number;
  region: 'favored' | 'allowed' | 'outlier';
}

function classifyRama(phi: number, psi: number): 'favored' | 'allowed' | 'outlier' {
  // Based on Lovell et al., 2003 regions (net of 500 structures, 326531 residues)
  // Alpha-helix core
  if (-125 <= phi && phi <= -35 && -70 <= psi && psi <= 50) return 'favored';
  // Beta-sheet core
  if (-180 <= phi && phi <= -30 && 40 <= psi && psi <= 180) return 'favored';
  // Left-handed helix
  if (30 <= phi && phi <= 90 && -90 <= psi && psi <= 50) return 'favored';

  // Allowed regions
  // Near alpha-helix
  if (-150 <= phi && phi <= -20 && -90 <= psi && psi <= 70) return 'allowed';
  // Near beta-sheet / bridge
  if (-180 <= phi && phi <= -20 && 20 <= psi && psi <= 180) return 'allowed';
  // Near left-handed helix
  if (20 <= phi && phi <= 110 && -120 <= psi && psi <= 70) return 'allowed';

  return 'outlier';
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pdbId: string }> }
) {
  const { pdbId } = await params;
  const upperId = pdbId.toUpperCase();

  if (!/^[A-Za-z0-9]{4}$/.test(upperId)) {
    return NextResponse.json({ pdb_id: upperId, error: 'Invalid PDB ID format' }, { status: 400 });
  }

  try {
    // Download PDB file
    const pdbRes = await fetch(`https://files.rcsb.org/download/${upperId}.pdb`, {
      next: { revalidate: 3600 },
    });

    if (!pdbRes.ok) {
      return NextResponse.json({ pdb_id: upperId, error: 'PDB file not found' }, { status: 404 });
    }

    const pdbText = await pdbRes.text();

    // Parse with Biopython and compute phi/psi
    const result = await PDBParser.parsePhiPsi(pdbText, upperId);

    if (!result.points || result.points.length === 0) {
      return NextResponse.json({
        pdb_id: upperId,
        error: 'No phi/psi data could be computed',
        residue_count: 0,
        favored: null,
        allowed: null,
        outliers: null,
        points: [],
      });
    }

    const total = result.points.length;
    const favored = result.points.filter(p => p.region === 'favored').length;
    const allowed = result.points.filter(p => p.region === 'allowed').length;
    const outliers = result.points.filter(p => p.region === 'outlier').length;

    return NextResponse.json({
      pdb_id: upperId,
      residue_count: total,
      favored: Math.round((favored / total) * 1000) / 10,
      allowed: Math.round((allowed / total) * 1000) / 10,
      outliers: Math.round((outliers / total) * 1000) / 10,
      points: result.points,
    });
  } catch (err) {
    console.error('[Rama API] Error:', err);
    return NextResponse.json({ pdb_id: upperId, error: 'Failed to compute Ramachandran data' }, { status: 500 });
  }
}