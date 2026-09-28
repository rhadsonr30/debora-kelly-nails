"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    setErro("");

    if (!email || !senha) {
      setErro("Informe o e-mail e a senha.");
      return;
    }

    setCarregando(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-pink-50 px-6">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">

        <div className="text-center">

          <h1 className="text-2xl font-bold text-gray-900">
            Débora Kelly Nails Designer
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Acesso administrativo
          </p>

        </div>

        <div className="mt-8 space-y-5">

          <div>
            <label className="text-sm font-medium text-gray-700">
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-pink-500"
            />
          </div>

          {erro && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {erro}
            </div>
          )}

          <button
            type="button"
            onClick={entrar}
            disabled={carregando}
            className="w-full rounded-xl bg-pink-600 px-5 py-4 font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>

        </div>

      </div>

    </main>
  );
}