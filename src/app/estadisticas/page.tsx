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

  // Detectar modo oscuro y montaje en cliente
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bubbles, setBubbles] = useState<{
    left: string;
    width: string;
    height: string;
    bottom: string;
    animationDuration: string;
    animationDelay: string;
    delayClass: string;
  }[]>([]);
  useEffect(() => {
    setMounted(true);
    setDarkMode(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    // Generar burbujas solo en cliente
    const arr = Array.from({ length: 10 }, (_, i) => {
      return {
        left: `${10 + Math.random() * 80}%`,
        width: `${12 + Math.random() * 16}px`,
        height: `${12 + Math.random() * 16}px`,
        bottom: `-${Math.random() * 40}px`,
        animationDuration: `${3 + Math.random() * 3}s`,
        animationDelay: `${Math.random() * 2}s`,
        delayClass: i % 2 === 0 ? " delay-1000" : "",
      };
    });
    setBubbles(arr);
    return () => observer.disconnect();
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
  // Mostrar siempre la semana de lunes a domingo
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const hoy = new Date();
  // Calcular el lunes más reciente (o hoy si es lunes)
  const diaSemanaHoy = hoy.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
  // Ajustar para que 0 (domingo) sea 7
  const offsetLunes = diaSemanaHoy === 0 ? 6 : diaSemanaHoy - 1;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - offsetLunes);
  // Generar los 7 días de la semana (lunes a domingo)
  const semanaActual = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return d;
  });
  // Mapear los días a nombres y buscar el total correspondiente
  const xCategories = semanaActual.map((date, i) => {
    return diasSemana[i] + ' ' + date.getDate();
  });
  const dataPorDia = semanaActual.map((date) => {
    const key = date.toISOString().slice(0, 10);
    const encontrado = stats.find((s) => s.day === key);
    return encontrado ? encontrado.total : 0;
  });
  const chartOptions = {
    chart: {
      id: "line",
      toolbar: { show: false }, // Oculta los controles del gráfico
      zoom: { enabled: false }, // Opcional: desactiva el zoom
    },
    xaxis: {
      categories: xCategories,
      title: { text: 'Día de la semana', style: { color: darkMode ? "var(--color-accent)" : "var(--color-primary)" } },
      labels: {
        style: { colors: darkMode ? "var(--color-accent)" : "var(--color-primary)" },
        rotate: -30,
        fontSize: '14px',
      },
    },
    yaxis: {
      min: 0,
      max: DAILY_GOAL,
      tickAmount: 5,
      title: { text: 'ml', style: { color: darkMode ? "var(--color-accent)" : "var(--color-primary)" } },
      labels: {
        style: { colors: darkMode ? "var(--color-accent)" : "var(--color-primary)" },
        fontSize: '14px',
      },
    },
    stroke: { curve: "smooth" as const, width: 4 },
    colors: [darkMode ? "var(--color-accent)" : "var(--color-primary)"],
    dataLabels: { enabled: true, style: { fontSize: '14px' } },
    grid: { borderColor: darkMode ? "var(--color-bg-card-dark)" : "var(--color-bg-card)" },
    markers: { size: 6, colors: [darkMode ? "var(--color-accent)" : "var(--color-primary)"], strokeColors: '#fff', strokeWidth: 2 },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} ml`,
      },
    },
  };
  const chartSeries = [
    {
      name: "Consumo (ml)",
      data: dataPorDia,
    },
  ];

  return (
    <div className="min-h-screen text-[var(--color-text)]" style={{ background: '#f7fafc' }}>
      <AppHeader />
      <main className="max-w-3xl mx-auto p-4 mt-6">
        <h1 className="text-2xl font-bold mb-6 text-primary">Estadísticas</h1>
        <div className="bg-[var(--color-white)] rounded-xl shadow-lg p-6 mb-6">
          {/* Animación de burbujas eliminada */}
          <h2 className="font-bold text-lg sm:text-2xl mb-2 sm:mb-4 text-center text-primary dark:text-accent drop-shadow">
            Consumo Semanal
          </h2>
          <div className="mb-4 sm:mb-6">
            <div className="relative h-[200px] sm:h-[320px] flex items-center justify-center">
              {mounted && last7.length > 0 ? (
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
                    height={mounted && typeof window !== "undefined" && window.innerWidth < 640 ? 180 : 300}
                  />
                </div>
              ) : (
                <div className="z-10 text-center text-muted dark:text-accent py-8 sm:py-12 w-full font-semibold">
                  Sin datos suficientes para mostrar el gráfico.
                </div>
              )}
            </div>
          </div>
          <section className="container-responsive w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-4">
            {/* Tarjeta: Días registrados */}
            <div className="rounded shadow p-4 text-center transition-colors" style={{ background: '#006691' }}>
              <div className="text-white text-xl font-bold">{stats.length}</div>
              <div className="text-white text-xs font-semibold">Días registrados</div>
            </div>
            {/* Tarjeta: Promedio 7 días */}
            <div className="rounded shadow p-4 text-center transition-colors" style={{ background: '#006691' }}>
              <div className="text-white text-xl font-bold">{avg}ml</div>
              <div className="text-white text-xs font-semibold">Promedio 7 días</div>
            </div>
            {/* Tarjeta: Mejor día */}
            <div className="rounded shadow p-4 text-center transition-colors" style={{ background: '#006691' }}>
              <div className="text-white text-xl font-bold">{best}ml</div>
              <div className="text-white text-xs font-semibold">Mejor día</div>
            </div>
            {/* Tarjeta: Meta diaria */}
            <div className="rounded shadow p-4 text-center transition-colors" style={{ background: '#006691' }}>
              <div className="text-white text-xl font-bold">{userGoal ?? 2000}ml</div>
              <div className="text-white text-xs font-semibold">Meta diaria</div>
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
