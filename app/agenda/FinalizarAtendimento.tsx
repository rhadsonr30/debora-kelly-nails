"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  agendamentoId: string;
  status: string;
};

export default function FinalizarAtendimento({
  agendamentoId,
  status,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [formaPagamento, setFormaPagamento] = useState("Pix");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  if (status === "concluido") {
    return (
      <span className="inline-block rounded-full bg-green-600 px-3 py-1 text-sm font-medium text-white">
        Concluído
      </span>
    );
  }

  async function finalizar() {
    setCarregando(true);
    setMensagem("");

    const { error } = await supabase.rpc("finalizar_atendimento", {
      p_agendamento_id: agendamentoId,
      p_forma_pagamento: formaPagamento,
    });

    if (error) {
      console.error(error);
      setMensagem("Não foi possível finalizar o atendimento.");
      setCarregando(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <select
        value={formaPagamento}
        onChange={(e) => setFormaPagamento(e.target.value)}
        disabled={carregando}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      >
        <option>Pix</option>
        <option>Dinheiro</option>
        <option>Cartão de débito</option>
        <option>Cartão de crédito</option>
      </select>

      <button
        onClick={finalizar}
        disabled={carregando}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {carregando ? "Finalizando..." : "Concluir atendimento"}
      </button>

      {mensagem && (
        <div className="text-sm font-medium text-red-600">
          {mensagem}
        </div>
      )}
    </div>
  );
}