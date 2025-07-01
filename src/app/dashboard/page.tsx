"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import ProgressCircleWave from "../components/ProgressCircleWave";
import Timeline from "../components/Timeline";
import MotivationalMessage from "../components/MotivationalMessage";
import AppHeader from "../components/AppHeader";
import WaterMascot from '../components/WaterMascot';
import OnboardingFlow from "../components/OnboardingFlow";
import NumberScroller from "../components/NumberScroller";
import HorizontalScroller from "../components/HorizontalScroller";
import VerticalScroller from "../components/VerticalScroller";

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
  const [unit, setUnit] = useState<string>("ml");
  const [simDate, setSimDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();

  // Opciones rápidas adaptadas a la unidad
  const quickOptions = unit === "oz" ? [8, 12, 16, 20] : [150, 250, 500, 750];

  // Cambiar let por const donde corresponda
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/login");
      else setUser(data.session.user);
      // Mostrar onboarding solo la primera vez
      if (typeof window !== "undefined" && !localStorage.getItem("hydration_onboarded")) {
        setShowOnboarding(true);
      }
    });
  }, [router]);
  const fetchGoal = useCallback(async () => {
    const { data } = await supabase
      .from("user_goals")
      .select("daily_goal, unit")
      .eq("user_id", user?.id)
      .single();
    if (data) {
      setUserGoal(data.daily_goal);
      setUnit(data.unit || "ml");
    } else {
      setUserGoal(null);
      setUnit("ml");
    }
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

  const DAILY_GOAL = userGoal ?? 2000;
  // Si la unidad es oz, convertir a ml para el cálculo de porcentaje
  const goalInMl = unit === "oz" ? DAILY_GOAL * 29.5735 : DAILY_GOAL;
  const totalInMl = unit === "oz" ? total * 29.5735 : total;
  const percent = Math.min(100, Math.round((totalInMl / goalInMl) * 100));
  const restante = Math.max(0, Math.round(goalInMl - totalInMl));

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
    <div className="min-h-screen w-full bg-bg-light-1 text-primary transition-colors relative overflow-hidden">
      {showOnboarding && user && (
        <OnboardingFlow user={user} onFinish={() => setShowOnboarding(false)} />
      )}
      <AppHeader />
      {/* Mascota animada tipo gota de agua */}
      <div className="flex flex-col items-center justify-center mt-2 mb-2 gap-1">
        <WaterMascot name={user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Amigo"} percent={percent} />
        <h2 className="font-bold text-lg sm:text-2xl text-primary drop-shadow mt-1 mb-0">¡Bienvenido a tu Dashboard!</h2>
        <p className="text-xs sm:text-base text-accent font-semibold mb-2">Revisa tu progreso y registra tu consumo de agua.</p>
      </div>
      <div className="container-responsive w-full bg-white rounded shadow p-4 sm:p-6 mt-4 sm:mt-8 relative z-10 overflow-hidden">
        {/* Progreso */}
        <section className="max-w-2xl mx-auto mt-4 sm:mt-6 bg- rounded shadow p-4 sm:p-6 mb-4">
          <h2 className="font-bold text-lg sm:text-xl mb-2 text-primary drop-shadow">Progreso de Hoy</h2>
          <div className="text-sm sm:text-base text-accent mb-2 font-semibold">Meta diaria</div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-bg-light-2 rounded-full h-4 border border-accent shadow-inner overflow-hidden">
              <div
                className="h-4 rounded-full shadow-lg transition-all duration-700 bg-gradient-to-r from-accent to-green-1"
                style={{
                  width: `${percent}%`,
                }}
              ></div>
            </div>
            <span className="text-xs sm:text-sm font-bold text-primary">{DAILY_GOAL} {unit}</span>
          </div>
          <div className="flex justify-between text-center mb-2">
            <div>
              <div className="text-primary text-xl font-bold drop-shadow">{total} {unit}</div>
              <div className="text-xs text-accent font-semibold">Consumido</div>
            </div>
            <div>
              <div className="text-green-1 text-xl font-bold drop-shadow">{percent}%</div>
              <div className="text-xs text-green-1 font-semibold">Completado</div>
            </div>
            <div>
              <div className="text-accent text-xl font-bold drop-shadow">{restante} {unit}</div>
              <div className="text-xs text-accent font-semibold">Restante</div>
            </div>
          </div>
          <div className="flex justify-center my-4">
            <ProgressCircleWave percent={percent} />
            <div className="text-xs text-accent mt-2">Unidad: <b>{unit}</b></div>
          </div>
        </section>
        {/* Registrar Consumo */}
        <section className="container-responsive w-full bg-white rounded shadow p-4 sm:p-6 mb-4">
          <h2 className="font-bold text-lg sm:text-xl mb-4 text-primary drop-shadow">Registrar Consumo</h2>
          {/* ...existing code... */}
          <div className="mb-4">
            <HorizontalScroller
              min={unit === "oz" ? 4 : 100}
              max={unit === "oz" ? 64 : 2000}
              step={unit === "oz" ? 2 : 100}
              value={input}
              onChange={val => { setInput(val); setSelected(val); }}
              unit={unit}
            />
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleAdd}
              className="w-full max-w-xs flex items-center justify-center gap-2 font-semibold tracking-wide py-3 rounded-xl shadow-lg border-0 transition-all duration-200 text-base disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent
                bg-primary text-white hover:bg-accent"
              style={{ letterSpacing: '0.03em', fontFamily: 'inherit', fontSize: '1.1rem' }}
              disabled={loading}
              type="button"
            >
              Agregar
            </button>
          </div>
          <div className="mt-6 pt-4 bg-white rounded-b-lg shadow-inner flex flex-col items-center transition-colors duration-300">
            {error && <div className="text-red-600 text-xs mt-2">{error}</div>}
          </div>
        </section>
        {/* Estadísticas rápidas */}
        <section className="container-responsive w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-4">
          <div className="bg-gradient-to-br from-bg-light-2 to-bg-light-1 rounded-xl shadow-lg p-3 text-center flex flex-col items-center gap-1 border border-accent hover:scale-[1.03] transition-all duration-200">
            <span className="bg-white text-accent rounded-full p-1 shadow-md mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l3-3m-3 3l-3-3" /></svg>
            </span>
            <div className="text-accent text-lg font-extrabold drop-shadow">{timeline.length}</div>
            <div className="text-xs text-primary font-semibold tracking-wide uppercase">Registros hoy</div>
          </div>
          <div className="bg-gradient-to-br from-celeste-1 to-celeste-2 rounded-xl shadow-lg p-3 text-center flex flex-col items-center gap-1 border border-accent hover:scale-[1.03] transition-all duration-200">
            <span className="bg-white text-green-1 rounded-full p-1 shadow-md mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5" /></svg>
            </span>
            <div className="text-green-1 text-lg font-extrabold drop-shadow">{avg}ml</div>
            <div className="text-xs text-primary font-semibold tracking-wide uppercase">Promedio 7 días</div>
          </div>
          <div className="bg-gradient-to-br from-bg-light-2 to-bg-light-1 rounded-xl shadow-lg p-3 text-center flex flex-col items-center gap-1 border border-accent hover:scale-[1.03] transition-all duration-200">
            <span className="bg-white text-accent rounded-full p-1 shadow-md mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 10v4" /></svg>
            </span>
            <div className="text-accent text-lg font-extrabold drop-shadow">{best}ml</div>
            <div className="text-xs text-primary font-semibold tracking-wide uppercase">Mejor día</div>
          </div>
          <div className="bg-gradient-to-br from-green-1 to-green-2 rounded-xl shadow-lg p-3 text-center flex flex-col items-center gap-1 border border-success hover:scale-[1.03] transition-all duration-200">
            <span className="bg-white text-success rounded-full p-1 shadow-md mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </span>
            <div className="text-success text-lg font-extrabold drop-shadow">{DAILY_GOAL} {unit}</div>
            <div className="text-xs text-primary font-semibold tracking-wide uppercase">Meta diaria</div>
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
          <h2 className="font-bold text-lg sm:text-xl mb-4 text-primary drop-shadow flex items-center gap-2">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            Recordatorios inteligentes
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-2 w-full">
            <div className="flex-1 flex flex-col items-center bg-gradient-to-br from-bg-light-2 to-bg-light-1 rounded-xl p-3 shadow border border-accent">
              <label className="flex items-center gap-2 text-primary font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={e => setReminderEnabled(e.target.checked)}
                  className="accent-accent w-5 h-5 rounded focus:ring-2 focus:ring-accent"
                />
                <span className="text-base">Activar recordatorios</span>
              </label>
              <span className="text-xs text-accent mt-1">Notificaciones push</span>
            </div>
            <div className="flex-1 flex flex-col items-center bg-gradient-to-br from-celeste-1 to-celeste-2 rounded-xl p-3 shadow border border-accent">
              <label className="flex items-center gap-2 text-primary font-semibold cursor-pointer mb-2">
                <svg className="w-5 h-5 text-green-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                <span className="text-base">Frecuencia</span>
              </label>
              <VerticalScroller
                min={10}
                max={180}
                step={5}
                value={reminderFreq}
                onChange={setReminderFreq}
              />
              <span className="text-xs text-green-1 mt-1">Cada {reminderFreq} minutos</span>
            </div>
            <div className="flex-1 flex flex-col items-center bg-gradient-to-br from-green-1 to-green-2 rounded-xl p-3 shadow border border-success">
              <label className="flex items-center gap-2 text-success font-semibold cursor-pointer">
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="text-base">Sonido</span>
                <input
                  type="checkbox"
                  checked={reminderSound}
                  onChange={e => setReminderSound(e.target.checked)}
                  className="accent-success w-5 h-5 rounded focus:ring-2 focus:ring-success"
                />
              </label>
              <span className="text-xs text-success mt-1">Vibración/Sonido</span>
            </div>
          </div>
          <div className="text-xs text-accent font-semibold text-center mt-2">Recibirás una notificación cada {reminderFreq} minutos si activas los recordatorios. Puedes activar sonido si lo deseas.</div>
        </section>
        {/* Solo para desarrollo: fecha simulada */}
        {process.env.NODE_ENV !== "production" && (
          <div className="mb-2 flex gap-2 items-center">
            <label className="text-xs text-primary font-semibold">Simular fecha:</label>
            <input
              type="date"
              value={simDate}
              onChange={e => setSimDate(e.target.value)}
              className="border border-accent focus:border-primary rounded px-2 py-1 text-xs bg-white text-primary"
              max={new Date().toISOString().slice(0, 10)}
            />
            {simDate && (
              <button className="text-xs text-accent underline" onClick={() => setSimDate("")}>Quitar</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
