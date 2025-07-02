"use client";
import { useForm } from "react-hook-form";
import { supabase } from "@/services/supabaseClient";
import { useRouter } from "next/navigation";

type FormData = {
  email: string;
  password: string;
};

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (error) alert(error.message);
    else {
      alert(
        "Registro exitoso. Por favor revisa tu correo y confirma tu cuenta antes de iniciar sesión."
      );
      router.push("/login");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <input
        type="email"
        placeholder="Correo electrónico"
        {...register("email", { required: "Correo requerido" })}
        className="border-2 rounded-lg px-4 py-3 bg-[var(--color-white)] text-[var(--color-primary)] w-full shadow-sm focus:shadow-md transition" style={{ borderColor: '#94E7FF' }}
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
        Crear cuenta
      </button>
      <button
        type="button"
        className="mt-2 w-full border rounded p-2 hover:bg-[#F8FCFF] transition-colors" style={{ borderColor: '#94E7FF', color: '#2499C7' }}
        onClick={() => router.push('/login')}
      >
        ¿Ya tienes cuenta? Iniciar sesión
      </button>
    </form>
  );
}
