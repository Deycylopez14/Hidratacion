import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { useRouter } from "next/navigation";

// Rutas principales para swipe
const SWIPE_ROUTES = [
  "/dashboard",
  "/estadisticas",
  "/historial",
  "/logros",
  "/configuracion",
];

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  // Swipe handlers
  useEffect(() => {
    function handleTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches[0].clientX;
    }
    function handleTouchMove(e: TouchEvent) {
      touchEndX.current = e.touches[0].clientX;
    }
    function handleTouchEnd() {
      if (touchStartX.current === null || touchEndX.current === null) return;
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 60) {
        handleSwipe(diff > 0 ? "left" : "right");
      }
      touchStartX.current = null;
      touchEndX.current = null;
    }

    function handleMouseDown(e: MouseEvent) {
      touchStartX.current = e.clientX;
    }
    function handleMouseUp(e: MouseEvent) {
      touchEndX.current = e.clientX;
      if (touchStartX.current === null) return;
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 80) {
        handleSwipe(diff > 0 ? "left" : "right");
      }
      touchStartX.current = null;
      touchEndX.current = null;
    }

    function handleSwipe(direction: "left" | "right") {
      const idx = SWIPE_ROUTES.indexOf(pathname);
      if (idx === -1) return;
      let nextIdx = direction === "left" ? idx + 1 : idx - 1;
      if (nextIdx < 0 || nextIdx >= SWIPE_ROUTES.length) return;
      router.push(SWIPE_ROUTES[nextIdx]);
    }

    // Touch events para móvil
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    // Mouse events para escritorio
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [pathname, router]);
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
      <header className="p-2 md:p-4 shadow flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-0 w-full" style={{ background: '#006691', color: '#fff' }}>
        <div className="flex flex-col md:flex-row items-center w-full justify-between gap-2 md:gap-0">
          <div className="flex items-center gap-2 justify-center md:justify-start w-full md:w-auto">
            <span className="text-2xl md:text-2xl" style={{ color: '#fff' }}>💧</span>
            <span className="font-bold text-lg md:text-xl drop-shadow" style={{ color: '#fff' }}>HydroTracker</span>
          </div>
          <nav className="flex flex-1 justify-center gap-3 md:gap-6 px-1 md:px-4 overflow-x-auto scrollbar-hide">
            <a href="/dashboard" className={`group flex flex-col items-center gap-0.5 cursor-pointer hover:scale-110 transition-transform${pathname === '/dashboard' ? ' scale-105' : ''}`}
              title="Dashboard"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M3 10.5L12 4l9 6.5V20a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4h-4v4a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" fill="#1976d2"/>
              </svg>
              <span className="text-[9px] md:text-xs font-medium text-white/80">Inicio</span>
            </a>
            <a href="/estadisticas" className={`group flex flex-col items-center gap-0.5 cursor-pointer hover:scale-110 transition-transform${pathname === '/estadisticas' ? ' scale-105' : ''}`}
              title="Estadísticas"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="10" width="3" height="8" rx="1" fill="#1976d2" stroke="#fff" strokeWidth="2"/>
                <rect x="9" y="6" width="3" height="12" rx="1" fill="#1976d2" stroke="#fff" strokeWidth="2"/>
                <rect x="15" y="13" width="3" height="5" rx="1" fill="#1976d2" stroke="#fff" strokeWidth="2"/>
              </svg>
              <span className="text-[9px] md:text-xs font-medium text-white/80">Estadísticas</span>
            </a>
            <a href="/historial" className={`group flex flex-col items-center gap-0.5 cursor-pointer hover:scale-110 transition-transform${pathname === '/historial' ? ' scale-105' : ''}`}
              title="Historial"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" fill="#1976d2" stroke="#fff" strokeWidth="2"/>
                <path d="M12 7v5l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-[9px] md:text-xs font-medium text-white/80">Historial</span>
            </a>
            <a href="/logros" className={`group flex flex-col items-center gap-0.5 cursor-pointer hover:scale-110 transition-transform${pathname === '/logros' ? ' scale-105' : ''}`}
              title="Logros"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#1976d2" stroke="#fff" strokeWidth="2"/>
                <path d="M6 22v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="#fff" strokeWidth="2"/>
              </svg>
              <span className="text-[9px] md:text-xs font-medium text-white/80">Logros</span>
            </a>
            <a href="/configuracion" className={`group flex flex-col items-center gap-0.5 cursor-pointer hover:scale-110 transition-transform${pathname === '/configuracion' ? ' scale-105' : ''}`}
              title="Configuración"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" fill="#1976d2" stroke="#fff" strokeWidth="2"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06A1.65 1.65 0 0015 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 008.6 15a1.65 1.65 0 00-1.82-.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0015.4 9a1.65 1.65 0 001.82.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 15z" stroke="#fff" strokeWidth="2"/>
              </svg>
              <span className="text-[9px] md:text-xs font-medium text-white/80">Config</span>
            </a>
          </nav>
          <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0 justify-center md:justify-end w-full md:w-auto">
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
        </div>
      </header>
      {/* ...el resto del código permanece igual... */}
    </>
  );
}