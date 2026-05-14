import { NextResponse } from 'next/server';
import { createGunzip } from 'zlib';
import { Readable, PassThrough } from 'stream';
import https from 'https';

interface RamaPoint {
  phi: number;
  psi: number;
  region: 'favored' | 'allowed' | 'disallowed';
  chain: string;
  resName: string;
  resSeq: number;
}

function classifyPoint(phiDeg: number, psiDeg: number): 'favored' | 'allowed' | 'disallowed' {
  const inAlpha = phiDeg > -90 && phiDeg < -30 && psiDeg > -75 && psiDeg < -15;
  const inBeta = phiDeg > -150 && phiDeg < -90 && psiDeg > 90 && psiDeg < 150;
  const inLHelix = phiDeg > 30 && phiDeg < 90 && psiDeg > 30 && psiDeg < 90;
  const inAllowed = (
    (phiDeg > -150 && phiDeg < -60 && psiDeg > -180 && psiDeg < 180) ||
    (phiDeg > -90 && phiDeg < 90 && psiDeg > -180 && psiDeg < 180)
  ) && !inAlpha && !inBeta && !inLHelix;

  if (inAlpha || inBeta || inLHelix) return 'favored';
  if (inAllowed) return 'allowed';
  return 'disallowed';
}

function fetchGzip(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const gunzip = createGunzip();
      const pt = new PassThrough();
      pt.on('data', (c: Buffer) => chunks.push(c));
      pt.on('end', () => resolve(Buffer.concat(chunks)));
      pt.on('error', reject);
      gunzip.on('error', reject);
      res.pipe(gunzip).pipe(pt);
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
    const buffer = await fetchGzip(`https://files.rcsb.org/download/${upperId}.cif.gz`);
    const text = buffer.toString('utf-8');
    const lines = text.split('\n');
    const points: RamaPoint[] = [];
    let inSection = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (line.startsWith('_pdbx_validate_torsion.id')) {
        inSection = true;
        continue;
      }

      if (inSection && line.startsWith('#')) {
        break;
      }

      if (inSection && line && !line.startsWith('_')) {
        const parts = line.split(/\s+/);
        if (parts.length >= 9) {
          const phi = parseFloat(parts[parts.length - 2]);
          const psi = parseFloat(parts[parts.length - 1]);

          if (!isNaN(phi) && !isNaN(psi) && isFinite(phi) && isFinite(psi)) {
            points.push({
              phi,
              psi,
              region: classifyPoint(phi, psi),
              chain: parts[3] || '',
              resName: parts[2] || '',
              resSeq: parseInt(parts[4]) || 0,
            });
          }
        }
      }
    }

    if (points.length === 0) {
      return NextResponse.json({
        pdb_id: upperId,
        error: 'No torsion data found in CIF',
        residue_count: 0,
        favored: 0,
        allowed: 0,
        outliers: 0,
        points: [],
      });
    }

    const total = points.length;
    const outlierCount = points.filter(p => p.region === 'disallowed').length;
    const allowedCount = points.filter(p => p.region === 'allowed').length;
    const favoredCount = points.filter(p => p.region === 'favored').length;

    return NextResponse.json({
      pdb_id: upperId,
      residue_count: total,
      favored: Math.round((favoredCount / total) * 1000) / 10,
      allowed: Math.round((allowedCount / total) * 1000) / 10,
      outliers: Math.round((outlierCount / total) * 1000) / 10,
      points,
    });
  } catch (err) {
    console.error('[Rama API] Error:', err);
    return NextResponse.json({ pdb_id: upperId, error: 'Failed to fetch rama data' }, { status: 500 });
  }
}