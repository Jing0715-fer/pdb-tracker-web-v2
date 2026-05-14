import { NextResponse } from 'next/server';
import https from 'https';

interface RamaPoint {
  phi: number;
  psi: number;
  region: 'favored' | 'allowed' | 'disallowed';
  chain: string;
  resName: string;
  resSeq: number;
}

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Accept: 'application/json' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${data.slice(0, 200)}`)); }
      });
    }).on('error', reject);
  });
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
    // Fetch ALL residues with phi/psi from PDBe's rama_sidechain_listing API
    const data = await fetchJson(
      `https://www.ebi.ac.uk/pdbe/api/v2/validation/rama_sidechain_listing/entry/${upperId}`
    );

    const entry = data[upperId.toLowerCase()];
    if (!entry) {
      return NextResponse.json({ pdb_id: upperId, error: 'PDB entry not found' }, { status: 404 });
    }

    const points: RamaPoint[] = [];
    let totalFavored = 0;
    let totalAllowed = 0;
    let totalOutlier = 0;

    for (const molecule of entry.molecules || []) {
      for (const chain of molecule.chains || []) {
        for (const model of chain.models || []) {
          for (const res of model.residues || []) {
            const phi = res.phi;
            const psi = res.psi;
            const rama = res.rama;

            // Skip if no phi/psi data
            if (phi == null || psi == null) continue;

            // Classify: Favored / Allowed / Disallowed (Outlier)
            let region: 'favored' | 'allowed' | 'disallowed';
            if (rama === 'Favored') {
              region = 'favored';
              totalFavored++;
            } else if (rama === 'Allowed') {
              region = 'allowed';
              totalAllowed++;
            } else {
              // Ramachandran_outlier, or null/unknown
              region = 'disallowed';
              totalOutlier++;
            }

            points.push({
              phi: Number(phi),
              psi: Number(psi),
              region,
              chain: chain.struct_asym_id || '',
              resName: res.residue_name || '',
              resSeq: res.residue_number || 0,
            });
          }
        }
      }
    }

    if (points.length === 0) {
      return NextResponse.json({
        pdb_id: upperId,
        error: 'No torsion data found',
        residue_count: 0,
        favored: 0,
        allowed: 0,
        outliers: 0,
        points: [],
      });
    }

    const total = points.length;
    return NextResponse.json({
      pdb_id: upperId,
      residue_count: total,
      favored: Math.round((totalFavored / total) * 1000) / 10,
      allowed: Math.round((totalAllowed / total) * 1000) / 10,
      outliers: Math.round((totalOutlier / total) * 1000) / 10,
      points,
    });
  } catch (err) {
    console.error('[Rama API] Error:', err);
    return NextResponse.json({ pdb_id: upperId, error: 'Failed to fetch rama data' }, { status: 500 });
  }
}