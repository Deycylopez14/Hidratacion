import React, { useRef, useEffect } from "react";

interface ProgressCircleWaveProps {
  percent: number; // 0-100
  size?: number;
}

// Ola SVG animada dentro de un círculo
const ProgressCircleWave: React.FC<ProgressCircleWaveProps> = ({ percent, size = 180 }) => {
  const waveRef = useRef<SVGPathElement>(null);
  const waveHeight = 10; // altura de la ola
  const waveLength = size / 1.2;
  const waveSpeed = 2; // segundos

  // Altura del agua según el porcentaje
  const waterLevel = size - (percent / 100) * size;

  useEffect(() => {
    let frame = 0;
    let animId: number;
    const animate = () => {
      frame += 1;
      const points = [];
      for (let x = 0; x <= size; x += 1) {
        const y =
          Math.sin((x / waveLength) * 2 * Math.PI + (frame / 60) * waveSpeed) *
            waveHeight +
          waterLevel;
        points.push(`${x},${y}`);
      }
      const d = `M0,${size} L0,${points[0].split(",")[1]} ` +
        points.map((p) => `L${p}`).join(" ") +
        ` L${size},${size} Z`;
      if (waveRef.current) {
        waveRef.current.setAttribute("d", d);
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [percent, size, waveHeight, waveLength, waveSpeed, waterLevel]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <clipPath id="circle-clip">
          <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} />
        </clipPath>
      </defs>
      {/* Fondo */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 4}
        fill="#e0f7fa"
        stroke="#50C7EC"
        strokeWidth={4}
      />
      {/* Ola animada */}
      <g clipPath="url(#circle-clip)">
        <path
          ref={waveRef}
          fill="#50C7EC"
          opacity={0.85}
        />
      </g>
      {/* Borde superior */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 4}
        fill="none"
        stroke="#00D4D8"
        strokeWidth={4}
      />
      {/* Porcentaje */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size / 5}
        fontWeight="bold"
        fill="#0077b6"
        style={{ filter: "drop-shadow(0 1px 2px #fff)" }}
      >
        {percent}%
      </text>
    </svg>
  );
};

export default ProgressCircleWave;
