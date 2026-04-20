type Props = {
  size?: number;
  className?: string;
};

export function ClockLogo({ size = 40, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Clocktower"
    >
      <defs>
        <radialGradient id="cl-face" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#f4e7c8" />
          <stop offset="70%" stopColor="#c9b58a" />
          <stop offset="100%" stopColor="#6a4a2a" />
        </radialGradient>
        <linearGradient id="cl-blood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b71b24" />
          <stop offset="100%" stopColor="#5e0a10" />
        </linearGradient>
      </defs>

      {/* Gothic spires */}
      <path
        d="M14 22 L20 4 L26 22 Z"
        fill="#1a1411"
        stroke="#8b0000"
        strokeWidth="0.6"
      />
      <path
        d="M38 22 L44 4 L50 22 Z"
        fill="#1a1411"
        stroke="#8b0000"
        strokeWidth="0.6"
      />
      <path
        d="M23 16 L32 2 L41 16 Z"
        fill="#221712"
        stroke="#a42d2d"
        strokeWidth="0.8"
      />

      {/* Tower body */}
      <rect x="14" y="22" width="36" height="30" fill="#1a1411" stroke="#3a2520" strokeWidth="1" />

      {/* Clock face */}
      <circle cx="32" cy="36" r="11" fill="url(#cl-face)" stroke="#3a2520" strokeWidth="1.2" />

      {/* Tick marks (12 / 3 / 6 / 9) */}
      <line x1="32" y1="27" x2="32" y2="29" stroke="#3a2520" strokeWidth="1" />
      <line x1="41" y1="36" x2="39" y2="36" stroke="#3a2520" strokeWidth="1" />
      <line x1="32" y1="45" x2="32" y2="43" stroke="#3a2520" strokeWidth="1" />
      <line x1="23" y1="36" x2="25" y2="36" stroke="#3a2520" strokeWidth="1" />

      {/* Clock hands pointing to ~12:05 */}
      <line
        x1="32"
        y1="36"
        x2="32"
        y2="30"
        stroke="#2b0e0e"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="32"
        y1="36"
        x2="37"
        y2="36"
        stroke="#2b0e0e"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="32" cy="36" r="1.2" fill="#2b0e0e" />

      {/* Blood drip */}
      <path
        d="M32 47 Q31 51 32 54 Q33 57 32 60 Q31 57 30 55"
        fill="url(#cl-blood)"
      />
      <circle cx="32" cy="60.5" r="1.8" fill="url(#cl-blood)" />

      {/* Base */}
      <rect x="12" y="52" width="40" height="5" fill="#221712" stroke="#3a2520" strokeWidth="0.8" />
    </svg>
  );
}
