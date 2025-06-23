import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

const steps = ["bienvenida", "apodo", "preferencias"];

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
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="bienvenida"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6"
            >
              <img src="/icons/pwa-192x192.png" alt="Logo" className="w-24 h-24 mb-2 animate-bounce" />
              <h1 className="text-2xl font-bold text-blue-600 drop-shadow">¡Bienvenido a Hydration!</h1>
              <p className="text-base text-darkblue text-center">Te ayudaremos a mantenerte hidratado y saludable. ¡Configura tu perfil para comenzar!</p>
              <button onClick={handleNext} className="bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-600 transition-all">Comenzar</button>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div
              key="apodo"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              <h2 className="text-xl font-bold text-blue-600">¿Cómo te gustaría que te llamemos?</h2>
              <input
                className="border border-aqua rounded-lg px-4 py-3 text-lg text-darkblue w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Tu apodo o nombre"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={20}
              />
              <div className="flex gap-2 w-full">
                <button onClick={handleBack} className="flex-1 bg-gray-100 text-blue-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200">Atrás</button>
                <button onClick={handleNext} disabled={!nickname} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-blue-600 disabled:opacity-50">Siguiente</button>
              </div>
            </motion.div>
          )}
          {step === 2 && (
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
    </div>
  );
}
