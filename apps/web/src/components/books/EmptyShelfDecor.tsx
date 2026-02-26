/* ================================================================
   Empty shelf decoration — shown when a shelf row has no books
   ================================================================ */

export function EmptyShelfDecor() {
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
