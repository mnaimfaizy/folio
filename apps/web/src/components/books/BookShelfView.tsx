import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Eye, Star } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';

/* ================================================================
   Types
   ================================================================ */

interface ShelfBook {
  id?: number;
  title: string;
  author?: string;
  genre?: string;
  publishYear?: number;
  description?: string;
  coverImage?: string;
  cover?: string;
}

export interface BookShelfViewProps {
  books: ShelfBook[];
}

/* ================================================================
   Constants – genre colour palette (leather / cloth tones)
   ================================================================ */

const GENRE_COLORS: Record<
  string,
  {
    bg: string;
    text: string;
    accent: string;
    texture: 'leather' | 'cloth' | 'linen';
  }
> = {
  Fiction: {
    bg: '#8B2252',
    text: '#F5DEB3',
    accent: '#D4A574',
    texture: 'cloth',
  },
  'Science Fiction': {
    bg: '#1B4F72',
    text: '#AED6F1',
    accent: '#5DADE2',
    texture: 'cloth',
  },
  Fantasy: {
    bg: '#4A235A',
    text: '#D7BDE2',
    accent: '#AF7AC5',
    texture: 'leather',
  },
  Mystery: {
    bg: '#1C2833',
    text: '#D5D8DC',
    accent: '#85929E',
    texture: 'leather',
  },
  Romance: {
    bg: '#922B3E',
    text: '#FADBD8',
    accent: '#E74C3C',
    texture: 'cloth',
  },
  History: {
    bg: '#2E5436',
    text: '#D5F5E3',
    accent: '#82E0AA',
    texture: 'leather',
  },
  Biography: {
    bg: '#6C3D0F',
    text: '#FDEBD0',
    accent: '#E59866',
    texture: 'leather',
  },
  Science: {
    bg: '#1A5276',
    text: '#D6EAF8',
    accent: '#3498DB',
    texture: 'linen',
  },
  Philosophy: {
    bg: '#4D5656',
    text: '#E8E8E8',
    accent: '#AAB7B8',
    texture: 'linen',
  },
  Poetry: {
    bg: '#7D3C98',
    text: '#E8DAEF',
    accent: '#BB8FCE',
    texture: 'cloth',
  },
  Thriller: {
    bg: '#1B2631',
    text: '#D5D8DC',
    accent: '#5D6D7E',
    texture: 'leather',
  },
  Horror: {
    bg: '#1A1A2E',
    text: '#C0C0C0',
    accent: '#E74C3C',
    texture: 'leather',
  },
  'Non-Fiction': {
    bg: '#5B370A',
    text: '#F9E79F',
    accent: '#F4D03F',
    texture: 'linen',
  },
  'Self-Help': {
    bg: '#0E6655',
    text: '#D1F2EB',
    accent: '#48C9B0',
    texture: 'cloth',
  },
};

const FALLBACK_COLORS: Array<{
  bg: string;
  text: string;
  accent: string;
  texture: 'leather' | 'cloth' | 'linen';
}> = [
  { bg: '#6B3A2A', text: '#FDEBD0', accent: '#E59866', texture: 'leather' },
  { bg: '#2C3E50', text: '#D6EAF8', accent: '#5DADE2', texture: 'cloth' },
  { bg: '#4A235A', text: '#E8DAEF', accent: '#BB8FCE', texture: 'leather' },
  { bg: '#1E8449', text: '#D5F5E3', accent: '#82E0AA', texture: 'cloth' },
  { bg: '#7B241C', text: '#FADBD8', accent: '#EC7063', texture: 'leather' },
  { bg: '#1F618D', text: '#AED6F1', accent: '#3498DB', texture: 'linen' },
  { bg: '#6E2C00', text: '#FAD7A0', accent: '#F0B27A', texture: 'leather' },
  { bg: '#514A9D', text: '#D2B4DE', accent: '#A569BD', texture: 'cloth' },
];

/* Headband colours — the coloured fabric strip at top/bottom of spine */
const HEADBAND_COLORS = [
  ['#C41E3A', '#F5F5DC'], // red + cream
  ['#1E3A5F', '#C4A35A'], // navy + gold
  ['#2E5436', '#F5DEB3'], // green + wheat
  ['#4A235A', '#E8DAEF'], // purple + lavender
  ['#8B4513', '#F4A460'], // saddle brown + sandy
  ['#1C2833', '#D5D8DC'], // charcoal + silver
];

/* ================================================================
   Utility helpers
   ================================================================ */

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getBookColor(genre?: string, title = '') {
  if (genre && GENRE_COLORS[genre]) return GENRE_COLORS[genre];
  return FALLBACK_COLORS[hashString(title) % FALLBACK_COLORS.length];
}

function getBookDimensions(title: string) {
  const h = hashString(title);
  // More varied sizing for visual interest
  const width = 48 + (h % 22);
  const heightPercent = 72 + (h % 24);
  const depth = 7 + (h % 5); // 7-11px depth
  return { width, heightPercent, depth };
}

function getBookTilt(title: string): number {
  const h = hashString(title + 'tilt');
  // Only some books lean slightly: -1.5° to 1.5°
  if (h % 4 === 0) return ((h % 30) - 15) / 10;
  return 0;
}

