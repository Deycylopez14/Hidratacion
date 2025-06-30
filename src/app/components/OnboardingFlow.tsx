import React, { useState } from "react";
import { motion } from "framer-motion";

// Carrusel de beneficios moderno
function BenefitCarousel(props: { onFinish: () => void }) {
  const [current, setCurrent] = React.useState(0);
  const total = benefits.length;
  // Para deslizar con touch
  const touchStartX = React.useRef(0);
  const touchEndX = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && current < total - 1) {
        setCurrent(c => c + 1);
      } else if (diff < 0 && current > 0) {
        setCurrent(c => c - 1);
      } else if (diff > 0 && current === total - 1) {
        props.onFinish();
      }
    }
  };

  // Para deslizar con mouse (drag)
  const mouseStartX = React.useRef<number | null>(null);
  const mouseEndX = React.useRef<number | null>(null);
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    mouseEndX.current = e.clientX;
    if (mouseStartX.current !== null && mouseEndX.current !== null) {
      const diff = mouseStartX.current - mouseEndX.current;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && current < total - 1) {
          setCurrent(c => c + 1);
        } else if (diff < 0 && current > 0) {
          setCurrent(c => c - 1);
        } else if (diff > 0 && current === total - 1) {
          props.onFinish();
        }
      }
    }
    mouseStartX.current = null;
    mouseEndX.current = null;
  };

  return (
    <motion.div
      key="beneficios-carrusel"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8 w-full relative"
    >
      {/* Fondo animado de burbujas y partículas */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            className={`absolute rounded-full bg-aqua/20 animate-bubble${i % 3 + 1}`}
            style={{
              width: `${16 + Math.random() * 18}px`,
              height: `${16 + Math.random() * 18}px`,
              left: `${Math.random() * 90}%`,
              bottom: `${Math.random() * 60}px`,
              animationDelay: `${Math.random() * 2.5}s`,
            }}
          />
        ))}
        {/* Partículas decorativas */}
        {[...Array(5)].map((_, i) => (
          <span
            key={100 + i}
            className="absolute bg-white/60 rounded-full shadow-lg animate-pulse"
            style={{
              width: `${4 + Math.random() * 6}px`,
              height: `${4 + Math.random() * 6}px`,
              left: `${Math.random() * 95}%`,
              top: `${Math.random() * 90}%`,
              animationDelay: `${Math.random() * 2.5}s`,
            }}
          />
        ))}
      </div>
      <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-aqua to-blue-400 text-center drop-shadow-lg mb-2 z-10 animate-fadein flex items-center justify-center gap-2">
        <span className="inline-block animate-bounce text-3xl">💧</span>
        ¿Por qué usar <span className="bg-gradient-to-r from-aqua to-blue-400 bg-clip-text text-transparent font-black animate-gradient-move">Hydration</span>?
        <span className="inline-block animate-spin-slow text-2xl">✨</span>
      </h2>
      <div className="relative w-full flex flex-col items-center z-10">
        <div
          className="w-full flex justify-center items-center select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          style={{ cursor: 'grab' }}
        >
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center bg-gradient-to-br from-blue-50 via-aqua/30 to-blue-100 rounded-3xl p-8 shadow-2xl w-full max-w-xs min-h-[260px] border border-aqua/20 relative overflow-hidden"
          >
            {/* Efecto decorativo de ondas */}
            <span className="absolute -top-8 -left-8 w-24 h-24 bg-aqua/20 rounded-full blur-2xl animate-pulse" />
            <span className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-300/20 rounded-full blur-2xl animate-pulse delay-200" />
            {/* Icono animado extra */}
            <span className="absolute top-2 right-2 text-blue-300 text-xl animate-float">🌟</span>
            <div className="mb-2 scale-110 transition-transform duration-300 hover:scale-125 cursor-pointer animate-fadein delay-100">{benefits[current].icon}</div>
            <div className="font-bold text-blue-700 text-lg text-center mb-1 drop-shadow-sm animate-fadein delay-150 flex items-center gap-2">
              {benefits[current].title}
              <span className="text-aqua text-xl animate-wiggle">💦</span>
            </div>
            <div className="text-darkblue text-center text-base font-medium mb-2 animate-fadein delay-200">{benefits[current].desc}</div>
            <div className="text-xs text-aqua font-semibold mt-2 animate-fadein delay-300 flex items-center gap-1">
              <span className="animate-pulse">👉</span> Desliza para ver más beneficios
            </div>
          </motion.div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {benefits.map((_, i) => (
            <span key={i} className={`w-3 h-3 rounded-full ${i === current ? "bg-blue-500 scale-125 shadow-lg" : "bg-blue-200"} transition-all`}></span>
          ))}
        </div>
      </div>
      {/* Animaciones personalizadas */}
      <style jsx>{`
        .animate-spin-slow { animation: spin 2.5s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-float {
          animation: float 2.2s ease-in-out infinite alternate;
        }
        @keyframes float {
          0% { transform: translateY(0); }
          100% { transform: translateY(-12px); }
        }
      `}</style>
    </motion.div>
  );
}
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";

