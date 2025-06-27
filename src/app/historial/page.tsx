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
    if (exportFormat === 'csv') {
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
        'Fecha y Hora': new Date(r.created_at).toLocaleString(),
        'Cantidad (ml)': r.amount
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
        new Date(r.created_at).toLocaleString(),
        r.amount
      ]);
      autoTable(doc, {
        head: [['Fecha y Hora', 'Cantidad (ml)']],
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
            <div className="z-10 text-center w-full">
              <h2 className="font-bold text-lg sm:text-2xl text-primary-dark drop-shadow mb-1 sm:mb-2">Historial de Registros</h2>
              <p className="text-xs sm:text-base text-primary font-semibold">Consulta y exporta tus registros de hidratación.</p>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Historial de Registros</h2>
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
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-center border-separate border-spacing-y-2">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-primary-dark font-bold bg-primary/20 rounded-tl-xl rounded-bl-xl shadow-sm">Fecha y Hora</th>
                      <th className="px-4 py-2 text-primary-dark font-bold bg-primary/20 shadow-sm">Cantidad (ml)</th>
                      <th className="px-4 py-2 text-primary-dark font-bold bg-primary/20 rounded-tr-xl rounded-br-xl shadow-sm">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => {
                      // Formatear fecha y hora sin segundos y año corto
                      const fecha = new Date(r.created_at);
                      const fechaStr = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
                      const horaStr = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <tr key={i} className="group even:bg-lightblue/40 odd:bg-white border-b border-lightblue hover:scale-[1.01] hover:shadow-lg transition-all duration-150 rounded-xl">
                          <td className="border-x px-4 py-2 text-primary-dark font-semibold whitespace-nowrap rounded-l-xl">
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-4 h-4 text-aqua inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              {fechaStr} {horaStr}
                            </span>
                          </td>
                          <td className="border-x px-4 py-2">
                            <span className="inline-block bg-blue-100 text-blue-700 font-bold rounded-full px-3 py-1 text-sm shadow-sm">
                              {r.amount}
                            </span>
                          </td>
                          <td className="border-x px-4 py-2 rounded-r-xl">
                            <button
                              onClick={() => deleteRecord(r.created_at)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full shadow flex items-center gap-1 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                              disabled={loading}
                              title="Eliminar registro"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              <span className="hidden sm:inline">Eliminar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6 mb-2">
                <select
                  id="export-format"
                  className="border border-aqua rounded px-2 py-1 text-darkblue font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-aqua"
                  style={{ minWidth: 110 }}
                  value={exportFormat}
                  onChange={e => setExportFormat(e.target.value as 'csv' | 'json' | 'xlsx' | 'pdf')}
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="xlsx">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
                <button
                  onClick={() => handleExport()}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 shadow-md transition-all duration-150"
                >
                  <span>↓</span> Exportar
                </button>
                <button
                  onClick={deleteAllHistory}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 shadow-md transition-all duration-150"
                  disabled={loading}
                >
                  🗑 Eliminar todo
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
