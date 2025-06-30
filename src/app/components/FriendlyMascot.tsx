import React from "react";
import { motion } from "framer-motion";

// Mascota amigable estilo Duolingo
export default function FriendlyMascot() {
  return (
    <div style={{ display: 'inline-block' }}>
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Gota principal */}
        <path d="M60 15 C80 45, 105 70, 60 110 C15 70, 40 45, 60 15 Z" fill="#38BDF8" stroke="#0EA5E9" strokeWidth="3"/>
        {/* Brillo gota */}
        <ellipse cx="52" cy="40" rx="10" ry="18" fill="#fff" opacity="0.25"/>
        {/* Ojos (blancos) */}
        <ellipse cx="48" cy="70" rx="8" ry="10" fill="#fff"/>
        <ellipse cx="72" cy="70" rx="8" ry="10" fill="#fff"/>
        {/* Iris izquierdo animado */}
        <motion.ellipse
          cx="48"
          cy="73"
          rx="4"
          ry="5"
          fill="#2563eb"
          animate={{ cx: [46, 50, 46] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
        {/* Iris derecho animado */}
        <motion.ellipse
          cx="72"
          cy="73"
          rx="4"
          ry="5"
          fill="#2563eb"
          animate={{ cx: [70, 74, 70] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
        {/* Pupilas (brillo) */}
        <motion.ellipse
          cx="50"
          cy="75"
          rx="1.5"
          ry="2"
          fill="#fff"
          animate={{ cx: [48, 52, 48] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
        <motion.ellipse
          cx="74"
          cy="75"
          rx="1.5"
          ry="2"
          fill="#fff"
          animate={{ cx: [72, 76, 72] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
        {/* Sonrisa */}
        <path d="M52 85 Q60 92 68 85" stroke="#2563eb" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Mejillas */}
        <ellipse cx="42" cy="82" rx="2.5" ry="1.2" fill="#fbbf24" opacity="0.7"/>
        <ellipse cx="78" cy="82" rx="2.5" ry="1.2" fill="#fbbf24" opacity="0.7"/>
      </svg>
    </div>
  );
}
