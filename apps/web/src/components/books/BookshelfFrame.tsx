import type { ReactNode } from 'react';
import { BookShelfSVGDefs } from './BookShelfSVGDefs';

/* ================================================================
   Bookshelf wooden frame — crown, side panels, base, back panel
   ================================================================ */

export function BookshelfFrame({ children }: { children: ReactNode }) {
  const SIDE = 26;

  return (
    <div className="relative mx-auto max-w-6xl select-none">
      <BookShelfSVGDefs />

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
