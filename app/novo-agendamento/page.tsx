"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Servico = {
  id: string;
  nome: string;
  preco: number;
  duracao_minutos: number;
};

type Horario = {
  horario_inicio: string;
  horario_fim: string;
};

type AgendamentoConfirmado = {
  id: string;
  nome: string;
  whatsapp: string;
  servico: string;
  preco: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
};

function hojeBrasil() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarHora(hora: string) {
  return hora.slice(0, 5);
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function NovoAgendamento() {
  const supabase = createClient();

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [data, setData] = useState(hojeBrasil());
  const [hora, setHora] = useState("");

  const [carregandoServicos, setCarregandoServicos] = useState(true);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [agendando, setAgendando] = useState(false);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [confirmado, setConfirmado] =
    useState<AgendamentoConfirmado | null>(null);

  useEffect(() => {
    async function carregarServicos() {
      setCarregandoServicos(true);

      const { data, error } = await supabase
        .from("servicos")
        .select("id, nome, preco, duracao_minutos")
        .eq("ativo", true)
        .order("nome");

      if (error) {
        console.error(error);
        setErro("Não foi possível carregar os serviços.");
      } else {
        setServicos(data || []);
      }

      setCarregandoServicos(false);
    }

    carregarServicos();
  }, []);

  useEffect(() => {
    async function carregarHorarios() {
      if (!servicoId || !data) {
        setHorarios([]);
        setHora("");
        return;
      }

      setCarregandoHorarios(true);
      setErro("");
      setHora("");

      const { data: horariosData, error } = await supabase.rpc(
        "horarios_disponiveis",
        {
          p_data: data,
          p_servico_id: servicoId,
          p_intervalo_minutos: 30,
        }
      );

      if (error) {
        console.error(error);
        setErro("Não foi possível carregar os horários.");
        setHorarios([]);
      } else {
        setHorarios(horariosData || []);
      }

      setCarregandoHorarios(false);
    }

    carregarHorarios();
  }, [servicoId, data]);

  const servicoSelecionado = servicos.find(
    (servico) => servico.id === servicoId
  );

  async function criarAgendamento() {
    setErro("");
    setMensagem("");

    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }

    if (!whatsapp.trim()) {
      setErro("Informe seu WhatsApp.");
      return;
    }

    if (!servicoId) {
      setErro("Selecione um serviço.");
      return;
    }

    if (!data) {
      setErro("Selecione uma data.");
      return;
    }

    if (!hora) {
      setErro("Selecione um horário.");
      return;
    }

    setAgendando(true);

    const { data: agendamentoId, error } = await supabase.rpc(
      "criar_agendamento",
      {
        p_nome: nome.trim(),
        p_whatsapp: whatsapp.trim(),
        p_servico_id: servicoId,
        p_data: data,
        p_hora_inicio: hora,
      }
    );

    if (error) {
      console.error(error);
      setErro(
        error.message?.includes("ocupado")
          ? "Esse horário acabou de ser ocupado. Escolha outro horário."
          : error.message || "Não foi possível realizar o agendamento."
      );
      setAgendando(false);
      return;
    }

    const novoAgendamento: AgendamentoConfirmado = {
      id: agendamentoId,
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      servico: servicoSelecionado?.nome || "Serviço",
      preco: Number(servicoSelecionado?.preco || 0),
      data,
      hora_inicio: hora,
      hora_fim:
        horarios.find((item) => item.horario_inicio === hora)
          ?.horario_fim || "",
    };

    setConfirmado(novoAgendamento);
    setMensagem("Agendamento realizado com sucesso!");
    setAgendando(false);
  }

  function abrirWhatsApp() {
    if (!confirmado) return;

    const texto = [
      "Olá! Gostaria de confirmar meu agendamento na Débora Kelly Nails Designer.",
      "",
      `Nome: ${confirmado.nome}`,
      `Serviço: ${confirmado.servico}`,
      `Data: ${formatarData(confirmado.data)}`,
      `Horário: ${formatarHora(confirmado.hora_inicio)} Ã s ${formatarHora(confirmado.hora_fim)}`,
      `Valor: ${formatarMoeda(confirmado.preco)}`,
      "",
      "Agendamento realizado pelo sistema online.",
    ].join("\n");

    const url = `https://wa.me/5581986300857?text=${encodeURIComponent(texto)}`;

    window.open(url, "_blank");
  }

  function novoAgendamento() {
    setConfirmado(null);
    setMensagem("");
    setErro("");
    setNome("");
    setWhatsapp("");
    setServicoId("");
    setHora("");
    setHorarios([]);
    setData(hojeBrasil());
  }

  if (confirmado) {
    return (
      <main className="min-h-screen bg-pink-50 p-6">
        <div className="mx-auto max-w-2xl">

          <div className="mb-6 text-center">
            <div className="text-5xl">✓</div>

            <h1 className="mt-3 text-3xl font-bold text-gray-800">
              Agendamento confirmado!
            </h1>

            <p className="mt-2 text-gray-600">
              Seu horário foi reservado com sucesso.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-5 text-xl font-bold text-gray-800">
              Detalhes do agendamento
            </h2>

            <div className="space-y-4">

              <div>
                <div className="text-sm text-gray-500">
                  Cliente
                </div>

                <div className="font-semibold text-gray-800">
                  {confirmado.nome}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">
                  Serviço
                </div>

                <div className="font-semibold text-gray-800">
                  {confirmado.servico}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">
                  Data
                </div>

                <div className="font-semibold text-gray-800">
                  {formatarData(confirmado.data)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">
                  Horário
                </div>

                <div className="font-semibold text-gray-800">
                  {formatarHora(confirmado.hora_inicio)}
                  {" Ã s "}
                  {formatarHora(confirmado.hora_fim)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">
                  Valor
                </div>

                <div className="font-semibold text-pink-600">
                  {formatarMoeda(confirmado.preco)}
                </div>
              </div>

            </div>

            <div className="mt-6 grid gap-3">

              <button
                onClick={abrirWhatsApp}
                className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
              >
                📱 Enviar confirmação pelo WhatsApp
              </button>

              <button
                onClick={novoAgendamento}
                className="w-full rounded-xl border border-pink-300 bg-white px-4 py-3 font-semibold text-pink-600 hover:bg-pink-50"
              >
                Fazer outro agendamento
              </button>

            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-2xl">

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Débora Kelly Nails Designer
          </h1>

          <p className="mt-2 text-gray-600">
            Agende seu horário de forma rápida e fácil.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">

          <div className="space-y-5">

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Seu nome
              </label>

              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome"
                className="w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                WhatsApp
              </label>

              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(81) 99999-9999"
                className="w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Serviço
              </label>

              {carregandoServicos ? (
                <div className="rounded-xl bg-gray-50 p-3 text-gray-500">
                  Carregando serviços...
                </div>
              ) : (
                <select
                  value={servicoId}
                  onChange={(e) => setServicoId(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-200"
                >
                  <option value="">
                    Selecione um serviço
                  </option>

                  {servicos.map((servico) => (
                    <option key={servico.id} value={servico.id}>
                      {servico.nome} — {formatarMoeda(Number(servico.preco))} —{" "}
                      {servico.duracao_minutos} min
                    </option>
                  ))}
                </select>
              )}
            </div>

            {servicoSelecionado && (
              <div className="rounded-xl bg-pink-50 p-4">
                <div className="font-semibold text-gray-800">
                  {servicoSelecionado.nome}
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  {servicoSelecionado.duracao_minutos} minutos
                </div>

                <div className="mt-1 font-bold text-pink-600">
                  {formatarMoeda(Number(servicoSelecionado.preco))}
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Data
              </label>

              <input
                type="date"
                value={data}
                min={hojeBrasil()}
                onChange={(e) => setData(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Horário disponível
              </label>

              {!servicoId ? (
                <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                  Primeiro selecione o serviço.
                </div>
              ) : carregandoHorarios ? (
                <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                  Consultando horários disponíveis...
                </div>
              ) : horarios.length === 0 ? (
                <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
                  Não há horários disponíveis para essa data e serviço.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {horarios.map((horario) => (
                    <button
                      key={horario.horario_inicio}
                      type="button"
                      onClick={() =>
                        setHora(horario.horario_inicio)
                      }
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        hora === horario.horario_inicio
                          ? "border-pink-600 bg-pink-600 text-white"
                          : "border-pink-200 bg-pink-50 text-pink-700 hover:border-pink-400"
                      }`}
                    >
                      {formatarHora(horario.horario_inicio)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {erro && (
              <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                {erro}
              </div>
            )}

            {mensagem && (
              <div className="rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
                {mensagem}
              </div>
            )}

            <button
              type="button"
              onClick={criarAgendamento}
              disabled={agendando}
              className="w-full rounded-xl bg-pink-600 px-4 py-3 font-semibold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {agendando
                ? "Confirmando agendamento..."
                : "Confirmar agendamento"}
            </button>

          </div>
        </div>

        <div className="mt-5 text-center text-sm text-gray-500">
          Seus dados são utilizados para realizar e organizar seu agendamento.
        </div>

      </div>
    </main>
  );
}




