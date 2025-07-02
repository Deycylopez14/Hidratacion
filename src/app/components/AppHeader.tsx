import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { useRouter } from "next/navigation";

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hydro-dark-mode");
      if (saved === "true") setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (darkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("hydro-dark-mode", "true");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("hydro-dark-mode", "false");
      }
    }
  }, [darkMode]);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        // Mostrar email o nombre si existe en user_metadata
        setUserName(
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email ||
          "Usuario"
        );
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <header className="p-4 shadow flex items-center justify-between" style={{ background: '#006691', color: '#fff' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl" style={{ color: '#fff' }}>💧</span>
          <span className="font-bold text-xl drop-shadow" style={{ color: '#fff' }}>HydroTracker</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold truncate max-w-[120px]" style={{ color: '#fff' }} title={userName}>¡Hola, {userName}!</span>
          <button
            aria-label="Cambiar modo oscuro"
            className="rounded-full p-2 bg-primary/10 dark:bg-accent/20 hover:bg-primary/20 dark:hover:bg-accent/30 transition-colors"
            onClick={() => setDarkMode((v) => !v)}
          >
            {darkMode ? (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" fill="#fff" />
              </svg>
            ) : (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" fill="#fff" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
          <button
            aria-label="Cerrar sesión"
            className="ml-2 rounded-full p-2 bg-warning/10 dark:bg-warning/30 hover:bg-warning/20 dark:hover:bg-warning/40 transition-colors shadow"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M16 17l5-5m0 0l-5-5m5 5H9m4 5v1a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h4a2 2 0 012 2v1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </header>
      <nav className="flex gap-8 px-6 py-2 border-b bg-[var(--color-white)] dark:bg-[var(--color-bg-light-1)] transition-colors">
        <a href="/dashboard" className={`text-muted dark:text-accent flex items-center gap-1 cursor-pointer hover:text-primary dark:hover:text-accent${pathname === '/dashboard' ? ' text-primary-dark dark:text-accent font-semibold border-b-2 border-primary-dark dark:border-accent pb-1' : ''}`}>Dashboard</a>
        <a href="/estadisticas" className={`text-muted dark:text-accent flex items-center gap-1 cursor-pointer hover:text-primary dark:hover:text-accent${pathname === '/estadisticas' ? ' text-primary-dark dark:text-accent font-semibold border-b-2 border-primary-dark dark:border-accent pb-1' : ''}`}>Estadísticas</a>
        <a href="/historial" className={`text-muted dark:text-accent flex items-center gap-1 cursor-pointer hover:text-primary dark:hover:text-accent${pathname === '/historial' ? ' text-primary-dark dark:text-accent font-semibold border-b-2 border-primary-dark dark:border-accent pb-1' : ''}`}>Historial</a>
        <a href="/logros" className={`text-muted dark:text-accent flex items-center gap-1 cursor-pointer hover:text-primary dark:hover:text-accent${pathname === '/logros' ? ' text-primary-dark dark:text-accent font-semibold border-b-2 border-primary-dark dark:border-accent pb-1' : ''}`}>Logros</a>
        <a href="/configuracion" className={`text-muted dark:text-accent flex items-center gap-1 cursor-pointer hover:text-primary dark:hover:text-accent${pathname === '/configuracion' ? ' text-primary-dark dark:text-accent font-semibold border-b-2 border-primary-dark dark:border-accent pb-1' : ''}`}>Configuración</a>
      </nav>
    </>
  );
}