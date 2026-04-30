'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Search,
  ChevronDown,
  ChevronUp,
  X,
  ChevronRight,
  ChevronLeft,
  FileText,
  BarChart3,
  Microscope,
  FlaskConical,
  Database,
  ExternalLink,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Loader2,
  Info,
  Menu,
  Dna,
  ArrowLeft,
  Moon,
  Sun,
  Download,
  Keyboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTheme } from 'next-themes';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WeeklySnapshot {
  weekId: string;
  weekStart: string;
  weekEnd: string;
  totalStructures: number;
  cryoemCount: number;
  xrayCount: number;
  nmrCount: number;
  otherCount: number;
  cryoemAvgRes: number | null;
  xrayAvgRes: number | null;
  topJournals: string | null;
  ifDist: string | null;
  cryoemResDist: string | null;
  xrayResDist: string | null;
  createdAt: string;
}

interface PdbEntry {
  pdbId: string;
  method: string;
  releaseDate: string;
  resolution: number | null;
  resolutionHigh: number | null;
  title: string;
  doi: string | null;
  journal: string | null;
  journalIf: number | null;
  authors: string | null;
  organisms: string | null;
  ligands: string | null;
  pubmedId: string | null;
  fetchDate: string;
  weekId: string;
  isCryoem: number;
  isXray: number;
  ifTier: string;
}

interface Evaluation {
  uniprotId: string;
  entryName: string | null;
  proteinName: string | null;
  geneNames: string | null;
  organism: string | null;
  sequenceLength: number | null;
  coverage: number | null;
  scores: string | null;
  report: string | null;
  createdAt: string;
  updatedAt: string;
  pdbStructures: EvalPdbStructure[];
  blastResults: EvalBlastResult[];
  _count?: { pdbStructures: number; blastResults: number };
}

interface EvalPdbStructure {
  id: number;
  uniprotId: string;
  pdbId: string;
  method: string | null;
  resolution: number | null;
  title: string | null;
  depositionDate: string | null;
  releaseDate: string | null;
  ligand: string | null;
  ligandNames: string | null;
  journal: string | null;
  journalIf: number | null;
  doi: string | null;
  pubmedId: string | null;
  organism: string | null;
  authors: string | null;
  isCryoem: number;
  isXray: number;
  isNmr: number;
  ifTier: string;
  updatedAt: string;
}

interface EvalBlastResult {
  id: number;
  uniprotId: string;
  pdbId: string | null;
  uniprotRef: string | null;
  description: string | null;
  identity: number | null;
  evalue: number | null;
  queryCoverage: number | null;
  targetCoverage: number | null;
  method: string | null;
  resolution: number | null;
  releaseDate: string | null;
  source: string | null;
  taxonomyId: number | null;
  journal: string | null;
  journalIf: number | null;
  ifTier: string;
  ligand: string | null;
  title: string | null;
  updatedAt: string;
}

interface WeeklyReport {
  id: number;
  weekId: string;
  weekStart: string | null;
  weekEnd: string | null;
  reportType: string;
  title: string | null;
  filename: string | null;
  createdAt: string;
}

interface EvaluationReport {
  id: number;
  uniprotId: string;
  title: string | null;
  createdAt: string;
}

interface LigandInfo {
  code: string;
  name: string;
  formula: string;
  weight: string;
  type: string;
  description: string;
  imageUrl: string;
}

type Mode = 'weekly' | 'evaluation';
type SortField = string;
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 50;

// ─── Helper Functions ────────────────────────────────────────────────────────

function getMethodColor(method: string): { bg: string; text: string; border: string } {
  const m = method?.toUpperCase() || '';
  if (m.includes('CRYO') || m.includes('ELECTRON MICROSCOPY')) {
    return { bg: 'bg-claude-cryoem-bg', text: 'text-claude-cryoem', border: 'border-claude-cryoem/30' };
  }
  if (m.includes('X-RAY') || m.includes('XRAY')) {
    return { bg: 'bg-claude-xray-bg', text: 'text-claude-xray', border: 'border-claude-xray/30' };
  }
  if (m.includes('NMR')) {
    return { bg: 'bg-claude-nmr-bg', text: 'text-claude-nmr', border: 'border-claude-nmr/30' };
  }
  return { bg: 'bg-claude-other-bg', text: 'text-claude-other', border: 'border-claude-other/30' };
}

function getMethodLabel(method: string): string {
  const m = method?.toUpperCase() || '';
  if (m.includes('CRYO') || m.includes('ELECTRON MICROSCOPY')) return 'Cryo-EM';
  if (m.includes('X-RAY') || m.includes('XRAY')) return 'X-ray';
  if (m.includes('NMR')) return 'NMR';
  if (m.includes('ELECTRON CRYSTALLOGRAPHY')) return 'E. Cryst.';
  return method;
}

function getResolutionColor(res: number | null): string {
  if (res === null || res === undefined) return 'text-claude-text-muted';
  if (res <= 2.0) return 'text-green-600';
  if (res <= 3.5) return 'text-amber-600';
  return 'text-red-500';
}

function getIfTierStyle(tier: string): { bg: string; text: string } {
  switch (tier) {
    case 'top': return { bg: 'bg-claude-top-bg', text: 'text-claude-top' };
    case 'high': return { bg: 'bg-claude-high-bg', text: 'text-claude-high' };
    case 'mid': return { bg: 'bg-claude-mid-bg', text: 'text-claude-mid' };
    case 'low': return { bg: 'bg-claude-low-bg', text: 'text-claude-low' };
    default: return { bg: 'bg-claude-other-bg', text: 'text-claude-other' };
  }
}

function getScoreColor(score: number): string {
  if (score < 4) return '#dc2626';
  if (score < 6) return '#ea580c';
  if (score < 8) return '#16a34a';
  return '#2d8f8f';
}

