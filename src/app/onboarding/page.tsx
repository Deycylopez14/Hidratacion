"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";
import OnboardingFlow from "../components/OnboardingFlow";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function OnboardingPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/login");
      else setUser(data.session.user);
    });
  }, [router]);

  if (!user) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-aqua to-blue-200">
      <OnboardingFlow user={user} onFinish={() => router.push("/dashboard")} />
    </div>
  );
}
