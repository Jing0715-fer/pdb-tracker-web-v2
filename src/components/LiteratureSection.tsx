// LiteratureSection.tsx
// Displays literature info grouped by pubmedId with associated PDB IDs
// Pubmed metadata (title, authors, abstract) comes from entry's pubmedTitle/pubmedAuthors/pubmedAbstract fields
// Click card to open detail modal

import React, { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { PdbEntry } from './types';
import { getMethodLabel } from './pdb-helpers';

interface PdbInfo {
  pdbId: string;
  method: string | null;
  title: string | null;
  journal: string | null;
  journalIf: number | null;
  pubmedId: string | null;
  pubmedTitle?: string | null;
  pubmedAuthors?: string | null;
  pubmedAbstract?: string | null;
  identity?: number | null;
}

interface LiteratureSectionProps {
  entries?: PdbEntry[];
  pdbStructures?: PdbInfo[];
  blastResults?: (PdbInfo & { identity?: number | null })[];
  onSelectPdb: (pdbId: string) => void;
}

interface LitGroup {
  pubmedId: string;
  title: string;
  authors: string | null;
  journal: string | null;
  journalIf: number | null;
  abstract: string | null;
  pdbs: { pdbId: string; method: string | null; isBlast?: boolean; identity?: number | null }[];
  _sharedCount: number;
}

interface EntryGroup {
  journal: string | null;
  journalIf: number | null;
  entries: { pdbId: string; method: string | null; releaseDate: string | null }[];
  _count: number;
}

export function LiteratureSection({ entries, pdbStructures, blastResults, onSelectPdb }: LiteratureSectionProps) {
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedLit, setSelectedLit] = useState<LitGroup | null>(null);

  // Normal literature groups with pubmedId - use pubmedTitle/pubmedAuthors/pubmedAbstract from entry data
  const litGroups: LitGroup[] = useMemo(() => {
    const map = new Map<string, LitGroup>();

    if (entries) {
      for (const e of entries) {
        if (!e.pubmedId) continue;
        let g = map.get(e.pubmedId);
        if (!g) {
          g = {
            pubmedId: e.pubmedId,
            title: (e as any).pubmedTitle || e.title || 'No title',
            authors: (e as any).pubmedAuthors || null,
            journal: e.journal || null,
            journalIf: e.journalIf ?? null,
            abstract: (e as any).pubmedAbstract || null,
            pdbs: [],
            _sharedCount: 0,
          };
          map.set(e.pubmedId, g);
        }
        g.pdbs.push({ pdbId: e.pdbId, method: null });
        g._sharedCount++;
      }
    }

    if (pdbStructures) {
      for (const s of pdbStructures) {
        if (!s.pubmedId) continue;
        let g = map.get(s.pubmedId);
        if (!g) {
          g = {
            pubmedId: s.pubmedId,
            title: s.pubmedTitle || s.title || 'No title',
            authors: s.pubmedAuthors || null,
            journal: s.journal || null,
            journalIf: s.journalIf,
            abstract: s.pubmedAbstract || null,
            pdbs: [],
            _sharedCount: 0,
          };
          map.set(s.pubmedId, g);
        }
        g.pdbs.push({ pdbId: s.pdbId, method: null, isBlast: false });
        g._sharedCount++;
      }
    }

    if (blastResults) {
      for (const b of blastResults) {
        if (!b.pubmedId) continue;
        let g = map.get(b.pubmedId);
        if (!g) {
          g = {
            pubmedId: b.pubmedId,
            title: b.pubmedTitle || b.title || 'No title',
            authors: b.pubmedAuthors || null,
            journal: b.journal || null,
            journalIf: b.journalIf,
            abstract: b.pubmedAbstract || null,
            pdbs: [],
            _sharedCount: 0,
          };
          map.set(b.pubmedId, g);
        }
        g.pdbs.push({ pdbId: b.pdbId, method: null, isBlast: true, identity: b.identity ?? null });
        g._sharedCount++;
      }
    }

    return Array.from(map.values());
  }, [entries, pdbStructures, blastResults]);

  // Fallback groups when no pubmedId exists - group by journal
  const entryGroups: EntryGroup[] = useMemo(() => {
    if (litGroups.length > 0) return [];
    if (!entries && !pdbStructures) return [];

    const map = new Map<string, EntryGroup>();
    const items = entries ? entries.map(e => ({ pdbId: e.pdbId, method: e.method ?? null, releaseDate: e.releaseDate ?? null, journal: e.journal ?? null, journalIf: e.journalIf ?? null })) : [];

    for (const item of items) {
      const key = item.journal || 'Unknown Journal';
      let g = map.get(key);
      if (!g) {
        g = { journal: item.journal, journalIf: item.journalIf, entries: [], _count: 0 };
        map.set(key, g);
      }
      g.entries.push({ pdbId: item.pdbId, method: item.method, releaseDate: item.releaseDate });
      g._count++;
    }

    return Array.from(map.values());
  }, [entries, pdbStructures, litGroups]);

  const sortedGroups = useMemo(
    () => [...litGroups].sort((a, b) => sortDesc ? (b.journalIf ?? 0) - (a.journalIf ?? 0) : (a.journalIf ?? 0) - (b.journalIf ?? 0)),
    [litGroups, sortDesc]
  );

  const sortedEntryGroups = useMemo(
    () => [...entryGroups].sort((a, b) => {
      const aIf = a.journalIf ?? 0;
      const bIf = b.journalIf ?? 0;
      return sortDesc ? bIf - aIf : aIf - bIf;
    }),
    [entryGroups, sortDesc]
  );

  const hasBlast = litGroups.some(g => g.pdbs.some(p => p.isBlast));

  // Detail Modal
  const DetailModal = selectedLit ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={() => setSelectedLit(null)} />
      <div className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] flex flex-col bg-white dark:bg-[#1c1a18] rounded-xl shadow-2xl border border-claude-border dark:border-[#3d3832]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 p-4 border-b border-claude-border dark:border-[#3d3832] flex-shrink-0" style={{ overflow: 'hidden' }}>
          <div className="flex-1 min-w-0">
            <h2 className="text-[13px] font-semibold text-claude-text leading-snug">{selectedLit.title || 'Untitled'}</h2>
            <p className="text-[10px] text-claude-text-muted mt-1">
              {selectedLit.journal || 'Unknown Journal'}
              {selectedLit.journalIf != null && <span className="ml-2 font-medium text-claude-accent">IF {selectedLit.journalIf.toFixed(1)}</span>}
            </p>
          </div>
          <button onClick={() => setSelectedLit(null)} className="flex-shrink-0 p-1.5 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] text-claude-text-muted hover:text-claude-text transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {selectedLit.authors && (
            <div className="px-4 py-2.5 border-b border-claude-border/50 dark:border-[#3d3832]/50">
              <p className="text-[10px] text-claude-text-muted mb-1">Authors</p>
              <p className="text-[11px] text-claude-text-secondary leading-relaxed">{selectedLit.authors}</p>
            </div>
          )}
          {selectedLit.abstract && (
            <div className="px-4 py-3 border-b border-claude-border/50 dark:border-[#3d3832]/50">
              <p className="text-[10px] text-claude-text-muted mb-1.5">Abstract</p>
              <p className="text-[11px] text-claude-text leading-relaxed">{selectedLit.abstract}</p>
            </div>
          )}
          <div className="px-4 py-3">
            <p className="text-[10px] text-claude-text-muted mb-2">Associated PDB Structures ({selectedLit.pdbs.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedLit.pdbs.map((p) => (
                <button
                  key={`${p.pdbId}-${p.isBlast ? 'b' : 's'}`}
                  onClick={() => onSelectPdb(p.pdbId)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-claude-surface dark:bg-[#2b2926] border border-claude-border/50 dark:border-[#3d3832]/50 hover:border-claude-accent/50 transition-colors"
                >
                  <span className="font-mono text-[11px] font-semibold text-claude-accent">{p.pdbId}</span>
                  {p.isBlast && <span className="text-[9px] px-1 py-0.5 rounded bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20">H</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-claude-bg/50 dark:bg-[#1a1917]/50 border-t border-claude-border/50 dark:border-[#3d3832]/50 flex-shrink-0">
          <a href={`https://pubmed.gov/${selectedLit.pubmedId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] text-claude-accent hover:text-claude-accent-hover transition-colors">
            <ExternalLink className="h-3.5 w-3.5" />View on PubMed
          </a>
          <span className="text-[10px] text-claude-text-muted">PMID: {selectedLit.pubmedId}</span>
        </div>
      </div>
    </div>
  ) : null;

  // Show fallback journal view when no pubmedId data
  if (sortedGroups.length === 0 && sortedEntryGroups.length > 0) {
    return (
      <>
        <div className="space-y-2 px-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-claude-text-muted">{sortedEntryGroups.length} journals</span>
            <button onClick={() => setSortDesc(!sortDesc)} className="text-[9px] text-claude-accent hover:text-claude-accent-hover flex items-center gap-0.5">
              {sortDesc ? '↓' : '↑'} IF
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
            {sortedEntryGroups.map((group, gi) => (
              <div key={gi} className="p-2.5 rounded-lg bg-claude-bg/50 dark:bg-[#1a1917]/50 border border-claude-border/50 dark:border-[#3d3832]/50">
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <p className="text-[11px] font-medium text-claude-text">{group.journal || 'Unknown Journal'}</p>
                  {group.journalIf != null && (
                    <span className={`text-[11px] font-semibold flex-shrink-0 ${group.journalIf >= 10 ? 'text-claude-accent' : 'text-claude-text-secondary'}`}>
                      {group.journalIf.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {group.entries.map((e) => (
                    <button
                      key={e.pdbId}
                      onClick={() => onSelectPdb(e.pdbId)}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-claude-surface dark:bg-[#2b2926] border border-claude-border/50 dark:border-[#3d3832]/50 hover:border-claude-accent/50 transition-colors"
                    >
                      <span className="font-mono font-semibold text-claude-accent">{e.pdbId}</span>
                      {e.method && <span className="text-[9px] text-claude-text-muted">{getMethodLabel(e.method).split(' ')[0]}</span>}
                    </button>
                  ))}
                  <span className="text-[9px] text-claude-text-muted ml-auto">{group._count} structures</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {DetailModal}
      </>
    );
  }

  if (sortedGroups.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-12 text-claude-text-muted">
          <p className="text-xs">No literature data</p>
          <p className="text-[10px] mt-1 text-claude-text-muted/60">PubMed IDs not yet available for entries</p>
        </div>
        {DetailModal}
      </>
    );
  }

  return (
    <>
      <div className="space-y-2 px-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] text-claude-text-muted">{sortedGroups.length} papers</span>
          <button onClick={() => setSortDesc(!sortDesc)} className="text-[9px] text-claude-accent hover:text-claude-accent-hover flex items-center gap-0.5">
            {sortDesc ? '↓' : '↑'} IF
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
          {sortedGroups.map((group) => (
            <div
              key={group.pubmedId}
              onClick={() => setSelectedLit(group)}
              className="p-2.5 rounded-lg bg-claude-bg/50 dark:bg-[#1a1917]/50 border border-claude-border/50 dark:border-[#3d3832]/50 hover:border-claude-accent/30 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <p className="text-[11px] font-medium text-claude-text line-clamp-2 flex-1 leading-snug">{group.title}</p>
                {group.journalIf != null && (
                  <span className={`text-[11px] font-semibold flex-shrink-0 ${group.journalIf >= 10 ? 'text-claude-accent' : 'text-claude-text-secondary'}`}>{group.journalIf.toFixed(1)}</span>
                )}
              </div>
              {group.authors && (
                <p className="text-[9px] text-claude-text-muted mb-1 line-clamp-1">{group.authors}</p>
              )}
              <div className="flex items-center gap-1 flex-wrap">
                {group.pdbs.map((p) => (
                  <button
                    key={`${p.pdbId}-${p.isBlast ? 'b' : 's'}`}
                    onClick={(e) => { e.stopPropagation(); onSelectPdb(p.pdbId); }}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-claude-surface dark:bg-[#2b2926] border border-claude-border/50 dark:border-[#3d3832]/50 hover:border-claude-accent/50 transition-colors"
                  >
                    <span className="font-mono font-semibold text-claude-accent">{p.pdbId}</span>
                    {p.isBlast && <span className="text-[9px] px-1 py-0.5 rounded bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20">H</span>}
                  </button>
                ))}
                {group._sharedCount > 1 && <span className="text-[9px] text-claude-text-muted">+{group._sharedCount - 1}</span>}
                <span className="text-[9px] text-claude-text-muted ml-auto">{group.journal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {DetailModal}
    </>
  );
}