'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, ExternalLink, Palette, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface MoleculeViewerProps {
  pdbId: string;
  highlightEntity?: string | null;
  onEntityClick?: (entityId: string) => void;
  entityColors?: Record<string, string>;
  onEntityColorChange?: (entityId: string, color: string) => void;
}

interface EntityInfo {
  id: string;
  label: string;
  type: 'polymer' | 'nonpolymer' | 'water' | 'branched';
  description: string;
  chain: string;
}

const PRESET_COLORS = [
  '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce',
  '#805ad5', '#d53f8c', '#00b5d8', '#718096', '#1a202c',
  '#48bb78', '#ed8936', '#9f7aea', '#fc8181', '#f6e05e',
];

function isChunkLoadError(err: unknown): boolean {
  if (err instanceof Error) {
    const name = err.name;
    const message = err.message || '';
    if (name === 'ChunkLoadError') return true;
    if (message.includes('Failed to load chunk') || message.includes('Loading chunk')) return true;
    if (message.includes('Importing a module script failed')) return true;
    if (name === 'TypeError' && message.includes('Failed to fetch dynamically imported module')) return true;
  }
  return false;
}

async function importWithRetry<T>(importFn: () => Promise<T>, retries = 1, delayMs = 1500): Promise<T> {
  try {
    return await importFn();
  } catch (err) {
    if (retries > 0 && isChunkLoadError(err)) {
      console.warn('[molstar] Chunk load failed, retrying in', delayMs, 'ms...', err instanceof Error ? err.message : err);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return importWithRetry(importFn, retries - 1, delayMs);
    }
    throw err;
  }
}

