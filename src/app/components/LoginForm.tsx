"use client";
import { useForm } from "react-hook-form";
import { supabase } from "@/services/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setErrorMsg("");
    const { error, data: sessionData } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    console.log("Resultado login:", { error, sessionData });
    if (error) {
      if (error.message.includes("Unexpected token <")) {
        setErrorMsg(
          "Error de conexión con el servidor de autenticación. Verifica tu conexión o la configuración de Supabase."
        );
      } else {
        setErrorMsg(error.message);
      }
    } else {
      // Verificar si la sesión es válida
      const { data: currentSession } = await supabase.auth.getSession();
      console.log("Sesión tras login:", currentSession);
      if (!currentSession.session) {
        setErrorMsg("Login exitoso, pero no se detecta sesión activa. ¿Confirmaste tu correo?");
      } else {
        setErrorMsg("");
        router.push("/dashboard");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <input
        type="email"
        placeholder="Correo electrónico"
        {...register("email", { required: "Correo requerido" })}
        className="border-2 border-aqua focus:border-darkblue rounded-lg px-4 py-3 bg-white text-darkblue w-full shadow-sm focus:shadow-md transition"
      />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      <input
        type="password"
        placeholder="Contraseña"
        {...register("password", {
          required: "Contraseña requerida",
          minLength: { value: 6, message: "Mínimo 6 caracteres" },
        })}
        className="border-2 border-aqua focus:border-darkblue rounded-lg px-4 py-3 bg-white text-darkblue w-full shadow-sm focus:shadow-md transition"
      />
      {errors.password && (
        <p className="text-red-500">{errors.password.message}</p>
      )}
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-aqua text-darkblue font-bold shadow-lg hover:bg-blue-400 hover:text-darkblue transition text-lg tracking-wide focus:outline-none focus:ring-2 focus:ring-aqua"
      >
        Iniciar sesión
      </button>
      {errorMsg && <div className="text-red-600 text-sm text-center">{errorMsg}</div>}
    </form>
  );
}
