/* ================================================================
   Shelf plank SVG — the wooden shelf surface with bracket supports
   ================================================================ */

export function BookShelfPlank() {
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
