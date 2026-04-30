'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect, Suspense } from 'react';
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
  ArrowLeft,
  Moon,
  Sun,
  Download,
  Keyboard,
  GitCompareArrows,
  TrendingUp,
  TrendingDown,
  Bookmark,
  BookmarkCheck,
  Star,
  Columns3,
  SlidersHorizontal,
  RotateCcw,
  Clock,
  Printer,
  Globe,
  Dna,
  Activity,
  HelpCircle,
  BookmarkPlus,
  BookmarkMinus,
  Copy,
  Check,
  Minus,
  Hash,
  BookOpen,
  AlignJustify,
  AlignVerticalSpaceAround,
  Bell,
  Trash2,
  CheckCheck,
  Terminal,
  Share2,
  ZoomIn,
  ZoomOut,
  Compass,
  EyeOff,
  PanelRightOpen,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, Legend, ScatterChart, Scatter, ZAxis } from 'recharts';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command';

const MoleculeViewer = dynamic(() => import('./molecule-viewer'), { ssr: false });

// ─── useCountUp Hook ─────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 400): number {
  const [current, setCurrent] = useState(target);
  const prevTargetRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevTargetRef.current === target) return;
    const start = prevTargetRef.current;
    const diff = target - start;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + diff * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevTargetRef.current = target;
        setCurrent(target);
      }
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  // Sync on first render
  useEffect(() => {
    prevTargetRef.current = target;
  }, []);

  return current;
}

// ─── Animated Number Component ───────────────────────────────────────────────

