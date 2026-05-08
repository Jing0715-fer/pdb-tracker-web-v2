'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, ExternalLink, Palette, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface ChainInfo {
  chain: string;
  asym_id: string;
  length: number;
}

interface EntityInfo {
  entity_id: number;
  molecule_type: string;
  description: string;
  organism: string;
  gene_name: string;
  chains: ChainInfo[];
}

interface MoleculeViewerProps {
  pdbId: string;
  highlightEntity?: string | null;
  onEntityClick?: (entityId: string) => void;
  entityColors?: Record<string, string>;
  onEntityColorChange?: (entityId: string, color: string) => void;
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
      console.warn('[molstar] Chunk load failed, retrying...');
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
  const [showPanel, setShowPanel] = useState(true);
  const [colorPickerEntity, setColorPickerEntity] = useState<string | null>(null);
  const prevHighlightRef = useRef<string | null>(null);

  // Fetch entities from API
  useEffect(() => {
    async function fetchEntities() {
      try {
        const res = await fetch(`/api/entities/${pdbId}`);
        if (res.ok) {
          const data = await res.json();
          setEntities(data.entities || []);
        }
      } catch (err) {
        console.warn('[molstar] Failed to fetch entities:', err);
        setEntities([]);
      }
    }
    fetchEntities();
  }, [pdbId]);

  // Apply highlight when highlightEntity changes
  useEffect(() => {
    if (!pluginRef.current || !highlightEntity) return;
    if (highlightEntity === prevHighlightRef.current) return;
    
    applyHighlight(pluginRef.current, highlightEntity);
    prevHighlightRef.current = highlightEntity;
  }, [highlightEntity]);

  // Apply colors when entityColors changes
  useEffect(() => {
    if (!pluginRef.current) return;
    if (Object.keys(entityColors).length === 0) return;
    applyColors(pluginRef.current, entityColors);
  }, [entityColors]);

  async function applyHighlight(plugin: any, entityKey: string) {
    try {
      const { PluginCommands } = await importWithRetry(() => import('molstar/lib/mol-plugin/commands.js'));
      
      // Get current structure hierarchy
      const hierarchy = plugin.managers.structure.hierarchy.current;
      if (!hierarchy || hierarchy.length === 0) return;

      // Focus on the structure by resetting camera
      try {
        PluginCommands.Camera.Reset(plugin);
      } catch { /* ignore */ }
      
      // Try to use zoom-to-fit on the structure
      try {
        const sel = plugin.state.select('');
        if (sel.length > 0 && sel[0].ref) {
          PluginCommands.State.SetFocus(plugin, { ref: sel[0].ref });
        }
      } catch { /* ignore */ }
      
    } catch (err) {
      console.warn('[molstar] Highlight failed:', err);
    }
  }

  async function applyColors(plugin: any, colors: Record<string, string>) {
    // Color application via molstar themes requires complex structure traversal.
    // The colors are stored and displayed in the panel; actual 3D coloring
    // would require deeper molstar API integration.
    // For now, colors are saved and shown in the UI.
  }

  async function resetView() {
    if (!pluginRef.current) return;
    try {
      const { PluginCommands } = await importWithRetry(() => import('molstar/lib/mol-plugin/commands.js'));
      PluginCommands.Camera.Reset(pluginRef.current);
    } catch { /* ignore */ }
  }

