import React from "react";

interface MotivationalMessageProps {
  percent: number;
}

const messages = [
  { limit: 0, text: "¡Comienza tu día hidratándote!" },
  { limit: 25, text: "¡Buen inicio! Sigue así." },
  { limit: 50, text: "¡Vas a la mitad, no te detengas!" },
  { limit: 75, text: "¡Casi logras tu meta!" },
  { limit: 100, text: "¡Meta alcanzada, felicidades!" },
];

export default function MotivationalMessage({ percent }: MotivationalMessageProps) {
  const message = messages.reduce((acc, curr) => (percent >= curr.limit ? curr.text : acc), messages[0].text);
  return <div className="text-center text-lg font-semibold text-aqua bg-lightblue rounded p-2 mb-4">{message}</div>;
}
