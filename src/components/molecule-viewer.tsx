'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

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

        // Set dark background
        PluginCommands.Canvas3D.SetSettings(plugin, {
          settings: (props: any) => {
            props.renderer.backgroundColor = Color(0x1a1917);
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
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden bg-[#1a1917] border border-claude-border">
      <div ref={containerRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1917] z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 text-claude-accent animate-spin" />
            <span className="text-[11px] text-claude-text-muted">Loading 3D structure...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1917] z-10">
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            <span className="text-[11px] text-claude-text-muted">Failed to load 3D structure</span>
            <span className="text-[10px] text-claude-text-muted/60">{error}</span>
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