/** Shift a hex colour's brightness by `amount` (positive = lighter). */
function shiftColor(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/* ================================================================
   Responsive layout hook
   ================================================================ */

function useShelfLayout() {
  const [layout, setLayout] = useState({ booksPerShelf: 5, shelfCount: 2 });

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w >= 1280) setLayout({ booksPerShelf: 7, shelfCount: 2 });
      else if (w >= 1024) setLayout({ booksPerShelf: 6, shelfCount: 2 });
      else if (w >= 768) setLayout({ booksPerShelf: 4, shelfCount: 2 });
      else if (w >= 640) setLayout({ booksPerShelf: 3, shelfCount: 2 });
      else setLayout({ booksPerShelf: 2, shelfCount: 3 });
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  return { ...layout, booksPerPage: layout.booksPerShelf * layout.shelfCount };
}

/* ================================================================
   SVG Shared Definitions — rich wood grain, textures, and lighting
   ================================================================ */

function SharedSVGDefs() {
  return (
    <svg width="0" height="0" className="absolute">
      <defs>
        {/* ── Enhanced wood grain pattern ──────── */}
        <pattern
          id="woodGrainFine"
          width="300"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <rect width="300" height="24" fill="#8B6F47" />
          <path
            d="M0 2Q75 0 150 2T300 2"
            stroke="rgba(0,0,0,.07)"
            strokeWidth=".7"
            fill="none"
          />
          <path
            d="M0 5Q60 3.5 120 5T300 5"
            stroke="rgba(0,0,0,.05)"
            strokeWidth=".5"
            fill="none"
          />
          <path
            d="M0 8Q90 6 180 8T300 8"
            stroke="rgba(0,0,0,.06)"
            strokeWidth=".6"
            fill="none"
          />
          <path
            d="M0 11Q50 9.5 100 11T300 11"
            stroke="rgba(0,0,0,.04)"
            strokeWidth=".5"
            fill="none"
          />
          <path
            d="M0 14Q80 12 160 14T300 14"
            stroke="rgba(0,0,0,.06)"
            strokeWidth=".5"
            fill="none"
          />
          <path
            d="M0 17Q70 15.5 140 17T300 17"
            stroke="rgba(0,0,0,.05)"
            strokeWidth=".4"
            fill="none"
          />
          <path
            d="M0 20Q55 18 110 20T300 20"
            stroke="rgba(0,0,0,.04)"
            strokeWidth=".4"
            fill="none"
          />
          <path
            d="M0 23Q85 21 170 23T300 23"
            stroke="rgba(0,0,0,.05)"
            strokeWidth=".3"
            fill="none"
          />
          {/* Wood knot */}
          <ellipse
            cx="145"
            cy="12"
            rx="6"
            ry="4"
            fill="none"
            stroke="rgba(0,0,0,.08)"
            strokeWidth=".8"
          />
          <ellipse cx="145" cy="12" rx="3" ry="2" fill="rgba(0,0,0,.04)" />
        </pattern>

        {/* ── Back-panel wainscoting pattern ───── */}
        <pattern
          id="backPanelPattern"
          width="120"
          height="200"
          patternUnits="userSpaceOnUse"
        >
          <rect width="120" height="200" fill="#1a110c" />
          {/* Vertical groove lines */}
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="200"
            stroke="rgba(255,255,255,.02)"
            strokeWidth="1"
          />
          <line
            x1="60"
            y1="0"
            x2="60"
            y2="200"
            stroke="rgba(0,0,0,.15)"
            strokeWidth="1"
          />
          <line
            x1="61"
            y1="0"
            x2="61"
            y2="200"
            stroke="rgba(255,255,255,.02)"
            strokeWidth=".5"
          />
          <line
            x1="120"
            y1="0"
            x2="120"
            y2="200"
            stroke="rgba(0,0,0,.15)"
            strokeWidth="1"
          />
          {/* Subtle horizontal rail lines */}
          <line
            x1="0"
            y1="60"
            x2="120"
            y2="60"
            stroke="rgba(255,255,255,.015)"
            strokeWidth=".5"
          />
          <line
            x1="0"
            y1="140"
            x2="120"
            y2="140"
            stroke="rgba(255,255,255,.015)"
            strokeWidth=".5"
          />
        </pattern>

        {/* ── Book texture overlays ────────────── */}
        <pattern
          id="leatherTexture"
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
        >
          <rect width="4" height="4" fill="transparent" />
          <circle cx="1" cy="1" r=".4" fill="rgba(0,0,0,.08)" />
          <circle cx="3" cy="3" r=".3" fill="rgba(255,255,255,.04)" />
          <circle cx="1" cy="3" r=".25" fill="rgba(0,0,0,.06)" />
          <circle cx="3" cy="1" r=".35" fill="rgba(0,0,0,.05)" />
        </pattern>

        <pattern
          id="clothTexture"
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <rect width="3" height="3" fill="transparent" />
          <line
            x1="0"
            y1="0.5"
            x2="3"
            y2="0.5"
            stroke="rgba(0,0,0,.06)"
            strokeWidth=".3"
          />
          <line
            x1="0"
            y1="1.5"
            x2="3"
            y2="1.5"
            stroke="rgba(255,255,255,.03)"
            strokeWidth=".2"
          />
          <line
            x1="0"
            y1="2.5"
            x2="3"
            y2="2.5"
            stroke="rgba(0,0,0,.05)"
            strokeWidth=".3"
          />
          <line
            x1="0.5"
            y1="0"
            x2="0.5"
            y2="3"
            stroke="rgba(0,0,0,.04)"
            strokeWidth=".2"
          />
          <line
            x1="2.5"
            y1="0"
            x2="2.5"
            y2="3"
            stroke="rgba(255,255,255,.02)"
            strokeWidth=".2"
          />
        </pattern>

        <pattern
          id="linenTexture"
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
        >
          <rect width="5" height="5" fill="transparent" />
          <line
            x1="0"
            y1="1"
            x2="5"
            y2="1"
            stroke="rgba(0,0,0,.05)"
            strokeWidth=".4"
          />
          <line
            x1="0"
            y1="3"
            x2="5"
            y2="3"
            stroke="rgba(0,0,0,.04)"
            strokeWidth=".3"
          />
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="5"
            stroke="rgba(0,0,0,.03)"
            strokeWidth=".3"
          />
          <line
            x1="3.5"
            y1="0"
            x2="3.5"
            y2="5"
            stroke="rgba(0,0,0,.04)"
            strokeWidth=".2"
          />
        </pattern>

        {/* ── Shelf plank gradients ────────────── */}
        <linearGradient id="shelfTopGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C4973B" />
          <stop offset="25%" stopColor="#B08930" />
          <stop offset="60%" stopColor="#9A7828" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>

        <linearGradient id="shelfFrontGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B6914" />
          <stop offset="40%" stopColor="#7A5E18" />
          <stop offset="100%" stopColor="#5C4516" />
        </linearGradient>

        <linearGradient id="shelfUnderGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5C4516" />
          <stop offset="100%" stopColor="#3D2E10" />
        </linearGradient>

        {/* ── Frame gradients ─────────────────── */}
        <linearGradient id="crownGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6D4C41" />
          <stop offset="20%" stopColor="#5D4037" />
          <stop offset="50%" stopColor="#4E342E" />
          <stop offset="80%" stopColor="#3E2723" />
          <stop offset="100%" stopColor="#2C1810" />
        </linearGradient>

        <linearGradient id="sideLeftGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2C1810" />
          <stop offset="30%" stopColor="#3E2723" />
          <stop offset="60%" stopColor="#4E342E" />
          <stop offset="85%" stopColor="#3E2723" />
          <stop offset="100%" stopColor="#352018" />
        </linearGradient>

        <linearGradient id="sideRightGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#352018" />
          <stop offset="15%" stopColor="#3E2723" />
          <stop offset="40%" stopColor="#4E342E" />
          <stop offset="70%" stopColor="#3E2723" />
          <stop offset="100%" stopColor="#2C1810" />
        </linearGradient>

        <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3E2723" />
          <stop offset="40%" stopColor="#4E342E" />
          <stop offset="80%" stopColor="#3E2723" />
          <stop offset="100%" stopColor="#2C1810" />
        </linearGradient>

        {/* ── Side panel wood-grain (vertical) ── */}
        <pattern
          id="sidePanelGrain"
          width="24"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          <rect width="24" height="120" fill="transparent" />
          <path
            d="M4 0Q3 30 5 60T3 120"
            stroke="rgba(0,0,0,.06)"
            strokeWidth=".6"
            fill="none"
          />
          <path
            d="M10 0Q9 40 11 80T9 120"
            stroke="rgba(0,0,0,.05)"
            strokeWidth=".5"
            fill="none"
          />
          <path
            d="M16 0Q15 25 17 50T15 120"
            stroke="rgba(0,0,0,.04)"
            strokeWidth=".5"
            fill="none"
          />
          <path
            d="M20 0Q19 35 21 70T19 120"
            stroke="rgba(0,0,0,.05)"
            strokeWidth=".4"
            fill="none"
          />
        </pattern>
      </defs>
    </svg>
  );
}

