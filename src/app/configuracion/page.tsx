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
  const [activity, setActivity] = useState("");
  const [climate, setClimate] = useState("");
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

  const fetchGoal = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_goals")
      .select("daily_goal")
      .eq("user_id", user.id)
      .single();
    if (data) setGoal(data.daily_goal);
    else setGoal(defaultGoal);
  }, [user]);

  useEffect(() => {
    if (user) fetchGoal();
  }, [user, fetchGoal]);

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
      activity,
      climate,
      updated_at: new Date().toISOString(),
    });
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
    <div className="min-h-screen bg-lightblue text-darkblue">
      <AppHeader />
      <main className="max-w-2xl mx-auto p-4 mt-6">
        <h1 className="text-2xl font-bold mb-6 text-darkblue">Configuración</h1>
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Usuario */}
          <section className="bg-[var(--color-white)] dark:bg-[#1e293b] rounded shadow p-4 mb-4 transition-colors">
            <h2 className="font-bold text-lg sm:text-xl mb-2 text-[var(--color-primary-dark)] dark:text-[var(--color-accent)] drop-shadow">
              Usuario
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="block font-semibold text-[var(--color-primary-dark)] dark:text-[var(--color-accent)]">
                Nombre de usuario:
              </label>
              {editName ? (
                <>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="border rounded px-3 py-2 w-48 text-[var(--color-primary-dark)] dark:text-[var(--color-accent)] font-bold bg-[var(--color-bg)] dark:bg-[#0f172a]"
                    maxLength={32}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="ml-2 bg-[var(--color-success)] text-white px-3 py-1 rounded"
                    disabled={savingName || !nameInput.trim()}
                  >
                    {savingName ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => setEditName(false)}
                    className="ml-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded"
                    disabled={savingName}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <span className="font-bold text-[var(--color-primary-dark)] dark:text-[var(--color-accent)] bg-primary/10 dark:bg-accent/10 rounded px-2 py-1">
                    {userName}
                  </span>
                  <button
                    onClick={() => setEditName(true)}
                    className="ml-2 bg-[var(--color-primary)] dark:bg-[var(--color-accent)] text-white px-3 py-1 rounded"
                  >
                    Editar
                  </button>
                </>
              )}
            </div>
          </section>
          {/* Preferencias de hidratación */}
          <section className="bg-[var(--color-white)] dark:bg-[#1e293b] rounded shadow p-4 mb-4 transition-colors">
            <h2 className="font-bold text-lg sm:text-xl mb-2 text-[var(--color-primary-dark)] dark:text-[var(--color-accent)] drop-shadow">
              Preferencias de hidratación
            </h2>
            <form
              className="flex flex-wrap gap-4 items-center w-full justify-between md:justify-start md:gap-x-8 md:gap-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="flex flex-col min-w-[120px]">
                <label className="block mb-1 font-semibold text-[var(--color-primary-dark)] dark:text-[var(--color-accent)]">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  min={30}
                  max={200}
                  value={weight || ""}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="border rounded px-3 py-2 w-28 text-center text-[var(--color-primary-dark)] dark:text-[var(--color-accent)] font-bold bg-[var(--color-bg)] dark:bg-[#0f172a]"
                />
              </div>
              <div className="flex flex-col min-w-[140px]">
                <label className="block mb-1 font-semibold text-[var(--color-primary-dark)] dark:text-[var(--color-accent)]">
                  Nivel de actividad
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="border rounded px-3 py-2 w-32 text-[var(--color-primary-dark)] dark:text-[var(--color-accent)] font-semibold bg-[var(--color-bg)] dark:bg-[#0f172a]"
                >
                  <option value="">Selecciona</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <div className="flex flex-col min-w-[120px]">
                <label className="block mb-1 font-semibold text-[var(--color-primary-dark)] dark:text-[var(--color-accent)]">
                  Clima
                </label>
                <select
                  value={climate}
                  onChange={(e) => setClimate(e.target.value)}
                  className="border rounded px-3 py-2 w-32 text-[var(--color-primary-dark)] dark:text-[var(--color-accent)] font-semibold bg-[var(--color-bg)] dark:bg-[#0f172a]"
                >
                  <option value="">Selecciona</option>
                  <option value="templado">Templado</option>
                  <option value="calido">Cálido</option>
                  <option value="frio">Frío</option>
                </select>
              </div>
              <div className="flex flex-col min-w-[140px]">
                <label className="block mb-1 font-semibold text-[var(--color-primary-dark)] dark:text-[var(--color-accent)]">
                  Meta diaria (ml)
                </label>
                <input
                  type="number"
                  min={500}
                  max={5000}
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value))}
                  className="border rounded px-3 py-2 w-28 text-center text-[var(--color-primary-dark)] dark:text-[var(--color-accent)] font-bold bg-[var(--color-bg)] dark:bg-[#0f172a]"
                />
                <div className="text-xs text-[var(--color-primary)] dark:text-[var(--color-accent)] mt-1 font-semibold">
                  Sugerencia: <b>{suggestedGoal} ml</b>
                </div>
              </div>
              <div className="flex flex-col justify-end min-w-[120px] md:mt-6">
                <button
                  type="submit"
                  className="bg-[var(--color-primary)] dark:bg-[var(--color-accent)] text-white px-4 py-2 rounded w-full md:w-auto"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </section>
          {/* Integraciones */}
          <section className="bg-[var(--color-white)] dark:bg-[#1e293b] rounded shadow p-4 mb-4 transition-colors">
            <h2 className="font-bold text-lg sm:text-xl mb-2 text-[var(--color-primary-dark)] dark:text-[var(--color-accent)] drop-shadow">
              Integración con Dispositivos
            </h2>
            <div className="mb-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⌚</span>
                <div>
                  <div className="font-semibold text-[var(--color-primary-dark)] dark:text-[var(--color-accent)]">
                    Apple Watch
                  </div>
                  <div className="text-xs text-[var(--color-primary)] dark:text-[var(--color-accent)] font-semibold">
                    Próximamente podrás registrar tu consumo desde tu reloj.
                  </div>
                </div>
                <button className="ml-auto bg-primary/10 dark:bg-accent/10 text-[var(--color-primary-dark)] dark:text-[var(--color-accent)] px-3 py-1 rounded cursor-not-allowed font-semibold">
                  Próximamente
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍏</span>
                <div>
                  <div className="font-semibold text-[var(--color-primary-dark)] dark:text-[var(--color-accent)]">
                    Apple Health
                  </div>
                  <div className="text-xs text-[var(--color-primary)] dark:text-[var(--color-accent)] font-semibold">
                    Sincroniza tu hidratación con Apple Health en la app móvil.
                  </div>
                </div>
                <button className="ml-auto bg-primary/10 dark:bg-accent/10 text-[var(--color-primary-dark)] dark:text-[var(--color-accent)] px-3 py-1 rounded cursor-not-allowed font-semibold">
                  Próximamente
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <div className="font-semibold text-[var(--color-primary-dark)] dark:text-[var(--color-accent)]">
                    Google Fit
                  </div>
                  <div className="text-xs text-[var(--color-primary)] dark:text-[var(--color-accent)] font-semibold">
                    Sincroniza tu hidratación con Google Fit en la app móvil.
                  </div>
                </div>
                <button className="ml-auto bg-primary/10 dark:bg-accent/10 text-[var(--color-primary-dark)] dark:text-[var(--color-accent)] px-3 py-1 rounded cursor-not-allowed font-semibold">
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
