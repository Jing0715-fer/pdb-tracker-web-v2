'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect, Suspense, useSyncExternalStore } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
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
  PanelRightClose,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  FileDiff,
  StickyNote,
  FileJson,
  ClipboardCopy,
  Table as TableIcon,
  Grid3x3,
  Columns,
  Sparkles,
  GitMerge,
  Tag,
  RefreshCw,
  AlertTriangle,
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, Legend, ScatterChart, Scatter, ZAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
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

// Safe number formatting helper to prevent toFixed errors on non-numeric values
const safeNum = (val: any, decimals: number = 0, fallback: string = '—'): string => {
  if (val == null) return fallback;
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num)) return fallback;
  return num.toFixed(decimals);
};

const MoleculeViewer = dynamic(() => import('./molecule-viewer').catch(() => {
  // Return a fallback component when the module fails to load
  return { default: function MoleculeViewerFallback({ pdbId }: { pdbId: string }) {
    return (
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden bg-[#f5f0eb] dark:bg-[#3d3832] border border-claude-border dark:border-[#4a4540] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center px-6">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" className="opacity-60">
            <circle cx="32" cy="32" r="8" fill="#d4784f" opacity="0.9" />
            <line x1="38" y1="27" x2="50" y2="16" stroke="#c9872e" strokeWidth="2" strokeLinecap="round" />
            <circle cx="52" cy="14" r="5" fill="#c9872e" opacity="0.7" />
            <line x1="38" y1="37" x2="52" y2="46" stroke="#2d8f8f" strokeWidth="2" strokeLinecap="round" />
            <circle cx="54" cy="48" r="5" fill="#2d8f8f" opacity="0.7" />
            <line x1="24" y1="32" x2="12" y2="32" stroke="#7c5cbf" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="32" r="5" fill="#7c5cbf" opacity="0.7" />
          </svg>
          <span className="text-[12px] font-medium text-claude-text dark:text-[#e8e4dd]">3D viewer unavailable</span>
          <span className="text-[10px] text-claude-text-muted dark:text-[#9b9590]">Module failed to load</span>
          <a href={`https://www.rcsb.org/structure/${pdbId}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-claude-border-light dark:bg-[#2b2926] hover:bg-claude-border dark:hover:bg-[#3d3832] border border-claude-border dark:border-[#4a4540] text-[11px] font-medium text-claude-accent transition-colors duration-200">
            View on RCSB PDB
          </a>
        </div>
      </div>
    );
  }};
}), { 
  ssr: false,
  loading: () => (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden bg-[#f5f0eb] dark:bg-[#3d3832] border border-claude-border dark:border-[#4a4540] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 border-2 border-claude-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-[11px] text-claude-text-muted dark:text-[#9b9590]">Loading 3D viewer...</span>
      </div>
    </div>
  )
});

// ─── useAnimatedValue Hook ─────────────────────────────────────────────────

function useAnimatedValue(target: number, duration: number = 800): { current: number; isAnimating: boolean } {
  const [current, setCurrent] = useState(target);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevTargetRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevTargetRef.current === target) return;
    const start = prevTargetRef.current;
    const diff = target - start;
    const startTime = performance.now();
    let started = false;

    function tick(now: number) {
      if (!started) {
        started = true;
        setIsAnimating(true);
      }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + diff * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevTargetRef.current = target;
        setCurrent(target);
        setIsAnimating(false);
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

  return { current, isAnimating };
}

// ─── Animated Number Component ───────────────────────────────────────────────

function AnimatedNumber({ value, decimals = 0, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const scaledTarget = Math.round(value * Math.pow(10, decimals));
  const { current: animated, isAnimating } = useAnimatedValue(scaledTarget, 800);
  const display = (animated / Math.pow(10, decimals)).toFixed(decimals);
  return (
    <motion.span
      className="tabular-nums inline-block"
      animate={{ scale: isAnimating ? 1.05 : 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {display}{suffix}
    </motion.span>
  );
}

// ─── HeaderParticles Component ──────────────────────────────────────────────

function HeaderParticles() {
  // Only render on client to avoid hydration mismatch with animated CSS particles
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Static particle definitions to avoid SSR/CSR hydration mismatch (no Math.random, no Math.sin)
  const particles = useMemo(() => {
    const defs = [
      { s: 2.4, d: 10.2, dl: -8.5, l: 12.3, t: 68.1, mo: 0.06, xo: 0.28, dx1: 15, dy1: -8, dx2: -12, dy2: 5, dx3: 8, dy3: -15 },
      { s: 2.7, d: 13.5, dl: -3.2, l: 45.6, t: 22.8, mo: 0.08, xo: 0.35, dx1: -18, dy1: 12, dx2: 6, dy2: -10, dx3: -5, dy3: 8 },
      { s: 2.1, d: 9.8, dl: -11.3, l: 78.2, t: 55.4, mo: 0.05, xo: 0.22, dx1: 10, dy1: 18, dx2: -8, dy2: -15, dx3: 12, dy3: 6 },
      { s: 2.8, d: 11.7, dl: -6.7, l: 33.9, t: 89.2, mo: 0.07, xo: 0.31, dx1: -5, dy1: -12, dx2: 18, dy2: 8, dx3: -10, dy3: 15 },
      { s: 2.2, d: 14.1, dl: -1.5, l: 67.4, t: 35.7, mo: 0.09, xo: 0.38, dx1: 8, dy1: 5, dx2: -15, dy2: -18, dx3: 3, dy3: -8 },
      { s: 2.5, d: 8.9, dl: -9.8, l: 91.1, t: 72.3, mo: 0.06, xo: 0.25, dx1: -12, dy1: 15, dx2: 5, dy2: -8, dx3: 18, dy3: -3 },
      { s: 2.3, d: 12.6, dl: -4.3, l: 18.7, t: 43.6, mo: 0.07, xo: 0.32, dx1: 16, dy1: -10, dx2: -3, dy2: 12, dx3: -8, dy3: 18 },
      { s: 2.6, d: 10.8, dl: -7.1, l: 55.2, t: 16.9, mo: 0.08, xo: 0.27, dx1: -8, dy1: 6, dx2: 12, dy2: -15, dx3: 5, dy3: -12 },
      { s: 2.0, d: 15.2, dl: -2.6, l: 82.5, t: 61.8, mo: 0.05, xo: 0.20, dx1: 10, dy1: -18, dx2: -6, dy2: 8, dx3: -15, dy3: 5 },
      { s: 2.9, d: 9.3, dl: -10.4, l: 27.3, t: 94.5, mo: 0.09, xo: 0.36, dx1: -15, dy1: 10, dx2: 8, dy2: -5, dx3: 12, dy3: -10 },
      { s: 2.1, d: 13.8, dl: -5.9, l: 60.8, t: 28.4, mo: 0.06, xo: 0.29, dx1: 5, dy1: 15, dx2: -18, dy2: 12, dx3: -3, dy3: 8 },
      { s: 2.4, d: 11.1, dl: -8.7, l: 95.2, t: 79.6, mo: 0.07, xo: 0.33, dx1: -10, dy1: -5, dx2: 15, dy2: -12, dx3: 8, dy3: 15 },
      { s: 2.7, d: 14.5, dl: -0.8, l: 41.6, t: 51.3, mo: 0.08, xo: 0.24, dx1: 18, dy1: -8, dx2: -5, dy2: 18, dx3: -12, dy3: -6 },
      { s: 2.3, d: 10.5, dl: -6.2, l: 73.9, t: 8.5, mo: 0.05, xo: 0.21, dx1: -3, dy1: 12, dx2: 10, dy2: -8, dx3: 15, dy3: -18 },
      { s: 2.5, d: 12.9, dl: -3.5, l: 8.4, t: 65.7, mo: 0.09, xo: 0.37, dx1: 12, dy1: -15, dx2: -10, dy2: 5, dx3: -8, dy3: 12 },
      { s: 2.0, d: 9.6, dl: -11.8, l: 48.7, t: 37.2, mo: 0.06, xo: 0.26, dx1: -18, dy1: 8, dx2: 3, dy2: 15, dx3: 10, dy3: -5 },
      { s: 2.8, d: 15.8, dl: -1.2, l: 86.3, t: 83.9, mo: 0.07, xo: 0.30, dx1: 6, dy1: -3, dx2: -15, dy2: -10, dx3: -5, dy3: 18 },
      { s: 2.2, d: 11.4, dl: -7.9, l: 22.1, t: 46.8, mo: 0.08, xo: 0.34, dx1: -5, dy1: 18, dx2: 12, dy2: -3, dx3: 8, dy3: -12 },
    ];
    return defs.map((p, i) => ({
      size: p.s, duration: p.d, delay: p.dl, left: p.l, top: p.t,
      minOpacity: p.mo, maxOpacity: p.xo,
      dx1: p.dx1, dy1: p.dy1, dx2: p.dx2, dy2: p.dy2, dx3: p.dx3, dy3: p.dy3,
      color: i % 3 === 0 ? 'rgba(201,100,66,0.15)' : i % 3 === 1 ? 'rgba(155,149,144,0.12)' : 'rgba(201,100,66,0.1)',
      key: `hp-${i}`
    }));
  }, []);

  if (!mounted) return null;

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.key}
          className="header-particle"
          suppressHydrationWarning
          style={{
            width: `${p.size.toFixed(1)}px`,
            height: `${p.size.toFixed(1)}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            backgroundColor: p.color,
            '--particle-duration': `${p.duration}s`,
            '--particle-delay': `${p.delay}s`,
            '--particle-min-opacity': `${p.minOpacity}`,
            '--particle-max-opacity': `${p.maxOpacity}`,
            '--particle-dx1': `${p.dx1}px`,
            '--particle-dy1': `${p.dy1}px`,
            '--particle-dx2': `${p.dx2}px`,
            '--particle-dy2': `${p.dy2}px`,
            '--particle-dx3': `${p.dx3}px`,
            '--particle-dy3': `${p.dy3}px`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

// ─── useTilt Hook ────────────────────────────────────────────────────────────

function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [shineStyle, setShineStyle] = useState<React.CSSProperties>({});
  const isTouchDevice = useRef(false);
  const styleRef = useRef<React.CSSProperties>({});
  const shineRef = useRef<React.CSSProperties>({});

  useEffect(() => {
    isTouchDevice.current = !window.matchMedia('(hover: hover)').matches;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isTouchDevice.current || !ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxRotation = 3;
    const rotateX = ((y - centerY) / centerY) * -maxRotation;
    const rotateY = ((x - centerX) / centerX) * maxRotation;

    const newStyle: React.CSSProperties = {
      transform: `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
      transition: 'transform 150ms ease-out',
    };
    styleRef.current = newStyle;
    setTiltStyle(newStyle);

    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;
    const newShine: React.CSSProperties = {
      background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
    };
    shineRef.current = newShine;
    setShineStyle(newShine);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const newStyle: React.CSSProperties = {
      transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 300ms ease-out',
    };
    styleRef.current = newStyle;
    setTiltStyle(newStyle);
    shineRef.current = {};
    setShineStyle({});
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || isTouchDevice.current) return;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return { ref, tiltStyle, shineStyle };
}

// ─── TiltCard Component ────────────────────────────────────────────────────

function TiltCard({ children, className = '', style = {}, animationDelay }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  animationDelay?: string;
}) {
  const { ref, tiltStyle, shineStyle } = useTilt<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`tilt-card relative overflow-hidden ${className}`}
      style={{ ...tiltStyle, ...style, ...(animationDelay ? { animationDelay } : {}) }}
    >
      <div className="tilt-shine" style={shineStyle} />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

// ─── useTypewriter Hook ─────────────────────────────────────────────────────

function useTypewriter(text: string, speed: number = 30) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const textRef = useRef(text);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    textRef.current = text;
    indexRef.current = 0;

    function tick(idx: number) {
      if (idx === 0) {
        setDisplayedText('');
        setIsComplete(false);
      }
      const nextIdx = idx + 1;
      if (nextIdx <= textRef.current.length) {
        setDisplayedText(textRef.current.slice(0, nextIdx));
        indexRef.current = nextIdx;
        timerRef.current = setTimeout(() => tick(nextIdx), speed);
      } else {
        setIsComplete(true);
      }
    }

    timerRef.current = setTimeout(() => tick(0), 0);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed]);

  return { displayedText, isComplete };
}

// ─── TypewriterText Component ───────────────────────────────────────────────

function TypewriterText({ text, speed = 30 }: { text: string; speed?: number }) {
  const { displayedText, isComplete } = useTypewriter(text, speed);
  return (
    <span>
      {displayedText}
      {!isComplete && <span className="typewriter-cursor" />}
    </span>
  );
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
  if (res <= 2.0) return 'text-green-600 dark:text-green-400';
  if (res <= 3.5) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
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
  if (identity >= 90) return 'text-green-600 dark:text-green-400';
  if (identity >= 70) return 'text-teal-600 dark:text-teal-400';
  if (identity >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
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
  // Handle pipe-separated (weekly: "CODE:Name|Other:Name2"), semicolon-separated (eval: "NAG; FOR; NAD"), and comma-separated (BLAST: "CA, NAG")
  let parts: string[];
  if (ligands.includes('|')) {
    parts = ligands.split('|');
  } else if (ligands.includes(';')) {
    parts = ligands.split(/[;]+/);
  } else if (ligands.includes(',')) {
    parts = ligands.split(/[,]+/);
  } else {
    parts = [ligands];
  }
  return parts.map(l => {
    const colonParts = l.split(':');
    return colonParts[0].trim();
  }).filter(Boolean);
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

// ─── Smart Tag System ────────────────────────────────────────────────────────

type TagCategory = 'method' | 'resolution' | 'if' | 'quality' | 'date' | 'organism' | 'ligand' | 'special';

interface TagInfo {
  label: string;
  category: TagCategory;
}

const TAG_CATEGORY_STYLES: Record<TagCategory, { bg: string; text: string; border: string; darkBg: string; darkText: string }> = {
  method:     { bg: 'bg-teal-50',      text: 'text-teal-700',     border: 'border-teal-200',      darkBg: 'dark:bg-teal-900/20',     darkText: 'dark:text-teal-400' },
  resolution: { bg: 'bg-green-50',     text: 'text-green-700',    border: 'border-green-200',     darkBg: 'dark:bg-green-900/20',    darkText: 'dark:text-green-400' },
  if:         { bg: 'bg-amber-50',     text: 'text-amber-700',    border: 'border-amber-200',     darkBg: 'dark:bg-amber-900/20',    darkText: 'dark:text-amber-400' },
  quality:    { bg: 'bg-purple-50',    text: 'text-purple-700',   border: 'border-purple-200',    darkBg: 'dark:bg-purple-900/20',   darkText: 'dark:text-purple-400' },
  date:       { bg: 'bg-gray-50',      text: 'text-gray-600',     border: 'border-gray-200',      darkBg: 'dark:bg-gray-800/30',     darkText: 'dark:text-gray-400' },
  organism:   { bg: 'bg-sky-50',       text: 'text-sky-700',      border: 'border-sky-200',       darkBg: 'dark:bg-sky-900/20',      darkText: 'dark:text-sky-400' },
  ligand:     { bg: 'bg-rose-50',      text: 'text-rose-700',     border: 'border-rose-200',      darkBg: 'dark:bg-rose-900/20',     darkText: 'dark:text-rose-400' },
  special:    { bg: 'bg-emerald-50',   text: 'text-emerald-700',  border: 'border-emerald-200',   darkBg: 'dark:bg-emerald-900/20',  darkText: 'dark:text-emerald-400' },
};

function generateTags(entry: PdbEntry, isNewEntry: boolean = false): TagInfo[] {
  const tags: TagInfo[] = [];
  const method = (entry.method || '').toUpperCase();

  // Method tags
  if (method.includes('CRYO') || method.includes('ELECTRON MICROSCOPY')) {
    tags.push({ label: 'Cryo-EM', category: 'method' });
  } else if (method.includes('X-RAY') || method.includes('XRAY')) {
    tags.push({ label: 'X-ray', category: 'method' });
  } else if (method.includes('NMR')) {
    tags.push({ label: 'NMR', category: 'method' });
  }

  // Resolution tags
  if (entry.resolution != null) {
    if (entry.resolution <= 1.5) {
      tags.push({ label: 'Ultra-high', category: 'resolution' });
    } else if (entry.resolution <= 2.0) {
      tags.push({ label: 'High Resolution', category: 'resolution' });
    } else if (entry.resolution > 3.0) {
      tags.push({ label: 'Low Resolution', category: 'resolution' });
    }
  }

  // IF tags
  if (entry.journalIf != null) {
    if (entry.journalIf >= 25) {
      tags.push({ label: 'Top Journal', category: 'if' });
    } else if (entry.journalIf >= 10) {
      tags.push({ label: 'High Impact', category: 'if' });
    }
  }

  // Quality tags
  const qs = computeQualityScore(entry);
  if (qs.total >= 85) {
    tags.push({ label: 'Excellent', category: 'quality' });
  } else if (qs.total >= 70) {
    tags.push({ label: 'Good', category: 'quality' });
  }

  // Organism tag
  if (entry.organisms) {
    const firstOrg = entry.organisms.split('|')[0]?.trim();
    if (firstOrg) {
      const shortOrg = firstOrg.length > 15 ? firstOrg.slice(0, 14) + '…' : firstOrg;
      tags.push({ label: shortOrg, category: 'organism' });
    }
  }

  // Ligand tag
  if (entry.ligands) {
    const ligandList = parseLigands(entry.ligands);
    if (ligandList.length > 0 && !ligandList.every(l => l === 'N/A')) {
      tags.push({ label: 'With Ligands', category: 'ligand' });
    }
  }

  // Date tags
  if (entry.releaseDate) {
    const releaseDate = new Date(entry.releaseDate);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    if (releaseDate >= weekStart) {
      tags.push({ label: 'This Week', category: 'date' });
    } else if (releaseDate >= monthStart) {
      tags.push({ label: 'This Month', category: 'date' });
    }
  }

  // Special tags
  if (isNewEntry) {
    tags.push({ label: 'New Entry', category: 'special' });
  }

  return tags;
}

function TagPill({ tag, onClick, size = 'sm' }: { tag: TagInfo; onClick?: () => void; size?: 'sm' | 'xs' }) {
  const style = TAG_CATEGORY_STYLES[tag.category];
  const sizeClasses = size === 'xs' ? 'px-1.5 py-0 text-[9px]' : 'px-2 py-0.5 text-[10px]';
  return (
    <span
      className={`inline-flex items-center rounded-md font-medium border ${style.bg} ${style.text} ${style.border} ${style.darkBg} ${style.darkText} ${sizeClasses} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {tag.label}
    </span>
  );
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
  // Support both 'ligands' (weekly) and 'ligand' (eval/BLAST) field names
  const ligandString = 'ligands' in entry ? entry.ligands : ('ligand' in entry ? entry.ligand : null);
  const ligandList = parseLigands(ligandString);
  const method = entry.method || '';
  const methodColors = getMethodColor(method);

  return (
    <div className="w-[400px] p-3 space-y-2">
      <div className="flex items-start gap-2">
        <img
          src={`https://cdn.rcsb.org/images/structures/${entry.pdbId.toLowerCase()}_assembly-1.jpeg`}
          alt={entry.pdbId}
          className="w-40 h-40 rounded-md bg-claude-border-light dark:bg-[#3d3832] object-cover flex-shrink-0 border border-claude-border-light dark:border-[#3d3832]"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-semibold text-claude-text dark:text-[#e8e4dd] text-sm">{entry.pdbId}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${methodColors.bg} ${methodColors.text}`}>
              {getMethodLabel(method)}
            </span>
          </div>
          <p className="text-xs text-claude-text-secondary dark:text-[#9b9590] line-clamp-2 leading-relaxed">
            {entry.title}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {entry.resolution != null && (
          <div>
            <span className="text-claude-text-muted dark:text-[#6b6560]">Resolution:</span>{' '}
            <span className={`font-medium ${getResolutionColor(entry.resolution)}`}>{entry.resolution}Å</span>
          </div>
        )}
        <div>
          <span className="text-claude-text-muted dark:text-[#6b6560]">Date:</span>{' '}
          <span className="text-claude-text-secondary dark:text-[#9b9590]">{formatDate(entry.releaseDate)}</span>
        </div>
        {'journal' in entry && entry.journal && (
          <div className="col-span-2">
            <span className="text-claude-text-muted dark:text-[#6b6560]">Journal:</span>{' '}
            <span className="text-claude-text-secondary dark:text-[#9b9590]">{entry.journal}</span>
            {entry.journalIf && <span className="text-claude-text-muted dark:text-[#6b6560] ml-1">({safeNum(entry.journalIf, 1)})</span>}
          </div>
        )}
      </div>
      {ligandList.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {ligandList.slice(0, 6).map((l, i) => (
            <span key={`tt-lig-${i}-${l}`} className="ligand-chip">{l}</span>
          ))}
          {ligandList.length > 6 && <span className="text-[10px] text-claude-text-muted dark:text-[#6b6560]">+{ligandList.length - 6}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Ligand Tooltip Component ────────────────────────────────────────────────

function LigandTooltipContent({ ligand }: { ligand: LigandInfo }) {
  return (
    <div className="w-72 p-3 space-y-2">
      <div className="flex items-start gap-3">
        <div className="w-24 h-24 rounded-lg bg-white dark:bg-[#1a1917] border border-claude-border dark:border-[#3d3832] flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
          <img
            src={ligand.imageUrl}
            alt={ligand.name}
            className="max-w-full max-h-full object-contain"
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              const parent = img.parentElement;
              if (parent) {
                parent.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#9b9590;font-size:10px;font-family:monospace;text-align:center;padding:4px">' + ligand.code + '</div>';
              }
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-claude-text dark:text-[#e8e4dd] text-sm font-mono">{ligand.code}</div>
          <div className="text-xs text-claude-text-secondary dark:text-[#9b9590] leading-relaxed mt-0.5">{ligand.name}</div>
          <div className="mt-1.5">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
              ligand.type === 'NUCLEOTIDE' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400' :
              ligand.type === 'COENZYME' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
              ligand.type === 'ION' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
              ligand.type === 'PROSTHETIC GROUP' ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400' :
              'bg-gray-50 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400'
            }`}>{ligand.type}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs pt-1 border-t border-claude-border-light dark:border-[#3d3832]">
        <div>
          <span className="text-claude-text-muted dark:text-[#6b6560]">Formula:</span>{' '}
          <span className="font-mono text-claude-text-secondary dark:text-[#9b9590]">{ligand.formula}</span>
        </div>
        <div>
          <span className="text-claude-text-muted dark:text-[#6b6560]">MW:</span>{' '}
          <span className="font-mono text-claude-text-secondary dark:text-[#9b9590]">{ligand.weight}</span>
        </div>
      </div>
      {ligand.description && (
        <p className="text-[10px] text-claude-text-muted dark:text-[#6b6560] leading-relaxed">{ligand.description}</p>
      )}
    </div>
  );
}

// ─── Blast Homolog Tooltip Component ─────────────────────────────────────────

function BlastHomologTooltipContent({ result }: { result: EvalBlastResult }) {
  const ligandList = parseLigands(result.ligand);
  const method = result.method || '';
  const methodColors = getMethodColor(method);

  return (
    <div className="w-[400px] p-3 space-y-2">
      <div className="flex items-start gap-2">
        <img
          src={`https://cdn.rcsb.org/images/structures/${(result.pdbId || '').toLowerCase()}_assembly-1.jpeg`}
          alt={result.pdbId}
          className="w-40 h-40 rounded-md bg-claude-border-light dark:bg-[#3d3832] object-cover flex-shrink-0 border border-claude-border-light dark:border-[#3d3832]"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-semibold text-claude-text dark:text-[#e8e4dd] text-sm">{result.pdbId}</span>
            {method && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${methodColors.bg} ${methodColors.text}`}>
                {getMethodLabel(method)}
              </span>
            )}
          </div>
          <p className="text-xs text-claude-text-secondary dark:text-[#9b9590] line-clamp-2 leading-relaxed">
            {result.title || result.description}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {result.resolution != null && (
          <div>
            <span className="text-claude-text-muted dark:text-[#6b6560]">Resolution:</span>{' '}
            <span className={`font-medium ${getResolutionColor(result.resolution)}`}>{result.resolution}Å</span>
          </div>
        )}
        <div>
          <span className="text-claude-text-muted dark:text-[#6b6560]">Date:</span>{' '}
          <span className="text-claude-text-secondary dark:text-[#9b9590]">{formatDate(result.releaseDate)}</span>
        </div>
        {result.journal && (
          <div className="col-span-2">
            <span className="text-claude-text-muted dark:text-[#6b6560]">Journal:</span>{' '}
            <span className="text-claude-text-secondary dark:text-[#9b9590]">{result.journal}</span>
            {result.journalIf && <span className="text-claude-text-muted dark:text-[#6b6560] ml-1">({safeNum(result.journalIf, 1)})</span>}
          </div>
        )}
        {result.identity != null && (
          <div>
            <span className="text-claude-text-muted dark:text-[#6b6560]">Identity:</span>{' '}
            <span className={`font-medium ${getIdentityColor(result.identity)}`}>{result.identity}%</span>
          </div>
        )}
        {result.evalue != null && (
          <div>
            <span className="text-claude-text-muted dark:text-[#6b6560]">E-value:</span>{' '}
            <span className="font-mono text-claude-text-secondary dark:text-[#9b9590]">{formatEvalue(result.evalue)}</span>
          </div>
        )}
        {result.queryCoverage != null && (
          <div>
            <span className="text-claude-text-muted dark:text-[#6b6560]">Q. Coverage:</span>{' '}
            <span className="font-medium text-claude-text-secondary dark:text-[#9b9590]">{result.queryCoverage}%</span>
          </div>
        )}
        {result.uniprotRef && (
          <div>
            <span className="text-claude-text-muted dark:text-[#6b6560]">UniProt:</span>{' '}
            <span className="font-mono text-claude-text-secondary dark:text-[#9b9590]">{result.uniprotRef}</span>
          </div>
        )}
      </div>
      {ligandList.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {ligandList.slice(0, 6).map((l, i) => (
            <span key={`tt-blast-lig-${i}-${l}`} className="ligand-chip">{l}</span>
          ))}
          {ligandList.length > 6 && <span className="text-[10px] text-claude-text-muted dark:text-[#6b6560]">+{ligandList.length - 6}</span>}
        </div>
      )}
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

  // Strip YAML frontmatter (---...---)
  const strippedContent = content.replace(/^---[\s\S]*?---\s*/m, '');

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
            className="bg-claude-surface dark:bg-[#242220] rounded-[10px] shadow-xl max-w-[66rem] w-full mx-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-claude-border dark:border-[#3d3832]">
              <h2 className="text-base font-semibold text-claude-text">{title}</h2>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 text-claude-text-muted hover:text-claude-text">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar preview-scroll">
              <div className="markdown-content report-markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{strippedContent}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Entry Comparison Modal Component ──────────────────────────────────────

function EntryComparisonModal({
  isOpen,
  onClose,
  entryA,
  entryB,
}: {
  isOpen: boolean;
  onClose: () => void;
  entryA: PdbEntry | null;
  entryB: PdbEntry | null;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!entryA || !entryB) return null;

  const properties = [
    { label: 'Method', keyA: entryA.method, keyB: entryB.method, type: 'text' as const },
    { label: 'Resolution', keyA: entryA.resolution, keyB: entryB.resolution, type: 'resolution' as const },
    { label: 'Impact Factor', keyA: entryA.journalIf, keyB: entryB.journalIf, type: 'if' as const },
    { label: 'Organism', keyA: entryA.organisms, keyB: entryB.organisms, type: 'text' as const },
    { label: 'Title', keyA: entryA.title, keyB: entryB.title, type: 'text' as const },
    { label: 'Journal', keyA: entryA.journal, keyB: entryB.journal, type: 'text' as const },
    { label: 'Authors', keyA: entryA.authors, keyB: entryB.authors, type: 'text' as const },
    { label: 'Ligands', keyA: entryA.ligands, keyB: entryB.ligands, type: 'text' as const },
    { label: 'Date', keyA: entryA.releaseDate, keyB: entryB.releaseDate, type: 'text' as const },
  ];

  const getDiffHighlight = (prop: typeof properties[0]): { aClass: string; bClass: string } => {
    const aVal = prop.keyA;
    const bVal = prop.keyB;
    const aStr = aVal != null ? String(aVal) : '';
    const bStr = bVal != null ? String(bVal) : '';

    if (aStr === bStr) return { aClass: '', bClass: '' };

    if (prop.type === 'resolution') {
      const aRes = aVal as number | null;
      const bRes = bVal as number | null;
      if (aRes != null && bRes != null) {
        // Lower resolution = better
        return {
          aClass: aRes < bRes ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20',
          bClass: bRes < aRes ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20',
        };
      }
    }
    if (prop.type === 'if') {
      const aIf = aVal as number | null;
      const bIf = bVal as number | null;
      if (aIf != null && bIf != null) {
        // Higher IF = better
        return {
          aClass: aIf > bIf ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20',
          bClass: bIf > aIf ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20',
        };
      }
    }

    // For text differences, just subtle highlight
    return { aClass: 'bg-amber-50 dark:bg-amber-900/15', bClass: 'bg-amber-50 dark:bg-amber-900/15' };
  };

  const formatValue = (val: any, type: string): string => {
    if (val == null || val === undefined) return '—';
    if (type === 'resolution') return `${(val as number).toFixed(2)}Å`;
    if (type === 'if') return (val as number).toFixed(1);
    if (typeof val === 'string') return val.replace(/\|/g, ', ');
    return String(val);
  };

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
            className="bg-claude-surface dark:bg-[#242220] rounded-[10px] shadow-xl max-w-4xl w-full mx-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-claude-border dark:border-[#3d3832]">
              <div className="flex items-center gap-3">
                <Columns className="h-5 w-5 text-claude-accent" />
                <h2 className="text-base font-semibold text-claude-text">Entry Comparison</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 text-claude-text-muted hover:text-claude-text">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Side-by-side comparison */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              {/* Entry headers */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 p-3 rounded-lg border border-claude-border bg-claude-bg/50">
                  <span className="font-mono font-bold text-sm text-claude-accent">{entryA.pdbId}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getMethodColor(entryA.method).bg} ${getMethodColor(entryA.method).text}`}>
                    {getMethodLabel(entryA.method)}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg border border-claude-border bg-claude-bg/50">
                  <span className="font-mono font-bold text-sm text-claude-accent">{entryB.pdbId}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getMethodColor(entryB.method).bg} ${getMethodColor(entryB.method).text}`}>
                    {getMethodLabel(entryB.method)}
                  </span>
                </div>
              </div>

              {/* VS Divider */}
              <div className="relative flex items-center justify-center mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-claude-border-light dark:border-[#3d3832]" />
                </div>
                <div className="relative z-10 px-3 py-1 rounded-full bg-claude-accent text-white text-[10px] font-bold tracking-wider">
                  VS
                </div>
              </div>

              {/* Property comparison rows */}
              <div className="space-y-2">
                {properties.map((prop) => {
                  const diff = getDiffHighlight(prop);
                  const isDiff = prop.keyA != null && prop.keyB != null && String(prop.keyA) !== String(prop.keyB);
                  return (
                    <div key={prop.label} className="grid grid-cols-[1fr_auto_1fr] gap-0">
                      {/* Entry A value */}
                      <div className={`p-3 rounded-l-lg border border-r-0 border-claude-border text-xs transition-colors ${diff.aClass}`}>
                        <div className="text-[9px] font-semibold uppercase text-claude-text-muted mb-1">{prop.label}</div>
                        <div className={`text-claude-text-secondary leading-relaxed ${prop.type === 'title' ? 'line-clamp-3' : 'line-clamp-2'}`}>
                          {formatValue(prop.keyA, prop.type)}
                        </div>
                      </div>
                      {/* Divider with diff indicator */}
                      <div className="flex items-center justify-center w-8 border-y border-claude-border bg-claude-bg/30">
                        {isDiff && (
                          <span className="text-[9px] font-bold text-claude-accent">≠</span>
                        )}
                      </div>
                      {/* Entry B value */}
                      <div className={`p-3 rounded-r-lg border border-l-0 border-claude-border text-xs transition-colors ${diff.bClass}`}>
                        <div className="text-[9px] font-semibold uppercase text-claude-text-muted mb-1">{prop.label}</div>
                        <div className={`text-claude-text-secondary leading-relaxed ${prop.type === 'title' ? 'line-clamp-3' : 'line-clamp-2'}`}>
                          {formatValue(prop.keyB, prop.type)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-3 border-t border-claude-border flex items-center gap-4 text-[10px] text-claude-text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30" />
                  Better
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30" />
                  Worse
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/30" />
                  Different
                </span>
                <span className="ml-auto italic">Lower resolution = better · Higher IF = better</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-claude-border">
              <div className="text-[10px] text-claude-text-muted">
                Comparing <span className="font-mono font-semibold text-claude-accent">{entryA.pdbId}</span> vs <span className="font-mono font-semibold text-claude-accent">{entryB.pdbId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-7">
                  Clear Comparison
                </Button>
                <Button variant="default" size="sm" onClick={onClose} className="text-xs h-7 bg-claude-accent hover:bg-claude-accent-hover">
                  Close
                </Button>
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
    <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-t border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220]">
      <span className="text-[11px] text-claude-text-muted hidden sm:inline">
        Showing <span className="font-mono font-medium text-claude-text-secondary">{start}</span>–<span className="font-mono font-medium text-claude-text-secondary">{end}</span> of <span className="font-mono font-medium text-claude-text-secondary">{totalItems}</span> entries
      </span>
      <span className="text-[11px] text-claude-text-muted sm:hidden">
        {start}–{end} of {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="pagination-btn btn-press inline-flex items-center justify-center min-h-[44px] sm:min-h-0 sm:h-7 px-2 rounded-md text-[11px] font-medium border border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border disabled:opacity-40 disabled:cursor-not-allowed claude-focus-ring"
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
              className={`pagination-btn btn-press inline-flex items-center justify-center min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-7 sm:w-7 rounded-md text-[11px] font-medium claude-focus-ring ${
                page === p
                  ? 'bg-claude-accent text-white shadow-sm pagination-active'
                  : 'border border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="pagination-btn btn-press inline-flex items-center justify-center min-h-[44px] sm:min-h-0 sm:h-7 px-2 rounded-md text-[11px] font-medium border border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border disabled:opacity-40 disabled:cursor-not-allowed claude-focus-ring"
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
        <tr key={`skel-${i}`} className="border-b border-claude-border-light dark:border-[#3d3832]">
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
          className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] rounded-lg shadow-xl p-1 max-h-64 overflow-y-auto custom-scrollbar dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
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
                            ? 'bg-claude-accent-light/50 dark:bg-claude-accent/10'
                            : 'hover:bg-claude-bg/50 dark:hover:bg-claude-border'
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
                        ? 'bg-claude-accent-light/50 dark:bg-claude-accent/10'
                        : 'hover:bg-claude-bg/50 dark:hover:bg-claude-border'
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
          className="absolute bg-claude-surface dark:bg-[#242220] border border-claude-border dark:border-[#3d3832] rounded-xl shadow-2xl p-4 max-w-[280px]"
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
                className="px-3 py-1.5 rounded-md text-[11px] font-medium text-claude-text-secondary hover:text-claude-text hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors"
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

  // ── Heatmap Data (all entries across weeks) ──
  const [heatmapEntries, setHeatmapEntries] = useState<PdbEntry[]>([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);

  // ── Context Menu (Right-Click) ──
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; weekId: string } | null>(null);
  const [evalContextMenu, setEvalContextMenu] = useState<{ x: number; y: number; uniprotId: string } | null>(null);

  // ── Evaluation Mode Data ──
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [selectedEvalStructure, setSelectedEvalStructure] = useState<(EvalPdbStructure & { isBlast?: boolean }) | null>(null);
  const [evalReports, setEvalReports] = useState<EvaluationReport[]>([]);

  // ── Filters & Sort ──
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('releaseDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // ── Tag Filter ──
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [tagFilterDropdownOpen, setTagFilterDropdownOpen] = useState(false);

  // ── AI Summaries Cache ──
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [aiSummaryLoading, setAiSummaryLoading] = useState<string | null>(null);
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);

  // ── Preview Panel ──
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<string>('summary');

  // ── Compare Mode ──
  const [compareMode, setCompareMode] = useState(false);
  const [compareWeekId, setCompareWeekId] = useState<string | null>(null);
  const [compareEntries, setCompareEntries] = useState<PdbEntry[]>([]);

  // ── Entry Comparison (Side-by-Side) ──
  const [entryComparison, setEntryComparison] = useState<{ entryA: PdbEntry | null; entryB: PdbEntry | null }>({ entryA: null, entryB: null });
  const [entryCompareModalOpen, setEntryCompareModalOpen] = useState(false);

  const entryCompareCount = (entryComparison.entryA ? 1 : 0) + (entryComparison.entryB ? 1 : 0);

  const toggleEntryCompare = useCallback((entry: PdbEntry) => {
    setEntryComparison(prev => {
      if (prev.entryA?.pdbId === entry.pdbId) {
        return { ...prev, entryA: prev.entryB, entryB: null };
      }
      if (prev.entryB?.pdbId === entry.pdbId) {
        return { ...prev, entryB: null };
      }
      if (!prev.entryA) {
        return { ...prev, entryA: entry };
      }
      if (!prev.entryB) {
        return { ...prev, entryB: entry };
      }
      // Both slots filled — replace entryB
      return { ...prev, entryB: entry };
    });
  }, []);

  const clearEntryComparison = useCallback(() => {
    setEntryComparison({ entryA: null, entryB: null });
    setEntryCompareModalOpen(false);
  }, []);

  // ── Complex Evaluation Mode ──
  const [complexGroups, setComplexGroups] = useState<{ id: string; name: string; uniprotIds: string[]; createdAt: number }[]>(() => {
    try {
      const saved = localStorage.getItem('pdb-complex-groups');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [];
  });
  const [showComplexDialog, setShowComplexDialog] = useState(false);
  const [complexName, setComplexName] = useState('');
  const [complexInput, setComplexInput] = useState('');
  const [selectedComplexId, setSelectedComplexId] = useState<string | null>(null);
  const [expandedComplexId, setExpandedComplexId] = useState<string | null>(null);

  // Persist complex groups
  useEffect(() => {
    try { localStorage.setItem('pdb-complex-groups', JSON.stringify(complexGroups)); } catch { /* ignore */ }
  }, [complexGroups]);

  const addComplexGroup = useCallback(() => {
    const ids = complexInput.split(/[\s,;]+/).filter(id => id.trim().length > 0).map(id => id.trim().toUpperCase());
    if (ids.length < 2) { toast('At least 2 UniProt IDs required'); return; }
    const newGroup = {
      id: `complex-${Date.now()}`,
      name: complexName.trim() || ids.join(' + '),
      uniprotIds: ids,
      createdAt: Date.now(),
    };
    setComplexGroups(prev => [...prev, newGroup]);
    setComplexName('');
    setComplexInput('');
    setShowComplexDialog(false);
    toast(`Created complex group: ${newGroup.name}`, { description: `${ids.length} UniProt IDs` });
  }, [complexName, complexInput]);

  const removeComplexGroup = useCallback((id: string) => {
    setComplexGroups(prev => prev.filter(g => g.id !== id));
    if (selectedComplexId === id) setSelectedComplexId(null);
    if (expandedComplexId === id) setExpandedComplexId(null);
  }, [selectedComplexId, expandedComplexId]);

  // Complex evaluation data - merge data from multiple evaluations
  const complexEvalData = useMemo(() => {
    if (!selectedComplexId) return null;
    const group = complexGroups.find(g => g.id === selectedComplexId);
    if (!group) return null;
    const subEvals = group.uniprotIds.map(uid => evaluations.find(e => e.uniprotId === uid)).filter(Boolean) as Evaluation[];
    // Merge all PDB structures and BLAST results
    const allStructures: (EvalPdbStructure & { _type: 'structure'; _sourceUniport: string })[] = [];
    const allBlasts: (EvalBlastResult & { _type: 'blast'; _sourceUniport: string })[] = [];
    subEvals.forEach(ev => {
      (ev.pdbStructures || []).forEach(s => allStructures.push({ ...s, _type: 'structure', _sourceUniport: ev.uniprotId }));
      (ev.blastResults || []).forEach(b => allBlasts.push({ ...b, _type: 'blast', _sourceUniport: ev.uniprotId }));
    });
    return { group, subEvals, allStructures, allBlasts };
  }, [selectedComplexId, complexGroups, evaluations]);

  // ── Mobile State ──
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // ── Desktop Sidebar Toggle State ──
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Initialize sidebarOpen and previewOpen based on viewport width on mount (hydration-safe)
  useEffect(() => {
    if (window.innerWidth >= 1280) {
      setSidebarOpen(true);
      setPreviewOpen(true);
    }
    // Load persisted preferences from localStorage
    try {
      const savedBookmarks = localStorage.getItem('pdb-bookmarks');
      if (savedBookmarks) setBookmarks(new Set(JSON.parse(savedBookmarks) as string[]));
    } catch { /* ignore */ }
    try {
      const savedHidden = localStorage.getItem('pdb-hidden-columns');
      if (savedHidden) setHiddenColumns(new Set(JSON.parse(savedHidden) as string[]));
    } catch { /* ignore */ }
    try {
      const savedCompact = localStorage.getItem('pdb-compact-mode');
      if (savedCompact !== null) setCompactMode(savedCompact === 'true');
    } catch { /* ignore */ }
    try {
      const savedSidebarCompact = localStorage.getItem('pdb-sidebar-compact');
      if (savedSidebarCompact !== null) setSidebarCompact(savedSidebarCompact === 'true');
    } catch { /* ignore */ }
  }, []);

  // Auto-close sidebar/preview when resizing below xl breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setSidebarOpen(false);
        setPreviewOpen(false);
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Detail Panel (Row Detail Slide-over) ──
  const [selectedEntry, setSelectedEntry] = useState<PdbEntry | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  // ── Mobile Detection ──
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Bottom Sheet Snap State ──
  const [bottomSheetSnap, setBottomSheetSnap] = useState<number>(0.5);

  // ── Detail Panel Swipe Navigation (mobile) ──
  const detailSwipeX = useMotionValue(0);
  const [detailSlideDirection, setDetailSlideDirection] = useState<'left' | 'right' | null>(null);

  // ── Keyboard Navigation ──
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const [keyboardNavActive, setKeyboardNavActive] = useState(false);
  const [keyboardNavHintVisible, setKeyboardNavHintVisible] = useState(false);
  const keyboardActivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusedRowRef = useRef<HTMLTableRowElement | null>(null);
  const paginatedEntriesRef = useRef<PdbEntry[]>([]);

  // ── Timeline Highlight ──
  const [highlightedEntry, setHighlightedEntry] = useState<string | null>(null);

  // ── Row Pulse Animation ──
  const [pulsingRowId, setPulsingRowId] = useState<string | null>(null);
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Scroll Progress ──
  const [scrollProgress, setScrollProgress] = useState(0);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const handleTableScroll = useCallback(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) { setScrollProgress(0); return; }
    setScrollProgress((scrollTop / maxScroll) * 100);
  }, []);

  // ── Bookmarks ──
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set<string>());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [bookmarksExpanded, setBookmarksExpanded] = useState(true);

  // ── Entry Notes (localStorage) ──
  const [entryNotes, setEntryNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('pdb-tracker-notes');
      if (saved) return JSON.parse(saved) as Record<string, string>;
    } catch { /* ignore */ }
    return {};
  });
  const [noteSavedIndicator, setNoteSavedIndicator] = useState<string | null>(null);

  // Persist notes to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('pdb-tracker-notes', JSON.stringify(entryNotes));
    } catch { /* ignore */ }
  }, [entryNotes]);

  const updateNote = useCallback((pdbId: string, note: string) => {
    setEntryNotes(prev => {
      const next = { ...prev };
      if (note.trim()) {
        next[pdbId] = note;
      } else {
        delete next[pdbId];
      }
      return next;
    });
    setNoteSavedIndicator(pdbId);
    setTimeout(() => setNoteSavedIndicator(prev => prev === pdbId ? null : prev), 2000);
    toast('Note saved');
  }, []);

  // ── AI Summary Generation ──
  const generateAiSummary = useCallback(async (entry: PdbEntry) => {
    if (aiSummaryLoading === entry.pdbId) return;
    setAiSummaryLoading(entry.pdbId);
    setAiSummaryError(null);
    try {
      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdbId: entry.pdbId,
          title: entry.title,
          method: entry.method,
          resolution: entry.resolution,
          journal: entry.journal,
          journalIf: entry.journalIf,
          organisms: entry.organisms,
          ligands: entry.ligands,
        }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate summary');
      }
      const data = await response.json();
      setAiSummaries(prev => ({ ...prev, [entry.pdbId]: data.summary }));
    } catch (err: any) {
      setAiSummaryError(err?.message || 'Failed to generate AI summary');
      toast('AI Summary Error', { description: err?.message || 'Failed to generate summary' });
    } finally {
      setAiSummaryLoading(null);
    }
  }, [aiSummaryLoading]);

  // ── Diff Mode (Week Diff View) ──
  const [diffMode, setDiffMode] = useState(false);
  const [prevWeekEntries, setPrevWeekEntries] = useState<PdbEntry[]>([]);

  // ── Row Selection (Batch Operations) ──
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // ── Column Visibility ──
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set<string>());

  // ── Data Density ──
  const [compactMode, setCompactMode] = useState<boolean>(false);

  // Persist compact mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pdb-compact-mode', String(compactMode));
    } catch { /* ignore */ }
  }, [compactMode]);

  // ── Sidebar Compact Mode ──
  const [sidebarCompact, setSidebarCompact] = useState<boolean>(false);

  // Persist sidebar compact mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pdb-sidebar-compact', String(sidebarCompact));
    } catch { /* ignore */ }
  }, [sidebarCompact]);

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
      if (saved) return Math.min(400, Math.max(190, Number(saved)));
    } catch { /* ignore */ }
    return 266;
  });
  const [previewWidth, setPreviewWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pdb-preview-width');
      if (saved) return Math.min(480, Math.max(260, Number(saved)));
    } catch { /* ignore */ }
    return 320;
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
  const [hasLigandsFilter, setHasLigandsFilter] = useState(false);

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
    if (hasLigandsFilter) count++;
    return count;
  }, [resolutionRange, ifRange, selectedOrganisms, dateRange, qualityFilter, hasLigandsFilter]);

  const clearAdvancedFilters = useCallback(() => {
    setResolutionRange([0, 5]);
    setIfRange([0, 50]);
    setSelectedOrganisms(new Set());
    setDateRange({ from: '', to: '' });
    setQualityFilter('all');
    setHasLigandsFilter(false);
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

  // ── Entity Color Handler (for 3D viewer) ──
  const handleEntityColorChange = useCallback((entityId: string, color: string) => {
    setEntityColors(prev => ({ ...prev, [entityId]: color }));
    toast('Color updated', { description: `Entity ${entityId.split('.')[1]} color changed` });
  }, []);

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

  // ── Entity Colors (for 3D viewer) ──
  const [entityColors, setEntityColors] = useState<Record<string, string>>({});
  const [hoveredEntityInPanel, setHoveredEntityInPanel] = useState<string | null>(null);

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
    // Don't auto-start tour on mobile - it overlaps content
    if (window.innerWidth < 768) return;
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

  // ── Keyboard Shortcuts & Navigation ──
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

      // ── Keyboard-Driven Row Navigation ──
      if (mode === 'weekly' && !isMod && !e.altKey && paginatedEntriesRef.current.length > 0) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          setKeyboardNavActive(true);
          setKeyboardNavHintVisible(true);
          // Reset auto-hide timer
          if (keyboardActivityTimerRef.current) clearTimeout(keyboardActivityTimerRef.current);
          keyboardActivityTimerRef.current = setTimeout(() => setKeyboardNavHintVisible(false), 5000);

          setFocusedRowIndex(prev => {
            if (prev === null) {
              return e.key === 'ArrowDown' ? 0 : paginatedEntriesRef.current.length - 1;
            }
            const next = e.key === 'ArrowDown' ? prev + 1 : prev - 1;
            return Math.max(0, Math.min(next, paginatedEntriesRef.current.length - 1));
          });
        }
        if (e.key === 'Enter' && focusedRowIndex !== null) {
          e.preventDefault();
          const entry = paginatedEntriesRef.current[focusedRowIndex];
          if (entry) {
            setSelectedEntry(entry);
            setDetailPanelOpen(true);
            if (isMobile) setBottomSheetSnap(0.9);
          }
        }
        if (e.key === ' ' && focusedRowIndex !== null) {
          e.preventDefault();
          const entry = paginatedEntriesRef.current[focusedRowIndex];
          if (entry) toggleBookmark(entry.pdbId);
        }
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
        } else if (focusedRowIndex !== null) {
          setFocusedRowIndex(null);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, searchDropdownOpen, commandPaletteOpen, mode, focusedRowIndex, isMobile, toggleBookmark]);

  // ── Scroll focused row into view ──
  useEffect(() => {
    if (focusedRowIndex === null) return;
    const row = focusedRowRef.current;
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedRowIndex]);

  // ── Reset focused row on page/filter change ──
  useEffect(() => { setFocusedRowIndex(null); }, [currentPage, selectedWeekId, methodFilter, debouncedSearch, sortField, sortDir]);

  // ── Reset page on filter/sort change ──
  useEffect(() => { setCurrentPage(1); }, [selectedWeekId, methodFilter, debouncedSearch, sortField, sortDir, mode, selectedEvalId, resolutionRange, ifRange, selectedOrganisms, dateRange, qualityFilter, selectedTagFilter]);

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
    const filterCount = activeAdvancedFilterCount + (methodFilter !== 'all' ? 1 : 0) + (debouncedSearch ? 1 : 0) + (selectedTagFilter ? 1 : 0);
    if (filterCount > 0 && filterCount !== prevFilterCountRef.current) {
      prevFilterCountRef.current = filterCount;
      addNotification('filter', `Applied ${filterCount} filter${filterCount > 1 ? 's' : ''}`, 'Results updated with active filters');
    } else if (filterCount === 0) {
      prevFilterCountRef.current = 0;
    }
  }, [activeAdvancedFilterCount, methodFilter, debouncedSearch, selectedTagFilter, addNotification]);

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
        // Note: search query not sent to API — we filter client-side to support notes search
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
  }, [mode, selectedWeekId, methodFilter]);

  // ── Fetch All Entries for Heatmap ──
  useEffect(() => {
    if (mode !== 'weekly' || previewTab !== 'heatmap') return;
    if (heatmapEntries.length > 0) return; // already loaded
    let cancelled = false;
    async function load() {
      setHeatmapLoading(true);
      try {
        const res = await fetch('/api/entries?limit=1000');
        if (!cancelled) {
          const data = await res.json();
          setHeatmapEntries(data);
        }
      } catch (e) { console.error('Failed to fetch heatmap entries:', e); }
      finally { if (!cancelled) setHeatmapLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [mode, previewTab, heatmapEntries.length]);

  // ── Fetch Weekly Reports ──
  useEffect(() => {
    if (mode !== 'weekly' || !selectedWeekId) return;
    async function load() {
      try {
        const res = await fetch('/api/reports');
        const data: WeeklyReport[] = await res.json();
        // Match reports by comparing report weekId (date) with snapshot weekStart
        const snap = snapshots.find(s => s.weekId === selectedWeekId);
        setWeeklyReports(snap ? data.filter(r => r.weekId === snap.weekEnd) : []);
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

  // ── Find previous week for Diff Mode ──
  const prevWeekId = useMemo(() => {
    if (!diffMode || !selectedWeekId || snapshots.length === 0) return null;
    const sorted = [...snapshots].sort((a, b) => a.weekId.localeCompare(b.weekId));
    const currentIdx = sorted.findIndex(s => s.weekId === selectedWeekId);
    if (currentIdx <= 0) return null; // No previous week
    return sorted[currentIdx - 1].weekId;
  }, [diffMode, selectedWeekId, snapshots]);

  // ── Fetch Previous Week Entries for Diff Mode ──
  useEffect(() => {
    if (!diffMode || !prevWeekId) { setPrevWeekEntries([]); return; }
    let cancelled = false;
    async function load() {
      try {
        const params = new URLSearchParams();
        params.set('week', prevWeekId);
        const res = await fetch(`/api/entries?${params}`);
        if (!cancelled) {
          const data = await res.json();
          setPrevWeekEntries(data);
        }
      } catch (e) { console.error('Failed to fetch previous week entries for diff:', e); }
    }
    load();
    return () => { cancelled = true; };
  }, [diffMode, prevWeekId]);

  // ── Diff Computation ──
  const diffResult = useMemo(() => {
    if (!diffMode || !selectedWeekId || prevWeekEntries.length === 0 && entries.length === 0) {
      return { newIds: new Set<string>(), removedIds: new Set<string>(), unchangedIds: new Set<string>(), removedEntries: [] as PdbEntry[] };
    }
    const currentIds = new Set(entries.map(e => e.pdbId));
    const prevIds = new Set(prevWeekEntries.map(e => e.pdbId));
    const newIds = new Set([...currentIds].filter(id => !prevIds.has(id)));
    const removedIds = new Set([...prevIds].filter(id => !currentIds.has(id)));
    const unchangedIds = new Set([...currentIds].filter(id => prevIds.has(id)));
    const removedEntries = prevWeekEntries.filter(e => removedIds.has(e.pdbId));
    return { newIds, removedIds, unchangedIds, removedEntries };
  }, [diffMode, selectedWeekId, entries, prevWeekEntries]);

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

  // ── Fetch Evaluation Reports ──
  useEffect(() => {
    if (mode !== 'evaluation') return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/evaluation-reports');
        if (!cancelled) {
          const data = await res.json();
          setEvalReports(data);
        }
      } catch (e) { console.error('Failed to fetch evaluation reports:', e); }
    }
    load();
    return () => { cancelled = true; };
  }, [mode]);

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
    // Client-side search filtering (includes notes search)
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      source = source.filter(e => {
        // Match entry fields
        const fieldMatch =
          e.pdbId.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q) ||
          (e.organisms || '').toLowerCase().includes(q) ||
          (e.journal || '').toLowerCase().includes(q) ||
          (e.authors || '').toLowerCase().includes(q) ||
          (e.ligands || '').toLowerCase().includes(q) ||
          (e.doi || '').toLowerCase().includes(q);
        // Match notes
        const noteMatch = entryNotes[e.pdbId]?.toLowerCase().includes(q) ?? false;
        return fieldMatch || noteMatch;
      });
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
          case 'high': return qs.total >= 70;
          case 'good': return qs.total >= 60 && qs.total < 80;
          case 'fair': return qs.total >= 40 && qs.total < 60;
          case 'low': return qs.total < 40;
          default: return true;
        }
      });
    }
    if (hasLigandsFilter) {
      source = source.filter(e => {
        if (!e.ligands) return false;
        const ligandList = parseLigands(e.ligands);
        return ligandList.length > 0 && !ligandList.every(l => l === 'N/A');
      });
    }
    if (selectedTagFilter) {
      source = source.filter(e => {
        const entryTags = generateTags(e, diffMode && diffResult.newIds.has(e.pdbId));
        return entryTags.some(t => t.label === selectedTagFilter);
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
  }, [entries, sortField, sortDir, showBookmarksOnly, bookmarks, resolutionRange, ifRange, selectedOrganisms, dateRange, qualityFilter, hasLigandsFilter, selectedTagFilter, diffMode, diffResult, debouncedSearch, entryNotes]);

  // ── Paginated Weekly Entries ──
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedEntries.slice(start, start + PAGE_SIZE);
  }, [sortedEntries, currentPage]);
  paginatedEntriesRef.current = paginatedEntries;

  const totalPages = Math.ceil(sortedEntries.length / PAGE_SIZE);

  // ── Sorted Evaluation Data ──
  const sortedEvalRows = useMemo(() => {
    // If a complex group is selected, show merged data
    if (selectedComplexId && complexEvalData) {
      const all = [...complexEvalData.allStructures, ...complexEvalData.allBlasts];
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
    }

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
  }, [selectedEval, selectedComplexId, complexEvalData, sortField, sortDir]);

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
      const vals = Object.values(s).map(v => typeof v === 'number' ? v : (v as any)?.score ?? 0) as number[];
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

  // ── JSON Export ──
  const handleExportJson = useCallback(() => {
    if (!sortedEntries.length) return;
    const data = sortedEntries.map(entry => ({
      pdbId: entry.pdbId,
      method: getMethodLabel(entry.method),
      resolution: entry.resolution,
      impactFactor: entry.journalIf,
      organism: entry.organisms,
      title: entry.title,
      releaseDate: entry.releaseDate,
      ligands: entry.ligands,
      journal: entry.journal,
      doi: entry.doi,
      authors: entry.authors,
      ifTier: entry.ifTier,
    }));
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdb-structures-${selectedWeekId || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported as JSON`, { description: `${sortedEntries.length} structures downloaded` });
    addNotification('export', `Exported ${sortedEntries.length} structures as JSON`, 'Downloaded as JSON file');
  }, [sortedEntries, selectedWeekId, addNotification]);

  // ── JSON Full Export ──
  const handleExportJsonFull = useCallback(() => {
    if (!sortedEntries.length) return;
    const data = {
      metadata: {
        exportedAt: new Date().toISOString(),
        weekId: selectedWeekId,
        weekStart: selectedSnapshot?.weekStart || null,
        weekEnd: selectedSnapshot?.weekEnd || null,
        totalStructures: sortedEntries.length,
        snapshot: selectedSnapshot ? {
          cryoemCount: selectedSnapshot.cryoemCount,
          xrayCount: selectedSnapshot.xrayCount,
          nmrCount: selectedSnapshot.nmrCount,
          otherCount: selectedSnapshot.otherCount,
          cryoemAvgRes: selectedSnapshot.cryoemAvgRes,
          xrayAvgRes: selectedSnapshot.xrayAvgRes,
          topJournals: selectedSnapshot.topJournals,
          ifDist: selectedSnapshot.ifDist,
        } : null,
        evaluations: evaluations.length,
        filters: {
          methodFilter,
          searchQuery,
        },
      },
      entries: sortedEntries.map(entry => ({
        pdbId: entry.pdbId,
        method: entry.method,
        methodLabel: getMethodLabel(entry.method),
        resolution: entry.resolution,
        impactFactor: entry.journalIf,
        ifTier: entry.ifTier,
        organism: entry.organisms,
        title: entry.title,
        releaseDate: entry.releaseDate,
        fetchDate: entry.fetchDate,
        ligands: entry.ligands,
        journal: entry.journal,
        doi: entry.doi,
        pubmedId: entry.pubmedId,
        authors: entry.authors,
        weekId: entry.weekId,
        isCryoem: entry.isCryoem,
        isXray: entry.isXray,
      })),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdb-structures-${selectedWeekId || 'export'}-full.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported as JSON (Full)`, { description: `${sortedEntries.length} structures with metadata` });
    addNotification('export', `Exported ${sortedEntries.length} structures as JSON (Full)`, 'Downloaded with metadata');
  }, [sortedEntries, selectedWeekId, selectedSnapshot, evaluations, methodFilter, searchQuery, addNotification]);

  // ── Markdown Table Export ──
  const handleExportMarkdown = useCallback(() => {
    if (!sortedEntries.length) return;
    const headers = ['PDB ID', 'Method', 'Resolution', 'IF', 'Organism', 'Title', 'Date'];
    const rows = sortedEntries.map(entry =>
      `| ${entry.pdbId} | ${getMethodLabel(entry.method)} | ${entry.resolution != null ? entry.resolution + 'Å' : '—'} | ${entry.journalIf != null ? safeNum(entry.journalIf, 1) : '—'} | ${(entry.organisms || '—').split('|')[0]?.trim() || '—'} | ${entry.title || '—'} | ${entry.releaseDate || '—'} |`
    );
    const separator = `| ${headers.map(() => '---').join(' | ')} |`;
    const md = [`| ${headers.join(' | ')} |`, separator, ...rows].join('\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdb-structures-${selectedWeekId || 'export'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported as Markdown`, { description: `${sortedEntries.length} structures as table` });
    addNotification('export', `Exported ${sortedEntries.length} structures as Markdown`, 'Downloaded as Markdown table');
  }, [sortedEntries, selectedWeekId, addNotification]);

  // ── Clipboard Export ──
  const handleExportClipboard = useCallback(() => {
    if (!sortedEntries.length) return;
    const headers = ['PDB ID', 'Method', 'Resolution', 'IF', 'Organism', 'Title', 'Date', 'Ligands'];
    const rows = sortedEntries.map(entry => [
      entry.pdbId,
      getMethodLabel(entry.method),
      entry.resolution != null ? String(entry.resolution) : '',
      entry.journalIf != null ? String(entry.journalIf) : '',
      (entry.organisms || '').split('|')[0]?.trim() || '',
      entry.title || '',
      entry.releaseDate || '',
      entry.ligands || '',
    ].join('\t'));
    const tsv = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(tsv).then(() => {
      toast('Copied to clipboard', { description: `${sortedEntries.length} structures as tab-separated values` });
      addNotification('export', `Copied ${sortedEntries.length} structures to clipboard`, 'Tab-separated values ready to paste');
    }).catch(() => {
      toast('Failed to copy', { description: 'Please try again or use download export' });
    });
  }, [sortedEntries, addNotification]);

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
      <div className="flex flex-col min-h-full w-full overflow-hidden" suppressHydrationWarning>

        {/* ═══════════ HEADER BAR ═══════════ */}
        <header className={`flex-shrink-0 h-[48px] sm:h-[52px] flex items-center px-2 sm:px-4 bg-claude-surface dark:bg-[#242220] border-b border-claude-border dark:border-[#3d3832] relative z-20 no-print ${hasLoaded ? 'animate-load-header' : 'opacity-0'}`}>
          {/* Gradient border at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-claude-accent/20 to-transparent bg-[length:200%_100%] animate-[gradient-shift_3s_ease-in-out_infinite]" />
          {/* Header Particles */}
          <HeaderParticles />
          <div ref={tourTitleRef} className="flex items-center gap-1.5 sm:gap-3 relative z-10 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-claude-accent-light dark:bg-[#3d2a22] flex-shrink-0">
              <Dna className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-claude-accent" />
            </div>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-base font-semibold text-claude-text leading-tight header-title" style={{ letterSpacing: '-0.02em' }}>PDB Structure Tracker</h1>
              <p className="text-[10px] text-claude-text-muted leading-tight">Protein Data Bank Weekly Tracking & Evaluation System</p>
            </div>
            <div className="sm:hidden min-w-0">
              <h1 className="text-sm font-semibold text-claude-text leading-tight" style={{ letterSpacing: '-0.02em' }}>PDB Tracker</h1>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1 relative z-10 ml-auto">
          {/* Command Palette Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden sm:inline-flex items-center justify-center min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-8 sm:w-8 rounded-md hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150 claude-focus-ring btn-press ripple-btn"
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
                className="hidden sm:inline-flex items-center justify-center min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-8 sm:w-8 rounded-md hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150 claude-focus-ring btn-press ripple-btn"
                aria-label="Keyboard shortcuts"
              >
                <Keyboard className="h-4 w-4 text-claude-text-secondary" />
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-56 p-3 bg-white dark:bg-[#2b2926] dark:border-[#4a4540]">
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
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-8 sm:w-8 rounded-md hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150 claude-focus-ring btn-press ripple-btn"
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
                className="hidden sm:inline-flex relative items-center justify-center min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-8 sm:w-8 rounded-md hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150 claude-focus-ring btn-press ripple-btn"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-claude-text-secondary" />
                {unreadCount > 0 && (
                  <span className="h-2 w-2 rounded-full bg-red-500 absolute top-1 right-1" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 bg-claude-surface dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] shadow-xl rounded-lg">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-claude-border dark:border-[#4a4540]">
                <span className="text-xs font-semibold text-claude-text">Notifications</span>
                <div className="flex items-center gap-1">
                  {notifications.length > 0 && (
                    <>
                      <button
                        onClick={markAllNotificationsRead}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-claude-text-muted hover:text-claude-text hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors"
                        title="Mark all as read"
                      >
                        <CheckCheck className="h-3 w-3" />
                      </button>
                      <button
                        onClick={clearAllNotifications}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-claude-text-muted hover:text-claude-text hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors"
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
                        className={`p-2.5 rounded-lg hover:bg-claude-bg/50 dark:hover:bg-claude-border-light/50 border-l-2 ${notif.read ? 'border-transparent' : 'border-claude-accent'} mx-1.5 my-0.5`}
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
            className="hidden sm:inline-flex items-center justify-center sm:h-8 sm:w-8 rounded-md hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150 claude-focus-ring btn-press ripple-btn"
            aria-label="Toggle dark mode"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-4 w-4 text-claude-text-secondary" />
            ) : (
              <Moon className="h-4 w-4 text-claude-text-secondary" />
            )}
          </button>

          {/* Mobile/tablet hamburger menu */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden inline-flex items-center justify-center h-9 w-9 sm:h-8 sm:w-8 rounded-md hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5 text-claude-text-secondary" />
          </button>

          {/* Mobile/tablet preview toggle */}
          <button
            onClick={() => setMobilePreviewOpen(true)}
            className="ml-0.5 lg:hidden inline-flex items-center justify-center h-9 w-9 sm:h-8 sm:w-8 rounded-md hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150"
            aria-label="Open preview panel"
          >
            <BarChart3 className="h-5 w-5 text-claude-text-secondary" />
          </button>
          </div>
        </header>

        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ═══════════ LEFT SIDEBAR ═══════════ */}
          {/* Desktop sidebar - visible when open on xl+ */}
          {sidebarOpen && (
            <aside className={`hidden lg:flex h-full flex-shrink-0 border-r border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] flex-col no-print sidebar-gradient overflow-hidden relative ${hasLoaded ? 'animate-load-sidebar' : 'opacity-0'}`} style={{ width: sidebarWidth }}>
              {/* Sidebar gradient mesh overlay */}
              <div className="sidebar-mesh-overlay" />
              <div className="flex flex-col flex-1 min-h-0">
                {renderSidebar()}
              </div>
              {/* Sidebar resize handle */}
              <div
                onMouseDown={handleSidebarMouseDown}
                className={`absolute top-0 right-0 bottom-0 w-1 hover:bg-claude-accent/30 transition-colors duration-150 cursor-col-resize z-10 ${resizingSidebar ? 'bg-claude-accent/50' : ''}`}
              />
            </aside>
          )}

          {/* Desktop sidebar collapsed strip - when sidebarOpen is false on xl+ */}
          {!sidebarOpen && (
            <div className="hidden lg:flex w-14 flex-shrink-0 border-r border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] flex-col items-center pt-3 gap-1 no-print sidebar-gradient overflow-hidden relative">
              <div className="sidebar-mesh-overlay" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150"
                  >
                    <PanelLeftOpen className="h-4 w-4 text-claude-text-secondary" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">Expand sidebar</TooltipContent>
              </Tooltip>
              {/* Mode toggle buttons */}
              <div className="flex flex-col items-center gap-1 mt-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { setMode('weekly'); setSelectedEvalId(null); setSelectedEval(null); setSearchQuery(''); setSearchDropdownOpen(false); }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                        mode === 'weekly'
                          ? 'bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent shadow-sm'
                          : 'text-claude-text-muted hover:bg-claude-border-light dark:hover:bg-[#3d3832] hover:text-claude-text-secondary'
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">Weekly Mode</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { setMode('evaluation'); setSearchQuery(''); setSearchDropdownOpen(false); }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                        mode === 'evaluation'
                          ? 'bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent shadow-sm'
                          : 'text-claude-text-muted hover:bg-claude-border-light dark:hover:bg-[#3d3832] hover:text-claude-text-secondary'
                      }`}
                    >
                      <Microscope className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">Evaluation Mode</TooltipContent>
                </Tooltip>
              </div>
              {/* Mini week/eval cards - scrollable */}
              <div className="flex-1 overflow-y-auto custom-scrollbar sidebar-scroll mt-1 w-full flex flex-col items-center gap-1 px-1">
                {mode === 'weekly' && snapshots.slice(0, 20).map(snap => (
                  <HoverCard key={snap.weekId} openDelay={300} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <button
                        onClick={() => { setSelectedWeekId(snap.weekId); setPreviewOpen(true); setMobileSidebarOpen(false); }}
                        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, weekId: snap.weekId }); }}
                        className={`w-full h-8 rounded-lg flex items-center justify-center text-[10px] font-mono font-semibold transition-all duration-150 ${
                          selectedWeekId === snap.weekId
                            ? 'bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent shadow-sm'
                            : 'text-claude-text-muted hover:bg-claude-border-light dark:hover:bg-[#3d3832] hover:text-claude-text-secondary'
                        }`}
                      >
                        {snap.weekId.replace('W', '')}
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent
                      side="right"
                      align="center"
                      className="w-56 p-3 space-y-2 bg-white dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] rounded-xl shadow-xl"
                    >
                      <div className="text-xs font-semibold text-claude-text">{snap.weekId}</div>
                      <div className="text-[10px] text-claude-text-muted">
                        {formatDate(snap.weekStart)} — {formatDate(snap.weekEnd)}
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
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
                      </div>
                      {/* Method ratio progress bar */}
                      <div className="flex h-1.5 rounded-full overflow-hidden bg-claude-border-light dark:bg-[#3d3832]">
                        {snap.cryoemCount > 0 && (
                          <div className="h-full bg-claude-cryoem" style={{ width: `${(snap.cryoemCount / snap.totalStructures) * 100}%` }} />
                        )}
                        {snap.xrayCount > 0 && (
                          <div className="h-full bg-claude-xray" style={{ width: `${(snap.xrayCount / snap.totalStructures) * 100}%` }} />
                        )}
                        {snap.nmrCount > 0 && (
                          <div className="h-full bg-claude-nmr" style={{ width: `${(snap.nmrCount / snap.totalStructures) * 100}%` }} />
                        )}
                        {snap.otherCount > 0 && (
                          <div className="h-full bg-claude-other" style={{ width: `${(snap.otherCount / snap.totalStructures) * 100}%` }} />
                        )}
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-claude-text-muted">Total</span>
                        <span className="font-mono text-claude-text-secondary">{snap.totalStructures}</span>
                      </div>
                      <div className="text-[9px] text-claude-text-muted/60 text-center pt-1 border-t border-claude-border/50">
                        Click to view
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
                {mode === 'evaluation' && evaluations.slice(0, 20).map(ev => {
                  const evCryoem = ev.pdbStructures.filter(s => s.method === 'Cryo-EM').length;
                  const evXray = ev.pdbStructures.filter(s => s.method === 'X-ray').length;
                  const resStructures = ev.pdbStructures.filter(s => s.resolution != null);
                  const evAvgRes = resStructures.length > 0
                    ? resStructures.reduce((sum, s) => sum + s.resolution!, 0) / resStructures.length
                    : null;
                  const evBlast = ev.blastResults.length;
                  const evTotal = ev.pdbStructures.length + evBlast;
                  return (
                    <HoverCard key={ev.uniprotId} openDelay={300} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <button
                          onClick={() => { setSelectedEvalId(ev.uniprotId); setPreviewOpen(true); setMobileSidebarOpen(false); }}
                          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setEvalContextMenu({ x: e.clientX, y: e.clientY, uniprotId: ev.uniprotId }); }}
                          className={`w-full h-8 rounded-lg flex items-center justify-center text-[10px] font-mono font-semibold transition-all duration-150 overflow-hidden truncate px-1 ${
                            selectedEvalId === ev.uniprotId
                              ? 'bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent shadow-sm'
                              : 'text-claude-text-muted hover:bg-claude-border-light dark:hover:bg-[#3d3832] hover:text-claude-text-secondary'
                          }`}
                        >
                          {ev.uniprotId.replace('U', '')}
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="right"
                        align="center"
                        className="w-56 p-3 space-y-2 bg-white dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] rounded-xl shadow-xl"
                      >
                        <div className="text-xs font-semibold text-claude-text truncate">{ev.proteinName || ev.uniprotId}</div>
                        {ev.geneNames && <div className="text-[10px] text-claude-text-muted">Gene: {ev.geneNames}</div>}
                        <div className="flex gap-1.5 flex-wrap">
                          {evCryoem > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-cryoem-bg text-claude-cryoem">
                              EM {evCryoem}
                            </span>
                          )}
                          {evXray > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-xray-bg text-claude-xray">
                              XR {evXray}
                            </span>
                          )}
                          {evBlast > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent">
                              BLAST {evBlast}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-claude-text-muted">Total structures</span>
                          <span className="font-mono text-claude-text-secondary">{evTotal}</span>
                        </div>
                        {evAvgRes != null && (
                          <div className="flex justify-between text-[10px]">
                            <span className="text-claude-text-muted">Avg Resolution</span>
                            <span className="font-mono text-claude-text-secondary">{evAvgRes.toFixed(2)}Å</span>
                          </div>
                        )}
                        <div className="text-[9px] text-claude-text-muted/60 text-center pt-1 border-t border-claude-border/50">
                          Click to view
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════ MOBILE/TABLET SIDEBAR (Overlay Panel) ═══════════ */}
          <AnimatePresence>
            {mobileSidebarOpen && (
              <>
                <motion.div
                  key="sidebar-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                  onClick={() => setMobileSidebarOpen(false)}
                />
                <motion.div
                  key="sidebar-panel"
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="fixed left-0 top-0 bottom-0 z-50 w-[280px] max-w-[85vw] bg-claude-surface dark:bg-[#242220] border-r border-claude-border dark:border-[#3d3832] flex flex-col lg:hidden shadow-2xl sidebar-gradient overflow-hidden relative"
                >
                  <div className="sidebar-mesh-overlay" />
                  {/* Close button header */}
                  <div className="flex items-center justify-between px-3 border-b border-claude-border dark:border-[#3d3832] relative z-[1] h-12">
                    <span className="text-xs font-semibold text-claude-text">Navigation</span>
                    <button
                      onClick={() => setMobileSidebarOpen(false)}
                      className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150"
                      aria-label="Close navigation menu"
                    >
                      <X className="h-4 w-4 text-claude-text-muted" />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden relative z-[1]">
                    {renderSidebar()}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ═══════════ MAIN AREA ═══════════ */}
          <div className={`flex-1 flex flex-col min-w-0 overflow-hidden relative dark:bg-[#1a1917] ${hasLoaded ? 'animate-load-main' : 'opacity-0'}`}>
            {/* Ambient Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
              <div className="ambient-orb ambient-orb-1" style={{ width: '300px', height: '300px', top: '10%', left: '5%', background: 'rgba(201, 100, 66, 0.03)' }} />
              <div className="ambient-orb ambient-orb-2" style={{ width: '350px', height: '350px', top: '50%', right: '10%', background: 'rgba(253, 240, 235, 0.08)' }} />
              <div className="ambient-orb ambient-orb-3" style={{ width: '250px', height: '250px', bottom: '20%', left: '30%', background: 'rgba(45, 143, 143, 0.03)' }} />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 border-b border-claude-border dark:border-[#3d3832] bg-claude-surface/80 dark:bg-[#242220]/90 backdrop-blur-sm no-print overflow-x-auto h-12">
              {mode === 'weekly' ? (
                <>
                  {/* Advanced Filters Button */}
                  <button
                    onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
                    className={`inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-[11px] font-medium border transition-colors duration-150 relative claude-focus-ring ${
                      advancedFiltersOpen || activeAdvancedFilterCount > 0
                        ? 'border-claude-accent bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent'
                        : 'border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border'
                    }`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>Filters</span>
                    {activeAdvancedFilterCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[14px] h-[14px] px-[3px] rounded-full text-[8px] font-bold bg-claude-accent text-white leading-none ml-1">
                        {activeAdvancedFilterCount}
                      </span>
                    )}
                  </button>

                  {/* Search */}
                  <div ref={tourSearchRef} className="relative flex-1 min-w-[120px] max-w-xs">
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
                      className="w-full pl-8 pr-3 h-8 text-xs rounded-md border border-claude-border dark:border-[#3d3832] bg-white dark:bg-[#1a1917] dark:text-[#e8e4dd] focus:outline-none focus:ring-2 focus:ring-claude-accent/40 focus:border-claude-accent/40 placeholder:text-claude-text-muted/60 input-focus-glow"
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
                  <div className="hidden sm:flex items-center gap-1.5 flex-wrap no-print">
                    {methodFilter !== 'all' && (
                      <AnimatePresence>
                        <motion.span
                          initial={{ opacity: 0, x: -8, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -8, scale: 0.9 }}
                          transition={{ duration: 0.15 }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20"
                        >
                        Method: {getMethodLabel(methodFilter === 'Cryo-EM' ? 'CRYO-EM' : methodFilter === 'X-RAY DIFFRACTION' ? 'X-RAY DIFFRACTION' : methodFilter === 'SOLUTION NMR' ? 'SOLUTION NMR' : methodFilter)}
                        <button onClick={() => setMethodFilter('all')} className="hover:text-claude-accent/80 transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                        </motion.span>
                      </AnimatePresence>
                    )}
                    {searchQuery && (
                      <AnimatePresence>
                        <motion.span
                          initial={{ opacity: 0, x: -8, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -8, scale: 0.9 }}
                          transition={{ duration: 0.15 }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20"
                        >
                        Search: {searchQuery.length > 12 ? searchQuery.slice(0, 12) + '…' : searchQuery}
                        <button onClick={() => setSearchQuery('')} className="hover:text-claude-accent/80 transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                        </motion.span>
                      </AnimatePresence>
                    )}
                    {showBookmarksOnly && (
                      <AnimatePresence>
                        <motion.span
                          initial={{ opacity: 0, x: -8, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -8, scale: 0.9 }}
                          transition={{ duration: 0.15 }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20"
                        >
                        Bookmarked
                        <button onClick={() => setShowBookmarksOnly(false)} className="hover:text-claude-accent/80 transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                        </motion.span>
                      </AnimatePresence>
                    )}
                    {selectedTagFilter && (() => {
                      const tagInfo = (() => {
                        for (const entry of entries) {
                          const tags = generateTags(entry, diffMode && diffResult.newIds.has(entry.pdbId));
                          const found = tags.find(t => t.label === selectedTagFilter);
                          if (found) return found;
                        }
                        return null;
                      })();
                      const tagStyle = tagInfo ? TAG_CATEGORY_STYLES[tagInfo.category] : null;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${tagStyle ? `${tagStyle.bg} ${tagStyle.text} ${tagStyle.border} ${tagStyle.darkBg} ${tagStyle.darkText}` : 'bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20'}`}>
                          <Tag className="h-2.5 w-2.5" />
                          {selectedTagFilter}
                          <button onClick={() => setSelectedTagFilter(null)} className="hover:opacity-70 transition-opacity">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      );
                    })()}
                    {diffMode && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30">
                        <FileDiff className="h-2.5 w-2.5" />
                        Diff
                        <button onClick={() => setDiffMode(false)} className="hover:text-green-600 dark:hover:text-green-300 transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    )}
                    {Object.keys(entryNotes).length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
                        <StickyNote className="h-2.5 w-2.5" />
                        {Object.keys(entryNotes).length} note{Object.keys(entryNotes).length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {selectedRows.size > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20">
                        {selectedRows.size} selected
                        <button onClick={clearSelection} className="hover:text-claude-accent/80 transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    )}
                    {entryCompareCount > 0 && (
                      <button
                        onClick={() => {
                          if (entryCompareCount === 2) {
                            setEntryCompareModalOpen(true);
                          } else {
                            toast('Select one more entry to compare', { description: 'Click the compare icon on another row' });
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/30 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                      >
                        <Columns className="h-2.5 w-2.5" />
                        Comparing {entryCompareCount}/2
                        <span
                          onClick={(e) => { e.stopPropagation(); clearEntryComparison(); }}
                          className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors ml-0.5"
                        >
                          <X className="h-2.5 w-2.5" />
                        </span>
                      </button>
                    )}
                    {hasLigandsFilter && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30">
                        <Dna className="h-2.5 w-2.5" />
                        Ligands
                        <button onClick={() => setHasLigandsFilter(false)} className="hover:text-rose-600 dark:hover:text-rose-300 transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    )}
                  </div>

                  {/* Presets Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="hidden sm:inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-[11px] font-medium border border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150 claude-focus-ring btn-press"
                      >
                        <Sparkles className="h-3 w-3" />
                        Presets
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel className="text-[10px] text-claude-text-muted">Quick Filter Presets</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-xs cursor-pointer"
                        onClick={() => {
                          setResolutionRange([0, 2.0]);
                          setAdvancedFiltersOpen(true);
                          toast('Applied preset: High Resolution', { description: 'Resolution ≤ 2.0Å' });
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
                        High Resolution
                        <span className="ml-auto text-[9px] text-claude-text-muted">≤ 2.0Å</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-xs cursor-pointer"
                        onClick={() => {
                          setIfRange([10, 50]);
                          setAdvancedFiltersOpen(true);
                          toast('Applied preset: Top Journals', { description: 'Impact Factor ≥ 10' });
                        }}
                      >
                        <Star className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mr-2 flex-shrink-0" />
                        Top Journals
                        <span className="ml-auto text-[9px] text-claude-text-muted">IF ≥ 10</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-xs cursor-pointer"
                        onClick={() => {
                          setMethodFilter('Cryo-EM');
                          toast('Applied preset: Cryo-EM Only', { description: 'Showing only Cryo-EM structures' });
                        }}
                      >
                        <FlaskConical className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 mr-2 flex-shrink-0" />
                        Cryo-EM Only
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-xs cursor-pointer"
                        onClick={() => {
                          setMethodFilter('X-RAY DIFFRACTION');
                          toast('Applied preset: X-ray Only', { description: 'Showing only X-ray structures' });
                        }}
                      >
                        <Activity className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0" />
                        X-ray Only
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-xs cursor-pointer"
                        onClick={() => {
                          const sevenDaysAgo = new Date();
                          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                          const fromStr = sevenDaysAgo.toISOString().slice(0, 10);
                          setDateRange(prev => ({ ...prev, from: fromStr }));
                          setAdvancedFiltersOpen(true);
                          toast('Applied preset: Recent (7 days)', { description: `From ${fromStr}` });
                        }}
                      >
                        <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                        Recent (7 days)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-xs cursor-pointer"
                        onClick={() => {
                          setHasLigandsFilter(true);
                          setAdvancedFiltersOpen(true);
                          toast('Applied preset: With Ligands', { description: 'Showing entries that have ligands' });
                        }}
                      >
                        <Dna className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 mr-2 flex-shrink-0" />
                        With Ligands
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-xs cursor-pointer"
                        onClick={() => {
                          setQualityFilter('high');
                          setAdvancedFiltersOpen(true);
                          toast('Applied preset: High Quality', { description: 'Quality score ≥ 70' });
                        }}
                      >
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mr-2 flex-shrink-0" />
                        High Quality
                        <span className="ml-auto text-[9px] text-claude-text-muted">≥ 70</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-xs cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                        onClick={() => {
                          setMethodFilter('all');
                          setSearchQuery('');
                          setShowBookmarksOnly(false);
                          clearAdvancedFilters();
                          toast('All filters cleared');
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                        Clear All Filters
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Column Visibility Toggle */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="hidden sm:inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-[11px] font-medium border border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150 claude-focus-ring btn-press"
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
                        className={`hidden sm:inline-flex items-center justify-center h-7 w-7 rounded-md text-[11px] font-medium border transition-colors duration-150 claude-focus-ring ${
                          compactMode
                            ? 'border-claude-accent bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent'
                            : 'border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border'
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="hidden sm:inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-[11px] font-medium border border-claude-border bg-claude-surface text-claude-text-secondary hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150 claude-focus-ring btn-press"
                        >
                          <Download className="h-3 w-3" />
                          Export
                          <ChevronDown className="h-3 w-3 ml-0.5 opacity-50" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-[10px] text-claude-text-muted">Export Format</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleExportCsv} className="text-xs cursor-pointer">
                          <FileText className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                          CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportJson} className="text-xs cursor-pointer">
                          <FileJson className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                          JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportJsonFull} className="text-xs cursor-pointer">
                          <FileJson className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                          JSON (Full)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportMarkdown} className="text-xs cursor-pointer">
                          <TableIcon className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                          Markdown Table
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleExportClipboard} className="text-xs cursor-pointer">
                          <ClipboardCopy className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                          Copy to Clipboard
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Compare Week Selector */}
                  {compareMode && (
                    <Select value={compareWeekId || ''} onValueChange={setCompareWeekId}>
                      <SelectTrigger className="w-[140px] h-7 min-h-[44px] sm:min-h-0 text-[11px]">
                        <SelectValue placeholder="Compare with..." />
                      </SelectTrigger>
                      <SelectContent className="text-[11px]">
                        {snapshots
                          .filter(s => s.weekId !== selectedWeekId)
                          .map(s => (
                            <SelectItem key={s.weekId} value={s.weekId} className="text-[11px] py-1">
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

              {/* Preview Toggle (desktop) - removed; sidebar auto-opens on row click */}
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
                    <div className="bg-claude-surface dark:bg-[#242220] border-b border-claude-border dark:border-[#3d3832] p-4">
                      {/* Panel Header - Active Filter Chips + Clear All */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-claude-text-secondary">Active Filters</span>
                          {/* Active filter chips */}
                          {(resolutionRange[0] !== 0 || resolutionRange[1] !== 5) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20">
                              {resolutionRange[0].toFixed(1)}Å — {resolutionRange[1].toFixed(1)}Å
                              <button onClick={() => setResolutionRange([0, 5])} className="hover:text-claude-accent/80 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          )}
                          {(ifRange[0] !== 0 || ifRange[1] !== 50) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20">
                              IF: {ifRange[0].toFixed(1)} — {ifRange[1].toFixed(1)}
                              <button onClick={() => setIfRange([0, 50])} className="hover:text-claude-accent/80 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          )}
                          {selectedOrganisms.size > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20">
                              {selectedOrganisms.size} organism{selectedOrganisms.size > 1 ? 's' : ''}
                              <button onClick={() => setSelectedOrganisms(new Set())} className="hover:text-claude-accent/80 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          )}
                          {dateRange.from && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20">
                              From: {dateRange.from}
                              <button onClick={() => setDateRange(prev => ({ ...prev, from: '' }))} className="hover:text-claude-accent/80 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          )}
                          {dateRange.to && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20">
                              To: {dateRange.to}
                              <button onClick={() => setDateRange(prev => ({ ...prev, to: '' }))} className="hover:text-claude-accent/80 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          )}
                          {qualityFilter !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20">
                              Quality: {qualityFilter === 'excellent' ? 'Excellent' : qualityFilter === 'high' ? 'High' : qualityFilter === 'good' ? 'Good' : qualityFilter === 'fair' ? 'Fair' : 'Low'}
                              <button onClick={() => setQualityFilter('all')} className="hover:text-claude-accent/80 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          )}
                          {hasLigandsFilter && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30">
                              <Dna className="h-2.5 w-2.5" />
                              With Ligands
                              <button onClick={() => setHasLigandsFilter(false)} className="hover:text-rose-600 dark:hover:text-rose-300 transition-colors">
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
                            className="w-full [&_[data-slot=slider-range]]:bg-claude-accent [&_[data-slot=slider-thumb]]:border-claude-accent [&_[data-slot=slider-thumb]]:hover:ring-claude-accent/20 [&_[data-slot=slider-thumb]]:focus-visible:ring-claude-accent/20"
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
                            className="w-full [&_[data-slot=slider-range]]:bg-claude-accent [&_[data-slot=slider-thumb]]:border-claude-accent [&_[data-slot=slider-thumb]]:hover:ring-claude-accent/20 [&_[data-slot=slider-thumb]]:focus-visible:ring-claude-accent/20"
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
                                  className="h-3.5 w-3.5 data-[state=checked]:bg-claude-accent data-[state=checked]:border-claude-accent"
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
                              className="flex-1 px-2 py-1.5 text-xs rounded-md border border-claude-border dark:border-[#3d3832] bg-white dark:bg-[#1a1917] dark:text-[#e8e4dd] focus:outline-none focus:ring-1 focus:ring-claude-accent/40 focus:border-claude-accent/40 [color-scheme:light] dark:[color-scheme:dark]"
                              placeholder="From"
                            />
                            <span className="text-[10px] text-claude-text-muted">—</span>
                            <input
                              type="date"
                              value={dateRange.to}
                              onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                              className="flex-1 px-2 py-1.5 text-xs rounded-md border border-claude-border dark:border-[#3d3832] bg-white dark:bg-[#1a1917] dark:text-[#e8e4dd] focus:outline-none focus:ring-1 focus:ring-claude-accent/40 focus:border-claude-accent/40 [color-scheme:light] dark:[color-scheme:dark]"
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
                                  <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                                  Excellent (≥80)
                                </span>
                              </SelectItem>
                              <SelectItem value="high">
                                <span className="flex items-center gap-1.5">
                                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                  High (≥70)
                                </span>
                              </SelectItem>
                              <SelectItem value="good">
                                <span className="flex items-center gap-1.5">
                                  <span className="inline-flex h-2 w-2 rounded-full bg-teal-500" />
                                  Good (60–79)
                                </span>
                              </SelectItem>
                              <SelectItem value="fair">
                                <span className="flex items-center gap-1.5">
                                  <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
                                  Fair (40–59)
                                </span>
                              </SelectItem>
                              <SelectItem value="low">
                                <span className="flex items-center gap-1.5">
                                  <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
                                  Low (&lt;40)
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Has Ligands Filter */}
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <label className="text-xs font-semibold text-claude-text-secondary">Ligands</label>
                          <label className="flex items-center gap-2 text-xs text-claude-text-secondary hover:text-claude-text cursor-pointer py-0.5">
                            <Checkbox
                              checked={hasLigandsFilter}
                              onCheckedChange={() => setHasLigandsFilter(!hasLigandsFilter)}
                              className="h-3.5 w-3.5 data-[state=checked]:bg-claude-accent data-[state=checked]:border-claude-accent"
                            />
                            <span>Has Ligands</span>
                            <span className="text-[9px] text-claude-text-muted ml-auto">Exclude N/A</span>
                          </label>
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

            {/* Diff Mode Summary */}
            {mode === 'weekly' && diffMode && selectedWeekId && (
              <div className="px-4 py-2 flex items-center gap-4 text-[11px] border-b border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                    {diffResult.newIds.size} new
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                    {diffResult.removedIds.size} removed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                    {diffResult.unchangedIds.size} unchanged
                  </span>
                </div>
                {prevWeekId && (
                  <span className="text-claude-text-muted">
                    Comparing with previous week: <span className="font-mono font-medium">{prevWeekId}</span>
                  </span>
                )}
                {!prevWeekId && (
                  <span className="text-amber-600 dark:text-amber-400">
                    No previous week available for comparison
                  </span>
                )}
              </div>
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
            <div className="flex-1 overflow-auto custom-scrollbar preview-scroll relative z-10" ref={tableScrollRef} onScroll={handleTableScroll}>
              {/* Scroll Progress Bar */}
              <div className="scroll-progress-bar" style={{ opacity: scrollProgress > 0 ? 1 : 0 }}>
                <div className="scroll-progress-bar-fill" style={{ width: `${scrollProgress}%` }} />
              </div>
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
                  <table className={`min-w-[800px] w-full text-xs ${compactMode ? 'compact-table' : ''}`}>
                    <thead className="sticky top-0 z-10 border-b border-claude-border dark:border-[#3d3832]">
                      <tr className="bg-claude-bg dark:bg-[#1a1917]">
                        {[
                          { h: '', field: '' },
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
                      <p className="text-sm font-medium text-claude-text dark:text-[#e8e4dd]"><TypewriterText text="No structures found for this week" /></p>
                      <p className="text-xs mt-1 text-claude-text-muted dark:text-[#9b9590] max-w-[200px] text-center">Try adjusting filters or selecting a different week</p>
                      {(methodFilter !== 'all' || searchQuery || showBookmarksOnly || activeAdvancedFilterCount > 0 || selectedTagFilter) && (
                        <button
                          onClick={() => { setMethodFilter('all'); setSearchQuery(''); setShowBookmarksOnly(false); setSelectedTagFilter(null); clearAdvancedFilters(); }}
                          className="mt-3 px-3 py-1.5 rounded-md text-xs font-medium bg-claude-accent text-white hover:bg-claude-accent-hover transition-colors btn-press"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                  <table className={`min-w-[800px] w-full text-xs ${compactMode ? 'compact-table' : ''}`}>
                    <thead className="sticky top-0 z-10 border-b border-claude-border dark:border-[#3d3832]">
                      <tr className="bg-claude-bg dark:bg-[#1a1917]">
                        <th className="px-1.5 py-3.5 w-[32px] table-header-cell">
                          <button
                            onClick={toggleAllPageRows}
                            className={`inline-flex items-center justify-center h-3.5 w-3.5 rounded border transition-colors duration-150 ${
                              allPageSelected
                                ? 'bg-claude-accent border-claude-accent'
                                : somePageSelected
                                  ? 'bg-claude-accent border-claude-accent'
                                  : 'border-claude-border-light dark:border-[#3d3832] bg-claude-surface dark:bg-[#2b2926] hover:border-claude-text-muted/40'
                            }`}
                            title={allPageSelected ? 'Deselect all on page' : 'Select all on page'}
                          >
                            {allPageSelected && <Check className="h-2.5 w-2.5 text-white" />}
                            {somePageSelected && <Minus className="h-2.5 w-2.5 text-white" />}
                          </button>
                        </th>
                        <th className="px-1.5 py-3.5 w-[28px] table-header-cell" />
                        <th className="px-1.5 py-3.5 w-[28px] table-header-cell">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center justify-center w-full text-claude-text-muted">
                                <GitMerge className="h-3 w-3" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <span className="text-[10px]">Compare entries side-by-side</span>
                            </TooltipContent>
                          </Tooltip>
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
                                ref={focusedRowIndex === idx ? focusedRowRef : undefined}
                                data-row-idx={idx}
                                className={`table-row-hover-enhanced ${idx % 2 === 0 ? 'table-row-even' : 'table-row-odd'} border-b border-claude-border-light dark:border-[#3d3832] hover:shadow-md cursor-pointer group ${highlightedEntry === entry.pdbId ? 'ring-1 ring-claude-accent/30 ring-inset shadow-[0_0_8px_rgba(196,100,74,0.15)]' : ''} ${isSelected ? 'bg-claude-accent/5 dark:bg-claude-accent/5' : ''} ${pulsingRowId === entry.pdbId ? 'row-pulse' : ''} ${detailPanelOpen && selectedEntry?.pdbId === entry.pdbId ? 'row-selected' : ''} ${diffMode && diffResult.newIds.has(entry.pdbId) ? 'border-l-[3px] border-l-green-500' : ''} ${focusedRowIndex === idx ? 'keyboard-focused-row' : ''}`}
                                style={focusedRowIndex === idx ? { outline: 'none', borderLeft: '2px solid var(--claude-accent, #c96442)', backgroundColor: 'rgba(201, 100, 66, 0.06)', transition: 'border-color 150ms ease, background-color 150ms ease' } as React.CSSProperties : undefined}
                                onClick={() => {
                                  setSelectedEntry(entry);
                                  setDetailPanelOpen(true);
                                  setPreviewOpen(true);
                                  setPreviewTab('summary');
                                  if (isMobile) setBottomSheetSnap(0.5);
                                  setFocusedRowIndex(idx);
                                  // Trigger pulse animation
                                  if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
                                  setPulsingRowId(entry.pdbId);
                                  pulseTimeoutRef.current = setTimeout(() => setPulsingRowId(null), 400);
                                }}
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
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded transition-colors duration-200 ripple-btn ${
                                      bookmarks.has(entry.pdbId)
                                        ? 'text-claude-accent'
                                        : 'text-claude-text-muted/0 group-hover:text-claude-text-muted/40 hover:!text-claude-accent'
                                    }`}
                                    title={bookmarks.has(entry.pdbId) ? 'Remove bookmark' : 'Add bookmark'}
                                  >
                                    <motion.div
                                      key={bookmarks.has(entry.pdbId) ? 'checked' : 'unchecked'}
                                      animate={{ scale: [1, 1.3, 1] }}
                                      transition={{ duration: 0.3 }}
                                    >
                                    {bookmarks.has(entry.pdbId)
                                      ? <BookmarkCheck className="h-3.5 w-3.5" />
                                      : <Bookmark className="h-3.5 w-3.5" />
                                    }
                                    </motion.div>
                                  </button>
                                </td>
                                <td className="px-1.5 py-2 w-[28px]" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleEntryCompare(entry);
                                      if (entryComparison.entryA?.pdbId === entry.pdbId || entryComparison.entryB?.pdbId === entry.pdbId) {
                                        // deselecting
                                      } else if (entryComparison.entryA && entryComparison.entryB) {
                                        toast('Replaced comparison entry', { description: `${entry.pdbId} replaced ${entryComparison.entryB.pdbId}` });
                                      } else if (entryComparison.entryA) {
                                        toast('Ready to compare!', { description: `${entryComparison.entryA.pdbId} vs ${entry.pdbId}` });
                                        setEntryCompareModalOpen(true);
                                      } else {
                                        toast('Entry selected for comparison', { description: 'Select one more entry to compare' });
                                      }
                                    }}
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded transition-colors duration-200 ${
                                      (entryComparison.entryA?.pdbId === entry.pdbId || entryComparison.entryB?.pdbId === entry.pdbId)
                                        ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
                                        : 'text-claude-text-muted/0 group-hover:text-claude-text-muted/40 hover:!text-teal-600 dark:hover:!text-teal-400'
                                    }`}
                                    title={(entryComparison.entryA?.pdbId === entry.pdbId || entryComparison.entryB?.pdbId === entry.pdbId) ? 'Remove from comparison' : 'Compare entry'}
                                  >
                                    <GitMerge className="h-3.5 w-3.5" />
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
                                    {diffMode && diffResult.newIds.has(entry.pdbId) && (
                                      <span className="inline-flex items-center px-1 py-0 rounded text-[8px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ml-0.5">NEW</span>
                                    )}
                                    {entryNotes[entry.pdbId] && (
                                      <StickyNote className="h-2.5 w-2.5 text-amber-500 dark:text-amber-400 ml-0.5 flex-shrink-0" />
                                    )}
                                    <span
                                      className="inline-flex h-2 w-2 rounded-full ml-1 flex-shrink-0"
                                      style={{ backgroundColor: computeQualityScore(entry).color }}
                                      title={`${computeQualityScore(entry).label} (${computeQualityScore(entry).total})`}
                                    />
                                    <ExternalLink className="h-2.5 w-2.5 opacity-50 ext-arrow" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="p-0 bg-white border border-claude-border dark:border-[#4a4540] dark:bg-[#242220] shadow-lg data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=delayed-open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-150">
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
                                  {safeNum(entry.resolution, 2)}Å
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
                                  {safeNum(entry.journalIf, 1)}
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
                                  <TooltipContent side="top" className="max-w-64 bg-white dark:bg-[#2b2926] text-claude-text dark:text-[#e8e4dd] text-[11px] rounded px-2 py-1 border border-claude-border dark:border-[#4a4540] shadow-lg data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=delayed-open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-150">
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
                                {ligandList.slice(0, 3).map((lig, i) => (
                                  <HoverCard key={`tbl-lig-pop-${i}-${lig}`} openDelay={200} closeDelay={100}>
                                    <HoverCardTrigger asChild>
                                      <span
                                        className="ligand-chip"
                                        onMouseEnter={() => fetchLigandInfo(lig)}
                                      >
                                        {lig}
                                      </span>
                                    </HoverCardTrigger>
                                    <HoverCardContent side="top" className="p-0 w-auto bg-white dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] shadow-lg rounded-xl">
                                      {ligandCache[lig] ? (
                                        <LigandTooltipContent ligand={ligandCache[lig]} />
                                      ) : (
                                        <div className="p-3 flex items-center gap-2">
                                          <Loader2 className="h-3 w-3 animate-spin text-claude-accent" />
                                          <span className="text-xs text-claude-text-muted">Loading...</span>
                                        </div>
                                      )}
                                    </HoverCardContent>
                                  </HoverCard>
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
                            <ContextMenuContent className="w-52 bg-claude-surface dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] shadow-xl rounded-lg p-1">
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                                onClick={() => { setSelectedEntry(entry); setDetailPanelOpen(true); setPreviewTab('summary'); }}
                              >
                                <Eye className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                                View Summary
                              </ContextMenuItem>
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                                onClick={() => toggleBookmark(entry.pdbId)}
                              >
                                {bookmarks.has(entry.pdbId)
                                  ? <><BookmarkMinus className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />Remove Bookmark</>
                                  : <><BookmarkPlus className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />Bookmark</>
                                }
                              </ContextMenuItem>
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                                onClick={() => copyPdbId(entry.pdbId)}
                              >
                                <Copy className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                                Copy PDB ID
                              </ContextMenuItem>
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                                onClick={() => window.open(`https://www.rcsb.org/structure/${entry.pdbId}`, '_blank')}
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                                Open in RCSB PDB
                              </ContextMenuItem>
                              <ContextMenuSeparator className="bg-claude-border-light my-1" />
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
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

                  {/* Diff Mode: Removed Entries Section */}
                  {diffMode && diffResult.removedEntries.length > 0 && (
                    <div className="mt-4 border-t-2 border-red-200 dark:border-red-900/40 pt-4 px-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex h-3 w-3 rounded-full bg-red-500" />
                        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Removed Entries</h3>
                        <span className="text-[10px] text-claude-text-muted">({diffResult.removedEntries.length} entries not in current week)</span>
                      </div>
                      <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                        {diffResult.removedEntries.map((entry) => {
                          const mc = getMethodColor(entry.method);
                          return (
                            <div
                              key={`removed-${entry.pdbId}`}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-50/50 dark:bg-red-900/10 border-l-[3px] border-l-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                            >
                              <span className="inline-flex items-center px-1 py-0 rounded text-[8px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">REMOVED</span>
                              <a
                                href={`https://www.rcsb.org/structure/${entry.pdbId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono font-semibold text-claude-accent text-xs"
                              >
                                {entry.pdbId}
                              </a>
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${mc.bg} ${mc.text}`}>
                                {getMethodLabel(entry.method)}
                              </span>
                              {entry.resolution != null && (
                                <span className={`text-[10px] font-mono ${getResolutionColor(entry.resolution)}`}>
                                  {safeNum(entry.resolution, 2)}Å
                                </span>
                              )}
                              <span className="text-[10px] text-claude-text-secondary line-clamp-1 flex-1 min-w-0">
                                {entry.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  </>
                )
              ) : (
                /* Evaluation Table */
                !selectedEval && !selectedComplexId ? (
                  <div className="flex flex-col items-center justify-center py-20 text-claude-text-muted relative">
                    <div className="absolute inset-0 empty-state-pattern opacity-40" />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-claude-border-light/60 dark:bg-[#2b2926] flex items-center justify-center mb-4">
                        <Microscope className="h-8 w-8 opacity-30 animate-float" />
                      </div>
                      <p className="text-sm font-medium text-claude-text dark:text-[#e8e4dd]"><TypewriterText text="No evaluations match your search" /></p>
                      <p className="text-xs mt-1 text-claude-text-muted dark:text-[#9b9590] max-w-[220px] text-center">Choose from the sidebar to view structures and BLAST results</p>
                    </div>
                  </div>
                ) : loadingEvalDetail && !selectedComplexId ? (
                  <table className={`min-w-[700px] w-full text-xs ${compactMode ? 'compact-table' : ''}`}>
                    <thead className="sticky top-0 z-10 border-b border-claude-border dark:border-[#3d3832]">
                      <tr className="bg-claude-bg dark:bg-[#1a1917]">
                        {[
                          { h: 'PDB ID', field: 'pdbId' },
                          { h: 'Type', field: '_type' },
                          { h: 'Method', field: 'method' },
                          { h: 'Resolution', field: 'resolution' },
                          { h: 'IF', field: 'journalIf' },
                          { h: 'Title / Description', field: 'title' },
                          { h: 'Date', field: 'releaseDate' },
                          { h: 'Ligands', field: '_ligands' },
                        ].filter(c => !hiddenColumns.has(c.field)).map(c => (
                          <th key={c.h} className="px-3 py-3 text-left text-[11px] font-semibold text-claude-text-muted uppercase tracking-wide">
                            {c.h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <TableSkeleton rows={5} cols={[
                        'pdbId','_type','method','resolution','journalIf','title','releaseDate','_ligands'
                      ].filter(f => !hiddenColumns.has(f)).length} />
                    </tbody>
                  </table>
                ) : (
                  <table className={`min-w-[700px] w-full text-xs ${compactMode ? 'compact-table' : ''}`}>
                    <thead className="sticky top-0 z-10 border-b border-claude-border dark:border-[#3d3832]">
                      <tr className="bg-claude-bg dark:bg-[#1a1917]">
                        {[
                          { field: 'pdbId', label: 'PDB ID', w: 'w-[90px]' },
                          { field: '_type', label: 'Type', w: 'w-[70px]' },
                          ...(selectedComplexId ? [{ field: '_source', label: 'Source', w: 'w-[80px]' }] : []),
                          { field: 'method', label: 'Method', w: 'w-[90px]' },
                          { field: 'resolution', label: 'Resolution', w: 'w-[80px]' },
                          { field: 'journalIf', label: 'IF', w: 'w-[55px]' },
                          { field: 'title', label: 'Title / Description', w: '' },
                          { field: 'releaseDate', label: 'Date', w: 'w-[95px]' },
                          { field: '_ligands', label: 'Ligands', w: 'w-[120px]' },
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
                          <ContextMenu key={`${row._type}-${row.pdbId || 'noid'}-${idx}`}>
                            <ContextMenuTrigger asChild>
                              <tr className={`table-row-hover-enhanced border-b border-claude-border-light dark:border-b-[#3d3832] ${idx % 2 === 0 ? 'table-row-even' : 'table-row-odd'} ${isBlast ? 'bg-claude-border-light/30 dark:bg-[#2b2926]/50' : ''}`}>
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
                                  <TooltipContent side="right" className="p-0 bg-white border border-claude-border dark:border-[#4a4540] dark:bg-[#242220] shadow-lg data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=delayed-open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-150">
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
                                    <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20 cursor-help">
                                      Homolog
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="p-0 bg-white dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] shadow-lg">
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
                            {selectedComplexId && '_sourceUniport' in row && (
                            <td className="px-3 py-2">
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-claude-mid-bg/50 text-claude-mid font-mono cursor-default">
                                {row._sourceUniport}
                              </span>
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
                                  {safeNum(row.resolution, 2)}Å
                                </span>
                              ) : <span className="text-claude-text-muted">—</span>}
                            </td>
                            )}
                            {!hiddenColumns.has('journalIf') && (
                            <td className="px-3 py-2">
                              {'journalIf' in row && row.journalIf != null ? (
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${ifStyle.bg} ${ifStyle.text}`}>
                                  {safeNum(row.journalIf, 1)}
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
                            {!hiddenColumns.has('_ligands') && (
                            <td className="px-3 py-2">
                              <div className="flex flex-wrap gap-1">
                                {(() => {
                                  const evalLigands = parseLigands('ligand' in row ? row.ligand : null);
                                  if (evalLigands.length === 0) return <span className="text-claude-text-muted">—</span>;
                                  return (<>
                                    {evalLigands.slice(0, 3).map((lig, li) => (
                                      <HoverCard key={`eval-lig-pop-${li}-${lig}`} openDelay={200} closeDelay={100}>
                                        <HoverCardTrigger asChild>
                                          <span
                                            className="ligand-chip"
                                            onMouseEnter={() => fetchLigandInfo(lig)}
                                          >
                                            {lig}
                                          </span>
                                        </HoverCardTrigger>
                                        <HoverCardContent side="top" className="p-0 w-auto bg-white dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] shadow-lg rounded-xl">
                                          {ligandCache[lig] ? (
                                            <LigandTooltipContent ligand={ligandCache[lig]} />
                                          ) : (
                                            <div className="p-3 flex items-center gap-2">
                                              <Loader2 className="h-3 w-3 animate-spin text-claude-accent" />
                                              <span className="text-xs text-claude-text-muted">Loading...</span>
                                            </div>
                                          )}
                                        </HoverCardContent>
                                      </HoverCard>
                                    ))}
                                    {evalLigands.length > 3 && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="ligand-chip cursor-default">+{evalLigands.length - 3}</span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                          <div className="flex flex-wrap gap-1 max-w-48">
                                            {evalLigands.map((l, li) => (
                                              <span key={`eval-lig-tt-${li}-${l}`} className="ligand-chip">{l}</span>
                                            ))}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </>);
                                })()}
                              </div>
                            </td>
                            )}
                          </tr>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-52 bg-claude-surface dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] shadow-xl rounded-lg p-1">
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                                onClick={() => {
                                  if (structResult) {
                                    setSelectedEntry({ ...structResult, _type: 'weekly' } as unknown as PdbEntry);
                                    setDetailPanelOpen(true);
                                    setPreviewTab('summary');
                                  } else if (blastResult) {
                                    setSelectedEvalStructure({ ...blastResult, isBlast: true } as unknown as EvalPdbStructure & { isBlast: boolean });
                                    setDetailPanelOpen(true);
                                    setPreviewTab('summary');
                                  }
                                }}
                              >
                                <Eye className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                                View Detail
                              </ContextMenuItem>
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                                onClick={() => {
                                  if (row.pdbId) {
                                    navigator.clipboard.writeText(row.pdbId).catch(() => {});
                                  }
                                }}
                              >
                                <Copy className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                                Copy PDB ID
                              </ContextMenuItem>
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                                onClick={() => {
                                  if (row.pdbId) {
                                    window.open(`https://www.rcsb.org/structure/${row.pdbId}`, '_blank');
                                  }
                                }}
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                                Open in RCSB PDB
                              </ContextMenuItem>
                              {('pubmedId' in row && row.pubmedId) || ('journal' in row && row.journal) ? (
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                                onClick={() => {
                                  const pubmedId = 'pubmedId' in row ? row.pubmedId : null;
                                  const journal = 'journal' in row ? row.journal : null;
                                  const title = row.title || '';
                                  if (pubmedId) {
                                    window.open(`https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/`, '_blank');
                                  } else if (journal) {
                                    const query = encodeURIComponent(`${title} ${journal}`);
                                    window.open(`https://pubmed.ncbi.nlm.nih.gov/?term=${query}`, '_blank');
                                  }
                                }}
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                                Search PubMed
                              </ContextMenuItem>
                              ) : null}
                              <ContextMenuSeparator className="bg-claude-border-light my-1" />
                              <ContextMenuItem
                                className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                                onClick={() => {
                                  if (row.pdbId) {
                                    const data = [
                                      row.pdbId,
                                      isBlast ? 'Homolog' : 'Structure',
                                      row.method || '',
                                      row.resolution != null ? String(row.resolution) : '',
                                      row.title || '',
                                      row.releaseDate || '',
                                      'ligand' in row ? (row.ligand || '') : '',
                                    ].join('\t');
                                    navigator.clipboard.writeText(data).catch(() => {});
                                  }
                                }}
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
            {mode === 'evaluation' && (selectedEval || selectedComplexId) && sortedEvalRows.length > PAGE_SIZE && (
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
                className={`hidden lg:flex flex-col flex-shrink-0 bg-claude-surface/80 dark:bg-[#242220]/90 backdrop-blur-xl overflow-hidden no-print glassmorphism-panel preview-gradient-border preview-inner-glow relative ${hasLoaded ? 'animate-load-preview' : ''}`}
              >
                {/* Preview panel resize handle */}
                <div
                  onMouseDown={handlePreviewMouseDown}
                  className={`absolute top-0 left-0 bottom-0 w-1 hover:bg-claude-accent/30 transition-colors duration-150 cursor-col-resize z-10 ${resizingPreview ? 'bg-claude-accent/50' : ''}`}
                />
                <div className="flex-1 overflow-y-auto min-h-0 preview-scroll">
                  {renderPreviewPanel()}
                </div>
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
                  className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                  onClick={() => setMobilePreviewOpen(false)}
                />
                <motion.aside
                  initial={{ x: 380 }}
                  animate={{ x: 0 }}
                  exit={{ x: 380 }}
                  transition={{ duration: 0.2 }}
                  className="fixed right-0 top-0 bottom-0 z-50 w-[85vw] max-w-[400px] bg-claude-surface/80 dark:bg-[#242220]/90 backdrop-blur-xl border-l border-claude-border dark:border-[#3d3832] flex flex-col lg:hidden no-print glassmorphism-panel preview-inner-glow"
                >
                  <div className="flex items-center justify-between px-3 border-b border-claude-border dark:border-[#3d3832] h-12">
                    <span className="text-xs font-semibold text-claude-text">Preview</span>
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
        <footer className="flex-shrink-0 h-6 flex items-center border-t border-claude-border dark:border-[#3d3832] bg-claude-border-light dark:bg-[#1a1917] text-[10px] text-claude-text-muted dark:text-[#9b9590] relative no-print select-none mt-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {/* Animated gradient line at top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-claude-accent/40 to-transparent bg-[length:200%_100%] animate-[status-bar-gradient_4s_ease-in-out_infinite]" />

          {/* Left section */}
          <div className="flex items-center h-full min-w-0">
            <span className="inline-flex items-center gap-1 px-2 border-r border-claude-border/50">
              {mode === 'weekly' ? <Database className="h-3 w-3 text-claude-accent" /> : <Microscope className="h-3 w-3 text-claude-accent" />}
              <span className="font-medium text-claude-text-secondary">{mode === 'weekly' ? 'Weekly' : 'Evaluation'}</span>
            </span>
            {mode === 'weekly' && selectedWeekId && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 border-r border-claude-border/50">
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
          <div className="flex-1 flex items-center justify-center h-full overflow-hidden">
            {/* Keyboard Nav Hint - fades in when keyboard navigation is first used, auto-hides after 5s */}
            <AnimatePresence>
              {keyboardNavHintVisible && mode === 'weekly' && (
                <motion.span
                  key="keyboard-nav-hint"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex items-center gap-1.5 px-2 text-claude-accent/80"
                >
                  <Terminal className="h-3 w-3" />
                  <span>↑↓ Navigate</span>
                  <span className="text-claude-text-muted/40">·</span>
                  <span>Enter Open</span>
                  <span className="text-claude-text-muted/40">·</span>
                  <span>Space Bookmark</span>
                </motion.span>
              )}
            </AnimatePresence>
            {!keyboardNavHintVisible && (methodFilter !== 'all' || searchQuery || showBookmarksOnly || activeAdvancedFilterCount > 0 || selectedTagFilter) && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2">
                <SlidersHorizontal className="h-3 w-3" />
                Filters: {[methodFilter !== 'all' ? 1 : 0, searchQuery ? 1 : 0, showBookmarksOnly ? 1 : 0, activeAdvancedFilterCount, selectedTagFilter ? 1 : 0].reduce((a, b) => a + b, 0)} active
              </span>
            )}
            {!keyboardNavHintVisible && sortField && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 border-l border-claude-border/50">
                <ArrowUpDown className="h-3 w-3" />
                Sort: {sortField} {sortDir === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>

          {/* Right section */}
          <div className="hidden sm:flex items-center h-full">
            <span className="inline-flex items-center gap-1.5 px-2 border-l border-claude-border/50">
              <kbd className="px-0.5 py-px rounded text-[9px] bg-claude-border-light/80 dark:bg-[#3d3832] border border-claude-border/40 dark:border-[#4a4540] font-mono">⌘</kbd>
              <span>K</span>
              <span className="text-claude-text-muted/40">·</span>
              <kbd className="px-0.5 py-px rounded text-[9px] bg-claude-border-light/80 dark:bg-[#3d3832] border border-claude-border/40 dark:border-[#4a4540] font-mono">⌘</kbd>
              <span>E</span>
              <span className="text-claude-text-muted/40">·</span>
              <kbd className="px-0.5 py-px rounded text-[9px] bg-claude-border-light/80 dark:bg-[#3d3832] border border-claude-border/40 dark:border-[#4a4540] font-mono">⌘</kbd>
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

      {/* Entry Comparison Modal */}
      <EntryComparisonModal
        isOpen={entryCompareModalOpen}
        onClose={clearEntryComparison}
        entryA={entryComparison.entryA}
        entryB={entryComparison.entryB}
      />

      {/* Complex Evaluation Dialog */}
      <AnimatePresence>
        {showComplexDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center no-print"
            onClick={() => setShowComplexDialog(false)}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="relative bg-claude-surface dark:bg-[#242220] border border-claude-border dark:border-[#4a4540] rounded-xl shadow-2xl w-[420px] max-w-[90vw] p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-claude-text flex items-center gap-2">
                  <Layers className="h-4 w-4 text-claude-accent" />
                  Create Complex Evaluation Group
                </h3>
                <button
                  onClick={() => setShowComplexDialog(false)}
                  className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors"
                >
                  <X className="h-4 w-4 text-claude-text-muted" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-claude-text-secondary mb-1 block">Group Name (optional)</label>
                  <input
                    type="text"
                    value={complexName}
                    onChange={e => setComplexName(e.target.value)}
                    placeholder="e.g. EGFR Complex"
                    className="w-full px-3 py-2 text-xs rounded-md border border-claude-border dark:border-[#3d3832] bg-white dark:bg-[#1a1917] dark:text-[#e8e4dd] focus:outline-none focus:ring-2 focus:ring-claude-accent/40 focus:border-claude-accent/40 placeholder:text-claude-text-muted/60"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-claude-text-secondary mb-1 block">UniProt IDs <span className="text-claude-text-muted">(space, comma, or semicolon separated)</span></label>
                  <textarea
                    value={complexInput}
                    onChange={e => setComplexInput(e.target.value)}
                    placeholder="e.g. P00533 P04637 Q9Y6K9"
                    rows={3}
                    className="w-full px-3 py-2 text-xs rounded-md border border-claude-border dark:border-[#3d3832] bg-white dark:bg-[#1a1917] dark:text-[#e8e4dd] focus:outline-none focus:ring-2 focus:ring-claude-accent/40 focus:border-claude-accent/40 placeholder:text-claude-text-muted/60 resize-none font-mono"
                  />
                  {complexInput && (
                    <div className="mt-1 text-[10px] text-claude-text-muted">
                      {complexInput.split(/[\s,;]+/).filter(id => id.trim().length > 0).length} IDs detected
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={addComplexGroup}
                    disabled={complexInput.split(/[\s,;]+/).filter(id => id.trim().length > 0).length < 2}
                    className="flex-1 h-8 text-xs bg-claude-accent hover:bg-claude-accent/90 text-white"
                  >
                    <Layers className="h-3 w-3 mr-1" />
                    Create Group
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowComplexDialog(false)}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ BATCH ACTION BAR ═══════════ */}
      <AnimatePresence>
        {selectedRows.size > 0 && mode === 'weekly' && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 no-print"
            style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="bg-claude-surface dark:bg-[#242220] border border-claude-border dark:border-[#3d3832] rounded-xl shadow-2xl px-4 py-2.5 flex items-center gap-3">
              <span className="text-xs font-medium text-claude-text-secondary whitespace-nowrap">
                {selectedRows.size} structure{selectedRows.size !== 1 ? 's' : ''} selected
              </span>
              <div className="w-px h-5 bg-claude-border-light" />
              <button
                onClick={batchBookmarkAll}
                className="inline-flex items-center gap-1 h-7 px-3 rounded-lg text-[11px] font-medium text-claude-accent bg-claude-accent-light dark:bg-[#3d2a22] hover:bg-claude-accent-light/80 transition-colors duration-150"
              >
                <BookmarkPlus className="h-3 w-3" />
                Bookmark All
              </button>
              <button
                onClick={batchRemoveBookmarks}
                className="inline-flex items-center gap-1 h-7 px-3 rounded-lg text-[11px] font-medium text-claude-text-secondary bg-claude-border-light/50 hover:bg-claude-border-light dark:bg-[#2b2926] dark:hover:bg-[#3d3832] transition-colors duration-150"
              >
                <BookmarkMinus className="h-3 w-3" />
                Remove Bookmarks
              </button>
              <button
                onClick={handleExportSelectedCsv}
                className="inline-flex items-center gap-1 h-7 px-3 rounded-lg text-[11px] font-medium text-claude-text-secondary bg-claude-border-light/50 hover:bg-claude-border-light dark:bg-[#2b2926] dark:hover:bg-[#3d3832] transition-colors duration-150"
              >
                <Download className="h-3 w-3" />
                Export Selected
              </button>
              <div className="w-px h-5 bg-claude-border-light" />
              <button
                onClick={clearSelection}
                className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-claude-text-muted hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150"
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

      {/* ═══════════ ROW DETAIL PANEL (Responsive) ═══════════ */}
      <AnimatePresence>
        {detailPanelOpen && selectedEntry && (() => {
          // Helper: navigate to prev/next entry in the current table
          const currentEntryIndex = paginatedEntries.findIndex(e => e.pdbId === selectedEntry.pdbId);
          const navigateToEntry = (direction: 'prev' | 'next') => {
            const nextIdx = direction === 'prev'
              ? Math.max(0, currentEntryIndex - 1)
              : Math.min(paginatedEntries.length - 1, currentEntryIndex + 1);
            const nextEntry = paginatedEntries[nextIdx];
            if (nextEntry && nextEntry.pdbId !== selectedEntry.pdbId) {
              setDetailSlideDirection(direction === 'prev' ? 'right' : 'left');
              setTimeout(() => {
                setSelectedEntry(nextEntry);
                setDetailSlideDirection(null);
              }, 150);
              if (focusedRowIndex !== null) setFocusedRowIndex(nextIdx);
            }
          };

          // ── Shared detail content renderer ──
          const detailContent = (
            <div className={isMobile ? 'p-4 space-y-4' : 'p-5 space-y-4 max-w-4xl mx-auto'}>
              {/* Swipe Navigation Hint (mobile only) */}
              {isMobile && (
                <div className="flex items-center justify-center gap-2 text-[10px] text-claude-text-muted/60 select-none pb-1">
                  <span>{currentEntryIndex > 0 ? '← Swipe for prev' : ''}</span>
                  {currentEntryIndex > 0 && currentEntryIndex < paginatedEntries.length - 1 && <span>·</span>}
                  <span>{currentEntryIndex < paginatedEntries.length - 1 ? 'Swipe for next →' : ''}</span>
                </div>
              )}

              {/* Header: PDB ID + Method Badge + Title */}
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-mono text-base font-bold text-claude-accent">{selectedEntry.pdbId}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${getMethodColor(selectedEntry.method).bg} ${getMethodColor(selectedEntry.method).text}`}>
                      {getMethodLabel(selectedEntry.method)}
                    </span>
                    {selectedEntry.resolution != null && (
                      <span className={`text-[10px] font-mono font-semibold ${getResolutionColor(selectedEntry.resolution)}`}>{safeNum(selectedEntry.resolution, 2)}Å</span>
                    )}
                  </div>
                  <p className="text-[11px] text-claude-text-secondary leading-snug line-clamp-2">{selectedEntry.title}</p>
                </div>
                {/* Quality Score (mini radial) */}
                {(() => {
                  const qs = computeQualityScore(selectedEntry);
                  const circumference = 2 * Math.PI * 28;
                  const offset = circumference - (qs.total / 100) * circumference;
                  return (
                    <div className="relative flex-shrink-0">
                      <svg width="60" height="60" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="5" className="text-claude-border-light dark:text-claude-border" />
                        <circle cx="30" cy="30" r="28" fill="none" stroke={qs.color} strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 30 30)" className="transition-all duration-700" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm font-bold font-mono" style={{ color: qs.color }}>{qs.total}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 3D Structure Viewer */}
              <div className="rounded-lg overflow-hidden border border-claude-border dark:border-[#3d3832]">
                <MoleculeViewer
                  pdbId={selectedEntry.pdbId}
                  highlightEntity={hoveredEntityInPanel}
                  onEntityClick={(entityId) => setHoveredEntityInPanel(hoveredEntityInPanel === entityId ? null : entityId)}
                  entityColors={entityColors}
                  onEntityColorChange={handleEntityColorChange}
                />
              </div>

              {/* Info Grid - 2 column compact layout */}
              <div className="grid grid-cols-2 gap-2">
                {/* Left column */}
                <div className="space-y-2">
                  {/* Assembly + Polymers + Ligands + Organism */}
                  <div className="p-2.5 rounded-lg bg-claude-border-light/30 dark:bg-[#1a1917]/60">
                    {(() => {
                      const ligands = parseLigands(selectedEntry.ligands);
                      return (
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <div className="text-[8px] text-claude-text-muted uppercase tracking-wider">Assembly</div>
                            <div className="text-[11px] font-medium font-mono text-claude-text truncate">{selectedEntry.assembly || '—'}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-claude-text-muted uppercase tracking-wider">Polymers</div>
                            <div className="text-[11px] font-medium text-claude-text">{selectedEntry.polymerEntities || selectedEntry.chainCount || '—'}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-claude-text-muted uppercase tracking-wider">Ligands</div>
                            <div className="text-[11px] font-medium text-claude-text">{selectedEntry.ligandCount || ligands.length || '—'}</div>
                          </div>
                        </div>
                      );
                    })()}
                    {selectedEntry.organisms && (
                      <div className="mt-1.5">
                        <div className="text-[8px] text-claude-text-muted uppercase tracking-wider">Organism</div>
                        <div className="text-[10px] text-claude-text italic truncate">{selectedEntry.organisms.split('|')[0]?.trim() || '—'}</div>
                      </div>
                    )}
                    {selectedEntry.geneName && (
                      <div>
                        <div className="text-[8px] text-claude-text-muted uppercase tracking-wider">Gene</div>
                        <div className="text-[10px] text-claude-text font-medium">{selectedEntry.geneName}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-[8px] text-claude-text-muted uppercase tracking-wider">Resolution</div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-claude-border-light dark:bg-claude-border rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(5, Math.min(100, (1 - (selectedEntry.resolution - 0.5) / 4.5) * 100))}%`,
                              backgroundColor: selectedEntry.resolution <= 2.0 ? '#16a34a' : selectedEntry.resolution <= 3.5 ? '#c9872e' : '#dc2626',
                            }}
                          />
                        </div>
                        <span className="text-[9px] text-claude-text-muted">{selectedEntry.resolution <= 1.5 ? 'Excellent' : selectedEntry.resolution <= 2.0 ? 'High' : selectedEntry.resolution <= 3.0 ? 'Med' : selectedEntry.resolution <= 3.5 ? 'Low' : 'VLow'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Journal + IF */}
                  {selectedEntry.journal && (
                    <div className="p-2.5 rounded-lg bg-claude-border-light/30 dark:bg-[#1a1917]/60">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <div className="text-[8px] text-claude-text-muted uppercase tracking-wider mb-0.5">Journal</div>
                          <div className="text-[10px] text-claude-text-secondary leading-snug truncate">{selectedEntry.journal}</div>
                        </div>
                        {selectedEntry.journalIf != null && (
                          <span className={`flex-shrink-0 text-[9px] px-1 py-0.5 rounded font-medium ${getIfTierStyle(selectedEntry.ifTier).bg} ${getIfTierStyle(selectedEntry.ifTier).text}`}>
                            IF {safeNum(selectedEntry.journalIf, 1)}
                          </span>
                        )}
                      </div>
                      {selectedEntry.authors && (
                        <div className="mt-1 text-[9px] text-claude-text-muted truncate">{selectedEntry.authors.replace(/\|/g, ', ')}</div>
                      )}
                    </div>
                  )}

                  {/* Dates */}
                  <div className="p-2.5 rounded-lg bg-claude-border-light/30 dark:bg-[#1a1917]/60">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[8px] text-claude-text-muted uppercase tracking-wider">Released</div>
                        <div className="text-[10px] text-claude-text">{formatDate(selectedEntry.releaseDate)}</div>
                      </div>
                      <div>
                        <div className="text-[8px] text-claude-text-muted uppercase tracking-wider">Week</div>
                        <div className="text-[10px] font-mono text-claude-text-secondary">{selectedEntry.weekId}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-2">
                  {/* Ligands Detail */}
                  {parseLigands(selectedEntry.ligands).length > 0 && (
                    <div className="p-2.5 rounded-lg bg-claude-border-light/30 dark:bg-[#1a1917]/60">
                      <div className="text-[8px] text-claude-text-muted uppercase tracking-wider mb-1.5">Ligands ({parseLigands(selectedEntry.ligands).length})</div>
                      <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                        {parseLigands(selectedEntry.ligands).map((lig, i) => (
                          <HoverCard key={`detail-lig-${i}-${lig}`} openDelay={200} closeDelay={100}>
                            <HoverCardTrigger asChild>
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-claude-border-light/50 dark:bg-[#2b2926] hover:bg-claude-accent/10 cursor-pointer transition-colors">
                                <span className="text-[10px] font-mono font-semibold text-claude-accent">{lig}</span>
                                {ligandCache[lig] && (
                                  <span className="text-[8px] text-claude-text-muted truncate flex-1">{ligandCache[lig].name || ''}</span>
                                )}
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent side="left" className="p-0 w-auto bg-white dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] shadow-lg rounded-xl z-50">
                              {ligandCache[lig] ? (
                                <LigandTooltipContent ligand={ligandCache[lig]} />
                              ) : (
                                <div className="p-3 flex items-center gap-2">
                                  <Loader2 className="h-3 w-3 animate-spin text-claude-accent" />
                                  <span className="text-xs text-claude-text-muted">Loading...</span>
                                </div>
                              )}
                            </HoverCardContent>
                          </HoverCard>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quality Score breakdown */}
                  <div className="p-2.5 rounded-lg bg-claude-border-light/30 dark:bg-[#1a1917]/60">
                    <div className="text-[8px] text-claude-text-muted uppercase tracking-wider mb-1.5">Score Breakdown</div>
                    {(() => {
                      const qs = computeQualityScore(selectedEntry);
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-claude-text-muted w-14">Resolution</span>
                            <div className="flex-1 h-1.5 bg-claude-border-light dark:bg-claude-border rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-claude-accent" style={{ width: `${(qs.resolutionScore / 35) * 100}%` }} />
                            </div>
                            <span className="text-[9px] font-mono text-claude-text-muted w-6 text-right">{qs.resolutionScore}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-claude-text-muted w-14">Method</span>
                            <div className="flex-1 h-1.5 bg-claude-border-light dark:bg-claude-border rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-claude-cryoem" style={{ width: `${(qs.methodScore / 25) * 100}%` }} />
                            </div>
                            <span className="text-[9px] font-mono text-claude-text-muted w-6 text-right">{qs.methodScore}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-claude-text-muted w-14">IF</span>
                            <div className="flex-1 h-1.5 bg-claude-border-light dark:bg-claude-border rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-claude-xray" style={{ width: `${(qs.ifScore / 30) * 100}%` }} />
                            </div>
                            <span className="text-[9px] font-mono text-claude-text-muted w-6 text-right">{qs.ifScore}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap gap-1">
                    <a href={`https://www.rcsb.org/structure/${selectedEntry.pdbId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent hover:bg-claude-accent/20 transition-all external-link-hover">
                      <ExternalLink className="h-2.5 w-2.5 ext-arrow" />RCSB
                    </a>
                    {selectedEntry.doi && (
                      <a href={selectedEntry.doi.startsWith('http') ? selectedEntry.doi : `https://doi.org/${selectedEntry.doi}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-claude-xray-bg text-claude-xray hover:bg-claude-xray/20 transition-all external-link-hover">
                        <ExternalLink className="h-2.5 w-2.5 ext-arrow" />DOI
                      </a>
                    )}
                    {selectedEntry.pubmedId && (
                      <a href={`https://pubmed.ncbi.nlm.nih.gov/${selectedEntry.pubmedId}/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-claude-cryoem-bg text-claude-cryoem hover:bg-claude-cryoem/20 transition-all external-link-hover">
                        <ExternalLink className="h-2.5 w-2.5 ext-arrow" />PubMed
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <h3 className="text-[10px] font-semibold text-claude-text-muted uppercase tracking-wider">Notes</h3>
                  <StickyNote className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="relative">
                  <textarea
                    rows={2}
                    placeholder="Add your notes..."
                    defaultValue={entryNotes[selectedEntry.pdbId] || ''}
                    onBlur={(e) => {
                      const note = e.target.value;
                      if (note !== (entryNotes[selectedEntry.pdbId] || '')) {
                        updateNote(selectedEntry.pdbId, note);
                      }
                    }}
                    className="w-full px-3 py-1.5 text-[11px] rounded-lg border border-claude-border dark:border-[#3d3832] bg-white dark:bg-[#1a1917] dark:text-[#e8e4dd] focus:outline-none focus:ring-2 focus:ring-claude-accent/40 focus:border-claude-accent/40 placeholder:text-claude-text-muted/60 resize-none transition-colors duration-150"
                  />
                  {noteSavedIndicator === selectedEntry.pdbId && (
                    <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-1.5 right-2 text-[9px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                      ✓ Saved
                    </motion.span>
                  )}
                </div>
              </div>

              {/* AI Summary */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <h3 className="text-[10px] font-semibold text-claude-text-muted uppercase tracking-wider">AI Summary</h3>
                  <Sparkles className="h-3 w-3 text-claude-accent" />
                </div>
                {aiSummaries[selectedEntry.pdbId] ? (
                  <div className="rounded-lg border border-claude-border dark:border-[#3d3832] bg-white dark:bg-[#242220] p-2.5">
                    <p className="text-[11px] text-claude-text-secondary dark:text-[#9b9590] leading-relaxed">{aiSummaries[selectedEntry.pdbId]}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] text-claude-text-muted/60 italic">AI-generated</span>
                      <button onClick={() => generateAiSummary(selectedEntry)} className="inline-flex items-center gap-1 text-[9px] text-claude-text-muted hover:text-claude-accent transition-colors">
                        <RefreshCw className="h-3 w-3" />Regenerate
                      </button>
                    </div>
                  </div>
                ) : aiSummaryLoading === selectedEntry.pdbId ? (
                  <div className="rounded-lg border border-claude-border dark:border-[#3d3832] bg-white dark:bg-[#242220] p-2.5">
                    <div className="space-y-2">
                      <div className="shimmer-skeleton h-2.5 w-full rounded" />
                      <div className="shimmer-skeleton h-2.5 w-[85%] rounded" />
                      <div className="shimmer-skeleton h-2.5 w-[60%] rounded" />
                    </div>
                  </div>
                ) : aiSummaryError && aiSummaryLoading === null ? (
                  <div className="rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="h-3 w-3 text-red-500 dark:text-red-400" />
                      <span className="text-[9px] font-medium text-red-600 dark:text-red-400">Error</span>
                    </div>
                    <p className="text-[9px] text-red-500/70 dark:text-red-400/70 mb-2">{aiSummaryError}</p>
                    <button onClick={() => generateAiSummary(selectedEntry)} className="inline-flex items-center gap-1 text-[9px] text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors">
                      <RefreshCw className="h-3 w-3" />Try again
                    </button>
                  </div>
                ) : (
                  <button onClick={() => generateAiSummary(selectedEntry)} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-claude-border hover:border-claude-accent/40 dark:border-[#4a4540] dark:hover:border-claude-accent/40 bg-claude-border-light/20 hover:bg-claude-accent/5 dark:bg-[#1a1917]/60 dark:hover:bg-claude-accent/5 text-[11px] text-claude-text-muted hover:text-claude-accent dark:hover:text-claude-accent transition-all duration-200">
                    <Sparkles className="h-3 w-3" />Generate AI Summary
                  </button>
                )}
              </div>
            </div>
          );

          // ── Mobile: Bottom Sheet ──
          if (isMobile) {
            return (
              <motion.div
                key="mobile-bottom-sheet-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={() => { setDetailPanelOpen(false); setSelectedEntry(null); }}
              >
                <motion.div
                  key={`mobile-bottom-sheet-${selectedEntry.pdbId}`}
                  initial={{ y: '100%' }}
                  animate={{ y: `${(1 - bottomSheetSnap) * 100}%` }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  drag="y"
                  dragConstraints={{ top: `${(1 - 0.9) * 100}%`, bottom: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(_event, info) => {
                    const sheetEl = document.querySelector('[data-bottom-sheet]');
                    if (!sheetEl) return;
                    const rect = sheetEl.getBoundingClientRect();
                    const viewportH = window.innerHeight;
                    const currentSnapPercent = rect.top / viewportH;

                    // If dragged past 30% down from the current snap point, dismiss
                    if (info.offset.y > viewportH * 0.3) {
                      setDetailPanelOpen(false);
                      setSelectedEntry(null);
                      return;
                    }

                    // Snap to nearest snap point
                    const snapPoints = [0.5, 0.9];
                    const nearest = snapPoints.reduce((prev, curr) =>
                      Math.abs(curr - (1 - currentSnapPercent)) < Math.abs(prev - (1 - currentSnapPercent)) ? curr : prev
                    );
                    setBottomSheetSnap(nearest);
                  }}
                  onDrag={(_event, info) => {
                    // Horizontal swipe detection for entry navigation
                    if (Math.abs(info.offset.x) > 80 && Math.abs(info.offset.y) < 40) {
                      if (info.offset.x > 0 && currentEntryIndex > 0) {
                        navigateToEntry('prev');
                      } else if (info.offset.x < 0 && currentEntryIndex < paginatedEntries.length - 1) {
                        navigateToEntry('next');
                      }
                    }
                  }}
                  data-bottom-sheet
                  className="fixed left-0 right-0 bottom-0 z-50 bg-claude-surface dark:bg-[#242220] rounded-t-2xl shadow-2xl no-print flex flex-col"
                  style={{ height: `${bottomSheetSnap * 100}vh`, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Drag Handle */}
                  <div className="flex-shrink-0 flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                    <div className="w-10 h-1 rounded-full bg-claude-border-light dark:bg-[#4a4540]" />
                  </div>

                  {/* Detail Header */}
                  <div className="flex-shrink-0 px-4 pb-3 border-b border-claude-border dark:border-[#3d3832] relative z-10 bg-claude-surface dark:bg-[#242220]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-mono text-base font-bold text-claude-accent">{selectedEntry.pdbId}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getMethodColor(selectedEntry.method).bg} ${getMethodColor(selectedEntry.method).text}`}>
                          {getMethodLabel(selectedEntry.method)}
                        </span>
                        {entryNotes[selectedEntry.pdbId] && (
                          <StickyNote className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setDetailPanelOpen(false); setSelectedEntry(null); }} className="h-8 w-8 p-0 text-claude-text-muted hover:text-claude-text flex-shrink-0 touch-manipulation rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832]">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {(() => {
                      const entryTags = generateTags(selectedEntry, diffMode && diffResult.newIds.has(selectedEntry.pdbId));
                      return entryTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entryTags.map((tag, i) => (
                            <TagPill key={`mobile-tag-${i}-${tag.label}`} tag={tag} size="xs" />
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Detail Content with horizontal slide transition */}
                  <ScrollArea className="flex-1 preview-scroll min-h-0">
                    <motion.div
                      key={selectedEntry.pdbId}
                      initial={{ x: detailSlideDirection === 'left' ? 60 : detailSlideDirection === 'right' ? -60 : 0, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      {detailContent}
                    </motion.div>
                  </ScrollArea>
                </motion.div>
              </motion.div>
            );
          }

          // ── Desktop: Centered Modal ──
          return (
            <>
              <motion.div
                key="desktop-detail-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={() => { setDetailPanelOpen(false); setSelectedEntry(null); }}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 pointer-events-none">
              <motion.div
                key={`desktop-detail-panel-${selectedEntry.pdbId}`}
                initial={{ opacity: 0, scale: 0.97, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 12 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="bg-claude-surface dark:bg-[#242220] rounded-xl border border-claude-border dark:border-[#3d3832] flex flex-col shadow-2xl no-print overflow-hidden w-full max-w-4xl max-h-[90vh] pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Detail Header */}
                <div className="flex-shrink-0 p-4 pb-3 border-b border-claude-border dark:border-[#3d3832] relative z-10 bg-claude-surface dark:bg-[#242220]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono text-lg font-bold text-claude-accent">{selectedEntry.pdbId}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getMethodColor(selectedEntry.method).bg} ${getMethodColor(selectedEntry.method).text}`}>
                        {getMethodLabel(selectedEntry.method)}
                      </span>
                      {entryNotes[selectedEntry.pdbId] && (
                        <StickyNote className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setDetailPanelOpen(false); setSelectedEntry(null); }} className="h-8 w-8 p-0 text-claude-text-muted hover:text-claude-text flex-shrink-0 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832]">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {(() => {
                    const entryTags = generateTags(selectedEntry, diffMode && diffResult.newIds.has(selectedEntry.pdbId));
                    return entryTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entryTags.map((tag, i) => (
                          <TagPill key={`desktop-tag-${i}-${tag.label}`} tag={tag} size="xs" />
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Detail Content */}
                <div className="flex-1 min-h-0 overflow-y-auto preview-scroll custom-scrollbar">
                  <motion.div
                    key={selectedEntry.pdbId}
                    initial={{ x: detailSlideDirection === 'left' ? 30 : detailSlideDirection === 'right' ? -30 : 0, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className="p-0"
                  >
                    {detailContent}
                  </motion.div>
                </div>
              </motion.div>
              </div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* ═══════════ EVALUATION DETAIL PANEL ═══════════ */}
      <AnimatePresence>
        {detailPanelOpen && selectedEvalStructure && mode === 'evaluation' && (() => {
          const evalStruct = selectedEvalStructure;
          const isBlast = 'isBlast' in evalStruct && evalStruct.isBlast;
          const method = evalStruct.method || '';
          const methodColors = getMethodColor(method);

          return (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => { setDetailPanelOpen(false); setSelectedEvalStructure(null); }} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 pointer-events-none">
                <motion.div key={`ed-${evalStruct.pdbId}`} initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 12 }} transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }} className="bg-claude-surface dark:bg-[#242220] rounded-xl border border-claude-border dark:border-[#3d3832] flex flex-col shadow-2xl no-print overflow-hidden w-full max-w-4xl max-h-[90vh] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex-shrink-0 p-4 border-b border-claude-border dark:border-[#3d3832] relative z-10 bg-claude-surface dark:bg-[#242220]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-mono text-base font-bold text-claude-accent">{evalStruct.pdbId}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${methodColors.bg} ${methodColors.text}`}>{getMethodLabel(method)}</span>
                        {isBlast && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20">Homolog</span>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setDetailPanelOpen(false); setSelectedEvalStructure(null); }} className="h-8 w-8 p-0 text-claude-text-muted hover:text-claude-text flex-shrink-0 rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832]">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 preview-scroll min-h-0">
                    <div className="p-5 space-y-4 max-w-4xl mx-auto">
                      <div className="rounded-lg overflow-hidden border border-claude-border dark:border-[#3d3832]">
                        <MoleculeViewer pdbId={evalStruct.pdbId} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-lg bg-claude-border-light/30 dark:bg-[#1a1917]/60 space-y-1">
                          <div className="text-[8px] text-claude-text-muted uppercase tracking-wider">Title</div>
                          <div className="text-[11px] text-claude-text leading-snug line-clamp-2">{evalStruct.title || 'No title'}</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-claude-border-light/30 dark:bg-[#1a1917]/60 space-y-1">
                          <div className="text-[8px] text-claude-text-muted uppercase tracking-wider">Method</div>
                          <div className="text-[11px] text-claude-text font-medium">{getMethodLabel(method)}</div>
                          {evalStruct.resolution != null && (
                            <div className="flex items-center gap-1">
                              <span className={`text-[10px] font-mono font-semibold ${getResolutionColor(evalStruct.resolution)}`}>{safeNum(evalStruct.resolution, 2)}Å</span>
                              <div className="flex-1 h-1 bg-claude-border-light dark:bg-claude-border rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.max(5, Math.min(100, (1 - (evalStruct.resolution - 0.5) / 4.5) * 100))}%`, backgroundColor: evalStruct.resolution <= 2.0 ? '#16a34a' : evalStruct.resolution <= 3.5 ? '#c9872e' : '#dc2626' }} />
                              </div>
                            </div>
                          )}
                        </div>
                        {evalStruct.journal && (
                          <div className="p-2.5 rounded-lg bg-claude-border-light/30 dark:bg-[#1a1917]/60 space-y-1">
                            <div className="text-[8px] text-claude-text-muted uppercase tracking-wider">Journal</div>
                            <div className="flex items-center gap-1.5">
                              <div className="text-[10px] text-claude-text-secondary truncate flex-1">{evalStruct.journal}</div>
                              {evalStruct.journalIf != null && <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${getIfTierStyle(evalStruct.ifTier).bg} ${getIfTierStyle(evalStruct.ifTier).text}`}>IF {safeNum(evalStruct.journalIf, 1)}</span>}
                            </div>
                          </div>
                        )}
                        {isBlast && 'identity' in evalStruct && evalStruct.identity != null && (
                          <div className="p-2.5 rounded-lg bg-claude-border-light/30 dark:bg-[#1a1917]/60 space-y-1">
                            <div className="text-[8px] text-claude-text-muted uppercase tracking-wider">BLAST Identity</div>
                            <div className="text-[14px] font-bold font-mono" style={{ color: evalStruct.identity >= 90 ? '#16a34a' : evalStruct.identity >= 50 ? '#c9872e' : '#dc2626' }}>{evalStruct.identity}%</div>
                          </div>
                        )}
                      </div>
                      {parseLigands(evalStruct.ligand).length > 0 && (
                        <div className="p-2.5 rounded-lg bg-claude-border-light/30 dark:bg-[#1a1917]/60">
                          <div className="text-[8px] text-claude-text-muted uppercase tracking-wider mb-1.5">Ligands ({parseLigands(evalStruct.ligand).length})</div>
                          <div className="flex flex-wrap gap-1">
                            {parseLigands(evalStruct.ligand).map((lig, i) => (
                              <HoverCard key={`el-${i}-${lig}`} openDelay={200} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                  <span className="ligand-chip cursor-pointer" onMouseEnter={() => fetchLigandInfo(lig)}>{lig}</span>
                                </HoverCardTrigger>
                                <HoverCardContent side="left" className="p-0 w-auto bg-white dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] shadow-lg rounded-xl z-50">
                                  {ligandCache[lig] ? <LigandTooltipContent ligand={ligandCache[lig]} /> : <div className="p-3 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin text-claude-accent" /><span className="text-xs text-claude-text-muted">Loading...</span></div>}
                                </HoverCardContent>
                              </HoverCard>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        <a href={`https://www.rcsb.org/structure/${evalStruct.pdbId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent hover:bg-claude-accent/20 transition-all external-link-hover">
                          <ExternalLink className="h-2.5 w-2.5 ext-arrow" />RCSB
                        </a>
                        {evalStruct.pubmedId ? (
                          <a href={`https://pubmed.ncbi.nlm.nih.gov/${evalStruct.pubmedId}/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-claude-cryoem-bg text-claude-cryoem hover:bg-claude-cryoem/20 transition-all external-link-hover">
                            <ExternalLink className="h-2.5 w-2.5 ext-arrow" />PubMed
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </ScrollArea>
                </motion.div>
              </div>
            </>
          );
        })()}
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
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); handleExportJson(); }}>
              <FileJson className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Export as JSON</span>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); handleExportJsonFull(); }}>
              <FileJson className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Export as JSON (Full)</span>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); handleExportMarkdown(); }}>
              <TableIcon className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Export as Markdown Table</span>
            </CommandItem>
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); handleExportClipboard(); }}>
              <ClipboardCopy className="h-4 w-4 mr-2 text-claude-text-muted" />
              <span>Copy to Clipboard (TSV)</span>
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
            <CommandItem onSelect={() => { setCommandPaletteOpen(false); setMethodFilter('all'); setSearchQuery(''); clearAdvancedFilters(); setShowBookmarksOnly(false); setSelectedTagFilter(null); }}>
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

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-claude-surface dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] shadow-xl rounded-lg p-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-3 py-2 text-xs text-claude-text-secondary hover:bg-claude-accent-light dark:hover:bg-[#3d2a22] hover:text-claude-accent rounded-md flex items-center gap-2 transition-colors duration-100"
            onClick={() => { setSelectedWeekId(contextMenu.weekId); setPreviewOpen(true); setMobileSidebarOpen(false); setContextMenu(null); }}
          >
            <Eye className="h-3.5 w-3.5 text-claude-text-muted" />
            View Week
          </button>
          <button
            className="w-full text-left px-3 py-2 text-xs text-claude-text-secondary hover:bg-claude-accent-light dark:hover:bg-[#3d2a22] hover:text-claude-accent rounded-md flex items-center gap-2 transition-colors duration-100"
            onClick={() => { navigator.clipboard.writeText(contextMenu.weekId).catch(() => {}); setContextMenu(null); }}
          >
            <Copy className="h-3.5 w-3.5 text-claude-text-muted" />
            Copy Week ID
          </button>
          <div className="h-px bg-claude-border-light my-1" />
          <button
            className="w-full text-left px-3 py-2 text-xs text-claude-text-secondary hover:bg-claude-accent-light dark:hover:bg-[#3d2a22] hover:text-claude-accent rounded-md flex items-center gap-2 transition-colors duration-100"
            onClick={() => { window.open(`/api/reports?weekId=${contextMenu.weekId}`, '_blank'); setContextMenu(null); }}
          >
            <FileText className="h-3.5 w-3.5 text-claude-text-muted" />
            View Reports
          </button>
        </div>
      )}
      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu(null)}
          onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
        />
      )}

      {/* Eval Right-Click Context Menu */}
      {evalContextMenu && (
        <div
          className="fixed z-50 bg-claude-surface dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] shadow-xl rounded-lg p-1 min-w-[160px]"
          style={{ left: evalContextMenu.x, top: evalContextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-3 py-2 text-xs text-claude-text-secondary hover:bg-claude-accent-light dark:hover:bg-[#3d2a22] hover:text-claude-accent rounded-md flex items-center gap-2 transition-colors duration-100"
            onClick={() => { setSelectedEvalId(evalContextMenu.uniprotId); setPreviewOpen(true); setMobileSidebarOpen(false); setEvalContextMenu(null); }}
          >
            <Eye className="h-3.5 w-3.5 text-claude-text-muted" />
            View Evaluation
          </button>
          <button
            className="w-full text-left px-3 py-2 text-xs text-claude-text-secondary hover:bg-claude-accent-light dark:hover:bg-[#3d2a22] hover:text-claude-accent rounded-md flex items-center gap-2 transition-colors duration-100"
            onClick={() => { navigator.clipboard.writeText(evalContextMenu.uniprotId).catch(() => {}); setEvalContextMenu(null); }}
          >
            <Copy className="h-3.5 w-3.5 text-claude-text-muted" />
            Copy UniProt ID
          </button>
        </div>
      )}
      {evalContextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setEvalContextMenu(null)}
          onContextMenu={(e) => { e.preventDefault(); setEvalContextMenu(null); }}
        />
      )}
    </TooltipProvider>
  );

  // ── Sidebar Render Function ──
  function renderSidebar() {
    return (
      <>
        {/* Mode Switcher */}
        <div ref={tourModeSwitcherRef} className="px-3 border-b border-claude-border dark:border-[#3d3832] flex-shrink-0 h-12 flex items-center">
          <div className="flex items-center w-full">
            <div className="flex rounded-lg bg-claude-border-light dark:bg-[#1a1917] p-0.5 flex-1">
              <button
                onClick={() => { setMode('weekly'); setSelectedEvalId(null); setSelectedEval(null); setSearchQuery(''); setSearchDropdownOpen(false); setMobileSidebarOpen(false); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-150 ${
                  mode === 'weekly'
                    ? 'bg-white dark:bg-[#3d3832] text-claude-text dark:text-[#e8e4dd] shadow-sm'
                    : 'text-claude-text-muted hover:text-claude-text-secondary dark:hover:text-[#9b9590]'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                Weekly
              </button>
              <button
                onClick={() => { setMode('evaluation'); setSearchQuery(''); setSearchDropdownOpen(false); setMobileSidebarOpen(false); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-150 ${
                  mode === 'evaluation'
                    ? 'bg-white dark:bg-[#3d3832] text-claude-text dark:text-[#e8e4dd] shadow-sm'
                    : 'text-claude-text-muted hover:text-claude-text-secondary dark:hover:text-[#9b9590]'
                }`}
              >
                <Microscope className="h-3.5 w-3.5" />
                Evaluation
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto sidebar-scroll custom-scrollbar">
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
                      <span className="text-[9px] bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent px-1.5 py-0.5 rounded-full font-mono">({bookmarks.size})</span>
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
                            className="w-full text-left p-2 rounded-md hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150 flex items-start gap-2"
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
                          onClick={() => { setSelectedWeekId(snap.weekId); setPreviewOpen(true); setMobileSidebarOpen(false); }}
                          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, weekId: snap.weekId }); }}
                          className={`w-full text-left p-3 rounded-[10px] border transition-all duration-200 claude-hover btn-press active:scale-[0.97] ${
                            isSelected
                              ? 'bg-claude-accent-light dark:bg-[#3d2a22] border-claude-accent/30 shadow-sm sidebar-active-card animate-border-breathe breathe-glow-active week-card-active-border'
                              : 'bg-claude-surface dark:bg-[#242220] border-claude-border dark:border-[#3d3832] hover:border-claude-border-light dark:hover:border-[#4a4540] claude-card-shadow'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-claude-text dark:text-[#e8e4dd] font-mono">{snap.weekId}</span>
                            <span className="text-[10px] text-claude-text-muted dark:text-[#6b6560]">{snap.totalStructures} structures</span>
                          </div>
                          <div className="text-[10px] text-claude-text-muted dark:text-[#6b6560] mb-2">
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
                          <div className="flex h-1.5 rounded-full overflow-hidden bg-claude-border-light dark:bg-[#3d3832]">
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
                      {!sidebarOpen && (
                        <HoverCardContent
                          side="right"
                          align="start"
                          className="w-64 p-3 space-y-2 bg-white dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] rounded-xl shadow-xl"
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
                                <div className="h-1.5 rounded-full bg-claude-cryoem" style={{ width: `${Math.max(8, cryoemPct)}%` }} title={`Cryo-EM: ${snap.cryoemCount}`} />
                              )}
                              {snap.xrayCount > 0 && (
                                <div className="h-1.5 rounded-full bg-claude-xray" style={{ width: `${Math.max(8, xrayPct)}%` }} title={`X-ray: ${snap.xrayCount}`} />
                              )}
                              {snap.nmrCount > 0 && (
                                <div className="h-1.5 rounded-full bg-claude-nmr" style={{ width: `${Math.max(8, nmrPct)}%` }} title={`NMR: ${snap.nmrCount}`} />
                              )}
                              {snap.otherCount > 0 && (
                                <div className="h-1.5 rounded-full bg-claude-other" style={{ width: `${Math.max(8, (snap.otherCount / total) * 100)}%` }} title={`Other: ${snap.otherCount}`} />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[9px] text-claude-text-muted">
                              {snap.cryoemCount > 0 && <span className="text-claude-cryoem">EM {snap.cryoemCount}</span>}
                              {snap.xrayCount > 0 && <span className="text-claude-xray">XR {snap.xrayCount}</span>}
                              {snap.nmrCount > 0 && <span className="text-claude-nmr">NMR {snap.nmrCount}</span>}
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

                          {/* Click to view hint */}
                          <div className="text-[9px] text-claude-text-muted/60 text-center pt-1 border-t border-claude-border/50">
                            Click to view
                          </div>
                        </HoverCardContent>
                      )}
                    </HoverCard>
                  );
                })
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
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-claude-border dark:border-[#3d3832] bg-white dark:bg-[#1a1917] dark:text-[#e8e4dd] focus:outline-none focus:ring-2 focus:ring-claude-accent/40 focus:border-claude-accent/40 placeholder:text-claude-text-muted/60 claude-focus-ring"
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

              {/* Complex Evaluation Groups */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-claude-text-muted">Complex Evaluation</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setShowComplexDialog(true)}
                        className="h-5 w-5 flex items-center justify-center rounded text-claude-accent hover:bg-claude-accent-light dark:hover:bg-[#3d2a22] transition-colors duration-150"
                      >
                        <Layers className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">Create complex group</TooltipContent>
                  </Tooltip>
                </div>
                {complexGroups.length > 0 ? (
                  complexGroups.map(group => {
                    const isExpanded = expandedComplexId === group.id;
                    const isSelected = selectedComplexId === group.id;
                    const totalPdbs = group.uniprotIds.reduce((sum, uid) => {
                      const ev = evaluations.find(e => e.uniprotId === uid);
                      return sum + (ev?._count?.pdbStructures || 0);
                    }, 0);
                    const totalBlasts = group.uniprotIds.reduce((sum, uid) => {
                      const ev = evaluations.find(e => e.uniprotId === uid);
                      return sum + (ev?._count?.blastResults || 0);
                    }, 0);
                    return (
                      <div key={group.id}>
                        <div
                          className={`rounded-[10px] border transition-all duration-200 overflow-hidden ${
                            isSelected
                              ? 'bg-claude-accent-light/50 dark:bg-[#3d2a22]/60 border-claude-accent/30 shadow-sm'
                              : 'bg-claude-surface dark:bg-[#242220] border-claude-border dark:border-[#3d3832] hover:border-claude-border-light dark:hover:border-[#4a4540]'
                          }`}
                        >
                          <button
                            onClick={() => {
                              if (isSelected) {
                                setSelectedComplexId(null);
                              } else {
                                setSelectedComplexId(group.id);
                                setSelectedEvalId(null);
                                setSelectedEval(null);
                              }
                            }}
                            className="w-full text-left p-2.5"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <Layers className="h-3 w-3 text-claude-accent flex-shrink-0" />
                                  <span className="text-[11px] font-semibold text-claude-text dark:text-[#e8e4dd] truncate">{group.name}</span>
                                </div>
                                <div className="text-[10px] text-claude-text-muted dark:text-[#6b6560] mt-0.5">
                                  {group.uniprotIds.length} UniProt IDs · {totalPdbs} PDB · {totalBlasts} BLAST
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setExpandedComplexId(isExpanded ? null : group.id); }}
                                  className="h-5 w-5 flex items-center justify-center rounded hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150"
                                >
                                  <ChevronDown className={`h-3 w-3 text-claude-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeComplexGroup(group.id); }}
                                  className="h-5 w-5 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                                >
                                  <X className="h-3 w-3 text-claude-text-muted hover:text-red-500" />
                                </button>
                              </div>
                            </div>
                          </button>
                          {/* Expanded sub-entries */}
                          {isExpanded && (
                            <div className="px-2 pb-2 space-y-1 border-t border-claude-border/50 dark:border-[#3d3832]/50">
                              {group.uniprotIds.map(uid => {
                                const subEv = evaluations.find(e => e.uniprotId === uid);
                                const subScore = subEv ? getAvgScore(subEv.scores) : null;
                                const subColor = subScore !== null ? getScoreColor(subScore) : '#9b9590';
                                return (
                                  <button
                                    key={uid}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEvalId(uid);
                                      setSelectedComplexId(group.id);
                                    }}
                                    className="w-full text-left p-1.5 rounded-md hover:bg-claude-border-light dark:hover:bg-claude-border transition-colors duration-150 flex items-center gap-1.5"
                                  >
                                    <span className="font-mono text-[10px] font-semibold text-claude-accent">{uid}</span>
                                    {subEv && (
                                      <>
                                        <span className="text-[9px] text-claude-text-muted dark:text-[#6b6560] truncate flex-1">{subEv.proteinName || subEv.entryName}</span>
                                        {subScore !== null && (
                                          <span className="text-[9px] font-mono font-bold" style={{ color: subColor }}>
                                            {subScore.toFixed(1)}
                                          </span>
                                        )}
                                      </>
                                    )}
                                    {!subEv && (
                                      <span className="text-[9px] text-claude-text-muted/50 italic">Not found</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[10px] text-claude-text-muted/60 dark:text-[#9b9590] text-center py-1.5">
                    Click + to create a complex group
                  </div>
                )}
              </div>

              <Separator className="my-2" />

              {/* Individual Evaluations */}
              <div className="text-[10px] font-semibold uppercase tracking-wider text-claude-text-muted mb-1">Individual Evaluations</div>

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
                  // Compute coverage: use evalData.coverage if > 0, else compute from blast queryCoverage
                  const blastCoverages = (ev.blastResults || []).map(b => b.queryCoverage).filter((c): c is number => c != null);
                  const computedCoverage = blastCoverages.length > 0
                    ? blastCoverages.reduce((a, b) => a + b, 0) / blastCoverages.length
                    : null;
                  const displayCoverage = (ev.coverage != null && ev.coverage > 0) ? ev.coverage : computedCoverage;
                  return (
                    <ContextMenu key={ev.uniprotId}>
                      <ContextMenuTrigger asChild>
                    <button
                      onClick={() => { setSelectedEvalId(ev.uniprotId); setPreviewOpen(true); setMobileSidebarOpen(false); }}
                      className={`w-full text-left p-3 rounded-[10px] border transition-all duration-200 claude-hover btn-press active:scale-[0.97] ${
                        selectedEvalId === ev.uniprotId
                          ? 'bg-claude-accent-light dark:bg-[#3d2a22] border-claude-accent/30 shadow-sm border-l-[3px] border-l-claude-accent sidebar-active-card animate-border-breathe breathe-glow-active'
                          : 'bg-claude-surface dark:bg-[#242220] border-claude-border dark:border-[#3d3832] hover:border-claude-border-light dark:hover:border-[#4a4540] claude-card-shadow'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-xs font-semibold text-claude-accent">{ev.uniprotId}</span>
                          {ev.geneNames && (
                            <span className="ml-1.5 text-[10px] text-claude-text-muted dark:text-[#9b9590] font-normal">{ev.geneNames}</span>
                          )}
                        </div>
                        <span
                          className="flex-shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                          style={{ color: scoreColor, backgroundColor: `${scoreColor}15` }}
                        >
                          {avgScore.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-[11px] text-claude-text-secondary dark:text-[#9b9590] line-clamp-1 leading-tight">
                        {ev.proteinName || ev.entryName}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-claude-text-muted dark:text-[#6b6560]">
                        {displayCoverage != null && <span>{displayCoverage.toFixed(1)}% coverage</span>}
                        {ev._count && (
                          <>
                            <span>·</span>
                            <span>{ev._count.pdbStructures} PDB</span>
                            <span>{ev._count.blastResults} BLAST</span>
                          </>
                        )}
                      </div>
                    </button>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-48 bg-claude-surface dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] shadow-xl rounded-lg p-1">
                        <ContextMenuItem
                          className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                          onClick={() => { setSelectedEvalId(ev.uniprotId); setPreviewOpen(true); setMobileSidebarOpen(false); }}
                        >
                          <Eye className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                          View Evaluation
                        </ContextMenuItem>
                        <ContextMenuItem
                          className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                          onClick={() => { navigator.clipboard.writeText(ev.uniprotId).catch(() => {}); }}
                        >
                          <Copy className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                          Copy UniProt ID
                        </ContextMenuItem>
                        <ContextMenuSeparator className="bg-claude-border-light my-1" />
                        <ContextMenuItem
                          className="text-xs text-claude-text-secondary focus:bg-claude-accent-light dark:focus:bg-[#3d2a22] focus:text-claude-accent rounded-md px-2 py-1.5 cursor-pointer"
                          onClick={() => {
                            const url = `${window.location.origin}?mode=evaluation&eval=${ev.uniprotId}`;
                            navigator.clipboard.writeText(url).catch(() => {});
                          }}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-2 text-claude-text-muted" />
                          Copy Link
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Collapse Sidebar Button */}
        <div className="px-3 py-2 border-t border-claude-border dark:border-[#3d3832]">
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-full h-7 rounded-md flex items-center justify-center gap-1.5 text-[10px] text-claude-text-muted hover:bg-claude-border-light dark:hover:bg-[#3d3832] hover:text-claude-text-secondary transition-colors duration-150"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
            Collapse sidebar
          </button>
        </div>
      </>
    );
  }

  // ── Preview Panel Render Function ──
  function renderPreviewPanel() {
    const previewTabs = [
      { value: 'summary', icon: <BarChart3 className="h-3 w-3 mr-1" />, label: 'Summary' },
      { value: 'timeline', icon: <Clock className="h-3 w-3 mr-1" />, label: 'Timeline' },
      { value: 'heatmap', icon: <Grid3x3 className="h-3 w-3 mr-1" />, label: 'Heatmap' },
      { value: 'report', icon: <FileText className="h-3 w-3 mr-1" />, label: 'Report' },
    ];

    return (
      <Tabs value={previewTab} onValueChange={setPreviewTab} className="h-full flex flex-col min-h-0">
        <div className="relative px-3 border-b border-claude-border dark:border-[#3d3832] h-12 flex items-center">
          <TabsList className="w-full h-8 bg-claude-border-light dark:bg-[#2b2926] p-0.5 relative rounded-md">
            {previewTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="tab-gradient-active flex-1 text-[10px] h-7 relative z-[1] data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors duration-200 rounded-md"
              >
                {previewTab === tab.value && (
                  <motion.div
                    layoutId="preview-tab-indicator"
                    className="absolute inset-0 rounded-md"
                    style={{ background: 'linear-gradient(135deg, var(--color-claude-accent), var(--color-claude-accent-hover))' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-[2] flex items-center justify-start">
                  {tab.icon}
                  {tab.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          <button
            onClick={() => setPreviewOpen(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-7 w-7 flex items-center justify-center rounded-md hover:bg-claude-border-light dark:hover:bg-[#3d3832] transition-colors duration-150"
            aria-label="Close preview panel"
          >
            <X className="h-4 w-4 text-claude-text-muted" />
          </button>
        </div>

        <ScrollArea className="flex-1 preview-scroll min-h-0">
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
                pdbStructures={selectedEval.pdbStructures || []}
                blastResults={selectedEval.blastResults || []}
                onSelectPdb={(pdbId) => {
                  // Find in PDB structures first, then BLAST results
                  const struct = selectedEval.pdbStructures?.find(s => s.pdbId === pdbId);
                  const blast = selectedEval.blastResults?.find(b => b.pdbId === pdbId);
                  if (struct) {
                    setSelectedEntry({ ...struct, _type: 'weekly' } as unknown as PdbEntry);
                    setDetailPanelOpen(true);
                    setPreviewTab('summary');
                  } else if (blast) {
                    // For BLAST results, set a temporary selected eval structure
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
              />
            ) : mode === 'evaluation' && selectedEval && ((selectedEval.pdbStructures?.length || 0) + (selectedEval.blastResults?.length || 0)) > 0 ? (
              <EvaluationHeatmap
                pdbStructures={selectedEval.pdbStructures || []}
                blastResults={selectedEval.blastResults || []}
                onSelectPdb={(pdbId) => {
                  const struct = selectedEval.pdbStructures?.find(s => s.pdbId === pdbId);
                  const blast = selectedEval.blastResults?.find(b => b.pdbId === pdbId);
                  if (struct) {
                    setSelectedEntry({ ...struct, _type: 'weekly' } as unknown as PdbEntry);
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
                <Grid3x3 className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">{mode === 'evaluation' ? 'No PDB structures for heatmap' : 'Heatmap available in weekly mode'}</p>
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
            ) : mode === 'evaluation' && selectedEval ? (
              (() => {
                const filteredReports = evalReports.filter(r => r.uniprotId === selectedEval.uniprotId);
                return (
                  <div className="p-4 space-y-2">
                    {filteredReports.length > 0 ? filteredReports.map(report => (
                      <button
                        key={report.id}
                        onClick={() => openEvalReport(report.id, report.title || 'Evaluation Report')}
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
    <div className={`rounded-lg px-3 py-2 text-xs shadow-lg border bg-white dark:bg-[#2b2926] dark:border-[#4a4540] text-claude-text`}>
      {label && <div className={`font-semibold mb-1 text-[11px] text-claude-text`}>{label}</div>}
      {payload.map((p, i) => {
        const pct = total > 0 ? ((p.value / total) * 100).toFixed(1) : '0';
        const name = p.name || p.payload?.name || p.payload?.tier || p.payload?.range || '';
        const color = p.fill || p.payload?.color || '#c4644a';
        return (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-claude-text-secondary">{name}</span>
            <span className={`font-mono font-medium ml-auto text-claude-text`}>{p.value}</span>
            <span className="text-claude-text-muted">({pct}%)</span>
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
    <div className={`rounded-lg px-3 py-2 text-xs shadow-lg border bg-white dark:bg-[#2b2926] dark:border-[#4a4540] text-claude-text`}>
      <div className={`font-semibold mb-0.5 text-[11px] text-claude-text`}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0 bg-claude-accent" />
          <span className="text-claude-text-secondary">{p.dataKey === 'total' ? 'Structures' : p.dataKey}</span>
          <span className={`font-mono font-medium ml-auto text-claude-text`}>{p.value}</span>
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
    <div className={`rounded-lg px-3 py-2 text-xs shadow-lg border bg-white dark:bg-[#2b2926] dark:border-[#4a4540] text-claude-text`}>
      <div className={`font-semibold mb-0.5 text-[11px] text-claude-text`}>{range}</div>
      <div className="flex items-center gap-2 py-0.5">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.payload?.color || '#7c5cbf' }} />
        <span className="text-claude-text-secondary">Count</span>
        <span className={`font-mono font-medium ml-auto text-claude-text`}>{p.value}</span>
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
    <div className={`rounded-lg px-3 py-2 text-xs shadow-lg border bg-white dark:bg-[#2b2926] dark:border-[#4a4540] text-claude-text`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`font-mono font-semibold text-[11px] text-claude-accent`}>{d.pdbId}</span>
        {methodLabel && (
          <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ backgroundColor: methodColor + '20', color: methodColor }}>
            {methodLabel}
          </span>
        )}
      </div>
      {d.title && (
        <p className={`text-[10px] mb-1 line-clamp-2 text-claude-text-secondary`}>{d.title}</p>
      )}
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {d.resolution != null && (
          <div>
            <span className="text-claude-text-muted">Resolution:</span>{' '}
            <span className={`font-mono font-medium ${getResolutionColor(d.resolution)}`}>{safeNum(d.resolution, 2)}Å</span>
          </div>
        )}
        {d.journalIf != null && (
          <div>
            <span className="text-claude-text-muted">IF:</span>{' '}
            <span className={`font-mono font-medium text-claude-text`}>{safeNum(d.journalIf, 1)}</span>
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

  // SVG dimensions - axis at bottom of chart area
  const svgHeight = 280;
  const marginLeft = 8;
  const marginRight = 8;
  const marginTop = 24;
  const timelineY = 40;
  const axisY = svgHeight - 50; // Axis near bottom of SVG
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

  // Calculate dot positions - wrap horizontally to prevent overflow
  const dotPositions = useMemo(() => {
    const positions: { entry: PdbEntry; cx: number; cy: number; size: number; color: string; dayIndex: number }[] = [];
    const dayKeys = Object.keys(entriesByDay).sort();
    const maxDotsPerStack = 8; // Max dots before wrapping to next column
    const dotSpacing = 10; // Horizontal spacing between stacked dots

    dayKeys.forEach((dayKey, dayIdx) => {
      const dayEntries = entriesByDay[dayKey];
      const cx = marginLeft + dayIdx * dayWidth + dayWidth / 2;

      // Sort by IF descending so larger dots are at the bottom
      const sortedEntries = [...dayEntries].sort((a, b) => (b.journalIf ?? 0) - (a.journalIf ?? 0));

      sortedEntries.forEach((entry, stackIdx) => {
        const size = getDotSize(entry);
        // Wrap horizontally when exceeding max stack
        const stackGroup = Math.floor(stackIdx / maxDotsPerStack);
        const stackPos = stackIdx % maxDotsPerStack;
        // Alternate direction for adjacent groups to form a triangle pattern
        const actualStackPos = stackGroup % 2 === 0 ? stackPos : maxDotsPerStack - 1 - stackPos;
        // Dots grow UPWARD from axis line (toward smaller y, negative direction)
        const rawCY = axisY - 5 - actualStackPos * (size + 2);
        const cy = Math.max(rawCY, marginTop + 10);
        // Offset cx for groups after the first
        const groupOffset = stackGroup * dotSpacing;
        positions.push({
          entry,
          cx: cx + groupOffset,
          cy,
          size,
          color: getDotColor(entry),
          dayIndex: dayIdx,
        });
      });
    });

    return positions;
  }, [entriesByDay, dayWidth, marginLeft, axisY]);

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
          <h4 className="text-xs font-semibold text-claude-text">
            Release Timeline
          </h4>
          <span className="text-[10px] text-claude-text-muted">
            {formatDate(snapshot.weekStart)} — {formatDate(snapshot.weekEnd)}
          </span>
        </div>

        {/* Quick stats row */}
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-claude-text-secondary">
            Peak day: <span className="font-semibold text-claude-text">{timelineStats.peakDay?.dayName || '—'}</span>
            <span className="text-claude-text-muted"> ({timelineStats.maxCount} structures)</span>
          </span>
          <span className="text-claude-text-muted">·</span>
          <span className="text-claude-text-secondary">
            Avg/day: <span className="font-semibold text-claude-text">{timelineStats.avgPerDay}</span>
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
                  <span className="text-claude-text-muted">{seg.label}</span>
                  <span className="font-mono text-claude-text-secondary">{seg.count}</span>
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
            <span className="text-claude-text-muted">{item.label}</span>
          </span>
        ))}
        <span className="text-[9px] text-claude-text-muted ml-auto">
          Dot size ∝ Impact Factor
        </span>
      </div>

      {/* SVG Timeline */}
      <div className="rounded-[10px] border border-claude-border dark:border-[#3d3832] p-3 bg-claude-bg/30 dark:bg-[#1a1917]/50">
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
                className={`rounded-lg px-2.5 py-2 text-[10px] shadow-lg border bg-white dark:bg-[#2b2926] dark:border-[#4a4540] text-claude-text`}
                style={{ whiteSpace: 'nowrap' }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`font-mono font-semibold text-[11px] text-claude-accent`}>
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
                <div className={`text-claude-text-secondary truncate max-w-[180px]`}>
                  {tooltipData.entry.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {tooltipData.entry.resolution != null && (
                    <span className="text-claude-text-muted">
                      {tooltipData.entry.resolution}Å
                    </span>
                  )}
                  {tooltipData.entry.journalIf != null && (
                    <span className="text-claude-text-muted">
                      IF: {safeNum(tooltipData.entry.journalIf, 1)}
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
                <span className={`text-[9px] font-mono ${count > 0 ? 'text-claude-accent' : isDark ? 'text-[#4a4540]' : 'text-claude-border'}`}>
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
    <div className="px-3 sm:px-4 py-2">
      <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
        {/* Total Structures Card */}
        <TiltCard className="flex-1 bg-claude-surface dark:bg-[#242220] border border-claude-border dark:border-[#3d3832] rounded-[10px] p-3 claude-card-shadow animate-load-stat-card" animationDelay="400ms">
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
        </TiltCard>

        {/* Avg Resolution Card */}
        <TiltCard className="flex-1 bg-claude-surface dark:bg-[#242220] border border-claude-border dark:border-[#3d3832] rounded-[10px] p-3 claude-card-shadow animate-load-stat-card" animationDelay="450ms">
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
        </TiltCard>

        {/* Cryo-EM % Card */}
        <TiltCard className="flex-1 bg-claude-surface dark:bg-[#242220] border border-claude-border dark:border-[#3d3832] rounded-[10px] p-3 claude-card-shadow animate-load-stat-card" animationDelay="500ms">
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
        </TiltCard>

        {/* Top IF Card */}
        <TiltCard className="flex-1 bg-claude-surface dark:bg-[#242220] border border-claude-border dark:border-[#3d3832] rounded-[10px] p-3 claude-card-shadow animate-load-stat-card" animationDelay="550ms">
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
        </TiltCard>
      </div>
    </div>
  );
}

// ─── Activity Heatmap Component (GitHub-style contribution graph) ────────────

function ActivityHeatmap({
  entries,
  snapshots,
  loading,
}: {
  entries: PdbEntry[];
  snapshots: WeeklySnapshot[];
  loading: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  // Calculate date range from all data (snapshots)
  const dateRange = useMemo(() => {
    if (snapshots.length === 0) return { start: new Date(), end: new Date() };
    const sorted = [...snapshots].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
    const start = new Date(sorted[0].weekStart);
    const end = new Date(sorted[sorted.length - 1].weekEnd);
    return { start, end };
  }, [snapshots]);

  // Count entries per day
  const dailyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(entry => {
      if (!entry.releaseDate) return;
      const dateKey = entry.releaseDate.split('T')[0];
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });
    return counts;
  }, [entries]);

  // Build the grid data
  const gridData = useMemo(() => {
    const { start, end } = dateRange;
    // Adjust start to previous Sunday
    const adjustedStart = new Date(start);
    adjustedStart.setDate(adjustedStart.getDate() - adjustedStart.getDay());

    // Adjust end to next Saturday
    const adjustedEnd = new Date(end);
    adjustedEnd.setDate(adjustedEnd.getDate() + (6 - adjustedEnd.getDay()));

    const weeks: { date: string; dayOfWeek: number; count: number }[][] = [];
    let current = new Date(adjustedStart);
    let currentWeek: { date: string; dayOfWeek: number; count: number }[] = [];

    while (current <= adjustedEnd) {
      const dateKey = current.toISOString().split('T')[0];
      const dayOfWeek = current.getDay();
      currentWeek.push({
        date: dateKey,
        dayOfWeek,
        count: dailyCounts[dateKey] || 0,
      });

      if (dayOfWeek === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    // Push remaining days if any
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [dateRange, dailyCounts]);

  // Month labels for the top
  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = [];
    let prevMonth = -1;
    gridData.forEach((week, weekIdx) => {
      // Find the first day of the week that has a new month
      for (const day of week) {
        const d = new Date(day.date);
        const month = d.getMonth();
        if (month !== prevMonth) {
          labels.push({
            label: d.toLocaleDateString('en-US', { month: 'short' }),
            weekIndex: weekIdx,
          });
          prevMonth = month;
          break;
        }
      }
    });
    return labels;
  }, [gridData]);

  // Stats
  const stats = useMemo(() => {
    const totalStructures = entries.length;
    const activeDays = Object.values(dailyCounts).filter(c => c > 0).length;
    const avgPerDay = activeDays > 0 ? (totalStructures / activeDays).toFixed(1) : '0';
    return { totalStructures, activeDays, avgPerDay };
  }, [entries, dailyCounts]);

  const CELL_SIZE = 11;
  const CELL_GAP = 2;
  const CELL_STEP = CELL_SIZE + CELL_GAP;
  const DAY_LABEL_WIDTH = 24;
  const MONTH_LABEL_HEIGHT = 16;
  const PADDING_TOP = 4;

  // Color mapping function
  const getCellColor = (count: number): string => {
    if (count === 0) return isDark ? '#2b2926' : '#f0ece5';
    if (count <= 2) return isDark ? '#8f5a3a' : '#fddcc8';
    if (count <= 5) return isDark ? '#c4644a' : '#f5a67a';
    if (count <= 10) return isDark ? '#d4784f' : '#e8744e';
    return isDark ? '#e89f6a' : '#c96442';
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-4 w-32 shimmer-skeleton rounded" />
        <div className="h-[140px] shimmer-skeleton rounded-lg" />
        <div className="h-4 w-48 shimmer-skeleton rounded" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted">
        <Grid3x3 className="h-8 w-8 mb-2 opacity-30" />
        <p className="text-xs">No data available for heatmap</p>
        <p className="text-[10px] mt-1 opacity-60">Switch to weekly mode and select a week</p>
      </div>
    );
  }

  const svgWidth = DAY_LABEL_WIDTH + gridData.length * CELL_STEP + 8;
  const svgHeight = MONTH_LABEL_HEIGHT + 7 * CELL_STEP + PADDING_TOP;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-claude-text">Activity Heatmap</h3>
        <p className="text-[10px] text-claude-text-muted mt-0.5">
          PDB structure deposition activity across all weeks
        </p>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-lg p-3 claude-card-shadow chart-container chart-inner-shadow overflow-x-auto">
        <div className="relative" style={{ minWidth: svgWidth }}>
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="block"
          >
            {/* Month labels */}
            {monthLabels.map((ml, i) => (
              <text
                key={`month-${i}`}
                x={DAY_LABEL_WIDTH + ml.weekIndex * CELL_STEP}
                y={10}
                className="fill-claude-text-muted"
                style={{ fontSize: '9px', fontWeight: 500 }}
              >
                {ml.label}
              </text>
            ))}

            {/* Day-of-week labels */}
            {[1, 3, 5].map(dayIdx => {
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              return (
                <text
                  key={`day-${dayIdx}`}
                  x={0}
                  y={MONTH_LABEL_HEIGHT + PADDING_TOP + dayIdx * CELL_STEP + CELL_SIZE / 2 + 3}
                  className="fill-claude-text-muted dark:fill-[#9b9590]"
                  style={{ fontSize: '8px', fontWeight: 500 }}
                >
                  {dayNames[dayIdx]}
                </text>
              );
            })}

            {/* Grid cells */}
            {gridData.map((week, weekIdx) =>
              week.map(day => {
                const x = DAY_LABEL_WIDTH + weekIdx * CELL_STEP;
                const y = MONTH_LABEL_HEIGHT + PADDING_TOP + day.dayOfWeek * CELL_STEP;
                const color = getCellColor(day.count);
                const isHovered = hoveredCell?.date === day.date;
                return (
                  <rect
                    key={`cell-${day.date}`}
                    x={x}
                    y={y}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    rx={2}
                    ry={2}
                    fill={color}
                    stroke={isHovered ? (isDark ? '#e8e4dd' : '#c96442') : 'none'}
                    strokeWidth={isHovered ? 1.5 : 0}
                    style={{ cursor: 'pointer', transition: 'fill 0.15s ease' }}
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGRectElement).getBoundingClientRect();
                      setHoveredCell({
                        date: day.date,
                        count: day.count,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                );
              })
            )}
          </svg>

          {/* Tooltip */}
          {hoveredCell && (
            <div
              className="fixed z-50 pointer-events-none"
              style={{
                left: hoveredCell.x,
                top: hoveredCell.y - 8,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="bg-claude-border-light dark:bg-[#242220] text-claude-text dark:text-[#e8e4dd] text-[10px] px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                <span className="font-semibold">{hoveredCell.count} structure{hoveredCell.count !== 1 ? 's' : ''}</span>
                <span className="opacity-70 ml-1">on {hoveredCell.date}</span>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-[9px] text-claude-text-muted">Less</span>
          {[0, 1, 3, 6, 11].map((count, i) => (
            <div
              key={`legend-${i}`}
              className="rounded-sm"
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: getCellColor(count),
              }}
            />
          ))}
          <span className="text-[9px] text-claude-text-muted">More</span>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-3 text-[10px] text-claude-text-muted">
        <span className="font-semibold text-claude-text">{stats.totalStructures}</span> total structures
        <span className="text-claude-border">·</span>
        <span className="font-semibold text-claude-text">{stats.activeDays}</span> active days
        <span className="text-claude-border">·</span>
        <span className="font-semibold text-claude-text">{stats.avgPerDay}</span> avg/day
      </div>

      {/* Weekly breakdown mini table */}
      {snapshots.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-claude-text">Weekly Breakdown</h4>
          {[...snapshots]
            .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
            .map(snap => {
              const maxCount = Math.max(...snapshots.map(s => s.totalStructures), 1);
              const pct = (snap.totalStructures / maxCount) * 100;
              return (
                <div key={snap.weekId} className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-claude-text-muted w-10 flex-shrink-0">{snap.weekId.replace('W', ' W')}</span>
                  <div className="flex-1 h-4 rounded-sm overflow-hidden bg-claude-border-light/30 dark:bg-[#2b2926]">
                    <div
                      className="h-full rounded-sm transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isDark ? '#d4784f' : '#c96442',
                        minWidth: snap.totalStructures > 0 ? '4px' : '0',
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-claude-text-secondary w-6 text-right">{snap.totalStructures}</span>
                </div>
              );
            })}
        </div>
      )}
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
        <div className={`p-2.5 rounded-lg ${isDark ? 'bg-claude-border-light' : 'bg-claude-border-light/50'}`}>
          <div className="text-[9px] text-claude-text-muted mb-0.5">Structures</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-claude-text">{snapshotA.totalStructures}→{snapshotB.totalStructures}</span>
            <DeltaIndicator value={deltas.totalDelta} />
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${isDark ? 'bg-claude-border-light' : 'bg-claude-border-light/50'}`}>
          <div className="text-[9px] text-claude-text-muted mb-0.5">Avg Resolution</div>
          <div className="flex items-center gap-2">
            {deltas.resDelta !== null ? (
              <>
                <span className="text-sm font-semibold text-claude-text">
                  {((snapshotB.cryoemAvgRes ?? snapshotB.xrayAvgRes) ?? 0).toFixed(2)}Å
                </span>
                <DeltaIndicator value={deltas.resDelta} suffix="Å" invertColor />
              </>
            ) : (
              <span className="text-sm text-claude-text-muted">—</span>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${isDark ? 'bg-claude-border-light' : 'bg-claude-cryoem-bg/30'}`}>
          <div className="text-[9px] text-claude-cryoem/70 mb-0.5">Cryo-EM</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-claude-cryoem">{snapshotA.cryoemCount}→{snapshotB.cryoemCount}</span>
            <DeltaIndicator value={deltas.cryoemDelta} />
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${isDark ? 'bg-claude-border-light' : 'bg-claude-xray-bg/30'}`}>
          <div className="text-[9px] text-claude-xray/70 mb-0.5">X-ray</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-claude-xray">{snapshotA.xrayCount}→{snapshotB.xrayCount}</span>
            <DeltaIndicator value={deltas.xrayDelta} />
          </div>
        </div>
      </div>

      {/* Side-by-Side Method Donut Charts */}
      <div className="bg-claude-bg/50 dark:bg-[#1a1917]/50 rounded-lg p-3 claude-card-shadow chart-container chart-inner-shadow">
        <h4 className="text-xs font-semibold text-claude-text mb-2">Method Distribution</h4>
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
            <span className={`text-[8px] font-bold my-1 text-claude-text-muted`}>VS</span>
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
          <h4 className="text-xs font-semibold text-claude-text mb-2">Resolution Comparison</h4>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={resDataB} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#3d3832' : '#f0e8df'} vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 8, fill: getChartAxisColor(isDark) }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: getChartTickColor(isDark) }} axisLine={false} tickLine={false} width={24} />
              <RTooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className={`rounded-lg px-3 py-2 text-xs shadow-lg border bg-white dark:bg-[#2b2926] dark:border-[#4a4540] text-claude-text`}>
                    <div className={`font-semibold mb-1 text-[11px] text-claude-text`}>{label}</div>
                    {payload.map((p: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 py-0.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.fill }} />
                        <span className="text-claude-text-secondary">{p.name}</span>
                        <span className={`font-mono font-medium ml-auto text-claude-text`}>{p.value}</span>
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
    const vals = Object.values(scores).map(v => typeof v === 'number' ? v : (v as any)?.score ?? 0) as number[];
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [scores]);

  const [evalReport, setEvalReport] = useState<{ id: number; title: string | null } | null>(null);

  // BLAST table sort state
  const [blastSortField, setBlastSortField] = useState<string>('identity');
  const [blastSortDir, setBlastSortDir] = useState<'asc' | 'desc'>('desc');

  // Ligand cache for PDB structure tooltips
  const [ligandCache, setLigandCache] = useState<Record<string, LigandInfo>>({});
  const fetchLigandInfo = useCallback(async (code: string) => {
    if (ligandCache[code] || !code) return;
    try {
      const res = await fetch(`/api/ligand/${code}`);
      if (res.ok) {
        const data = await res.json();
        setLigandCache(prev => ({ ...prev, [code]: data }));
      }
    } catch { /* ignore */ }
  }, [ligandCache]);

  // Preload all unique ligands on mount
  useEffect(() => {
    const allCodes = new Set<string>();
    pdbStructures.forEach(s => {
      if (s.ligand) {
        s.ligand.split(/[;,\s]+/).filter(Boolean).forEach(c => allCodes.add(c.trim()));
      }
    });
    allCodes.forEach(code => fetchLigandInfo(code));
  }, [evalData.uniprotId]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] p-3 space-y-3">
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
              <text x="44" y="38" textAnchor="middle" className="fill-claude-text" style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-geist-mono), monospace' }}>
                {coveragePct.toFixed(0)}%
              </text>
              <text x="44" y="52" textAnchor="middle" className="fill-[#9b9590]" style={{ fontSize: '8px', fontWeight: 500 }}>
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-border-light/60 dark:bg-[#2b2926] text-claude-text-secondary dark:text-[#e8e4dd] border border-claude-border/50 dark:border-[#4a4540]">
              <span className="font-mono">{evalData.sequenceLength}</span> aa
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border" style={{ backgroundColor: coverageColor + '15', color: coverageColor, borderColor: coverageColor + '30' }}>
            {coverageLabel} coverage
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-claude-border-light/60 dark:bg-[#2b2926] text-claude-text-muted dark:text-[#9b9590] border border-claude-border/50 dark:border-[#4a4540]">
            <Clock className="h-2.5 w-2.5" />
            {formatDate(evalData.updatedAt)}
          </span>
        </div>
      </div>

      {/* ── Score Breakdown Panel ── */}
      {Object.keys(scores).length > 0 && (
        <div className="rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] p-3 space-y-2">
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
              // Handle both number scores and {score: number} object format
              const scoreNum = typeof value === 'number' ? value as number : (value as any)?.score ?? 0;
              const score = scoreNum;
              const pct = Math.min((score / 10) * 100, 100);
              const color = score >= 8 ? '#2d8f8f' : score >= 5 ? '#c9872e' : '#dc2626';
              const textColor = score >= 8 ? 'text-claude-cryoem' : score >= 5 ? 'text-claude-nmr' : 'text-claude-top';
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

          {/* Score Radar Chart */}
          {Object.keys(scores).length >= 3 && (
            <div className="pt-2 mt-2 border-t border-claude-border/50">
              <h5 className="text-[11px] font-semibold text-claude-text mb-2">Score Radar</h5>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={Object.entries(scores).map(([key, value]) => {
                  // Handle both number scores and {score: number} object format
                  const scoreNum = typeof value === 'number' ? value : (value as any)?.score ?? 0;
                  return {
                    metric: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                    score: scoreNum,
                    fullMark: 10,
                  };
                })}>
                  <PolarGrid stroke={isDark ? '#3d3832' : '#e8e4dd'} />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: isDark ? '#9b9590' : '#6b6560' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 8, fill: isDark ? '#6b6560' : '#9b9590' }} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke={isDark ? '#d4784f' : '#c96442'} fill={isDark ? '#d4784f' : '#c96442'} fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Protein Sequence Coverage Bar ── */}
      {evalData.sequenceLength != null && evalData.sequenceLength > 0 && (
        <div className="rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-claude-text">Sequence Coverage</h4>
            <span className="text-[10px] font-mono font-medium" style={{ color: coverageColor }}>
              Coverage: {coveragePct.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-claude-border-light dark:bg-[#1a1917] rounded-full overflow-hidden relative">
            {pdbStructures.length > 0 && pdbStructures.map((s, i) => {
              // Simulate coverage segments - spread structures across the protein
              const segmentWidth = Math.max(2, (coveragePct / pdbStructures.length));
              const leftOffset = (i / pdbStructures.length) * (100 - segmentWidth);
              return (
                <motion.div
                  key={`cov-${s.pdbId}-${i}`}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: `${segmentWidth}%`, opacity: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="absolute top-0 h-full rounded-full"
                  style={{
                    left: `${leftOffset}%`,
                    backgroundColor: isDark ? '#d4784f' : '#c96442',
                    opacity: 0.6 + (0.4 / pdbStructures.length) * (i + 1),
                  }}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[9px] text-claude-text-muted">
            <span>1</span>
            <span className="font-mono">{evalData.sequenceLength} aa</span>
          </div>
        </div>
      )}

      {/* ── PDB Structures Grid ── */}
      {pdbStructures.length > 0 && (
        <div className="rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] p-3 space-y-2">
          <h4 className="text-xs font-semibold text-claude-text">
            PDB Structures <span className="text-claude-text-muted font-normal">({pdbStructures.length})</span>
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {pdbStructures.map((s) => {
              const methodColors = s.method ? getMethodColor(s.method) : null;
              const methodLabel = s.method ? getMethodLabel(s.method) : '—';
              const ligandList = s.ligand ? s.ligand.split(/[;,\s]+/).filter(Boolean) : [];
              return (
                <div
                  key={`${s.uniprotId}-${s.pdbId}`}
                  className="block p-2 rounded-lg border border-claude-border/60 bg-claude-border-light/20 dark:bg-[#1a1917]/60 hover:bg-claude-border-light/50 dark:hover:bg-[#2b2926] transition-all duration-150 group"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <a
                      href={`https://www.rcsb.org/structure/${s.pdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[11px] font-bold text-claude-accent group-hover:text-claude-accent-hover transition-colors"
                    >{s.pdbId}</a>
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
                  {ligandList.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ligandList.slice(0, 3).map((lig, i) => (
                        <HoverCard key={`eval-lig-${s.pdbId}-${i}-${lig}`} openDelay={200} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <span
                              className="ligand-chip"
                              onMouseEnter={() => fetchLigandInfo(lig)}
                            >
                              {lig}
                            </span>
                          </HoverCardTrigger>
                          <HoverCardContent side="top" className="p-0 w-auto bg-white dark:bg-[#2b2926] border border-claude-border dark:border-[#4a4540] shadow-lg rounded-xl">
                            {ligandCache[lig] ? (
                              <LigandTooltipContent ligand={ligandCache[lig]} />
                            ) : (
                              <div className="p-3 flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin text-claude-accent" />
                                <span className="text-xs text-claude-text-muted">Loading...</span>
                              </div>
                            )}
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                      {ligandList.length > 3 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="ligand-chip cursor-default">+{ligandList.length - 3}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <div className="flex flex-wrap gap-1 max-w-48">
                              {ligandList.map((l, li) => (
                                <span key={`eval-lig-all-${s.pdbId}-${li}`} className="ligand-chip">{l}</span>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recommendations ── */}
      {evalData.report && (
        <div className="rounded-[10px] border border-claude-border dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] p-3 space-y-1.5">
          <h4 className="text-xs font-semibold text-claude-text">Recommendations</h4>
          <div className="p-2.5 rounded-lg bg-claude-border-light/30 dark:bg-[#2b2926] text-[11px] text-claude-text-secondary dark:text-[#9b9590] leading-relaxed line-clamp-4">
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

// ── Evaluation Timeline Component ─────────────────────────────────────────────
// Unified type for evaluation timeline
type EvalTimelineItem = {
  pdbId: string;
  method: string | null;
  resolution: number | null;
  title: string | null;
  ligand: string | null;
  releaseDate: string | null;
  journal: string | null;
  journalIf: number | null;
  isBlast: boolean;
  identity?: number | null;
};

function EvaluationTimeline({
  pdbStructures,
  blastResults,
  onSelectPdb,
}: {
  pdbStructures: { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null }[];
  blastResults: { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null; identity: number | null }[];
  onSelectPdb: (pdbId: string) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(350);
  const [tooltipData, setTooltipData] = useState<{
    item: EvalTimelineItem;
    x: number;
    y: number;
  } | null>(null);

  // Combine PDB structures and BLAST results
  const allItems: EvalTimelineItem[] = useMemo(() => {
    const pdbItems: EvalTimelineItem[] = pdbStructures.map(s => ({
      ...s,
      isBlast: false,
    }));
    const blastItems: EvalTimelineItem[] = blastResults.map(b => ({
      pdbId: b.pdbId || '',
      method: b.method,
      resolution: b.resolution,
      title: b.title,
      ligand: b.ligand,
      releaseDate: b.releaseDate,
      journal: b.journal,
      journalIf: b.journalIf,
      isBlast: true,
      identity: b.identity,
    }));
    return [...pdbItems, ...blastItems].filter(i => i.pdbId && i.releaseDate);
  }, [pdbStructures, blastResults]);

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

  // Date range
  const dateRange = useMemo(() => {
    if (allItems.length === 0) return { start: new Date(), end: new Date() };
    const dates = allItems.map(i => new Date(i.releaseDate!)).filter(d => !isNaN(d.getTime()));
    if (dates.length === 0) return { start: new Date(), end: new Date() };
    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));
    // Add some padding
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }, [allItems]);

  const totalDays = Math.max(1, Math.round((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Generate day labels
  const dayLabels = useMemo(() => {
    const days: { date: Date; dayName: string; dateLabel: string }[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(dateRange.start);
      d.setDate(d.getDate() + i);
      days.push({
        date: d,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    return days;
  }, [dateRange]);

  // Group entries by day
  const entriesByDay = useMemo(() => {
    const groups: Record<string, EvalTimelineItem[]> = {};
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(dateRange.start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      groups[key] = [];
    }
    allItems.forEach(item => {
      if (!item.releaseDate) return;
      const entryDate = item.releaseDate.split('T')[0];
      if (groups[entryDate]) {
        groups[entryDate].push(item);
      } else {
        // Find closest day
        const closest = Object.keys(groups).reduce((prev, curr) =>
          Math.abs(new Date(curr).getTime() - new Date(entryDate).getTime()) <
          Math.abs(new Date(prev).getTime() - new Date(entryDate).getTime()) ? curr : prev
        );
        groups[closest].push(item);
      }
    });
    return groups;
  }, [allItems, dateRange, totalDays]);

  // Timeline stats
  const timelineStats = useMemo(() => {
    const dayCounts = Object.values(entriesByDay).map(e => e.length);
    const maxCount = Math.max(...dayCounts, 0);
    const peakDayIdx = dayCounts.indexOf(maxCount);
    const peakDay = peakDayIdx >= 0 ? dayLabels[peakDayIdx] : null;
    const avgPerDay = allItems.length > 0 ? (allItems.length / totalDays).toFixed(1) : '0';
    return { maxCount, peakDay, avgPerDay };
  }, [entriesByDay, dayLabels, allItems, totalDays]);

  // SVG dimensions
  const svgHeight = 280;
  const marginLeft = 8;
  const marginRight = 8;
  const marginTop = 24;
  const axisY = svgHeight - 50;
  const dayLabelY = axisY + 14;
  const dateLabelY = dayLabelY + 12;
  const usableWidth = containerWidth - marginLeft - marginRight;
  const dayWidth = totalDays > 0 ? usableWidth / totalDays : usableWidth;

  // Get dot color by method
  const getDotColor = (item: EvalTimelineItem): string => {
    const m = item.method?.toUpperCase() || '';
    if (m.includes('CRYO') || m.includes('ELECTRON MICROSCOPY')) return METHOD_COLORS['Cryo-EM'];
    if (m.includes('X-RAY') || m.includes('XRAY')) return METHOD_COLORS['X-ray'];
    if (m.includes('NMR')) return METHOD_COLORS['NMR'];
    return METHOD_COLORS['Other'];
  };

  // Get dot size by IF
  const getDotSize = (item: EvalTimelineItem): number => {
    const if_ = item.journalIf ?? 0;
    return Math.min(16, Math.max(6, (if_ / 50) * 10 + 6));
  };

  // Calculate dot positions
  const dotPositions = useMemo(() => {
    const positions: { item: EvalTimelineItem; cx: number; cy: number; size: number; color: string; dayIndex: number }[] = [];
    const dayKeys = Object.keys(entriesByDay).sort();
    const maxDotsPerStack = 8;
    const dotSpacing = 10;

    dayKeys.forEach((dayKey, dayIdx) => {
      const dayEntries = entriesByDay[dayKey];
      const cx = marginLeft + dayIdx * dayWidth + dayWidth / 2;

      // Sort by IF descending
      const sortedEntries = [...dayEntries].sort((a, b) => (b.journalIf ?? 0) - (a.journalIf ?? 0));

      sortedEntries.forEach((item, stackIdx) => {
        const size = getDotSize(item);
        const stackGroup = Math.floor(stackIdx / maxDotsPerStack);
        const stackPos = stackIdx % maxDotsPerStack;
        const actualStackPos = stackGroup % 2 === 0 ? stackPos : maxDotsPerStack - 1 - stackPos;
        const rawCY = axisY - 5 - actualStackPos * (size + 2);
        const cy = Math.max(rawCY, marginTop + 10);
        const groupOffset = stackGroup * dotSpacing;
        positions.push({
          item,
          cx: cx + groupOffset,
          cy,
          size,
          color: getDotColor(item),
          dayIndex: dayIdx,
        });
      });
    });
    return positions;
  }, [entriesByDay, dayWidth, marginLeft, axisY]);

  const axisStroke = isDark ? '#4a4540' : '#e8e4dd';
  const textColor = isDark ? '#9b9590' : '#7c756e';

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted dark:text-[#9b9590]">
        <Clock className="h-8 w-8 mb-2 opacity-30" />
        <p className="text-xs">No structures with release dates</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4" ref={containerRef}>
      {/* Timeline Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-claude-text">Publication Timeline</h4>
          <span className="text-[10px] text-claude-text-muted">{allItems.length} structures</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-claude-text-secondary">
            Peak day: <span className="font-semibold text-claude-text">{timelineStats.peakDay?.dayName || '—'}</span>
            <span className="text-claude-text-muted"> ({timelineStats.maxCount} structures)</span>
          </span>
          <span className="text-claude-text-muted">·</span>
          <span className="text-claude-text-secondary">
            Avg/day: <span className="font-semibold text-claude-text">{timelineStats.avgPerDay}</span>
          </span>
        </div>
      </div>

      {/* Timeline SVG Chart */}
      <div className="relative">
        <svg width={containerWidth} height={svgHeight} className="overflow-visible">
          {/* Axis line */}
          <line
            x1={marginLeft}
            y1={axisY}
            x2={containerWidth - marginRight}
            y2={axisY}
            stroke={axisStroke}
            strokeWidth={1}
          />

          {/* Day labels */}
          {dayLabels.filter((_, i) => i % Math.max(1, Math.floor(totalDays / 7)) === 0).map((day, i) => {
            const x = marginLeft + i * Math.max(1, Math.floor(totalDays / 7)) * dayWidth + dayWidth / 2;
            return (
              <g key={`day-${i}`}>
                <line x1={x} y1={axisY} x2={x} y2={axisY + 4} stroke={axisStroke} strokeWidth={1} />
                <text x={x} y={dayLabelY} textAnchor="middle" className="text-[9px] fill-current" style={{ color: textColor }}>
                  {day.dayName}
                </text>
                <text x={x} y={dateLabelY} textAnchor="middle" className="text-[8px] fill-current" style={{ color: textColor }}>
                  {day.dateLabel}
                </text>
              </g>
            );
          })}

          {/* Dots */}
          {dotPositions.map((pos, i) => (
            <circle
              key={`dot-${i}-${pos.item.pdbId}`}
              cx={pos.cx}
              cy={pos.cy}
              r={pos.size / 2}
              fill={pos.color}
              fillOpacity={pos.item.isBlast ? 0.6 : 0.9}
              stroke={isDark ? '#242220' : 'white'}
              strokeWidth={1}
              className="cursor-pointer transition-all duration-150 hover:stroke-[2px] hover:stroke-claude-accent"
              onClick={() => { setTooltipData({ item: pos.item, x: pos.cx, y: pos.cy }); }}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {tooltipData && (
          <div
            className="absolute z-50 w-48 p-2 rounded-lg border border-claude-border dark:border-[#4a4540] bg-white dark:bg-[#242220] shadow-lg text-xs space-y-1"
            style={{
              left: Math.min(tooltipData.x + 10, containerWidth - 200),
              top: Math.max(tooltipData.y - 60, 10),
            }}
            onClick={() => onSelectPdb(tooltipData.item.pdbId)}
          >
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-semibold text-claude-accent">{tooltipData.item.pdbId}</span>
              {tooltipData.item.isBlast && (
                <span className="text-[9px] px-1 py-0.5 rounded bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent">Homolog</span>
              )}
            </div>
            <p className="text-claude-text-secondary dark:text-[#9b9590] line-clamp-2 text-[10px]">{tooltipData.item.title || 'No title'}</p>
            <div className="flex items-center gap-2 text-[10px] text-claude-text-muted">
              {tooltipData.item.resolution && <span>{tooltipData.item.resolution}Å</span>}
              {tooltipData.item.journalIf && <span>IF: {tooltipData.item.journalIf}</span>}
            </div>
            {tooltipData.item.isBlast && tooltipData.item.identity && (
              <div className="text-[10px] text-claude-text-muted">Identity: {tooltipData.item.identity}%</div>
            )}
            <div className="text-[9px] text-claude-accent mt-1">Click to view details →</div>
          </div>
        )}
      </div>

      {/* Click hint */}
      <p className="text-[9px] text-claude-text-muted text-center">Click a dot to view structure details</p>
    </div>
  );
}

// ── Evaluation Heatmap Component ─────────────────────────────────────────────
// Literature list type
type EvalLitItem = {
  pdbId: string;
  method: string | null;
  resolution: number | null;
  title: string | null;
  ligand: string | null;
  releaseDate: string | null;
  journal: string | null;
  journalIf: number | null;
  pubmedId: string | null;
  isBlast: boolean;
  identity?: number | null;
};

function EvaluationHeatmap({
  pdbStructures,
  blastResults,
  onSelectPdb,
}: {
  pdbStructures: { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null; pubmedId: string | null }[];
  blastResults: { pdbId: string; method: string | null; resolution: number | null; title: string | null; ligand: string | null; releaseDate: string | null; journal: string | null; journalIf: number | null; pubmedId?: string | null; identity: number | null }[];
  onSelectPdb: (pdbId: string) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sortDesc, setSortDesc] = useState(true);

  // Combine and sort by IF
  const allLiterature: EvalLitItem[] = useMemo(() => {
    const pdbItems: EvalLitItem[] = pdbStructures.map(s => ({ ...s, isBlast: false }));
    const blastItems: EvalLitItem[] = blastResults.map(b => ({
      pdbId: b.pdbId || '',
      method: b.method,
      resolution: b.resolution,
      title: b.title,
      ligand: b.ligand,
      releaseDate: b.releaseDate,
      journal: b.journal,
      journalIf: b.journalIf,
      pubmedId: b.pubmedId || null,
      isBlast: true,
      identity: b.identity,
    }));
    const combined = [...pdbItems, ...blastItems].filter(i => i.pdbId && (i.journal || i.pubmedId));
    // Sort by IF descending (unknown IF at end)
    combined.sort((a, b) => {
      const ifA = a.journalIf ?? -1;
      const ifB = b.journalIf ?? -1;
      return sortDesc ? ifB - ifA : ifA - ifB;
    });
    return combined;
  }, [pdbStructures, blastResults, sortDesc]);

  const methodColors: Record<string, string> = {
    'X-RAY DIFFRACTION': isDark ? '#d4784f' : '#c96442',
    'ELECTRON MICROSCOPY': isDark ? '#5b9bd5' : '#2980b9',
    'SOLUTION NMR': isDark ? '#6c5ce7' : '#8e44ad',
  };

  const getMethodLabel = (method: string | null) => {
    if (!method) return 'Unknown';
    if (method.includes('CRYO') || method.includes('ELECTRON')) return 'Cryo-EM';
    if (method.includes('X-RAY') || method.includes('XRAY')) return 'X-ray';
    if (method.includes('NMR')) return 'NMR';
    return method.split(' ')[0];
  };

  const getPubmedUrl = (item: EvalLitItem) => {
    if (item.pubmedId) return `https://pubmed.ncbi.nlm.nih.gov/${item.pubmedId}/`;
    if (item.journal) {
      // Try to construct a search URL
      const query = encodeURIComponent(`${item.title || item.pdbId} ${item.journal}`);
      return `https://pubmed.ncbi.nlm.nih.gov/?term=${query}`;
    }
    return `https://www.rcsb.org/structure/${item.pdbId}`;
  };

  if (allLiterature.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-claude-text-muted dark:text-[#9b9590]">
        <Grid3x3 className="h-8 w-8 mb-2 opacity-30" />
        <p className="text-xs">No literature data available</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-claude-text">Literature</h3>
        <button
          onClick={() => setSortDesc(!sortDesc)}
          className="flex items-center gap-1 text-[10px] text-claude-accent hover:text-claude-accent-hover transition-colors"
        >
          <ArrowUpDown className="h-3 w-3" />
          {sortDesc ? 'Highest IF' : 'Lowest IF'}
        </button>
      </div>

      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
        {allLiterature.map((item, idx) => (
          <div
            key={`${item.isBlast ? 'b' : 'p'}-${item.pdbId}-${idx}`}
            className="group p-2.5 rounded-lg border border-claude-border-light dark:border-[#3d3832] bg-claude-surface dark:bg-[#242220] hover:border-claude-accent/40 dark:hover:border-claude-accent/40 hover:shadow-md transition-all duration-150 cursor-pointer"
            onClick={() => onSelectPdb(item.pdbId)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-mono text-[11px] font-semibold text-claude-accent">{item.pdbId}</span>
                  {item.isBlast && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-claude-accent-light dark:bg-[#3d2a22] text-claude-accent border border-claude-accent/20">
                      Homolog
                    </span>
                  )}
                  <span className={`text-[9px] px-1 py-0.5 rounded ${methodColors[item.method || ''] ? '' : 'bg-claude-border-light dark:bg-[#2b2926] text-claude-text-muted'}`}
                    style={methodColors[item.method || ''] ? { backgroundColor: methodColors[item.method || ''] + '20', color: methodColors[item.method || ''] } : {}}>
                    {getMethodLabel(item.method)}
                  </span>
                </div>
                <p className="text-[10px] text-claude-text-secondary dark:text-[#9b9590] line-clamp-1 leading-relaxed">
                  {item.title || 'No title'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {item.journalIf ? (
                  <span className="text-[11px] font-semibold text-claude-accent">
                    {item.journalIf >= 10 ? (
                      <span className="text-claude-accent">{item.journalIf.toFixed(1)}</span>
                    ) : (
                      <span className="text-claude-text-secondary">{item.journalIf.toFixed(1)}</span>
                    )}
                  </span>
                ) : item.journal ? (
                  <span className="text-[9px] text-claude-text-muted">TBD</span>
                ) : null}
                <a
                  href={getPubmedUrl(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[9px] text-claude-accent hover:text-claude-accent-hover opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5"
                >
                  PubMed <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-[9px] text-claude-text-muted">
              {item.journal && <span className="truncate max-w-[120px]">{item.journal}</span>}
              {item.resolution && <span>{item.resolution}Å</span>}
              {item.releaseDate && <span>{item.releaseDate.split('T')[0]}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
