"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Bloqueios() {
  const supabase = createClient();

  const [data, setData] = useState("2026-09-29");
  const [horaInicio, setHoraInicio] = useState("12:00");
  const [horaFim, setHoraFim] = useState("13:00");
  const [motivo, setMotivo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function cadastrar() {
    setMensagem("");

    if (!data || !horaInicio || !horaFim) {
      setMensagem("Preencha todos os campos obrigatórios.");
      return;
    }

    if (horaFim <= horaInicio) {
      setMensagem("A hora final deve ser maior que a hora inicial.");
      return;
    }

    setCarregando(true);

    const { error } = await supabase
      .from("bloqueios")
      .insert({
        data,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        motivo: motivo || null,
      });

    setCarregando(false);

    if (error) {
      setMensagem("Não foi possível cadastrar o bloqueio.");
      return;
    }

    setMensagem("Bloqueio criado com sucesso!");
    setMotivo("");
  }

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-xl">

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h1 className="text-2xl font-bold text-gray-900">
            Novo bloqueio
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Reserve um período em que a Débora não estará disponível.
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

            <div>
              <label className="text-sm font-medium text-gray-700">
                Motivo
              </label>

              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex.: Almoço"
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
              {carregando ? "Cadastrando..." : "Cadastrar bloqueio"}
            </button>

          </div>
        </div>
      </div>
    </main>
  );
}