import { AnimatePresence } from "framer-motion";
import WaterMascot from "./WaterMascot";
import FriendlyMascot from "./FriendlyMascot";

const steps = ["bienvenida", "beneficios", "apodo", "preferencias"];

const benefits = [
  {
    icon: <span className="block w-16 h-16 mx-auto mb-2"><FriendlyMascot /></span>,
    title: "Registra tu consumo diario de agua",
    desc: "Lleva un control fácil y visual de tu hidratación cada día."
  },
  {
    icon: <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" stroke="#3b82f6" strokeWidth="4"/><path d="M24 12v10" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"/><circle cx="24" cy="32" r="2.5" fill="#3b82f6"/></svg>,
    title: "Recibe recordatorios para hidratarte",
    desc: "No te olvides de tomar agua, ¡nosotros te avisamos!"
  },
  {
    icon: <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" stroke="#fbbf24" strokeWidth="4"/><path d="M24 34l-7.5 4.5 2-8.5-6.5-5.5 8.5-.5L24 16l3.5 8 8.5.5-6.5 5.5 2 8.5z" fill="#fbbf24"/></svg>,
    title: "Logra metas y mejora tu bienestar",
    desc: "Gana medallas y siente el progreso en tu salud."
  }
];

const defaultPrefs = {
  daily_goal: 2000,
  quickOptions: [500, 600, 700, 800, 900],
};

const activityLevels = [
  { value: "bajo", label: "Bajo (poco ejercicio)" },
  { value: "medio", label: "Medio (ejercicio regular)" },
  { value: "alto", label: "Alto (muy activo)" },
];
const climates = [
  { value: "frio", label: "Frío" },
  { value: "templado", label: "Templado" },
  { value: "caluroso", label: "Caluroso" },
];