  // Initialize molstar
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
          console.warn('[molstar] Chunk load failed after retry.');
        } else {
          console.error('[molstar] Failed to initialize:', err);
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

  const handleColorChange = useCallback((entityId: string, color: string) => {
    onEntityColorChange?.(entityId, color);
    setColorPickerEntity(null);
  }, [onEntityColorChange]);

  const getMoleculeTypeLabel = (molType: string) => {
    if (molType?.includes('polypeptide')) return 'POL';
    if (molType?.includes('DNA')) return 'DNA';
    if (molType?.includes('RNA')) return 'RNA';
    if (molType?.includes('water')) return 'WAT';
    if (molType === 'bound') return 'LIG';
    return 'OTHER';
  };

  const getMoleculeTypeStyle = (molType: string) => {
    if (molType?.includes('polypeptide')) return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
    if (molType?.includes('DNA')) return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
    if (molType?.includes('RNA')) return 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
    if (molType?.includes('water')) return 'bg-gray-50 dark:bg-gray-900/20 text-gray-400';
    if (molType === 'bound') return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
    return 'bg-gray-50 dark:bg-gray-900/20 text-gray-500 dark:text-gray-400';
  };

  const entityKey = (entity: EntityInfo, chain: ChainInfo) => `${pdbId}.${chain.chain}`;

  return (
    <div className="flex w-full rounded-lg overflow-hidden bg-[#f5f0eb] dark:bg-[#3d3832] border border-claude-border dark:border-[#4a4540]" style={{ height: '320px' }}>
      {/* Left: 3D Viewer */}
      <div className="relative flex-1 min-w-0">
        <div ref={containerRef} className="w-full h-full" />

        {/* 3D Viewer Controls overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
          <button
            onClick={resetView}
            title="Reset view"
            className="p-1.5 rounded-md bg-white/90 dark:bg-[#2b2926]/90 border border-claude-border/50 dark:border-[#4a4540]/50 hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-claude-text-secondary" />
          </button>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f5f0eb] dark:bg-[#3d3832] z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 text-claude-accent animate-spin" />
              <span className="text-[11px] text-claude-text-muted dark:text-[#9b9590]">Loading 3D...</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f5f0eb] dark:bg-[#3d3832] z-10">
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <span className="text-[12px] font-medium text-claude-text dark:text-[#e8e4dd]">3D unavailable</span>
              <a
                href={`https://www.rcsb.org/structure/${pdbId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-claude-border-light dark:bg-[#2b2926] text-claude-accent"
              >
                RCSB <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Right: Entity Panel */}
      <div className="w-56 flex-shrink-0 border-l border-claude-border dark:border-[#4a4540] bg-white/95 dark:bg-[#2b2926]/95 flex flex-col">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-claude-border/50 dark:border-[#4a4540]/50 bg-white/95 dark:bg-[#2b2926]">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-claude-accent" />
            <span className="text-[10px] font-semibold text-claude-text-muted uppercase tracking-wider">
              Entities ({entities.length})
            </span>
          </div>
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="text-[9px] text-claude-accent hover:text-claude-accent/80 transition-colors"
          >
            {showPanel ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Entity List */}
        {showPanel && (
          <div className="flex-1 overflow-y-auto">
            {entities.length === 0 && !loading ? (
              <div className="p-3 text-center">
                <span className="text-[10px] text-claude-text-muted">No entity data</span>
              </div>
            ) : (
              <div className="p-1.5 space-y-0.5">
                {entities.map(entity => (
                  <div key={entity.entity_id}>
                    {/* Entity header */}
                    <div className="px-1.5 py-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className={`text-[8px] px-1 py-0.5 rounded ${getMoleculeTypeStyle(entity.molecule_type)}`}>
                          {getMoleculeTypeLabel(entity.molecule_type)}
                        </span>
                        <span className="text-[9px] text-claude-text-muted">Entity {entity.entity_id}</span>
                      </div>
                      <div className="text-[9px] text-claude-text-secondary font-medium truncate" title={entity.description}>
                        {entity.description || 'Unknown'}
                      </div>
                      {entity.gene_name && (
                        <div className="text-[8px] text-claude-text-muted">gene: {entity.gene_name}</div>
                      )}
                    </div>

                    {/* Chains for this entity */}
                    <div className="ml-2 space-y-0.5">
                      {entity.chains.map(chain => {
                        const key = entityKey(entity, chain);
                        const isHovered = hoveredEntity === key;
                        const isHighlighted = highlightEntity === key;
                        const currentColor = entityColors[key] || '#718096';

                        return (
                          <div key={chain.chain}>
                            <div
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-all ${
                                isHovered
                                  ? 'bg-claude-accent-light/50 dark:bg-[#3d2a22]/30'
                                  : isHighlighted
                                  ? 'ring-1 ring-claude-accent bg-claude-accent-light/30 dark:bg-[#3d2a22]/20'
                                  : 'hover:bg-claude-border-light/30 dark:hover:bg-[#3d3832]/20'
                              }`}
                              onMouseEnter={() => {
                                setHoveredEntity(key);
                                if (pluginRef.current) {
                                  applyHighlight(pluginRef.current, key);
                                }
                              }}
                              onMouseLeave={() => {
                                setHoveredEntity(null);
                              }}
                              onClick={() => onEntityClick?.(key)}
                            >
                              {/* Color dot */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setColorPickerEntity(colorPickerEntity === key ? null : key);
                                }}
                                className="w-4 h-4 rounded-sm border border-black/20 flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                                style={{ backgroundColor: currentColor }}
                              />

                              {/* Chain info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-mono font-medium text-claude-text-secondary">
                                    {chain.chain}
                                  </span>
                                  {chain.length && (
                                    <span className="text-[8px] text-claude-text-muted">
                                      {chain.length}aa
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action hint */}
                              <span className="text-[8px] text-claude-text-muted/40">
                                {isHovered ? '●' : '○'}
                              </span>
                            </div>

                            {/* Color picker popup */}
                            {colorPickerEntity === key && (
                              <div className="ml-6 mr-1 mb-1 p-2 bg-white dark:bg-[#1a1917] border border-claude-border/50 dark:border-[#4a4540]/50 rounded-md shadow-lg z-10">
                                <div className="text-[9px] text-claude-text-muted mb-1.5">Pick color</div>
                                <div className="grid grid-cols-5 gap-1 mb-2">
                                  {PRESET_COLORS.map(color => (
                                    <button
                                      key={color}
                                      onClick={() => handleColorChange(key, color)}
                                      className="w-5 h-5 rounded border border-black/10 hover:scale-110 transition-transform"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={currentColor}
                                    onChange={e => handleColorChange(key, e.target.value)}
                                    className="w-6 h-6 rounded border border-claude-border cursor-pointer"
                                  />
                                  <span className="text-[9px] text-claude-text-muted font-mono">
                                    {currentColor}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Panel Footer */}
        {showPanel && entities.length > 0 && (
          <div className="px-2 py-1 border-t border-claude-border/50 dark:border-[#4a4540]/50 bg-white/95 dark:bg-[#2b2926]">
            <div className="text-[8px] text-claude-text-muted/60 text-center">
              Click to highlight · Color to change
            </div>
          </div>
        )}
      </div>
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
    console.warn('[molstar] RCSB failed, trying PDBe...');
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
      console.error('[molstar] Both sources failed:', fallbackErr);
      throw fallbackErr;
    }
  }
}
