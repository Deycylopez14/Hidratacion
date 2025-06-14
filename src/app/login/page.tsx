"use client";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-lightblue text-darkblue">
      <h1 className="text-2xl font-bold mb-6 text-darkblue">Iniciar sesión</h1>
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-lg flex flex-col gap-4 items-center">
        <LoginForm />
        <button
          onClick={() => (window.location.href = "/register")}
          className="w-full py-3 rounded-xl bg-aqua text-darkblue font-bold shadow-lg hover:bg-blue-400 hover:text-darkblue transition text-lg tracking-wide focus:outline-none focus:ring-2 focus:ring-aqua mt-2"
          type="button"
        >
          ¿No tienes cuenta? Regístrate
        </button>
      </div>
    </main>
  );
}
