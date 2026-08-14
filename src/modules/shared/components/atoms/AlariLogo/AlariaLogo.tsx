interface AlariaLogoProps {
  size?: number;
  color?: string;
  showText?: boolean;
  animated?: boolean;
}

const AlariaLogo = ({ size = 32, color = 'currentColor', showText = false, animated = false }: AlariaLogoProps) => {
  const height = showText ? size * 1.3 : size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={showText ? '0 0 200 200' : '10 5 170 150'}
      width={size}
      height={height}
      fill="none"
    >
      {animated && (
        <style>{`
          .al-leaf-lg { stroke-dasharray: 320; stroke-dashoffset: 320; animation: al-draw 1.5s ease-out 0.2s forwards; }
          .al-leaf-sm { stroke-dasharray: 160; stroke-dashoffset: 160; animation: al-draw 1.2s ease-out 0.6s forwards; }
          .al-dot { opacity: 0; animation: al-fade 0.4s ease-out 1.2s forwards; }
          .al-text { opacity: 0; animation: al-fade 0.6s ease-out 1.5s forwards; }
          @keyframes al-draw { to { stroke-dashoffset: 0; } }
          @keyframes al-fade { to { opacity: 1; } }
        `}</style>
      )}
      {/* Hoja grande - inclinada a la izquierda */}
      <path
        className={animated ? 'al-leaf-lg' : ''}
        d="M92 140 C30 115, 20 50, 60 15 C110 50, 105 115, 92 140Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hoja pequeña - derecha */}
      <path
        className={animated ? 'al-leaf-sm' : ''}
        d="M97 140 C112 125, 132 108, 138 82 C122 98, 102 125, 97 140Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Punto central */}
      <circle
        className={animated ? 'al-dot' : ''}
        cx="94"
        cy="140"
        r="4"
        fill={color}
      />
      {showText && (
        <text
          className={animated ? 'al-text' : ''}
          x="100"
          y="170"
          textAnchor="middle"
          fill={color}
          fontFamily="Inter, sans-serif"
          fontSize="18"
          fontWeight="400"
          letterSpacing="6"
        >
          ALARIA
        </text>
      )}
    </svg>
  );
};

export default AlariaLogo;
