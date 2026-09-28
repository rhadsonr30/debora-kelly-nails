import { createClient } from "@/lib/supabase/server";
import FinalizarAtendimento from "./FinalizarAtendimento";

type Props = {
  searchParams: Promise<{
    data?: string;
  }>;
};

function dataHoje() {
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

function alterarData(data: string, dias: number) {
  const dataObj = new Date(`${data}T12:00:00`);
  dataObj.setDate(dataObj.getDate() + dias);

  return dataObj.toISOString().slice(0, 10);
}

function statusInfo(status: string) {
  switch (status) {
    case "concluido":
      return {
        texto: "Concluido",
        classe: "bg-green-100 text-green-800 border-green-200",
      };

    case "confirmado":
      return {
        texto: "Confirmado",
        classe: "bg-blue-100 text-blue-800 border-blue-200",
      };

    case "cancelado":
      return {
        texto: "Cancelado",
        classe: "bg-red-100 text-red-800 border-red-200",
      };

    default:
      return {
        texto: "Agendado",
        classe: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
  }
}

export default async function Agenda({ searchParams }: Props) {
  const supabase = await createClient();

  const params = await searchParams;

  const dataSelecionada = params.data || dataHoje();

  const dataAnterior = alterarData(dataSelecionada, -1);
  const proximaData = alterarData(dataSelecionada, 1);

  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select(`
      id,
      data,
      hora_inicio,
      hora_fim,
      status,
      clientes (
        nome,
        whatsapp
      ),
      servicos (
        nome,
        preco
      )
    `)
    .eq("data", dataSelecionada)
    .order("hora_inicio");

  const { data: disponibilidades } = await supabase
    .from("disponibilidades")
    .select("*")
    .eq("data", dataSelecionada)
    .eq("ativo", true)
    .order("hora_inicio");

  const { data: bloqueios } = await supabase
    .from("bloqueios")
    .select("*")
    .eq("data", dataSelecionada)
    .order("hora_inicio");

  const agendamentoIds =
    agendamentos?.map((item) => item.id) || [];

  const { data: pagamentos } =
    agendamentoIds.length > 0
      ? await supabase
          .from("pagamentos")
          .select(`
            agendamento_id,
            valor,
            forma_pagamento
          `)
          .in("agendamento_id", agendamentoIds)
      : { data: [] };

  const pagamentoPorAgendamento = new Map<
    string,
    {
      valor: number;
      forma_pagamento: string;
    }
  >();

  (pagamentos || []).forEach((pagamento) => {
    if (!pagamento.agendamento_id) {
      return;
    }

    pagamentoPorAgendamento.set(
      pagamento.agendamento_id,
      {
        valor: Number(pagamento.valor || 0),
        forma_pagamento: pagamento.forma_pagamento,
      }
    );
  });

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Agenda
          </h1>

          <p className="mt-1 text-gray-600">
            Controle dos horários da Debora Kelly Nails Designer
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow">
          <div className="flex flex-col gap-4">

            <div className="flex items-center justify-between gap-2">

              <a
                href={`/agenda?data=${dataAnterior}`}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Anterior Anterior
              </a>

              <div className="text-center">
                <div className="text-sm text-gray-500">
                  Agenda
                </div>

                <div className="text-xl font-bold text-gray-800">
                  {formatarData(dataSelecionada)}
                </div>
              </div>

              <a
                href={`/agenda?data=${proximaData}`}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Proximo Anterior’
              </a>

            </div>

            <form
              method="GET"
              className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-end"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Escolher data
                </label>

                <input
                  type="date"
                  name="data"
                  defaultValue={dataSelecionada}
                  className="rounded-lg border-2 border-gray-400 bg-white px-4 py-2 text-gray-900 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-200"
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-pink-600 px-5 py-2 font-medium text-white hover:bg-pink-700"
              >
                Consultar agenda
              </button>
            </form>

          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            🟢 Disponibilidade
          </h2>

          {disponibilidades && disponibilidades.length > 0 ? (
            <div className="space-y-3">
              {disponibilidades.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-green-200 bg-green-50 p-4"
                >
                  <div className="font-semibold text-green-800">
                    🟢 Horário disponivel
                  </div>

                  <div className="mt-1 text-green-700">
                    {formatarHora(item.hora_inicio)} às{" "}
                    {formatarHora(item.hora_fim)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              Nenhuma disponibilidade cadastrada.
            </p>
          )}
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            🔒 Bloqueios
          </h2>

          {bloqueios && bloqueios.length > 0 ? (
            <div className="space-y-3">
              {bloqueios.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <div className="font-semibold text-red-800">
                    🔒 {formatarHora(item.hora_inicio)} às{" "}
                    {formatarHora(item.hora_fim)}
                  </div>

                  {item.motivo && (
                    <div className="mt-1 text-red-700">
                      Motivo: {item.motivo}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              Nenhum bloqueio cadastrado.
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              💅 Agendamentos
            </h2>

            <span className="text-sm text-gray-500">
              {agendamentos?.length || 0} atendimento(s)
            </span>
          </div>

          {agendamentos && agendamentos.length > 0 ? (
            <div className="space-y-4">
              {agendamentos.map((item) => {
                const cliente = Array.isArray(item.clientes)
                  ? item.clientes[0]
                  : item.clientes;

                const servico = Array.isArray(item.servicos)
                  ? item.servicos[0]
                  : item.servicos;

                const pagamento =
                  pagamentoPorAgendamento.get(item.id);

                const status = statusInfo(item.status);

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-pink-200 bg-pink-50 p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      <div className="space-y-1">

                        <div className="text-xl font-bold text-gray-800">
                          {formatarHora(item.hora_inicio)} às{" "}
                          {formatarHora(item.hora_fim)}
                        </div>

                        <div className="text-lg font-semibold text-pink-700">
                          {cliente?.nome || "Cliente"}
                        </div>

                        {cliente?.whatsapp && (
                          <div className="text-sm text-gray-600">
                            WhatsApp: {cliente.whatsapp}
                          </div>
                        )}

                        <div className="pt-1 text-sm text-gray-700">
                         <strong>Serviço:</strong>{" "}
{servico?.nome
  ? servico.nome.replace(/ponta/gi, "tip")
  : "Serviço"}
                        </div>

                        {servico?.preco != null && (
                          <div className="text-sm font-semibold text-gray-800">
                            Valor:{" "}
                            {formatarMoeda(
                              Number(servico.preco)
                            )}
                          </div>
                        )}

                        {pagamento && (
                          <div className="text-sm text-green-700">
                            <strong>Pagamento:</strong>{" "}
                            {pagamento.forma_pagamento}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 lg:items-end">

                        <span
                          className={`inline-flex w-fit rounded-full border px-3 py-1 text-sm font-semibold ${status.classe}`}
                        >
                          {status.texto}
                        </span>

                        <FinalizarAtendimento
                          agendamentoId={item.id}
                          status={item.status}
                        />

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">
              Nenhum agendamento para esta data.
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow">
          <div className="text-sm font-medium text-gray-700">
            ⏱ Tolerância para atrasos:{" "}
            <span className="font-bold">
              15 minutos
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Após esse período, o atendimento poderá ser
            reagendado conforme a disponibilidade.
          </p>
        </div>

      </div>
    </main>
  );
}
