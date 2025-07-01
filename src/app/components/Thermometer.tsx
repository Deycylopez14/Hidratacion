import React from "react";

interface ThermometerProps {
  percent: number;
}

export default function Thermometer({ percent }: ThermometerProps) {
  return (
    <div className="flex flex-col items-center h-40 w-8 mr-4">
      <div className="relative flex-1 w-4 bg-[var(--color-background)] rounded-full overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-full bg-accent rounded-full"
          style={{ height: `${percent}%`, transition: "height 1s" }}
        ></div>
      </div>
      <div className="w-8 h-8 bg-accent rounded-full mt-1 border-2 border-accent"></div>
    </div>
  );
}
