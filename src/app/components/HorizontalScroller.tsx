import React from "react";

interface HorizontalScrollerProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

export default function HorizontalScroller({ min = 500, max = 5000, step = 100, value, onChange }: HorizontalScrollerProps) {
  const options: number[] = [];
  for (let i = min; i <= max; i += step) {
    options.push(i);
  }

  const scrollRef = React.useRef<HTMLDivElement>(null);
  // Drag state
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const scrollLeft = React.useRef(0);

  // Eventos para drag tipo TikTok
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
  };
  const onMouseLeave = () => { isDragging.current = false; };
  const onMouseUp = () => { isDragging.current = false; };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.2; // velocidad
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };
  // Touch events
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startX.current = e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
  };
  const onTouchEnd = () => { isDragging.current = false; };
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    const x = e.touches[0].pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  React.useEffect(() => {
    // Centrar el valor seleccionado al montar o cambiar
    const idx = options.indexOf(value);
    if (scrollRef.current && idx !== -1) {
      const el = scrollRef.current.children[idx] as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [value]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <span className="mb-1 text-aqua font-semibold text-sm select-none">ml</span>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto py-2 px-1 w-full max-w-xl cursor-grab active:cursor-grabbing scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
      >
        {options.map(opt => (
          <button
            key={opt}
            className={`min-w-[70px] h-16 rounded-xl font-bold text-lg border-2 transition-all duration-200 shadow-sm
              ${value === opt ? 'bg-blue-500 text-white border-blue-600 scale-110' : 'bg-white text-darkblue border-aqua hover:bg-blue-100'}`}
            onClick={() => onChange(opt)}
            type="button"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