function getIdentityColor(identity: number): string {
  if (identity >= 90) return 'text-green-600';
  if (identity >= 70) return 'text-teal-600';
  if (identity >= 50) return 'text-amber-600';
  return 'text-red-500';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function parseLigands(ligands: string | null): string[] {
  if (!ligands) return [];
  return ligands.split('|').filter(Boolean);
}

function formatEvalue(evalue: number | null): string {
  if (evalue === null) return '—';
  if (evalue === 0) return '0';
  if (evalue < 0.001) return evalue.toExponential(1);
  return evalue.toFixed(2);
}

function truncateOrganism(organisms: string | null, maxLen: number = 24): string {
  if (!organisms) return '—';
  const first = organisms.split('|')[0]?.trim() || organisms;
  if (first.length <= maxLen) return first;
  return first.slice(0, maxLen - 1) + '…';
}

// ─── PDB Tooltip Component ───────────────────────────────────────────────────

function PdbTooltipContent({ entry }: { entry: PdbEntry | EvalPdbStructure }) {
  const ligandList = parseLigands('ligands' in entry ? entry.ligands : null);
  const method = entry.method || '';
  const methodColors = getMethodColor(method);

  return (
    <div className="w-80 p-3 space-y-2">
      <div className="flex items-start gap-2">
        <img
          src={`https://www.rcsb.org/structure/${entry.pdbId}`}
          alt={entry.pdbId}
          className="w-20 h-20 rounded-md bg-claude-border-light object-cover flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-semibold text-claude-text text-sm">{entry.pdbId}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${methodColors.bg} ${methodColors.text}`}>
              {getMethodLabel(method)}
            </span>
          </div>
          <p className="text-xs text-claude-text-secondary line-clamp-2 leading-relaxed">
            {entry.title}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {entry.resolution != null && (
          <div>
            <span className="text-claude-text-muted">Resolution:</span>{' '}
            <span className={`font-medium ${getResolutionColor(entry.resolution)}`}>{entry.resolution}Å</span>
          </div>
        )}
        <div>
          <span className="text-claude-text-muted">Date:</span>{' '}
          <span className="text-claude-text-secondary">{formatDate(entry.releaseDate)}</span>
        </div>
        {'journal' in entry && entry.journal && (
          <div className="col-span-2">
            <span className="text-claude-text-muted">Journal:</span>{' '}
            <span className="text-claude-text-secondary">{entry.journal}</span>
            {entry.journalIf && <span className="text-claude-text-muted ml-1">({entry.journalIf.toFixed(1)})</span>}
          </div>
        )}
      </div>
      {ligandList.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {ligandList.slice(0, 6).map((l, i) => (
            <span key={`tt-lig-${i}-${l}`} className="ligand-chip">{l}</span>
          ))}
          {ligandList.length > 6 && <span className="text-[10px] text-claude-text-muted">+{ligandList.length - 6}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Ligand Tooltip Component ────────────────────────────────────────────────

function LigandTooltipContent({ ligand }: { ligand: LigandInfo }) {
  return (
    <div className="w-64 p-3 space-y-2">
      <div className="flex items-start gap-2">
        <img
          src={ligand.imageUrl}
          alt={ligand.name}
          className="w-24 h-24 rounded-md bg-white dark:bg-[#1a1917] border border-claude-border flex-shrink-0 object-contain p-1"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-claude-text text-sm">{ligand.code}</div>
          <div className="text-xs text-claude-text-secondary leading-relaxed">{ligand.name}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div>
          <span className="text-claude-text-muted">Formula:</span>{' '}
          <span className="font-mono text-claude-text-secondary">{ligand.formula}</span>
        </div>
        <div>
          <span className="text-claude-text-muted">MW:</span>{' '}
          <span className="font-mono text-claude-text-secondary">{ligand.weight}</span>
        </div>
        <div className="col-span-2">
          <span className="text-claude-text-muted">Type:</span>{' '}
          <span className="text-claude-text-secondary">{ligand.type}</span>
        </div>
      </div>
      {ligand.description && (
        <p className="text-[10px] text-claude-text-muted leading-relaxed">{ligand.description}</p>
      )}
    </div>
  );
}

// ─── Blast Homolog Tooltip Component ─────────────────────────────────────────

function BlastHomologTooltipContent({ result }: { result: EvalBlastResult }) {
  return (
    <div className="w-64 p-3 space-y-2">
      <div className="text-sm font-semibold text-claude-text mb-1">BLAST Homolog</div>
      {result.pdbId && (
        <div className="font-mono text-xs text-claude-accent">{result.pdbId}</div>
      )}
      {result.description && (
        <p className="text-xs text-claude-text-secondary line-clamp-2">{result.description}</p>
      )}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {result.identity != null && (
          <div>
            <span className="text-claude-text-muted">Identity:</span>{' '}
            <span className={`font-medium ${getIdentityColor(result.identity)}`}>{result.identity}%</span>
          </div>
        )}
        {result.evalue != null && (
          <div>
            <span className="text-claude-text-muted">E-value:</span>{' '}
            <span className="font-mono text-claude-text-secondary">{formatEvalue(result.evalue)}</span>
          </div>
        )}
        {result.queryCoverage != null && (
          <div>
            <span className="text-claude-text-muted">Q. Coverage:</span>{' '}
            <span className="font-medium text-claude-text-secondary">{result.queryCoverage}%</span>
          </div>
        )}
        {result.method && (
          <div>
            <span className="text-claude-text-muted">Method:</span>{' '}
            <span className="text-claude-text-secondary">{getMethodLabel(result.method)}</span>
          </div>
        )}
        {result.resolution != null && (
          <div>
            <span className="text-claude-text-muted">Resolution:</span>{' '}
            <span className={`font-medium ${getResolutionColor(result.resolution)}`}>{result.resolution}Å</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Score Bar Component ─────────────────────────────────────────────────────

function ScoreBar({ label, score, maxScore = 10 }: { label: string; score: number; maxScore?: number }) {
  const pct = Math.min((score / maxScore) * 100, 100);
  const color = getScoreColor(score);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-claude-text-secondary">{label}</span>
        <span className="font-mono font-medium" style={{ color }}>{score.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-claude-border-light rounded-full overflow-hidden">
        <div
          className="h-full rounded-full score-bar-fill transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color, '--score-width': `${pct}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

// ─── Report Modal Component ──────────────────────────────────────────────────

function ReportModal({ isOpen, onClose, title, content }: { isOpen: boolean; onClose: () => void; title: string; content: string }) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-[#242220] rounded-[10px] shadow-xl max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-claude-border">
              <h2 className="text-base font-semibold text-claude-text">{title}</h2>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 text-claude-text-muted hover:text-claude-text">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Pagination Component ────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-claude-border bg-white dark:bg-[#242220]">
      <span className="text-[11px] text-claude-text-muted">
        Showing <span className="font-mono font-medium text-claude-text-secondary">{start}</span>–<span className="font-mono font-medium text-claude-text-secondary">{end}</span> of <span className="font-mono font-medium text-claude-text-secondary">{totalItems}</span> entries
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center justify-center h-7 px-2 rounded-md text-[11px] font-medium border border-claude-border bg-white dark:bg-[#242220] text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
          Prev
        </button>
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-1.5 text-[11px] text-claude-text-muted">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`inline-flex items-center justify-center h-7 w-7 rounded-md text-[11px] font-medium transition-colors duration-150 ${
                page === p
                  ? 'bg-claude-accent text-white shadow-sm'
                  : 'border border-claude-border bg-white dark:bg-[#242220] text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-[#3d3832]'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center justify-center h-7 px-2 rounded-md text-[11px] font-medium border border-claude-border bg-white dark:bg-[#242220] text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Table Skeleton Component ────────────────────────────────────────────────

function TableSkeleton({ rows = 10, cols = 8 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={`skel-${i}`} className="border-b border-claude-border-light">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={`skel-${i}-${j}`} className="px-3 py-2.5">
              <Skeleton className="h-3.5 w-full rounded-sm bg-claude-border-light" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Main PDB Tracker Component ──────────────────────────────────────────────

export default function PdbTracker() {
  // ── Mode & Navigation ──
  const [mode, setMode] = useState<Mode>('weekly');
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [selectedEvalId, setSelectedEvalId] = useState<string | null>(null);

  // ── Weekly Mode Data ──
  const [snapshots, setSnapshots] = useState<WeeklySnapshot[]>([]);
  const [entries, setEntries] = useState<PdbEntry[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);

  // ── Evaluation Mode Data ──
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);

  // ── Filters & Sort ──
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('releaseDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);

  // ── Preview Panel ──
  const [previewOpen, setPreviewOpen] = useState(true);
  const [previewTab, setPreviewTab] = useState<string>('summary');

  // ── Mobile State ──
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // ── Report Modal ──
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; title: string; content: string }>({
    isOpen: false, title: '', content: '',
  });

  // ── Ligand Cache ──
  const [ligandCache, setLigandCache] = useState<Record<string, LigandInfo>>({});

  // ── Loading States ──
  const [loadingSnapshots, setLoadingSnapshots] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loadingEvals, setLoadingEvals] = useState(true);
  const [loadingEvalDetail, setLoadingEvalDetail] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Theme ──
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (isMod && e.key === 'e') {
        e.preventDefault();
        setMode(prev => prev === 'weekly' ? 'evaluation' : 'weekly');
      }
      if (e.key === 'Escape') {
        if (searchQuery) {
          setSearchQuery('');
          searchInputRef.current?.blur();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // ── Reset page on filter/sort change ──
  useEffect(() => { setCurrentPage(1); }, [selectedWeekId, methodFilter, debouncedSearch, sortField, sortDir, mode, selectedEvalId]);

  // ── Debounced Search ──
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]);

  // ── Fetch Snapshots ──
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/snapshots');
        const data = await res.json();
        setSnapshots(data);
        if (data.length > 0 && !selectedWeekId) {
          setSelectedWeekId(data[0].weekId);
        }
      } catch (e) { console.error('Failed to fetch snapshots:', e); }
      finally { setLoadingSnapshots(false); }
    }
    load();
  }, []);

  // ── Fetch Evaluations ──
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/evaluations');
        const data = await res.json();
        setEvaluations(data);
      } catch (e) { console.error('Failed to fetch evaluations:', e); }
      finally { setLoadingEvals(false); }
    }
    load();
  }, []);

  // ── Fetch Weekly Entries ──
  useEffect(() => {
    if (mode !== 'weekly') return;
    let cancelled = false;
    async function load() {
      setLoadingEntries(true);
      try {
        const params = new URLSearchParams();
        if (selectedWeekId) params.set('week', selectedWeekId);
        if (methodFilter !== 'all') params.set('method', methodFilter);
        if (debouncedSearch) params.set('q', debouncedSearch);
        const res = await fetch(`/api/entries?${params}`);
        if (!cancelled) {
          const data = await res.json();
          setEntries(data);
        }
      } catch (e) { console.error('Failed to fetch entries:', e); }
      finally { if (!cancelled) setLoadingEntries(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [mode, selectedWeekId, methodFilter, debouncedSearch]);

  // ── Fetch Weekly Reports ──
  useEffect(() => {
    if (mode !== 'weekly' || !selectedWeekId) return;
    async function load() {
      try {
        const res = await fetch('/api/reports');
        const data: WeeklyReport[] = await res.json();
        setWeeklyReports(data.filter(r => r.weekId === selectedWeekId));
      } catch (e) { console.error('Failed to fetch reports:', e); }
    }
    load();
  }, [mode, selectedWeekId]);

  // ── Fetch Evaluation Detail ──
  useEffect(() => {
    if (mode !== 'evaluation' || !selectedEvalId) return;
    let cancelled = false;
    async function load() {
      setLoadingEvalDetail(true);
      try {
        const res = await fetch(`/api/evaluations/${selectedEvalId}`);
        if (!cancelled) {
          const data = await res.json();
          setSelectedEval(data);
        }
      } catch (e) { console.error('Failed to fetch evaluation detail:', e); }
      finally { if (!cancelled) setLoadingEvalDetail(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [mode, selectedEvalId]);

  // ── Fetch Ligand Info (on demand) ──
  const fetchLigandInfo = useCallback(async (code: string) => {
    if (ligandCache[code]) return;
    try {
      const res = await fetch(`/api/ligand/${code}`);
      const data = await res.json();
      setLigandCache(prev => ({ ...prev, [code]: data }));
    } catch { /* ignore */ }
  }, [ligandCache]);

  // ── Sorting Logic ──
  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }, [sortField]);

  // ── Sorted Weekly Entries ──
  const sortedEntries = useMemo(() => {
    if (!entries.length) return [];
    const sorted = [...entries].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case 'pdbId': aVal = a.pdbId; bVal = b.pdbId; break;
        case 'method': aVal = a.method; bVal = b.method; break;
        case 'resolution': aVal = a.resolution ?? 999; bVal = b.resolution ?? 999; break;
        case 'journalIf': aVal = a.journalIf ?? -1; bVal = b.journalIf ?? -1; break;
        case 'organisms': aVal = a.organisms || ''; bVal = b.organisms || ''; break;
        case 'title': aVal = a.title; bVal = b.title; break;
        case 'releaseDate': aVal = a.releaseDate; bVal = b.releaseDate; break;
        default: aVal = a.releaseDate; bVal = b.releaseDate;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [entries, sortField, sortDir]);

  // ── Paginated Weekly Entries ──
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedEntries.slice(start, start + PAGE_SIZE);
  }, [sortedEntries, currentPage]);

  const totalPages = Math.ceil(sortedEntries.length / PAGE_SIZE);

  // ── Sorted Evaluation Data ──
  const sortedEvalRows = useMemo(() => {
    if (!selectedEval) return [];
    const structures: (EvalPdbStructure & { _type: 'structure' })[] =
      (selectedEval.pdbStructures || []).map(s => ({ ...s, _type: 'structure' as const }));
    const blasts: (EvalBlastResult & { _type: 'blast' })[] =
      (selectedEval.blastResults || []).map(b => ({ ...b, _type: 'blast' as const }));

    const all = [...structures, ...blasts];
    return all.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case 'pdbId': aVal = a.pdbId || ''; bVal = b.pdbId || ''; break;
        case 'method': aVal = a.method || ''; bVal = b.method || ''; break;
        case 'resolution': aVal = a.resolution ?? 999; bVal = b.resolution ?? 999; break;
        case 'journalIf':
          aVal = ('journalIf' in a ? a.journalIf : null) ?? -1;
          bVal = ('journalIf' in b ? b.journalIf : null) ?? -1;
          break;
        case 'title':
          aVal = a.title || ('description' in a ? a.description : '') || '';
          bVal = b.title || ('description' in b ? b.description : '') || '';
          break;
        case 'releaseDate': aVal = a.releaseDate || ''; bVal = b.releaseDate || ''; break;
        default: aVal = a.releaseDate || ''; bVal = b.releaseDate || '';
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [selectedEval, sortField, sortDir]);

  // ── Paginated Eval Rows ──
  const paginatedEvalRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedEvalRows.slice(start, start + PAGE_SIZE);
  }, [sortedEvalRows, currentPage]);

  const totalEvalPages = Math.ceil(sortedEvalRows.length / PAGE_SIZE);

  // ── Selected Snapshot ──
  const selectedSnapshot = useMemo(
    () => snapshots.find(s => s.weekId === selectedWeekId) || null,
    [snapshots, selectedWeekId]
  );

  // ── Report fetch ──
  const openReport = useCallback(async (reportId: number, title: string) => {
    try {
      const res = await fetch(`/api/report/${reportId}`);
      const data = await res.json();
      setReportModal({ isOpen: true, title: title || 'Report', content: data.content || '' });
    } catch { /* ignore */ }
  }, []);

  const openEvalReport = useCallback(async (reportId: number, title: string) => {
    try {
      const res = await fetch(`/api/evaluation-report/${reportId}`);
      const data = await res.json();
      setReportModal({ isOpen: true, title: title || 'Evaluation Report', content: data.content || '' });
    } catch { /* ignore */ }
  }, []);

  // ── Sorted eval list ──
  const filteredEvals = useMemo(() => {
    if (!debouncedSearch) return evaluations;
    const q = debouncedSearch.toLowerCase();
    return evaluations.filter(e =>
      e.uniprotId.toLowerCase().includes(q) ||
      (e.proteinName?.toLowerCase().includes(q)) ||
      (e.geneNames?.toLowerCase().includes(q)) ||
      (e.organism?.toLowerCase().includes(q))
    );
  }, [evaluations, debouncedSearch]);

  // ── Average score helper ──
  function getAvgScore(scores: string | null): number {
    if (!scores) return 0;
    try {
      const s = JSON.parse(scores);
      const vals = Object.values(s).filter(v => typeof v === 'number') as number[];
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    } catch { return 0; }
  }

  // ── CSV Export ──
  const handleExportCsv = useCallback(() => {
    if (!sortedEntries.length) return;
    const headers = ['PDB ID', 'Method', 'Resolution', 'IF', 'Organism', 'Title', 'Date', 'Ligands'];
    const escapeCsv = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };
    const rows = sortedEntries.map(entry => [
      escapeCsv(entry.pdbId),
      escapeCsv(getMethodLabel(entry.method)),
      entry.resolution != null ? String(entry.resolution) : '',
      entry.journalIf != null ? String(entry.journalIf) : '',
      escapeCsv(entry.organisms || ''),
      escapeCsv(entry.title || ''),
      escapeCsv(entry.releaseDate || ''),
      escapeCsv(entry.ligands || ''),
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdb-structures-${selectedWeekId || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedEntries, selectedWeekId]);

  // ── Sort Icon ──
  function SortIcon({ field }: { field: string }) {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-claude-text-muted/50" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3 w-3 text-claude-accent" />
      : <ArrowDown className="h-3 w-3 text-claude-accent" />;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ─── RENDER ────────────────────────────────────────────────────────────────
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-full w-full overflow-hidden">

        {/* ═══════════ HEADER BAR ═══════════ */}
        <header className="flex-shrink-0 h-[52px] flex items-center px-4 bg-white dark:bg-[#242220] border-b border-claude-border relative z-20">
          {/* Gradient border at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-claude-cryoem via-claude-accent to-claude-xray" />
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-claude-accent-light">
              <Dna className="h-4.5 w-4.5 text-claude-accent" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-claude-text leading-tight">PDB Structure Tracker</h1>
              <p className="text-[10px] text-claude-text-muted leading-tight">Protein Data Bank Weekly Tracking & Evaluation System</p>
            </div>
          </div>

          {/* Keyboard Shortcuts Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150"
                aria-label="Keyboard shortcuts"
              >
                <Keyboard className="h-4 w-4 text-claude-text-secondary" />
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-56 p-3">
              <div className="text-xs font-semibold text-claude-text mb-2">Keyboard Shortcuts</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-claude-text-secondary">Focus search</span>
                  <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-claude-border-light text-claude-text-muted border border-claude-border">
                    <span className="text-[9px]">⌘</span>K
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-claude-text-secondary">Toggle mode</span>
                  <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-claude-border-light text-claude-text-muted border border-claude-border">
                    <span className="text-[9px]">⌘</span>E
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-claude-text-secondary">Clear search</span>
                  <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-claude-border-light text-claude-text-muted border border-claude-border">
                    Esc
                  </kbd>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Dark mode toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="ml-auto md:ml-auto inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150"
            aria-label="Toggle dark mode"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-4 w-4 text-claude-text-secondary" />
            ) : (
              <Moon className="h-4 w-4 text-claude-text-secondary" />
            )}
          </button>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150"
          >
            <Menu className="h-4.5 w-4.5 text-claude-text-secondary" />
          </button>

          {/* Mobile preview toggle */}
          <button
            onClick={() => setMobilePreviewOpen(true)}
            className="ml-1 md:hidden inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150"
          >
            <BarChart3 className="h-4.5 w-4.5 text-claude-text-secondary" />
          </button>
        </header>

        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ═══════════ LEFT SIDEBAR ═══════════ */}
          {/* Desktop sidebar */}
          <aside className="hidden md:flex w-[280px] flex-shrink-0 border-r border-claude-border bg-white dark:bg-[#242220] flex-col">
            {renderSidebar()}
          </aside>

          {/* Mobile sidebar overlay */}
          <AnimatePresence>
            {mobileSidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
                  onClick={() => setMobileSidebarOpen(false)}
                />
                <motion.aside
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ duration: 0.2 }}
                  className="fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-white dark:bg-[#242220] border-r border-claude-border flex flex-col md:hidden"
                >
                  <div className="flex items-center justify-between p-3 border-b border-claude-border">
                    <span className="text-xs font-semibold text-claude-text">Navigation</span>
                    <Button variant="ghost" size="sm" onClick={() => setMobileSidebarOpen(false)} className="h-7 w-7 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {renderSidebar()}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* ═══════════ MAIN AREA ═══════════ */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-claude-border bg-white/80 dark:bg-[#242220]/80 backdrop-blur-sm">
              {mode === 'weekly' ? (
                <>
                  {/* Week Select */}
                  <Select value={selectedWeekId || ''} onValueChange={setSelectedWeekId}>
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                      <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                    <SelectContent>
                      {snapshots.map(s => (
                        <SelectItem key={s.weekId} value={s.weekId}>
                          <span className="font-mono">{s.weekId}</span>
                          <span className="text-claude-text-muted ml-2">({s.totalStructures})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Method Filter */}
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger className="w-[150px] h-8 text-xs">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="Cryo-EM">Cryo-EM</SelectItem>
                      <SelectItem value="X-RAY DIFFRACTION">X-ray</SelectItem>
                      <SelectItem value="SOLUTION NMR">NMR</SelectItem>
                      <SelectItem value="ELECTRON CRYSTALLOGRAPHY">Electron Crystallography</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Search */}
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-claude-text-muted" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search PDB ID, title, journal..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-claude-border bg-white dark:bg-[#1a1917] dark:text-[#e8e4dd] focus:outline-none focus:ring-1 focus:ring-claude-accent/40 focus:border-claude-accent/40 placeholder:text-claude-text-muted/60"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                        <X className="h-3 w-3 text-claude-text-muted hover:text-claude-text" />
                      </button>
                    )}
                  </div>

                  {/* Active Filter Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {methodFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light text-claude-accent border border-claude-accent/20">
                        Method: {getMethodLabel(methodFilter === 'Cryo-EM' ? 'CRYO-EM' : methodFilter === 'X-RAY DIFFRACTION' ? 'X-RAY DIFFRACTION' : methodFilter === 'SOLUTION NMR' ? 'SOLUTION NMR' : methodFilter)}
                        <button onClick={() => setMethodFilter('all')} className="hover:text-claude-accent/80 transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light text-claude-accent border border-claude-accent/20">
                        Search: {searchQuery.length > 12 ? searchQuery.slice(0, 12) + '…' : searchQuery}
                        <button onClick={() => setSearchQuery('')} className="hover:text-claude-accent/80 transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    )}
                  </div>

                  {/* Count & Export */}
                  <span className="text-[10px] text-claude-text-muted ml-auto whitespace-nowrap">
                    {entries.length} structures
                  </span>
                  {sortedEntries.length > 0 && (
                    <button
                      onClick={handleExportCsv}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium border border-claude-border bg-white dark:bg-[#242220] text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150"
                    >
                      <Download className="h-3 w-3" />
                      Export
                    </button>
                  )}
                </>
              ) : (
                <>
                  <FlaskConical className="h-4 w-4 text-claude-accent" />
                  <span className="text-sm font-semibold text-claude-text">
                    {selectedEval ? selectedEval.proteinName || selectedEval.uniprotId : 'Select a protein'}
                  </span>
                  {selectedEval && (
                    <span className="font-mono text-xs text-claude-accent">{selectedEval.uniprotId}</span>
                  )}
                  <span className="text-[10px] text-claude-text-muted ml-auto whitespace-nowrap">
                    {selectedEval
                      ? `${(selectedEval.pdbStructures || []).length} structures · ${(selectedEval.blastResults || []).length} BLAST`
                      : `${evaluations.length} evaluations`}
                  </span>
                </>
              )}

              {/* Preview Toggle (desktop) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewOpen(!previewOpen)}
                className="hidden md:inline-flex h-7 w-7 p-0 text-claude-text-muted hover:text-claude-text"
              >
                {previewOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>

            {/* Data Table */}
            <div className="flex-1 overflow-auto custom-scrollbar">
              {mode === 'weekly' ? (
                loadingEntries ? (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 z-10 border-b border-claude-border">
                      <tr className="bg-[#faf8f5] dark:bg-[#1a1917]">
                        {['PDB ID','Method','Resolution','IF','Organism','Title','Date','Ligands'].map(h => (
                          <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-claude-text-muted uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <TableSkeleton rows={8} cols={8} />
                    </tbody>
                  </table>
                ) : sortedEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-claude-text-muted">
                    <Database className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">No structures found</p>
                    <p className="text-xs mt-1">Try adjusting filters or selecting a different week</p>
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 z-10 border-b border-claude-border">
                      <tr className="bg-[#faf8f5] dark:bg-[#1a1917]">
                        {[
                          { field: 'pdbId', label: 'PDB ID', w: 'w-[90px]' },
                          { field: 'method', label: 'Method', w: 'w-[90px]' },
                          { field: 'resolution', label: 'Resolution', w: 'w-[80px]' },
                          { field: 'journalIf', label: 'IF', w: 'w-[55px]' },
                          { field: 'organisms', label: 'Organism', w: 'w-[130px]' },
                          { field: 'title', label: 'Title', w: '' },
                          { field: 'releaseDate', label: 'Date', w: 'w-[95px]' },
                          { field: '_ligands', label: 'Ligands', w: 'w-[130px]' },
                        ].map(col => (
                          <th
                            key={col.field}
                            onClick={() => col.field !== '_ligands' && handleSort(col.field)}
                            className={`px-3 py-3 text-left text-[11px] font-semibold text-claude-text-muted uppercase tracking-wide transition-colors duration-200 ${col.w} ${col.field !== '_ligands' ? 'cursor-pointer hover:text-claude-text-secondary' : ''}`}
                          >
                            <span className="inline-flex items-center gap-1">
                              {col.label}
                              {col.field !== '_ligands' && <SortIcon field={col.field} />}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEntries.map((entry, idx) => {
                        const mc = getMethodColor(entry.method);
                        const ligandList = parseLigands(entry.ligands);
                        const ifStyle = getIfTierStyle(entry.ifTier);

                        return (
                          <motion.tr
                            key={entry.pdbId}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15, delay: Math.min(idx, 10) * 0.02 }}
                            className="table-row-hover border-b border-claude-border-light hover:shadow-md"
                          >
                            <td className="px-3 py-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={`https://www.rcsb.org/structure/${entry.pdbId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono font-semibold text-claude-accent hover:underline inline-flex items-center gap-0.5"
                                  >
                                    {entry.pdbId}
                                    <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="p-0 border border-claude-border shadow-lg">
                                  <PdbTooltipContent entry={entry} />
                                </TooltipContent>
                              </Tooltip>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${mc.bg} ${mc.text}`}>
                                {getMethodLabel(entry.method)}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-mono">
                              {entry.resolution != null ? (
                                <span className={`font-medium ${getResolutionColor(entry.resolution)}`}>
                                  {entry.resolution.toFixed(2)}Å
                                </span>
                              ) : (
                                <span className="text-claude-text-muted">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {entry.journalIf != null ? (
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${ifStyle.bg} ${ifStyle.text}`}>
                                  {entry.journalIf.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-claude-text-muted">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-claude-text-secondary text-[11px] line-clamp-1 cursor-default italic">
                                    {truncateOrganism(entry.organisms)}
                                  </span>
                                </TooltipTrigger>
                                {entry.organisms && (
                                  <TooltipContent side="top" className="max-w-64">
                                    <p className="text-xs text-claude-text-secondary">{entry.organisms.replace(/\|/g, ', ')}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </td>
                            <td className="px-3 py-2 max-w-xs">
                              <span className="text-claude-text-secondary line-clamp-2 leading-relaxed">{entry.title}</span>
                            </td>
                            <td className="px-3 py-2 text-claude-text-muted whitespace-nowrap">{formatDate(entry.releaseDate)}</td>
                            <td className="px-3 py-2">
                              <div className="flex flex-wrap gap-1">
                                {ligandList.slice(0, 3).map(lig => (
                                  <Popover key={lig}>
                                    <PopoverTrigger asChild>
                                      <span
                                        className="ligand-chip"
                                        onMouseEnter={() => fetchLigandInfo(lig)}
                                      >
                                        {lig}
                                      </span>
                                    </PopoverTrigger>
                                    <PopoverContent side="top" className="p-0 w-auto border border-claude-border shadow-lg">
                                      {ligandCache[lig] ? (
                                        <LigandTooltipContent ligand={ligandCache[lig]} />
                                      ) : (
                                        <div className="p-3 flex items-center gap-2">
                                          <Loader2 className="h-3 w-3 animate-spin text-claude-accent" />
                                          <span className="text-xs text-claude-text-muted">Loading...</span>
                                        </div>
                                      )}
                                    </PopoverContent>
                                  </Popover>
                                ))}
                                {ligandList.length > 3 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="ligand-chip cursor-default">+{ligandList.length - 3}</span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <div className="flex flex-wrap gap-1 max-w-48">
                                        {ligandList.map((l, li) => (
                                          <span key={`tbl-lig-${li}-${l}`} className="ligand-chip">{l}</span>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              ) : (
                /* Evaluation Table */
                !selectedEval ? (
                  <div className="flex flex-col items-center justify-center py-20 text-claude-text-muted">
                    <Microscope className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">Select a protein evaluation</p>
                    <p className="text-xs mt-1">Choose from the sidebar to view structures and BLAST results</p>
                  </div>
                ) : loadingEvalDetail ? (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 z-10 border-b border-claude-border">
                      <tr className="bg-[#faf8f5] dark:bg-[#1a1917]">
                        {['PDB ID','Type','Method','Resolution','IF','Title / Description','Date'].map(h => (
                          <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-claude-text-muted uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <TableSkeleton rows={5} cols={7} />
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 z-10 border-b border-claude-border">
                      <tr className="bg-[#faf8f5] dark:bg-[#1a1917]">
                        {[
                          { field: 'pdbId', label: 'PDB ID', w: 'w-[90px]' },
                          { field: '_type', label: 'Type', w: 'w-[70px]' },
                          { field: 'method', label: 'Method', w: 'w-[90px]' },
                          { field: 'resolution', label: 'Resolution', w: 'w-[80px]' },
                          { field: 'journalIf', label: 'IF', w: 'w-[55px]' },
                          { field: 'title', label: 'Title / Description', w: '' },
                          { field: 'releaseDate', label: 'Date', w: 'w-[95px]' },
                        ].map(col => (
                          <th
                            key={col.field}
                            onClick={() => !['_type', '_ligands'].includes(col.field) && handleSort(col.field)}
                            className={`px-3 py-3 text-left text-[11px] font-semibold text-claude-text-muted uppercase tracking-wide transition-colors duration-200 ${col.w} ${!['_type', '_ligands'].includes(col.field) ? 'cursor-pointer hover:text-claude-text-secondary' : ''}`}
                          >
                            <span className="inline-flex items-center gap-1">
                              {col.label}
                              {!['_type', '_ligands'].includes(col.field) && <SortIcon field={col.field} />}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEvalRows.map((row, idx) => {
                        const isBlast = row._type === 'blast';
                        const mc = getMethodColor(row.method || '');
                        const ifStyle = getIfTierStyle(row.ifTier);
                        const blastResult = isBlast ? row as EvalBlastResult & { _type: 'blast' } : null;
                        const structResult = !isBlast ? row as EvalPdbStructure & { _type: 'structure' } : null;

                        return (
                          <tr key={`${row._type}-${row.pdbId || idx}`} className={`table-row-hover border-b border-claude-border-light ${isBlast ? 'bg-claude-border-light/30' : ''}`}>
                            <td className="px-3 py-2">
                              {row.pdbId ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <a
                                      href={`https://www.rcsb.org/structure/${row.pdbId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-mono font-semibold text-claude-accent hover:underline inline-flex items-center gap-0.5"
                                    >
                                      {row.pdbId}
                                      <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                                    </a>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="p-0 border border-claude-border shadow-lg">
                                    {structResult ? (
                                      <PdbTooltipContent entry={structResult} />
                                    ) : blastResult ? (
                                      <BlastHomologTooltipContent result={blastResult} />
                                    ) : null}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="text-claude-text-muted">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {isBlast ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-accent-light text-claude-accent border border-claude-accent/20 cursor-help">
                                      Homolog
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="p-0 border border-claude-border shadow-lg">
                                    {blastResult && <BlastHomologTooltipContent result={blastResult} />}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-mid-bg text-claude-mid">
                                  Structure
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {row.method ? (
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${mc.bg} ${mc.text}`}>
                                  {getMethodLabel(row.method)}
                                </span>
                              ) : <span className="text-claude-text-muted">—</span>}
                            </td>
                            <td className="px-3 py-2 font-mono">
                              {row.resolution != null ? (
                                <span className={`font-medium ${getResolutionColor(row.resolution)}`}>
                                  {row.resolution.toFixed(2)}Å
                                </span>
                              ) : <span className="text-claude-text-muted">—</span>}
                            </td>
                            <td className="px-3 py-2">
                              {'journalIf' in row && row.journalIf != null ? (
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${ifStyle.bg} ${ifStyle.text}`}>
                                  {row.journalIf.toFixed(1)}
                                </span>
                              ) : <span className="text-claude-text-muted">—</span>}
                            </td>
                            <td className="px-3 py-2 max-w-xs">
                              <span className="text-claude-text-secondary line-clamp-2 leading-relaxed">
                                {row.title || (blastResult?.description) || '—'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-claude-text-muted whitespace-nowrap">{formatDate(row.releaseDate)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              )}
            </div>

            {/* Pagination */}
            {mode === 'weekly' && sortedEntries.length > PAGE_SIZE && (
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                totalItems={sortedEntries.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            )}
            {mode === 'evaluation' && selectedEval && sortedEvalRows.length > PAGE_SIZE && (
              <Pagination
                page={currentPage}
                totalPages={totalEvalPages}
                totalItems={sortedEvalRows.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          {/* ═══════════ PREVIEW PANEL (Desktop) ═══════════ */}
          <AnimatePresence>
            {previewOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="hidden md:flex flex-shrink-0 border-l border-claude-border bg-white dark:bg-[#242220] overflow-hidden"
              >
                {renderPreviewPanel()}
              </motion.aside>
            )}
          </AnimatePresence>

          {/* ═══════════ PREVIEW PANEL (Mobile Slide-over) ═══════════ */}
          <AnimatePresence>
            {mobilePreviewOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
                  onClick={() => setMobilePreviewOpen(false)}
                />
                <motion.aside
                  initial={{ x: 380 }}
                  animate={{ x: 0 }}
                  exit={{ x: 380 }}
                  transition={{ duration: 0.2 }}
                  className="fixed right-0 top-0 bottom-0 z-50 w-[85vw] max-w-[400px] bg-white dark:bg-[#242220] border-l border-claude-border flex flex-col md:hidden"
                >
                  <div className="flex items-center justify-between p-3 border-b border-claude-border">
                    <span className="text-xs font-semibold text-claude-text">Details</span>
                    <Button variant="ghost" size="sm" onClick={() => setMobilePreviewOpen(false)} className="h-7 w-7 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {renderPreviewPanel()}
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="flex-shrink-0 h-8 flex items-center justify-center gap-2 border-t border-claude-border bg-white dark:bg-[#242220] text-[10px] text-claude-text-muted">
          <span>PDB Structure Tracker &copy; 2025</span>
          <span>·</span>
          <a
            href="https://www.rcsb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-claude-accent hover:underline inline-flex items-center gap-0.5"
          >
            RCSB PDB
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </footer>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal(prev => ({ ...prev, isOpen: false }))}
        title={reportModal.title}
        content={reportModal.content}
      />
    </TooltipProvider>
  );

  // ── Sidebar Render Function ──
  function renderSidebar() {
    return (
      <>
        {/* Mode Switcher */}
        <div className="p-3 border-b border-claude-border">
          <div className="flex rounded-lg bg-claude-border-light p-0.5">
            <button
              onClick={() => { setMode('weekly'); setSelectedEvalId(null); setSelectedEval(null); setSearchQuery(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-150 ${
                mode === 'weekly'
                  ? 'bg-white dark:bg-[#2b2926] text-claude-text shadow-sm'
                  : 'text-claude-text-muted hover:text-claude-text-secondary'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Weekly
            </button>
            <button
              onClick={() => { setMode('evaluation'); setSearchQuery(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-150 ${
                mode === 'evaluation'
                  ? 'bg-white dark:bg-[#2b2926] text-claude-text shadow-sm'
                  : 'text-claude-text-muted hover:text-claude-text-secondary'
              }`}
            >
              <Microscope className="h-3.5 w-3.5" />
              Evaluation
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <ScrollArea className="flex-1">
          {mode === 'weekly' ? (
            <div className="p-3 space-y-2">
              {/* Back button */}
              {selectedWeekId && (
                <button
                  onClick={() => setSelectedWeekId(null)}
                  className="inline-flex items-center gap-1 text-[11px] text-claude-text-muted hover:text-claude-accent transition-colors duration-150 mb-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to all weeks
                </button>
              )}

              {/* Week Cards */}
              {loadingSnapshots ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 rounded-lg bg-claude-border-light animate-pulse" />
                  ))}
                </div>
              ) : (
                snapshots.map(snap => {
                  const isSelected = selectedWeekId === snap.weekId;
                  const total = snap.totalStructures || 1;
                  const cryoemPct = (snap.cryoemCount / total) * 100;
                  const xrayPct = (snap.xrayCount / total) * 100;
                  const nmrPct = (snap.nmrCount / total) * 100;

                  return (
                    <button
                      key={snap.weekId}
                      onClick={() => setSelectedWeekId(snap.weekId)}
                      className={`w-full text-left p-3 rounded-[10px] border transition-all duration-200 claude-hover active:scale-[0.98] ${
                        isSelected
                          ? 'bg-claude-accent-light border-claude-accent/30 shadow-sm border-l-[3px] border-l-claude-accent'
                          : 'bg-white dark:bg-[#242220] border-claude-border hover:border-claude-border-light dark:hover:border-[#4a4540]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-claude-text font-mono">{snap.weekId}</span>
                        <span className="text-[10px] text-claude-text-muted">{snap.totalStructures} structures</span>
                      </div>
                      <div className="text-[10px] text-claude-text-muted mb-2">
                        {formatDate(snap.weekStart)} — {formatDate(snap.weekEnd)}
                      </div>
                      <div className="flex gap-1.5 flex-wrap mb-2">
                        {snap.cryoemCount > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-cryoem-bg text-claude-cryoem">
                            EM {snap.cryoemCount}
                          </span>
                        )}
                        {snap.xrayCount > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-xray-bg text-claude-xray">
                            XR {snap.xrayCount}
                          </span>
                        )}
                        {snap.nmrCount > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-nmr-bg text-claude-nmr">
                            NMR {snap.nmrCount}
                          </span>
                        )}
                        {snap.otherCount > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-other-bg text-claude-other">
                            Other {snap.otherCount}
                          </span>
                        )}
                      </div>
                      {/* Method ratio progress bar */}
                      <div className="flex h-1.5 rounded-full overflow-hidden bg-claude-border-light">
                        {snap.cryoemCount > 0 && (
                          <div className="h-full bg-claude-cryoem transition-all duration-300" style={{ width: `${cryoemPct}%` }} />
                        )}
                        {snap.xrayCount > 0 && (
                          <div className="h-full bg-claude-xray transition-all duration-300" style={{ width: `${xrayPct}%` }} />
                        )}
                        {snap.nmrCount > 0 && (
                          <div className="h-full bg-claude-nmr transition-all duration-300" style={{ width: `${nmrPct}%` }} />
                        )}
                        {snap.otherCount > 0 && (
                          <div className="h-full bg-claude-other transition-all duration-300" style={{ width: `${(snap.otherCount / total) * 100}%` }} />
                        )}
                      </div>
                    </button>
                  );
                })
              )}

              {/* Weekly Reports Section */}
              {selectedWeekId && weeklyReports.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-claude-text-muted mb-2 px-1">
                    Reports
                  </div>
                  {weeklyReports.map(report => (
                    <button
                      key={report.id}
                      onClick={() => openReport(report.id, report.title || 'Weekly Report')}
                      className="w-full text-left p-2.5 rounded-lg border border-claude-border bg-white dark:bg-[#242220] hover:bg-claude-border-light dark:hover:bg-[#2b2926] transition-all duration-150 claude-hover flex items-start gap-2"
                    >
                      <FileText className="h-3.5 w-3.5 text-claude-accent mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-claude-text truncate">{report.title || `Report ${report.reportType}`}</div>
                        <div className="text-[10px] text-claude-text-muted">{report.reportType}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          ) : (
            /* Evaluation Sidebar */
            <div className="p-3 space-y-2">
              {/* Back button */}
              {selectedEvalId && (
                <button
                  onClick={() => { setSelectedEvalId(null); setSelectedEval(null); }}
                  className="inline-flex items-center gap-1 text-[11px] text-claude-text-muted hover:text-claude-accent transition-colors duration-150 mb-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to all entries
                </button>
              )}

              {/* Eval Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-claude-text-muted" />
                <input
                  type="text"
                  placeholder="Search proteins..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-claude-border bg-white dark:bg-[#1a1917] dark:text-[#e8e4dd] focus:outline-none focus:ring-1 focus:ring-claude-accent/40 focus:border-claude-accent/40 placeholder:text-claude-text-muted/60"
                />
              </div>

              {loadingEvals ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 rounded-lg bg-claude-border-light animate-pulse" />
                  ))}
                </div>
              ) : (
                filteredEvals.map(ev => {
                  const avgScore = getAvgScore(ev.scores);
                  const scoreColor = getScoreColor(avgScore);
                  return (
                    <button
                      key={ev.uniprotId}
                      onClick={() => setSelectedEvalId(ev.uniprotId)}
                      className={`w-full text-left p-3 rounded-[10px] border transition-all duration-200 claude-hover active:scale-[0.98] ${
                        selectedEvalId === ev.uniprotId
                          ? 'bg-claude-accent-light border-claude-accent/30 shadow-sm border-l-[3px] border-l-claude-accent'
                          : 'bg-white dark:bg-[#242220] border-claude-border hover:border-claude-border-light dark:hover:border-[#4a4540]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold text-claude-accent">{ev.uniprotId}</span>
                        <span
                          className="flex-shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                          style={{ color: scoreColor, backgroundColor: `${scoreColor}15` }}
                        >
                          {avgScore.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-[11px] text-claude-text-secondary line-clamp-1 leading-tight">
                        {ev.proteinName || ev.entryName}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-claude-text-muted">
                        {ev.coverage != null && <span>{ev.coverage.toFixed(1)}% coverage</span>}
                        {ev._count && (
                          <>
                            <span>·</span>
                            <span>{ev._count.pdbStructures} PDB</span>
                            <span>{ev._count.blastResults} BLAST</span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </ScrollArea>
      </>
    );
  }

  // ── Preview Panel Render Function ──
  function renderPreviewPanel() {
    return (
      <Tabs value={previewTab} onValueChange={setPreviewTab} className="h-full flex flex-col">
        <div className="px-4 pt-3 border-b border-claude-border">
          <TabsList className="w-full h-8 bg-claude-border-light p-0.5">
            <TabsTrigger value="summary" className="flex-1 text-xs h-7 data-[state=active]:bg-white dark:data-[state=active]:bg-[#2b2926] data-[state=active]:shadow-sm">
              <BarChart3 className="h-3 w-3 mr-1" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="report" className="flex-1 text-xs h-7 data-[state=active]:bg-white dark:data-[state=active]:bg-[#2b2926] data-[state=active]:shadow-sm">
              <FileText className="h-3 w-3 mr-1" />
              Full Report
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          {previewTab === 'summary' ? (
            mode === 'weekly' && selectedSnapshot ? (
              <WeeklySummary snapshot={selectedSnapshot} snapshots={snapshots} />
            ) : mode === 'evaluation' && selectedEval ? (
              <EvalSummary evalData={selectedEval} openReport={openEvalReport} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted">
                <Info className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">Select an item to view summary</p>
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
                    className="w-full text-left p-3 rounded-[10px] border border-claude-border bg-white dark:bg-[#242220] hover:bg-claude-border-light dark:hover:bg-[#2b2926] transition-all duration-150 claude-hover"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-3.5 w-3.5 text-claude-accent" />
                      <span className="text-xs font-medium text-claude-text">{report.title || `Report (${report.reportType})`}</span>
                    </div>
                    <div className="text-[10px] text-claude-text-muted">{formatDate(report.createdAt)}</div>
                  </button>
                ))}
              </div>
            ) : mode === 'evaluation' && selectedEval?.report ? (
              <div className="p-4">
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedEval.report}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted">
                <FileText className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">No reports available</p>
              </div>
            )
          )}
        </ScrollArea>
      </Tabs>
    );
  }
}

// ─── Weekly Summary Sub-Component (Enhanced with Charts) ─────────────────────

const METHOD_COLORS: Record<string, string> = {
  'Cryo-EM': '#2d8f8f',
  'X-ray': '#7c5cbf',
  'NMR': '#c9872e',
  'Other': '#6b7280',
};

const RESOLUTION_RANGES = [
  { label: '≤1.5Å', min: 0, max: 1.5, color: '#16a34a' },
  { label: '1.5-2.0Å', min: 1.5, max: 2.0, color: '#2d8f8f' },
  { label: '2.0-2.5Å', min: 2.0, max: 2.5, color: '#7c5cbf' },
  { label: '2.5-3.0Å', min: 2.5, max: 3.0, color: '#c9872e' },
  { label: '3.0-3.5Å', min: 3.0, max: 3.5, color: '#ea580c' },
  { label: '>3.5Å', min: 3.5, max: Infinity, color: '#dc2626' },
];

const IF_TIER_COLORS: Record<string, string> = {
  top: '#dc2626',
  high: '#ea580c',
  mid: '#16a34a',
  low: '#6b7280',
  unknown: '#9b9590',
};

function WeeklySummary({ snapshot, snapshots }: { snapshot: WeeklySnapshot; snapshots: WeeklySnapshot[] }) {
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
        <div className="p-3 rounded-lg bg-claude-border-light/50">
          <div className="text-lg font-semibold text-claude-text">{snapshot.totalStructures}</div>
          <div className="text-[10px] text-claude-text-muted">Total Structures</div>
        </div>
        <div className="p-3 rounded-lg bg-claude-cryoem-bg/50">
          <div className="text-lg font-semibold text-claude-cryoem">{snapshot.cryoemCount}</div>
          <div className="text-[10px] text-claude-cryoem/70">Cryo-EM</div>
        </div>
        <div className="p-3 rounded-lg bg-claude-xray-bg/50">
          <div className="text-lg font-semibold text-claude-xray">{snapshot.xrayCount}</div>
          <div className="text-[10px] text-claude-xray/70">X-ray</div>
        </div>
        <div className="p-3 rounded-lg bg-claude-nmr-bg/50">
          <div className="text-lg font-semibold text-claude-nmr">{snapshot.nmrCount}</div>
          <div className="text-[10px] text-claude-nmr/70">NMR</div>
        </div>
      </div>

      {/* ─── Chart 1: Method Distribution Donut Chart ─── */}
      {methodPieData.length > 0 && (
        <div className="bg-claude-bg/50 rounded-lg p-3">
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
                    stroke="none"
                    animationBegin={0}
                    animationDuration={600}
                  >
                    {methodPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RTooltip
                    formatter={(value: number, name: string) => [`${value} structures`, name]}
                    contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #e5ddd4', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  />
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
        <div className="bg-claude-bg/50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-claude-text mb-2">Resolution Distribution</h4>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={resolutionBarData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
              <XAxis type="number" tick={{ fontSize: 9, fill: '#9b9590' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="range" tick={{ fontSize: 9, fill: '#7c756e' }} axisLine={false} tickLine={false} width={52} />
              <RTooltip
                formatter={(value: number) => [`${value} structures`, 'Count']}
                contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #e5ddd4', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} animationDuration={600}>
                {resolutionBarData.map((entry, index) => (
                  <Cell key={`res-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Average Resolution */}
      <div className="grid grid-cols-2 gap-2">
        {snapshot.cryoemAvgRes != null && (
          <div className="p-3 rounded-lg bg-claude-cryoem-bg/30">
            <div className="text-[10px] text-claude-cryoem/70 mb-0.5">Cryo-EM Avg Res</div>
            <div className="text-sm font-mono font-semibold text-claude-cryoem">{snapshot.cryoemAvgRes.toFixed(2)}Å</div>
          </div>
        )}
        {snapshot.xrayAvgRes != null && (
          <div className="p-3 rounded-lg bg-claude-xray-bg/30">
            <div className="text-[10px] text-claude-xray/70 mb-0.5">X-ray Avg Res</div>
            <div className="text-sm font-mono font-semibold text-claude-xray">{snapshot.xrayAvgRes.toFixed(2)}Å</div>
          </div>
        )}
      </div>

      {/* ─── Chart 3: Impact Factor Tier Distribution ─── */}
      {ifTierBarData.length > 0 && ifTierBarData.some(d => d.count > 0) && (
        <div className="bg-claude-bg/50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-claude-text mb-2">Impact Factor Tiers</h4>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={ifTierBarData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <XAxis dataKey="tier" tick={{ fontSize: 9, fill: '#7c756e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9b9590' }} axisLine={false} tickLine={false} width={24} />
              <RTooltip
                formatter={(value: number) => [`${value} structures`, 'Count']}
                contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #e5ddd4', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={600}>
                {ifTierBarData.map((entry, index) => (
                  <Cell key={`if-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ─── Chart 4: Weekly Trends Mini Area Chart ─── */}
      {weeklyTrendData.length > 1 && (
        <div className="bg-claude-bg/50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-claude-text mb-2">Weekly Trends</h4>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={weeklyTrendData} margin={{ top: 2, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c4644a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c4644a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                tick={{ fontSize: 8, fill: '#9b9590' }}
                axisLine={false}
                tickLine={false}
                interval={Math.max(0, Math.floor(weeklyTrendData.length / 4) - 1)}
              />
              <YAxis tick={{ fontSize: 8, fill: '#9b9590' }} axisLine={false} tickLine={false} width={28} />
              <RTooltip
                formatter={(value: number) => [`${value} structures`, 'Total']}
                labelFormatter={(label: string) => `Week ${label}`}
                contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #e5ddd4', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#c4644a"
                strokeWidth={1.5}
                fill="url(#trendGradient)"
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
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
              <div key={i} className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-claude-border-light/30">
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

// ─── Evaluation Summary Sub-Component ────────────────────────────────────────

function EvalSummary({ evalData, openReport }: { evalData: Evaluation; openReport: (id: number, title: string) => void }) {
  const scores = useMemo(() => {
    try { return evalData.scores ? JSON.parse(evalData.scores) : {}; }
    catch { return {}; }
  }, [evalData.scores]);

  const [evalReport, setEvalReport] = useState<{ id: number; title: string | null } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/evaluation-reports');
        const data = await res.json();
        const found = data.find((r: EvaluationReport) => r.uniprotId === evalData.uniprotId);
        if (found) setEvalReport(found);
      } catch { /* ignore */ }
    }
    load();
  }, [evalData.uniprotId]);

  const blastResults = evalData.blastResults || [];
  const pdbStructures = evalData.pdbStructures || [];

  return (
    <div className="p-4 space-y-4">
      {/* Protein Info */}
      <div>
        <h3 className="text-sm font-semibold text-claude-text leading-snug">{evalData.proteinName || evalData.uniprotId}</h3>
        <div className="mt-1 space-y-0.5">
          <div className="text-[10px] text-claude-text-muted">
            <span className="font-mono text-claude-accent">{evalData.uniprotId}</span>
            {evalData.entryName && <span className="ml-1.5">({evalData.entryName})</span>}
          </div>
          {evalData.geneNames && (
            <div className="text-[10px] text-claude-text-muted">
              Gene: <span className="text-claude-text-secondary">{evalData.geneNames}</span>
            </div>
          )}
          {evalData.organism && (
            <div className="text-[10px] text-claude-text-muted">
              Organism: <span className="text-claude-text-secondary">{evalData.organism}</span>
            </div>
          )}
          {evalData.sequenceLength && (
            <div className="text-[10px] text-claude-text-muted">
              Length: <span className="font-mono text-claude-text-secondary">{evalData.sequenceLength} aa</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Coverage */}
      {evalData.coverage != null && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-claude-text">Structure Coverage</span>
            <span className="text-xs font-mono font-semibold text-claude-accent">{evalData.coverage.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 bg-claude-border-light rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-claude-accent"
              style={{ width: `${Math.min(evalData.coverage, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-claude-text-muted mt-1">
            {evalData.coverage >= 80 ? 'Excellent structural coverage' :
             evalData.coverage >= 50 ? 'Moderate structural coverage' :
             evalData.coverage >= 25 ? 'Limited structural coverage' :
             'Very limited structural coverage'}
          </p>
        </div>
      )}

      {/* Feasibility Scores */}
      <div>
        <h4 className="text-xs font-semibold text-claude-text mb-2">Feasibility Scores</h4>
        <div className="space-y-2.5">
          {Object.entries(scores).map(([key, value]) => (
            <ScoreBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} score={value as number} />
          ))}
        </div>
      </div>

      <Separator />

      {/* BLAST Stats */}
      {blastResults.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-claude-text mb-2">BLAST Homologs</h4>
          <div className="space-y-1.5">
            {blastResults.slice(0, 5).map((br, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-claude-border-light/30">
                {br.pdbId && <span className="font-mono text-[10px] font-semibold text-claude-accent">{br.pdbId}</span>}
                <div className="flex-1 flex items-center gap-2 text-[10px]">
                  {br.identity != null && (
                    <span className={`${getIdentityColor(br.identity)} font-mono font-medium`}>{br.identity}%</span>
                  )}
                  {br.evalue != null && (
                    <span className="text-claude-text-muted font-mono">E:{formatEvalue(br.evalue)}</span>
                  )}
                  {br.queryCoverage != null && (
                    <span className="text-claude-text-muted font-mono">Q:{br.queryCoverage}%</span>
                  )}
                </div>
              </div>
            ))}
            {blastResults.length > 5 && (
              <div className="text-[10px] text-claude-text-muted text-center">
                + {blastResults.length - 5} more homologs
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {evalData.report && (
        <div>
          <h4 className="text-xs font-semibold text-claude-text mb-2">Recommendations</h4>
          <div className="p-3 rounded-lg bg-claude-border-light/30 text-[11px] text-claude-text-secondary leading-relaxed line-clamp-4">
            {evalData.report
              .replace(/[#*_]/g, '')
              .split('\n')
              .filter(l => l.trim())
              .slice(-3)
              .join(' ')}
          </div>
        </div>
      )}

      {/* View Report Button */}
      {evalReport && (
        <Button
          onClick={() => openReport(evalReport.id, evalReport.title || 'Evaluation Report')}
          className="w-full text-xs h-8 bg-claude-accent hover:bg-claude-accent-hover text-white"
        >
          <FileText className="h-3.5 w-3.5 mr-1.5" />
          View Full Report
        </Button>
      )}
    </div>
  );
}
