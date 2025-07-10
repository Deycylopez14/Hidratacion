"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/services/supabaseClient";
import AppHeader from "../components/AppHeader";

const defaultGoal = 2000;

// Tipos explícitos para usuario
interface User {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; name?: string };
}

export default function Configuracion() {
  const [user, setUser] = useState<User | null>(null);
  const [goal, setGoal] = useState(defaultGoal);
  const [weight, setWeight] = useState<number | undefined>();
  const [age, setAge] = useState<number | undefined>();
  const [gender, setGender] = useState<string>("");
  const [activity, setActivity] = useState("");
  const [climate, setClimate] = useState("");
  const [sleepTime, setSleepTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [unit, setUnit] = useState("");
  const [reminderType, setReminderType] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
    });
  }, []);

  // Cargar todos los datos del usuario
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_goals")
      .select("daily_goal, weight, age, gender, activity, climate, sleep_time, wake_time, unit, reminder_type")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setGoal(data.daily_goal ?? defaultGoal);
      setWeight(data.weight ?? undefined);
      setAge(data.age ?? undefined);
      setGender(data.gender ?? "");
      setActivity(data.activity ?? "");
      setClimate(data.climate ?? "");
      setSleepTime(data.sleep_time ?? "");
      setWakeTime(data.wake_time ?? "");
      setUnit(data.unit ?? "ml");
      setReminderType(data.reminder_type ?? "notificacion");
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user, fetchUserData]);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserName(
          data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email ||
            "Usuario"
        );
        setNameInput(
          data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            ""
        );
      }
    }
    fetchUser();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await supabase.from("user_goals").upsert({
      user_id: user?.id,
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
    // Guardar en localStorage también
    if (typeof window !== "undefined") {
      localStorage.setItem("hydration_nickname", userName);
      localStorage.setItem("hydration_weight", String(weight ?? ""));
      localStorage.setItem("hydration_age", String(age ?? ""));
      localStorage.setItem("hydration_gender", gender);
      localStorage.setItem("hydration_goal", String(goal));
      localStorage.setItem("hydration_activity", activity);
      localStorage.setItem("hydration_climate", climate);
      localStorage.setItem("hydration_sleep_time", sleepTime);
      localStorage.setItem("hydration_wake_time", wakeTime);
      localStorage.setItem("hydration_unit", unit);
      localStorage.setItem("hydration_reminder_type", reminderType);
    }
    setLoading(false);
  };

  const handleSaveName = async () => {
    setSavingName(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: nameInput },
    });
    if (!error) {
      setUserName(nameInput);
      setEditName(false);
    }
    setSavingName(false);
  };

  // Cálculo automático sugerido
  const suggestedGoal = weight ? Math.round(weight * 35) : defaultGoal;

  return (
    <div className="min-h-screen w-full text-primary transition-colors relative overflow-hidden" style={{ background: '#f7fafc' }}>
      <AppHeader />
      <main className="max-w-2xl mx-auto p-4 mt-6">
        <h1 className="text-2xl font-bold mb-6 text-primary">Configuración</h1>
        <div className="container-responsive w-full rounded shadow p-4 sm:p-6 mt-4 sm:mt-8 relative z-10 overflow-hidden" style={{ background: '#F8FCFF' }}>
          {/* Usuario */}
          <section className="rounded shadow p-4 mb-4 transition-colors" style={{ background: 'var(--color-card-section)' }}>
            <h2 className="font-bold text-lg sm:text-xl mb-2 text-primary dark:text-accent drop-shadow">
              Usuario
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="block font-semibold text-primary dark:text-accent">
                Nombre de usuario:
              </label>
              {editName ? (
                <>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="border rounded px-3 py-2 w-48 text-primary dark:text-accent font-bold bg-[var(--color-background)] dark:bg-[var(--color-bg-light-2)]"
                    maxLength={32}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="ml-2 bg-success text-white px-3 py-1 rounded shadow"
                    disabled={savingName || !nameInput.trim()}
                  >
                    {savingName ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => setEditName(false)}
                    className="ml-1 bg-muted text-primary px-2 py-1 rounded shadow"
                    disabled={savingName}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <span className="font-bold text-primary" style={{ background: 'var(--color-card-divider)', borderRadius: '0.375rem', padding: '0.25rem 0.5rem' }}>
                    {userName}
                  </span>
                  <button
                    onClick={() => setEditName(true)}
                    className="ml-2 bg-primary text-white px-3 py-1 rounded shadow"
                  >
                    Editar
                  </button>
                </>
              )}
            </div>
          </section>
          {/* Preferencias de hidratación */}
          <section className="rounded shadow p-4 mb-4 transition-colors" style={{ background: 'var(--color-card-section)' }}>
            <h2 className="font-bold text-lg sm:text-xl mb-2 text-primary dark:text-accent drop-shadow">
              Preferencias de hidratación
            </h2>
            <form
              className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              {/* Primera fila: Peso, Edad, Meta diaria */}
              <div className="flex flex-col min-w-[120px] items-center">
                <label className="block mb-1 font-semibold text-primary dark:text-accent text-center">Peso (kg)</label>
                <div className="flex flex-col items-center w-full">
                  <input type="range" min={30} max={200} value={weight || 30} onChange={e => setWeight(Number(e.target.value))} className="w-28 accent-[var(--color-primary)]" />
                  <span className="mt-1 text-[var(--color-primary)] font-bold">{weight || 30} kg</span>
                </div>
              </div>
              <div className="flex flex-col min-w-[120px] items-center">
                <label className="block mb-1 font-semibold text-primary dark:text-accent text-center">Edad</label>
                <div className="flex flex-col items-center w-full">
                  <input type="range" min={10} max={100} value={age || 10} onChange={e => setAge(Number(e.target.value))} className="w-28 accent-[var(--color-primary)]" />
                  <span className="mt-1 text-[var(--color-primary)] font-bold">{age || 10} años</span>
                </div>
              </div>
              <div className="flex flex-col min-w-[140px] md:col-span-2 items-center">
                <label className="block mb-1 font-semibold text-primary dark:text-accent text-center">Meta diaria (ml)</label>
                <div className="flex flex-col items-center w-full">
                  <input type="range" min={500} max={5000} step={50} value={goal} onChange={e => setGoal(Number(e.target.value))} className="w-28 accent-[var(--color-primary)]" />
                  <span className="mt-1 text-[var(--color-primary)] font-bold">{goal} ml</span>
                </div>
                <div className="text-xs text-[var(--color-primary)] dark:text-accent mt-1 font-semibold text-center">Sugerencia: <b>{suggestedGoal} ml</b></div>
              </div>
              {/* Segunda fila: Género, Nivel de actividad, Clima */}
              <div className="flex flex-col min-w-[120px] items-center">
                <label className="block mb-1 font-semibold text-primary dark:text-accent text-center">Género</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="border-[var(--color-primary)] border-2 rounded px-3 py-2 w-32 text-[var(--color-primary)] font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-center">
                  <option value="">Selecciona</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="flex flex-col min-w-[140px] items-center">
                <label className="block mb-1 font-semibold text-primary dark:text-accent text-center">Nivel de actividad</label>
                <select value={activity} onChange={(e) => setActivity(e.target.value)} className="border-[var(--color-primary)] border-2 rounded px-3 py-2 w-32 text-[var(--color-primary)] font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-center">
                  <option value="">Selecciona</option>
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                </select>
              </div>
              <div className="flex flex-col min-w-[120px] items-center">
                <label className="block mb-1 font-semibold text-primary dark:text-accent text-center">Clima</label>
                <select value={climate} onChange={(e) => setClimate(e.target.value)} className="border-[var(--color-primary)] border-2 rounded px-3 py-2 w-32 text-[var(--color-primary)] font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-center">
                  <option value="">Selecciona</option>
                  <option value="templado">Templado</option>
                  <option value="caluroso">Caluroso</option>
                  <option value="frio">Frío</option>
                </select>
              </div>
              {/* Tercera fila: Hora de dormir, Hora de despertar (mantenerlas en la siguiente línea) */}
              <div className="flex flex-col min-w-[120px] items-center">
                <label className="block mb-1 font-semibold text-primary dark:text-accent text-center">Hora de dormir</label>
                <input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)} className="border-[var(--color-primary)] border-2 rounded px-3 py-2 w-28 text-center text-[var(--color-primary)] font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div className="flex flex-col min-w-[120px] items-center">
                <label className="block mb-1 font-semibold text-primary dark:text-accent text-center">Hora de despertar</label>
                <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="border-[var(--color-primary)] border-2 rounded px-3 py-2 w-28 text-center text-[var(--color-primary)] font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              {/* Tercera fila: Unidad de medida, Tipo de recordatorio, Botón Guardar */}
              <div className="flex flex-col min-w-[120px] items-center mb-4 md:mb-0">
                <label className="block mb-1 font-semibold text-primary dark:text-accent text-center">Unidad de medida</label>
                <select value={unit} onChange={e => setUnit(e.target.value)} className="border-[var(--color-primary)] border-2 rounded px-3 py-2 w-32 text-[var(--color-primary)] font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-center">
                  <option value="ml">ml</option>
                  <option value="oz">oz</option>
                </select>
              </div>
              <div className="flex flex-col min-w-[120px] items-center">
                <label className="block mb-1 font-semibold text-primary dark:text-accent text-center">Tipo de recordatorio</label>
                <select value={reminderType} onChange={e => setReminderType(e.target.value)} className="border-[var(--color-primary)] border-2 rounded px-3 py-2 w-32 text-[var(--color-primary)] font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-center">
                  <option value="notificacion">Notificación</option>
                  <option value="sonido">Sonido</option>
                </select>
              </div>
            {/* Fila separada para el botón Guardar */}
            <div className="col-span-full flex flex-col justify-end w-full mt-2">
              <button type="submit" className="bg-[var(--color-primary)] text-white font-semibold px-4 py-2 rounded w-full border border-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors text-base" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
            </form>
          </section>
          {/* Integraciones */}
          <section className="rounded shadow p-4 mb-4 transition-colors" style={{ background: 'var(--color-card-section)' }}>
            <h2 className="font-bold text-lg sm:text-xl mb-2 text-primary drop-shadow">
              Integración con Dispositivos
            </h2>
            <div className="mb-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⌚</span>
                <div>
                  <div className="font-semibold text-primary">
                    Apple Watch
                  </div>
                  <div className="text-xs text-muted font-semibold">
                    Próximamente podrás registrar tu consumo desde tu reloj.
                  </div>
                </div>
                <button className="ml-auto bg-white text-primary border border-primary px-3 py-1 rounded cursor-not-allowed font-semibold">
                  Próximamente
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍏</span>
                <div>
                  <div className="font-semibold text-primary">
                    Apple Health
                  </div>
                  <div className="text-xs text-muted font-semibold">
                    Sincroniza tu hidratación con Apple Health en la app móvil.
                  </div>
                </div>
                <button className="ml-auto bg-white text-primary border border-primary px-3 py-1 rounded cursor-not-allowed font-semibold">
                  Próximamente
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <div className="font-semibold text-primary">
                    Google Fit
                  </div>
                  <div className="text-xs text-muted font-semibold">
                    Sincroniza tu hidratación con Google Fit en la app móvil.
                  </div>
                </div>
                <button className="ml-auto bg-white text-primary border border-primary px-3 py-1 rounded cursor-not-allowed font-semibold">
                  Próximamente
                </button>
              </div>
            </div>
            <div className="text-xs text-[var(--color-primary)] dark:text-[var(--color-accent)] mt-2 font-semibold">
              Estas funciones estarán disponibles en la versión móvil nativa.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