/* ================================================================
   SVG shelf plank — enhanced with bracket supports & depth
   ================================================================ */

function ShelfPlankSVG() {
  return (
    <svg
      className="w-full relative z-5 pointer-events-none select-none"
      viewBox="0 0 1000 48"
      preserveAspectRatio="none"
      style={{ height: 36, display: 'block' }}
    >
      {/* Top surface with wood grain */}
      <rect x="0" y="0" width="1000" height="20" fill="url(#shelfTopGrad)" />
      <rect
        x="0"
        y="0"
        width="1000"
        height="20"
        fill="url(#woodGrainFine)"
        opacity=".4"
      />
      {/* Top highlight */}
      <line
        x1="0"
        y1="0.5"
        x2="1000"
        y2="0.5"
        stroke="rgba(255,255,255,.15)"
        strokeWidth="1"
      />

      {/* Front edge — thicker, with routed groove detail */}
      <rect x="0" y="20" width="1000" height="18" fill="url(#shelfFrontGrad)" />
      <rect
        x="0"
        y="20"
        width="1000"
        height="18"
        fill="url(#woodGrainFine)"
        opacity=".25"
      />
      {/* Routed groove (decorative channel) */}
      <line
        x1="0"
        y1="28"
        x2="1000"
        y2="28"
        stroke="rgba(0,0,0,.2)"
        strokeWidth="1.2"
      />
      <line
        x1="0"
        y1="29"
        x2="1000"
        y2="29"
        stroke="rgba(255,255,255,.06)"
        strokeWidth=".5"
      />

      {/* Under-bevel */}
      <rect x="0" y="38" width="1000" height="10" fill="url(#shelfUnderGrad)" />
      {/* Bottom shadow line */}
      <line
        x1="0"
        y1="47.5"
        x2="1000"
        y2="47.5"
        stroke="rgba(0,0,0,.45)"
        strokeWidth="1"
      />

      {/* ── Bracket supports ─────────────────── */}
      {[170, 500, 830].map((cx) => (
        <g key={cx}>
          {/* Bracket body */}
          <path
            d={`M${cx - 14} 38 L${cx - 14} 46 Q${cx} 48 ${cx + 14} 46 L${cx + 14} 38`}
            fill="#4E342E"
            stroke="rgba(0,0,0,.3)"
            strokeWidth=".5"
          />
          {/* Bracket detail line */}
          <path
            d={`M${cx - 10} 41 Q${cx} 44 ${cx + 10} 41`}
            fill="none"
            stroke="rgba(255,215,0,.08)"
            strokeWidth=".6"
          />
        </g>
      ))}
    </svg>
  );
}

