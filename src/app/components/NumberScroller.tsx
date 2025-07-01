import React from "react";

interface NumberScrollerProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

export default function NumberScroller({ min = 100, max = 5000, step = 50, value, onChange }: NumberScrollerProps) {
  const handleScroll = (e: React.WheelEvent<HTMLInputElement>) => {
    e.preventDefault();
    let newValue = value + (e.deltaY < 0 ? step : -step);
    if (newValue > max) newValue = max;
    if (newValue < min) newValue = min;
    onChange(newValue);
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        onWheel={handleScroll}
        className="border-2 border-accent focus:border-primary rounded-xl px-4 py-3 w-36 text-center text-2xl font-bold text-primary bg-[var(--color-white)] shadow transition-all duration-200 outline-none"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      />
      <span className="text-xs text-accent mt-1">Desliza o usa la rueda del mouse</span>
    </div>
  );
}
