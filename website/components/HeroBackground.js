"use client";

export default function HeroBackground({ children }) {
  return (
    <div className="relative w-full overflow-hidden bg-[#f8f6ff]">

      {/* =========================================
          PREMIUM BASE BACKGROUND
      ========================================== */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              circle at 8% 10%,
              rgba(255,255,255,1) 0%,
              rgba(255,255,255,0.85) 18%,
              transparent 42%
            ),
            radial-gradient(
              circle at 88% 20%,
              rgba(216,180,254,0.30) 0%,
              transparent 38%
            ),
            radial-gradient(
              circle at 55% 95%,
              rgba(196,181,253,0.24) 0%,
              transparent 45%
            ),
            linear-gradient(
              135deg,
              #ffffff 0%,
              #faf8ff 35%,
              #f4efff 68%,
              #eee7ff 100%
            )
          `,
        }}
      />

      {/* =========================================
          SOFT LEFT GLOW
      ========================================== */}
      <div
        className="
          absolute
          -left-32
          top-16
          h-[380px]
          w-[380px]
          rounded-full
          bg-purple-300/20
          blur-[100px]
        "
      />

      {/* =========================================
          SOFT RIGHT GLOW
      ========================================== */}
      <div
        className="
          absolute
          -right-24
          top-0
          h-[430px]
          w-[430px]
          rounded-full
          bg-fuchsia-300/15
          blur-[110px]
        "
      />

      {/* =========================================
          SUBTLE TECH GRID
      ========================================== */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(#6d28d9 1px, transparent 1px),
            linear-gradient(90deg, #6d28d9 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "linear-gradient(to bottom, black, transparent 85%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />

      {/* =========================================
          ABSTRACT PREMIUM SHAPES
      ========================================== */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 560"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          {/* Purple Wave */}
          <linearGradient
            id="premiumWave"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#c4b5fd"
              stopOpacity="0.04"
            />

            <stop
              offset="45%"
              stopColor="#a78bfa"
              stopOpacity="0.13"
            />

            <stop
              offset="100%"
              stopColor="#9333ea"
              stopOpacity="0.17"
            />
          </linearGradient>

          {/* Purple / Pink Accent */}
          <linearGradient
            id="accentWave"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop
              offset="0%"
              stopColor="#7c3aed"
              stopOpacity="0"
            />

            <stop
              offset="50%"
              stopColor="#9333ea"
              stopOpacity="0.09"
            />

            <stop
              offset="100%"
              stopColor="#ec4899"
              stopOpacity="0.08"
            />
          </linearGradient>
        </defs>

        {/* Main flowing background shape */}
        <path
          fill="url(#premiumWave)"
          d="
            M1440 80
            C1250 25 1110 90 970 175
            C820 265 680 295 520 255
            C340 210 200 220 0 345
            L0 560
            L1440 560
            Z
          "
        />

        {/* Secondary flowing layer */}
        <path
          fill="url(#accentWave)"
          d="
            M1440 210
            C1260 130 1110 160 930 245
            C730 340 560 340 390 300
            C230 260 110 290 0 390
            L0 560
            L1440 560
            Z
          "
        />

        {/* Fine decorative curve */}
        <path
          d="
            M-50 420
            C280 250 470 390 730 325
            C980 260 1180 150 1500 280
          "
          fill="none"
          stroke="#9333ea"
          strokeOpacity="0.08"
          strokeWidth="1.5"
        />

        {/* Decorative particles */}
        <circle
          cx="120"
          cy="135"
          r="3"
          fill="#9333ea"
          opacity="0.18"
        />

        <circle
          cx="410"
          cy="105"
          r="2.5"
          fill="#ec4899"
          opacity="0.18"
        />

        <circle
          cx="760"
          cy="90"
          r="3"
          fill="#7c3aed"
          opacity="0.13"
        />

        <circle
          cx="1280"
          cy="120"
          r="3"
          fill="#9333ea"
          opacity="0.16"
        />
      </svg>

      {/* =========================================
          SMALL GLOW PARTICLES
      ========================================== */}
      <div
        className="
          absolute
          left-[6%]
          top-[28%]
          h-2
          w-2
          rounded-full
          bg-secondary/30
          shadow-[0_0_20px_rgba(236,72,153,0.5)]
        "
      />

      <div
        className="
          absolute
          right-[12%]
          top-[18%]
          h-2
          w-2
          rounded-full
          bg-primary/30
          shadow-[0_0_20px_rgba(109,40,217,0.5)]
        "
      />

      {/* =========================================
          HERO CONTENT
      ========================================== */}
      <div className="relative z-10 flex min-h-[530px] w-full items-center">
        {children}
      </div>

      {/* =========================================
          CLEAN BOTTOM SEPARATOR
      ========================================== */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-purple-100/50" />
    </div>
  );
}
// 'use client';
// export default function HeroBackground({ children }) {
//   const radialGradientStyle = {
//     backgroundColor: '#f1eafd', 
//     background: 'radial-gradient(circle at 10% 10%, #ffffff 0%, #f1eafd 70%, #e0d0fa 100%)',
//   };

//   return (
//     <div 
//       className="relative w-full" 
//       style={{ minHeight: 530, ...radialGradientStyle }} // Kept dynamic height layout safe
//     >
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         viewBox="0 0 1440 530" 
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         preserveAspectRatio="xMaxYMin slice"
//       >
//         <path
//           fill="#a78bfa"
//           fillOpacity="0.3" 
//           d="M 1440 530 L 1440 180 C 1300 0 1100 100 850 160 C 600 220 300 180 0 300 L 0 530 Z"
//         />
//         <path
//           fill="#9333ea" 
//           fillOpacity="0.3" 
//           d="M 1440 530 L 1440 250 C 1200 50 1000 150 700 200 C 400 250 200 200 0 350 L 0 530 Z"
//         />
//         <path
//           fill="#6d28d9" 
//           fillOpacity="0.5" 
//           d="M0,500L48,490.7C96,480,192,470,288,474.7C384,479,480,490,576,496C672,501,768,501,864,490.7C960,480,1056,469,1152,474.7C1248,480,1344,501,1392,512L1440,523L1440,530L0,530Z"
//         />
//         <circle cx="700" cy="200" r="5" fill="white" />
//         <circle cx="400" cy="214" r="5" fill="#9333ea" opacity="0.5" />
//       </svg>

//       <div className="relative z-10 h-full flex items-center w-full">
//         {children}
//       </div>
//     </div>
//   );
// }