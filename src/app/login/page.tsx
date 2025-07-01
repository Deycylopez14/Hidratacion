"use client";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-bg-light-1 text-primary">
      <h1 className="text-2xl font-bold mb-6 text-primary">Iniciar sesión</h1>
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-lg flex flex-col gap-4 items-center">
        <LoginForm />
        <button
          onClick={() => (window.location.href = "/register")}
          className="w-full py-3 rounded-xl bg-accent text-primary font-bold shadow-lg hover:bg-primary hover:text-white transition text-lg tracking-wide focus:outline-none focus:ring-2 focus:ring-accent mt-2"
          type="button"
        >
          ¿No tienes cuenta? Regístrate
        </button>
      </div>
    </main>
  );
}
