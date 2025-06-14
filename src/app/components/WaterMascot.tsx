"use client";
import { useEffect, useState } from "react";

const PHRASES = [
  "¡Hidrátate y sonríe!",
  "¡Sigue así, vas genial!",
  "¡Cada sorbo cuenta!",
  "¡Tu cuerpo te lo agradecerá!",
  "¡Vamos, un poco más!",
  "¡Eres una máquina de agua!",
  "¡La constancia es la clave!",
  "¡Recuerda tomar agua!",
  "¡Salud para ti! 💧",
  "¡Tu meta está cerca!"
];

export default function WaterMascot({ name = "Dey", percent = 0 }: { name?: string, percent?: number }) {
  const [wave, setWave] = useState(false);
  const [blink, setBlink] = useState(false);
  const [jump, setJump] = useState(false);
  const [phrase, setPhrase] = useState(PHRASES[0]);

  // Animación de saludo (mano)
  useEffect(() => {
    const interval = setInterval(() => setWave(w => !w), 2000);
    return () => clearInterval(interval);
  }, []);

  // Animación de parpadeo (ojos)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3500);
    return () => clearInterval(blinkInterval);
  }, []);

  // Animación de salto ocasional o por progreso alto
  useEffect(() => {
    if (percent >= 100) {
      setJump(true);
      const timeout = setTimeout(() => setJump(false), 1200);
      return () => clearTimeout(timeout);
    } else if (percent >= 70) {
      setJump(true);
      const timeout = setTimeout(() => setJump(false), 700);
      return () => clearTimeout(timeout);
    } else {
      setJump(false);
    }
  }, [percent]);

  // Cambiar frase motivacional según progreso
  useEffect(() => {
    if (percent >= 100) setPhrase("¡Meta cumplida! ¡Eres increíble! 🎉");
    else if (percent >= 80) setPhrase("¡Ya casi llegas, sigue así!");
    else if (percent >= 50) setPhrase("¡Vas muy bien, no te detengas!");
    else if (percent > 0) setPhrase("¡Buen inicio, sigue tomando agua!");
    else setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
  }, [percent]);

  // Cambiar frase motivacional cada 7 segundos solo si no hay progreso
  useEffect(() => {
    if (percent > 0 && percent < 50) {
      const phraseInterval = setInterval(() => {
        setPhrase(prev => {
          const idx = PHRASES.indexOf(prev);
          const next = (idx + 1 + Math.floor(Math.random() * (PHRASES.length - 1))) % PHRASES.length;
          return PHRASES[next];
        });
      }, 7000);
      return () => clearInterval(phraseInterval);
    }
  }, [percent]);

  // Expresión de la gota según progreso
  let smilePath = "M36 67 Q40 71 44 67";
  if (percent >= 100) smilePath = "M36 67 Q40 80 44 67"; // sonrisa grande
  else if (percent >= 70) smilePath = "M36 67 Q40 75 44 67"; // sonrisa amplia
  else if (percent < 20 && percent > 0) smilePath = "M36 70 Q40 67 44 70"; // carita de ánimo

  return (
    <div className={`bg-lightblue rounded-lg p-4 flex flex-col items-center shadow select-none transition-transform duration-500 ${jump ? 'animate-bounce' : ''}`} style={{ minHeight: 140 }}>
      {/* Nueva gota de agua kawaii */}
      <svg width="90" height="120" viewBox="0 0 90 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g>
          {/* Cuerpo gota */}
          <path d="M45 10 C65 50, 90 75, 45 115 C0 75, 25 50, 45 10 Z" fill="#3b82f6" stroke="#2563eb" strokeWidth="3" style={{ filter: 'drop-shadow(0 2px 10px #60a5fa)' }} />
          {/* Brillo principal */}
          <ellipse cx="35" cy="40" rx="8" ry="16" fill="#fff" fillOpacity="0.25" />
          {/* Mejillas */}
          <ellipse cx="32" cy="75" rx="4" ry="2.2" fill="#fbbf24" fillOpacity="0.7" />
          <ellipse cx="58" cy="75" rx="4" ry="2.2" fill="#fbbf24" fillOpacity="0.7" />
          {/* Carita */}
          <ellipse cx="45" cy="75" rx="18" ry="13" fill="#fff" fillOpacity="0.95" />
          {/* Ojos grandes (con parpadeo) */}
          {blink ? (
            <rect x="32" y="73" width="26" height="4" rx="2" fill="#2563eb" />
          ) : (
            <>
              <ellipse cx="38" cy="77" rx="4.2" ry="5.2" fill="#2563eb" />
              <ellipse cx="52" cy="77" rx="4.2" ry="5.2" fill="#2563eb" />
              {/* Brillo en los ojos */}
              <ellipse cx="36.5" cy="75.5" rx="1.1" ry="1.5" fill="#fff" fillOpacity="0.8" />
              <ellipse cx="50.5" cy="75.5" rx="1.1" ry="1.5" fill="#fff" fillOpacity="0.8" />
            </>
          )}
          {/* Sonrisa animada según progreso */}
          <path d={smilePath} stroke="#2563eb" strokeWidth="2.2" fill="none" />
          {/* Manito saludando */}
          <g style={{ transformOrigin: '70px 95px', transform: wave ? 'rotate(-25deg)' : 'rotate(0deg)', transition: 'transform 0.5s' }}>
            <ellipse cx="70" cy="95" rx="7" ry="13" fill="#3b82f6" stroke="#2563eb" strokeWidth="2" />
            <ellipse cx="70" cy="85" rx="2.5" ry="3.5" fill="#fff" />
          </g>
        </g>
      </svg>
      <div className="text-primary-dark font-bold text-lg mt-2 animate-bounce">
        ¡Hola, {name}! 💧
      </div>
      <div className="text-xs text-primary font-semibold text-center transition-all duration-500 min-h-[1.5em]">
        {phrase}
      </div>
    </div>
  );
}