/* ================================================================
   Bookshelf wooden frame (wraps all shelves) — enhanced
   ================================================================ */

function BookshelfFrame({ children }: { children: ReactNode }) {
  const SIDE = 26;

  return (
    <div className="relative mx-auto max-w-6xl select-none">
      <SharedSVGDefs />

      {/* ── Crown Molding — multi-layer carved profile ── */}
      <svg
        className="w-full"
        viewBox="0 0 1000 56"
        preserveAspectRatio="none"
        style={{ height: 46, display: 'block' }}
      >
        {/* Main crown body */}
        <rect x="0" y="20" width="1000" height="36" fill="url(#crownGrad)" />
        <rect
          x="0"
          y="20"
          width="1000"
          height="36"
          fill="url(#woodGrainFine)"
          opacity=".2"
        />

        {/* Ogee molding profile (top curve) */}
        <path d="M0 20Q0 8 16 6L984 6Q1000 8 1000 20Z" fill="#5D4037" />
        <path
          d="M0 20Q0 8 16 6L984 6Q1000 8 1000 20Z"
          fill="url(#woodGrainFine)"
          opacity=".15"
        />

        {/* Cyma recta cap */}
        <path d="M0 9Q0 1 14 1L986 1Q1000 1 1000 9Z" fill="#4E342E" />
        <path
          d="M2 6Q2 2 14 2L986 2Q998 2 998 6Z"
          fill="#5D4037"
          opacity=".6"
        />

        {/* Highlight on top edge */}
        <line
          x1="14"
          y1="1.5"
          x2="986"
          y2="1.5"
          stroke="rgba(255,255,255,.08)"
          strokeWidth=".5"
        />

        {/* Carved dentil pattern */}
        {Array.from({ length: 40 }, (_, i) => (
          <rect
            key={i}
            x={40 + i * 24}
            y="14"
            width="10"
            height="5"
            rx="0.5"
            fill="rgba(0,0,0,.12)"
          />
        ))}

        {/* Gold inlay line */}
        <line
          x1="30"
          y1="30"
          x2="970"
          y2="30"
          stroke="rgba(255,215,0,.1)"
          strokeWidth=".8"
        />
        <line
          x1="30"
          y1="40"
          x2="970"
          y2="40"
          stroke="rgba(255,215,0,.06)"
          strokeWidth=".5"
        />

        {/* Shadow underneath crown */}
        <line
          x1="0"
          y1="55.5"
          x2="1000"
          y2="55.5"
          stroke="rgba(0,0,0,.25)"
          strokeWidth="1"
        />
      </svg>

      {/* ── Body (side panels + content) ─────── */}
      <div className="relative flex">
        {/* Left panel */}
        <div className="shrink-0 z-25 relative" style={{ width: SIDE }}>
          <div
            className="absolute inset-0"
            style={{ background: 'url(#sideLeftGrad)' }}
          />
          <svg
            className="w-full h-full absolute inset-0"
            preserveAspectRatio="none"
          >
            <rect width="100%" height="100%" fill="url(#sideLeftGrad)" />
            <rect
              width="100%"
              height="100%"
              fill="url(#sidePanelGrain)"
              opacity=".4"
            />
            {/* Inner edge shadow */}
            <line
              x1="100%"
              y1="0"
              x2="100%"
              y2="100%"
              stroke="rgba(0,0,0,.3)"
              strokeWidth="1"
            />
            {/* Outer edge highlight */}
            <line
              x1="1"
              y1="0"
              x2="1"
              y2="100%"
              stroke="rgba(255,255,255,.04)"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Content – dark wainscoted back panel behind books */}
        <div className="flex-1 min-w-0 relative overflow-visible">
          {/* Wainscot / panelling */}
          <svg
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <rect width="100%" height="100%" fill="url(#backPanelPattern)" />
          </svg>

          {/* Warm ambient glow from above each shelf (soffit light) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 90% 30% at 50% 0%,rgba(180,140,60,.06),transparent 70%)',
            }}
          />

          <div className="relative">{children}</div>
        </div>

        {/* Right panel */}
        <div className="shrink-0 z-25 relative" style={{ width: SIDE }}>
          <svg
            className="w-full h-full absolute inset-0"
            preserveAspectRatio="none"
          >
            <rect width="100%" height="100%" fill="url(#sideRightGrad)" />
            <rect
              width="100%"
              height="100%"
              fill="url(#sidePanelGrain)"
              opacity=".4"
            />
            {/* Inner edge shadow */}
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              stroke="rgba(0,0,0,.3)"
              strokeWidth="1"
            />
            {/* Outer highlight */}
            <line
              x1="99%"
              y1="0"
              x2="99%"
              y2="100%"
              stroke="rgba(255,255,255,.04)"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>

      {/* ── Base — with carved toe-kick ────────── */}
      <svg
        className="w-full"
        viewBox="0 0 1000 44"
        preserveAspectRatio="none"
        style={{ height: 36, display: 'block' }}
      >
        {/* Main body */}
        <rect x="0" y="0" width="1000" height="30" fill="url(#baseGrad)" />
        <rect
          x="0"
          y="0"
          width="1000"
          height="30"
          fill="url(#woodGrainFine)"
          opacity=".2"
        />

        {/* Routed line */}
        <line
          x1="30"
          y1="10"
          x2="970"
          y2="10"
          stroke="rgba(255,215,0,.07)"
          strokeWidth=".6"
        />
        <line
          x1="30"
          y1="20"
          x2="970"
          y2="20"
          stroke="rgba(0,0,0,.15)"
          strokeWidth=".8"
        />
        <line
          x1="30"
          y1="21"
          x2="970"
          y2="21"
          stroke="rgba(255,255,255,.03)"
          strokeWidth=".4"
        />

        {/* Toe-kick recess */}
        <path
          d="M30 30L30 40Q30 44 44 44L956 44Q970 44 970 40L970 30Z"
          fill="#1a110c"
        />
        <path d="M0 30L30 30L30 44L0 44Z" fill="#2C1810" />
        <path d="M970 30L1000 30L1000 44L970 44Z" fill="#2C1810" />

        {/* Feet / plinths */}
        {[60, 940].map((cx) => (
          <rect
            key={cx}
            x={cx - 12}
            y="30"
            width="24"
            height="14"
            rx="2"
            fill="#3E2723"
          />
        ))}

        {/* Top shadow line */}
        <line
          x1="0"
          y1="0.5"
          x2="1000"
          y2="0.5"
          stroke="rgba(0,0,0,.4)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

/* ================================================================
   Individual book on the shelf — enhanced with textures & 3D
   ================================================================ */

function BookOnShelf({
  book,
  shelfHeight,
}: {
  book: ShelfBook;
  shelfHeight: number;
}) {
  const color = getBookColor(book.genre, book.title);
  const { width, heightPercent, depth } = getBookDimensions(book.title);
  const bookHeight = Math.floor(shelfHeight * (heightPercent / 100));
  const topOffset = shelfHeight - bookHeight;
  const tilt = getBookTilt(book.title);

  const coverUrl =
    book.coverImage ||
    book.cover ||
    `https://placehold.co/200x300/e2e8f0/64748b?text=${encodeURIComponent(book.title.slice(0, 10))}`;

  const darker = shiftColor(color.bg, -25);
  const lighter = shiftColor(color.bg, 22);
  const h = hashString(book.title);
  const headband = HEADBAND_COLORS[h % HEADBAND_COLORS.length];
  const textureId = `${color.texture}Texture`;

  // Spine design variation based on hash
  const spineVariant = h % 3; // 0 = classic, 1 = banded, 2 = emblem

  return (
    <div
      className="group/book relative shrink-0"
      style={{
        width: width + depth,
        height: shelfHeight,
        paddingTop: topOffset,
      }}
    >
      {/* ── Book shadow on shelf surface ───────── */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-0"
        style={{
          width: width + 8,
          height: 6,
          background:
            'radial-gradient(ellipse at 50% 0%,rgba(0,0,0,.55) 0%,transparent 75%)',
          filter: 'blur(2px)',
        }}
      />

      {/* ── The 3D book ───────────────────────── */}
      <div
        className="relative transition-all duration-300 ease-out
                   group-hover/book:-translate-y-6 group-hover/book:scale-[1.08]
                   z-10 group-hover/book:z-30 cursor-pointer"
        style={{
          width: width + depth,
          height: bookHeight,
          transform: tilt ? `rotate(${tilt}deg)` : undefined,
          transformOrigin: 'bottom center',
        }}
      >
        {/* ── Front face (spine) ────────────────── */}
        <div
          className="absolute top-0 left-0 bottom-0 rounded-l-[2px] overflow-hidden"
          style={{
            width,
            background: `linear-gradient(180deg,${lighter} 0%,${color.bg} 35%,${color.bg} 65%,${darker} 100%)`,
            boxShadow: `
              inset -4px 0 8px rgba(0,0,0,.35),
              inset 3px 0 6px rgba(255,255,255,.06),
              inset 0 2px 4px rgba(255,255,255,.08),
              inset 0 -2px 4px rgba(0,0,0,.2)
            `,
          }}
        >
          {/* Material texture overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
          >
            <rect
              width="100%"
              height="100%"
              fill={`url(#${textureId})`}
              opacity=".8"
            />
          </svg>

          {/* ── Headband (top fabric strip) ──── */}
          <div
            className="mx-auto mt-[3px]"
            style={{
              width: '80%',
              height: 3,
              background: `repeating-linear-gradient(90deg,${headband[0]} 0px,${headband[0]} 2px,${headband[1]} 2px,${headband[1]} 4px)`,
              borderRadius: 0.5,
              boxShadow: '0 1px 1px rgba(0,0,0,.3)',
            }}
          />

          {/* ── Top decorative rule ─────────── */}
          {spineVariant !== 2 && (
            <div
              className="mx-auto mt-1"
              style={{
                width: '50%',
                height: 1,
                backgroundColor: color.accent,
                opacity: 0.5,
                borderRadius: 1,
              }}
            />
          )}

          {/* ── Spine bands (for banded variant) */}
          {spineVariant === 1 && (
            <>
              {[18, 30, 70, 82].map((pct) => (
                <div
                  key={pct}
                  className="absolute left-0 right-0"
                  style={{
                    top: `${pct}%`,
                    height: 2,
                    background: `linear-gradient(90deg,transparent 5%,rgba(0,0,0,.2) 20%,rgba(0,0,0,.15) 50%,rgba(0,0,0,.2) 80%,transparent 95%)`,
                  }}
                />
              ))}
            </>
          )}

          {/* ── Title (vertical) ───────────── */}
          <div
            className="absolute inset-x-0 flex items-center justify-center overflow-hidden"
            style={{
              top: spineVariant === 1 ? '22%' : '12%',
              bottom: '24%',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
            }}
          >
            <span
              className="text-[10px] font-bold leading-tight text-center tracking-wide"
              style={{
                color: color.text,
                textShadow: `0 1px 0 rgba(0,0,0,.5), 0 -1px 0 rgba(255,255,255,.08)`,
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                padding: '0 2px',
                letterSpacing: '0.03em',
              }}
            >
              {book.title}
            </span>
          </div>

          {/* ── Emblem (for emblem variant) ─── */}
          {spineVariant === 2 && (
            <div
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
              style={{
                bottom: '20%',
                width: Math.min(width - 8, 28),
                height: Math.min(width - 8, 28),
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full"
                style={{ opacity: 0.3 }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke={color.accent}
                  strokeWidth="1"
                />
                <path
                  d="M12 5L14 10H19L15 13L16.5 18L12 15L7.5 18L9 13L5 10H10Z"
                  fill={color.accent}
                />
              </svg>
            </div>
          )}

          {/* ── Author (vertical) ──────────── */}
          <div
            className="absolute inset-x-0 bottom-[5%] flex items-center justify-center overflow-hidden"
            style={{
              height: '14%',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
            }}
          >
            <span
              className="text-[7px] leading-tight text-center opacity-55 tracking-wider"
              style={{
                color: color.text,
                textShadow: '0 1px 1px rgba(0,0,0,.4)',
                padding: '0 1px',
              }}
            >
              {book.author?.split(' ').pop() || ''}
            </span>
          </div>

          {/* ── Bottom rule ────────────────── */}
          <div
            className="absolute bottom-[3px] left-1/2 -translate-x-1/2"
            style={{
              width: '40%',
              height: 1,
              backgroundColor: color.accent,
              opacity: 0.3,
              borderRadius: 1,
            }}
          />

          {/* ── Tailband (bottom fabric strip) */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              width: '80%',
              height: 2.5,
              background: `repeating-linear-gradient(90deg,${headband[1]} 0px,${headband[1]} 2px,${headband[0]} 2px,${headband[0]} 4px)`,
              borderRadius: '0 0 0.5px 0.5px',
            }}
          />

          {/* ── Spine hinge crease (left edge) */}
          <div
            className="absolute top-0 bottom-0 left-0"
            style={{
              width: 3,
              background: 'linear-gradient(90deg,rgba(0,0,0,.25),transparent)',
            }}
          />
        </div>

        {/* ── Side edge (page block) ───────────── */}
        <div
          className="absolute top-0 bottom-0 rounded-r-[1px]"
          style={{
            left: width,
            width: depth,
            background: `linear-gradient(90deg,
              #F5F0E1 0%,
              #ECE4D4 15%,
              #F0EBD8 30%,
              #E8E0CE 50%,
              #EEEAD8 70%,
              #E5DCC8 85%,
              #DDD4C0 100%)`,
            boxShadow: `
              inset 0 2px 3px rgba(0,0,0,.08),
              inset 0 -2px 3px rgba(0,0,0,.06),
              2px 0 4px rgba(0,0,0,.3)
            `,
          }}
        >
          {/* Page line details */}
          <svg className="w-full h-full" preserveAspectRatio="none">
            {Array.from({ length: Math.floor(depth / 1.5) }, (_, i) => (
              <line
                key={i}
                x1={1 + i * 1.5}
                y1="3"
                x2={1 + i * 1.5}
                y2="97%"
                stroke="rgba(0,0,0,.04)"
                strokeWidth=".3"
              />
            ))}
          </svg>
        </div>

        {/* ── Top edge (page tops viewed from above) */}
        <div
          className="absolute left-0 right-0 rounded-t-[1px]"
          style={{
            top: -3,
            height: 4,
            background: `linear-gradient(180deg,
              #F5F0E1,
              #ECE4D4 40%,
              #E0D8C8)`,
            boxShadow: '0 -1px 3px rgba(0,0,0,.12)',
            borderRight: `${depth}px solid #E5DCC8`,
          }}
        />
      </div>

      {/* ── Hover popup card ───────────────────── */}
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2
                   opacity-0 scale-95
                   group-hover/book:opacity-100 group-hover/book:scale-100
                   pointer-events-none group-hover/book:pointer-events-auto
                   transition-all duration-300 z-50"
        style={{ width: 220 }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cover */}
          <div className="relative h-32 bg-linear-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <img
              src={coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {book.genre && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-200 text-[10px] backdrop-blur-sm border-0">
                  {book.genre}
                </Badge>
              </div>
            )}
            <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-1.5 py-0.5">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">
                4.5
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
              {book.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {book.author}
              {book.publishYear && ` · ${book.publishYear}`}
            </p>
            {book.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {book.description}
              </p>
            )}
            <Button size="sm" className="w-full mt-2 h-7 text-xs" asChild>
              <Link to={`/books/${book.id}`}>
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Link>
            </Button>
          </div>
        </div>

        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-900 rotate-45 -mt-1.5 border-r border-b border-gray-200 dark:border-gray-700" />
      </div>
    </div>
  );
}

/* ================================================================
   Single shelf row (books + plank + lighting)
   ================================================================ */

function ShelfRow({
  books,
  shelfHeight,
  animKey,
  direction,
}: {
  books: ShelfBook[];
  shelfHeight: number;
  animKey: number;
  direction: 'left' | 'right';
}) {
  const isEmpty = books.length === 0;

  return (
    <div className="relative">
      {/* Under-shelf lighting glow */}
      <div
        className="absolute top-0 left-0 right-0 h-12 pointer-events-none z-[1]"
        style={{
          background:
            'linear-gradient(180deg,rgba(180,140,60,.06) 0%,transparent 100%)',
        }}
      />

      {/* Books container — keyed so React re-mounts on page change */}
      <div
        key={animKey}
        className={cn(
          'relative flex items-end justify-center gap-[3px] px-6',
          !isEmpty &&
            (direction === 'left'
              ? 'animate-[shelfSlideFromRight_0.45s_ease-out]'
              : 'animate-[shelfSlideFromLeft_0.45s_ease-out]'),
        )}
        style={{ height: shelfHeight, paddingBottom: 2, overflow: 'visible' }}
      >
        {isEmpty ? (
          <EmptyShelfDecor />
        ) : (
          <>
            {books.map((book, i) => (
              <BookOnShelf
                key={book.id ?? i}
                book={book}
                shelfHeight={shelfHeight - 8}
              />
            ))}

            {/* Metal bookend when few books */}
            {books.length <= 3 && (
              <div className="shrink-0 self-end mb-0.5" aria-hidden>
                <svg width="14" height="60" viewBox="0 0 14 60">
                  <defs>
                    <linearGradient
                      id="bookendGrad"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#5D4037" />
                      <stop offset="50%" stopColor="#795548" />
                      <stop offset="100%" stopColor="#4E342E" />
                    </linearGradient>
                  </defs>
                  {/* L-shaped bookend */}
                  <rect
                    x="0"
                    y="0"
                    width="4"
                    height="60"
                    rx="1"
                    fill="url(#bookendGrad)"
                  />
                  <rect
                    x="0"
                    y="52"
                    width="14"
                    height="8"
                    rx="1"
                    fill="url(#bookendGrad)"
                  />
                  {/* Highlight */}
                  <line
                    x1="2"
                    y1="2"
                    x2="2"
                    y2="58"
                    stroke="rgba(255,255,255,.08)"
                    strokeWidth=".5"
                  />
                </svg>
              </div>
            )}
          </>
        )}
      </div>

      {/* Shelf plank */}
      <ShelfPlankSVG />
    </div>
  );
}

/* ================================================================
   Pagination controls
   ================================================================ */

function ShelfPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-6">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 5) pageNum = i + 1;
          else if (currentPage <= 3) pageNum = i + 1;
          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
          else pageNum = currentPage - 2 + i;

          return (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className="min-w-9"
            >
              {pageNum}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

/* ================================================================
   Empty shelf decorations (when no books) — enhanced
   ================================================================ */

function EmptyShelfDecor() {
  return (
    <div className="flex items-end justify-center gap-6 opacity-35" aria-hidden>
      {/* Ornate bookend */}
      <svg width="22" height="50" viewBox="0 0 22 50">
        <path d="M2 50V8Q2 2 8 2H20V50Z" fill="#4E342E" opacity=".6" />
        <path d="M4 50V10Q4 5 9 5H18V50Z" fill="#3E2723" opacity=".5" />
        {/* Decorative scroll */}
        <path
          d="M8 15Q12 12 14 16Q16 20 12 22"
          fill="none"
          stroke="rgba(255,215,0,.15)"
          strokeWidth=".8"
        />
      </svg>

      {/* Small plant in pot */}
      <svg width="32" height="50" viewBox="0 0 32 50">
        <ellipse cx="16" cy="46" rx="11" ry="4" fill="#5D4037" />
        <path d="M8 30L7 46H25L24 30Z" fill="#8D6E63" />
        <path d="M9 30L8 46H24L23 30Z" fill="#795548" />
        {/* Soil */}
        <ellipse cx="16" cy="30" rx="8" ry="2.5" fill="#4E342E" />
        {/* Stems and leaves */}
        <path
          d="M16 30Q14 20 10 14"
          stroke="#388E3C"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M16 30Q16 18 16 10"
          stroke="#43A047"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M16 30Q18 20 22 14"
          stroke="#388E3C"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Leaf shapes */}
        <ellipse
          cx="10"
          cy="14"
          rx="4"
          ry="2"
          fill="#66BB6A"
          transform="rotate(-30 10 14)"
        />
        <ellipse cx="16" cy="10" rx="3.5" ry="2" fill="#4CAF50" />
        <ellipse
          cx="22"
          cy="14"
          rx="4"
          ry="2"
          fill="#66BB6A"
          transform="rotate(30 22 14)"
        />
        <ellipse
          cx="13"
          cy="20"
          rx="3"
          ry="1.5"
          fill="#81C784"
          transform="rotate(-15 13 20)"
        />
        <ellipse
          cx="19"
          cy="20"
          rx="3"
          ry="1.5"
          fill="#81C784"
          transform="rotate(15 19 20)"
        />
      </svg>

      {/* Desk globe */}
      <svg width="30" height="50" viewBox="0 0 30 50">
        {/* Stand */}
        <rect x="13" y="33" width="4" height="10" rx="1" fill="#8D6E63" />
        <rect x="9" y="43" width="12" height="4" rx="1.5" fill="#6D4C41" />
        {/* Arc frame */}
        <path
          d="M6 20A9 18 0 0 1 24 20"
          fill="none"
          stroke="#5D4037"
          strokeWidth="1.5"
        />
        {/* Globe */}
        <circle cx="15" cy="18" r="12" fill="#1565C0" opacity=".45" />
        <circle
          cx="15"
          cy="18"
          r="12"
          fill="none"
          stroke="#5D4037"
          strokeWidth="1.2"
        />
        {/* Continents */}
        <path
          d="M8 12Q12 8 15 10Q18 12 20 10Q22 8 24 12"
          fill="#2E7D32"
          opacity=".5"
          strokeWidth="1"
        />
        <path
          d="M6 20Q10 18 14 20Q18 22 22 20Q24 18 26 20"
          fill="#2E7D32"
          opacity=".4"
        />
        {/* Grid lines */}
        <ellipse
          cx="15"
          cy="18"
          rx="6"
          ry="12"
          fill="none"
          stroke="rgba(255,255,255,.08)"
          strokeWidth=".5"
        />
        <line
          x1="3"
          y1="18"
          x2="27"
          y2="18"
          stroke="rgba(255,255,255,.06)"
          strokeWidth=".4"
        />
      </svg>

      {/* Another bookend */}
      <svg width="22" height="50" viewBox="0 0 22 50">
        <path d="M20 50V8Q20 2 14 2H2V50Z" fill="#4E342E" opacity=".6" />
        <path d="M18 50V10Q18 5 13 5H4V50Z" fill="#3E2723" opacity=".5" />
        <path
          d="M14 15Q10 12 8 16Q6 20 10 22"
          fill="none"
          stroke="rgba(255,215,0,.15)"
          strokeWidth=".8"
        />
      </svg>
    </div>
  );
}

/* ================================================================
   Main export – BookShelfView
   ================================================================ */

export function BookShelfView({ books }: BookShelfViewProps) {
  const { booksPerShelf, shelfCount, booksPerPage } = useShelfLayout();
  const [currentPage, setCurrentPage] = useState(1);
  const directionRef = useRef<'left' | 'right'>('right');
  const [animKey, setAnimKey] = useState(0);

  const totalPages = Math.max(1, Math.ceil(books.length / booksPerPage));
  const start = (currentPage - 1) * booksPerPage;
  const currentBooks = books.slice(start, start + booksPerPage);

  // Split into rows
  const shelves = useMemo(() => {
    const rows: ShelfBook[][] = [];
    for (let i = 0; i < shelfCount; i++) {
      rows.push(currentBooks.slice(i * booksPerShelf, (i + 1) * booksPerShelf));
    }
    while (rows.length < shelfCount) rows.push([]);
    return rows;
  }, [currentBooks, booksPerShelf, shelfCount]);

  // Page change handler
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return;
      directionRef.current = page > currentPage ? 'left' : 'right';
      setCurrentPage(page);
      setAnimKey((k) => k + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [currentPage, totalPages],
  );

  // Guard against out-of-bounds page after layout change
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(books.length / booksPerPage));
    if (currentPage > maxPage) setCurrentPage(1);
  }, [booksPerPage, books.length, currentPage]);

  const SHELF_H = 200;

  return (
    <div className="space-y-6">
      <BookshelfFrame>
        {shelves.map((row, idx) => (
          <ShelfRow
            key={idx}
            books={row}
            shelfHeight={SHELF_H}
            animKey={animKey}
            direction={directionRef.current}
          />
        ))}
      </BookshelfFrame>

      <ShelfPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
