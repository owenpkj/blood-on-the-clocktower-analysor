type Props = {
  size?: number;
  className?: string;
};

/** Gothic demon-head SVG, inspired by Blood on the Clocktower's atmosphere
 *  (NOT a copy of the official logo — original artwork to avoid IP issues). */
export function DemonAvatar({ size = 40, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="POTCC"
    >
      <defs>
        <radialGradient id="demon-skull" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#2a0b0b" />
          <stop offset="70%" stopColor="#120505" />
          <stop offset="100%" stopColor="#050101" />
        </radialGradient>
        <radialGradient id="demon-eye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff3b2d" />
          <stop offset="60%" stopColor="#a80000" />
          <stop offset="100%" stopColor="#330000" />
        </radialGradient>
        <filter id="demon-glow">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      {/* Horns (left & right) */}
      <path
        d="M14 20 Q8 10 12 4 Q16 8 18 14 Q20 18 20 22 Z"
        fill="#1a0606"
        stroke="#4b1010"
        strokeWidth="0.5"
      />
      <path
        d="M50 20 Q56 10 52 4 Q48 8 46 14 Q44 18 44 22 Z"
        fill="#1a0606"
        stroke="#4b1010"
        strokeWidth="0.5"
      />

      {/* Skull / face base */}
      <path
        d="M16 28
           Q12 34 14 42
           Q16 50 22 54
           Q28 58 32 58
           Q36 58 42 54
           Q48 50 50 42
           Q52 34 48 28
           Q44 22 32 22
           Q20 22 16 28 Z"
        fill="url(#demon-skull)"
        stroke="#4b1010"
        strokeWidth="0.6"
      />

      {/* Glowing eyes */}
      <g filter="url(#demon-glow)">
        <ellipse cx="25" cy="37" rx="4" ry="2.8" fill="url(#demon-eye)" />
        <ellipse cx="39" cy="37" rx="4" ry="2.8" fill="url(#demon-eye)" />
      </g>
      <ellipse cx="25" cy="37" rx="1.2" ry="0.9" fill="#ffe4a8" opacity="0.85" />
      <ellipse cx="39" cy="37" rx="1.2" ry="0.9" fill="#ffe4a8" opacity="0.85" />

      {/* Nasal hollow */}
      <path d="M31 41 L32 45 L33 41 L32 40 Z" fill="#050000" opacity="0.6" />

      {/* Fanged mouth */}
      <path
        d="M24 48 Q32 55 40 48"
        stroke="#2a0606"
        strokeWidth="0.8"
        fill="none"
      />
      <path d="M26 48 L27 52 L28 48 Z" fill="#ebdcbd" opacity="0.9" />
      <path d="M30 48 L31 53 L32 48 Z" fill="#ebdcbd" opacity="0.9" />
      <path d="M34 48 L35 53 L36 48 Z" fill="#ebdcbd" opacity="0.9" />
      <path d="M38 48 L37 52 L36 48 Z" fill="#ebdcbd" opacity="0.9" />

      {/* Blood drip from left eye */}
      <path
        d="M25 40 Q24.5 43 25 46"
        stroke="#8b0000"
        strokeWidth="0.8"
        fill="none"
        opacity="0.8"
      />
    </svg>
  );
}
