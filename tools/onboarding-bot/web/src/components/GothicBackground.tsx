/** Mobile-portrait-friendly gothic background:
 *  - Blood moon at top-center
 *  - Tall gothic clocktower dominant in center
 *  - Crows scattered around
 *  - Low scrim so tower stays visible while keeping chat legible */
export function GothicBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1080 1920"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="sky" cx="50%" cy="25%" r="85%">
            <stop offset="0%" stopColor="#3a0a0a" />
            <stop offset="40%" stopColor="#180505" />
            <stop offset="100%" stopColor="#050101" />
          </radialGradient>
          <radialGradient id="moon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffc0a8" />
            <stop offset="25%" stopColor="#d13a2a" />
            <stop offset="65%" stopColor="#7a1410" />
            <stop offset="100%" stopColor="#3a0606" />
          </radialGradient>
          <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c23024" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#4a0707" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="tower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#150404" />
            <stop offset="100%" stopColor="#050000" />
          </linearGradient>
          <linearGradient id="tower-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2a0909" />
            <stop offset="50%" stopColor="#0a0202" />
            <stop offset="100%" stopColor="#2a0909" />
          </linearGradient>
          <linearGradient id="mist" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#0c0202" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#1a0707" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1a0707" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="1080" height="1920" fill="url(#sky)" />

        {/* Blood moon — top center, large and glowing */}
        <circle cx="540" cy="280" r="420" fill="url(#moon-glow)" />
        <circle cx="540" cy="280" r="175" fill="url(#moon)" />
        {/* Moon craters */}
        <ellipse cx="510" cy="255" rx="20" ry="13" fill="#5a0a0a" opacity="0.55" />
        <ellipse cx="580" cy="310" rx="26" ry="17" fill="#5a0a0a" opacity="0.5" />
        <ellipse cx="560" cy="225" rx="11" ry="8" fill="#5a0a0a" opacity="0.6" />

        {/* Distant hills */}
        <path
          d="M0 1420
             L100 1380 L200 1400 L300 1360 L400 1395
             L500 1370 L600 1400 L700 1375 L800 1405
             L900 1380 L1000 1395 L1080 1400
             L1080 1920 L0 1920 Z"
          fill="#0a0303"
          opacity="0.85"
        />

        {/* ===== Gothic Clocktower (center, dominant) ===== */}
        {/* Base platform */}
        <rect x="360" y="1700" width="360" height="40" fill="url(#tower)" />
        <rect x="380" y="1680" width="320" height="30" fill="url(#tower)" />

        {/* Main tower body */}
        <rect x="420" y="780" width="240" height="920" fill="url(#tower)" />
        {/* Stone texture lines */}
        <g stroke="#2a0909" strokeWidth="1" opacity="0.5">
          <line x1="420" y1="950" x2="660" y2="950" />
          <line x1="420" y1="1120" x2="660" y2="1120" />
          <line x1="420" y1="1290" x2="660" y2="1290" />
          <line x1="420" y1="1460" x2="660" y2="1460" />
          <line x1="420" y1="1630" x2="660" y2="1630" />
        </g>

        {/* Side pinnacles (thinner, flanking the main body) */}
        <rect x="360" y="1000" width="60" height="720" fill="url(#tower)" />
        <rect x="660" y="1000" width="60" height="720" fill="url(#tower)" />
        <path d="M360 1000 L390 920 L420 1000 Z" fill="url(#tower)" />
        <path d="M660 1000 L690 920 L720 1000 Z" fill="url(#tower)" />

        {/* Flying buttresses (angled supports) */}
        <path d="M280 1720 L380 1400 L380 1720 Z" fill="url(#tower)" opacity="0.9" />
        <path d="M800 1720 L700 1400 L700 1720 Z" fill="url(#tower)" opacity="0.9" />

        {/* Central spire (tall pointed top) */}
        <path
          d="M460 780 L540 400 L620 780 Z"
          fill="url(#tower)"
          stroke="#2a0909"
          strokeWidth="1"
        />
        <path d="M530 400 L540 380 L550 400 Z" fill="#2a0909" />
        {/* Small flanking spires */}
        <path d="M420 800 L450 680 L480 800 Z" fill="url(#tower)" />
        <path d="M600 800 L630 680 L660 800 Z" fill="url(#tower)" />

        {/* Clock face (large, glowing slightly) */}
        <circle cx="540" cy="920" r="72" fill="#2a1208" stroke="#5a2a0e" strokeWidth="3" />
        <circle cx="540" cy="920" r="60" fill="#1a0704" stroke="#3a1a08" strokeWidth="1.5" />
        {/* Clock ticks */}
        <g stroke="#6a3010" strokeWidth="2" strokeLinecap="round">
          <line x1="540" y1="866" x2="540" y2="876" />
          <line x1="594" y1="920" x2="584" y2="920" />
          <line x1="540" y1="974" x2="540" y2="964" />
          <line x1="486" y1="920" x2="496" y2="920" />
        </g>
        {/* Clock hands (pointing ~12:05) */}
        <line x1="540" y1="920" x2="540" y2="876" stroke="#8b2a1a" strokeWidth="3" strokeLinecap="round" />
        <line x1="540" y1="920" x2="570" y2="920" stroke="#8b2a1a" strokeWidth="2" strokeLinecap="round" />
        <circle cx="540" cy="920" r="4" fill="#8b2a1a" />

        {/* Arched windows (glowing faintly red) */}
        <g fill="#4a1010" opacity="0.8">
          <path d="M470 1060 Q470 1030 490 1030 Q510 1030 510 1060 L510 1110 L470 1110 Z" />
          <path d="M570 1060 Q570 1030 590 1030 Q610 1030 610 1060 L610 1110 L570 1110 Z" />
          <path d="M470 1220 Q470 1190 490 1190 Q510 1190 510 1220 L510 1270 L470 1270 Z" />
          <path d="M570 1220 Q570 1190 590 1190 Q610 1190 610 1220 L610 1270 L570 1270 Z" />
          <path d="M470 1380 Q470 1350 490 1350 Q510 1350 510 1380 L510 1430 L470 1430 Z" />
          <path d="M570 1380 Q570 1350 590 1350 Q610 1350 610 1380 L610 1430 L570 1430 Z" />
        </g>

        {/* Central tall arched door */}
        <path
          d="M490 1600 Q490 1530 540 1530 Q590 1530 590 1600 L590 1700 L490 1700 Z"
          fill="#1a0606"
          stroke="#3a1010"
          strokeWidth="2"
        />
        <line x1="540" y1="1540" x2="540" y2="1700" stroke="#3a1010" strokeWidth="1" />

        {/* Outer edge highlight on tower */}
        <rect x="420" y="780" width="240" height="920" fill="url(#tower-edge)" opacity="0.25" />

        {/* Foreground mist */}
        <rect y="1400" width="1080" height="520" fill="url(#mist)" />

        {/* Crows */}
        <g transform="translate(180,520) rotate(-8)" fill="#050000">
          <path d="M0 0 Q-22 -12 -40 -6 Q-22 -2 -4 5 Q0 8 4 5 Q22 -2 40 -6 Q22 -12 0 0 Z" />
        </g>
        <g transform="translate(880,650) rotate(6)" fill="#050000">
          <path d="M0 0 Q-28 -15 -52 -7 Q-28 -2 -6 6 Q0 10 6 6 Q28 -2 52 -7 Q28 -15 0 0 Z" />
        </g>
        <g transform="translate(260,320) rotate(-10)" fill="#0a0303">
          <path d="M0 0 Q-14 -7 -26 -3 Q-14 0 -3 4 Q0 6 3 4 Q14 0 26 -3 Q14 -7 0 0 Z" />
        </g>
        <g transform="translate(820,400) rotate(14)" fill="#0a0303">
          <path d="M0 0 Q-16 -8 -30 -4 Q-16 -2 -4 4 Q0 6 4 4 Q16 -2 30 -4 Q16 -8 0 0 Z" />
        </g>

        {/* Vignette darkening at corners */}
        <rect width="1080" height="1920" fill="url(#vignette)" />
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="50%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
          </radialGradient>
        </defs>
      </svg>

      {/* Noise grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* Readability scrim (lighter than before so tower shows through) */}
      <div className="absolute inset-0 bg-[#0c0807]/35" />
    </div>
  );
}
