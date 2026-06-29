'use client';
export default function HeroBackground({ children }) {
  const radialGradientStyle = {
    backgroundColor: '#f1eafd', 
    background: 'radial-gradient(circle at 10% 10%, #ffffff 0%, #f1eafd 70%, #e0d0fa 100%)',
  };

  return (
    <div 
      className="relative w-full" 
      style={{ minHeight: 530, ...radialGradientStyle }} // Kept dynamic height layout safe
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 530" 
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMaxYMin slice"
      >
        <path
          fill="#a78bfa"
          fillOpacity="0.3" 
          d="M 1440 530 L 1440 180 C 1300 0 1100 100 850 160 C 600 220 300 180 0 300 L 0 530 Z"
        />
        <path
          fill="#9333ea" 
          fillOpacity="0.3" 
          d="M 1440 530 L 1440 250 C 1200 50 1000 150 700 200 C 400 250 200 200 0 350 L 0 530 Z"
        />
        <path
          fill="#6d28d9" 
          fillOpacity="0.5" 
          d="M0,500L48,490.7C96,480,192,470,288,474.7C384,479,480,490,576,496C672,501,768,501,864,490.7C960,480,1056,469,1152,474.7C1248,480,1344,501,1392,512L1440,523L1440,530L0,530Z"
        />
        <circle cx="700" cy="200" r="5" fill="white" />
        <circle cx="400" cy="214" r="5" fill="#9333ea" opacity="0.5" />
      </svg>

      <div className="relative z-10 h-full flex items-center w-full">
        {children}
      </div>
    </div>
  );
}