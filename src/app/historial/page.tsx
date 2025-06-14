"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/services/supabaseClient";
import AppHeader from "../components/AppHeader";

// Tipos explícitos para usuario y registros
interface User {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
}
interface HydrationRecord {
  amount: number;
  created_at: string;
  type?: string;
}

export default function Historial() {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<HydrationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
    });
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("hydration")
      .select("amount,created_at,type")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    setRecords((data as HydrationRecord[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchRecords();
  }, [user, fetchRecords]);

  const exportCSV = () => {
    const csv = [
      'Fecha y Hora,Cantidad (ml)',
      ...records.map(r => `${new Date(r.created_at).toLocaleString()},${r.amount}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial_hidratacion.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const deleteAllHistory = async () => {
    if (!user) return;
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar todo tu historial de hidratación? Esta acción no se puede deshacer.");
    if (!confirmDelete) return;
    setLoading(true);
    await supabase.from("hydration").delete().eq("user_id", user.id);
    await fetchRecords();
    setLoading(false);
  };

  const deleteRecord = async (created_at: string) => {
    if (!user) return;
    const confirmDelete = window.confirm("¿Eliminar este registro?");
    if (!confirmDelete) return;
    setLoading(true);
    await supabase.from("hydration").delete().eq("user_id", user.id).eq("created_at", created_at);
    await fetchRecords();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-lightblue text-darkblue">
      <AppHeader />
      <main className="max-w-2xl mx-auto p-4 mt-6">
        <h1 className="text-2xl font-bold mb-6 text-darkblue">Historial</h1>
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
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
          <div className="relative h-[100px] sm:h-[120px] flex items-center justify-center mb-4 sm:mb-6">
            <div className="absolute inset-0 flex items-end justify-center pointer-events-none select-none">
              {/* Fondo animado de olas */}
              <svg width="100%" height="100%" viewBox="0 0 500 120" preserveAspectRatio="none" className="w-full h-16 sm:h-32 animate-wave-slow opacity-60">
                <path d="M0,40 Q125,80 250,40 T500,40 V120 H0 Z" fill="#3b82f6" />
              </svg>
              <svg width="100%" height="100%" viewBox="0 0 500 120" preserveAspectRatio="none" className="w-full h-10 sm:h-24 animate-wave-fast opacity-40 -mt-2 sm:-mt-4">
                <path d="M0,30 Q125,70 250,30 T500,30 V120 H0 Z" fill="#60a5fa" />
              </svg>
            </div>
            <div className="z-10 text-center w-full">
              <h2 className="font-bold text-lg sm:text-2xl text-primary-dark drop-shadow mb-1 sm:mb-2">Historial de Registros</h2>
              <p className="text-xs sm:text-base text-primary font-semibold">Consulta y exporta tus registros de hidratación.</p>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Historial de Registros</h2>
            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <span>↓</span> Exportar
              </button>
              <button
                onClick={deleteAllHistory}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
                disabled={loading}
              >
                🗑 Eliminar todo
              </button>
            </div>
          </div>
          <section className="container-responsive w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-4">
            <div className="bg-white dark:bg-[#1e293b] rounded shadow p-4 text-center transition-colors">
              <div className="text-blue-600 dark:text-blue-300 text-xl font-bold">{records.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">Registros totales</div>
            </div>
            <div className="bg-white dark:bg-[#1e293b] rounded shadow p-4 text-center transition-colors">
              <div className="text-green-600 dark:text-green-300 text-xl font-bold">{records.reduce((a, r) => a + r.amount, 0)}ml</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">Total consumido</div>
            </div>
            <div className="bg-white dark:bg-[#1e293b] rounded shadow p-4 text-center transition-colors">
              <div className="text-purple-600 dark:text-purple-300 text-xl font-bold">{records.length ? Math.max(...records.map(r => r.amount)) : 0}ml</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">Mayor registro</div>
            </div>
            <div className="bg-white dark:bg-[#1e293b] rounded shadow p-4 text-center transition-colors">
              <div className="text-gray-700 dark:text-gray-100 text-xl font-bold">{records.length ? new Date(records[0].created_at).toLocaleDateString() : '--'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">Último registro</div>
            </div>
          </section>
          {loading ? (
            <div className="text-center text-gray-400 py-12">Cargando...</div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <span className="text-5xl mb-2">💧</span>
              <span>No hay registros aún. ¡Comienza a registrar tu consumo de agua!</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-center">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-primary-dark font-bold bg-primary/10 rounded-tl-lg">Fecha y Hora</th>
                    <th className="px-4 py-2 text-primary-dark font-bold bg-primary/10">Cantidad (ml)</th>
                    <th className="px-4 py-2 text-primary-dark font-bold bg-primary/10 rounded-tr-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i} className="even:bg-lightblue/40 odd:bg-white border-b border-lightblue hover:bg-aqua/20 transition-colors">
                      <td className="border-x px-4 py-2 text-primary-dark font-semibold whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="border-x px-4 py-2 text-primary font-bold">{r.amount}</td>
                      <td className="border-x px-4 py-2">
                        <button
                          onClick={() => deleteRecord(r.created_at)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow text-sm"
                          disabled={loading}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
