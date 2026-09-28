"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Disponibilidade() {
  const supabase = createClient();

  const [data, setData] = useState("2026-09-28");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("18:00");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function cadastrar() {
    setMensagem("");

    if (!data || !horaInicio || !horaFim) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    if (horaFim <= horaInicio) {
      setMensagem("A hora final deve ser maior que a hora inicial.");
      return;
    }

    setCarregando(true);

    const { error } = await supabase
      .from("disponibilidades")
      .insert({
        data,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        ativo: true,
      });

    setCarregando(false);

    if (error) {
      setMensagem("Não foi possível cadastrar a disponibilidade.");
      return;
    }

    setMensagem("Disponibilidade cadastrada com sucesso!");
  }

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-xl">

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h1 className="text-2xl font-bold text-gray-900">
            Nova disponibilidade
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Defina o período em que a Débora estará disponível para atender.
          </p>

          <div className="mt-8 space-y-5">

            <div>
              <label className="text-sm font-medium text-gray-700">
                Data
              </label>

              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Hora inicial
              </label>

              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Hora final
              </label>

              <input
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>

            {mensagem && (
              <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                {mensagem}
              </div>
            )}

            <button
              type="button"
              onClick={cadastrar}
              disabled={carregando}
              className="w-full rounded-xl bg-pink-600 px-5 py-4 font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
            >
              {carregando
                ? "Cadastrando..."
                : "Cadastrar disponibilidade"}
            </button>

          </div>
        </div>
      </div>
    </main>
  );
}