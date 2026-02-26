/* ================================================================
   SVG Shared Definitions — rich wood grain, textures, and lighting
   Rendered as a hidden 0×0 SVG so that all pattern/gradient IDs
   are available globally within the same SVG root.
   ================================================================ */

export function BookShelfSVGDefs() {
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
