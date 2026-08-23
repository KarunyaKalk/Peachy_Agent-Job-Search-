import React from 'react';

interface Props {
  className?: string;
  isWaving?: boolean;
}

export const PeachyMascotSvg: React.FC<Props> = ({ className = '', isWaving = false }) => {
  return (
    <svg
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full drop-shadow-xl ${className}`}
    >
      <defs>
        {/* Body Gradient */}
        <radialGradient id="peachBodyGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FF9E80" />
          <stop offset="55%" stopColor="#FF7043" />
          <stop offset="100%" stopColor="#E64A19" />
        </radialGradient>

        {/* Leaf Gradient */}
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#66BB6A" />
          <stop offset="100%" stopColor="#2E7D32" />
        </linearGradient>

        {/* Blush Gradient */}
        <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFAB91" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFAB91" stopOpacity="0" />
        </radialGradient>

        {/* Briefcase Leather Gradient */}
        <linearGradient id="leatherGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8D6E63" />
          <stop offset="100%" stopColor="#4E342E" />
        </linearGradient>
      </defs>

      {/* --- STUBBY LEGS --- */}
      <g id="peachy-legs">
        <path d="M 45 110 Q 42 126 38 128 C 36 129 44 130 48 128 Q 50 114 49 110 Z" fill="#D83B01" />
        <path d="M 75 110 Q 78 126 82 128 C 84 129 76 130 72 128 Q 70 114 71 110 Z" fill="#D83B01" />
        <ellipse cx="43" cy="128" rx="7" ry="3" fill="#B02A00" />
        <ellipse cx="77" cy="128" rx="7" ry="3" fill="#B02A00" />
      </g>

      {/* --- MAIN PEACH BODY --- */}
      <g id="peachy-body">
        {/* Peach Cleft Curve */}
        <path
          d="M 60 22 C 30 22 12 45 12 74 C 12 105 38 118 60 118 C 82 118 108 105 108 74 C 108 45 90 22 60 22 Z"
          fill="url(#peachBodyGrad)"
        />
        {/* Subtle Peach Center Indentation Line */}
        <path d="M 60 22 Q 58 40 60 55" stroke="#D83B01" strokeWidth="1.8" strokeLinecap="round" opacity="0.3" />
      </g>

      {/* --- STEM & LEAF --- */}
      <g id="peachy-stem-leaf">
        {/* Stem */}
        <path d="M 60 24 C 60 14 65 10 68 6" stroke="#4E342E" strokeWidth="3.5" strokeLinecap="round" />
        {/* Leaf */}
        <path
          d="M 66 12 C 78 2 92 12 84 22 C 72 26 66 16 66 12 Z"
          fill="url(#leafGrad)"
        />
        <path d="M 68 13 Q 76 16 82 21" stroke="#81C784" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* --- BLUSH CHEEKS --- */}
      <g id="peachy-blush">
        <ellipse cx="32" cy="74" rx="9" ry="5" fill="url(#blushGrad)" />
        <ellipse cx="88" cy="74" rx="9" ry="5" fill="url(#blushGrad)" />
      </g>

      {/* --- EYES & SMILE --- */}
      <g id="peachy-face">
        {/* Left Eye */}
        <circle cx="42" cy="64" r="4.5" fill="#1C2833" />
        <circle cx="40.5" cy="62.5" r="1.5" fill="#FFFFFF" />

        {/* Right Eye */}
        <circle cx="78" cy="64" r="4.5" fill="#1C2833" />
        <circle cx="76.5" cy="62.5" r="1.5" fill="#FFFFFF" />

        {/* Happy Smile */}
        <path d="M 52 74 Q 60 83 68 74" stroke="#1C2833" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>

      {/* --- CUTE ROUND GLASSES --- */}
      <g id="peachy-glasses">
        {/* Left Frame */}
        <circle cx="42" cy="64" r="12" stroke="#263238" strokeWidth="2.5" fill="rgba(255,255,255,0.12)" />
        {/* Right Frame */}
        <circle cx="78" cy="64" r="12" stroke="#263238" strokeWidth="2.5" fill="rgba(255,255,255,0.12)" />
        {/* Center Bridge */}
        <path d="M 54 63 Q 60 60 66 63" stroke="#263238" strokeWidth="2.5" strokeLinecap="round" />
        {/* Lens Reflection Highlight */}
        <path d="M 34 58 Q 40 54 44 56" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <path d="M 70 58 Q 76 54 80 56" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* --- SHORT BLUE NECKTIE --- */}
      <g id="peachy-tie">
        {/* Collar knot */}
        <polygon points="56,86 64,86 62,90 58,90" fill="#1565C0" />
        {/* Tie body */}
        <polygon points="57,90 63,90 66,104 60,110 54,104" fill="#1E88E5" />
        {/* Highlight stripe */}
        <line x1="58" y1="92" x2="63" y2="105" stroke="#64B5F6" strokeWidth="1" opacity="0.6" />
      </g>

      {/* --- LEFT HAND WITH TINY BRIEFCASE --- */}
      <g id="peachy-left-arm-briefcase">
        {/* Arm */}
        <path d="M 22 75 Q 12 85 16 94" stroke="#FF7043" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Hand */}
        <circle cx="16" cy="94" r="3.5" fill="#FF8A65" />

        {/* Briefcase */}
        <rect x="5" y="94" width="22" height="17" rx="3" fill="url(#leatherGrad)" stroke="#3E2723" strokeWidth="1" />
        {/* Handle */}
        <path d="M 12 94 C 12 90 20 90 20 94" stroke="#D7CCC8" strokeWidth="1.8" fill="none" />
        {/* Gold Clasp */}
        <rect x="14" y="99" width="4" height="3" rx="0.5" fill="#FFC107" />
        {/* Stitched Trim Line */}
        <line x1="7" y1="102" x2="25" y2="102" stroke="#4E342E" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
      </g>

      {/* --- WAVING RIGHT ARM --- */}
      <g id="peachy-waving-arm" className={isWaving ? 'peachy-wave' : ''}>
        {/* Arm */}
        <path d="M 98 75 Q 110 70 114 58" stroke="#FF7043" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Hand */}
        <circle cx="114" cy="58" r="4" fill="#FF8A65" />
        {/* Fingers wave */}
        <path d="M 112 55 Q 116 52 118 56" stroke="#FF8A65" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
};
