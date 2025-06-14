"use client";
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-lightblue text-darkblue">
      <h1 className="text-2xl font-bold mb-6 text-darkblue">Crear cuenta</h1>
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-lg flex flex-col gap-4 items-center">
        <RegisterForm />
      </div>
    </main>
  );
}