function AnimatedNumber({ value, decimals = 0, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const animated = useCountUp(Math.round(value * Math.pow(10, decimals)), 400);
  const display = (animated / Math.pow(10, decimals)).toFixed(decimals);
  return <span className="tabular-nums">{display}{suffix}</span>;
}

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

interface AppNotification {
  id: string;
  icon: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

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

// ─── Quality Score Calculation ────────────────────────────────────────────────

interface QualityScoreResult {
  total: number;
  resolutionScore: number;
  methodScore: number;
  ifScore: number;
  label: string;
  color: string;
}

function computeQualityScore(entry: PdbEntry | EvalPdbStructure): QualityScoreResult {
  // Resolution score (max 35)
  let resolutionScore: number;
  const res = entry.resolution;
  if (res === null || res === undefined) {
    resolutionScore = 8;
  } else if (res <= 1.5) {
    resolutionScore = 35;
  } else if (res <= 2.0) {
    resolutionScore = 30;
  } else if (res <= 2.5) {
    resolutionScore = 25;
  } else if (res <= 3.0) {
    resolutionScore = 18;
  } else if (res <= 3.5) {
    resolutionScore = 12;
  } else {
    resolutionScore = 5;
  }

  // Method bonus (max 25)
  let methodScore: number;
  const m = (entry.method || '').toUpperCase();
  if (m.includes('X-RAY') || m.includes('XRAY')) {
    methodScore = 25;
  } else if (m.includes('CRYO') || m.includes('ELECTRON MICROSCOPY')) {
    methodScore = 22;
  } else if (m.includes('NMR')) {
    methodScore = 15;
  } else {
    methodScore = 10;
  }

  // Impact Factor bonus (max 30)
  let ifScore: number;
  const jif = 'journalIf' in entry ? entry.journalIf : null;
  if (jif === null || jif === undefined) {
    ifScore = 3;
  } else if (jif >= 20) {
    ifScore = 30;
  } else if (jif >= 10) {
    ifScore = 25;
  } else if (jif >= 5) {
    ifScore = 18;
  } else if (jif >= 2) {
    ifScore = 10;
  } else {
    ifScore = 5;
  }

  // Total: 0-90 range, normalized to 0-100
  const rawTotal = resolutionScore + methodScore + ifScore;
  const total = Math.round((rawTotal / 90) * 100);

  // Label & color
  let label: string;
  let color: string;
  if (total >= 80) {
    label = 'Excellent';
    color = '#22c55e';
  } else if (total >= 60) {
    label = 'Good';
    color = '#14b8a6';
  } else if (total >= 40) {
    label = 'Fair';
    color = '#f59e0b';
  } else {
    label = 'Low';
    color = '#ef4444';
  }

  return { total, resolutionScore, methodScore, ifScore, label, color };
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
  const isHigh = score >= 8;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-claude-text-secondary">{label}</span>
        <span className="font-mono font-medium" style={{ color }}>{score.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-claude-border-light rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full score-bar-fill transition-all duration-500 ${isHigh ? 'shadow-sm' : ''}`}
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            '--score-width': `${pct}%`,
            ...(isHigh ? { boxShadow: `0 0 6px ${color}40` } : {}),
          } as React.CSSProperties}
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
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar preview-scroll">
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
          className="pagination-btn btn-press inline-flex items-center justify-center h-7 px-2 rounded-md text-[11px] font-medium border border-claude-border bg-white dark:bg-[#242220] text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-[#3d3832] disabled:opacity-40 disabled:cursor-not-allowed claude-focus-ring"
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
              className={`pagination-btn btn-press inline-flex items-center justify-center h-7 w-7 rounded-md text-[11px] font-medium claude-focus-ring ${
                page === p
                  ? 'bg-claude-accent text-white shadow-sm pagination-active'
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
          className="pagination-btn btn-press inline-flex items-center justify-center h-7 px-2 rounded-md text-[11px] font-medium border border-claude-border bg-white dark:bg-[#242220] text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-[#3d3832] disabled:opacity-40 disabled:cursor-not-allowed claude-focus-ring"
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
  // Varying widths per column to look more realistic
  const colWidths = ['w-[60%]', 'w-[45%]', 'w-[55%]', 'w-[40%]', 'w-[70%]', 'w-[80%]', 'w-[60%]', 'w-[50%]'];
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={`skel-${i}`} className="border-b border-claude-border-light">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={`skel-${i}-${j}`} className="px-3 py-2.5">
              <div className={`h-3 rounded-md shimmer-skeleton ${colWidths[j % colWidths.length]}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Search Dropdown Component ──────────────────────────────────────────────

interface SearchSuggestionItem {
  type: 'pdbId' | 'title' | 'organism' | 'journal';
  text: string;
  subtitle?: string;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const q = query.trim();
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-claude-accent font-semibold">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}

function SearchDropdown({
  isOpen,
  searchQuery,
  suggestions,
  searchHistory,
  highlightIndex,
  onSelectSuggestion,
  onSelectHistory,
  onClearHistory,
}: {
  isOpen: boolean;
  searchQuery: string;
  suggestions: SearchSuggestionItem[];
  searchHistory: string[];
  highlightIndex: number;
  onSelectSuggestion: (suggestion: SearchSuggestionItem) => void;
  onSelectHistory: (term: string) => void;
  onClearHistory: () => void;
}) {
  const hasQuery = searchQuery.trim().length > 0;

  // Group suggestions by type
  const groupedSuggestions = useMemo(() => {
    const groups: { type: SearchSuggestionItem['type']; items: SearchSuggestionItem[] }[] = [];
    const types: SearchSuggestionItem['type'][] = ['pdbId', 'title', 'organism', 'journal'];
    for (const key of types) {
      const items = suggestions.filter(s => s.type === key);
      if (items.length > 0) {
        groups.push({ type: key, items });
      }
    }
    return groups;
  }, [suggestions]);

  const getIcon = (type: SearchSuggestionItem['type']) => {
    switch (type) {
      case 'pdbId': return <Hash className="h-3 w-3 text-claude-text-muted mr-2 flex-shrink-0" />;
      case 'title': return <FileText className="h-3 w-3 text-claude-text-muted mr-2 flex-shrink-0" />;
      case 'organism': return <Globe className="h-3 w-3 text-claude-text-muted mr-2 flex-shrink-0" />;
      case 'journal': return <BookOpen className="h-3 w-3 text-claude-text-muted mr-2 flex-shrink-0" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (hasQuery ? suggestions.length > 0 : searchHistory.length > 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.12 }}
          className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-[#2b2926] border border-claude-border rounded-lg shadow-xl p-1 max-h-64 overflow-y-auto custom-scrollbar"
        >
          {hasQuery ? (
            <>
              {(() => {
                let runningIdx = 0;
                return groupedSuggestions.map((group) => {
                  const startIdx = runningIdx;
                  const items = group.items.map((item, ii) => {
                    const flatIdx = startIdx + ii;
                    const isHighlighted = flatIdx === highlightIndex;
                    runningIdx++;
                    return (
                      <div
                        key={`${item.type}-${item.text}-${ii}`}
                        className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer text-xs ${
                          isHighlighted
                            ? 'bg-claude-accent-light/50 dark:bg-[#d4784f]/10'
                            : 'hover:bg-claude-bg/50 dark:hover:bg-[#3d3832]'
                        }`}
                        onClick={() => onSelectSuggestion(item)}
                      >
                        {getIcon(item.type)}
                        <span className="truncate flex-1 min-w-0">
                          <HighlightMatch text={item.text} query={searchQuery} />
                        </span>
                        {item.subtitle && (
                          <span className="text-[10px] text-claude-text-muted ml-2 flex-shrink-0 font-mono">{item.subtitle}</span>
                        )}
                      </div>
                    );
                  });
                  return (
                    <div key={group.type}>
                      <div className="text-[9px] font-semibold uppercase text-claude-text-muted px-2 py-1">
                        {group.type === 'pdbId' ? 'PDB IDs' : group.type === 'title' ? 'Titles' : group.type === 'organism' ? 'Organisms' : 'Journals'}
                      </div>
                      {items}
                    </div>
                  );
                });
              })()}
            </>
          ) : (
            <>
              <div className="text-[9px] font-semibold uppercase text-claude-text-muted px-2 py-1">
                Recent Searches
              </div>
              {searchHistory.map((term, ii) => {
                const isHighlighted = ii === highlightIndex;
                return (
                  <div
                    key={`hist-${ii}`}
                    className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer text-xs ${
                      isHighlighted
                        ? 'bg-claude-accent-light/50 dark:bg-[#d4784f]/10'
                        : 'hover:bg-claude-bg/50 dark:hover:bg-[#3d3832]'
                    }`}
                    onClick={() => onSelectHistory(term)}
                  >
                    <Clock className="h-3 w-3 text-claude-text-muted mr-2 flex-shrink-0" />
                    <span className="truncate flex-1 min-w-0">{term}</span>
                  </div>
                );
              })}
              {searchHistory.length > 0 && (
                <div className="border-t border-claude-border mt-1 pt-1 px-2 py-1 flex items-center justify-between">
                  <span className="text-[10px] text-claude-text-muted">{searchHistory.length} recent search{searchHistory.length !== 1 ? 'es' : ''}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onClearHistory(); }}
                    className="text-[10px] text-claude-accent hover:text-claude-accent/80 transition-colors"
                  >
                    Clear history
                  </button>
                </div>
              )}
            </>
          )}
          {hasQuery && suggestions.length > 0 && (
            <div className="border-t border-claude-border mt-1 pt-1 px-2 py-1">
              <span className="text-[10px] text-claude-text-muted">{suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Tour Overlay Component ─────────────────────────────────────────────────

interface TourStepConfig {
  title: string;
  description: string;
  targetRef: React.RefObject<HTMLElement | null>;
}

const TOUR_STEPS: Omit<TourStepConfig, 'targetRef'>[] = [
  { title: 'Welcome to PDB Structure Tracker', description: 'Track and evaluate protein structures from the PDB database with powerful filtering, comparison, and visualization tools.' },
  { title: 'Browse by Week', description: 'Select a week to view its PDB structures. Each card shows the count and method distribution.' },
  { title: 'Switch Modes', description: 'Toggle between Weekly browsing and Protein Evaluation modes.' },
  { title: 'Search & Filter', description: 'Search by PDB ID, title, or journal. Use advanced filters for resolution, impact factor, and organisms.' },
  { title: 'Preview & Visualize', description: 'View summary statistics, interactive charts, and timeline visualizations in the side panel.' },
  { title: 'Keyboard Shortcuts', description: 'Use ⌘K to search, ⌘E to switch modes, ⌘B to toggle bookmarks, and Esc to clear.' },
];

function TourOverlay({
  tourActive,
  tourStep,
  setTourStep,
  finishTour,
  steps,
}: {
  tourActive: boolean;
  tourStep: number;
  setTourStep: (s: number) => void;
  finishTour: () => void;
  steps: TourStepConfig[];
}) {
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [positionAbove, setPositionAbove] = useState(false);
  const rafRef = useRef<number | null>(null);

  const currentStep = steps[tourStep];
  const isLastStep = tourStep === steps.length - 1;

  const updatePosition = useCallback(() => {
    if (!currentStep?.targetRef?.current) {
      setSpotlightRect(null);
      return;
    }
    const el = currentStep.targetRef.current;
    const rect = el.getBoundingClientRect();
    setSpotlightRect(rect);

    const tooltipWidth = 280;
    const tooltipHeight = 200;
    const gap = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Determine if tooltip should be above or below
    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    const above = spaceBelow < tooltipHeight + gap && spaceAbove > spaceBelow;
    setPositionAbove(above);

    // Horizontal centering with clamping
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    left = Math.max(8, Math.min(left, vw - tooltipWidth - 8));

    let top: number;
    if (above) {
      top = rect.top - gap - tooltipHeight;
    } else {
      top = rect.bottom + gap;
    }
    top = Math.max(8, top);

    setTooltipPos({ top, left });
  }, [currentStep]);

  useLayoutEffect(() => {
    if (!tourActive) return;
    const raf = requestAnimationFrame(() => updatePosition());
    const handleResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePosition);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tourActive, updatePosition]);

  // Update position when step changes
  useEffect(() => {
    if (tourActive) {
      const raf = requestAnimationFrame(() => updatePosition());
      return () => cancelAnimationFrame(raf);
    }
  }, [tourActive, tourStep, updatePosition]);

  if (!tourActive || !currentStep || !spotlightRect) return null;

  const stepConfig = TOUR_STEPS[tourStep];

  return createPortal(
    <AnimatePresence mode="wait">
      <motion.div
        key={`tour-step-${tourStep}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100]"
      >
        {/* Overlay with spotlight cutout using box-shadow technique */}
        <div
          className="absolute inset-0"
          style={{
            boxShadow: spotlightRect
              ? `0 0 0 9999px rgba(0, 0, 0, 0.4)`
              : undefined,
          }}
        />

        {/* Spotlight highlight element */}
        <div
          className="absolute rounded-lg border-2 border-claude-accent animate-[pulse_2s_ease-in-out_infinite] pointer-events-none"
          style={{
            top: spotlightRect.top - 4,
            left: spotlightRect.left - 4,
            width: spotlightRect.width + 8,
            height: spotlightRect.height + 8,
          }}
        />

        {/* Tooltip Card */}
        <motion.div
          initial={{ opacity: 0, y: positionAbove ? 6 : -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: positionAbove ? 6 : -6 }}
          transition={{ duration: 0.2 }}
          className="absolute bg-white dark:bg-[#242220] border border-claude-border rounded-xl shadow-2xl p-4 max-w-[280px]"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
          }}
        >
          {/* Skip button */}
          <button
            onClick={finishTour}
            className="absolute top-3 right-3 text-[10px] text-claude-text-muted hover:text-claude-text transition-colors"
          >
            Skip
          </button>

          {/* Step number + title */}
          <div className="flex items-start gap-2.5 mb-2">
            <span className="h-5 w-5 rounded-full bg-claude-accent text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {tourStep + 1}
            </span>
            <div className="min-w-0 pr-8">
              <div className="text-sm font-semibold text-claude-text leading-tight">
                {stepConfig.title}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-claude-text-secondary leading-relaxed mb-4 pl-[30px]">
            {stepConfig.description}
          </p>

          {/* Step dots */}
          <div className="flex items-center gap-1.5 pl-[30px] mb-3">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                  i === tourStep
                    ? 'bg-claude-accent'
                    : 'border border-claude-text-muted/40 bg-transparent'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2 pl-[30px]">
            {tourStep > 0 && (
              <button
                onClick={() => setTourStep(tourStep - 1)}
                className="px-3 py-1.5 rounded-md text-[11px] font-medium text-claude-text-secondary hover:text-claude-text hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (isLastStep) {
                  finishTour();
                } else {
                  setTourStep(tourStep + 1);
                }
              }}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                isLastStep
                  ? 'bg-claude-accent text-white hover:bg-claude-accent-hover'
                  : 'bg-claude-accent text-white hover:bg-claude-accent-hover'
              }`}
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
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

  // ── Compare Mode ──
  const [compareMode, setCompareMode] = useState(false);
  const [compareWeekId, setCompareWeekId] = useState<string | null>(null);
  const [compareEntries, setCompareEntries] = useState<PdbEntry[]>([]);

  // ── Mobile State ──
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // ── Detail Panel (Row Detail Slide-over) ──
  const [selectedEntry, setSelectedEntry] = useState<PdbEntry | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  // ── Timeline Highlight ──
  const [highlightedEntry, setHighlightedEntry] = useState<string | null>(null);

  // ── Bookmarks ──
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('pdb-bookmarks');
      if (saved) return new Set(JSON.parse(saved) as string[]);
    } catch { /* ignore */ }
    return new Set<string>();
  });
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [bookmarksExpanded, setBookmarksExpanded] = useState(true);

  // ── Row Selection (Batch Operations) ──
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // ── Column Visibility ──
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('pdb-hidden-columns');
      if (saved) return new Set(JSON.parse(saved) as string[]);
    } catch { /* ignore */ }
    return new Set<string>();
  });

  // ── Data Density ──
  const [compactMode, setCompactMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pdb-compact-mode');
      if (saved !== null) return saved === 'true';
    } catch { /* ignore */ }
    return false;
  });

  // Persist compact mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pdb-compact-mode', String(compactMode));
    } catch { /* ignore */ }
  }, [compactMode]);

  // ── Command Palette ──
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // ── URL Search Params (Share View) ──
  const searchParams = useSearchParams();
  const urlParamsApplied = useRef(false);

  // Persist hidden columns to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pdb-hidden-columns', JSON.stringify([...hiddenColumns]));
    } catch { /* ignore */ }
  }, [hiddenColumns]);

  const toggleColumnVisibility = useCallback((field: string) => {
    setHiddenColumns(prev => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }, []);

  // ── Resizable Panels ──
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pdb-sidebar-width');
      if (saved) return Math.min(400, Math.max(200, Number(saved)));
    } catch { /* ignore */ }
    return 280;
  });
  const [previewWidth, setPreviewWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pdb-preview-width');
      if (saved) return Math.min(600, Math.max(280, Number(saved)));
    } catch { /* ignore */ }
    return 380;
  });
  const [resizingSidebar, setResizingSidebar] = useState(false);
  const [resizingPreview, setResizingPreview] = useState(false);

  // Persist panel widths to localStorage
  useEffect(() => {
    try { localStorage.setItem('pdb-sidebar-width', String(sidebarWidth)); } catch { /* ignore */ }
  }, [sidebarWidth]);
  useEffect(() => {
    try { localStorage.setItem('pdb-preview-width', String(previewWidth)); } catch { /* ignore */ }
  }, [previewWidth]);

  // ── Notifications ──
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback((icon: string, title: string, description: string) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setNotifications(prev => {
      const next = [{ id, icon, title, description, timestamp: new Date(), read: false }, ...prev];
      return next.slice(0, 20);
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // ── Resize Drag Handlers ──
  const sidebarDragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const previewDragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const handleSidebarMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    sidebarDragRef.current = { startX: e.clientX, startWidth: sidebarWidth };
    setResizingSidebar(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, [sidebarWidth]);

  const handlePreviewMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    previewDragRef.current = { startX: e.clientX, startWidth: previewWidth };
    setResizingPreview(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, [previewWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sidebarDragRef.current) {
        const delta = e.clientX - sidebarDragRef.current.startX;
        const newWidth = Math.min(400, Math.max(200, sidebarDragRef.current.startWidth + delta));
        setSidebarWidth(newWidth);
      }
      if (previewDragRef.current) {
        const delta = sidebarDragRef.current ? 0 : (previewDragRef.current.startX - e.clientX);
        const newWidth = Math.min(600, Math.max(280, previewDragRef.current.startWidth + delta));
        setPreviewWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      if (sidebarDragRef.current || previewDragRef.current) {
        sidebarDragRef.current = null;
        previewDragRef.current = null;
        setResizingSidebar(false);
        setResizingPreview(false);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // ── Search Dropdown ──
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [searchHighlightIndex, setSearchHighlightIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pdb-search-history');
      if (saved) return JSON.parse(saved) as string[];
    } catch { /* ignore */ }
    return [];
  });

  // ── Advanced Filters ──
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [resolutionRange, setResolutionRange] = useState<[number, number]>([0, 5]);
  const [ifRange, setIfRange] = useState<[number, number]>([0, 50]);
  const [selectedOrganisms, setSelectedOrganisms] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [qualityFilter, setQualityFilter] = useState<string>('all');

  // Organism list from current week's entries
  const organismOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      if (e.organisms) {
        e.organisms.split('|').forEach(o => {
          const trimmed = o.trim();
          if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [entries]);

  // Active advanced filter count
  const activeAdvancedFilterCount = useMemo(() => {
    let count = 0;
    if (resolutionRange[0] !== 0 || resolutionRange[1] !== 5) count++;
    if (ifRange[0] !== 0 || ifRange[1] !== 50) count++;
    if (selectedOrganisms.size > 0) count++;
    if (dateRange.from || dateRange.to) count++;
    if (qualityFilter !== 'all') count++;
    return count;
  }, [resolutionRange, ifRange, selectedOrganisms, dateRange, qualityFilter]);

  const clearAdvancedFilters = useCallback(() => {
    setResolutionRange([0, 5]);
    setIfRange([0, 50]);
    setSelectedOrganisms(new Set());
    setDateRange({ from: '', to: '' });
    setQualityFilter('all');
  }, []);

  const toggleOrganism = useCallback((organism: string) => {
    setSelectedOrganisms(prev => {
      const next = new Set(prev);
      if (next.has(organism)) next.delete(organism);
      else next.add(organism);
      return next;
    });
  }, []);

  const toggleAllOrganisms = useCallback(() => {
    if (selectedOrganisms.size === organismOptions.length) {
      setSelectedOrganisms(new Set());
    } else {
      setSelectedOrganisms(new Set(organismOptions.map(o => o.name)));
    }
  }, [selectedOrganisms.size, organismOptions]);

  // Persist bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pdb-bookmarks', JSON.stringify([...bookmarks]));
    } catch { /* ignore */ }
  }, [bookmarks]);

  // Persist search history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pdb-search-history', JSON.stringify(searchHistory));
    } catch { /* ignore */ }
  }, [searchHistory]);

  // Add search term to history
  const addToSearchHistory = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(h => h.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 10);
    });
  }, []);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    toast('Search history cleared');
  }, []);

  // ── Share View: Build URL ──
  const buildShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (mode !== 'weekly') params.set('mode', mode);
    if (selectedWeekId) params.set('week', selectedWeekId);
    if (selectedEvalId) params.set('eval', selectedEvalId);
    if (methodFilter !== 'all') params.set('method', methodFilter);
    if (searchQuery) params.set('q', searchQuery);
    if (compareMode) {
      params.set('compare', '1');
      if (compareWeekId) params.set('compareWeek', compareWeekId);
    }
    if (previewTab !== 'summary') params.set('tab', previewTab);
    if (compactMode) params.set('compact', '1');
    if (showBookmarksOnly) params.set('bookmarks', '1');
    const qs = params.toString();
    return `${window.location.origin}${window.location.pathname}${qs ? '?' + qs : ''}`;
  }, [mode, selectedWeekId, selectedEvalId, methodFilter, searchQuery, compareMode, compareWeekId, previewTab, compactMode, showBookmarksOnly]);

  // ── Share View: Copy URL to Clipboard ──
  const handleShareView = useCallback(() => {
    const url = buildShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      toast('Link copied to clipboard', { description: 'Share this view with others' });
    }).catch(() => {
      toast('Failed to copy link', { description: 'Please copy the URL manually' });
    });
  }, [buildShareUrl]);

  // ── Share View: Apply URL Params on Mount ──
  useEffect(() => {
    if (urlParamsApplied.current) return;
    if (!searchParams) return;
    urlParamsApplied.current = true;

    const modeParam = searchParams.get('mode');
    const weekParam = searchParams.get('week');
    const evalParam = searchParams.get('eval');
    const methodParam = searchParams.get('method');
    const qParam = searchParams.get('q');
    const compareParam = searchParams.get('compare');
    const compareWeekParam = searchParams.get('compareWeek');
    const tabParam = searchParams.get('tab');
    const compactParam = searchParams.get('compact');
    const bookmarksParam = searchParams.get('bookmarks');

    if (modeParam === 'evaluation' || modeParam === 'weekly') setMode(modeParam);
    if (weekParam) setSelectedWeekId(weekParam);
    if (evalParam) setSelectedEvalId(evalParam);
    if (methodParam && methodParam !== 'all') setMethodFilter(methodParam);
    if (qParam) { setSearchQuery(qParam); setDebouncedSearch(qParam); }
    if (compareParam === '1') setCompareMode(true);
    if (compareWeekParam) setCompareWeekId(compareWeekParam);
    if (tabParam) setPreviewTab(tabParam);
    if (compactParam === '1') setCompactMode(true);
    if (bookmarksParam === '1') setShowBookmarksOnly(true);
  }, [searchParams]);

  const toggleBookmark = useCallback((pdbId: string) => {
    let wasAdded = false;
    setBookmarks(prev => {
      const next = new Set(prev);
      const wasBookmarked = next.has(pdbId);
      if (wasBookmarked) {
        next.delete(pdbId);
        toast(`Removed ${pdbId} from bookmarks`);
        wasAdded = false;
      } else {
        next.add(pdbId);
        toast(`Bookmarked ${pdbId}`, { description: 'Added to your bookmarked structures' });
        wasAdded = true;
      }
      return next;
    });
    // Use setTimeout to ensure addNotification reads the latest state
    setTimeout(() => {
      if (wasAdded) {
        addNotification('bookmark', `Bookmarked ${pdbId}`, 'Added to your bookmarked structures');
      } else {
        addNotification('bookmark', `Removed ${pdbId} from bookmarks`, 'Removed from your bookmarked structures');
      }
    }, 0);
  }, [addNotification]);

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

  // ── Page Load Animation ──
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHasLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // ── Tour State ──
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // ── Tour Refs ──
  const tourTitleRef = useRef<HTMLDivElement>(null);
  const tourSidebarRef = useRef<HTMLDivElement>(null);
  const tourModeSwitcherRef = useRef<HTMLDivElement>(null);
  const tourSearchRef = useRef<HTMLDivElement>(null);
  const tourPreviewRef = useRef<HTMLDivElement>(null);
  const tourShortcutsRef = useRef<HTMLButtonElement>(null);

  // ── Tour Auto-Start ──
  useEffect(() => {
    if (!mounted) return;
    try {
      const completed = localStorage.getItem('pdb-tour-completed');
      if (!completed) {
        const timer = setTimeout(() => { setTourActive(true); setTourStep(0); }, 1500);
        return () => clearTimeout(timer);
      }
    } catch { /* ignore */ }
  }, [mounted]);

  // ── Tour Completion ──
  const finishTour = useCallback(() => {
    setTourActive(false);
    setTourStep(0);
    try { localStorage.setItem('pdb-tour-completed', 'true'); } catch { /* ignore */ }
    toast('Tour complete!', { description: 'Explore the app and use ⌘K anytime to search.' });
  }, []);

  const startTour = useCallback(() => {
    setTourActive(true);
    setTourStep(0);
  }, []);

  // ── Tour: Ensure preview panel is open for step 5 ──
  useEffect(() => {
    if (tourActive && tourStep === 4 && !previewOpen) {
      setPreviewOpen(true);
    }
  }, [tourActive, tourStep, previewOpen]);

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
        return;
      }
      if (isMod && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchDropdownOpen(true);
      }
      if (isMod && e.key === 'e') {
        e.preventDefault();
        setMode(prev => prev === 'weekly' ? 'evaluation' : 'weekly');
      }
      if (isMod && e.key === 'b') {
        e.preventDefault();
        setShowBookmarksOnly(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (searchDropdownOpen) {
          setSearchDropdownOpen(false);
          setSearchHighlightIndex(-1);
        } else if (detailPanelOpen) {
          setDetailPanelOpen(false);
          setSelectedEntry(null);
        } else if (searchQuery) {
          setSearchQuery('');
          searchInputRef.current?.blur();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, searchDropdownOpen, commandPaletteOpen]);

  // ── Reset page on filter/sort change ──
  useEffect(() => { setCurrentPage(1); }, [selectedWeekId, methodFilter, debouncedSearch, sortField, sortDir, mode, selectedEvalId, resolutionRange, ifRange, selectedOrganisms, dateRange, qualityFilter]);

  // ── Notifications for week switching ──
  const prevWeekIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedWeekId && selectedWeekId !== prevWeekIdRef.current) {
      prevWeekIdRef.current = selectedWeekId;
      const snapshot = snapshots.find(s => s.weekId === selectedWeekId);
      if (snapshot) {
        addNotification('week', `Viewing Week ${selectedWeekId}`, `${snapshot.totalStructures} structures in this week`);
      }
    }
  }, [selectedWeekId, snapshots, addNotification]);

  // ── Notification for filter changes ──
  const prevFilterCountRef = useRef(0);
  useEffect(() => {
    const filterCount = activeAdvancedFilterCount + (methodFilter !== 'all' ? 1 : 0) + (debouncedSearch ? 1 : 0);
    if (filterCount > 0 && filterCount !== prevFilterCountRef.current) {
      prevFilterCountRef.current = filterCount;
      addNotification('filter', `Applied ${filterCount} filter${filterCount > 1 ? 's' : ''}`, 'Results updated with active filters');
    } else if (filterCount === 0) {
      prevFilterCountRef.current = 0;
    }
  }, [activeAdvancedFilterCount, methodFilter, debouncedSearch, addNotification]);

  // ── Notification for compare week selection ──
  useEffect(() => {
    if (compareMode && compareWeekId && selectedWeekId) {
      addNotification('compare', `Comparing ${selectedWeekId} vs ${compareWeekId}`, 'Side-by-side comparison view active');
    }
  }, [compareWeekId, compareMode, selectedWeekId, addNotification]);

  // ── Clear row selection on week/mode change ──
  useEffect(() => { setSelectedRows(new Set()); }, [selectedWeekId, mode]);

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

  // ── Compare Snapshot ──
  const compareSnapshot = useMemo(
    () => snapshots.find(s => s.weekId === compareWeekId) || null,
    [snapshots, compareWeekId]
  );

  // ── Fetch Compare Entries ──
  useEffect(() => {
    if (!compareMode || !compareWeekId) { setCompareEntries([]); return; }
    let cancelled = false;
    async function load() {
      try {
        const params = new URLSearchParams();
        params.set('week', compareWeekId);
        const res = await fetch(`/api/entries?${params}`);
        if (!cancelled) {
          const data = await res.json();
          setCompareEntries(data);
        }
      } catch (e) { console.error('Failed to fetch compare entries:', e); }
    }
    load();
    return () => { cancelled = true; };
  }, [compareMode, compareWeekId]);

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
    let source = entries;
    if (showBookmarksOnly) {
      source = entries.filter(e => bookmarks.has(e.pdbId));
    }
    // Apply advanced filters
    if (resolutionRange[0] !== 0 || resolutionRange[1] !== 5) {
      source = source.filter(e => {
        if (e.resolution === null || e.resolution === undefined) return false;
        return e.resolution >= resolutionRange[0] && e.resolution <= resolutionRange[1];
      });
    }
    if (ifRange[0] !== 0 || ifRange[1] !== 50) {
      source = source.filter(e => {
        if (e.journalIf === null || e.journalIf === undefined) return false;
        return e.journalIf >= ifRange[0] && e.journalIf <= ifRange[1];
      });
    }
    if (selectedOrganisms.size > 0) {
      source = source.filter(e => {
        if (!e.organisms) return false;
        const entryOrganisms = e.organisms.split('|').map(o => o.trim());
        return entryOrganisms.some(o => selectedOrganisms.has(o));
      });
    }
    if (dateRange.from) {
      source = source.filter(e => e.releaseDate >= dateRange.from);
    }
    if (dateRange.to) {
      source = source.filter(e => e.releaseDate <= dateRange.to);
    }
    if (qualityFilter !== 'all') {
      source = source.filter(e => {
        const qs = computeQualityScore(e);
        switch (qualityFilter) {
          case 'excellent': return qs.total >= 80;
          case 'good': return qs.total >= 60 && qs.total < 80;
          case 'fair': return qs.total >= 40 && qs.total < 60;
          case 'low': return qs.total < 40;
          default: return true;
        }
      });
    }
    if (!source.length) return [];
    const sorted = [...source].sort((a, b) => {
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
  }, [entries, sortField, sortDir, showBookmarksOnly, bookmarks, resolutionRange, ifRange, selectedOrganisms, dateRange, qualityFilter]);

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

  // ── Search Suggestions ──
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const suggestions: SearchSuggestionItem[] = [];
    const seen = new Set<string>();

    if (mode === 'weekly') {
      // PDB IDs (max 5)
      entries.forEach(e => {
        if (suggestions.filter(s => s.type === 'pdbId').length >= 5) return;
        if (e.pdbId.toLowerCase().includes(q) && !seen.has(`pdb-${e.pdbId}`)) {
          seen.add(`pdb-${e.pdbId}`);
          suggestions.push({ type: 'pdbId', text: e.pdbId });
        }
      });

      // Titles (max 3)
      entries.forEach(e => {
        if (suggestions.filter(s => s.type === 'title').length >= 3) return;
        if (e.title.toLowerCase().includes(q) && !seen.has(`title-${e.pdbId}`)) {
          seen.add(`title-${e.pdbId}`);
          suggestions.push({ type: 'title', text: e.title, subtitle: e.pdbId });
        }
      });

      // Organisms (max 3)
      entries.forEach(e => {
        if (suggestions.filter(s => s.type === 'organism').length >= 3) return;
        if (e.organisms) {
          e.organisms.split('|').forEach(o => {
            const trimmed = o.trim();
            if (trimmed.toLowerCase().includes(q) && !seen.has(`org-${trimmed}`)) {
              seen.add(`org-${trimmed}`);
              suggestions.push({ type: 'organism', text: trimmed });
            }
          });
        }
      });

      // Journals (max 2)
      entries.forEach(e => {
        if (suggestions.filter(s => s.type === 'journal').length >= 2) return;
        if (e.journal && e.journal.toLowerCase().includes(q) && !seen.has(`jnl-${e.journal}`)) {
          seen.add(`jnl-${e.journal}`);
          suggestions.push({ type: 'journal', text: e.journal });
        }
      });
    } else {
      // Evaluation mode suggestions
      evaluations.forEach(ev => {
        if (ev.uniprotId.toLowerCase().includes(q) && !seen.has(`uid-${ev.uniprotId}`)) {
          seen.add(`uid-${ev.uniprotId}`);
          suggestions.push({ type: 'pdbId', text: ev.uniprotId, subtitle: ev.proteinName || undefined });
        }
      });
      evaluations.forEach(ev => {
        if (suggestions.filter(s => s.type === 'title').length >= 3) return;
        if (ev.proteinName?.toLowerCase().includes(q) && !seen.has(`pn-${ev.uniprotId}`)) {
          seen.add(`pn-${ev.uniprotId}`);
          suggestions.push({ type: 'title', text: ev.proteinName, subtitle: ev.uniprotId });
        }
      });
      evaluations.forEach(ev => {
        if (suggestions.filter(s => s.type === 'organism').length >= 3) return;
        if (ev.organism?.toLowerCase().includes(q) && !seen.has(`org-${ev.organism}`)) {
          seen.add(`org-${ev.organism}`);
          suggestions.push({ type: 'organism', text: ev.organism! });
        }
      });
    }

    return suggestions;
  }, [searchQuery, mode, entries, evaluations]);

  // Total flattened suggestion count for keyboard navigation
  const totalSuggestionCount = useMemo(() => {
    if (!searchQuery.trim()) return searchHistory.length;
    return searchSuggestions.length;
  }, [searchQuery, searchSuggestions, searchHistory]);

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
    toast(`Exported ${sortedEntries.length} structures`, { description: 'Downloaded as CSV file' });
    addNotification('export', `Exported ${sortedEntries.length} structures as CSV`, 'Downloaded as CSV file');
  }, [sortedEntries, selectedWeekId, addNotification]);

  // ── Batch Row Operations ──
  const toggleRowSelection = useCallback((pdbId: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(pdbId)) next.delete(pdbId);
      else next.add(pdbId);
      return next;
    });
  }, []);

  const toggleAllPageRows = useCallback(() => {
    setSelectedRows(prev => {
      const pageIds = paginatedEntries.map(e => e.pdbId);
      const allSelected = pageIds.every(id => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach(id => next.delete(id));
      } else {
        pageIds.forEach(id => next.add(id));
      }
      return next;
    });
  }, [paginatedEntries]);

  const selectAllRows = useCallback(() => {
    setSelectedRows(new Set(sortedEntries.map(e => e.pdbId)));
  }, [sortedEntries]);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const batchBookmarkAll = useCallback(() => {
    setBookmarks(prev => {
      const next = new Set(prev);
      let addedCount = 0;
      selectedRows.forEach(id => {
        if (!next.has(id)) { next.add(id); addedCount++; }
      });
      toast(`Bookmarked ${addedCount} structures`, { description: `${addedCount} structure${addedCount !== 1 ? 's' : ''} added to bookmarks` });
      return next;
    });
  }, [selectedRows]);

  const batchRemoveBookmarks = useCallback(() => {
    setBookmarks(prev => {
      const next = new Set(prev);
      let removedCount = 0;
      selectedRows.forEach(id => {
        if (next.has(id)) { next.delete(id); removedCount++; }
      });
      toast(`Removed ${removedCount} bookmarks`, { description: `${removedCount} structure${removedCount !== 1 ? 's' : ''} removed from bookmarks` });
      return next;
    });
  }, [selectedRows]);

  const handleExportSelectedCsv = useCallback(() => {
    const selectedEntries = sortedEntries.filter(e => selectedRows.has(e.pdbId));
    if (!selectedEntries.length) return;
    const headers = ['PDB ID', 'Method', 'Resolution', 'IF', 'Organism', 'Title', 'Date', 'Ligands'];
    const escapeCsv = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };
    const rows = selectedEntries.map(entry => [
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
    a.download = `pdb-selected-${selectedWeekId || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${selectedEntries.length} structures`, { description: 'Downloaded as CSV file' });
  }, [sortedEntries, selectedRows, selectedWeekId]);

  const handleExportRowCsv = useCallback((entry: PdbEntry) => {
    const headers = ['PDB ID', 'Method', 'Resolution', 'IF', 'Organism', 'Title', 'Date', 'Ligands'];
    const escapeCsv = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };
    const rows = [[
      escapeCsv(entry.pdbId),
      escapeCsv(getMethodLabel(entry.method)),
      entry.resolution != null ? String(entry.resolution) : '',
      entry.journalIf != null ? String(entry.journalIf) : '',
      escapeCsv(entry.organisms || ''),
      escapeCsv(entry.title || ''),
      escapeCsv(entry.releaseDate || ''),
      escapeCsv(entry.ligands || ''),
    ].join(',')];
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdb-${entry.pdbId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${entry.pdbId}`, { description: 'Downloaded as CSV file' });
  }, []);

  const copyPdbId = useCallback((pdbId: string) => {
    navigator.clipboard.writeText(pdbId).then(() => {
      toast(`Copied ${pdbId} to clipboard`);
    }).catch(() => {
      toast('Failed to copy to clipboard');
    });
  }, []);

  // ── Selection state for current page ──
  const allPageSelected = paginatedEntries.length > 0 && paginatedEntries.every(e => selectedRows.has(e.pdbId));
  const somePageSelected = paginatedEntries.some(e => selectedRows.has(e.pdbId)) && !allPageSelected;

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
        <header className={`flex-shrink-0 h-[52px] flex items-center px-4 bg-white dark:bg-[#242220] border-b border-claude-border relative z-20 no-print ${hasLoaded ? 'animate-load-header' : 'opacity-0'}`}>
          {/* Gradient border at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-claude-accent/20 to-transparent bg-[length:200%_100%] animate-[gradient-shift_3s_ease-in-out_infinite]" />
          <div ref={tourTitleRef} className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-claude-accent-light">
              <Dna className="h-4.5 w-4.5 text-claude-accent" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-claude-text leading-tight header-title" style={{ letterSpacing: '-0.02em' }}>PDB Structure Tracker</h1>
              <p className="text-[10px] text-claude-text-muted leading-tight">Protein Data Bank Weekly Tracking & Evaluation System</p>
            </div>
          </div>

          {/* Command Palette Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150 claude-focus-ring btn-press"
                aria-label="Command palette"
              >
                <Terminal className="h-4 w-4 text-claude-text-secondary" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="text-[10px]">Command Palette <kbd className="ml-1 px-1 py-0.5 rounded text-[9px] font-mono bg-claude-border-light text-claude-text-muted border border-claude-border">⌘⇧P</kbd></span>
            </TooltipContent>
          </Tooltip>

          {/* Keyboard Shortcuts Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                ref={tourShortcutsRef}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150 claude-focus-ring btn-press"
                aria-label="Keyboard shortcuts"
              >
                <Keyboard className="h-4 w-4 text-claude-text-secondary" />
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-56 p-3">
              <div className="text-xs font-semibold text-claude-text mb-2">Keyboard Shortcuts</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-claude-text-secondary">Command palette</span>
                  <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-claude-border-light text-claude-text-muted border border-claude-border">
                    <span className="text-[9px]">⌘⇧</span>P
                  </kbd>
                </div>
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
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-claude-text-secondary">Toggle bookmarks</span>
                  <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-claude-border-light text-claude-text-muted border border-claude-border">
                    <span className="text-[9px]">⌘</span>B
                  </kbd>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Help / Restart Tour Button */}
          <button
            onClick={startTour}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150 claude-focus-ring btn-press"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4 text-claude-text-secondary" />
          </button>

          {/* Notification Center */}
          <Popover
            onOpenChange={(open) => {
              if (open) markAllNotificationsRead();
            }}
          >
            <PopoverTrigger asChild>
              <button
                className="relative inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150 claude-focus-ring btn-press"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-claude-text-secondary" />
                {unreadCount > 0 && (
                  <span className="h-2 w-2 rounded-full bg-red-500 absolute top-1 right-1" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 bg-white dark:bg-[#242220] border border-claude-border shadow-xl rounded-lg">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-claude-border">
                <span className="text-xs font-semibold text-claude-text">Notifications</span>
                <div className="flex items-center gap-1">
                  {notifications.length > 0 && (
                    <>
                      <button
                        onClick={markAllNotificationsRead}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-claude-text-muted hover:text-claude-text hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors"
                        title="Mark all as read"
                      >
                        <CheckCheck className="h-3 w-3" />
                      </button>
                      <button
                        onClick={clearAllNotifications}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-claude-text-muted hover:text-claude-text hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors"
                        title="Clear all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-claude-text-muted">
                    <Bell className="h-6 w-6 mb-2 opacity-30" />
                    <p className="text-[11px]">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const notifIconMap: Record<string, React.ReactNode> = {
                      week: <Calendar className="h-3.5 w-3.5 text-claude-accent" />,
                      bookmark: <Bookmark className="h-3.5 w-3.5 text-claude-accent" />,
                      export: <Download className="h-3.5 w-3.5 text-claude-accent" />,
                      filter: <SlidersHorizontal className="h-3.5 w-3.5 text-claude-accent" />,
                      compare: <GitCompareArrows className="h-3.5 w-3.5 text-claude-accent" />,
                    };
                    const timeAgo = (() => {
                      const diff = Date.now() - notif.timestamp.getTime();
                      if (diff < 60000) return 'just now';
                      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
                      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
                      return `${Math.floor(diff / 86400000)}d ago`;
                    })();
                    return (
                      <div
                        key={notif.id}
                        className={`p-2.5 rounded-lg hover:bg-claude-bg/50 dark:hover:bg-[#2b2926]/50 border-l-2 ${notif.read ? 'border-transparent' : 'border-claude-accent'} mx-1.5 my-0.5`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 mt-0.5">{notifIconMap[notif.icon] || <Info className="h-3.5 w-3.5 text-claude-text-muted" />}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-medium text-claude-text leading-tight">{notif.title}</div>
                            <div className="text-[10px] text-claude-text-secondary mt-0.5 leading-tight">{notif.description}</div>
                            <div className="text-[9px] text-claude-text-muted mt-1">{timeAgo}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Dark mode toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="ml-auto md:ml-auto inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150 claude-focus-ring btn-press"
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
            className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150 claude-focus-ring btn-press"
          >
            <Menu className="h-4.5 w-4.5 text-claude-text-secondary" />
          </button>

          {/* Mobile preview toggle */}
          <button
            onClick={() => setMobilePreviewOpen(true)}
            className="ml-1 md:hidden inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150 claude-focus-ring btn-press"
          >
            <BarChart3 className="h-4.5 w-4.5 text-claude-text-secondary" />
          </button>
        </header>

        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ═══════════ LEFT SIDEBAR ═══════════ */}
          {/* Desktop sidebar */}
          <aside className={`hidden md:flex flex-shrink-0 border-r border-claude-border bg-white dark:bg-[#242220] flex-col no-print sidebar-gradient relative ${hasLoaded ? 'animate-load-sidebar' : 'opacity-0'}`} style={{ width: sidebarWidth }}>
            {renderSidebar()}
            {/* Sidebar resize handle */}
            <div
              onMouseDown={handleSidebarMouseDown}
              className={`absolute top-0 right-0 bottom-0 w-1 hover:bg-claude-accent/30 transition-colors duration-150 cursor-col-resize z-10 ${resizingSidebar ? 'bg-claude-accent/50' : ''}`}
            />
          </aside>

          {/* Mobile sidebar overlay */}
          <Drawer
            direction="left"
            open={mobileSidebarOpen}
            onOpenChange={setMobileSidebarOpen}
          >
            <DrawerContent className="left-0 right-auto top-0 bottom-0 w-[280px] max-w-[85vw] h-full rounded-none border-r border-claude-border bg-white dark:bg-[#242220] mobile-drawer-shadow sidebar-gradient">
              <div className="mobile-drawer-handle" />
              <DrawerHeader className="p-3 border-b border-claude-border">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="text-xs font-semibold text-claude-text">Navigation</DrawerTitle>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>
              {renderSidebar()}
            </DrawerContent>
          </Drawer>

          {/* ═══════════ MAIN AREA ═══════════ */}
          <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${hasLoaded ? 'animate-load-main' : 'opacity-0'}`}>
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-claude-border bg-white/80 dark:bg-[#242220]/80 backdrop-blur-sm no-print">
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
                  <div ref={tourSearchRef} className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-claude-text-muted z-10" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search PDB ID, title, journal..."
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setSearchDropdownOpen(true); setSearchHighlightIndex(-1); }}
                      onFocus={() => setSearchDropdownOpen(true)}
                      onBlur={() => { setTimeout(() => { setSearchDropdownOpen(false); setSearchHighlightIndex(-1); }, 200); }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setSearchHighlightIndex(prev => Math.min(prev + 1, totalSuggestionCount - 1));
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setSearchHighlightIndex(prev => Math.max(prev - 1, -1));
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          if (searchHighlightIndex >= 0) {
                            if (searchQuery.trim()) {
                              const item = searchSuggestions[searchHighlightIndex];
                              if (item) {
                                setSearchQuery(item.text);
                                addToSearchHistory(item.text);
                                setSearchDropdownOpen(false);
                                setSearchHighlightIndex(-1);
                              }
                            } else {
                              const term = searchHistory[searchHighlightIndex];
                              if (term) {
                                setSearchQuery(term);
                                addToSearchHistory(term);
                                setSearchDropdownOpen(false);
                                setSearchHighlightIndex(-1);
                              }
                            }
                          } else {
                            addToSearchHistory(searchQuery);
                            setSearchDropdownOpen(false);
                          }
                        } else if (e.key === 'Escape') {
                          setSearchDropdownOpen(false);
                          setSearchHighlightIndex(-1);
                        }
                      }}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-claude-border bg-white dark:bg-[#1a1917] dark:text-[#e8e4dd] focus:outline-none focus:ring-2 focus:ring-claude-accent/40 focus:border-claude-accent/40 placeholder:text-claude-text-muted/60 input-focus-glow"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                        <X className="h-3 w-3 text-claude-text-muted hover:text-claude-text" />
                      </button>
                    )}
                    <SearchDropdown
                      isOpen={searchDropdownOpen}
                      searchQuery={searchQuery}
                      suggestions={searchSuggestions}
                      searchHistory={searchHistory}
                      highlightIndex={searchHighlightIndex}
                      onSelectSuggestion={(item) => {
                        setSearchQuery(item.text);
                        addToSearchHistory(item.text);
                        setSearchDropdownOpen(false);
                        setSearchHighlightIndex(-1);
                      }}
                      onSelectHistory={(term) => {
                        setSearchQuery(term);
                        addToSearchHistory(term);
                        setSearchDropdownOpen(false);
                        setSearchHighlightIndex(-1);
                      }}
                      onClearHistory={clearSearchHistory}
                    />
                  </div>

                  {/* Active Filter Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap no-print">
                    {/* Bookmark Filter Button */}
                    <button
                      onClick={() => {
                        const next = !showBookmarksOnly;
                        setShowBookmarksOnly(next);
                        toast(next ? 'Showing bookmarked only' : 'Showing all structures');
                      }}
                      className={`inline-flex items-center justify-center h-6 w-6 rounded-md transition-colors duration-200 ${
                        showBookmarksOnly
                          ? 'bg-claude-accent-light text-claude-accent border border-claude-accent/30'
                          : 'text-claude-text-muted/40 hover:text-claude-accent hover:bg-claude-accent-light/50 border border-transparent'
                      }`}
                      title="Show bookmarked only (⌘B)"
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                    </button>
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
                    {showBookmarksOnly && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light text-claude-accent border border-claude-accent/20">
                        Bookmarked
                        <button onClick={() => setShowBookmarksOnly(false)} className="hover:text-claude-accent/80 transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    )}
                    {selectedRows.size > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light text-claude-accent border border-claude-accent/20">
                        {selectedRows.size} selected
                        <button onClick={clearSelection} className="hover:text-claude-accent/80 transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    )}
                  </div>

                  {/* Count & Export */}
                  <span className="text-[10px] text-claude-text-muted ml-auto whitespace-nowrap">
                    {entries.length} structures
                  </span>

                  {/* Column Visibility Toggle */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium border border-claude-border bg-white dark:bg-[#242220] text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150 claude-focus-ring btn-press"
                      >
                        <Columns3 className="h-3 w-3" />
                        Columns
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel className="text-[10px] text-claude-text-muted">Toggle Columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={true}
                        disabled
                        className="text-xs"
                      >
                        PDB ID
                      </DropdownMenuCheckboxItem>
                      {[
                        { field: 'method', label: 'Method' },
                        { field: 'resolution', label: 'Resolution' },
                        { field: 'journalIf', label: 'IF (Impact Factor)' },
                        { field: 'organisms', label: 'Organism' },
                        { field: 'title', label: 'Title' },
                        { field: 'releaseDate', label: 'Date' },
                        { field: '_ligands', label: 'Ligands' },
                      ].map(col => (
                        <DropdownMenuCheckboxItem
                          key={col.field}
                          checked={!hiddenColumns.has(col.field)}
                          onCheckedChange={() => toggleColumnVisibility(col.field)}
                          className="text-xs"
                        >
                          {col.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Data Density Toggle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setCompactMode(!compactMode)}
                        className={`inline-flex items-center justify-center h-7 w-7 rounded-md text-[11px] font-medium border transition-colors duration-150 claude-focus-ring ${
                          compactMode
                            ? 'border-claude-accent bg-claude-accent-light text-claude-accent'
                            : 'border-claude-border bg-white dark:bg-[#242220] text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-[#3d3832]'
                        }`}
                        aria-label={compactMode ? 'Switch to comfortable mode' : 'Switch to compact mode'}
                      >
                        {compactMode ? <AlignJustify className="h-3 w-3" /> : <AlignVerticalSpaceAround className="h-3 w-3" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <span className="text-[10px]">{compactMode ? 'Compact mode' : 'Comfortable mode'}</span>
                    </TooltipContent>
                  </Tooltip>

                  {sortedEntries.length > 0 && (
                    <button
                      onClick={handleExportCsv}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium border border-claude-border bg-white dark:bg-[#242220] text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150 claude-focus-ring btn-press"
                    >
                      <Download className="h-3 w-3" />
                      Export
                    </button>
                  )}

                  {/* Print Button */}
                  {sortedEntries.length > 0 && (
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium border border-claude-border bg-white dark:bg-[#242220] text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150 claude-focus-ring btn-press no-print"
                    >
                      <Printer className="h-3 w-3" />
                      Print
                    </button>
                  )}

                  {/* Share View Button */}
                  <button
                    onClick={handleShareView}
                    className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium border border-claude-border bg-white dark:bg-[#242220] text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150 claude-focus-ring btn-press no-print"
                  >
                    <Share2 className="h-3 w-3" />
                    Share
                  </button>

                  {/* Compare Button */}
                  <button
                    onClick={() => {
                      if (compareMode) { setCompareMode(false); setCompareWeekId(null); }
                      else {
                        setCompareMode(true);
                        if (selectedWeekId) {
                          addNotification('compare', `Compare mode activated`, `Select a week to compare with ${selectedWeekId}`);
                        }
                      }
                    }}
                    className={`inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium border transition-colors duration-150 claude-focus-ring ${
                      compareMode
                        ? 'border-claude-accent bg-claude-accent-light text-claude-accent'
                        : 'border-claude-border bg-white dark:bg-[#242220] text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-[#3d3832]'
                    }`}
                  >
                    <GitCompareArrows className="h-3 w-3" />
                    Compare
                  </button>

                  {/* Advanced Filters Button */}
                  <button
                    onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
                    className={`inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium border transition-colors duration-150 relative claude-focus-ring ${
                      advancedFiltersOpen || activeAdvancedFilterCount > 0
                        ? 'border-claude-accent bg-claude-accent-light text-claude-accent'
                        : 'border-claude-border bg-white dark:bg-[#242220] text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-[#3d3832]'
                    }`}
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    Filters
                    {activeAdvancedFilterCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[14px] h-[14px] px-[3px] rounded-full text-[8px] font-bold bg-claude-accent text-white leading-none">
                        {activeAdvancedFilterCount}
                      </span>
                    )}
                  </button>

                  {/* Compare Week Selector */}
                  {compareMode && (
                    <Select value={compareWeekId || ''} onValueChange={setCompareWeekId}>
                      <SelectTrigger className="w-[140px] h-7 text-[11px]">
                        <SelectValue placeholder="Compare with..." />
                      </SelectTrigger>
                      <SelectContent>
                        {snapshots
                          .filter(s => s.weekId !== selectedWeekId)
                          .map(s => (
                            <SelectItem key={s.weekId} value={s.weekId}>
                              <span className="font-mono">{s.weekId}</span>
                              <span className="text-claude-text-muted ml-2">({s.totalStructures})</span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
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

            {/* Advanced Filter Panel */}
            {mode === 'weekly' && (
              <AnimatePresence initial={false}>
                {advancedFiltersOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden no-print"
                  >
                    <div className="bg-white dark:bg-[#242220] border-b border-claude-border p-4">
                      {/* Panel Header - Active Filter Chips + Clear All */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-claude-text-secondary">Active Filters</span>
                          {/* Active filter chips */}
                          {(resolutionRange[0] !== 0 || resolutionRange[1] !== 5) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light text-claude-accent border border-claude-accent/20">
                              {resolutionRange[0].toFixed(1)}Å — {resolutionRange[1].toFixed(1)}Å
                              <button onClick={() => setResolutionRange([0, 5])} className="hover:text-claude-accent/80 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          )}
                          {(ifRange[0] !== 0 || ifRange[1] !== 50) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light text-claude-accent border border-claude-accent/20">
                              IF: {ifRange[0].toFixed(1)} — {ifRange[1].toFixed(1)}
                              <button onClick={() => setIfRange([0, 50])} className="hover:text-claude-accent/80 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          )}
                          {selectedOrganisms.size > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light text-claude-accent border border-claude-accent/20">
                              {selectedOrganisms.size} organism{selectedOrganisms.size > 1 ? 's' : ''}
                              <button onClick={() => setSelectedOrganisms(new Set())} className="hover:text-claude-accent/80 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          )}
                          {dateRange.from && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light text-claude-accent border border-claude-accent/20">
                              From: {dateRange.from}
                              <button onClick={() => setDateRange(prev => ({ ...prev, from: '' }))} className="hover:text-claude-accent/80 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          )}
                          {dateRange.to && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light text-claude-accent border border-claude-accent/20">
                              To: {dateRange.to}
                              <button onClick={() => setDateRange(prev => ({ ...prev, to: '' }))} className="hover:text-claude-accent/80 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          )}
                          {qualityFilter !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light text-claude-accent border border-claude-accent/20">
                              Quality: {qualityFilter === 'excellent' ? 'Excellent' : qualityFilter === 'good' ? 'Good' : qualityFilter === 'fair' ? 'Fair' : 'Low'}
                              <button onClick={() => setQualityFilter('all')} className="hover:text-claude-accent/80 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          )}
                          {activeAdvancedFilterCount === 0 && (
                            <span className="text-[10px] text-claude-text-muted">No filters active</span>
                          )}
                        </div>
                        {activeAdvancedFilterCount > 0 && (
                          <button
                            onClick={clearAdvancedFilters}
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-claude-accent hover:text-claude-accent/80 transition-colors"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Filter Groups */}
                      <div className="flex flex-wrap gap-6">
                        {/* Resolution Range */}
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <label className="text-xs font-semibold text-claude-text-secondary">
                            Resolution Range
                            <span className="ml-2 text-[10px] font-mono text-claude-accent">
                              {resolutionRange[0].toFixed(1)}Å — {resolutionRange[1].toFixed(1)}Å
                            </span>
                          </label>
                          <Slider
                            min={0}
                            max={5}
                            step={0.1}
                            value={resolutionRange}
                            onValueChange={(val) => setResolutionRange([val[0], val[1]])}
                            className="w-full [&_[data-slot=slider-range]]:bg-[#c96442] [&_[data-slot=slider-thumb]]:border-[#c96442] [&_[data-slot=slider-thumb]]:hover:ring-[#c96442]/20 [&_[data-slot=slider-thumb]]:focus-visible:ring-[#c96442]/20"
                          />
                          <div className="flex justify-between text-[9px] text-claude-text-muted">
                            <span>0Å</span>
                            <span>5Å</span>
                          </div>
                        </div>

                        {/* Impact Factor Range */}
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <label className="text-xs font-semibold text-claude-text-secondary">
                            Impact Factor Range
                            <span className="ml-2 text-[10px] font-mono text-claude-accent">
                              IF: {ifRange[0].toFixed(1)} — {ifRange[1].toFixed(1)}
                            </span>
                          </label>
                          <Slider
                            min={0}
                            max={50}
                            step={0.1}
                            value={ifRange}
                            onValueChange={(val) => setIfRange([val[0], val[1]])}
                            className="w-full [&_[data-slot=slider-range]]:bg-[#c96442] [&_[data-slot=slider-thumb]]:border-[#c96442] [&_[data-slot=slider-thumb]]:hover:ring-[#c96442]/20 [&_[data-slot=slider-thumb]]:focus-visible:ring-[#c96442]/20"
                          />
                          <div className="flex justify-between text-[9px] text-claude-text-muted">
                            <span>0</span>
                            <span>50</span>
                          </div>
                        </div>

                        {/* Organism Multi-Select */}
                        <div className="flex flex-col gap-2 min-w-[200px] max-w-[300px]">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-claude-text-secondary">
                              Organisms
                              {selectedOrganisms.size > 0 && (
                                <span className="ml-1.5 inline-flex items-center justify-center min-w-[14px] h-[14px] px-[3px] rounded-full text-[8px] font-bold bg-claude-accent text-white leading-none">
                                  {selectedOrganisms.size}
                                </span>
                              )}
                            </label>
                            <button
                              onClick={toggleAllOrganisms}
                              className="text-[9px] font-medium text-claude-accent hover:text-claude-accent/80 transition-colors"
                            >
                              {selectedOrganisms.size === organismOptions.length ? 'Clear' : 'Select All'}
                            </button>
                          </div>
                          <div className="max-h-32 overflow-y-auto custom-scrollbar sidebar-scroll space-y-1 pr-1">
                            {organismOptions.length > 0 ? organismOptions.map(opt => (
                              <label
                                key={opt.name}
                                className="flex items-center gap-2 text-xs text-claude-text-secondary hover:text-claude-text cursor-pointer py-0.5"
                              >
                                <Checkbox
                                  checked={selectedOrganisms.has(opt.name)}
                                  onCheckedChange={() => toggleOrganism(opt.name)}
                                  className="h-3.5 w-3.5 data-[state=checked]:bg-[#c96442] data-[state=checked]:border-[#c96442]"
                                />
                                <span className="truncate flex-1">{opt.name}</span>
                                <span className="text-[9px] text-claude-text-muted flex-shrink-0">({opt.count})</span>
                              </label>
                            )) : (
                              <span className="text-[10px] text-claude-text-muted italic">No organisms in current data</span>
                            )}
                          </div>
                        </div>

                        {/* Date Range */}
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <label className="text-xs font-semibold text-claude-text-secondary">Date Range</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={dateRange.from}
                              onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                              className="flex-1 px-2 py-1.5 text-xs rounded-md border border-claude-border bg-white dark:bg-[#1a1917] dark:text-[#e8e4dd] focus:outline-none focus:ring-1 focus:ring-claude-accent/40 focus:border-claude-accent/40 [color-scheme:light] dark:[color-scheme:dark]"
                              placeholder="From"
                            />
                            <span className="text-[10px] text-claude-text-muted">—</span>
                            <input
                              type="date"
                              value={dateRange.to}
                              onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                              className="flex-1 px-2 py-1.5 text-xs rounded-md border border-claude-border bg-white dark:bg-[#1a1917] dark:text-[#e8e4dd] focus:outline-none focus:ring-1 focus:ring-claude-accent/40 focus:border-claude-accent/40 [color-scheme:light] dark:[color-scheme:dark]"
                              placeholder="To"
                            />
                          </div>
                          {(dateRange.from || dateRange.to) && (
                            <span className="text-[9px] text-claude-text-muted">
                              {dateRange.from || '...'} → {dateRange.to || '...'}
                            </span>
                          )}
                        </div>

                        {/* Quality Filter */}
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <label className="text-xs font-semibold text-claude-text-secondary">Quality Score</label>
                          <Select value={qualityFilter} onValueChange={setQualityFilter}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="All qualities" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Qualities</SelectItem>
                              <SelectItem value="excellent">
                                <span className="flex items-center gap-1.5">
                                  <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                                  Excellent (≥80)
                                </span>
                              </SelectItem>
                              <SelectItem value="good">
                                <span className="flex items-center gap-1.5">
                                  <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: '#14b8a6' }} />
                                  Good (60–79)
                                </span>
                              </SelectItem>
                              <SelectItem value="fair">
                                <span className="flex items-center gap-1.5">
                                  <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                                  Fair (40–59)
                                </span>
                              </SelectItem>
                              <SelectItem value="low">
                                <span className="flex items-center gap-1.5">
                                  <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                                  Low (&lt;40)
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Weekly Stat Cards */}
            {mode === 'weekly' && entries.length > 0 && !loadingEntries && (
              <WeeklyStatCards entries={entries} snapshots={snapshots} selectedSnapshot={selectedSnapshot} />
            )}

            {/* Print-only header */}
            <div className="hidden print:block print-header">
              <h1>PDB Structure Tracker</h1>
              <p>
                {mode === 'weekly' && selectedSnapshot
                  ? `Week: ${selectedSnapshot.weekId} (${formatDate(selectedSnapshot.weekStart)} — ${formatDate(selectedSnapshot.weekEnd)}) • ${sortedEntries.length} structures`
                  : mode === 'evaluation' && selectedEval
                  ? `${selectedEval.proteinName || selectedEval.uniprotId} (${selectedEval.uniprotId})`
                  : 'PDB Structure Report'
                }
                {' • '}Report generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Data Table */}
            <div className="flex-1 overflow-auto custom-scrollbar preview-scroll">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${mode}-${selectedWeekId || 'no-week'}-${selectedEvalId || 'no-eval'}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
              {mode === 'weekly' ? (
                loadingEntries ? (
                  <table className={`w-full text-xs ${compactMode ? 'compact-table' : ''}`}>
                    <thead className="sticky top-0 z-10 border-b border-claude-border">
                      <tr className="bg-[#faf8f5] dark:bg-[#1a1917]">
                        {[
                          { h: '', field: '' },
                          { h: '', field: '' },
                          { h: 'PDB ID', field: 'pdbId' },
                          { h: 'Method', field: 'method' },
                          { h: 'Resolution', field: 'resolution' },
                          { h: 'IF', field: 'journalIf' },
                          { h: 'Organism', field: 'organisms' },
                          { h: 'Title', field: 'title' },
                          { h: 'Date', field: 'releaseDate' },
                          { h: 'Ligands', field: '_ligands' },
                        ].filter(c => !c.field || !hiddenColumns.has(c.field)).map((c, ci) => (
                          <th key={`skel-h-${ci}-${c.h || 'empty'}-${c.field || ''}`} className="px-3 py-3 text-left text-[11px] font-semibold text-claude-text-muted uppercase tracking-wide">
                            {c.h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <TableSkeleton rows={8} cols={3 + [
                        'pdbId','method','resolution','journalIf','organisms','title','releaseDate','_ligands'
                      ].filter(f => !hiddenColumns.has(f)).length} />
                    </tbody>
                  </table>
                ) : sortedEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-claude-text-muted relative">
                    <div className="absolute inset-0 empty-state-pattern opacity-40" />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-claude-border-light/60 dark:bg-[#2b2926] flex items-center justify-center mb-4">
                        <Database className="h-8 w-8 opacity-30 animate-float" />
                      </div>
                      <p className="text-sm font-medium text-claude-text">No structures found</p>
                      <p className="text-xs mt-1 text-claude-text-muted max-w-[200px] text-center">Try adjusting filters or selecting a different week</p>
                      {(methodFilter !== 'all' || searchQuery || showBookmarksOnly || activeAdvancedFilterCount > 0) && (
                        <button
                          onClick={() => { setMethodFilter('all'); setSearchQuery(''); setShowBookmarksOnly(false); clearAdvancedFilters(); }}
                          className="mt-3 px-3 py-1.5 rounded-md text-xs font-medium bg-claude-accent text-white hover:bg-claude-accent-hover transition-colors btn-press"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <table className={`w-full text-xs ${compactMode ? 'compact-table' : ''}`}>
                    <thead className="sticky top-0 z-10 border-b border-claude-border">
                      <tr className="bg-[#faf8f5] dark:bg-[#1a1917]">
                        <th className="px-1.5 py-3.5 w-[32px] table-header-cell">
                          <button
                            onClick={toggleAllPageRows}
                            className={`inline-flex items-center justify-center h-3.5 w-3.5 rounded border transition-colors duration-150 ${
                              allPageSelected
                                ? 'bg-claude-accent border-claude-accent'
                                : somePageSelected
                                  ? 'bg-claude-accent border-claude-accent'
                                  : 'border-claude-border-light bg-white dark:bg-[#242220] hover:border-claude-text-muted/40'
                            }`}
                            title={allPageSelected ? 'Deselect all on page' : 'Select all on page'}
                          >
                            {allPageSelected && <Check className="h-2.5 w-2.5 text-white" />}
                            {somePageSelected && <Minus className="h-2.5 w-2.5 text-white" />}
                          </button>
                        </th>
                        {[
                          { field: 'pdbId', label: 'PDB ID', w: 'w-[90px]' },
                          { field: 'method', label: 'Method', w: 'w-[90px]' },
                          { field: 'resolution', label: 'Resolution', w: 'w-[80px]' },
                          { field: 'journalIf', label: 'IF', w: 'w-[55px]' },
                          { field: 'organisms', label: 'Organism', w: 'w-[130px]' },
                          { field: 'title', label: 'Title', w: '' },
                          { field: 'releaseDate', label: 'Date', w: 'w-[95px]' },
                          { field: '_ligands', label: 'Ligands', w: 'w-[130px]' },
                        ].filter(col => !hiddenColumns.has(col.field)).map(col => (
                          <th
                            key={col.field}
                            onClick={() => col.field !== '_ligands' && handleSort(col.field)}
                            className={`px-3 py-3.5 text-left text-[11px] font-semibold text-claude-text-muted uppercase tracking-wide transition-colors duration-200 table-header-cell ${sortField === col.field ? 'sort-active' : ''} ${col.w} ${col.field !== '_ligands' ? 'sortable-header hover:text-claude-text-secondary' : ''}`}
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
                        const isSelected = selectedRows.has(entry.pdbId);

                        return (
                          <ContextMenu key={entry.pdbId}>
                            <ContextMenuTrigger asChild>
                              <motion.tr
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.15, delay: Math.min(idx, 10) * 0.02 }}
                                className={`table-row-hover-enhanced ${idx % 2 === 0 ? 'table-row-even' : 'table-row-odd'} border-b border-claude-border-light hover:shadow-md cursor-pointer group ${highlightedEntry === entry.pdbId ? 'ring-1 ring-claude-accent/30 ring-inset shadow-[0_0_8px_rgba(196,100,74,0.15)]' : ''} ${isSelected ? 'bg-claude-accent/5 dark:bg-[#d4784f]/5' : ''}`}
                                onClick={() => { setSelectedEntry(entry); setDetailPanelOpen(true); }}
                              >
                                <td className="px-1.5 py-2 w-[32px]" onClick={(e) => e.stopPropagation()}>
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => toggleRowSelection(entry.pdbId)}
                                    className="h-3.5 w-3.5 rounded border-claude-border-light data-[state=checked]:bg-claude-accent data-[state=checked]:border-claude-accent"
                                  />
                                </td>
                                <td className="px-1.5 py-2 w-[28px]" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleBookmark(entry.pdbId); }}
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded transition-colors duration-200 ${
                                      bookmarks.has(entry.pdbId)
                                        ? 'text-claude-accent'
                                        : 'text-claude-text-muted/0 group-hover:text-claude-text-muted/40 hover:!text-claude-accent'
                                    }`}
                                    title={bookmarks.has(entry.pdbId) ? 'Remove bookmark' : 'Add bookmark'}
                                  >
                                    {bookmarks.has(entry.pdbId)
                                      ? <BookmarkCheck className="h-3.5 w-3.5" />
                                      : <Bookmark className="h-3.5 w-3.5" />
                                    }
                                  </button>
                                </td>
                            <td className="px-3 py-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={`https://www.rcsb.org/structure/${entry.pdbId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono font-semibold text-claude-accent pdb-link external-link-hover link-animated inline-flex items-center gap-0.5"
                                  >
                                    {entry.pdbId}
                                    <span
                                      className="inline-flex h-2 w-2 rounded-full ml-1 flex-shrink-0"
                                      style={{ backgroundColor: computeQualityScore(entry).color }}
                                      title={`${computeQualityScore(entry).label} (${computeQualityScore(entry).total})`}
                                    />
                                    <ExternalLink className="h-2.5 w-2.5 opacity-50 ext-arrow" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="p-0 border border-claude-border shadow-lg data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=delayed-open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-150">
                                  <PdbTooltipContent entry={entry} />
                                </TooltipContent>
                              </Tooltip>
                            </td>
                            {!hiddenColumns.has('method') && (
                            <td className="px-3 py-2">
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${mc.bg} ${mc.text} method-badge ${entry.method?.toUpperCase().includes('CRYO') || entry.method?.toUpperCase().includes('ELECTRON MICROSCOPY') ? 'method-badge-cryoem' : entry.method?.toUpperCase().includes('X-RAY') || entry.method?.toUpperCase().includes('XRAY') ? 'method-badge-xray' : entry.method?.toUpperCase().includes('NMR') ? 'method-badge-nmr' : 'method-badge-other'}`}>
                              {getMethodLabel(entry.method)}
                            </span>
                            </td>
                            )}
                            {!hiddenColumns.has('resolution') && (
                            <td className="px-3 py-2 font-mono">
                              {entry.resolution != null ? (
                                <span className={`font-medium ${getResolutionColor(entry.resolution)}`}>
                                  {entry.resolution.toFixed(2)}Å
                                </span>
                              ) : (
                                <span className="text-claude-text-muted">—</span>
                              )}
                            </td>
                            )}
                            {!hiddenColumns.has('journalIf') && (
                            <td className="px-3 py-2">
                              {entry.journalIf != null ? (
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${ifStyle.bg} ${ifStyle.text}`}>
                                  {entry.journalIf.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-claude-text-muted">—</span>
                              )}
                            </td>
                            )}
                            {!hiddenColumns.has('organisms') && (
                            <td className="px-3 py-2" title={entry.organisms ? entry.organisms.replace(/\|/g, ', ') : undefined}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-claude-text-secondary text-[11px] line-clamp-1 cursor-default italic">
                                    {truncateOrganism(entry.organisms)}
                                  </span>
                                </TooltipTrigger>
                                {entry.organisms && (
                                  <TooltipContent side="top" className="max-w-64 bg-[#2b2926] text-white text-[11px] rounded px-2 py-1 border-0 shadow-lg data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=delayed-open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-150">
                                    <p className="text-xs">{entry.organisms.replace(/\|/g, ', ')}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </td>
                            )}
                            {!hiddenColumns.has('title') && (
                            <td className="px-3 py-2 max-w-xs" title={entry.title}>
                              <span className="text-claude-text-secondary line-clamp-2 leading-relaxed">{entry.title}</span>
                            </td>
                            )}
                            {!hiddenColumns.has('releaseDate') && (
                            <td className="px-3 py-2 text-claude-text-muted whitespace-nowrap">{formatDate(entry.releaseDate)}</td>
                            )}
                            {!hiddenColumns.has('_ligands') && (
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
                            )}
                          </motion.tr>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-52 bg-white dark:bg-[#242220] border border-claude-border shadow-xl rounded-lg p-1">
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                                onClick={() => { setSelectedEntry(entry); setDetailPanelOpen(true); }}
                              >
                                <Eye className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                                View Details
                              </ContextMenuItem>
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                                onClick={() => toggleBookmark(entry.pdbId)}
                              >
                                {bookmarks.has(entry.pdbId)
                                  ? <><BookmarkMinus className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />Remove Bookmark</>
                                  : <><BookmarkPlus className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />Bookmark</>
                                }
                              </ContextMenuItem>
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                                onClick={() => copyPdbId(entry.pdbId)}
                              >
                                <Copy className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                                Copy PDB ID
                              </ContextMenuItem>
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                                onClick={() => window.open(`https://www.rcsb.org/structure/${entry.pdbId}`, '_blank')}
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                                Open in RCSB PDB
                              </ContextMenuItem>
                              <ContextMenuSeparator className="bg-claude-border-light my-1" />
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                                onClick={() => handleExportRowCsv(entry)}
                              >
                                <Download className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                                Export Row
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        );
                      })}
                    </tbody>
                  </table>
                )
              ) : (
                /* Evaluation Table */
                !selectedEval ? (
                  <div className="flex flex-col items-center justify-center py-20 text-claude-text-muted relative">
                    <div className="absolute inset-0 empty-state-pattern opacity-40" />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-claude-border-light/60 dark:bg-[#2b2926] flex items-center justify-center mb-4">
                        <Microscope className="h-8 w-8 opacity-30 animate-float" />
                      </div>
                      <p className="text-sm font-medium text-claude-text">Select a protein evaluation</p>
                      <p className="text-xs mt-1 text-claude-text-muted max-w-[220px] text-center">Choose from the sidebar to view structures and BLAST results</p>
                    </div>
                  </div>
                ) : loadingEvalDetail ? (
                  <table className={`w-full text-xs ${compactMode ? 'compact-table' : ''}`}>
                    <thead className="sticky top-0 z-10 border-b border-claude-border">
                      <tr className="bg-[#faf8f5] dark:bg-[#1a1917]">
                        {[
                          { h: 'PDB ID', field: 'pdbId' },
                          { h: 'Type', field: '_type' },
                          { h: 'Method', field: 'method' },
                          { h: 'Resolution', field: 'resolution' },
                          { h: 'IF', field: 'journalIf' },
                          { h: 'Title / Description', field: 'title' },
                          { h: 'Date', field: 'releaseDate' },
                        ].filter(c => !hiddenColumns.has(c.field)).map(c => (
                          <th key={c.h} className="px-3 py-3 text-left text-[11px] font-semibold text-claude-text-muted uppercase tracking-wide">
                            {c.h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <TableSkeleton rows={5} cols={[
                        'pdbId','_type','method','resolution','journalIf','title','releaseDate'
                      ].filter(f => !hiddenColumns.has(f)).length} />
                    </tbody>
                  </table>
                ) : (
                  <table className={`w-full text-xs ${compactMode ? 'compact-table' : ''}`}>
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
                        ].filter(col => !hiddenColumns.has(col.field)).map(col => (
                          <th
                            key={col.field}
                            onClick={() => !['_type', '_ligands'].includes(col.field) && handleSort(col.field)}
                            className={`px-3 py-3.5 text-left text-[11px] font-semibold text-claude-text-muted uppercase tracking-wide transition-colors duration-200 table-header-cell ${sortField === col.field && !['_type', '_ligands'].includes(col.field) ? 'sort-active' : ''} ${col.w} ${!['_type', '_ligands'].includes(col.field) ? 'sortable-header hover:text-claude-text-secondary' : ''}`}
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
                          <tr key={`${row._type}-${row.pdbId || idx}`} className={`table-row-hover-enhanced border-b border-claude-border-light ${idx % 2 === 0 ? 'table-row-even' : 'table-row-odd'} ${isBlast ? 'bg-claude-border-light/30' : ''}`}>
                            <td className="px-3 py-2">
                              {row.pdbId ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <a
                                      href={`https://www.rcsb.org/structure/${row.pdbId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-mono font-semibold text-claude-accent pdb-link external-link-hover link-animated inline-flex items-center gap-0.5"
                                    >
                                      {row.pdbId}
                                      <ExternalLink className="h-2.5 w-2.5 opacity-50 ext-arrow" />
                                    </a>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="p-0 border border-claude-border shadow-lg data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=delayed-open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-150">
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
                            {!hiddenColumns.has('_type') && (
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
                            )}
                            {!hiddenColumns.has('method') && (
                            <td className="px-3 py-2">
                              {row.method ? (
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${mc.bg} ${mc.text} method-badge ${row.method?.toUpperCase().includes('CRYO') || row.method?.toUpperCase().includes('ELECTRON MICROSCOPY') ? 'method-badge-cryoem' : row.method?.toUpperCase().includes('X-RAY') || row.method?.toUpperCase().includes('XRAY') ? 'method-badge-xray' : row.method?.toUpperCase().includes('NMR') ? 'method-badge-nmr' : 'method-badge-other'}`}>
                                  {getMethodLabel(row.method)}
                                </span>
                              ) : <span className="text-claude-text-muted">—</span>}
                            </td>
                            )}
                            {!hiddenColumns.has('resolution') && (
                            <td className="px-3 py-2 font-mono">
                              {row.resolution != null ? (
                                <span className={`font-medium ${getResolutionColor(row.resolution)}`}>
                                  {row.resolution.toFixed(2)}Å
                                </span>
                              ) : <span className="text-claude-text-muted">—</span>}
                            </td>
                            )}
                            {!hiddenColumns.has('journalIf') && (
                            <td className="px-3 py-2">
                              {'journalIf' in row && row.journalIf != null ? (
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${ifStyle.bg} ${ifStyle.text}`}>
                                  {row.journalIf.toFixed(1)}
                                </span>
                              ) : <span className="text-claude-text-muted">—</span>}
                            </td>
                            )}
                            {!hiddenColumns.has('title') && (
                            <td className="px-3 py-2 max-w-xs">
                              <span className="text-claude-text-secondary line-clamp-2 leading-relaxed">
                                {row.title || (blastResult?.description) || '—'}
                              </span>
                            </td>
                            )}
                            {!hiddenColumns.has('releaseDate') && (
                            <td className="px-3 py-2 text-claude-text-muted whitespace-nowrap">{formatDate(row.releaseDate)}</td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {mode === 'weekly' && sortedEntries.length > PAGE_SIZE && (
              <div className="no-print">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  totalItems={sortedEntries.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
            {mode === 'evaluation' && selectedEval && sortedEvalRows.length > PAGE_SIZE && (
              <div className="no-print">
                <Pagination
                  page={currentPage}
                  totalPages={totalEvalPages}
                  totalItems={sortedEvalRows.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>

          {/* ═══════════ PREVIEW PANEL (Desktop) ═══════════ */}
          <AnimatePresence>
            {previewOpen && (
              <motion.aside
                ref={tourPreviewRef as React.RefObject<HTMLElement>}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: previewWidth, opacity: hasLoaded ? 1 : 0 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, delay: hasLoaded ? 0 : 0.3 }}
                className={`hidden md:flex flex-shrink-0 bg-white/80 dark:bg-[#242220]/80 backdrop-blur-xl overflow-hidden no-print glassmorphism-panel preview-gradient-border relative ${hasLoaded ? 'animate-load-preview' : ''}`}
              >
                {/* Preview panel resize handle */}
                <div
                  onMouseDown={handlePreviewMouseDown}
                  className={`absolute top-0 left-0 bottom-0 w-1 hover:bg-claude-accent/30 transition-colors duration-150 cursor-col-resize z-10 ${resizingPreview ? 'bg-claude-accent/50' : ''}`}
                />
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
                  className="fixed right-0 top-0 bottom-0 z-50 w-[85vw] max-w-[400px] bg-white/80 dark:bg-[#242220]/80 backdrop-blur-xl border-l border-claude-border flex flex-col md:hidden no-print glassmorphism-panel"
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

        {/* ═══════════ STATUS BAR (VS Code-style) ═══════════ */}
        <footer className="flex-shrink-0 h-6 flex items-center border-t border-claude-border bg-[#f5f0eb] dark:bg-[#1a1917] text-[10px] text-claude-text-muted relative no-print select-none">
          {/* Animated gradient line at top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-claude-accent/40 to-transparent bg-[length:200%_100%] animate-[status-bar-gradient_4s_ease-in-out_infinite]" />

          {/* Left section */}
          <div className="flex items-center h-full">
            <span className="inline-flex items-center gap-1 px-2 border-r border-claude-border/50">
              {mode === 'weekly' ? <Database className="h-3 w-3 text-claude-accent" /> : <Microscope className="h-3 w-3 text-claude-accent" />}
              <span className="font-medium text-claude-text-secondary">{mode === 'weekly' ? 'Weekly' : 'Evaluation'}</span>
            </span>
            {mode === 'weekly' && selectedWeekId && (
              <span className="inline-flex items-center gap-1 px-2 border-r border-claude-border/50">
                <Calendar className="h-3 w-3" />
                <span className="font-mono">{selectedWeekId}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 border-r border-claude-border/50">
              <Activity className="h-3 w-3" />
              <span>{mode === 'weekly' ? entries.length : evaluations.length} items</span>
            </span>
          </div>

          {/* Center section */}
          <div className="flex-1 flex items-center justify-center h-full">
            {(methodFilter !== 'all' || searchQuery || showBookmarksOnly || activeAdvancedFilterCount > 0) && (
              <span className="inline-flex items-center gap-1 px-2">
                <SlidersHorizontal className="h-3 w-3" />
                Filters: {[methodFilter !== 'all' ? 1 : 0, searchQuery ? 1 : 0, showBookmarksOnly ? 1 : 0, activeAdvancedFilterCount].reduce((a, b) => a + b, 0)} active
              </span>
            )}
            {sortField && (
              <span className="inline-flex items-center gap-1 px-2 border-l border-claude-border/50">
                <ArrowUpDown className="h-3 w-3" />
                Sort: {sortField} {sortDir === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center h-full">
            <span className="inline-flex items-center gap-1.5 px-2 border-l border-claude-border/50">
              <kbd className="px-0.5 py-px rounded text-[9px] bg-claude-border-light/80 dark:bg-[#2b2926] border border-claude-border/40 font-mono">⌘</kbd>
              <span>K</span>
              <span className="text-claude-text-muted/40">·</span>
              <kbd className="px-0.5 py-px rounded text-[9px] bg-claude-border-light/80 dark:bg-[#2b2926] border border-claude-border/40 font-mono">⌘</kbd>
              <span>E</span>
              <span className="text-claude-text-muted/40">·</span>
              <kbd className="px-0.5 py-px rounded text-[9px] bg-claude-border-light/80 dark:bg-[#2b2926] border border-claude-border/40 font-mono">⌘</kbd>
              <span>B</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 border-l border-claude-border/50">
              {mounted && theme === 'dark' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
            </span>
            <span className="inline-flex items-center gap-1 px-2 border-l border-claude-border/50">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-breathe" />
              <span>{snapshots.length}w · {evaluations.length}e</span>
            </span>
          </div>
        </footer>
      </div>

      {/* Report Modal */}
      <div className="no-print">
        <ReportModal
          isOpen={reportModal.isOpen}
          onClose={() => setReportModal(prev => ({ ...prev, isOpen: false }))}
          title={reportModal.title}
          content={reportModal.content}
        />
      </div>

      {/* ═══════════ BATCH ACTION BAR ═══════════ */}
      <AnimatePresence>
        {selectedRows.size > 0 && mode === 'weekly' && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 no-print"
          >
            <div className="bg-white dark:bg-[#242220] border border-claude-border rounded-xl shadow-2xl px-4 py-2.5 flex items-center gap-3">
              <span className="text-xs font-medium text-claude-text-secondary whitespace-nowrap">
                {selectedRows.size} structure{selectedRows.size !== 1 ? 's' : ''} selected
              </span>
              <div className="w-px h-5 bg-claude-border-light" />
              <button
                onClick={batchBookmarkAll}
                className="inline-flex items-center gap-1 h-7 px-3 rounded-lg text-[11px] font-medium text-claude-accent bg-claude-accent-light hover:bg-claude-accent-light/80 transition-colors duration-150"
              >
                <BookmarkPlus className="h-3 w-3" />
                Bookmark All
              </button>
              <button
                onClick={batchRemoveBookmarks}
                className="inline-flex items-center gap-1 h-7 px-3 rounded-lg text-[11px] font-medium text-claude-text-secondary bg-claude-border-light/50 hover:bg-claude-border-light dark:bg-[#3d3832]/50 dark:hover:bg-[#3d3832] transition-colors duration-150"
              >
                <BookmarkMinus className="h-3 w-3" />
                Remove Bookmarks
              </button>
              <button
                onClick={handleExportSelectedCsv}
                className="inline-flex items-center gap-1 h-7 px-3 rounded-lg text-[11px] font-medium text-claude-text-secondary bg-claude-border-light/50 hover:bg-claude-border-light dark:bg-[#3d3832]/50 dark:hover:bg-[#3d3832] transition-colors duration-150"
              >
                <Download className="h-3 w-3" />
                Export Selected
              </button>
              <div className="w-px h-5 bg-claude-border-light" />
              <button
                onClick={clearSelection}
                className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-claude-text-muted hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150"
                title="Clear selection"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {allPageSelected && sortedEntries.length > paginatedEntries.length && (
              <div className="text-center mt-1">
                <button
                  onClick={selectAllRows}
                  className="text-[10px] text-claude-accent hover:underline font-medium"
                >
                  Select all {sortedEntries.length} structures
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ ROW DETAIL SLIDE-OVER PANEL ═══════════ */}
      <AnimatePresence>
        {detailPanelOpen && selectedEntry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => { setDetailPanelOpen(false); setSelectedEntry(null); }}
            />
            <motion.aside
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[420px] max-w-[90vw] bg-white dark:bg-[#242220] border-l border-claude-border flex flex-col shadow-2xl no-print"
            >
              {/* Detail Header */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-claude-border">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-lg font-bold text-claude-accent">{selectedEntry.pdbId}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getMethodColor(selectedEntry.method).bg} ${getMethodColor(selectedEntry.method).text}`}>
                    {getMethodLabel(selectedEntry.method)}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setDetailPanelOpen(false); setSelectedEntry(null); }} className="h-7 w-7 p-0 text-claude-text-muted hover:text-claude-text flex-shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Detail Content */}
              <ScrollArea className="flex-1 preview-scroll">
                <div className="p-4 space-y-5">
                  {/* 3D Structure Viewer */}
                  <div>
                    <MoleculeViewer pdbId={selectedEntry.pdbId} />
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-xs font-semibold text-claude-text-muted uppercase tracking-wider mb-1">Title</h3>
                    <p className="text-sm text-claude-text leading-relaxed">{selectedEntry.title}</p>
                  </div>

                  {/* Quality Score Card */}
                  {(() => {
                    const qs = computeQualityScore(selectedEntry);
                    const circumference = 2 * Math.PI * 40;
                    const offset = circumference - (qs.total / 100) * circumference;
                    return (
                      <div>
                        <h3 className="text-xs font-semibold text-claude-text-muted uppercase tracking-wider mb-2">Quality Score</h3>
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-claude-border-light/30 dark:bg-[#1a1917]/40">
                          {/* SVG Circular Gauge */}
                          <div className="relative flex-shrink-0">
                            <svg width="88" height="88" viewBox="0 0 88 88">
                              {/* Background circle */}
                              <circle
                                cx="44" cy="44" r="40"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="6"
                                className="text-claude-border-light dark:text-[#3d3832]"
                              />
                              {/* Score arc */}
                              <circle
                                cx="44" cy="44" r="40"
                                fill="none"
                                stroke={qs.color}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                transform="rotate(-90 44 44)"
                                className="transition-all duration-700"
                              />
                            </svg>
                            {/* Score number in center */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-xl font-bold font-mono" style={{ color: qs.color }}>{qs.total}</span>
                            </div>
                          </div>
                          {/* Score details */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="text-sm font-semibold" style={{ color: qs.color }}>{qs.label}</div>
                            <div className="text-[10px] text-claude-text-muted leading-relaxed">
                              Resolution: {qs.resolutionScore}/35 · Method: {qs.methodScore}/25 · IF: {qs.ifScore}/30
                            </div>
                            {/* Mini score bars */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-claude-text-muted w-16">Resolution</span>
                                <div className="flex-1 h-1.5 bg-claude-border-light dark:bg-[#3d3832] rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${(qs.resolutionScore / 35) * 100}%`, backgroundColor: '#c96442' }} />
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-claude-text-muted w-16">Method</span>
                                <div className="flex-1 h-1.5 bg-claude-border-light dark:bg-[#3d3832] rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${(qs.methodScore / 25) * 100}%`, backgroundColor: '#2d8f8f' }} />
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-claude-text-muted w-16">IF</span>
                                <div className="flex-1 h-1.5 bg-claude-border-light dark:bg-[#3d3832] rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${(qs.ifScore / 30) * 100}%`, backgroundColor: '#7c5cbf' }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Resolution */}
                  {selectedEntry.resolution != null && (
                    <div>
                      <h3 className="text-xs font-semibold text-claude-text-muted uppercase tracking-wider mb-1.5">Resolution</h3>
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-bold font-mono ${getResolutionColor(selectedEntry.resolution)}`}>
                          {selectedEntry.resolution.toFixed(2)}Å
                        </span>
                        <div className="flex-1 h-2.5 bg-claude-border-light rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(5, Math.min(100, (1 - (selectedEntry.resolution - 0.5) / 4.5) * 100))}%`,
                              backgroundColor: selectedEntry.resolution <= 2.0 ? '#16a34a' : selectedEntry.resolution <= 3.5 ? '#c9872e' : '#dc2626',
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-claude-text-muted">
                          {selectedEntry.resolution <= 1.5 ? 'Excellent' : selectedEntry.resolution <= 2.0 ? 'High' : selectedEntry.resolution <= 3.0 ? 'Medium' : selectedEntry.resolution <= 3.5 ? 'Low' : 'Very Low'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Journal */}
                  {selectedEntry.journal && (
                    <div>
                      <h3 className="text-xs font-semibold text-claude-text-muted uppercase tracking-wider mb-1.5">Journal</h3>
                      <div className="flex items-start gap-2">
                        <span className="text-sm text-claude-text-secondary leading-relaxed">{selectedEntry.journal}</span>
                        {selectedEntry.journalIf != null && (
                          <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${getIfTierStyle(selectedEntry.ifTier).bg} ${getIfTierStyle(selectedEntry.ifTier).text}`}>
                            IF {selectedEntry.journalIf.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Authors */}
                  {selectedEntry.authors && (
                    <div>
                      <h3 className="text-xs font-semibold text-claude-text-muted uppercase tracking-wider mb-1.5">Authors</h3>
                      <p className="text-xs text-claude-text-secondary leading-relaxed">{selectedEntry.authors.replace(/\|/g, ', ')}</p>
                    </div>
                  )}

                  {/* Organisms */}
                  {selectedEntry.organisms && (
                    <div>
                      <h3 className="text-xs font-semibold text-claude-text-muted uppercase tracking-wider mb-1.5">Organisms</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedEntry.organisms.split('|').filter(Boolean).map((org, i) => (
                          <span key={`org-${i}`} className="inline-flex px-2 py-0.5 rounded-md text-[11px] bg-claude-border-light text-claude-text-secondary italic">
                            {org.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ligands */}
                  {parseLigands(selectedEntry.ligands).length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-claude-text-muted uppercase tracking-wider mb-1.5">Ligands</h3>
                      <div className="flex flex-wrap gap-1">
                        {parseLigands(selectedEntry.ligands).map((lig, i) => (
                          <Popover key={`detail-lig-${i}-${lig}`}>
                            <PopoverTrigger asChild>
                              <span
                                className="ligand-chip cursor-pointer"
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
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  <div>
                    <h3 className="text-xs font-semibold text-claude-text-muted uppercase tracking-wider mb-1.5">Links</h3>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`https://www.rcsb.org/structure/${selectedEntry.pdbId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-claude-accent-light text-claude-accent hover:bg-claude-accent/20 hover:shadow-sm transition-all duration-150 external-link-hover"
                      >
                        <ExternalLink className="h-3 w-3 ext-arrow" />
                        RCSB PDB
                      </a>
                      {selectedEntry.doi && (
                        <a
                          href={selectedEntry.doi.startsWith('http') ? selectedEntry.doi : `https://doi.org/${selectedEntry.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-claude-xray-bg text-claude-xray hover:bg-claude-xray/20 hover:shadow-sm transition-all duration-150 external-link-hover"
                        >
                          <ExternalLink className="h-3 w-3 ext-arrow" />
                          DOI
                        </a>
                      )}
                      {selectedEntry.pubmedId && (
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${selectedEntry.pubmedId}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-claude-cryoem-bg text-claude-cryoem hover:bg-claude-cryoem/20 hover:shadow-sm transition-all duration-150 external-link-hover"
                        >
                          <ExternalLink className="h-3 w-3 ext-arrow" />
                          PubMed
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div>
                    <h3 className="text-xs font-semibold text-claude-text-muted uppercase tracking-wider mb-1.5">Dates</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 rounded-lg bg-claude-border-light/50">
                        <div className="text-[10px] text-claude-text-muted">Release Date</div>
                        <div className="text-sm font-medium text-claude-text">{formatDate(selectedEntry.releaseDate)}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-claude-border-light/50">
                        <div className="text-[10px] text-claude-text-muted">Fetch Date</div>
                        <div className="text-sm font-medium text-claude-text">{formatDate(selectedEntry.fetchDate)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Week Info */}
                  <div className="p-3 rounded-lg bg-claude-border-light/30">
                    <div className="text-[10px] text-claude-text-muted mb-0.5">Week</div>
                    <div className="text-sm font-mono font-medium text-claude-text-secondary">{selectedEntry.weekId}</div>
                  </div>
                </div>
              </ScrollArea>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════ COMMAND PALETTE ═══════════ */}
      <CommandDialog
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        title="Command Palette"
        description="Search for a command to run..."
        className="sm:max-w-lg"
      >
        <CommandInput placeholder="Type a command or search..." />
        <CommandList className="max-h-[360px]">
          <CommandEmpty>No commands found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); if (snapshots.length > 0) setSelectedWeekId(snapshots[0].weekId); }}>
              <Calendar className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Go to First Week</span>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); if (snapshots.length > 0) setSelectedWeekId(snapshots[snapshots.length - 1].weekId); }}>
              <Calendar className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Go to Latest Week</span>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); setMode('evaluation'); }}>
              <Microscope className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Switch to Evaluation Mode</span>
              <CommandShortcut>⌘E</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); setMode('weekly'); }}>
              <Calendar className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Switch to Weekly Mode</span>
              <CommandShortcut>⌘E</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Data">
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); handleExportCsv(); }}>
              <Download className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Export Current View as CSV</span>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); window.print(); }}>
              <Printer className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Print Report</span>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); if (compareMode) { setCompareMode(false); setCompareWeekId(null); } else setCompareMode(true); }}>
              <GitCompareArrows className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Toggle Compare Mode</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Filters">
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); setMethodFilter('all'); setSearchQuery(''); clearAdvancedFilters(); setShowBookmarksOnly(false); }}>
              <RotateCcw className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Clear All Filters</span>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); setShowBookmarksOnly(prev => !prev); }}>
              <Bookmark className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Show Bookmarked Only</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); setCompactMode(prev => !prev); }}>
              <AlignJustify className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Toggle Compact Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); setAdvancedFiltersOpen(prev => !prev); }}>
              <SlidersHorizontal className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Open Advanced Filters</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="View">
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); setPreviewOpen(prev => !prev); }}>
              {previewOpen ? <EyeOff className="h-4 w-4 mr-2 text-claude-text-muted" /> : <Eye className="h-4 w-4 mr-2 text-claude-text-muted" />}
              <span>Toggle Preview Panel</span>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); if (selectedEntry) setDetailPanelOpen(true); else toast('Select a row first', { description: 'Click a PDB entry row to open the detail panel' }); }}>
              <PanelRightOpen className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Open Detail Panel</span>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); setTheme(theme === 'dark' ? 'light' : 'dark'); }}>
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4 mr-2 text-claude-text-muted" /> : <Moon className="h-4 w-4 mr-2 text-claude-text-muted" />}
              <span>Toggle Dark Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); toast('Zoomed in! 🔍', { description: '(Just for fun — no actual zoom)' }); }}>
              <ZoomIn className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Zoom In</span>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); toast('Zoomed out! 👀', { description: '(Just for fun — no actual zoom)' }); }}>
              <ZoomOut className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Zoom Out</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Help">
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); searchInputRef.current?.focus(); }}>
              <Search className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Show Keyboard Shortcuts</span>
              <CommandShortcut>⌘K</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); startTour(); }}>
              <Compass className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Start Tour</span>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); toast('PDB Structure Tracker', { description: 'Track and evaluate protein structures from the PDB database. Use ⌘⇧P to open this palette anytime.' }); }}>
              <HelpCircle className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Show Help</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* ═══════════ ONBOARDING TOUR OVERLAY ═══════════ */}
      {mounted && <TourOverlay
        tourActive={tourActive}
        tourStep={tourStep}
        setTourStep={setTourStep}
        finishTour={finishTour}
        steps={[
          { title: TOUR_STEPS[0].title, description: TOUR_STEPS[0].description, targetRef: tourTitleRef as React.RefObject<HTMLElement | null> },
          { title: TOUR_STEPS[1].title, description: TOUR_STEPS[1].description, targetRef: tourSidebarRef as React.RefObject<HTMLElement | null> },
          { title: TOUR_STEPS[2].title, description: TOUR_STEPS[2].description, targetRef: tourModeSwitcherRef as React.RefObject<HTMLElement | null> },
          { title: TOUR_STEPS[3].title, description: TOUR_STEPS[3].description, targetRef: tourSearchRef as React.RefObject<HTMLElement | null> },
          { title: TOUR_STEPS[4].title, description: TOUR_STEPS[4].description, targetRef: tourPreviewRef as React.RefObject<HTMLElement | null> },
          { title: TOUR_STEPS[5].title, description: TOUR_STEPS[5].description, targetRef: tourShortcutsRef as React.RefObject<HTMLElement | null> },
        ]}
      />}
    </TooltipProvider>
  );

  // ── Sidebar Render Function ──
  function renderSidebar() {
    return (
      <>
        {/* Mode Switcher */}
        <div ref={tourModeSwitcherRef} className="p-3 border-b border-claude-border">
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
        <ScrollArea className="flex-1 sidebar-scroll">
          {mode === 'weekly' ? (
            <div ref={tourSidebarRef} className="p-3 space-y-2">
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

              {/* Bookmarks Section */}
              {bookmarks.size > 0 && (
                <Collapsible open={bookmarksExpanded} onOpenChange={setBookmarksExpanded}>
                  <CollapsibleTrigger className="w-full flex items-center justify-between py-1.5 px-1 text-[11px] font-semibold text-claude-text-muted uppercase tracking-wider hover:text-claude-text-secondary transition-colors duration-150">
                    <span className="flex items-center gap-1.5">
                      <Bookmark className="h-3 w-3 text-claude-accent" />
                      Bookmarks
                      <span className="text-[9px] bg-claude-accent-light text-claude-accent px-1.5 py-0.5 rounded-full font-mono">({bookmarks.size})</span>
                    </span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${bookmarksExpanded ? 'rotate-0' : '-rotate-90'}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar sidebar-scroll space-y-0.5 mt-1 mb-1">
                      {[...bookmarks].map(pdbId => {
                        const matchedEntry = entries.find(e => e.pdbId === pdbId);
                        return (
                          <button
                            key={pdbId}
                            onClick={() => {
                              if (matchedEntry) {
                                setSelectedEntry(matchedEntry);
                                setDetailPanelOpen(true);
                              }
                            }}
                            className="w-full text-left p-2 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150 flex items-start gap-2"
                          >
                            <BookmarkCheck className="h-3 w-3 text-claude-accent mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-mono text-[10px] font-semibold text-claude-accent">{pdbId}</div>
                              {matchedEntry && (
                                <div className="text-[10px] text-claude-text-muted line-clamp-1 leading-tight">{matchedEntry.title}</div>
                              )}
                              {!matchedEntry && (
                                <div className="text-[9px] text-claude-text-muted/50 italic">Not in current week</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Week Cards */}
              {loadingSnapshots ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-3 rounded-[10px] border border-claude-border space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-16 rounded-md shimmer-skeleton" />
                        <div className="h-2.5 w-20 rounded shimmer-skeleton" />
                      </div>
                      <div className="h-2.5 w-3/4 rounded shimmer-skeleton" />
                      <div className="flex gap-1.5">
                        <div className="h-4 w-12 rounded shimmer-skeleton" />
                        <div className="h-4 w-10 rounded shimmer-skeleton" />
                        <div className="h-4 w-11 rounded shimmer-skeleton" />
                      </div>
                      <div className="h-1.5 w-full rounded-full shimmer-skeleton" />
                    </div>
                  ))}
                </div>
              ) : (
                snapshots.map(snap => {
                  const isSelected = selectedWeekId === snap.weekId;
                  const total = snap.totalStructures || 1;
                  const cryoemPct = (snap.cryoemCount / total) * 100;
                  const xrayPct = (snap.xrayCount / total) * 100;
                  const nmrPct = (snap.nmrCount / total) * 100;

                  // Compute hover card data from snapshot
                  const avgRes = snap.cryoemAvgRes != null && snap.xrayAvgRes != null
                    ? ((snap.cryoemAvgRes * snap.cryoemCount + snap.xrayAvgRes * snap.xrayCount) / (snap.cryoemCount + snap.xrayCount))
                    : snap.cryoemAvgRes ?? snap.xrayAvgRes ?? null;
                  const resQualityLabel = avgRes != null
                    ? (avgRes <= 2.0 ? 'Excellent' : avgRes <= 3.0 ? 'Good' : avgRes <= 4.0 ? 'Fair' : 'Low')
                    : null;
                  const resQualityColor = avgRes != null
                    ? (avgRes <= 2.0 ? '#22c55e' : avgRes <= 3.0 ? '#14b8a6' : avgRes <= 4.0 ? '#f59e0b' : '#ef4444')
                    : null;
                  const topJournals = snap.topJournals ? snap.topJournals.split('|').filter(Boolean).slice(0, 2) : [];

                  return (
                    <HoverCard key={snap.weekId} openDelay={500} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <button
                          onClick={() => setSelectedWeekId(snap.weekId)}
                          className={`w-full text-left p-3 rounded-[10px] border transition-all duration-200 claude-hover btn-press active:scale-[0.97] ${
                            isSelected
                              ? 'bg-claude-accent-light border-claude-accent/30 shadow-sm border-l-[3px] border-l-claude-accent sidebar-active-card animate-border-breathe'
                              : 'bg-white dark:bg-[#242220] border-claude-border hover:border-claude-border-light dark:hover:border-[#4a4540] claude-card-shadow'
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
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="right"
                        align="start"
                        className="w-64 p-3 space-y-2 bg-white dark:bg-[#2b2926] border border-claude-border rounded-xl shadow-xl"
                      >
                        {/* Header - Week date range */}
                        <div className="text-xs font-semibold text-claude-text">
                          {formatDate(snap.weekStart)} — {formatDate(snap.weekEnd)}
                        </div>

                        {/* Mini method distribution bars */}
                        <div>
                          <div className="text-[10px] text-claude-text-muted mb-1">Method Distribution</div>
                          <div className="flex items-center gap-1">
                            {snap.cryoemCount > 0 && (
                              <div className="h-1.5 rounded-full bg-[#2d8f8f]" style={{ width: `${Math.max(8, cryoemPct)}%` }} title={`Cryo-EM: ${snap.cryoemCount}`} />
                            )}
                            {snap.xrayCount > 0 && (
                              <div className="h-1.5 rounded-full bg-[#7c5cbf]" style={{ width: `${Math.max(8, xrayPct)}%` }} title={`X-ray: ${snap.xrayCount}`} />
                            )}
                            {snap.nmrCount > 0 && (
                              <div className="h-1.5 rounded-full bg-[#c9872e]" style={{ width: `${Math.max(8, nmrPct)}%` }} title={`NMR: ${snap.nmrCount}`} />
                            )}
                            {snap.otherCount > 0 && (
                              <div className="h-1.5 rounded-full bg-[#6b7280]" style={{ width: `${Math.max(8, (snap.otherCount / total) * 100)}%` }} title={`Other: ${snap.otherCount}`} />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[9px] text-claude-text-muted">
                            {snap.cryoemCount > 0 && <span className="text-[#2d8f8f]">EM {snap.cryoemCount}</span>}
                            {snap.xrayCount > 0 && <span className="text-[#7c5cbf]">XR {snap.xrayCount}</span>}
                            {snap.nmrCount > 0 && <span className="text-[#c9872e]">NMR {snap.nmrCount}</span>}
                          </div>
                        </div>

                        {/* Average resolution with quality indicator */}
                        {avgRes != null && (
                          <div className="flex justify-between text-[10px]">
                            <span className="text-claude-text-muted">Avg Resolution</span>
                            <span className="font-mono font-medium">
                              <span style={{ color: resQualityColor || undefined }}>{avgRes.toFixed(2)}Å</span>
                              {resQualityLabel && (
                                <span className="ml-1 text-[9px]" style={{ color: resQualityColor || undefined }}>{resQualityLabel}</span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Highest IF journal */}
                        {topJournals.length > 0 && (
                          <div className="flex justify-between text-[10px]">
                            <span className="text-claude-text-muted">Top Journal</span>
                            <span className="text-claude-text-secondary truncate ml-2 max-w-[140px]">{topJournals[0]}</span>
                          </div>
                        )}

                        {/* Reports count */}
                        {selectedWeekId === snap.weekId && weeklyReports.length > 0 && (
                          <div className="flex justify-between text-[10px]">
                            <span className="text-claude-text-muted">Reports</span>
                            <span className="text-claude-text-secondary">{weeklyReports.length} available</span>
                          </div>
                        )}

                        {/* Click to view hint */}
                        <div className="text-[9px] text-claude-text-muted/60 text-center pt-1 border-t border-claude-border/50">
                          Click to view
                        </div>
                      </HoverCardContent>
                    </HoverCard>
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
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-claude-text-muted z-10" />
                <input
                  type="text"
                  placeholder="Search proteins..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSearchDropdownOpen(true); setSearchHighlightIndex(-1); }}
                  onFocus={() => setSearchDropdownOpen(true)}
                  onBlur={() => { setTimeout(() => { setSearchDropdownOpen(false); setSearchHighlightIndex(-1); }, 200); }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setSearchHighlightIndex(prev => Math.min(prev + 1, totalSuggestionCount - 1));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setSearchHighlightIndex(prev => Math.max(prev - 1, -1));
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (searchHighlightIndex >= 0) {
                        if (searchQuery.trim()) {
                          const item = searchSuggestions[searchHighlightIndex];
                          if (item) {
                            setSearchQuery(item.text);
                            addToSearchHistory(item.text);
                            setSearchDropdownOpen(false);
                            setSearchHighlightIndex(-1);
                          }
                        } else {
                          const term = searchHistory[searchHighlightIndex];
                          if (term) {
                            setSearchQuery(term);
                            addToSearchHistory(term);
                            setSearchDropdownOpen(false);
                            setSearchHighlightIndex(-1);
                          }
                        }
                      } else {
                        addToSearchHistory(searchQuery);
                        setSearchDropdownOpen(false);
                      }
                    } else if (e.key === 'Escape') {
                      setSearchDropdownOpen(false);
                      setSearchHighlightIndex(-1);
                    }
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-claude-border bg-white dark:bg-[#1a1917] dark:text-[#e8e4dd] focus:outline-none focus:ring-2 focus:ring-claude-accent/40 focus:border-claude-accent/40 placeholder:text-claude-text-muted/60 claude-focus-ring"
                />
                <SearchDropdown
                  isOpen={searchDropdownOpen}
                  searchQuery={searchQuery}
                  suggestions={searchSuggestions}
                  searchHistory={searchHistory}
                  highlightIndex={searchHighlightIndex}
                  onSelectSuggestion={(item) => {
                    setSearchQuery(item.text);
                    addToSearchHistory(item.text);
                    setSearchDropdownOpen(false);
                    setSearchHighlightIndex(-1);
                  }}
                  onSelectHistory={(term) => {
                    setSearchQuery(term);
                    addToSearchHistory(term);
                    setSearchDropdownOpen(false);
                    setSearchHighlightIndex(-1);
                  }}
                  onClearHistory={clearSearchHistory}
                />
              </div>

              {loadingEvals ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-3 rounded-[10px] border border-claude-border space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="h-3 w-14 rounded-md shimmer-skeleton" />
                        <div className="h-4 w-8 rounded shimmer-skeleton" />
                      </div>
                      <div className="h-2.5 w-[80%] rounded shimmer-skeleton" />
                      <div className="flex gap-2">
                        <div className="h-2.5 w-16 rounded shimmer-skeleton" />
                        <div className="h-2.5 w-12 rounded shimmer-skeleton" />
                      </div>
                    </div>
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
                      className={`w-full text-left p-3 rounded-[10px] border transition-all duration-200 claude-hover btn-press active:scale-[0.97] ${
                        selectedEvalId === ev.uniprotId
                          ? 'bg-claude-accent-light border-claude-accent/30 shadow-sm border-l-[3px] border-l-claude-accent sidebar-active-card animate-border-breathe'
                          : 'bg-white dark:bg-[#242220] border-claude-border hover:border-claude-border-light dark:hover:border-[#4a4540] claude-card-shadow'
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
            <TabsTrigger value="summary" className="tab-gradient-active flex-1 text-[10px] h-7 data-[state=active]:bg-white dark:data-[state=active]:bg-[#2b2926] data-[state=active]:shadow-sm">
              <BarChart3 className="h-3 w-3 mr-1" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="timeline" className="tab-gradient-active flex-1 text-[10px] h-7 data-[state=active]:bg-white dark:data-[state=active]:bg-[#2b2926] data-[state=active]:shadow-sm">
              <Clock className="h-3 w-3 mr-1" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="report" className="tab-gradient-active flex-1 text-[10px] h-7 data-[state=active]:bg-white dark:data-[state=active]:bg-[#2b2926] data-[state=active]:shadow-sm">
              <FileText className="h-3 w-3 mr-1" />
              Full Report
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 preview-scroll">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={previewTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
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
            ) : mode === 'evaluation' && selectedEval ? (
              <EvalSummary evalData={selectedEval} openReport={openEvalReport} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted">
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
                onSelectEntry={(entry) => { setSelectedEntry(entry); setDetailPanelOpen(true); }}
                onHighlightEntry={setHighlightedEntry}
                highlightedEntry={highlightedEntry}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted">
                <Clock className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">Select a week to view timeline</p>
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
            </motion.div>
          </AnimatePresence>
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

// ─── Custom Recharts Tooltip Components ──────────────────────────────────────

function ClaudeChartTooltip({ active, payload, label, isDark }: {
  active?: boolean; payload?: Array<{ name: string; value: number; payload?: { color?: string; range?: string; tier?: string; name?: string }; fill?: string }>; label?: string; isDark: boolean;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className={`rounded-lg px-3 py-2 text-xs shadow-lg border ${isDark ? 'bg-[#2b2926] border-[#4a4540] text-[#e8e4dd]' : 'bg-white border-claude-border text-claude-text'}`}>
      {label && <div className={`font-semibold mb-1 text-[11px] ${isDark ? 'text-[#e8e4dd]' : 'text-claude-text'}`}>{label}</div>}
      {payload.map((p, i) => {
        const pct = total > 0 ? ((p.value / total) * 100).toFixed(1) : '0';
        const name = p.name || p.payload?.name || p.payload?.tier || p.payload?.range || '';
        const color = p.fill || p.payload?.color || '#c4644a';
        return (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className={isDark ? 'text-[#9b9590]' : 'text-claude-text-secondary'}>{name}</span>
            <span className={`font-mono font-medium ml-auto ${isDark ? 'text-[#e8e4dd]' : 'text-claude-text'}`}>{p.value}</span>
            <span className={isDark ? 'text-[#6b6560]' : 'text-claude-text-muted'}>({pct}%)</span>
          </div>
        );
      })}
    </div>
  );
}

function ClaudeTrendTooltip({ active, payload, label, isDark }: {
  active?: boolean; payload?: Array<{ value: number; dataKey?: string }>; label?: string; isDark: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-lg px-3 py-2 text-xs shadow-lg border ${isDark ? 'bg-[#2b2926] border-[#4a4540] text-[#e8e4dd]' : 'bg-white border-claude-border text-claude-text'}`}>
      <div className={`font-semibold mb-0.5 text-[11px] ${isDark ? 'text-[#e8e4dd]' : 'text-claude-text'}`}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#c4644a' }} />
          <span className={isDark ? 'text-[#9b9590]' : 'text-claude-text-secondary'}>{p.dataKey === 'total' ? 'Structures' : p.dataKey}</span>
          <span className={`font-mono font-medium ml-auto ${isDark ? 'text-[#e8e4dd]' : 'text-claude-text'}`}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function ClaudeResTooltip({ active, payload, isDark }: {
  active?: boolean; payload?: Array<{ value: number; payload?: { range?: string; color?: string } }>; isDark: boolean;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const range = p.payload?.range || '';
  return (
    <div className={`rounded-lg px-3 py-2 text-xs shadow-lg border ${isDark ? 'bg-[#2b2926] border-[#4a4540] text-[#e8e4dd]' : 'bg-white border-claude-border text-claude-text'}`}>
      <div className={`font-semibold mb-0.5 text-[11px] ${isDark ? 'text-[#e8e4dd]' : 'text-claude-text'}`}>{range}</div>
      <div className="flex items-center gap-2 py-0.5">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.payload?.color || '#7c5cbf' }} />
        <span className={isDark ? 'text-[#9b9590]' : 'text-claude-text-secondary'}>Count</span>
        <span className={`font-mono font-medium ml-auto ${isDark ? 'text-[#e8e4dd]' : 'text-claude-text'}`}>{p.value}</span>
      </div>
    </div>
  );
}

// ─── Chart Color Helpers (dark-mode aware) ───────────────────────────────────

function getChartAxisColor(isDark: boolean) { return isDark ? '#9b9590' : '#7c756e'; }
function getChartTickColor(isDark: boolean) { return isDark ? '#6b6560' : '#9b9590'; }

// ─── Scatter Plot Tooltip Component ──────────────────────────────────────────

function ClaudeScatterTooltip({ active, payload, isDark }: {
  active?: boolean; payload?: Array<{ payload?: { pdbId?: string; resolution?: number; journalIf?: number; method?: string; ifTier?: string; title?: string } }>; isDark: boolean;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  if (!d) return null;
  const methodLabel = d.method ? getMethodLabel(d.method) : '';
  const methodColor = d.method ? (METHOD_COLORS[methodLabel] || METHOD_COLORS['Other']) : METHOD_COLORS['Other'];
  return (
    <div className={`rounded-lg px-3 py-2 text-xs shadow-lg border ${isDark ? 'bg-[#2b2926] border-[#4a4540] text-[#e8e4dd]' : 'bg-white border-claude-border text-claude-text'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`font-mono font-semibold text-[11px] ${isDark ? 'text-[#d4784f]' : 'text-claude-accent'}`}>{d.pdbId}</span>
        {methodLabel && (
          <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ backgroundColor: methodColor + '20', color: methodColor }}>
            {methodLabel}
          </span>
        )}
      </div>
      {d.title && (
        <p className={`text-[10px] mb-1 line-clamp-2 ${isDark ? 'text-[#9b9590]' : 'text-claude-text-secondary'}`}>{d.title}</p>
      )}
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {d.resolution != null && (
          <div>
            <span className={isDark ? 'text-[#6b6560]' : 'text-claude-text-muted'}>Resolution:</span>{' '}
            <span className={`font-mono font-medium ${getResolutionColor(d.resolution)}`}>{d.resolution.toFixed(2)}Å</span>
          </div>
        )}
        {d.journalIf != null && (
          <div>
            <span className={isDark ? 'text-[#6b6560]' : 'text-claude-text-muted'}>IF:</span>{' '}
            <span className={`font-mono font-medium ${isDark ? 'text-[#e8e4dd]' : 'text-claude-text'}`}>{d.journalIf.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

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
        <div className="p-3 rounded-lg bg-claude-border-light/50 claude-card-shadow">
          <div className="text-lg font-semibold text-claude-text"><AnimatedNumber value={snapshot.totalStructures} /></div>
          <div className="text-[10px] text-claude-text-muted">Total Structures</div>
        </div>
        <div className="p-3 rounded-lg bg-claude-cryoem-bg/50 claude-card-shadow">
          <div className="text-lg font-semibold text-claude-cryoem"><AnimatedNumber value={snapshot.cryoemCount} /></div>
          <div className="text-[10px] text-claude-cryoem/70">Cryo-EM</div>
        </div>
        <div className="p-3 rounded-lg bg-claude-xray-bg/50 claude-card-shadow">
          <div className="text-lg font-semibold text-claude-xray"><AnimatedNumber value={snapshot.xrayCount} /></div>
          <div className="text-[10px] text-claude-xray/70">X-ray</div>
        </div>
        <div className="p-3 rounded-lg bg-claude-nmr-bg/50 claude-card-shadow">
          <div className="text-lg font-semibold text-claude-nmr"><AnimatedNumber value={snapshot.nmrCount} /></div>
          <div className="text-[10px] text-claude-nmr/70">NMR</div>
        </div>
      </div>

      {/* ─── Chart 1: Method Distribution Donut Chart ─── */}
      {methodPieData.length > 0 && (
        <div className="bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-lg p-3 claude-card-shadow chart-container chart-inner-shadow">
          <h4 className="text-xs font-semibold text-claude-text dark:text-[#e8e4dd] mb-2">Method Distribution</h4>
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
                    <span className="text-[10px] text-claude-text-secondary dark:text-[#9b9590] flex-1">{item.name}</span>
                    <span className="text-[10px] font-mono text-claude-text-muted dark:text-[#6b6560]">{item.value}</span>
                    <span className="text-[9px] text-claude-text-muted dark:text-[#6b6560]">({pct.toFixed(0)}%)</span>
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
          <h4 className="text-xs font-semibold text-claude-text dark:text-[#e8e4dd] mb-2">Resolution Distribution</h4>
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
          <div className="p-3 rounded-lg bg-claude-cryoem-bg/30 dark:bg-[#1a1917]/50">
            <div className="text-[10px] text-claude-cryoem/70 mb-0.5">Cryo-EM Avg Res</div>
            <div className="text-sm font-mono font-semibold text-claude-cryoem">{snapshot.cryoemAvgRes.toFixed(2)}Å</div>
          </div>
        )}
        {snapshot.xrayAvgRes != null && (
          <div className="p-3 rounded-lg bg-claude-xray-bg/30 dark:bg-[#1a1917]/50">
            <div className="text-[10px] text-claude-xray/70 mb-0.5">X-ray Avg Res</div>
            <div className="text-sm font-mono font-semibold text-claude-xray">{snapshot.xrayAvgRes.toFixed(2)}Å</div>
          </div>
        )}
      </div>

      {/* ─── Chart 5: Organism Distribution Horizontal Bar Chart ─── */}
      {organismBarData.length > 0 && (
        <div className="bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-lg p-3 claude-card-shadow chart-container chart-inner-shadow">
          <h4 className="text-xs font-semibold text-claude-text dark:text-[#e8e4dd] mb-2">Top Organisms</h4>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={organismBarData} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
              <XAxis type="number" tick={{ fontSize: 8, fill: getChartTickColor(isDark) }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fill: getChartAxisColor(isDark) }} axisLine={false} tickLine={false} width={85} />
              <RTooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className={`rounded-lg px-3 py-2 text-xs shadow-lg border ${isDark ? 'bg-[#2b2926] border-[#4a4540] text-[#e8e4dd]' : 'bg-white border-claude-border text-claude-text'}`}>
                    <div className={`font-semibold mb-0.5 text-[11px] ${isDark ? 'text-[#e8e4dd]' : 'text-claude-text'}`}>{d.name}</div>
                    <div className="flex items-center gap-2 py-0.5">
                      <span className={isDark ? 'text-[#9b9590]' : 'text-claude-text-secondary'}>Count</span>
                      <span className={`font-mono font-medium ml-auto ${isDark ? 'text-[#e8e4dd]' : 'text-claude-text'}`}>{d.count}</span>
                      <span className={isDark ? 'text-[#6b6560]' : 'text-claude-text-muted'}>({d.pct}%)</span>
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
          <h4 className="text-xs font-semibold text-claude-text dark:text-[#e8e4dd] mb-2">Impact Factor Tiers</h4>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={ifTierBarData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <XAxis dataKey="tier" tick={{ fontSize: 9, fill: getChartAxisColor(isDark) }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: getChartTickColor(isDark) }} axisLine={false} tickLine={false} width={24} />
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#3d3832' : '#f0e8df'} vertical={false} />
              <RTooltip content={({ active, payload, label }) => <ClaudeChartTooltip active={active} payload={payload as any} label={label} isDark={isDark} />} />
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
          <h4 className="text-xs font-semibold text-claude-text dark:text-[#e8e4dd] mb-2">Weekly Trends</h4>
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
              <RTooltip content={({ active, payload, label }) => <ClaudeTrendTooltip active={active} payload={payload as any} label={label} isDark={isDark} />} />
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
          <h4 className="text-xs font-semibold text-claude-text dark:text-[#e8e4dd] mb-2">Resolution vs Impact Factor</h4>
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
                <span className="text-[9px] text-claude-text-secondary dark:text-[#9b9590]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Method Distribution - Bar Chart Style (fallback detail) */}
      <div>
        <h4 className="text-xs font-semibold text-claude-text dark:text-[#e8e4dd] mb-3">Method Details</h4>
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

// ─── Week Comparison View Sub-Component ──────────────────────────────────────

function DeltaIndicator({ value, suffix = '', invertColor = false }: { value: number | null; suffix?: string; invertColor?: boolean }) {
  if (value === null || value === 0) return <span className="text-[9px] text-claude-text-muted">—</span>;
  const isPositive = value > 0;
  const isGood = invertColor ? !isPositive : isPositive;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-mono font-semibold ${isGood ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
      {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {isPositive ? '+' : ''}{value.toFixed(value % 1 === 0 ? 0 : 2)}{suffix}
    </span>
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
    const maxCount = Math.max(...dayCounts, 0);
    const peakDayIdx = dayCounts.indexOf(maxCount);
    const peakDay = peakDayIdx >= 0 ? dayLabels[peakDayIdx] : null;
    const avgPerDay = entries.length > 0 ? (entries.length / totalDays).toFixed(1) : '0';

    // Method distribution
    const emCount = entries.filter(e => e.isCryoem === 1).length;
    const xrCount = entries.filter(e => e.isXray === 1).length;
    const nmrCount = entries.filter(e => e.method?.toUpperCase().includes('NMR')).length;
    const otherCount = entries.length - emCount - xrCount - nmrCount;

    return { maxCount, peakDay, avgPerDay, emCount, xrCount, nmrCount, otherCount };
  }, [entriesByDay, dayLabels, entries, totalDays]);

  // SVG dimensions
  const svgHeight = 280;
  const marginLeft = 8;
  const marginRight = 8;
  const marginTop = 24;
  const timelineY = 60;
  const axisY = timelineY + 30;
  const dayLabelY = axisY + 14;
  const dateLabelY = dayLabelY + 12;
  const usableWidth = containerWidth - marginLeft - marginRight;
  const dayWidth = totalDays > 0 ? usableWidth / totalDays : usableWidth;

  // Get dot color by method
  const getDotColor = (entry: PdbEntry): string => {
    const m = entry.method?.toUpperCase() || '';
    if (m.includes('CRYO') || m.includes('ELECTRON MICROSCOPY')) return METHOD_COLORS['Cryo-EM'];
    if (m.includes('X-RAY') || m.includes('XRAY')) return METHOD_COLORS['X-ray'];
    if (m.includes('NMR')) return METHOD_COLORS['NMR'];
    return METHOD_COLORS['Other'];
  };

  // Get dot size by IF
  const getDotSize = (entry: PdbEntry): number => {
    const if_ = entry.journalIf ?? 0;
    return Math.min(16, Math.max(6, (if_ / 50) * 10 + 6));
  };

  // Calculate dot positions
  const dotPositions = useMemo(() => {
    const positions: { entry: PdbEntry; cx: number; cy: number; size: number; color: string; dayIndex: number }[] = [];
    const dayKeys = Object.keys(entriesByDay).sort();

    dayKeys.forEach((dayKey, dayIdx) => {
      const dayEntries = entriesByDay[dayKey];
      const cx = marginLeft + dayIdx * dayWidth + dayWidth / 2;

      dayEntries.forEach((entry, stackIdx) => {
        const size = getDotSize(entry);
        const offset = stackIdx * (size + 2);
        const cy = timelineY - 10 - offset;
        positions.push({
          entry,
          cx,
          cy,
          size,
          color: getDotColor(entry),
          dayIndex: dayIdx,
        });
      });
    });

    return positions;
  }, [entriesByDay, dayWidth, marginLeft, timelineY]);

  // Method distribution bar segments
  const methodBarSegments = [
    { label: 'EM', count: timelineStats.emCount, color: METHOD_COLORS['Cryo-EM'] },
    { label: 'XR', count: timelineStats.xrCount, color: METHOD_COLORS['X-ray'] },
    { label: 'NMR', count: timelineStats.nmrCount, color: METHOD_COLORS['NMR'] },
    { label: 'Other', count: timelineStats.otherCount, color: METHOD_COLORS['Other'] },
  ].filter(s => s.count > 0);

  const methodBarTotal = methodBarSegments.reduce((s, seg) => s + seg.count, 0);

  const axisStroke = isDark ? '#4a4540' : '#e8e4dd';
  const textColor = isDark ? '#9b9590' : '#7c756e';
  const mutedTextColor = isDark ? '#6b6560' : '#9b9590';

  return (
    <div className="p-4 space-y-4" ref={containerRef}>
      {/* Timeline Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-claude-text dark:text-[#e8e4dd]">
            Release Timeline
          </h4>
          <span className="text-[10px] text-claude-text-muted dark:text-[#6b6560]">
            {formatDate(snapshot.weekStart)} — {formatDate(snapshot.weekEnd)}
          </span>
        </div>

        {/* Quick stats row */}
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-claude-text-secondary dark:text-[#9b9590]">
            Peak day: <span className="font-semibold text-claude-text dark:text-[#e8e4dd]">{timelineStats.peakDay?.dayName || '—'}</span>
            <span className="text-claude-text-muted dark:text-[#6b6560]"> ({timelineStats.maxCount} structures)</span>
          </span>
          <span className="text-claude-text-muted">·</span>
          <span className="text-claude-text-secondary dark:text-[#9b9590]">
            Avg/day: <span className="font-semibold text-claude-text dark:text-[#e8e4dd]">{timelineStats.avgPerDay}</span>
          </span>
        </div>

        {/* Method distribution mini bar */}
        {methodBarTotal > 0 && (
          <div className="space-y-1">
            <div className="flex h-2 rounded-full overflow-hidden bg-claude-border-light dark:bg-[#1a1917]">
              {methodBarSegments.map((seg, i) => (
                <div
                  key={`mbar-${i}`}
                  className="transition-all duration-500"
                  style={{
                    width: `${(seg.count / methodBarTotal) * 100}%`,
                    backgroundColor: seg.color,
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              {methodBarSegments.map((seg, i) => (
                <span key={`mleg-${i}`} className="flex items-center gap-1 text-[9px]">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-claude-text-muted dark:text-[#6b6560]">{seg.label}</span>
                  <span className="font-mono text-claude-text-secondary dark:text-[#9b9590]">{seg.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Method Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { label: 'Cryo-EM', color: METHOD_COLORS['Cryo-EM'] },
          { label: 'X-ray', color: METHOD_COLORS['X-ray'] },
          { label: 'NMR', color: METHOD_COLORS['NMR'] },
          { label: 'Other', color: METHOD_COLORS['Other'] },
        ].map(item => (
          <span key={item.label} className="flex items-center gap-1 text-[9px]">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-claude-text-muted dark:text-[#6b6560]">{item.label}</span>
          </span>
        ))}
        <span className="text-[9px] text-claude-text-muted dark:text-[#6b6560] ml-auto">
          Dot size ∝ Impact Factor
        </span>
      </div>

      {/* SVG Timeline */}
      <div className="rounded-[10px] border border-claude-border p-3 bg-claude-bg/30 dark:bg-[#1a1917]/30">
        <svg
          width={containerWidth - 24}
          height={svgHeight}
          viewBox={`0 0 ${containerWidth - 24} ${svgHeight}`}
          className="w-full"
          style={{ overflow: 'visible' }}
        >
          {/* Vertical grid lines for each day */}
          {dayLabels.map((day, i) => {
            const x = marginLeft + i * dayWidth + dayWidth / 2;
            return (
              <line
                key={`grid-${i}`}
                x1={x}
                y1={marginTop}
                x2={x}
                y2={axisY}
                stroke={axisStroke}
                strokeWidth={0.5}
                strokeDasharray="3,3"
              />
            );
          })}

          {/* Horizontal axis line */}
          <line
            x1={marginLeft}
            y1={axisY}
            x2={containerWidth - marginRight - 24}
            y2={axisY}
            stroke={axisStroke}
            strokeWidth={1}
          />

          {/* Day labels */}
          {dayLabels.map((day, i) => {
            const x = marginLeft + i * dayWidth + dayWidth / 2;
            return (
              <g key={`day-${i}`}>
                <text
                  x={x}
                  y={dayLabelY}
                  textAnchor="middle"
                  fontSize={10}
                  fill={textColor}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {day.dayName}
                </text>
                <text
                  x={x}
                  y={dateLabelY}
                  textAnchor="middle"
                  fontSize={9}
                  fill={mutedTextColor}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {day.dateLabel}
                </text>
                {/* Tick mark */}
                <line
                  x1={x}
                  y1={axisY}
                  x2={x}
                  y2={axisY + 4}
                  stroke={axisStroke}
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* Entry dots with animations */}
          {dotPositions.map((dp, idx) => {
            const isHighlighted = highlightedEntry === dp.entry.pdbId;
            return (
              <motion.circle
                key={`dot-${dp.entry.pdbId}-${idx}`}
                cx={dp.cx}
                cy={dp.cy}
                r={dp.size / 2}
                fill={dp.color}
                opacity={0.85}
                stroke={isHighlighted ? '#ffffff' : 'none'}
                strokeWidth={isHighlighted ? 2 : 0}
                initial={{ r: 0, opacity: 0 }}
                animate={{
                  r: isHighlighted ? dp.size / 2 + 2 : dp.size / 2,
                  opacity: isHighlighted ? 1 : 0.85,
                }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(idx, 20) * 0.03,
                  r: { duration: 0.15 },
                }}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  onHighlightEntry(dp.entry.pdbId);
                  const svgRect = (e.currentTarget.closest('svg') as SVGSVGElement)?.getBoundingClientRect();
                  if (svgRect) {
                    setTooltipData({
                      entry: dp.entry,
                      x: dp.cx + 12,
                      y: dp.cy - 10,
                    });
                  }
                }}
                onMouseLeave={() => {
                  onHighlightEntry(null);
                  setTooltipData(null);
                }}
                onClick={() => onSelectEntry(dp.entry)}
              />
            );
          })}

          {/* Tooltip */}
          {tooltipData && (
            <foreignObject
              x={Math.min(tooltipData.x, containerWidth - 24 - 200)}
              y={Math.max(0, tooltipData.y - 60)}
              width={200}
              height={80}
              style={{ overflow: 'visible', pointerEvents: 'none' }}
            >
              <div
                className={`rounded-lg px-2.5 py-2 text-[10px] shadow-lg border ${isDark ? 'bg-[#2b2926] border-[#4a4540] text-[#e8e4dd]' : 'bg-white border-claude-border text-claude-text'}`}
                style={{ whiteSpace: 'nowrap' }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`font-mono font-semibold text-[11px] ${isDark ? 'text-[#d4784f]' : 'text-claude-accent'}`}>
                    {tooltipData.entry.pdbId}
                  </span>
                  <span
                    className="inline-flex px-1 py-0.5 rounded text-[8px] font-medium"
                    style={{
                      backgroundColor: getDotColor(tooltipData.entry) + '20',
                      color: getDotColor(tooltipData.entry),
                    }}
                  >
                    {getMethodLabel(tooltipData.entry.method)}
                  </span>
                </div>
                <div className={`${isDark ? 'text-[#9b9590]' : 'text-claude-text-secondary'} truncate max-w-[180px]`}>
                  {tooltipData.entry.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {tooltipData.entry.resolution != null && (
                    <span className={isDark ? 'text-[#6b6560]' : 'text-claude-text-muted'}>
                      {tooltipData.entry.resolution}Å
                    </span>
                  )}
                  {tooltipData.entry.journalIf != null && (
                    <span className={isDark ? 'text-[#6b6560]' : 'text-claude-text-muted'}>
                      IF: {tooltipData.entry.journalIf.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </foreignObject>
          )}
        </svg>

        {/* Day count indicators below SVG */}
        <div className="flex mt-1" style={{ paddingLeft: marginLeft, paddingRight: marginRight }}>
          {dayLabels.map((day, i) => {
            const dayKey = new Date(weekStart);
            dayKey.setDate(dayKey.getDate() + i);
            const key = dayKey.toISOString().split('T')[0];
            const count = entriesByDay[key]?.length || 0;
            return (
              <div
                key={`count-${i}`}
                className="flex-1 text-center"
              >
                <span className={`text-[9px] font-mono ${count > 0 ? 'text-claude-accent dark:text-[#d4784f]' : isDark ? 'text-[#4a4540]' : 'text-claude-border'}`}>
                  {count > 0 ? count : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Weekly Statistics Summary Cards (actual) ─────────────────────────────────

function WeeklyStatCards({ entries, snapshots, selectedSnapshot }: { entries: PdbEntry[]; snapshots: WeeklySnapshot[]; selectedSnapshot: WeeklySnapshot | null }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Calculate current week stats
  const stats = useMemo(() => {
    const total = entries.length;
    const withRes = entries.filter(e => e.resolution != null);
    const avgRes = withRes.length > 0 ? withRes.reduce((s, e) => s + (e.resolution ?? 0), 0) / withRes.length : null;
    const cryoemCount = entries.filter(e => e.isCryoem === 1).length;
    const cryoemPct = total > 0 ? (cryoemCount / total) * 100 : 0;
    const withIf = entries.filter(e => e.journalIf != null);
    const topIf = withIf.length > 0 ? withIf.reduce((best, e) => (e.journalIf ?? 0) > best.journalIf! ? e : best, withIf[0]) : null;

    return { total, avgRes, cryoemPct, cryoemCount, topIf };
  }, [entries]);

  // Previous week comparison
  const prevSnapshot = useMemo(() => {
    if (!selectedSnapshot || !snapshots.length) return null;
    const sorted = [...snapshots].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
    const idx = sorted.findIndex(s => s.weekId === selectedSnapshot.weekId);
    if (idx <= 0) return null;
    return sorted[idx - 1];
  }, [selectedSnapshot, snapshots]);

  const totalDelta = prevSnapshot ? stats.total - prevSnapshot.totalStructures : null;

  // Mini sparkline data: last 4 weeks including current
  const sparklineData = useMemo(() => {
    if (!snapshots.length) return [];
    const sorted = [...snapshots].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
    const currentIdx = selectedSnapshot ? sorted.findIndex(s => s.weekId === selectedSnapshot.weekId) : sorted.length - 1;
    const start = Math.max(0, currentIdx - 3);
    return sorted.slice(start, currentIdx + 1).map(s => s.totalStructures);
  }, [snapshots, selectedSnapshot]);

  // Avg resolution color
  const resColor = stats.avgRes != null
    ? (stats.avgRes <= 2.0 ? 'text-green-600 dark:text-green-400' : stats.avgRes <= 3.0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400')
    : '';

  return (
    <div className="px-4 py-2">
      <div className="flex gap-3">
        {/* Total Structures Card */}
        <div className="flex-1 bg-white dark:bg-[#242220] border border-claude-border rounded-[10px] p-3 claude-card-shadow animate-load-stat-card" style={{ animationDelay: '400ms' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] text-claude-text-muted uppercase tracking-wider">Total Structures</div>
              <div className="text-lg font-semibold text-claude-text mt-0.5"><AnimatedNumber value={stats.total} /></div>
            </div>
            <Database className="h-4 w-4 text-claude-text-muted/30 mt-0.5" />
          </div>
          {/* Mini sparkline */}
          {sparklineData.length >= 2 && (
            <div className="mt-1.5 flex items-end gap-[2px] h-4">
              {sparklineData.map((v, i) => {
                const max = Math.max(...sparklineData);
                const min = Math.min(...sparklineData);
                const range = max - min || 1;
                const h = Math.max(3, ((v - min) / range) * 14);
                return (
                  <div
                    key={i}
                    className={`w-[6px] rounded-sm ${i === sparklineData.length - 1 ? 'bg-claude-accent' : isDark ? 'bg-[#4a4540]' : 'bg-claude-border'}`}
                    style={{ height: `${h}px` }}
                  />
                );
              })}
            </div>
          )}
          {totalDelta !== null && <DeltaIndicator value={totalDelta} />}
        </div>

        {/* Avg Resolution Card */}
        <div className="flex-1 bg-white dark:bg-[#242220] border border-claude-border rounded-[10px] p-3 claude-card-shadow animate-load-stat-card" style={{ animationDelay: '450ms' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] text-claude-text-muted uppercase tracking-wider">Avg Resolution</div>
              <div className={`text-lg font-semibold mt-0.5 ${resColor || 'text-claude-text'}`}>
                {stats.avgRes != null ? <><AnimatedNumber value={stats.avgRes} decimals={2} suffix="Å" /></> : '—'}
              </div>
            </div>
            <Eye className="h-4 w-4 text-claude-text-muted/30 mt-0.5" />
          </div>
          {stats.avgRes != null && (
            <div className="text-[9px] text-claude-text-muted mt-1">
              {stats.avgRes <= 1.5 ? 'Excellent' : stats.avgRes <= 2.0 ? 'High' : stats.avgRes <= 3.0 ? 'Medium' : 'Low'} quality
            </div>
          )}
        </div>

        {/* Cryo-EM % Card */}
        <div className="flex-1 bg-white dark:bg-[#242220] border border-claude-border rounded-[10px] p-3 claude-card-shadow animate-load-stat-card" style={{ animationDelay: '500ms' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] text-claude-text-muted uppercase tracking-wider">Cryo-EM %</div>
              <div className="text-lg font-semibold text-claude-text mt-0.5"><AnimatedNumber value={stats.cryoemPct} decimals={0} suffix="%" /></div>
            </div>
            <FlaskConical className="h-4 w-4 text-claude-text-muted/30 mt-0.5" />
          </div>
          {/* Mini circular progress */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="relative w-5 h-5">
              <svg viewBox="0 0 20 20" className="w-5 h-5 -rotate-90">
                <circle cx="10" cy="10" r="8" fill="none" stroke={isDark ? '#3d3832' : '#f0e8df'} strokeWidth="2.5" />
                <circle cx="10" cy="10" r="8" fill="none" stroke="#2d8f8f" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${(stats.cryoemPct / 100) * 50.27} 50.27`} />
              </svg>
            </div>
            <span className="text-[9px] text-claude-cryoem">{stats.cryoemCount} structures</span>
          </div>
        </div>

        {/* Top IF Card */}
        <div className="flex-1 bg-white dark:bg-[#242220] border border-claude-border rounded-[10px] p-3 claude-card-shadow animate-load-stat-card" style={{ animationDelay: '550ms' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] text-claude-text-muted uppercase tracking-wider">Top IF</div>
              <div className="text-lg font-semibold text-claude-text mt-0.5">
                {stats.topIf?.journalIf != null ? <AnimatedNumber value={stats.topIf.journalIf} decimals={1} /> : '—'}
              </div>
            </div>
            <Star className="h-4 w-4 text-claude-text-muted/30 mt-0.5" />
          </div>
          {stats.topIf?.journal && (
            <div className="text-[9px] text-claude-text-muted mt-1 line-clamp-1">{stats.topIf.journal}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function WeekComparisonView({
  snapshotA,
  snapshotB,
  entriesA,
  entriesB,
  snapshots,
}: {
  snapshotA: WeeklySnapshot;
  snapshotB: WeeklySnapshot;
  entriesA: PdbEntry[];
  entriesB: PdbEntry[];
  snapshots: WeeklySnapshot[];
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Method data for both weeks
  const methodDataA = useMemo(() => [
    { name: 'Cryo-EM', value: snapshotA.cryoemCount, color: METHOD_COLORS['Cryo-EM'] },
    { name: 'X-ray', value: snapshotA.xrayCount, color: METHOD_COLORS['X-ray'] },
    { name: 'NMR', value: snapshotA.nmrCount, color: METHOD_COLORS['NMR'] },
    { name: 'Other', value: snapshotA.otherCount, color: METHOD_COLORS['Other'] },
  ].filter(d => d.value > 0), [snapshotA]);

  const methodDataB = useMemo(() => [
    { name: 'Cryo-EM', value: snapshotB.cryoemCount, color: METHOD_COLORS['Cryo-EM'] },
    { name: 'X-ray', value: snapshotB.xrayCount, color: METHOD_COLORS['X-ray'] },
    { name: 'NMR', value: snapshotB.nmrCount, color: METHOD_COLORS['NMR'] },
    { name: 'Other', value: snapshotB.otherCount, color: METHOD_COLORS['Other'] },
  ].filter(d => d.value > 0), [snapshotB]);

  // Resolution distribution for both weeks
  const resDataA = useMemo(() => {
    const combined: Record<string, number> = {};
    try {
      const xd = snapshotA.xrayResDist ? JSON.parse(snapshotA.xrayResDist) : null;
      const cd = snapshotA.cryoemResDist ? JSON.parse(snapshotA.cryoemResDist) : null;
      if (xd) Object.entries(xd).forEach(([r, c]) => { combined[r] = (combined[r] || 0) + (c as number); });
      if (cd) Object.entries(cd).forEach(([r, c]) => { combined[r] = (combined[r] || 0) + (c as number); });
    } catch { /* ignore */ }
    return RESOLUTION_RANGES.map(r => ({
      range: r.label,
      weekA: combined[r.label.replace('Å', '')] || combined[r.label] || 0,
      weekB: 0,
    }));
  }, [snapshotA]);

  const resDataB = useMemo(() => {
    const combined: Record<string, number> = {};
    try {
      const xd = snapshotB.xrayResDist ? JSON.parse(snapshotB.xrayResDist) : null;
      const cd = snapshotB.cryoemResDist ? JSON.parse(snapshotB.cryoemResDist) : null;
      if (xd) Object.entries(xd).forEach(([r, c]) => { combined[r] = (combined[r] || 0) + (c as number); });
      if (cd) Object.entries(cd).forEach(([r, c]) => { combined[r] = (combined[r] || 0) + (c as number); });
    } catch { /* ignore */ }
    return resDataA.map(d => ({
      ...d,
      weekB: combined[d.range.replace('Å', '')] || combined[d.range] || 0,
    }));
  }, [snapshotB, resDataA]);

  // Delta calculations
  const deltas = useMemo(() => {
    const totalDelta = snapshotB.totalStructures - snapshotA.totalStructures;
    const cryoemDelta = snapshotB.cryoemCount - snapshotA.cryoemCount;
    const xrayDelta = snapshotB.xrayCount - snapshotA.xrayCount;
    const nmrDelta = snapshotB.nmrCount - snapshotA.nmrCount;
    const avgResA = snapshotA.cryoemAvgRes != null && snapshotA.xrayAvgRes != null
      ? ((snapshotA.cryoemAvgRes * snapshotA.cryoemCount + snapshotA.xrayAvgRes * snapshotA.xrayCount) / (snapshotA.cryoemCount + snapshotA.xrayCount || 1))
      : snapshotA.cryoemAvgRes ?? snapshotA.xrayAvgRes ?? null;
    const avgResB = snapshotB.cryoemAvgRes != null && snapshotB.xrayAvgRes != null
      ? ((snapshotB.cryoemAvgRes * snapshotB.cryoemCount + snapshotB.xrayAvgRes * snapshotB.xrayCount) / (snapshotB.cryoemCount + snapshotB.xrayCount || 1))
      : snapshotB.cryoemAvgRes ?? snapshotB.xrayAvgRes ?? null;
    const resDelta = avgResA != null && avgResB != null ? avgResB - avgResA : null;
    return { totalDelta, cryoemDelta, xrayDelta, nmrDelta, resDelta };
  }, [snapshotA, snapshotB]);

  return (
    <div className="p-4 space-y-5">
      {/* Comparison Header */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-semibold text-claude-accent">{snapshotA.weekId}</span>
        <span className="text-[10px] text-claude-text-muted">vs</span>
        <span className="font-mono text-xs font-semibold text-claude-xray">{snapshotB.weekId}</span>
      </div>

      {/* Delta Summary Card */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-2.5 rounded-lg ${isDark ? 'bg-[#2b2926]' : 'bg-claude-border-light/50'}`}>
          <div className="text-[9px] text-claude-text-muted dark:text-[#6b6560] mb-0.5">Structures</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-claude-text dark:text-[#e8e4dd]">{snapshotA.totalStructures}→{snapshotB.totalStructures}</span>
            <DeltaIndicator value={deltas.totalDelta} />
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${isDark ? 'bg-[#2b2926]' : 'bg-claude-border-light/50'}`}>
          <div className="text-[9px] text-claude-text-muted dark:text-[#6b6560] mb-0.5">Avg Resolution</div>
          <div className="flex items-center gap-2">
            {deltas.resDelta !== null ? (
              <>
                <span className="text-sm font-semibold text-claude-text dark:text-[#e8e4dd]">
                  {((snapshotB.cryoemAvgRes ?? snapshotB.xrayAvgRes) ?? 0).toFixed(2)}Å
                </span>
                <DeltaIndicator value={deltas.resDelta} suffix="Å" invertColor />
              </>
            ) : (
              <span className="text-sm text-claude-text-muted">—</span>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${isDark ? 'bg-[#2b2926]' : 'bg-claude-cryoem-bg/30'}`}>
          <div className="text-[9px] text-claude-cryoem/70 mb-0.5">Cryo-EM</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-claude-cryoem">{snapshotA.cryoemCount}→{snapshotB.cryoemCount}</span>
            <DeltaIndicator value={deltas.cryoemDelta} />
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${isDark ? 'bg-[#2b2926]' : 'bg-claude-xray-bg/30'}`}>
          <div className="text-[9px] text-claude-xray/70 mb-0.5">X-ray</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-claude-xray">{snapshotA.xrayCount}→{snapshotB.xrayCount}</span>
            <DeltaIndicator value={deltas.xrayDelta} />
          </div>
        </div>
      </div>

      {/* Side-by-Side Method Donut Charts */}
      <div className="bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-lg p-3 claude-card-shadow chart-container chart-inner-shadow">
        <h4 className="text-xs font-semibold text-claude-text dark:text-[#e8e4dd] mb-2">Method Distribution</h4>
        <div className="flex items-center gap-1">
          {/* Week A Donut */}
          <div className="flex-1 min-w-0">
            <div className="text-center text-[9px] font-mono font-semibold text-claude-accent mb-1">{snapshotA.weekId}</div>
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={methodDataA} cx="50%" cy="50%" innerRadius={20} outerRadius={40} paddingAngle={2} dataKey="value" stroke="none" animationDuration={600}>
                  {methodDataA.map((entry, index) => (
                    <Cell key={`cell-a-${index}`} fill={entry.color} className="transition-opacity duration-150 hover:opacity-80" />
                  ))}
                </Pie>
                <RTooltip content={({ active, payload }) => <ClaudeChartTooltip active={active} payload={payload as any} isDark={isDark} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* VS Divider */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center px-1">
            <div className={`w-px h-8 ${isDark ? 'bg-[#4a4540]' : 'bg-claude-border'}`} />
            <span className={`text-[8px] font-bold my-1 ${isDark ? 'text-[#6b6560]' : 'text-claude-text-muted'}`}>VS</span>
            <div className={`w-px h-8 ${isDark ? 'bg-[#4a4540]' : 'bg-claude-border'}`} />
          </div>

          {/* Week B Donut */}
          <div className="flex-1 min-w-0">
            <div className="text-center text-[9px] font-mono font-semibold text-claude-xray mb-1">{snapshotB.weekId}</div>
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={methodDataB} cx="50%" cy="50%" innerRadius={20} outerRadius={40} paddingAngle={2} dataKey="value" stroke="none" animationDuration={600}>
                  {methodDataB.map((entry, index) => (
                    <Cell key={`cell-b-${index}`} fill={entry.color} className="transition-opacity duration-150 hover:opacity-80" />
                  ))}
                </Pie>
                <RTooltip content={({ active, payload }) => <ClaudeChartTooltip active={active} payload={payload as any} isDark={isDark} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grouped Bar Chart: Resolution Distribution */}
      {resDataB.some(d => d.weekA > 0 || d.weekB > 0) && (
        <div className="bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-lg p-3 claude-card-shadow chart-container chart-inner-shadow">
          <h4 className="text-xs font-semibold text-claude-text dark:text-[#e8e4dd] mb-2">Resolution Comparison</h4>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={resDataB} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#3d3832' : '#f0e8df'} vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 8, fill: getChartAxisColor(isDark) }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: getChartTickColor(isDark) }} axisLine={false} tickLine={false} width={24} />
              <RTooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className={`rounded-lg px-3 py-2 text-xs shadow-lg border ${isDark ? 'bg-[#2b2926] border-[#4a4540] text-[#e8e4dd]' : 'bg-white border-claude-border text-claude-text'}`}>
                    <div className={`font-semibold mb-1 text-[11px] ${isDark ? 'text-[#e8e4dd]' : 'text-claude-text'}`}>{label}</div>
                    {payload.map((p: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 py-0.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.fill }} />
                        <span className={isDark ? 'text-[#9b9590]' : 'text-claude-text-secondary'}>{p.name}</span>
                        <span className={`font-mono font-medium ml-auto ${isDark ? 'text-[#e8e4dd]' : 'text-claude-text'}`}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                );
              }} />
              <Legend wrapperStyle={{ fontSize: '9px', color: isDark ? '#9b9590' : '#7c756e' }} />
              <Bar dataKey="weekA" name={snapshotA.weekId} fill="#c4644a" radius={[3, 3, 0, 0]} animationDuration={600} style={{ cursor: 'pointer' }} />
              <Bar dataKey="weekB" name={snapshotB.weekId} fill="#2d8f8f" radius={[3, 3, 0, 0]} animationDuration={600} style={{ cursor: 'pointer' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Evaluation Summary Sub-Component ────────────────────────────────────────

function EvalSummary({ evalData, openReport }: { evalData: Evaluation; openReport: (id: number, title: string) => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const scores = useMemo(() => {
    try { return evalData.scores ? JSON.parse(evalData.scores) : {}; }
    catch { return {}; }
  }, [evalData.scores]);

  const overallScore = useMemo(() => {
    const vals = Object.values(scores) as number[];
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [scores]);

  const [evalReport, setEvalReport] = useState<{ id: number; title: string | null } | null>(null);

  // BLAST table sort state
  const [blastSortField, setBlastSortField] = useState<string>('identity');
  const [blastSortDir, setBlastSortDir] = useState<'asc' | 'desc'>('desc');

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

  // Sort BLAST results
  const sortedBlastResults = useMemo(() => {
    if (!blastResults.length) return [];
    const sorted = [...blastResults].sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;
      switch (blastSortField) {
        case 'accession': aVal = a.uniprotRef || a.pdbId || ''; bVal = b.uniprotRef || b.pdbId || ''; break;
        case 'organism': aVal = a.description || ''; bVal = b.description || ''; break;
        case 'identity': aVal = a.identity ?? -1; bVal = b.identity ?? -1; break;
        case 'evalue': aVal = a.evalue ?? 999; bVal = b.evalue ?? 999; break;
        case 'score': aVal = a.queryCoverage ?? -1; bVal = b.queryCoverage ?? -1; break;
        default: aVal = a.identity ?? -1; bVal = b.identity ?? -1;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return blastSortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return blastSortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [blastResults, blastSortField, blastSortDir]);

  const handleBlastSort = useCallback((field: string) => {
    if (blastSortField === field) {
      setBlastSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setBlastSortField(field);
      setBlastSortDir('desc');
    }
  }, [blastSortField]);

  // Coverage circular progress SVG
  const coveragePct = evalData.coverage ?? 0;
  const coverageColor = coveragePct >= 80 ? '#2d8f8f' : coveragePct >= 50 ? '#c9872e' : coveragePct >= 25 ? '#ea580c' : '#dc2626';
  const coverageLabel = coveragePct >= 80 ? 'Excellent' : coveragePct >= 50 ? 'Moderate' : coveragePct >= 25 ? 'Limited' : 'Very Limited';

  // Animated circular progress
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (Math.min(coveragePct, 100) / 100) * circumference;

  return (
    <div className="p-3 space-y-3">
      {/* ── Evaluation Overview Hero Card ── */}
      <div className="rounded-[10px] border border-claude-border bg-white dark:bg-[#242220] p-3 space-y-3">
        <div className="flex items-start gap-3">
          {/* Circular Coverage Indicator */}
          <div className="flex-shrink-0 relative">
            <svg width="88" height="88" viewBox="0 0 88 88">
              {/* Background circle */}
              <circle
                cx="44" cy="44" r="40"
                fill="none"
                stroke={isDark ? '#3d3832' : '#f0ece5'}
                strokeWidth="6"
              />
              {/* Progress circle */}
              <circle
                cx="44" cy="44" r="40"
                fill="none"
                stroke={coverageColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 44 44)"
                style={{ transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.3s ease' }}
              />
              {/* Center text */}
              <text x="44" y="38" textAnchor="middle" className="fill-claude-text dark:fill-[#e8e4dd]" style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-geist-mono), monospace' }}>
                {coveragePct.toFixed(0)}%
              </text>
              <text x="44" y="52" textAnchor="middle" className={isDark ? 'fill-[#9b9590]' : 'fill-[#9b9590]'} style={{ fontSize: '8px', fontWeight: 500 }}>
                coverage
              </text>
            </svg>
          </div>

          {/* Protein Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-claude-text leading-snug line-clamp-2">{evalData.proteinName || evalData.uniprotId}</h3>
            <div className="mt-1 space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px]">
                <Dna className="h-3 w-3 text-claude-accent flex-shrink-0" />
                <span className="font-mono font-semibold text-claude-accent">{evalData.uniprotId}</span>
                {evalData.entryName && (
                  <span className="text-claude-text-muted truncate">({evalData.entryName})</span>
                )}
              </div>
              {evalData.geneNames && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Activity className="h-3 w-3 text-claude-text-muted flex-shrink-0" />
                  <span className="text-claude-text-secondary truncate">{evalData.geneNames}</span>
                </div>
              )}
              {evalData.organism && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Globe className="h-3 w-3 text-claude-text-muted flex-shrink-0" />
                  <span className="text-claude-text-secondary truncate">{evalData.organism}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          {evalData.sequenceLength && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-border-light/60 dark:bg-[#2b2926] text-claude-text-secondary border border-claude-border/50">
              <span className="font-mono">{evalData.sequenceLength}</span> aa
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border" style={{ backgroundColor: coverageColor + '15', color: coverageColor, borderColor: coverageColor + '30' }}>
            {coverageLabel} coverage
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-border-light/60 dark:bg-[#2b2926] text-claude-text-muted border border-claude-border/50">
            <Clock className="h-2.5 w-2.5" />
            {formatDate(evalData.updatedAt)}
          </span>
        </div>
      </div>

      {/* ── Score Breakdown Panel ── */}
      {Object.keys(scores).length > 0 && (
        <div className="rounded-[10px] border border-claude-border bg-white dark:bg-[#242220] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-claude-text">Score Breakdown</h4>
            {overallScore !== null && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-claude-text-muted">Overall</span>
                <span className="text-sm font-mono font-bold" style={{ color: getScoreColor(overallScore) }}>
                  {overallScore.toFixed(1)}
                </span>
                <span className="text-[10px] text-claude-text-muted">/10</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {Object.entries(scores).map(([key, value]) => {
              const score = value as number;
              const pct = Math.min((score / 10) * 100, 100);
              const color = score >= 8 ? '#2d8f8f' : score >= 5 ? '#c9872e' : '#dc2626';
              const textColor = score >= 8 ? 'text-[#2d8f8f] dark:text-[#3db5b5]' : score >= 5 ? 'text-[#c9872e] dark:text-[#d9a24e]' : 'text-[#dc2626] dark:text-[#ef6b6b]';
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-claude-text-secondary">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                    <span className={`text-[11px] font-mono font-semibold ${textColor}`}>{score.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 bg-claude-border-light dark:bg-[#1a1917] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Overall score bar */}
          {overallScore !== null && (
            <div className="pt-1 mt-1 border-t border-claude-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-claude-text">Overall Score</span>
                <span className="text-xs font-mono font-bold" style={{ color: getScoreColor(overallScore) }}>{overallScore.toFixed(1)}/10</span>
              </div>
              <div className="h-2 bg-claude-border-light dark:bg-[#1a1917] rounded-full overflow-hidden mt-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((overallScore / 10) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getScoreColor(overallScore) }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PDB Structures Grid ── */}
      {pdbStructures.length > 0 && (
        <div className="rounded-[10px] border border-claude-border bg-white dark:bg-[#242220] p-3 space-y-2">
          <h4 className="text-xs font-semibold text-claude-text">
            PDB Structures <span className="text-claude-text-muted font-normal">({pdbStructures.length})</span>
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {pdbStructures.map((s) => {
              const methodColors = s.method ? getMethodColor(s.method) : null;
              const methodLabel = s.method ? getMethodLabel(s.method) : '—';
              return (
                <a
                  key={`${s.uniprotId}-${s.pdbId}`}
                  href={`https://www.rcsb.org/structure/${s.pdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg border border-claude-border/60 bg-claude-border-light/20 dark:bg-[#1a1917]/40 hover:bg-claude-border-light/50 dark:hover:bg-[#2b2926] transition-all duration-150 group"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-mono text-[11px] font-bold text-claude-accent group-hover:text-claude-accent-hover transition-colors">{s.pdbId}</span>
                    {methodColors && (
                      <span className={`text-[8px] px-1 py-0.5 rounded font-medium ${methodColors.bg} ${methodColors.text} leading-none`}>
                        {methodLabel}
                      </span>
                    )}
                  </div>
                  {s.resolution != null && (
                    <div className="text-[10px] text-claude-text-muted">
                      <span className={`font-mono font-medium ${getResolutionColor(s.resolution)}`}>{s.resolution}Å</span>
                    </div>
                  )}
                  {s.title && (
                    <div className="text-[9px] text-claude-text-muted line-clamp-1 mt-0.5">{s.title}</div>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ── BLAST Results Table ── */}
      {blastResults.length > 0 && (
        <div className="rounded-[10px] border border-claude-border bg-white dark:bg-[#242220] p-3 space-y-2">
          <h4 className="text-xs font-semibold text-claude-text">
            BLAST Homologs <span className="text-claude-text-muted font-normal">({blastResults.length})</span>
          </h4>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-claude-border">
                  {[
                    { field: 'accession', label: 'Accession' },
                    { field: 'organism', label: 'Organism' },
                    { field: 'identity', label: 'Identity %' },
                    { field: 'evalue', label: 'E-value' },
                    { field: 'score', label: 'Score' },
                  ].map(col => (
                    <th
                      key={col.field}
                      onClick={() => handleBlastSort(col.field)}
                      className={`table-header-cell px-2 py-1.5 text-left font-semibold text-claude-text-secondary cursor-pointer hover:text-claude-text transition-colors whitespace-nowrap ${blastSortField === col.field ? 'sort-active' : ''}`}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {col.label}
                        {blastSortField === col.field && (
                          blastSortDir === 'asc' ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedBlastResults.slice(0, 10).map((br, i) => (
                  <tr key={br.id || i} className={`border-b border-claude-border-light/50 ${i % 2 === 0 ? 'table-row-even' : 'table-row-odd'} table-row-hover`}>
                    <td className="px-2 py-1.5">
                      <span className="font-mono font-semibold text-claude-accent">{br.uniprotRef || br.pdbId || '—'}</span>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="text-claude-text-secondary line-clamp-1 max-w-[100px]">{br.description || '—'}</span>
                    </td>
                    <td className="px-2 py-1.5">
                      {br.identity != null ? (
                        <span className={`font-mono font-medium ${br.identity > 90 ? 'text-green-600' : br.identity >= 70 ? 'text-amber-600' : 'text-red-500'}`}>
                          {br.identity}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="font-mono text-claude-text-secondary">{formatEvalue(br.evalue)}</span>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="font-mono text-claude-text-secondary">{br.queryCoverage ?? '—'}{br.queryCoverage != null ? '%' : ''}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {blastResults.length > 10 && (
              <div className="text-[10px] text-claude-text-muted text-center pt-1">
                + {blastResults.length - 10} more homologs
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Recommendations ── */}
      {evalData.report && (
        <div className="rounded-[10px] border border-claude-border bg-white dark:bg-[#242220] p-3 space-y-1.5">
          <h4 className="text-xs font-semibold text-claude-text">Recommendations</h4>
          <div className="p-2.5 rounded-lg bg-claude-border-light/30 text-[11px] text-claude-text-secondary leading-relaxed line-clamp-4">
            {evalData.report
              .replace(/[#*_]/g, '')
              .split('\n')
              .filter(l => l.trim())
              .slice(-3)
              .join(' ')}
          </div>
        </div>
      )}

      {/* ── View Report Button ── */}
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
