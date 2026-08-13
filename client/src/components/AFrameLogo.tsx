interface AFrameLogoProps {
  className?: string;
}

export default function AFrameLogo({ className = 'w-8 h-8' }: AFrameLogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Chalé A-frame"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 40L24 7L42 40" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 39V30L24 19L35 30V39" stroke="#15803d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 39V31H27V39" stroke="#15803d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 41H39" stroke="#2d5016" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 8V18" stroke="#2d5016" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
