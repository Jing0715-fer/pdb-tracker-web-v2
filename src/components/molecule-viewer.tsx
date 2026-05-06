'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';

interface MoleculeViewerProps {
  pdbId: string;
}

export default function MoleculeViewer({ pdbId }: MoleculeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pluginRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    async function init() {
      try {
        // Dynamic imports for browser-only molstar
        const { createPluginUI } = await import('molstar/lib/mol-plugin-ui/index.js');
        const { DefaultPluginUISpec } = await import('molstar/lib/mol-plugin-ui/spec.js');
        const { renderReact18 } = await import('molstar/lib/mol-plugin-ui/react18.js');
        const { PluginCommands } = await import('molstar/lib/mol-plugin/commands.js');
        const { Color } = await import('molstar/lib/mol-util/color/index.js');

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
              (await import('molstar/lib/mol-plugin/config.js')).PluginConfig.General.IsBusyTimeout,
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

        // Set light background
        PluginCommands.Canvas3D.SetSettings(plugin, {
          settings: (props: any) => {
            props.renderer.backgroundColor = Color(0xf5f0eb);
          },
        });

        // Load structure
        await loadStructure(plugin, pdbId);

        if (!destroyed) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize Molstar viewer:', err);
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

  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden bg-[#f5f0eb] dark:bg-[#2b2926] border border-claude-border dark:border-[#3d3832]">
      <div ref={containerRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f5f0eb] dark:bg-[#2b2926] z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 text-claude-accent animate-spin" />
            <span className="text-[11px] text-claude-text-muted dark:text-[#9b9590]">Loading 3D structure...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f5f0eb] dark:bg-[#2b2926] z-10">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            {/* Stylized molecule SVG placeholder */}
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
              {/* Central atom */}
              <circle cx="32" cy="32" r="8" fill="#d4784f" opacity="0.9" />
              {/* Top-right atom and bond */}
              <line x1="38" y1="27" x2="50" y2="16" stroke="#c9872e" strokeWidth="2" strokeLinecap="round" />
              <circle cx="52" cy="14" r="5" fill="#c9872e" opacity="0.7" />
              {/* Bottom-right atom and bond */}
              <line x1="38" y1="37" x2="52" y2="46" stroke="#2d8f8f" strokeWidth="2" strokeLinecap="round" />
              <circle cx="54" cy="48" r="5" fill="#2d8f8f" opacity="0.7" />
              {/* Left atom and bond */}
              <line x1="24" y1="32" x2="12" y2="32" stroke="#7c5cbf" strokeWidth="2" strokeLinecap="round" />
              <circle cx="10" cy="32" r="5" fill="#7c5cbf" opacity="0.7" />
              {/* Top-left atom and bond */}
              <line x1="27" y1="26" x2="16" y2="14" stroke="#c4644a" strokeWidth="2" strokeLinecap="round" />
              <circle cx="14" cy="12" r="4" fill="#c4644a" opacity="0.6" />
              {/* Bottom-left atom and bond */}
              <line x1="27" y1="38" x2="18" y2="50" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="16" cy="52" r="3.5" fill="#6b7280" opacity="0.5" />
              {/* Double bond indicator on top-right */}
              <line x1="39" y1="25" x2="51" y2="14" stroke="#c9872e" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            </svg>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[13px] font-medium text-claude-text dark:text-[#e8e4dd]">3D structure not available</span>
              <span className="text-[11px] text-claude-text-muted dark:text-[#9b9590] max-w-[220px] leading-relaxed">
                PDB structure data is available for real RCSB entries
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
  const { Asset } = await import('molstar/lib/mol-util/assets.js');

  // Download CIF file from RCSB
  const data = await plugin.builders.data.download(
    {
      url: Asset.Url(`https://files.rcsb.org/download/${pdbId}.cif`),
      isBinary: false,
    },
    { state: { isGhost: true } }
  );

  // Parse as mmCIF trajectory
  const trajectory = await plugin.builders.structure.parseTrajectory(data, 'mmcif');

  // Apply default preset (model + representation)
  await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default', {
    structure: {
      name: 'model',
      params: {},
    },
    showUnitcell: false,
    representationPreset: 'auto',
  });
}
