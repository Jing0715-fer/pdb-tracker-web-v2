                    stroke="none"
                    animationBegin={0}
                    animationDuration={600}
                    style={{ cursor: 'pointer' }}
                  >
                    {methodPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="transition-opacity duration-150 hover:opacity-80" />
                    ))}
                  </Pie>
                  <RTooltip content={({ active, payload }) => <ClaudeChartTooltip active={active} payload={payload as any} isDark={isDark} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {methodPieData.map(item => {
                const pct = snapshot.totalStructures > 0 ? (item.value / snapshot.totalStructures) * 100 : 0;
                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] text-claude-text-secondary flex-1">{item.name}</span>
                    <span className="text-[10px] font-mono text-claude-text-muted">{item.value}</span>
                    <span className="text-[9px] text-claude-text-muted">({pct.toFixed(0)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Chart 2: Resolution Distribution Bar Chart ─── */}
      {resolutionBarData.some(d => d.count > 0) && (
        <div className="bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-lg p-3 claude-card-shadow chart-container chart-inner-shadow">
          <h4 className="text-xs font-semibold text-claude-text mb-2">Resolution Distribution</h4>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={resolutionBarData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
              <XAxis type="number" tick={{ fontSize: 9, fill: getChartTickColor(isDark) }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="range" tick={{ fontSize: 9, fill: getChartAxisColor(isDark) }} axisLine={false} tickLine={false} width={52} />
              <RTooltip content={({ active, payload }) => <ClaudeResTooltip active={active} payload={payload as any} isDark={isDark} />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} animationDuration={600} style={{ cursor: 'pointer' }}>
                {resolutionBarData.map((entry, index) => (
                  <Cell key={`res-cell-${index}`} fill={entry.color} className="transition-opacity duration-150 hover:opacity-80" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Average Resolution */}
      <div className="grid grid-cols-2 gap-2">
        {snapshot.cryoemAvgRes != null && (
          <div className="p-3 rounded-lg bg-claude-cryoem-bg/30 dark:bg-[#1a2e2e]/50">
            <div className="text-[10px] text-claude-cryoem/70 mb-0.5">Cryo-EM Avg Res</div>
            <div className="text-sm font-mono font-semibold text-claude-cryoem">{snapshot.cryoemAvgRes.toFixed(2)}Å</div>
          </div>
        )}
        {snapshot.xrayAvgRes != null && (
          <div className="p-3 rounded-lg bg-claude-xray-bg/30 dark:bg-[#28203a]/50">
            <div className="text-[10px] text-claude-xray/70 mb-0.5">X-ray Avg Res</div>
            <div className="text-sm font-mono font-semibold text-claude-xray">{snapshot.xrayAvgRes.toFixed(2)}Å</div>
          </div>
        )}
      </div>

      {/* ─── Chart 5: Organism Distribution Horizontal Bar Chart ─── */}
      {organismBarData.length > 0 && (
        <div className="bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-lg p-3 claude-card-shadow chart-container chart-inner-shadow">
          <h4 className="text-xs font-semibold text-claude-text mb-2">Top Organisms</h4>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={organismBarData} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
              <XAxis type="number" tick={{ fontSize: 8, fill: getChartTickColor(isDark) }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fill: getChartAxisColor(isDark) }} axisLine={false} tickLine={false} width={85} />
              <RTooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className={`rounded-lg px-3 py-2 text-xs shadow-lg border bg-white dark:bg-[#2b2926] dark:border-[#4a4540] text-claude-text`}>
                    <div className={`font-semibold mb-0.5 text-[11px] text-claude-text`}>{d.name}</div>
                    <div className="flex items-center gap-2 py-0.5">
                      <span className="text-claude-text-secondary">Count</span>
                      <span className={`font-mono font-medium ml-auto text-claude-text`}>{d.count}</span>
                      <span className="text-claude-text-muted">({d.pct}%)</span>
                    </div>
                  </div>
                );
              }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} animationDuration={600} style={{ cursor: 'pointer' }}>
                {organismBarData.map((_, index) => (
                  <Cell key={`org-cell-${index}`} fill={ORGANISM_COLORS[index % ORGANISM_COLORS.length]} className="transition-opacity duration-150 hover:opacity-80" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ─── Chart 3: Impact Factor Tier Distribution ─── */}
      {ifTierBarData.length > 0 && ifTierBarData.some(d => d.count > 0) && (
        <div className="bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-lg p-3 claude-card-shadow chart-container chart-inner-shadow">
          <h4 className="text-xs font-semibold text-claude-text mb-2">Impact Factor Tiers</h4>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={ifTierBarData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <XAxis dataKey="tier" tick={{ fontSize: 9, fill: getChartAxisColor(isDark) }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: getChartTickColor(isDark) }} axisLine={false} tickLine={false} width={24} />
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#3d3832' : '#f0e8df'} vertical={false} />
              <RTooltip content={({ active, payload, label }) => <ClaudeChartTooltip active={active} payload={payload as any} label={typeof label === 'string' ? label : undefined} isDark={isDark} />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={600} style={{ cursor: 'pointer' }}>
                {ifTierBarData.map((entry, index) => (
                  <Cell key={`if-cell-${index}`} fill={entry.color} className="transition-opacity duration-150 hover:opacity-80" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ─── Chart 4: Weekly Trends Mini Area Chart ─── */}
      {weeklyTrendData.length > 1 && (
        <div className="bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-lg p-3 claude-card-shadow chart-container chart-inner-shadow">
          <h4 className="text-xs font-semibold text-claude-text mb-2">Weekly Trends</h4>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={weeklyTrendData} margin={{ top: 2, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDark ? '#d4784f' : '#c4644a'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isDark ? '#d4784f' : '#c4644a'} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                tick={{ fontSize: 8, fill: getChartTickColor(isDark) }}
                axisLine={false}
                tickLine={false}
                interval={Math.max(0, Math.floor(weeklyTrendData.length / 4) - 1)}
              />
              <YAxis tick={{ fontSize: 8, fill: getChartTickColor(isDark) }} axisLine={false} tickLine={false} width={28} />
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#3d3832' : '#f0e8df'} vertical={false} />
              <RTooltip content={({ active, payload, label }) => <ClaudeTrendTooltip active={active} payload={payload as any} label={typeof label === 'string' ? label : undefined} isDark={isDark} />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke={isDark ? '#d4784f' : '#c4644a'}
                strokeWidth={1.5}
                fill="url(#trendGradient)"
                animationDuration={600}
                style={{ cursor: 'pointer' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ─── Chart 6: Resolution vs IF Scatter Plot ─── */}
      {scatterData.length > 0 && (
        <div className="bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-[10px] p-3">
          <h4 className="text-xs font-semibold text-claude-text mb-2">Resolution vs Impact Factor</h4>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#3d3832' : '#f0e8df'} />
              <XAxis
                type="number"
                dataKey="resolution"
                name="Resolution"
                unit="Å"
                domain={[0, 5]}
                tick={{ fontSize: 9, fill: getChartTickColor(isDark) }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Resolution (Å)', position: 'insideBottomRight', offset: -5, fontSize: 9, fill: getChartAxisColor(isDark) }}
              />
              <YAxis
                type="number"
                dataKey="journalIf"
                name="Impact Factor"
                domain={[0, scatterMaxIf]}
                tick={{ fontSize: 9, fill: getChartTickColor(isDark) }}
                axisLine={false}
                tickLine={false}
                width={35}
                label={{ value: 'IF', angle: -90, position: 'insideTopLeft', offset: 10, fontSize: 9, fill: getChartAxisColor(isDark) }}
              />
              <ZAxis
                type="category"
                dataKey="ifTier"
                range={[24, 48]}
              />
              <RTooltip content={({ active, payload }) => <ClaudeScatterTooltip active={active} payload={payload as any} isDark={isDark} />} />
              <Scatter
                data={scatterData}
                animationDuration={600}
                style={{ cursor: 'pointer' }}
              >
                {scatterData.map((entry, index) => {
                  const methodLabel = getMethodLabel(entry.method);
                  const color = METHOD_COLORS[methodLabel] || METHOD_COLORS['Other'];
                  const size = entry.ifTier === 'top' ? 6 : entry.ifTier === 'high' ? 5 : entry.ifTier === 'mid' ? 4 : 3;
                  return (
                    <Cell
                      key={`scatter-${index}`}
                      fill={color}
                      r={size}
                      className="transition-opacity duration-150 hover:opacity-80"
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {[
              { label: 'Cryo-EM', color: '#2d8f8f' },
              { label: 'X-ray', color: '#7c5cbf' },
              { label: 'NMR', color: '#c9872e' },
              { label: 'Other', color: '#6b7280' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[9px] text-claude-text-secondary">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Method Distribution - Bar Chart Style (fallback detail) */}
      <div>
        <h4 className="text-xs font-semibold text-claude-text mb-3">Method Details</h4>
        <div className="space-y-2">
          {methodData.map(item => {
            const pct = snapshot.totalStructures > 0 ? (item.count / snapshot.totalStructures) * 100 : 0;
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium" style={{ color: item.color }}>{item.label}</span>
                  <span className="text-[10px] font-mono text-claude-text-muted">{item.count} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="h-5 rounded-md overflow-hidden" style={{ backgroundColor: item.bg }}>
                  <div
                    className="h-full rounded-md transition-all duration-500 flex items-center justify-end pr-1.5"
                    style={{ width: `${Math.max((item.count / maxMethodCount) * 100, item.count > 0 ? 12 : 0)}%`, backgroundColor: item.color, minWidth: item.count > 0 ? '24px' : '0' }}
                  >
                    {item.count > 0 && <span className="text-[9px] font-mono text-white font-medium">{item.count}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resolution Distribution (text detail) */}
      {(cryoemResDist || xrayResDist) && (
        <div>
          <h4 className="text-xs font-semibold text-claude-text mb-2">Resolution Breakdown</h4>
          {xrayResDist && (
            <div className="mb-3">
              <div className="text-[10px] text-claude-xray font-medium mb-1.5">X-ray</div>
              <div className="space-y-1.5">
                {Object.entries(xrayResDist).map(([range, count]) => (
                  <div key={range} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-claude-text-muted w-12">{range}Å</span>
                    <div className="flex-1 h-3 rounded-md bg-claude-xray-bg overflow-hidden">
                      <div
                        className="h-full rounded-md bg-claude-xray transition-all duration-500"
                        style={{ width: `${Math.min(((count as number) / snapshot.xrayCount) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-claude-text-muted w-5 text-right">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {cryoemResDist && (
            <div>
              <div className="text-[10px] text-claude-cryoem font-medium mb-1.5">Cryo-EM</div>
              <div className="space-y-1.5">
                {Object.entries(cryoemResDist).map(([range, count]) => (
                  <div key={range} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-claude-text-muted w-12">{range}Å</span>
                    <div className="flex-1 h-3 rounded-md bg-claude-cryoem-bg overflow-hidden">
                      <div
                        className="h-full rounded-md bg-claude-cryoem transition-all duration-500"
                        style={{ width: `${Math.min(((count as number) / snapshot.cryoemCount) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-claude-text-muted w-5 text-right">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Journals with IF values */}
      {topJournals.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-claude-text mb-2">Top Journals</h4>
          <div className="space-y-1.5">
            {topJournals.slice(0, 8).map((j: { name: string; count: number; if_?: number }, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-claude-border-light/30 dark:bg-[#2b2926]">
                <span className="text-[11px] text-claude-text-secondary truncate mr-2">{j.name}</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {j.if_ != null && (
                    <span className={`text-[9px] font-mono font-medium px-1 py-0.5 rounded ${
                      j.if_ >= 20 ? 'bg-claude-top-bg text-claude-top' :
                      j.if_ >= 10 ? 'bg-claude-high-bg text-claude-high' :
                      j.if_ >= 5 ? 'bg-claude-mid-bg text-claude-mid' :
                      'bg-claude-low-bg text-claude-low'
                    }`}>
                      {j.if_.toFixed(1)}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-claude-text-muted">{j.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IF Distribution with tier badges (text detail) */}
      {ifDist && (
        <div>
          <h4 className="text-xs font-semibold text-claude-text mb-2">IF Tier Details</h4>
          <div className="space-y-2">
            {[
              { label: 'Top', range: 'IF≥20', count: ifDist.top, color: '#dc2626', bg: '#fef2f2', badgeBg: 'bg-claude-top-bg', badgeText: 'text-claude-top' },
              { label: 'High', range: 'IF≥10', count: ifDist.high, color: '#ea580c', bg: '#fff7ed', badgeBg: 'bg-claude-high-bg', badgeText: 'text-claude-high' },
              { label: 'Mid', range: 'IF≥5', count: ifDist.mid, color: '#16a34a', bg: '#f0fdf4', badgeBg: 'bg-claude-mid-bg', badgeText: 'text-claude-mid' },
              { label: 'Low', range: 'IF<5', count: ifDist.low, color: '#6b7280', bg: '#f3f4f6', badgeBg: 'bg-claude-low-bg', badgeText: 'text-claude-low' },
              { label: 'N/A', range: 'Unknown', count: ifDist.unknown, color: '#9b9590', bg: '#f5f0ea', badgeBg: 'bg-claude-other-bg', badgeText: 'text-claude-other' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${item.badgeBg} ${item.badgeText} w-10 text-center`}>
                  {item.label}
                </span>
                <span className="text-[10px] text-claude-text-muted w-12">{item.range}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: item.bg }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((item.count / snapshot.totalStructures) * 100 * 2, 100)}%`, backgroundColor: item.color }} />
                </div>
                <span className="text-[10px] font-mono text-claude-text-muted w-5 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Weekly Statistics Summary Cards ──────────────────────────────────────────

// ─── Weekly Timeline Sub-Component ────────────────────────────────────────────

function WeeklyTimeline({
  entries,
  snapshot,
  onSelectEntry,
  onHighlightEntry,
  highlightedEntry,
}: {
  entries: PdbEntry[];
  snapshot: WeeklySnapshot;
  onSelectEntry: (entry: PdbEntry) => void;
  onHighlightEntry: (pdbId: string | null) => void;
  highlightedEntry: string | null;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(350);
  const [tooltipData, setTooltipData] = useState<{
    entry: PdbEntry;
    x: number;
    y: number;
  } | null>(null);

  // Responsive container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Parse week date range
  const weekStart = new Date(snapshot.weekStart);
  const weekEnd = new Date(snapshot.weekEnd);
  const totalDays = Math.max(1, Math.round((weekEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Generate day labels
  const dayLabels = useMemo(() => {
    const days: { date: Date; dayName: string; dateLabel: string }[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      days.push({
        date: d,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    return days;
  }, [snapshot]);

  // Group entries by day
  const entriesByDay = useMemo(() => {
    const groups: Record<string, PdbEntry[]> = {};
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      groups[key] = [];
    }
    entries.forEach(entry => {
      const entryDate = entry.releaseDate.split('T')[0];
      if (groups[entryDate]) {
        groups[entryDate].push(entry);
      } else {
        // Find closest day
        const closest = Object.keys(groups).reduce((prev, curr) =>
          Math.abs(new Date(curr).getTime() - new Date(entryDate).getTime()) <
          Math.abs(new Date(prev).getTime() - new Date(entryDate).getTime()) ? curr : prev
        );
        groups[closest].push(entry);
      }
    });
    return groups;
  }, [entries, weekStart, totalDays]);

  // Timeline stats
  const timelineStats = useMemo(() => {
    const dayCounts = Object.values(entriesByDay).map(e => e.length);
