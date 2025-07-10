"use client";
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/services/supabaseClient";
import AppHeader from "../components/AppHeader";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'xlsx' | 'pdf'>('csv');
  // Estado para evitar hydration mismatch con burbujas
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
    // Generar burbujas solo en cliente
    const arr = Array.from({ length: 10 }, (_, i) => {
      return {
        left: `${10 + Math.random() * 80}%`,
        width: `${12 + Math.random() * 16}px`,
        height: `${12 + Math.random() * 16}px`,
        bottom: `-${Math.random() * 40}px`,
        animationDuration: `${3 + Math.random() * 3}s`,
        animationDelay: `${Math.random() * 2}s`,
        delayClass: i % 2 === 0 ? ' delay-1000' : '',
      };
    });
    setBubbles(arr);
  }, []);

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

  const handleExport = () => {
    // Formateo consistente para exportar: dd-MM-yy HH:mm
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatFechaHora = (dateStr: string) => {
      const fecha = new Date(dateStr);
      const fechaStr = `${pad(fecha.getDate())}-${pad(fecha.getMonth() + 1)}-${fecha.getFullYear().toString().slice(-2)}`;
      const horaStr = `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
      return `${fechaStr} | ${horaStr}`;
    };
    if (exportFormat === 'csv') {
      const csv = [
        'Fecha y Hora,ml',
        ...records.map(r => `${formatFechaHora(r.created_at)},${r.amount}`)
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'historial_hidratacion.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (exportFormat === 'json') {
      const json = JSON.stringify(records, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'historial_hidratacion.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (exportFormat === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(records.map(r => ({
        'Fecha y Hora': formatFechaHora(r.created_at),
        'ml': r.amount
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Historial');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'historial_hidratacion.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (exportFormat === 'pdf') {
      const doc = new jsPDF();
      doc.text('Historial de Hidratación', 14, 16);
      const tableData = records.map(r => [
        formatFechaHora(r.created_at),
        r.amount
      ]);
      autoTable(doc, {
        head: [['Fecha y Hora', 'ml']],
        body: tableData,
        startY: 22,
        theme: 'striped',
        headStyles: { fillColor: [80, 199, 236] },
      });
      doc.save('historial_hidratacion.pdf');
    }
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
    <div className="min-h-screen text-[var(--color-text)]" style={{ background: '#f7fafc' }}>
      <AppHeader />
      <main className="max-w-2xl mx-auto p-4 mt-6">
        <h1 className="text-2xl font-bold mb-6 text-primary">Historial</h1>
        <div className="bg-[var(--color-white)] rounded-xl shadow-lg p-6 mb-6">
          {/* Animación de burbujas SOLO en cliente para evitar hydration mismatch */}
          {mounted && (
            <div className="absolute inset-0 pointer-events-none select-none z-0">
              {bubbles.map((b, i) => (
                <span
                  key={i}
                  className={`absolute rounded-full bg-primary/30 animate-bubble${b.delayClass}`}
                  style={{
                    left: b.left,
                    width: b.width,
                    height: b.height,
                    bottom: b.bottom,
                    animationDuration: b.animationDuration,
                    animationDelay: b.animationDelay,
                  }}
                />
              ))}
            </div>
          )}
          <div className="relative h-[100px] sm:h-[120px] flex items-center justify-center mb-4 sm:mb-6">
            <div className="z-10 text-center w-full">
            <h2 className="font-bold text-lg sm:text-2xl text-primary drop-shadow mb-1 sm:mb-2">Historial de Registros</h2>
              <p className="text-xs sm:text-base text-primary font-semibold">Consulta y exporta tus registros de hidratación.</p>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            {/* <h2 className="font-bold text-lg">Historial de Registros</h2> */}
          </div>
          <section className="container-responsive w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-4">
            <div className="bg-[#006691] text-white rounded-xl shadow-lg p-4 text-center transition-colors font-bold">
              <div className="text-white text-xl font-bold">{records.length}</div>
              <div className="text-xs text-white/80 font-semibold">Registros totales</div>
            </div>
            <div className="bg-[#006691] text-white rounded-xl shadow-lg p-4 text-center transition-colors font-bold">
              <div className="text-white text-xl font-bold">{records.reduce((a, r) => a + r.amount, 0).toLocaleString()} ml</div>
              <div className="text-xs text-white/80 font-semibold">Total consumido</div>
            </div>
            <div className="bg-[#006691] text-white rounded-xl shadow-lg p-4 text-center transition-colors font-bold">
              <div className="text-white text-xl font-bold">{records.length ? Math.max(...records.map(r => r.amount)).toLocaleString() : 0} ml</div>
              <div className="text-xs text-white/80 font-semibold">Mayor registro</div>
            </div>
            <div className="bg-[#006691] text-white rounded-xl shadow-lg p-4 text-center transition-colors font-bold">
              <div className="text-white text-xl font-bold">
                {records.length ? (() => {
                  const fecha = new Date(records[0].created_at);
                  const pad = (n: number) => n.toString().padStart(2, '0');
                  return `${pad(fecha.getDate())}-${pad(fecha.getMonth() + 1)}-${fecha.getFullYear().toString().slice(-2)}`;
                })() : '--'}
              </div>
              <div className="text-xs text-white/80 font-semibold">Último registro</div>
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
            <div>
              <div
                className="w-full max-h-[340px] overflow-x-auto overflow-y-auto rounded-2xl shadow-xl bg-gradient-to-br from-bg-light-2 via-white to-accent/10 scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <table className="min-w-full text-center border-separate border-spacing-2 text-base font-[Comic_Sans_MS,cursive,sans-serif]" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '33.33%' }} />
                    <col style={{ width: '33.33%' }} />
                    <col style={{ width: '33.33%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="px-4 py-3 rounded-tl-2xl bg-[#006691] text-white font-bold text-lg border-2 border-[var(--color-accent)]">Fecha y Hora</th>
                      <th className="px-4 py-3 bg-[#006691] text-white font-bold text-lg border-2 border-[var(--color-accent)]">ml</th>
                      <th className="px-4 py-3 rounded-tr-2xl bg-[#006691] text-white font-bold text-lg border-2 border-[var(--color-accent)]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => {
                      const fecha = new Date(r.created_at);
                      // Formato: dd-MM-yy | HH:mm
                      const pad = (n: number) => n.toString().padStart(2, '0');
                      const fechaStr = `${pad(fecha.getDate())}-${pad(fecha.getMonth() + 1)}-${fecha.getFullYear().toString().slice(-2)}`;
                      const horaStr = `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
                      const fechaHora = `${fechaStr} | ${horaStr}`;
                      return (
                        <tr key={i} className="rounded-2xl">
                          <td className="px-4 py-3 bg-[#006691] border-2 border-[var(--color-accent)] rounded-l-2xl text-white font-bold text-center align-middle">
                            {fechaHora}
                          </td>
                          <td className="px-4 py-3 bg-[#006691] border-2 border-[var(--color-accent)] text-white font-bold text-base rounded-none text-center align-middle">
                            {r.amount.toLocaleString()} ml
                          </td>
                          <td className="px-4 py-3 bg-[#006691] border-2 border-[var(--color-accent)] rounded-r-2xl text-center align-middle cursor-pointer select-none text-white font-bold transition-colors hover:bg-[#005377]"
                              onClick={() => !loading && deleteRecord(r.created_at)}
                              title="Eliminar registro">
                            Eliminar
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-10 mb-0 z-20 relative bg-transparent shadow-none border-0 p-0 w-full">
                <div className="flex-1 w-full">
                  <select
                    id="export-format"
                    className="border-2 border-accent rounded-lg px-3 py-2 text-primary font-bold bg-white shadow focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all w-full min-w-[120px] text-center"
                    value={exportFormat}
                    onChange={e => setExportFormat(e.target.value as 'csv' | 'json' | 'xlsx' | 'pdf')}
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="xlsx">Excel</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <button
                    onClick={() => handleExport()}
                    className="bg-success hover:bg-success-alt text-primary-dark rounded-lg flex items-center gap-2 shadow-md font-bold text-base transition-all duration-150 border-2 border-success/40 w-full py-2 px-0 justify-center"
                  >
                    <span className="text-xl">⬇️</span> <span className="font-bold">Exportar</span>
                  </button>
                </div>
                <div className="flex-1 w-full">
                  <button
                    onClick={deleteAllHistory}
                    className="bg-warning hover:bg-warning/80 text-primary-dark rounded-lg flex items-center gap-2 shadow-md font-bold text-base transition-all duration-150 border-2 border-warning/40 w-full py-2 px-0 justify-center"
                    disabled={loading}
                  >
                    <span className="text-xl">🗑️</span> <span className="font-bold">Eliminar todo</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
