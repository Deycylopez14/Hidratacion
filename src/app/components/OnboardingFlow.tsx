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
      <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary text-center drop-shadow-lg mb-2 z-10 animate-fadein flex items-center justify-center gap-2">
        <span className="inline-block animate-bounce text-3xl">💧</span>
        ¿Por qué usar <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent font-black animate-gradient-move">Hydration</span>?
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
            className="flex flex-col items-center bg-[var(--color-white)] rounded-3xl p-8 shadow-2xl w-full max-w-xs min-h-[260px] border relative overflow-hidden" style={{ borderColor: '#94E7FF' }}
          >
            {/* Elementos decorativos eliminados */}
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Título arriba */}
              <div className="text-center mb-1 animate-fadein delay-150">
                <span className="block text-xl sm:text-2xl font-extrabold drop-shadow-lg tracking-tight mb-1 text-blue-700" style={{color: '#0074D9'}}>
                  {benefits[current].title}
                </span>
              </div>
              {/* Mascota o icono en el centro */}
              <div className="my-2 scale-50 sm:scale-60 transition-transform duration-300 hover:scale-75 cursor-pointer animate-fadein delay-100 flex justify-center" style={{ minHeight: 48 }}>
                {benefits[current].icon}
              </div>
              <div className="text-center text-base sm:text-lg font-semibold mb-2 animate-fadein delay-200 max-w-[240px] mx-auto text-primary dark:text-white bg-white/70 dark:bg-bg-light-1/80 px-2 py-1 rounded shadow-sm">
                <span className="block px-2 py-1 text-primary dark:text-white text-base sm:text-lg font-semibold animate-fadein delay-200">
                  {benefits[current].desc}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-accent font-semibold mt-2 animate-fadein delay-300 flex items-center gap-1 justify-center">
                <span className="animate-pulse">👉</span>
                <span className="tracking-wide">Desliza para ver más beneficios</span>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {benefits.map((_, i) => (
            <span key={i} className={`w-3 h-3 rounded-full ${i === current ? "bg-primary scale-125 shadow-lg" : "bg-bg-light-2"} transition-all`}></span>
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

const steps = [
  "bienvenida",
  "beneficios",
  "apodo",
  "amistad",
  "genero",
  "pesoedad",
  "meta",
  "rutina",
  "preferencias"
];

const benefits = [
  {
    icon: <span className="block w-16 h-16 mx-auto mb-2"><FriendlyMascot /></span>,
    title: "Registra tu consumo diario de agua",
    desc: "Lleva un control fácil y visual de tu hidratación cada día."
  },
  {
    icon: (
      <span className="block w-16 h-16 mx-auto mb-2 animate-bell">
        <svg viewBox="0 0 48 48" fill="none" className="w-16 h-16">
          <g>
            <path d="M24 44c2.2 0 4-1.8 4-4h-8c0 2.2 1.8 4 4 4z" fill="#3b82f6"/>
            <path d="M38 36v-9c0-7-4.5-12-10-12s-10 5-10 12v9l-2 2v2h24v-2l-2-2z" fill="#60a5fa" stroke="#2563eb" strokeWidth="2"/>
            <path d="M14 36h20" stroke="#2563eb" strokeWidth="2"/>
            <path d="M34 36a2 2 0 0 0 2-2" stroke="#2563eb" strokeWidth="2"/>
            <path d="M14 36a2 2 0 0 1-2-2" stroke="#2563eb" strokeWidth="2"/>
          </g>
        </svg>
        <style jsx>{`
          .animate-bell {
            animation: bell-shake 1.2s infinite;
            transform-origin: 50% 10%;
          }
          @keyframes bell-shake {
            0% { transform: rotate(0deg); }
            10% { transform: rotate(-12deg); }
            20% { transform: rotate(10deg); }
            30% { transform: rotate(-8deg); }
            40% { transform: rotate(8deg); }
            50% { transform: rotate(-4deg); }
            60% { transform: rotate(4deg); }
            70% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
          }
        `}</style>
      </span>
    ),
    title: "Recibe recordatorios para hidratarte",
    desc: "No te olvides de tomar agua, ¡nosotros te avisamos!"
  },
  {
    icon: (
      <span className="block w-16 h-16 mx-auto mb-2 animate-trophy">
        <svg viewBox="0 0 48 48" fill="none" className="w-16 h-16">
          <g>
            <rect x="18" y="38" width="12" height="4" rx="2" fill="#fbbf24" stroke="#f59e42" strokeWidth="1.5"/>
            <rect x="20" y="34" width="8" height="4" rx="2" fill="#fde68a" stroke="#fbbf24" strokeWidth="1.5"/>
            <ellipse cx="24" cy="24" rx="10" ry="10" fill="#fde68a" stroke="#fbbf24" strokeWidth="3"/>
            <path d="M14 18c-2 0-4 2-4 6s2 6 4 6" stroke="#60a5fa" strokeWidth="2.5" fill="none"/>
            <path d="M34 18c2 0 4 2 4 6s-2 6-4 6" stroke="#60a5fa" strokeWidth="2.5" fill="none"/>
            <path d="M18 18v-4a6 6 0 0 1 12 0v4" stroke="#fbbf24" strokeWidth="2" fill="none"/>
            <circle cx="24" cy="24" r="4" fill="#fbbf24"/>
            <path d="M24 28v6" stroke="#f59e42" strokeWidth="2"/>
          </g>
        </svg>
        <style jsx>{`
          .animate-trophy {
            animation: trophy-bounce 1.3s infinite;
          }
          @keyframes trophy-bounce {
            0% { transform: translateY(0); }
            20% { transform: translateY(-10px); }
            40% { transform: translateY(0); }
            60% { transform: translateY(-5px); }
            80% { transform: translateY(0); }
            100% { transform: translateY(0); }
          }
        `}</style>
      </span>
    ),
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
  const [gender, setGender] = useState<string>("");
  const [weight, setWeight] = useState<number>(70);
  const [age, setAge] = useState<number>(25);
  const [goal, setGoal] = useState(defaultPrefs.daily_goal);
  const [activity, setActivity] = useState("medio");
  const [climate, setClimate] = useState("templado");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [unit, setUnit] = useState("ml");
  const [reminderType, setReminderType] = useState("notificacion");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleFinish = async () => {
    setLoading(true);
    // Guardar apodo y todas las preferencias en Supabase y localStorage
    if (user) {
      await supabase.auth.updateUser({ data: { full_name: nickname } });
      await supabase.from("user_goals").upsert({
        user_id: user.id,
        daily_goal: goal,
        weight,
        age,
        gender,
        activity,
        climate,
        sleep_time: sleepTime,
        wake_time: wakeTime,
        unit,
        reminder_type: reminderType,
        updated_at: new Date().toISOString(),
      });
    }
    // Guardar en localStorage para acceso rápido en la app
    localStorage.setItem("hydration_onboarded", "1");
    localStorage.setItem("hydration_nickname", nickname);
    localStorage.setItem("hydration_weight", String(weight));
    localStorage.setItem("hydration_age", String(age));
    localStorage.setItem("hydration_gender", gender);
    localStorage.setItem("hydration_goal", String(goal));
    localStorage.setItem("hydration_activity", activity);
    localStorage.setItem("hydration_climate", climate);
    localStorage.setItem("hydration_sleep_time", sleepTime);
    localStorage.setItem("hydration_wake_time", wakeTime);
    localStorage.setItem("hydration_unit", unit);
    localStorage.setItem("hydration_reminder_type", reminderType);
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
    // Ajuste por edad y género (opcional, simple)
    if (gender === "femenino") base -= 200;
    if (age > 50) base -= 100;
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
                <FriendlyMascot />
              </div>
              <h2 className="text-2xl font-extrabold text-blue-500 text-center drop-shadow-sm mb-1">
                ¡Quiero conocerte mejor!
              </h2>
              <p className="text-base text-aqua text-center mb-1 font-semibold">
                ¿Cómo te gustaría que te llame durante nuestra aventura?
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
                <button
                  onClick={handleNext}
                  disabled={!nickname}
                  className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 transition-all"
                >
                  ¡Listo!
                </button>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="amistad"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-8 w-full"
            >
              <div className="mb-2">
                <FriendlyMascot />
              </div>
              <h2 className="text-3xl font-extrabold text-blue-500 text-center drop-shadow-sm mb-1">
                ¡Genial, {nickname || (typeof window !== 'undefined' && localStorage.getItem('hydration_nickname')) || ''}!
              </h2>
              <p className="text-lg text-blue-700 text-center font-semibold max-w-md">
                Ahora somos un equipo 💧✨<br/>
                ¡Estoy aquí para acompañarte y animarte cada día en tu camino de hidratación!<br/>
                <br/>
                <span className="italic text-sm text-blue-500">Recuerda: cada vaso cuenta y juntos lograremos tus metas.</span> <br/>
                <br/>
                <span className="text-aqua font-bold">¡Vamos por ello!</span>
              </p>
              <button
                onClick={() => setStep(4)}
                className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:from-blue-500 hover:to-blue-700 transition-all text-lg mt-2"
              >
                ¡Continuar!
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="genero"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-8 w-full"
            >
              <div className="mb-2 scale-125 animate-fadein"><FriendlyMascot /></div>
              <h2 className="text-2xl font-extrabold text-blue-600 text-center">¿Con qué género te identificas?</h2>
              <div className="flex gap-6 mt-4">
                <button onClick={() => { setGender('masculino'); setStep(5); }} className={`flex flex-col items-center px-6 py-4 rounded-2xl shadow-lg border-2 ${gender==='masculino' ? 'border-blue-500 bg-blue-100' : 'border-blue-200 bg-white'} hover:bg-blue-50 transition-all`}>
                  <span className="text-5xl mb-2">👨</span>
                  <span className="font-bold text-blue-600">Masculino</span>
                </button>
                <button onClick={() => { setGender('femenino'); setStep(5); }} className={`flex flex-col items-center px-6 py-4 rounded-2xl shadow-lg border-2 ${gender==='femenino' ? 'border-pink-400 bg-pink-50' : 'border-blue-200 bg-white'} hover:bg-pink-50 transition-all`}>
                  <span className="text-5xl mb-2">👩</span>
                  <span className="font-bold text-pink-500">Femenino</span>
                </button>
                <button onClick={() => { setGender('otro'); setStep(5); }} className={`flex flex-col items-center px-6 py-4 rounded-2xl shadow-lg border-2 ${gender==='otro' ? 'border-purple-400 bg-purple-50' : 'border-blue-200 bg-white'} hover:bg-purple-50 transition-all`}>
                  <span className="text-5xl mb-2">🧑‍🦱</span>
                  <span className="font-bold text-purple-500">Otro</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="pesoedad"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-8 w-full"
            >
              <div className="mb-2 scale-110 animate-fadein"><FriendlyMascot /></div>
              <h2 className="text-2xl font-extrabold text-blue-600 text-center">¡Vamos a personalizar tu meta!</h2>
              <div className="w-full flex flex-col gap-6 max-w-xs">
                <label className="text-darkblue font-semibold flex flex-col items-center w-full">
                  Peso (kg):
                  <div className="flex items-center gap-3 w-full mt-2">
                    <span className="text-blue-400 font-bold">30</span>
                    <input
                      type="range"
                      min={30}
                      max={200}
                      value={weight}
                      onChange={e => setWeight(Number(e.target.value))}
                      className="flex-1 accent-blue-500 h-2 rounded-lg appearance-none cursor-pointer bg-blue-200"
                    />
                    <span className="text-blue-400 font-bold">200</span>
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-blue-600">{weight} kg</div>
                </label>
                <label className="text-darkblue font-semibold flex flex-col items-center w-full">
                  Edad:
                  <div className="flex items-center gap-3 w-full mt-2">
                    <span className="text-blue-400 font-bold">10</span>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={age}
                      onChange={e => setAge(Number(e.target.value))}
                      className="flex-1 accent-blue-500 h-2 rounded-lg appearance-none cursor-pointer bg-blue-200"
                    />
                    <span className="text-blue-400 font-bold">100</span>
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-blue-600">{age} años</div>
                </label>
              </div>
              <div className="flex gap-2 w-full max-w-xs">
                <button onClick={() => setStep(4)} className="flex-1 bg-gray-100 text-blue-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200">Atrás</button>
                <button onClick={() => setStep(6)} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-blue-600">Siguiente</button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="meta"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-8 w-full"
            >
              <div className="mb-2 scale-110 animate-fadein"><FriendlyMascot /></div>
              <h2 className="text-2xl font-extrabold text-blue-600 text-center">¡Esta es tu meta diaria sugerida!</h2>
              <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-200 via-aqua to-blue-400 flex items-center justify-center shadow-xl mb-2 border-4 border-blue-300 animate-fadein">
                  <span className="flex flex-col items-center justify-center text-blue-700">
                    <span className="text-3xl font-extrabold leading-tight">{suggestedGoal}</span>
                    <span className="text-base font-semibold leading-none">ml</span>
                  </span>
                </div>
                <label className="text-darkblue font-semibold w-full flex flex-col items-center">¿Quieres ajustarla?
                  <div className="flex items-center gap-3 w-full mt-2">
                    <span className="text-blue-400 font-bold">500</span>
                    <input
                      type="range"
                      min={500}
                      max={5000}
                      step={100}
                      value={goal}
                      onChange={e => setGoal(Number(e.target.value))}
                      className="flex-1 accent-blue-500 h-2 rounded-lg appearance-none cursor-pointer bg-blue-200"
                    />
                    <span className="text-blue-400 font-bold">5000</span>
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-blue-600">{goal} ml</div>
                </label>
              </div>
              <div className="flex gap-2 w-full max-w-xs">
                <button onClick={() => setStep(5)} className="flex-1 bg-gray-100 text-blue-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200">Atrás</button>
                <button onClick={() => setStep(7)} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-blue-600">Siguiente</button>
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div
              key="rutina"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-8 w-full"
            >
              <div className="mb-2 scale-110 animate-fadein"><FriendlyMascot /></div>
              <h2 className="text-2xl font-extrabold text-blue-600 text-center">¡Cuéntame sobre tu rutina!</h2>
              <div className="w-full flex flex-col gap-4 max-w-xs">
                <label className="text-darkblue font-semibold">¿A qué hora sueles dormir?
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={e => setSleepTime(e.target.value)}
                    className="border-2 border-aqua rounded-xl px-4 py-3 text-lg w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1 bg-blue-50 shadow-sm"
                  />
                </label>
                <label className="text-darkblue font-semibold">¿A qué hora te despiertas?
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={e => setWakeTime(e.target.value)}
                    className="border-2 border-aqua rounded-xl px-4 py-3 text-lg w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1 bg-blue-50 shadow-sm"
                  />
                </label>
                <label className="text-darkblue font-semibold">Nivel de actividad física:
                  <select
                    value={activity}
                    onChange={e => setActivity(e.target.value)}
                    className="border-2 border-aqua rounded-xl px-4 py-3 text-lg w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1 bg-blue-50 shadow-sm"
                  >
                    {activityLevels.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex gap-2 w-full max-w-xs">
                <button onClick={() => setStep(6)} className="flex-1 bg-gray-100 text-blue-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200">Atrás</button>
                <button onClick={() => setStep(8)} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-blue-600">Siguiente</button>
              </div>
            </motion.div>
          )}

          {step === 8 && (
            <motion.div
              key="preferencias"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-8 w-full"
            >
              <div className="mb-2 scale-110 animate-fadein"><FriendlyMascot /></div>
              <h2 className="text-2xl font-extrabold text-blue-600 text-center">¡Últimos detalles!</h2>
              <div className="w-full flex flex-col gap-4 max-w-xs">
                <label className="text-darkblue font-semibold">Unidad de medida:
                  <div className="flex gap-4 mt-2">
                    <button onClick={() => setUnit('ml')} className={`flex-1 px-4 py-2 rounded-xl font-bold border-2 ${unit==='ml' ? 'border-blue-500 bg-blue-100' : 'border-blue-200 bg-white'} hover:bg-blue-50 transition-all`}>ml</button>
                    <button onClick={() => setUnit('oz')} className={`flex-1 px-4 py-2 rounded-xl font-bold border-2 ${unit==='oz' ? 'border-blue-500 bg-blue-100' : 'border-blue-200 bg-white'} hover:bg-blue-50 transition-all`}>oz</button>
                  </div>
                </label>
                <label className="text-darkblue font-semibold">Tipo de recordatorio:
                  <div className="flex gap-4 mt-2">
                    <button onClick={() => setReminderType('notificacion')} className={`flex-1 px-4 py-2 rounded-xl font-bold border-2 ${reminderType==='notificacion' ? 'border-blue-500 bg-blue-100' : 'border-blue-200 bg-white'} hover:bg-blue-50 transition-all`}>Notificación</button>
                    <button onClick={() => setReminderType('sonido')} className={`flex-1 px-4 py-2 rounded-xl font-bold border-2 ${reminderType==='sonido' ? 'border-blue-500 bg-blue-100' : 'border-blue-200 bg-white'} hover:bg-blue-50 transition-all`}>Sonido</button>
                  </div>
                </label>
              </div>
              <div className="flex gap-2 w-full max-w-xs">
                <button onClick={() => setStep(7)} className="flex-1 bg-gray-100 text-blue-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200">Atrás</button>
                <button onClick={() => setStep(9)} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-blue-600">Continuar</button>
              </div>
            </motion.div>
          )}

          {step === 9 && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-10 w-full"
            >
              <div className="mb-2 scale-125 animate-fadein"><FriendlyMascot /></div>
              <h2 className="text-3xl font-extrabold text-blue-600 text-center">¡Listo! Tu salud te lo agradecerá 💧</h2>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:from-blue-500 hover:to-blue-700 transition-all text-xl mt-2 disabled:opacity-50"
              >
                Empezar a trackear
              </button>
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
