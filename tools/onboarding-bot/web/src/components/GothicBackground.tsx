/** Full-viewport gothic background: night sky + blood moon + clocktower silhouette + crows.
 *  Rendered as fixed-position SVG behind all content. Zero external assets. */
export function GothicBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Sky gradient + blood moon + atmosphere */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1920 1080"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky radial: deep red near moon, black at edges */}
          <radialGradient id="sky" cx="70%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#3a0a0a" stopOpacity="1" />
            <stop offset="45%" stopColor="#180505" stopOpacity="1" />
            <stop offset="100%" stopColor="#050101" stopOpacity="1" />
          </radialGradient>
          {/* Blood moon: bright red core with crater shading */}
          <radialGradient id="moon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb0a0" />
            <stop offset="25%" stopColor="#d13a2a" />
            <stop offset="65%" stopColor="#7a1410" />
            <stop offset="100%" stopColor="#3a0606" />
          </radialGradient>
          {/* Moon outer glow */}
          <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c23024" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#4a0707" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          {/* Ground mist */}
          <linearGradient id="mist" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#0c0202" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#1a0707" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1a0707" stopOpacity="0" />
          </linearGradient>
          {/* Tower silhouette gradient */}
          <linearGradient id="tower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0202" />
            <stop offset="100%" stopColor="#050000" />
          </linearGradient>
        </defs>

        {/* Sky backdrop */}
        <rect width="1920" height="1080" fill="url(#sky)" />

        {/* Moon glow (wider) */}
        <circle cx="1360" cy="260" r="420" fill="url(#moon-glow)" />
        {/* Blood moon */}
        <circle cx="1360" cy="260" r="180" fill="url(#moon)" />
        {/* Moon craters */}
        <ellipse cx="1330" cy="240" rx="20" ry="14" fill="#5a0a0a" opacity="0.55" />
        <ellipse cx="1410" cy="300" rx="26" ry="18" fill="#5a0a0a" opacity="0.5" />
        <ellipse cx="1385" cy="210" rx="12" ry="9" fill="#5a0a0a" opacity="0.6" />

        {/* Distant mountains / horizon */}
        <path
          d="M0 820 L180 760 L320 790 L480 730 L640 780 L820 740 L960 790 L1120 760 L1280 800 L1460 770 L1620 790 L1780 760 L1920 790 L1920 1080 L0 1080 Z"
          fill="#0a0303"
          opacity="0.8"
        />

        {/* Gothic clocktower silhouette (center-left) */}
        {/* Spires */}
        <path d="M590 150 L620 20 L650 150 Z" fill="url(#tower)" />
        <path d="M540 200 L555 120 L570 200 Z" fill="url(#tower)" />
        <path d="M670 200 L685 120 L700 200 Z" fill="url(#tower)" />

        {/* Main body */}
        <rect x="540" y="200" width="160" height="620" fill="url(#tower)" />

        {/* Side turrets (narrower) */}
        <rect x="500" y="300" width="40" height="520" fill="url(#tower)" />
        <rect x="700" y="300" width="40" height="520" fill="url(#tower)" />
        <path d="M500 300 L520 260 L540 300 Z" fill="url(#tower)" />
        <path d="M700 300 L720 260 L740 300 Z" fill="url(#tower)" />

        {/* Arched windows (faint red glow) */}
        <g opacity="0.7">
          <path
            d="M600 340 L600 380 Q600 360 620 360 Q640 360 640 380 L640 340 Z"
            fill="#5a0a0a"
          />
          <path
            d="M600 440 L600 480 Q600 460 620 460 Q640 460 640 480 L640 440 Z"
            fill="#5a0a0a"
          />
          <path
            d="M600 540 L600 580 Q600 560 620 560 Q640 560 640 580 L640 540 Z"
            fill="#5a0a0a"
          />
        </g>

        {/* Clock face */}
        <circle cx="620" cy="270" r="26" fill="#3a1a0e" stroke="#6a3010" strokeWidth="1.2" />
        <line x1="620" y1="270" x2="620" y2="252" stroke="#2a0a0a" strokeWidth="1.6" />
        <line x1="620" y1="270" x2="636" y2="270" stroke="#2a0a0a" strokeWidth="1.3" />
        <circle cx="620" cy="270" r="2" fill="#1a0505" />

        {/* Foreground mist */}
        <rect y="620" width="1920" height="460" fill="url(#mist)" />

        {/* Crows (silhouettes, stylized "V" with wings) */}
        {/* Crow 1 — mid-sky */}
        <g transform="translate(280,380) rotate(-8)">
          <path d="M0 0 Q-18 -10 -34 -4 Q-18 -2 -4 4 Q0 8 4 4 Q18 -2 34 -4 Q18 -10 0 0 Z" fill="#0a0303" />
        </g>
        {/* Crow 2 — nearer, larger */}
        <g transform="translate(420,460) rotate(6)">
          <path d="M0 0 Q-26 -14 -48 -6 Q-26 -2 -6 6 Q0 10 6 6 Q26 -2 48 -6 Q26 -14 0 0 Z" fill="#050000" />
        </g>
        {/* Crow 3 — small, distant, near moon */}
        <g transform="translate(1170,320) rotate(-12)">
          <path d="M0 0 Q-12 -6 -22 -2 Q-12 0 -2 3 Q0 5 2 3 Q12 0 22 -2 Q12 -6 0 0 Z" fill="#0a0303" />
        </g>
        {/* Crow 4 — right side */}
        <g transform="translate(1560,480) rotate(4)">
          <path d="M0 0 Q-16 -8 -30 -4 Q-16 -2 -4 4 Q0 6 4 4 Q16 -2 30 -4 Q16 -8 0 0 Z" fill="#050000" />
        </g>

        {/* Top-left subtle vignette darkener */}
        <rect width="600" height="600" fill="#000" opacity="0.35" />

        {/* Bottom-right subtle vignette darkener for readability */}
        <rect x="1200" y="700" width="720" height="380" fill="#000" opacity="0.35" />
      </svg>

      {/* Subtle noise/grain overlay for atmosphere */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* Readability scrim so chat stays legible */}
      <div className="absolute inset-0 bg-[#0c0807]/55" />
    </div>
  );
}
