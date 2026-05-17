          <button
            onClick={() => setPreviewOpen(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-7 w-7 flex items-center justify-center rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150"
            aria-label="Close preview panel"
          >
            <X className="h-4 w-4 text-claude-text-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto preview-scroll min-h-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={previewTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col min-h-0 flex-1"
            >
          {previewTab === 'summary' ? (
            mode === 'weekly' && selectedSnapshot ? (
              compareMode && compareWeekId && compareSnapshot ? (
                <WeekComparisonView
                  snapshotA={selectedSnapshot}
                  snapshotB={compareSnapshot}
                  entriesA={entries}
                  entriesB={compareEntries}
                  snapshots={snapshots}
                />
              ) : (
                <WeeklySummary snapshot={selectedSnapshot} snapshots={snapshots} entries={entries} />
              )
            ) : mode === 'evaluation' && selectedBatchId && !selectedEval ? (
              <BatchPreviewContent
                batchId={selectedBatchId}
                onSelectSubTarget={(uniprotId) => { setSelectedEvalId(uniprotId); }}
                selectedSubTargetId={selectedEvalId}
                allEvals={evaluations}
                batchFetchedEvals={batchFetchedEvals}
                evalBatches={evalBatches}
                evalBatchSubTargets={evalBatchSubTargets}
                onOpenBatchReport={openBatchReport}
              />
            ) : mode === 'evaluation' && selectedEval && selectedBatchId ? (
              <div>
                <button
                  onClick={() => { setSelectedEvalId(null); setSelectedEval(null); }}
                  className="flex items-center gap-1 px-2 py-1.5 mb-2 rounded-md text-[10px] text-claude-text-muted hover:text-claude-accent hover:bg-claude-border-light/50 dark:hover:bg-[#3d3832]/50 transition-colors"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Back to batch
                </button>
                <EvalSummary evalData={selectedEval as any} openReport={openEvalReport} />
              </div>
            ) : mode === 'evaluation' && selectedComplexId && complexEvalData && !selectedEval ? (
              <ComplexEvalSummary subEvals={complexEvalData.subEvals} group={complexEvalData.group} openReport={openEvalReport} onSelectEval={(uniprotId) => setSelectedEvalId(uniprotId)} />
            ) : mode === 'evaluation' && selectedEval && selectedComplexId && complexEvalData ? (
              <div>
                <button
                  onClick={() => { setSelectedEvalId(null); setSelectedEval(null); }}
                  className="flex items-center gap-1 px-2 py-1.5 mb-2 rounded-md text-[10px] text-claude-text-muted hover:text-claude-accent hover:bg-claude-border-light/50 dark:hover:bg-[#3d3832]/50 transition-colors"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Back to {complexEvalData.group.name}
                </button>
                <EvalSummary evalData={selectedEval as any} openReport={openEvalReport} />
              </div>
            ) : mode === 'evaluation' && selectedEval ? (
              <EvalSummary evalData={selectedEval as any} openReport={openEvalReport} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted dark:text-[#9b9590]">
                <Info className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">Select an item to view summary</p>
              </div>
            )
          ) : previewTab === 'timeline' ? (
            /* Timeline Tab */
            mode === 'weekly' && selectedSnapshot && entries.length > 0 ? (
              <WeeklyTimeline
                entries={entries}
                snapshot={selectedSnapshot}
                onSelectEntry={(entry) => { setSelectedEntry(entry); setDetailPanelOpen(true); setPreviewTab('summary'); }}
                onHighlightEntry={setHighlightedEntry}
                highlightedEntry={highlightedEntry}
              />
            ) : mode === 'evaluation' && selectedEval && ((selectedEval.pdbStructures?.length || 0) + (selectedEval.blastResults?.length || 0)) > 0 ? (
              <EvaluationTimeline
                pdbStructures={selectedEval.pdbStructures as unknown as { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null }[]}
                blastResults={selectedEval.blastResults as unknown as { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null; identity: number | null }[]}
                onSelectPdb={(pdbId) => {
                  // Find in PDB structures first, then BLAST results
                  const struct = selectedEval.pdbStructures?.find(s => s.pdbId === pdbId);
                  const blast = selectedEval.blastResults?.find(b => b.pdbId === pdbId);
                  if (struct) {
                    setSelectedEvalStructure(null);
                    setSelectedEntry({ ...struct, _type: 'evaluation' } as unknown as PdbEntry);
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  } else if (blast?.pdbId) {
                    // BLAST results with a pdbId also use the shared detail panel
                    setSelectedEvalStructure(null);
                    setSelectedEntry({ ...blast, _type: 'evaluation' } as unknown as PdbEntry);
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  } else if (blast) {
                    setSelectedEvalStructure({ ...blast, isBlast: true } as unknown as EvalPdbStructure & { isBlast: boolean });
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  }
                }}
              />
            ) : mode === 'evaluation' && selectedBatchId && !selectedEval && sortedEvalRows.length > 0 ? (
              <EvaluationTimeline
                pdbStructures={sortedEvalRows.filter(r => r._type === 'structure') as any}
                blastResults={sortedEvalRows.filter(r => r._type === 'blast') as any}
                onSelectPdb={(pdbId) => {
                  const struct = sortedEvalRows.find(r => r._type === 'structure' && r.pdbId === pdbId);
                  const blast = sortedEvalRows.find(r => r._type === 'blast' && r.pdbId === pdbId);
                  if (struct) {
                    setSelectedEvalStructure(null);
                    setSelectedEntry({ ...struct, _type: 'evaluation' } as unknown as PdbEntry);
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  } else if (blast?.pdbId) {
                    setSelectedEvalStructure(null);
                    setSelectedEntry({ ...blast, _type: 'evaluation' } as unknown as PdbEntry);
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  } else if (blast) {
                    setSelectedEvalStructure({ ...blast, isBlast: true } as unknown as EvalPdbStructure & { isBlast: boolean });
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  }
                }}
              />
            ) : mode === 'evaluation' && selectedComplexId && complexEvalData && !selectedEval && ((complexEvalData.allStructures?.length || 0) + (complexEvalData.allBlasts?.length || 0)) > 0 ? (
              <EvaluationTimeline
                pdbStructures={complexEvalData.allStructures as any}
                blastResults={complexEvalData.allBlasts.filter(b => b.pdbId) as any}
                onSelectPdb={(pdbId) => {
                  const struct = complexEvalData.allStructures.find(s => s.pdbId === pdbId);
                  const blast = complexEvalData.allBlasts.find(b => b.pdbId === pdbId);
                  if (struct) {
                    setSelectedEvalStructure(null);
                    setSelectedEntry({ ...struct, _type: 'evaluation' } as unknown as PdbEntry);
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  } else if (blast?.pdbId) {
                    setSelectedEvalStructure(null);
                    setSelectedEntry({ ...blast, _type: 'evaluation' } as unknown as PdbEntry);
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  } else if (blast) {
                    setSelectedEvalStructure({ ...blast, isBlast: true } as unknown as EvalPdbStructure & { isBlast: boolean });
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted dark:text-[#9b9590]">
                <Clock className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">{mode === 'evaluation' ? 'No PDB structures for timeline' : 'Select a week to view timeline'}</p>
              </div>
            )
          ) : previewTab === 'heatmap' ? (
            /* Heatmap Tab */
            mode === 'weekly' ? (
              <ActivityHeatmap
                entries={heatmapEntries}
                snapshots={snapshots}
                loading={heatmapLoading}
                className="flex-1 min-h-0"
              />
            ) : mode === 'evaluation' && selectedEval && ((selectedEval.pdbStructures?.length || 0) + (selectedEval.blastResults?.length || 0)) > 0 ? (
              <EvaluationHeatmap
                pdbStructures={selectedEval.pdbStructures as unknown as { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null; pubmedId: string | null }[]}
                blastResults={selectedEval.blastResults as unknown as { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null; pubmedId: string | null; identity: number | null }[]}
                onSelectPdb={(pdbId) => {
                  const struct = selectedEval.pdbStructures?.find(s => s.pdbId === pdbId);
                  const blast = selectedEval.blastResults?.find(b => b.pdbId === pdbId);
                  if (struct) {
                    setSelectedEvalStructure(null);
                    setSelectedEntry({ ...struct, _type: 'evaluation' } as unknown as PdbEntry);
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  } else if (blast?.pdbId) {
                    setSelectedEvalStructure(null);
                    setSelectedEntry({ ...blast, _type: 'evaluation' } as unknown as PdbEntry);
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  } else if (blast) {
                    setSelectedEvalStructure({ ...blast, isBlast: true } as unknown as EvalPdbStructure & { isBlast: boolean });
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  }
                }}
              />
            ) : mode === 'evaluation' && selectedComplexId && complexEvalData && !selectedEval && ((complexEvalData.allStructures?.length || 0) + (complexEvalData.allBlasts?.length || 0)) > 0 ? (
              <EvaluationHeatmap
                pdbStructures={complexEvalData.allStructures as any}
                blastResults={complexEvalData.allBlasts.filter(b => b.pdbId) as any}
                onSelectPdb={(pdbId) => {
                  const struct = complexEvalData.allStructures.find(s => s.pdbId === pdbId);
                  const blast = complexEvalData.allBlasts.find(b => b.pdbId === pdbId);
                  if (struct) {
                    setSelectedEvalStructure(null);
                    setSelectedEntry({ ...struct, _type: 'evaluation' } as unknown as PdbEntry);
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  } else if (blast?.pdbId) {
                    setSelectedEvalStructure(null);
                    setSelectedEntry({ ...blast, _type: 'evaluation' } as unknown as PdbEntry);
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  } else if (blast) {
                    setSelectedEvalStructure({ ...blast, isBlast: true } as unknown as EvalPdbStructure & { isBlast: boolean });
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  }
                }}
              />
            ) : mode === 'evaluation' && selectedBatchId && !selectedEval && sortedEvalRows.length > 0 ? (
              <EvaluationHeatmap
                pdbStructures={sortedEvalRows.filter(r => r._type === 'structure') as any}
                blastResults={sortedEvalRows.filter(r => r._type === 'blast') as any}
                onSelectPdb={(pdbId) => {
                  const struct = sortedEvalRows.find(r => r._type === 'structure' && r.pdbId === pdbId);
                  const blast = sortedEvalRows.find(r => r._type === 'blast' && r.pdbId === pdbId);
                  if (struct) {
                    setSelectedEvalStructure(null);
                    setSelectedEntry({ ...struct, _type: 'evaluation' } as unknown as PdbEntry);
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  } else if (blast?.pdbId) {
                    setSelectedEvalStructure(null);
                    setSelectedEntry({ ...blast, _type: 'evaluation' } as unknown as PdbEntry);
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  } else if (blast) {
                    setSelectedEvalStructure({ ...blast, isBlast: true } as unknown as EvalPdbStructure & { isBlast: boolean });
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted dark:text-[#9b9590]">
                <BookOpen className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">{mode === 'evaluation' ? 'No literature data available' : 'Literature available in evaluation mode'}</p>
              </div>
            )
          ) : (
            /* Report Tab */
            mode === 'weekly' && selectedWeekId && weeklyReports.length > 0 ? (
              <div className="p-4 space-y-2">
                {weeklyReports.map(report => (
                  <button
                    key={report.id}
                    onClick={() => openReport(report.id, report.title || 'Weekly Report')}
                    className="w-full text-left p-3 rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] hover:bg-claude-border-light dark:hover:bg-[#2b2926] transition-all duration-150 claude-hover"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-3.5 w-3.5 text-claude-accent" />
                      <span className="text-xs font-medium text-claude-text">{report.title || `Report (${report.reportType})`}</span>
                    </div>
                    <div className="text-[10px] text-claude-text-muted">{formatDate(report.createdAt)}</div>
                  </button>
                ))}
              </div>
            ) : mode === 'evaluation' && selectedBatchId ? (
              <div className="p-4 space-y-2">
                <button
                  onClick={() => openBatchReport(selectedBatchId, evalBatches.find(b => b.batchId === selectedBatchId)?.title || 'Batch Report')}
                  className="w-full text-left p-3 rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] hover:border-claude-accent/40 hover:bg-claude-border-light/30 dark:hover:bg-[#3d3832]/30 transition-all duration-150"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-3.5 w-3.5 text-claude-accent" />
                    <span className="text-xs font-semibold text-claude-text">SDG2-CDKC Complex Structure Feasibility Report</span>
                  </div>
                  <div className="text-[10px] text-claude-text-muted">Full batch evaluation report</div>
                </button>
                {(evalBatchSubTargets[selectedBatchId] || []).length > 0 && (evalBatchSubTargets[selectedBatchId] || []).map(sub => {
                  const subEval = evaluations.find(e => e.uniprotId === sub.uniprotId) || batchFetchedEvals[sub.uniprotId];
                  return subEval?.report ? (
                    <button
                      key={sub.uniprotId}
                      onClick={() => openEvalReport(sub.uniprotId, subEval.proteinName || subEval.uniprotId + ' Report')}
                      className="w-full text-left p-3 rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] hover:bg-claude-border-light dark:hover:bg-[#2b2926] transition-all duration-150 claude-hover"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-3.5 w-3.5 text-claude-accent" />
                        <span className="text-xs font-medium text-claude-text">{subEval.proteinName || subEval.uniprotId}</span>
                        <span className="text-[9px] text-claude-text-muted font-mono ml-auto">{sub.uniprotId}</span>
                      </div>
                      <div className="text-[10px] text-claude-text-muted">Sub-target evaluation report</div>
                    </button>
                  ) : null;
                })}
              </div>
            ) : mode === 'evaluation' && selectedEval ? (
              (() => {
                const filteredReports = evalReports.filter(r => r.uniprotId === selectedEval.uniprotId);
                return (
                  <div className="p-4 space-y-2">
                    {filteredReports.length > 0 ? filteredReports.map(report => (
                      <button
                        key={report.id}
                        onClick={() => openEvalReport(report.uniprotId, report.title || 'Evaluation Report')}
                        className="w-full text-left p-3 rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] hover:bg-claude-border-light dark:hover:bg-[#2b2926] transition-all duration-150 claude-hover"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-3.5 w-3.5 text-claude-accent" />
                          <span className="text-xs font-medium text-claude-text">{report.title?.startsWith('#') ? 'Evaluation Report' : report.title || 'Evaluation Report'}</span>
                        </div>
                        <div className="text-[10px] text-claude-text-muted">{formatDate(report.createdAt)}</div>
                      </button>
                    )) : null}
                    {selectedEval.report ? (
                      <button
                        key="embedded-report"
                        onClick={() => setReportModal({ isOpen: true, title: selectedEval.proteinName || selectedEval.uniprotId + ' Report', content: selectedEval.report || '' })}
                        className="w-full text-left p-3 rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] hover:bg-claude-border-light dark:hover:bg-[#2b2926] transition-all duration-150 claude-hover"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-3.5 w-3.5 text-claude-accent" />
                          <span className="text-xs font-medium text-claude-text">Embedded Report</span>
                        </div>
                        <div className="text-[10px] text-claude-text-muted">Full evaluation report</div>
                      </button>
                    ) : null}
                    {filteredReports.length === 0 && !selectedEval.report ? (
                      <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted">
                        <FileText className="h-8 w-8 mb-2 opacity-30" />
                        <p className="text-xs">No evaluation reports for this entry</p>
                      </div>
                    ) : null}
                  </div>
                );
              })()
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted">
                <FileText className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">No reports available</p>
              </div>
            )
          )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    );
  }
}

// ─── Weekly Summary Sub-Component (Enhanced with Charts) ─────────────────────

function WeeklySummary({ snapshot, snapshots, entries }: { snapshot: WeeklySnapshot; snapshots: WeeklySnapshot[]; entries: PdbEntry[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const topJournals = useMemo(() => {
    try { return snapshot.topJournals ? JSON.parse(snapshot.topJournals) : []; }
    catch { return []; }
  }, [snapshot.topJournals]);

  const ifDist = useMemo(() => {
    try { return snapshot.ifDist ? JSON.parse(snapshot.ifDist) : null; }
    catch { return null; }
  }, [snapshot.ifDist]);

  const cryoemResDist = useMemo(() => {
    try { return snapshot.cryoemResDist ? JSON.parse(snapshot.cryoemResDist) : null; }
    catch { return null; }
  }, [snapshot.cryoemResDist]);

  const xrayResDist = useMemo(() => {
    try { return snapshot.xrayResDist ? JSON.parse(snapshot.xrayResDist) : null; }
    catch { return null; }
  }, [snapshot.xrayResDist]);

  // Method distribution data for donut chart
  const methodPieData = useMemo(() => [
    { name: 'Cryo-EM', value: snapshot.cryoemCount, color: METHOD_COLORS['Cryo-EM'] },
    { name: 'X-ray', value: snapshot.xrayCount, color: METHOD_COLORS['X-ray'] },
    { name: 'NMR', value: snapshot.nmrCount, color: METHOD_COLORS['NMR'] },
    { name: 'Other', value: snapshot.otherCount, color: METHOD_COLORS['Other'] },
  ].filter(d => d.value > 0), [snapshot]);

  // Resolution distribution data for horizontal bar chart
  const resolutionBarData = useMemo(() => {
    const data: { range: string; count: number; color: string }[] = [];
    const combinedDist: Record<string, number> = {};

    if (xrayResDist) {
      for (const [range, count] of Object.entries(xrayResDist)) {
        combinedDist[range] = (combinedDist[range] || 0) + (count as number);
      }
    }
    if (cryoemResDist) {
      for (const [range, count] of Object.entries(cryoemResDist)) {
        combinedDist[range] = (combinedDist[range] || 0) + (count as number);
      }
    }

    // Map the combined distribution to the standard ranges
    for (const r of RESOLUTION_RANGES) {
      const count = combinedDist[r.label.replace('Å', '')] || combinedDist[r.label] || 0;
      data.push({ range: r.label, count, color: r.color });
    }

    // If no distribution data from API, return empty but with labels
    return data;
  }, [xrayResDist, cryoemResDist]);

  // IF Tier distribution data for bar chart
  const ifTierBarData = useMemo(() => {
    if (!ifDist) return [];
    return [
      { tier: 'Top', count: ifDist.top || 0, color: IF_TIER_COLORS.top },
      { tier: 'High', count: ifDist.high || 0, color: IF_TIER_COLORS.high },
      { tier: 'Mid', count: ifDist.mid || 0, color: IF_TIER_COLORS.mid },
      { tier: 'Low', count: ifDist.low || 0, color: IF_TIER_COLORS.low },
    ];
  }, [ifDist]);

  // Weekly trends data for area chart
  const weeklyTrendData = useMemo(() => {
    if (!snapshots || snapshots.length === 0) return [];
    return [...snapshots]
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
      .map(s => ({
        week: s.weekId.replace('W', ' W'),
        total: s.totalStructures,
        cryoem: s.cryoemCount,
        xray: s.xrayCount,
      }));
  }, [snapshots]);

  // Organism distribution data for horizontal bar chart
  const organismBarData = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    const organismCounts: Record<string, number> = {};
    entries.forEach(e => {
      if (!e.organisms) return;
      e.organisms.split('|').filter(Boolean).forEach(org => {
        const trimmed = org.trim();
        if (trimmed) organismCounts[trimmed] = (organismCounts[trimmed] || 0) + 1;
      });
    });
    const total = entries.length;
    return Object.entries(organismCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name: name.length > 22 ? name.slice(0, 21) + '…' : name,
        count,
        pct: total > 0 ? ((count / total) * 100).toFixed(1) : '0',
      }));
  }, [entries]);

  const ORGANISM_COLORS = ['#c4644a', '#2d8f8f', '#7c5cbf', '#c9872e', '#6b7280'];

  // Scatter plot data: Resolution vs IF
  const scatterData = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    return entries
      .filter(e => e.resolution != null && e.journalIf != null)
      .map(e => ({
        pdbId: e.pdbId,
        resolution: e.resolution!,
        journalIf: e.journalIf!,
        method: e.method,
        ifTier: e.ifTier,
        title: e.title,
      }));
  }, [entries]);

  const scatterMaxIf = useMemo(() => {
    if (scatterData.length === 0) return 50;
    return Math.max(...scatterData.map(d => d.journalIf)) + 10;
  }, [scatterData]);

  const methodData = [
    { label: 'Cryo-EM', count: snapshot.cryoemCount, color: '#2d8f8f', bg: '#e8f5f5' },
    { label: 'X-ray', count: snapshot.xrayCount, color: '#7c5cbf', bg: '#f0ebf8' },
    { label: 'NMR', count: snapshot.nmrCount, color: '#c9872e', bg: '#fdf4e5' },
    { label: 'Other', count: snapshot.otherCount, color: '#6b7280', bg: '#f3f4f6' },
  ];

  const maxMethodCount = Math.max(...methodData.map(d => d.count), 1);

  return (
    <div className="p-4 space-y-5">
      {/* Week Header */}
      <div>
        <h3 className="text-sm font-semibold text-claude-text">{snapshot.weekId}</h3>
        <p className="text-[10px] text-claude-text-muted mt-0.5">
          {formatDate(snapshot.weekStart)} — {formatDate(snapshot.weekEnd)}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg bg-claude-border-light/50 dark:bg-[#2b2926] claude-card-shadow">
          <div className="text-lg font-semibold text-claude-text"><AnimatedNumber value={snapshot.totalStructures} /></div>
          <div className="text-[10px] text-claude-text-muted">Total Structures</div>
        </div>
        <div className="p-3 rounded-lg bg-claude-cryoem-bg/50 dark:bg-[#1a2e2e] claude-card-shadow">
          <div className="text-lg font-semibold text-claude-cryoem"><AnimatedNumber value={snapshot.cryoemCount} /></div>
          <div className="text-[10px] text-claude-cryoem/70">Cryo-EM</div>
        </div>
        <div className="p-3 rounded-lg bg-claude-xray-bg/50 dark:bg-[#28203a] claude-card-shadow">
          <div className="text-lg font-semibold text-claude-xray"><AnimatedNumber value={snapshot.xrayCount} /></div>
          <div className="text-[10px] text-claude-xray/70">X-ray</div>
        </div>
        <div className="p-3 rounded-lg bg-claude-nmr-bg/50 dark:bg-[#302818] claude-card-shadow">
          <div className="text-lg font-semibold text-claude-nmr"><AnimatedNumber value={snapshot.nmrCount} /></div>
          <div className="text-[10px] text-claude-nmr/70">NMR</div>
        </div>
      </div>

      {/* ─── Chart 1: Method Distribution Donut Chart ─── */}
      {methodPieData.length > 0 && (
        <div className="bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-lg p-3 claude-card-shadow chart-container chart-inner-shadow">
          <h4 className="text-xs font-semibold text-claude-text mb-2">Method Distribution</h4>
          <div className="flex items-center gap-3">
            <div className="w-[120px] h-[120px] flex-shrink-0">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={methodPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={52}
                    paddingAngle={2}
                    dataKey="value"