export default function OnboardingFlow({ user, onFinish }: { user: any, onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");
  const [goal, setGoal] = useState(defaultPrefs.daily_goal);
  const [weight, setWeight] = useState(70);
  const [activity, setActivity] = useState("medio");
  const [climate, setClimate] = useState("templado");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleFinish = async () => {
    setLoading(true);
    // Guardar apodo y preferencias en Supabase
    if (user) {
      await supabase.auth.updateUser({ data: { full_name: nickname } });
      await supabase.from("user_goals").upsert({ user_id: user.id, daily_goal: goal });
    }
    localStorage.setItem("hydration_onboarded", "1");
    setLoading(false);
    onFinish();
  };

  // Sugerencia de meta diaria
  const suggestedGoal = (() => {
    let base = weight * 30; // 30ml por kg
    if (activity === "alto") base += 500;
    else if (activity === "medio") base += 250;
    if (climate === "caluroso") base += 400;
    else if (climate === "frio") base -= 200;
    return Math.max(1200, Math.min(5000, Math.round(base / 100) * 100));
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 via-aqua to-blue-200 animate-fadein">
      <div className="w-full max-w-xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-12 flex flex-col items-center relative overflow-hidden border border-blue-200/40" style={{boxShadow: '0 8px 40px 0 rgba(80,180,255,0.18)'}}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="bienvenida"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-12 w-full relative px-2 sm:px-8"
            >
              {/* Fondo animado de burbujas */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {[...Array(14)].map((_, i) => (
                  <span
                    key={i}
                    className={`absolute rounded-full bg-aqua/30 animate-bubble${i % 3 + 1}`}
                    style={{
                      width: `${22 + Math.random() * 28}px`,
                      height: `${22 + Math.random() * 28}px`,
                      left: `${Math.random() * 90}%`,
                      bottom: `${Math.random() * 60}px`,
                      animationDelay: `${Math.random() * 3}s`,
                    }}
                  />
                ))}
              </div>
              <div className="mb-4 z-10 animate-bounce-slow relative flex flex-col items-center">
                <div className="absolute -top-4 -right-4 animate-wave pointer-events-none">
                  <span className="text-4xl select-none">👋</span>
                </div>
                <div className="scale-125 drop-shadow-xl"><FriendlyMascot /></div>
              </div>
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-aqua to-blue-400 text-center drop-shadow-lg mb-2 z-10 leading-tight">
                ¡Hola! Soy <span className="bg-gradient-to-r from-aqua to-blue-400 bg-clip-text text-transparent font-black animate-gradient-move">Goti</span>,<br/>tu compañero de hidratación 💧
              </h2>
              <p className="text-xl text-blue-700 text-center mb-2 font-semibold z-10 animate-fadein max-w-lg">
                ¿Listo para sentirte más saludable y con más energía?
              </p>
              <button
                onClick={handleNext}
                className="relative bg-gradient-to-r from-blue-400 via-aqua to-blue-600 text-white px-16 py-5 rounded-3xl font-extrabold shadow-2xl hover:from-blue-500 hover:to-blue-700 transition-all mt-2 text-2xl tracking-wide animate-fadein delay-200 overflow-hidden focus:ring-4 focus:ring-aqua/40"
              >
                <span className="relative z-10">¡Sí, vamos!</span>
                <span className="ml-3 animate-wiggle inline-block text-3xl relative z-10">🚀</span>
                {/* Glow efecto */}
                <span className="absolute inset-0 bg-aqua/30 blur-2xl opacity-60 animate-pulse pointer-events-none" />
              </button>
            </motion.div>
          )}

          {step === 1 && <BenefitCarousel onFinish={handleNext} />}

          {step === 2 && (
            <motion.div
              key="apodo"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              <div className="mb-2">
                <WaterMascot percent={0} />
              </div>
              <h2 className="text-2xl font-extrabold text-blue-500 text-center drop-shadow-sm mb-1">
                ¡Quiero conocerte mejor!
              </h2>
              <p className="text-base text-aqua text-center mb-1 font-semibold">
                ¿Cómo te gustaría que te llame durante nuestra aventura? <br/>
                <span className="text-blue-400 text-xs font-normal">(Tu apodo o nombre)</span>
              </p>
              <div className="w-full flex flex-col items-center gap-2">
                <input
                  className="border-2 border-blue-300 bg-blue-50 rounded-xl px-4 py-3 text-lg text-blue-700 w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm placeholder:text-blue-300 transition-all"
                  placeholder="Escribe tu apodo bonito aquí..."
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  maxLength={20}
                  autoFocus
                />
                <span className="text-xs text-blue-400 mt-1 animate-pulse">¡Así podré animarte cada día de forma especial! 💧✨</span>
              </div>
              <div className="flex gap-2 w-full mt-2">
                <button onClick={handleBack} className="flex-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-500 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 border border-blue-200 shadow-sm transition-all">Atrás</button>
                <button onClick={handleNext} disabled={!nickname} className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 transition-all">¡Listo!</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="preferencias"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              <h2 className="text-xl font-bold text-blue-600">Personaliza tu hidratación</h2>
              <div className="w-full flex flex-col gap-3">
                <label className="text-darkblue font-semibold">Peso (kg):
                  <input
                    type="number"
                    min={30}
                    max={200}
                    value={weight}
                    onChange={e => setWeight(Number(e.target.value))}
                    className="border border-aqua rounded-lg px-4 py-2 text-lg w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1"
                  />
                </label>
                <label className="text-darkblue font-semibold">Nivel de actividad:
                  <select
                    value={activity}
                    onChange={e => setActivity(e.target.value)}
                    className="border border-aqua rounded-lg px-4 py-2 text-lg w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1"
                  >
                    {activityLevels.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
                <label className="text-darkblue font-semibold">Clima:
                  <select
                    value={climate}
                    onChange={e => setClimate(e.target.value)}
                    className="border border-aqua rounded-lg px-4 py-2 text-lg w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1"
                  >
                    {climates.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="w-full flex flex-col gap-2 mt-2">
                <div className="text-darkblue text-sm">Sugerencia de meta diaria: <span className="font-bold text-blue-600">{suggestedGoal} ml</span></div>
                <label className="text-darkblue font-semibold">¿Quieres ajustar tu meta diaria?
                  <input
                    type="number"
                    min={500}
                    max={5000}
                    step={100}
                    className="border border-aqua rounded-lg px-4 py-2 text-lg w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1"
                    value={goal}
                    onChange={e => setGoal(Number(e.target.value))}
                  />
                </label>
              </div>
              <div className="flex gap-2 w-full">
                <button onClick={handleBack} className="flex-1 bg-gray-100 text-blue-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200">Atrás</button>
                <button onClick={handleFinish} disabled={loading || !goal} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-blue-600 disabled:opacity-50">Finalizar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Progreso de pasos */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {steps.map((_, i) => (
            <span key={i} className={`w-3 h-3 rounded-full ${i === step ? "bg-blue-500" : "bg-blue-200"} transition-all`}></span>
          ))}
        </div>
      </div>
      {/* Animaciones de burbujas y gradientes personalizados */}
      <style jsx global>{`
        @keyframes bubble1 {
          0% { transform: translateY(0) scale(1); opacity: 0.7; }
          100% { transform: translateY(-140px) scale(1.2); opacity: 0; }
        }
        @keyframes bubble2 {
          0% { transform: translateY(0) scale(0.9); opacity: 0.6; }
          100% { transform: translateY(-200px) scale(1.3); opacity: 0; }
        }
        @keyframes bubble3 {
          0% { transform: translateY(0) scale(1.1); opacity: 0.8; }
          100% { transform: translateY(-110px) scale(1.4); opacity: 0; }
        }
        .animate-bubble1 { animation: bubble1 4.2s linear infinite; }
        .animate-bubble2 { animation: bubble2 5.1s linear infinite; }
        .animate-bubble3 { animation: bubble3 3.2s linear infinite; }
        .animate-gradient-move {
          background-size: 200% 200%;
          animation: gradientMove 2.5s ease-in-out infinite alternate;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-wave {
          animation: waveHand 1.5s infinite;
          transform-origin: 70% 70%;
        }
        @keyframes waveHand {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(18deg); }
          30% { transform: rotate(-12deg); }
          45% { transform: rotate(18deg); }
          60% { transform: rotate(-8deg); }
          75% { transform: rotate(12deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
