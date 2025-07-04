"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/services/supabaseClient";
import dynamic from "next/dynamic";
import AppHeader from "../components/AppHeader";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

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

export default function Estadisticas() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<{ day: string; total: number }[]>([]);
  const [best, setBest] = useState(0);
  const [avg, setAvg] = useState(0);
  const [userGoal, setUserGoal] = useState<number | null>(null);

  // Detectar modo oscuro
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDarkMode(document.documentElement.classList.contains("dark"));
      const observer = new MutationObserver(() => {
        setDarkMode(document.documentElement.classList.contains("dark"));
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
    });
  }, []);

  const fetchStats = useCallback(async () => {
    const { data } = await supabase
      .from("hydration")
      .select("amount,created_at")
      .eq("user_id", user?.id);
    if (data) {
      const days: { [key: string]: number } = {};
      (data as HydrationData[]).forEach((d) => {
        const day = d.created_at.slice(0, 10);
        days[day] = (days[day] || 0) + d.amount;
      });
      const arr = Object.entries(days)
        .map(([day, total]) => ({ day, total }))
        .sort((a, b) => a.day.localeCompare(b.day));
      setStats(arr);
      const vals = arr.map((d) => d.total);
      setAvg(
        vals.length
          ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
          : 0
      );
      setBest(vals.length ? Math.max(...vals) : 0);
    }
  }, [user]);

  const fetchGoal = useCallback(async () => {
    const { data } = await supabase
      .from("user_goals")
      .select("daily_goal")
      .eq("user_id", user?.id)
      .single();
    if (data) setUserGoal(data.daily_goal);
    else setUserGoal(null);
  }, [user]);

  useEffect(() => {
    if (user) fetchStats();
  }, [user, fetchStats]);
  useEffect(() => {
    if (user) fetchGoal();
  }, [user, fetchGoal]);

  // Para mostrar solo los últimos 7 días
  const last7 = stats.slice(-7);
  const DAILY_GOAL = userGoal ?? 2000;
  const chartOptions = {
    chart: { id: "line" },
    xaxis: {
      categories: last7.map((s) => {
        const date = new Date(s.day);
        return date.getDate();
      }),
    },
    yaxis: {
      min: 0,
      max: DAILY_GOAL,
      tickAmount: 5,
    },
    stroke: { curve: "smooth" as const },
    colors: [darkMode ? "var(--color-accent)" : "var(--color-primary)"],
    dataLabels: { enabled: true },
    grid: { borderColor: darkMode ? "var(--color-bg-card-dark)" : "var(--color-bg-card)" },
  };
  const chartSeries = [
    {
      name: "Consumo (ml)",
      data: last7.map((s) => s.total),
    },
  ];

  return (
    <div className="min-h-screen bg-lightblue text-darkblue">
      <AppHeader />
      <main className="max-w-3xl mx-auto p-4 mt-6">
        <h1 className="text-2xl font-bold mb-6 text-darkblue">Estadísticas</h1>
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Animación de burbujas SOLO en cliente para evitar hydration mismatch */}
          {typeof window !== "undefined" && (
            <div className="absolute inset-0 pointer-events-none select-none z-0">
              {[...Array(10)].map((_, i) => (
                <span
                  key={i}
                  className={`absolute rounded-full bg-[var(--color-accent)]/30 animate-bubble${
                    i % 2 === 0 ? " delay-1000" : ""
                  }`}
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
          <h2 className="font-bold text-lg sm:text-2xl mb-2 sm:mb-4 text-center text-[var(--color-primary)] dark:text-[var(--color-accent)] drop-shadow">
            Consumo Semanal
          </h2>
          <div className="mb-4 sm:mb-6">
            <div className="relative h-[200px] sm:h-[320px] flex items-center justify-center">
              <div className="absolute inset-0 flex items-end justify-center pointer-events-none select-none">
                {/* Fondo animado de olas */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 500 120"
                  preserveAspectRatio="none"
                  className="w-full h-24 sm:h-40 animate-wave-slow opacity-60"
                >
                  <path
                    d="M0,40 Q125,80 250,40 T500,40 V120 H0 Z"
                    fill="var(--color-primary)"
                    className="dark:fill-[var(--color-accent)]"
                  />
                </svg>
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 500 120"
                  preserveAspectRatio="none"
                  className="w-full h-16 sm:h-32 animate-wave-fast opacity-40 -mt-4 sm:-mt-8"
                >
                  <path
                    d="M0,30 Q125,70 250,30 T500,30 V120 H0 Z"
                    fill="var(--color-primary)"
                    className="dark:fill-[var(--color-accent)]"
                  />
                </svg>
              </div>
              {typeof window !== "undefined" && last7.length > 0 ? (
                <div className="z-10 w-full">
                  <Chart
                    options={{
                      ...chartOptions,
                      colors: [darkMode ? "var(--color-accent)" : "var(--color-primary)"],
                      grid: { borderColor: darkMode ? "var(--color-bg-card-dark)" : "var(--color-bg-card)" },
                      xaxis: {
                        ...chartOptions.xaxis,
                        labels: {
                          style: { colors: darkMode ? "var(--color-accent)" : "var(--color-primary)" },
                        },
                      },
                      yaxis: {
                        ...chartOptions.yaxis,
                        labels: {
                          style: { colors: darkMode ? "var(--color-accent)" : "var(--color-primary)" },
                        },
                      },
                    }}
                    series={chartSeries}
                    type="line"
                    height={typeof window !== "undefined" && window.innerWidth < 640 ? 180 : 300}
                  />
                </div>
              ) : (
                <div className="z-10 text-center text-[var(--color-text-muted)] dark:text-[var(--color-accent)] py-8 sm:py-12 w-full font-semibold">
                  Sin datos suficientes para mostrar el gráfico.
                </div>
              )}
            </div>
          </div>
          <section className="container-responsive w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-4">
            <div className="bg-white dark:bg-[#1e293b] rounded shadow p-4 text-center transition-colors">
              <div className="text-blue-600 dark:text-blue-300 text-xl font-bold">{stats.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">Días registrados</div>
            </div>
            <div className="bg-white dark:bg-[#1e293b] rounded shadow p-4 text-center transition-colors">
              <div className="text-green-600 dark:text-green-300 text-xl font-bold">{avg}ml</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">Promedio 7 días</div>
            </div>
            <div className="bg-white dark:bg-[#1e293b] rounded shadow p-4 text-center transition-colors">
              <div className="text-purple-600 dark:text-purple-300 text-xl font-bold">{best}ml</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">Mejor día</div>
            </div>
            <div className="bg-white dark:bg-[#1e293b] rounded shadow p-4 text-center transition-colors">
              <div className="text-gray-700 dark:text-gray-100 text-xl font-bold">{userGoal ?? 2000}ml</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">Meta diaria</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Agrega animaciones de olas y burbujas en globals.css
/*
@keyframes wave-slow {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes wave-fast {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}
.animate-wave-slow {
  animation: wave-slow 8s linear infinite;
}
.animate-wave-fast {
  animation: wave-fast 4s linear infinite;
}

@keyframes bubble {
  0% { transform: translateY(0) scale(1); opacity: 0.7; }
  80% { opacity: 0.8; }
  100% { transform: translateY(-320px) scale(1.2); opacity: 0; }
}
.animate-bubble {
  animation: bubble 4s linear infinite;
}
.animate-bubble.delay-1000 {
  animation-delay: 1s;
}
*/
