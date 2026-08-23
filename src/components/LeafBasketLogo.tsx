import React from "react";

interface LeafBasketLogoProps {
  variant?: "full" | "icon" | "horizontal" | "compact";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTagline?: boolean;
}

export const LeafBasketLogo: React.FC<LeafBasketLogoProps> = ({
  variant = "horizontal",
  size = "md",
  className = "",
  showTagline = true,
}) => {
  // SVG Icon Vector representing the exact uploaded logo
  const EmblemSVG: React.FC<{ iconSizeClass?: string }> = ({ iconSizeClass = "w-10 h-10" }) => (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconSizeClass} shrink-0 drop-shadow-sm transition-transform duration-300 group-hover:scale-105`}
    >
      <defs>
        <linearGradient id="basketGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="50%" stopColor="#166534" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
        <linearGradient id="basketGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#84cc16" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="tomatoGrad" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="60%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id="carrotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="pepperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="broccoliGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="kaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
      </defs>

      {/* Background ambient glow sparkle dots */}
      <circle cx="50" cy="50" r="1.5" fill="#fde047" opacity="0.7" />
      <circle cx="155" cy="55" r="2" fill="#fde047" opacity="0.8" />
      <circle cx="160" cy="90" r="1.5" fill="#fde047" opacity="0.6" />
      <circle cx="40" cy="85" r="1.5" fill="#fde047" opacity="0.7" />
      <circle cx="100" cy="18" r="1.5" fill="#fde047" opacity="0.8" />

      {/* 1. Kale / Spinach Leaves (Left) */}
      <g>
        <path
          d="M 52 68 C 45 60, 42 45, 52 32 C 60 22, 70 30, 75 42 C 78 50, 75 62, 70 70 Z"
          fill="url(#kaleGrad)"
        />
        <path
          d="M 45 48 C 38 42, 40 32, 48 30 C 53 30, 56 36, 52 44 Z"
          fill="#166534"
        />
        <path
          d="M 52 68 Q 60 50 62 38"
          stroke="#86efac"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 56 55 Q 50 50 46 48"
          stroke="#86efac"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M 59 48 Q 68 45 72 44"
          stroke="#86efac"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>

      {/* 2. Carrot & carrot greens */}
      <g>
        {/* Carrot green fronds */}
        <path
          d="M 75 35 C 70 20, 80 15, 82 25"
          stroke="#22c55e"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 75 35 C 78 18, 88 20, 85 30"
          stroke="#16a34a"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Carrot body */}
        <path
          d="M 72 38 C 76 36, 86 36, 90 38 C 90 48, 85 75, 80 82 C 77 75, 72 48, 72 38 Z"
          fill="url(#carrotGrad)"
        />
        {/* Carrot horizontal texture lines */}
        <path d="M 75 46 Q 80 48 85 46" stroke="#c2410c" strokeWidth="1" strokeLinecap="round" />
        <path d="M 76 56 Q 80 58 83 56" stroke="#c2410c" strokeWidth="1" strokeLinecap="round" />
        <path d="M 77 66 Q 80 67 82 66" stroke="#c2410c" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* 3. Top Floating Leaves & Sprouts (Center Top) */}
      <g>
        <path
          d="M 100 28 C 105 16, 118 18, 122 26 C 118 36, 105 34, 100 28 Z"
          fill="#4ade80"
        />
        <path
          d="M 98 32 C 102 24, 108 24, 105 35 Z"
          fill="#22c55e"
        />
        <path
          d="M 104 22 C 110 14, 114 18, 110 24 Z"
          fill="#ef4444"
        />
      </g>

      {/* 4. Broccoli Florets (Right) */}
      <g>
        <circle cx="145" cy="40" r="10" fill="url(#broccoliGrad)" />
        <circle cx="156" cy="48" r="9" fill="url(#broccoliGrad)" />
        <circle cx="138" cy="48" r="8.5" fill="#15803d" />
        <circle cx="148" cy="54" r="8" fill="#166534" />
        <path
          d="M 144 55 L 140 70 L 148 70 Z"
          fill="#22c55e"
        />
        {/* Broccoli highlights */}
        <circle cx="144" cy="38" r="2" fill="#86efac" opacity="0.6" />
        <circle cx="154" cy="46" r="1.5" fill="#86efac" opacity="0.6" />
      </g>

      {/* 5. Green Bell Pepper / Capsicum */}
      <g>
        {/* Pepper stem */}
        <path
          d="M 125 45 C 127 38, 131 40, 130 46"
          stroke="#15803d"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Pepper lobes */}
        <path
          d="M 115 48 C 112 48, 110 56, 112 66 C 115 74, 122 75, 126 73 C 129 75, 137 74, 140 66 C 142 56, 138 48, 132 48 C 128 48, 126 52, 124 52 C 122 52, 119 48, 115 48 Z"
          fill="url(#pepperGrad)"
        />
        {/* Highlight sheen */}
        <path
          d="M 115 54 C 114 58, 115 64, 118 66"
          stroke="#bbf7d0"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>

      {/* 6. Red Ripe Tomato (Center front) */}
      <g>
        {/* Tomato body */}
        <ellipse cx="102" cy="62" rx="15" ry="14" fill="url(#tomatoGrad)" />
        {/* Tomato specular highlight */}
        <ellipse cx="98" cy="56" rx="4" ry="2.5" fill="#fca5a5" opacity="0.75" transform="rotate(-20 98 56)" />
        {/* Tomato star calyx / stem */}
        <path
          d="M 102 50 L 102 44 M 102 48 L 97 46 M 102 48 L 107 46 M 102 49 L 99 52 M 102 49 L 105 52"
          stroke="#16a34a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* 7. The Iconic Swirling Leaf Basket Base */}
      {/* Back inner bowl shadow */}
      <ellipse cx="100" cy="74" rx="42" ry="8" fill="#14532d" opacity="0.6" />

      {/* Main swooping leaf basket arms */}
      <g>
        {/* Left outer swooping leaf */}
        <path
          d="M 35 62 C 55 58, 80 85, 96 102 C 92 88, 70 70, 48 68 C 42 67, 36 65, 35 62 Z"
          fill="url(#basketGradLight)"
        />

        {/* Small bottom-left accent leaf */}
        <path
          d="M 46 82 C 40 85, 42 98, 54 98 C 62 98, 65 90, 58 84 C 52 80, 48 80, 46 82 Z"
          fill="#22c55e"
        />

        {/* Right outer swooping leaf */}
        <path
          d="M 165 62 C 145 58, 120 85, 104 102 C 108 88, 130 70, 152 68 C 158 67, 164 65, 165 62 Z"
          fill="url(#basketGradLight)"
        />

        {/* Small bottom-right accent leaf */}
        <path
          d="M 154 82 C 160 85, 158 98, 146 98 C 138 98, 135 90, 142 84 C 148 80, 152 80, 154 82 Z"
          fill="#22c55e"
        />

        {/* Outer green basket cradle ribbon */}
        <path
          d="M 36 62 C 55 60, 75 90, 98 108 C 102 108, 125 90, 164 62 C 148 76, 128 105, 106 112 C 96 115, 80 110, 58 94 C 44 82, 38 70, 36 62 Z"
          fill="url(#basketGradDark)"
        />

        {/* Inner bright leaf contour curve */}
        <path
          d="M 52 69 C 70 78, 88 100, 100 106 C 112 100, 130 78, 148 69 C 132 84, 116 103, 100 104 C 84 103, 68 84, 52 69 Z"
          fill="url(#basketGradLight)"
        />

        {/* Basket base rounded curl */}
        <path
          d="M 88 106 C 96 112, 104 112, 112 106 C 108 114, 92 114, 88 106 Z"
          fill="#14532d"
        />
      </g>

      {/* Subtle basket shadow below */}
      <ellipse cx="100" cy="116" rx="30" ry="3.5" fill="#14532d" opacity="0.25" />
    </svg>
  );

  // Size styling maps
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  const titleSizes = {
    sm: "text-base tracking-tight",
    md: "text-xl tracking-tight",
    lg: "text-2xl sm:text-3xl tracking-tight",
    xl: "text-3xl sm:text-4xl tracking-tighter",
  };

  const taglineSizes = {
    sm: "text-[8px] tracking-widest",
    md: "text-[10px] tracking-wider",
    lg: "text-xs tracking-widest",
    xl: "text-sm tracking-widest",
  };

  // 1. Icon Only variant
  if (variant === "icon") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <EmblemSVG iconSizeClass={iconSizes[size]} />
      </div>
    );
  }

  // 2. Full Stacked / Centered variant (as in the uploaded branding banner)
  if (variant === "full") {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        <EmblemSVG iconSizeClass={iconSizes[size] || "w-24 h-24"} />
        <div className="mt-1">
          <h1
            className={`font-extrabold text-emerald-950 font-['Outfit'] uppercase ${titleSizes[size]} leading-none`}
            style={{ letterSpacing: "0.02em" }}
          >
            LEAF BASKET
          </h1>
          {showTagline && (
            <p
              className={`font-extrabold text-emerald-700 font-['Outfit'] uppercase ${taglineSizes[size]} mt-1 font-semibold`}
              style={{ letterSpacing: "0.15em" }}
            >
              FRESH. LOCAL. DELIVERED.
            </p>
          )}
        </div>
      </div>
    );
  }

  // 3. Compact Horizontal variant (Default for Navbar & headers)
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      <div className="shrink-0">
        <EmblemSVG iconSizeClass={iconSizes[size]} />
      </div>
      <div className="flex flex-col justify-center text-left">
        <div className="flex items-center">
          <span
            className={`font-black text-emerald-950 font-['Outfit'] uppercase leading-none ${titleSizes[size]}`}
            style={{ letterSpacing: "0.02em" }}
          >
            LEAF <span className="text-emerald-700">BASKET</span>
          </span>
        </div>
        {showTagline && (
          <span
            className={`font-black text-emerald-800 uppercase ${taglineSizes[size]} mt-0.5 leading-none`}
            style={{ letterSpacing: "0.14em" }}
          >
            FRESH. LOCAL. DELIVERED.
          </span>
        )}
      </div>
    </div>
  );
};
