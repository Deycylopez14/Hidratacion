import React from "react";

interface VerticalScrollerProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
}

export default function VerticalScroller({ min, max, step = 1, value, onChange }: VerticalScrollerProps) {
  const options: number[] = [];
  for (let i = min; i <= max; i += step) {
    options.push(i);
  }

  const scrollRef = React.useRef<HTMLDivElement>(null);
  // Drag state
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const scrollLeft = React.useRef(0);

  // Eventos para drag horizontal
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
    <div className="flex flex-col items-center justify-center w-full select-none">
      <div className="flex flex-row items-center w-full justify-center">
        <div
          ref={scrollRef}
          className="flex flex-row gap-1 overflow-x-auto py-1 px-0.5 h-10 w-full max-w-[120px] items-center scrollbar-hide cursor-grab active:cursor-grabbing bg-white rounded-lg shadow border border-yellow-100"
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
              className={`min-w-[32px] h-7 rounded-lg font-bold text-sm border-2 transition-all duration-200 shadow-sm flex items-center justify-center
                ${value === opt ? 'bg-yellow-400 text-white border-yellow-500 scale-105 z-10' : 'bg-white text-darkblue border-yellow-200 hover:bg-yellow-100'}`}
              onClick={() => onChange(opt)}
              type="button"
              style={{ pointerEvents: isDragging.current ? 'none' : 'auto' }}
            >
              {opt}
            </button>
          ))}
        </div>
        <span className="ml-1 text-aqua font-semibold text-sm select-none">min</span>
      </div>
    </div>
  );
}
