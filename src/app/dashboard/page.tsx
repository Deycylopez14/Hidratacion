"use client";
import { useEffect, useState, useCallback } from "react";
// Clave pública VAPID para Push API (debes generar la tuya y reemplazarla)
const VAPID_PUBLIC_KEY = "BObF1QwKkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQkQ";

// Función para convertir la clave VAPID a Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Hook para solicitar permiso y suscribir al usuario a Push Notifications y guardar en Supabase
function usePushNotifications(enabled: boolean, userId?: string) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (!userId) return;
    let swReg: ServiceWorkerRegistration;
    Notification.requestPermission().then(permission => {
      if (permission !== "granted") return;
      navigator.serviceWorker.ready.then(async (registration) => {
        swReg = registration;
        const subscription = await swReg.pushManager.getSubscription();
        if (!subscription) {
          try {
            const newSub = await swReg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });
            await savePushSubscription(userId, newSub);
            console.log('Push subscription guardada en Supabase:', newSub);
          } catch (err) {
            console.error('Error al suscribirse a push:', err);
          }
        } else {
          await savePushSubscription(userId, subscription);
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, !!userId]); // Solo dependencias booleanas para evitar el error de tamaño del array
}

// Guardar la suscripción en Supabase
async function savePushSubscription(userId: string, subscription: PushSubscription) {
  // Puedes guardar más campos si lo deseas
  const sub = subscription.toJSON();
  // Busca si ya existe una suscripción para este usuario
  const { data: existing, error: fetchError } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (existing) {
    // Actualiza la suscripción
    await supabase
      .from('push_subscriptions')
      .update({ subscription: sub })
      .eq('id', existing.id);
  } else {
    // Inserta nueva suscripción
    await supabase
      .from('push_subscriptions')
      .insert({ user_id: userId, subscription: sub });
  }
}
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import ProgressCircleWave from "../components/ProgressCircleWave";
import "./progress-bar.css";
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
  const quickOptions = unit === "oz" ? [16, 20, 24, 32] : [500, 600, 700, 800];

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
    let found = false;
    if (user) {
      const { data } = await supabase
        .from("user_goals")
        .select("daily_goal, unit")
        .eq("user_id", user?.id)
        .single();
      if (data) {
        setUserGoal(data.daily_goal);
        setUnit(data.unit || "ml");
        found = true;
      }
    }
    // Si no se encontró en Supabase, buscar en localStorage
    if (!found && typeof window !== "undefined") {
      const localGoal = localStorage.getItem("hydration_goal");
      if (localGoal) {
        setUserGoal(Number(localGoal));
      } else {
        setUserGoal(null);
      }
      const localUnit = localStorage.getItem("hydration_unit");
      setUnit(localUnit || "ml");
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
      // Formato de hora consistente (HH:mm)
      setTimeline(
        data.map((d: HydrationData) => {
          const date = new Date(d.created_at);
          const hours = String(date.getUTCHours()).padStart(2, '0');
          const minutes = String(date.getUTCMinutes()).padStart(2, '0');
          return {
            time: `${hours}:${minutes}`,
            amount: d.amount,
          };
        })
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
  usePushNotifications(reminderEnabled, user?.id); // Suscribir a push y guardar en Supabase

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
    <div className="min-h-screen w-full text-primary transition-colors relative overflow-hidden" style={{ background: '#f7fafc' }}>
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
      <div className="container-responsive w-full rounded-xl shadow-lg p-4 sm:p-6 mt-4 sm:mt-8 mb-16 relative z-10 overflow-hidden" style={{ background: '#F8FCFF', boxShadow: '0 8px 24px 0 rgba(0,0,0,0.10)' }}>
        {/* Progreso */}
        <section className="max-w-2xl mx-auto mt-4 sm:mt-6 rounded shadow p-4 sm:p-6 mb-4" style={{ background: '#EFFBFF' }}>
          <h2 className="font-bold text-lg sm:text-xl mb-2 text-primary drop-shadow">Progreso de Hoy</h2>
          <div className="text-sm sm:text-base text-accent mb-2 font-semibold">Meta diaria</div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 rounded-full h-4 border border-accent shadow-inner overflow-hidden bg-[#E6F4F9]">
              <div
                className="h-4 rounded-full shadow-lg transition-all duration-700 animate-progress-bar"
                style={{
                  width: `${percent}%`,
                  background: '#50C7EC', // igual que la ola
                  transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
                  opacity: 0.85,
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
        <section className="container-responsive w-full rounded shadow p-4 sm:p-6 mb-4" style={{ background: '#EFFBFF' }}>
          <h2 className="font-bold text-lg sm:text-xl mb-4 text-primary drop-shadow">Registrar Consumo</h2>
          {/* ...existing code... */}
          <div className="mb-4">
            <HorizontalScroller
              min={unit === "oz" ? 4 : 500}
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
          <div className="rounded-xl shadow-lg p-3 text-center flex flex-col items-center gap-1 border border-[#006691] hover:scale-[1.03] transition-all duration-200" style={{ background: '#006691' }}>
            <span className="bg-white text-accent rounded-full p-1 shadow-md mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l3-3m-3 3l-3-3" /></svg>
            </span>
            <div className="text-white text-lg font-extrabold drop-shadow">{timeline.length}</div>
            <div className="text-white text-xs font-semibold tracking-wide uppercase">Registros hoy</div>
          </div>
          <div className="rounded-xl shadow-lg p-3 text-center flex flex-col items-center gap-1 border border-[#006691] hover:scale-[1.03] transition-all duration-200" style={{ background: '#006691' }}>
            <span className="bg-white text-green-1 rounded-full p-1 shadow-md mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5" /></svg>
            </span>
            <div className="text-white text-lg font-extrabold drop-shadow">{avg}ml</div>
            <div className="text-white text-xs font-semibold tracking-wide uppercase">Promedio 7 días</div>
          </div>
          <div className="rounded-xl shadow-lg p-3 text-center flex flex-col items-center gap-1 border border-[#006691] hover:scale-[1.03] transition-all duration-200" style={{ background: '#006691' }}>
            <span className="bg-white text-accent rounded-full p-1 shadow-md mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 10v4" /></svg>
            </span>
            <div className="text-white text-lg font-extrabold drop-shadow">{best}ml</div>
            <div className="text-white text-xs font-semibold tracking-wide uppercase">Mejor día</div>
          </div>
          <div className="rounded-xl shadow-lg p-3 text-center flex flex-col items-center gap-1 border border-[#006691] hover:scale-[1.03] transition-all duration-200" style={{ background: '#006691' }}>
            <span className="bg-white text-success rounded-full p-1 shadow-md mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </span>
            <div className="text-white text-lg font-extrabold drop-shadow">{DAILY_GOAL} {unit}</div>
            <div className="text-white text-xs font-semibold tracking-wide uppercase">Meta diaria</div>
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
        <section className="max-w-2xl mx-auto rounded-2xl shadow-lg p-6 mb-4 bg-gradient-to-br from-[#e6f4f9] via-[#f8fcff] to-[#b6ffff] border border-accent/30">
          <h2 className="font-extrabold text-xl sm:text-2xl mb-6 text-[#003366] flex items-center gap-3 drop-shadow">
            <svg className="w-7 h-7 text-[#003366]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            Recordatorios inteligentes
          </h2>
          <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-4 w-full">
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg p-3 shadow border border-[#003366]/20 min-w-[120px] max-w-[180px] mx-auto">
              <label className="flex items-center gap-2 text-[#003366] font-semibold cursor-pointer text-base">
                <svg className="w-5 h-5 text-[#003366]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /></svg>
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={e => setReminderEnabled(e.target.checked)}
                  className="accent-[#003366] w-5 h-5 rounded focus:ring-2 focus:ring-[#003366] transition-all duration-150"
                />
                Activar
              </label>
              <span className="text-xs text-[#003366] mt-1">Notificaciones push</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg p-3 shadow border border-[#003366]/20 min-w-[120px] max-w-[180px] mx-auto">
              <label className="flex items-center gap-2 text-[#003366] font-semibold cursor-pointer mb-2 text-base">
                <svg className="w-5 h-5 text-[#003366]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                Frecuencia
              </label>
              <input
                type="range"
                min={10}
                max={180}
                step={5}
                value={reminderFreq}
                onChange={e => setReminderFreq(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none bg-[#003366]/20 focus:outline-none focus:ring-2 focus:ring-[#003366]/40 mb-1 slider-reminder"
                style={{ accentColor: '#003366' }}
              />
              <div className="flex justify-between w-full text-xs text-[#003366] font-semibold mb-1">
                <span>10 min</span>
                <span>180 min</span>
              </div>
              <span className="text-[#003366] font-bold text-xs">Cada {reminderFreq} minutos</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg p-3 shadow border border-[#003366]/20 min-w-[120px] max-w-[180px] mx-auto">
              <label className="flex items-center gap-2 text-[#003366] font-semibold cursor-pointer text-base">
                <svg className="w-5 h-5 text-[#003366]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <input
                  type="checkbox"
                  checked={reminderSound}
                  onChange={e => setReminderSound(e.target.checked)}
                  className="accent-[#003366] w-5 h-5 rounded focus:ring-2 focus:ring-[#003366] transition-all duration-150"
                />
                Sonido
              </label>
              <span className="text-xs text-[#003366] mt-1">Vibración/Sonido</span>
            </div>
          </div>
          <div className="text-xs text-[#003366] font-semibold text-center mt-4">Recibirás una notificación cada <span className="font-bold text-white bg-[#003366] px-1 rounded">{reminderFreq} minutos</span> si activas los recordatorios. Puedes activar sonido si lo deseas.</div>
        </section>
        {/* Fin visual de la tarjeta principal, igual que historial/estadísticas/logros */}
      </div>
    </div>
  );
}