export default function MoleculeViewer({
  pdbId,
  highlightEntity,
  onEntityClick,
  entityColors = {},
  onEntityColorChange,
}: MoleculeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pluginRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entities, setEntities] = useState<EntityInfo[]>([]);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [showAllChains, setShowAllChains] = useState(true);
  const [visibleChains, setVisibleChains] = useState<Set<string>>(new Set());
  const [colorPickerEntity, setColorPickerEntity] = useState<string | null>(null);
  const prevHighlightRef = useRef<string | null>(null);

  // Fetch entity info from RCSB API
  useEffect(() => {
    async function fetchEntities() {
      try {
        const polyRes = await fetch(`https://data.rcsb.org/rest/v1/core/polymer_entity/${pdbId}`);
        const polyData = polyRes.ok ? await polyRes.json() : [];
        const nonPolyRes = await fetch(`https://data.rcsb.org/rest/v1/core/nonpolymer_entity/${pdbId}`);
        const nonPolyData = nonPolyRes.ok ? await nonPolyRes.json() : [];

        const entityList: EntityInfo[] = [];

        if (Array.isArray(polyData)) {
          for (const poly of polyData) {
            const entityId = poly.id || poly.entity_id;
            const asymIds = poly.asym_ids || [];
            const title = poly.entity_poly?.pdbx_description || '';
            const organisms = poly.entity_src_gen || [];
            let orgStr = '';
            if (organisms.length > 0) {
              const org = organisms[0];
              orgStr = org.pdbx_gene_src_scientific_name || org.host_gene_src_ncbi_taxname || '';
            }
            for (const chain of asymIds) {
              entityList.push({
                id: `${pdbId}.${chain}`,
                label: title || entityId,
                type: 'polymer',
                description: orgStr,
                chain,
              });
            }
          }
        }

        if (Array.isArray(nonPolyData)) {
          for (const nonPoly of nonPolyData) {
            const entityId = nonPoly.id || nonPoly.entity_id;
            const asymIds = nonPoly.asym_ids || [];
            const chemName = nonPoly.nonpolymer_entity?.chem_name || '';
            const compId = nonPoly.nonpolymer_entity?.component_id || '';
            for (const chain of asymIds) {
              entityList.push({
                id: `${pdbId}.${chain}`,
                label: chemName || compId || entityId,
                type: 'nonpolymer',
                description: compId,
                chain,
              });
            }
          }
        }

        setEntities(entityList);
        setVisibleChains(new Set(entityList.map(e => e.id)));
      } catch (err) {
        console.warn('[molstar] Failed to fetch entity info:', err);
        setEntities([]);
      }
    }
    fetchEntities();
  }, [pdbId]);

  // Apply highlight when highlightEntity changes
  useEffect(() => {
    if (!pluginRef.current || !highlightEntity || highlightEntity === prevHighlightRef.current) return;
    applyHighlight(pluginRef.current, highlightEntity);
    prevHighlightRef.current = highlightEntity;
  }, [highlightEntity]);

  async function applyHighlight(plugin: any, entityId: string) {
    try {
      const { PluginCommands } = await importWithRetry(() => import('molstar/lib/mol-plugin/commands.js'));
      const chain = entityId.split('.')[1] || entityId;
      const hierarchy = plugin.managers.structure.hierarchy.current;
      if (!hierarchy || hierarchy.length === 0) return;

      // Try to focus on the structure
      const sel = plugin.state.select('');
      if (sel.length > 0 && sel[0].ref) {
        PluginCommands.State.SetFocus(plugin, { ref: sel[0].ref });
      }
    } catch (err) {
      console.warn('[molstar] Failed to apply highlight:', err);
    }
  }

  async function resetView() {
    if (!pluginRef.current) return;
    try {
      const { PluginCommands } = await importWithRetry(() => import('molstar/lib/mol-plugin/commands.js'));
      const hierarchy = pluginRef.current.managers.structure.hierarchy.current;
      if (hierarchy && hierarchy.length > 0) {
        const sel = pluginRef.current.state.select('');
        if (sel.length > 0 && sel[0].ref) {
          PluginCommands.Camera.Reset(pluginRef.current);
        }
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    async function init() {
      try {
        const { createPluginUI } = await importWithRetry(() => import('molstar/lib/mol-plugin-ui/index.js'));
        const { DefaultPluginUISpec } = await importWithRetry(() => import('molstar/lib/mol-plugin-ui/spec.js'));
        const { renderReact18 } = await importWithRetry(() => import('molstar/lib/mol-plugin-ui/react18.js'));
        const { PluginCommands } = await importWithRetry(() => import('molstar/lib/mol-plugin/commands.js'));
        const { Color } = await importWithRetry(() => import('molstar/lib/mol-util/color/index.js'));

        if (destroyed || !containerRef.current) return;

        const spec = {
          ...DefaultPluginUISpec(),
          layout: {
            initial: {
              isExpanded: false,
              showControls: false,
              regionState: {
                top: 'hidden' as const,
                left: 'hidden' as const,
                right: 'hidden' as const,
                bottom: 'hidden' as const,
              },
            },
          },
          components: {
            remoteState: 'none' as const,
            controls: {
              top: 'none' as const,
              left: 'none' as const,
              right: 'none' as const,
              bottom: 'none' as const,
            },
          },
          config: [
            [
              (await importWithRetry(() => import('molstar/lib/mol-plugin/config.js'))).PluginConfig.General.IsBusyTimeout,
              0,
            ],
          ],
        };

        const plugin = await createPluginUI({
          target: containerRef.current,
          render: renderReact18,
          spec,
        });

        if (destroyed) {
          plugin.dispose();
          return;
        }

        pluginRef.current = plugin;

        PluginCommands.Canvas3D.SetSettings(plugin, {
          settings: (props: any) => {
            props.renderer.backgroundColor = Color(0xf5f0eb);
          },
        });

        await loadStructure(plugin, pdbId);

        if (!destroyed) {
          setLoading(false);
        }
      } catch (err) {
        if (isChunkLoadError(err)) {
          console.warn('[molstar] Chunk load failed after retry — viewer unavailable.', err instanceof Error ? err.message : err);
        } else {
          console.error('[molstar] Failed to initialize viewer:', err);
        }
        if (!destroyed) {
          setError(err instanceof Error ? err.message : 'Failed to load viewer');
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      destroyed = true;
      if (pluginRef.current) {
        try {
          pluginRef.current.dispose();
        } catch { /* ignore */ }
        pluginRef.current = null;
      }
    };
  }, [pdbId]);

  const toggleChainVisibility = useCallback((entityId: string) => {
    setVisibleChains(prev => {
      const next = new Set(prev);
      if (next.has(entityId)) next.delete(entityId);
      else next.add(entityId);
      return next;
    });
  }, []);

  const handleColorChange = useCallback((entityId: string, color: string) => {
    onEntityColorChange?.(entityId, color);
    setColorPickerEntity(null);
  }, [onEntityColorChange]);

  const toggleShowAll = useCallback(() => {
    setShowAllChains(prev => {
      if (prev) {
        // Hide all - clear visible set
        setVisibleChains(new Set());
      } else {
        // Show all - add all entities
        setVisibleChains(new Set(entities.map(e => e.id)));
      }
      return !prev;
    });
  }, [entities]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-[#f5f0eb] dark:bg-[#3d3832] border border-claude-border dark:border-[#4a4540]">
      <div ref={containerRef} className="w-full h-[300px]" />

      {/* 3D Viewer Controls */}
      <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
        <button
          onClick={resetView}
          title="Reset view"
          className="p-1.5 rounded-md bg-white/90 dark:bg-[#2b2926]/90 border border-claude-border/50 dark:border-[#4a4540]/50 hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5 text-claude-text-secondary" />
        </button>
        <button
          onClick={() => setShowPanel(!showPanel)}
          title="Toggle entity panel"
          className={`p-1.5 rounded-md border transition-colors ${showPanel ? 'bg-claude-accent-light dark:bg-[#3d2a22] border-claude-accent/30 text-claude-accent' : 'bg-white/90 dark:bg-[#2b2926]/90 border-claude-border/50 dark:border-[#4a4540]/50 text-claude-text-secondary hover:bg-claude-border-light'}`}
        >
          <Palette className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Entity Panel */}
      {showPanel && (
        <div className="absolute top-10 right-2 w-56 max-h-64 overflow-y-auto bg-white/95 dark:bg-[#2b2926]/95 border border-claude-border dark:border-[#4a4540] rounded-lg shadow-xl z-20">
          <div className="sticky top-0 px-2 py-1.5 bg-white/95 dark:bg-[#2b2926] border-b border-claude-border/50 dark:border-[#4a4540]/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-claude-text-muted uppercase tracking-wider">Entities ({entities.length})</span>
              <button
                onClick={toggleShowAll}
                className="text-[9px] text-claude-accent hover:text-claude-accent/80 transition-colors"
              >
                {showAllChains ? 'Hide all' : 'Show all'}
              </button>
            </div>
          </div>
          {entities.length === 0 ? (
            <div className="p-3 text-center">
              <span className="text-[10px] text-claude-text-muted">No entity data available</span>
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {entities.map(entity => (
                <div key={entity.id} className="group">
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-colors ${
                      hoveredEntity === entity.id
                        ? 'bg-claude-accent-light dark:bg-[#3d2a22]/50'
                        : 'hover:bg-claude-border-light/50 dark:hover:bg-[#3d3832]/30'
                    } ${highlightEntity === entity.id ? 'ring-1 ring-claude-accent' : ''}`}
                    onMouseEnter={() => setHoveredEntity(entity.id)}
                    onMouseLeave={() => setHoveredEntity(null)}
                    onClick={() => onEntityClick?.(entity.id)}
                  >
                    {/* Color indicator */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setColorPickerEntity(colorPickerEntity === entity.id ? null : entity.id); }}
                      className="w-3.5 h-3.5 rounded-sm border border-black/20 flex-shrink-0 cursor-pointer"
                      style={{ backgroundColor: entityColors[entity.id] || '#718096' }}
                    />
                    {/* Visibility toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleChainVisibility(entity.id); }}
                      className="flex-shrink-0"
                    >
                      {visibleChains.has(entity.id) ? (
                        <Eye className="h-3 w-3 text-claude-text-secondary" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-claude-text-muted/40" />
                      )}
                    </button>
                    {/* Entity info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-claude-text-secondary truncate">{entity.chain}</span>
                        <span className={`text-[8px] px-1 py-0.5 rounded ${
                          entity.type === 'polymer' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                          entity.type === 'nonpolymer' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                          'bg-gray-50 dark:bg-gray-900/20 text-gray-500 dark:text-gray-400'
                        }`}>
                          {entity.type === 'polymer' ? 'POL' : entity.type === 'nonpolymer' ? 'LIG' : 'OTHER'}
                        </span>
                      </div>
                      <div className="text-[9px] text-claude-text-muted truncate">{entity.label}</div>
                    </div>
                  </div>
                  {/* Color picker */}
                  {colorPickerEntity === entity.id && (
                    <div className="ml-6 mr-2 mb-1 p-2 bg-white dark:bg-[#1a1917] border border-claude-border/50 dark:border-[#4a4540]/50 rounded-md shadow-lg">
                      <div className="text-[9px] text-claude-text-muted mb-1.5">Choose color</div>
                      <div className="grid grid-cols-5 gap-1 mb-2">
                        {PRESET_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => handleColorChange(entity.id, color)}
                            className="w-5 h-5 rounded border border-black/10 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={entityColors[entity.id] || '#718096'}
                          onChange={e => handleColorChange(entity.id, e.target.value)}
                          className="w-6 h-6 rounded border border-claude-border cursor-pointer"
                        />
                        <span className="text-[9px] text-claude-text-muted font-mono">
                          {entityColors[entity.id] || '#718096'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f5f0eb] dark:bg-[#3d3832] z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 text-claude-accent animate-spin" />
            <span className="text-[11px] text-claude-text-muted dark:text-[#9b9590]">Loading 3D structure...</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f5f0eb] dark:bg-[#3d3832] z-10">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
              <circle cx="32" cy="32" r="8" fill="#d4784f" opacity="0.9" />
              <line x1="38" y1="27" x2="50" y2="16" stroke="#c9872e" strokeWidth="2" strokeLinecap="round" />
              <circle cx="52" cy="14" r="5" fill="#c9872e" opacity="0.7" />
              <line x1="24" y1="32" x2="12" y2="32" stroke="#7c5cbf" strokeWidth="2" strokeLinecap="round" />
              <circle cx="10" cy="32" r="5" fill="#7c5cbf" opacity="0.7" />
            </svg>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[13px] font-medium text-claude-text dark:text-[#e8e4dd]">3D structure unavailable</span>
              <span className="text-[11px] text-claude-text-muted dark:text-[#9b9590] max-w-[220px] leading-relaxed">
                {error.includes('cif') || error.includes('fetch') || error.includes('network') || error.includes('Failed')
                  ? 'Network issue loading structure from RCSB'
                  : error}
              </span>
            </div>
            <a
              href={`https://www.rcsb.org/structure/${pdbId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-claude-border-light dark:bg-[#2b2926] hover:bg-claude-border dark:hover:bg-[#3d3832] border border-claude-border dark:border-[#4a4540] text-[11px] font-medium text-claude-accent transition-colors duration-200"
            >
              View on RCSB PDB
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

async function loadStructure(plugin: any, pdbId: string) {
  const { Asset } = await importWithRetry(() => import('molstar/lib/mol-util/assets.js'));

  // Try primary RCSB source first
  try {
    const data = await plugin.builders.data.download(
      {
        url: Asset.Url(`https://files.rcsb.org/download/${pdbId}.cif`),
        isBinary: false,
      },
      { state: { isGhost: true } }
    );

    const trajectory = await plugin.builders.structure.parseTrajectory(data, 'mmcif');

    await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default', {
      structure: {
        name: 'model',
        params: {},
      },
      showUnitcell: false,
      representationPreset: 'auto',
    });
  } catch (primaryErr) {
    console.warn('[molstar] Primary CIF source failed, trying PDBe:', primaryErr);
    // Fallback to PDBe
    try {
      const data = await plugin.builders.data.download(
        {
          url: Asset.Url(`https://www.ebi.ac.uk/pdbe/static/files/${pdbId.toLowerCase()}.cif`),
          isBinary: false,
        },
        { state: { isGhost: true } }
      );

      const trajectory = await plugin.builders.structure.parseTrajectory(data, 'mmcif');

      await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default', {
        structure: {
          name: 'model',
          params: {},
        },
        showUnitcell: false,
        representationPreset: 'auto',
      });
    } catch (fallbackErr) {
      console.error('[molstar] Both RCSB and PDBe sources failed:', fallbackErr);
      throw fallbackErr;
    }
  }
}
