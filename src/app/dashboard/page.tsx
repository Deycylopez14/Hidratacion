"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import ProgressCircle from "../components/ProgressCircle";
import Timeline from "../components/Timeline";
import MotivationalMessage from "../components/MotivationalMessage";
import AppHeader from "../components/AppHeader";
import Wave from 'react-wavify';
import WaterMascot from '../components/WaterMascot';

// Tipos explícitos para usuario y datos de hidratación
interface User {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
}
interface HydrationData {
  amount: number;
  created_at: string;
}

// Notificaciones y recordatorios
function useWaterReminder(frequencyMinutes: number, enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const interval = setInterval(() => {
      if (Notification.permission === "granted") {
        new Notification("¡Hora de hidratarte!", {
          body: "Recuerda beber agua para alcanzar tu meta diaria.",
          icon: "/icons/icon-192x192.png",
        });
      }
    }, frequencyMinutes * 60 * 1000);
    return () => clearInterval(interval);
  }, [frequencyMinutes, enabled]);
}

// Notificaciones avanzadas
function useAdvancedWaterReminder(frequencyMinutes: number, enabled: boolean, sound: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const interval = setInterval(() => {
      if (Notification.permission === "granted") {
        new Notification("¡Hora de hidratarte!", {
          body: "Recuerda beber agua para alcanzar tu meta diaria.",
          icon: "/icons/icon-192x192.png",
        });
        if (sound) {
          const audio = new Audio("/noti-sound.mp3");
          audio.play();
        }
      }
    }, frequencyMinutes * 60 * 1000);
    return () => clearInterval(interval);
  }, [frequencyMinutes, enabled, sound]);
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [timeline, setTimeline] = useState<{ time: string; amount: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [input, setInput] = useState(250);
  const [selected, setSelected] = useState(250);
  const [avg, setAvg] = useState(0);
  const [best, setBest] = useState(0);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderFreq, setReminderFreq] = useState(60); // minutos
  const [reminderSound, setReminderSound] = useState(false);
  const [userGoal, setUserGoal] = useState<number | null>(null);
  const [simDate, setSimDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const quickOptions = [150, 250, 500, 750];

  // Cambiar let por const donde corresponda
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/login");
      else setUser(data.session.user);
    });
  }, [router]);
  const fetchGoal = useCallback(async () => {
    const { data } = await supabase
      .from("user_goals")
      .select("daily_goal")
      .eq("user_id", user?.id)
      .single();
    if (data) setUserGoal(data.daily_goal);
    else setUserGoal(null);
  }, [user]);

  const fetchToday = useCallback(async () => {
    const today = simDate || new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("hydration")
      .select("amount,created_at")
      .eq("user_id", user?.id)
      .gte("created_at", today + "T00:00:00")
      .lte("created_at", today + "T23:59:59");
    if (data) {
      setTimeline(
        data.map((d: HydrationData) => ({
          time: new Date(d.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          amount: d.amount,
        }))
      );
      setTotal(data.reduce((acc: number, d: HydrationData) => acc + d.amount, 0));
    }
  }, [user, simDate]);

  const fetchStats = useCallback(async () => {
    // Promedio últimos 7 días
    const from = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data } = await supabase
      .from("hydration")
      .select("amount,created_at")
      .eq("user_id", user?.id)
      .gte("created_at", from + "T00:00:00");
    if (data) {
      // Agrupar por día
      const days: { [key: string]: number } = {};
      data.forEach((d: HydrationData) => {
        const day = d.created_at.slice(0, 10);
        days[day] = (days[day] || 0) + d.amount;
      });
      const vals = Object.values(days);
      setAvg(vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0);
      setBest(vals.length ? Math.max(...vals) : 0);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchGoal();
      fetchToday();
      fetchStats();
    }
  }, [user, simDate, fetchGoal, fetchToday, fetchStats]);
  useEffect(() => {
    if (user) fetchToday();
  }, [simDate, user, fetchToday]);

  const handleAdd = async () => {
    if (!user || !input) return;
    setLoading(true);
    setError(null);
    // Usar la fecha simulada si está activa, si no la actual
    let createdAt;
    if (simDate) {
      // Usar la fecha simulada a las 12:00:00 para evitar problemas de zona horaria
      createdAt = simDate + 'T12:00:00Z';
    } else {
      createdAt = new Date().toISOString();
    }
    const { error: insertError } = await supabase.from("hydration").insert({
      user_id: user.id,
      amount: input,
      created_at: createdAt,
    });
    if (insertError) {
      setError("Error al registrar el consumo. Intenta de nuevo.");
      setLoading(false);
      return;
    }
    setInput(selected); // reset input
    await fetchToday();
    await fetchStats();
    setLoading(false);
  };

  const DAILY_GOAL = userGoal ?? 2000; // ml por defecto si no hay personalizado
  const percent = Math.min(100, Math.round((total / DAILY_GOAL) * 100));
  const restante = Math.max(0, DAILY_GOAL - total);

  useWaterReminder(reminderFreq, reminderEnabled);
  useAdvancedWaterReminder(reminderFreq, reminderEnabled, reminderSound);

  // Detectar cambio de día y refrescar progreso automáticamente
  useEffect(() => {
    if (!user) return;
    let lastDate = new Date().toISOString().slice(0, 10);
    const interval = setInterval(() => {
      const nowDate = new Date().toISOString().slice(0, 10);
      if (nowDate !== lastDate) {
        lastDate = nowDate;
        fetchToday();
      }
    }, 60 * 1000); // Chequear cada minuto
    return () => clearInterval(interval);
  }, [user, fetchToday]);

  // Si cambia la fecha simulada, refrescar progreso
  useEffect(() => {
    if (user) fetchToday();
  }, [simDate, user, fetchToday]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const observer = new MutationObserver(() => {
        // ...existing code...
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-white text-darkblue transition-colors relative overflow-hidden">
      <AppHeader />
      {/* Mascota animada tipo gota de agua */}
      <div className="flex flex-col items-center justify-center mt-2 mb-2 gap-1">
        <WaterMascot name={user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Amigo"} percent={percent} />
        <h2 className="font-bold text-lg sm:text-2xl text-darkblue drop-shadow mt-1 mb-0">¡Bienvenido a tu Dashboard!</h2>
        <p className="text-xs sm:text-base text-aqua font-semibold mb-2">Revisa tu progreso y registra tu consumo de agua.</p>
      </div>
      {/* Ola animada tipo water-wave en el fondo inferior */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <Wave
          fill="#50C7EC" // aqua
          paused={false}
          options={{ height: 20, amplitude: 30, speed: 0.2, points: 3 }}
          style={{ minHeight: 60 }}
        />
      </div>
      <div className="container-responsive w-full bg-white rounded shadow p-4 sm:p-6 mt-4 sm:mt-8 relative z-10 overflow-hidden">
        {/* Animación de burbujas SOLO en cliente para evitar hydration mismatch */}
        {typeof window !== "undefined" && (
          <div className="absolute inset-0 pointer-events-none select-none z-0">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className={`absolute rounded-full bg-primary/30 animate-bubble${i % 2 === 0 ? ' delay-1000' : ''}`}
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  width: `${12 + Math.random() * 16}px`,
                  height: `${12 + Math.random() * 16}px`,
                  bottom: `-${Math.random() * 40}px`,
                  animationDuration: `${3 + Math.random() * 3}s`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
        {/* Progreso */}
        <section className="max-w-2xl mx-auto mt-4 sm:mt-6 bg- rounded shadow p-4 sm:p-6 mb-4">
          <h2 className="font-bold text-lg sm:text-xl mb-2 text-darkblue drop-shadow">Progreso de Hoy</h2>
          <div className="text-sm sm:text-base text-aqua mb-2 font-semibold">Meta diaria</div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-lightblue rounded-full h-4 border border-aqua shadow-inner overflow-hidden">
              <div
                className="h-4 rounded-full shadow-lg transition-all duration-700"
                style={{
                  width: `${percent}%`,
                  background: percent > 0 ? "linear-gradient(90deg, #50C7EC 60%, #00D4D8 100%)" : "#e0f7fa"
                }}
              ></div>
            </div>
            <span className="text-xs sm:text-sm font-bold text-darkblue">{DAILY_GOAL} ml</span>
          </div>
          <div className="flex justify-between text-center mb-2">
            <div>
              <div className="text-darkblue text-xl font-bold drop-shadow">{total}</div>
              <div className="text-xs text-aqua font-semibold">Consumido</div>
            </div>
            <div>
              <div className="text-turquoise text-xl font-bold drop-shadow">{percent}%</div>
              <div className="text-xs text-turquoise font-semibold">Completado</div>
            </div>
            <div>
              <div className="text-aqua text-xl font-bold drop-shadow">{restante}</div>
              <div className="text-xs text-aqua font-semibold">Restante</div>
            </div>
          </div>
          <div className="flex justify-center my-4">
            <ProgressCircle percent={percent} />
          </div>
        </section>
        {/* Registrar Consumo */}
        <section className="container-responsive w-full bg-white rounded shadow p-4 sm:p-6 mb-4">
          <h2 className="font-bold text-lg sm:text-xl mb-4 text-darkblue drop-shadow">Registrar Consumo</h2>
          <div className="flex gap-2 mb-4 items-center flex-wrap">
            <input
              type="number"
              min={1}
              value={input}
              onChange={e => setInput(Number(e.target.value))}
              className="border border-aqua focus:border-darkblue rounded px-3 py-2 w-32 text-center text-darkblue font-bold bg-white"
              placeholder="Cantidad (ml)"
            />
            <div className="flex gap-2">
              {quickOptions.map(opt => (
                <button
                  key={opt}
                  className={`w-20 h-12 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-aqua transition-all duration-200
                    ${selected === opt ? "bg-blue-500 text-white" : "bg-gray-100 text-darkblue hover:bg-blue-100"}`}
                  onClick={() => { setInput(opt); setSelected(opt); }}
                  type="button"
                >
                  {opt}ml
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleAdd}
              className="w-full max-w-xs flex items-center justify-center gap-2 font-semibold tracking-wide py-3 rounded-xl shadow-lg border-0 transition-all duration-200 text-base disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500
                bg-blue-500 text-white hover:bg-blue-600"
              style={{ letterSpacing: '0.03em', fontFamily: 'inherit', fontSize: '1.1rem' }}
              disabled={loading}
              type="button"
            >
              Agregar {input}ml
            </button>
          </div>
          <div className="mt-6 pt-4 border-t border-lightblue bg-white rounded-b-lg shadow-inner flex flex-col items-center transition-colors duration-300">
            {error && <div className="text-red-600 text-xs mt-2">{error}</div>}
          </div>
        </section>
        {/* Estadísticas rápidas */}
        <section className="container-responsive w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-4">
          <div className="bg-lightblue rounded shadow p-4 text-center transition-colors">
            <div className="text-aqua text-xl font-bold">{timeline.length}</div>
            <div className="text-xs text-darkblue">Registros hoy</div>
          </div>
          <div className="bg-lightblue rounded shadow p-4 text-center transition-colors">
            <div className="text-turquoise text-xl font-bold">{avg}ml</div>
            <div className="text-xs text-darkblue">Promedio 7 días</div>
          </div>
          <div className="bg-lightblue rounded shadow p-4 text-center transition-colors">
            <div className="text-darkblue text-xl font-bold">{best}ml</div>
            <div className="text-xs text-darkblue">Mejor día</div>
          </div>
          <div className="bg-lightblue rounded shadow p-4 text-center transition-colors">
            <div className="text-darkblue text-xl font-bold">{DAILY_GOAL}ml</div>
            <div className="text-xs text-darkblue">Meta diaria</div>
          </div>
        </section>
        {/* Timeline del día */}
        <section className="max-w-2xl mx-auto mb-8">
          <Timeline timeline={timeline} />
        </section>
        {/* Mensaje motivacional */}
        <section className="max-w-2xl mx-auto mb-8">
          <MotivationalMessage percent={percent} />
        </section>
        {/* Configuración de recordatorios */}
        <section className="max-w-2xl mx-auto bg-white rounded shadow p-4 sm:p-6 mb-4">
          <h2 className="font-bold text-lg sm:text-xl mb-4 text-darkblue drop-shadow">Recordatorios</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
            <label className="flex items-center gap-2 text-darkblue font-semibold">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={e => setReminderEnabled(e.target.checked)}
              />
              Activar recordatorios
            </label>
            <label className="flex items-center gap-2 text-darkblue font-semibold">
              Frecuencia:
              <input
                type="number"
                min={10}
                max={180}
                value={reminderFreq}
                onChange={e => setReminderFreq(Number(e.target.value))}
                className="border border-aqua focus:border-darkblue rounded px-2 py-1 w-16 text-center text-darkblue font-bold bg-white"
              />
              min
            </label>
            <label className="flex items-center gap-2 text-darkblue font-semibold">
              <input
                type="checkbox"
                checked={reminderSound}
                onChange={e => setReminderSound(e.target.checked)}
              />
              Sonido
            </label>
          </div>
          <div className="text-xs text-aqua font-semibold">Recibirás una notificación cada {reminderFreq} minutos si activas los recordatorios. Puedes activar sonido si lo deseas.</div>
        </section>
        {/* Solo para desarrollo: fecha simulada */}
        {process.env.NODE_ENV !== "production" && (
          <div className="mb-2 flex gap-2 items-center">
            <label className="text-xs text-darkblue font-semibold">Simular fecha:</label>
            <input
              type="date"
              value={simDate}
              onChange={e => setSimDate(e.target.value)}
              className="border border-aqua focus:border-darkblue rounded px-2 py-1 text-xs bg-white text-darkblue"
              max={new Date().toISOString().slice(0, 10)}
            />
            {simDate && (
              <button className="text-xs text-turquoise underline" onClick={() => setSimDate("")}>Quitar</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
