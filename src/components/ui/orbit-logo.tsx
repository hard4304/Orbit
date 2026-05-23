interface OrbitLogoProps {
  size?: number;
  className?: string;
}

export function OrbitLogo({ size = 32, className }: OrbitLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Planet body */}
      <circle cx="50" cy="50" r="28" fill="oklch(0.65 0.18 25)" />
      {/* Planet shading */}
      <circle cx="50" cy="50" r="28" fill="url(#planet-gradient)" />
      {/* Orbital ring - behind planet */}
      <ellipse
        cx="50"
        cy="50"
        rx="46"
        ry="14"
        stroke="oklch(0.65 0.18 25)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        transform="rotate(-20 50 50)"
        strokeDasharray="0 52 95"
      />
      {/* Orbital ring - in front of planet */}
      <ellipse
        cx="50"
        cy="50"
        rx="46"
        ry="14"
        stroke="#f9cdb0"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        transform="rotate(-20 50 50)"
        strokeDasharray="95 52 0"
      />
      <defs>
        <radialGradient
          id="planet-gradient"
          cx="0.35"
          cy="0.35"
          r="0.65"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="black" stopOpacity="0.15" />
        </radialGradient>
      </defs>
    </svg>
  );
}
