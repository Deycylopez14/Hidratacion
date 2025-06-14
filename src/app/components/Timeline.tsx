import React from "react";

interface TimelineProps {
  timeline: { time: string; amount: number }[];
}

export default function Timeline({ timeline }: TimelineProps) {
  return (
    <div className="flex items-center gap-4 overflow-x-auto py-2 mb-4">
      {timeline.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <span className="text-aqua text-2xl">💧</span>
          <span className="text-xs text-darkblue">{item.time}</span>
          <span className="text-xs text-darkblue">{item.amount}ml</span>
        </div>
      ))}
    </div>
  );
}
