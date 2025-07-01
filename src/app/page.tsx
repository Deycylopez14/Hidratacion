"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "./components/RegisterForm";
import Link from "next/link";
import "./register-sw";

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    // Si el usuario ya está autenticado, redirige al dashboard
    const checkSession = async () => {
      const { data } = await import("@/services/supabaseClient").then(m => m.supabase.auth.getSession());
      if (data.session) router.push("/dashboard");
    };
    checkSession();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[var(--color-background)] text-primary">
      <h1 className="text-2xl font-bold mb-6 text-primary">Registro</h1>
      <div className="w-full max-w-sm bg-[var(--color-white)] p-6 rounded-xl shadow-lg">
        <RegisterForm />
        <div className="mt-4 text-center">
          <span>¿Ya tienes cuenta? </span>
          <Link href="/login" className="text-accent hover:underline font-semibold">Inicia sesión</Link>
        </div>
      </div>
    </main>
  );
}
