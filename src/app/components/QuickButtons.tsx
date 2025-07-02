import React from "react";

interface QuickButtonsProps {
  onAdd: (ml: number) => void;
}

export default function QuickButtons({ onAdd }: QuickButtonsProps) {
  return (
    <div className="flex gap-2 justify-center mb-4">
      <button onClick={() => onAdd(250)} className="bg-[#0DD76F] hover:bg-[#089F56] text-white px-3 py-1 rounded">+250ml</button>
      <button onClick={() => onAdd(500)} className="bg-[#0DD76F] hover:bg-[#089F56] text-white px-3 py-1 rounded">+500ml</button>
      <button onClick={() => onAdd(1000)} className="bg-[#0DD76F] hover:bg-[#089F56] text-white px-3 py-1 rounded">+1L</button>
      <button onClick={() => {
        const ml = parseInt(prompt('¿Cuántos ml quieres agregar?') || '0', 10);
        if (ml > 0) onAdd(ml);
      }} className="bg-[var(--color-background)] text-primary px-3 py-1 rounded">Personalizado</button>
    </div>
  );
}
