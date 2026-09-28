import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarHora(hora: string) {
  return hora.slice(0, 5);
}

function formatarMoeda(valor: number | null | undefined) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function nomeServico(nome: string | null | undefined) {
  if (!nome) return "Serviço";

  if (
    nome.toLowerCase().includes("alongamento em gel") &&
    (nome.toLowerCase().includes("ponta") ||
      nome.toLowerCase().includes("tip"))
  ) {
    return "Alongamento em gel na tip";
  }

  return nome;
}

export default async function DetalhesCliente({ params }: Props) {
  const supabase = await createClient();

  const { id } = await params;

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (!cliente) {
    return (
      <main className="min-h-screen bg-pink-50 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-gray-800">
            Cliente não encontrado
          </h1>
        </div>
      </main>
    );
  }

  const { data: agendamentos } = await supabase
  .from("agendamentos")
  .select(`
    id,
    data,
    hora_inicio,
    hora_fim,
    status,
    servico_id
  `)
  .eq("cliente_id", id)
  .order("data", { ascending: false })
  .order("hora_inicio", { ascending: false });

const servicoIds = [
  ...new Set((agendamentos || []).map((item) => item.servico_id)),
];

const { data: servicos } = servicoIds.length
  ? await supabase
      .from("servicos")
      .select("id, nome, preco")
      .in("id", servicoIds)
  : { data: [] };

  const { data: pagamentos } = await supabase
    .from("pagamentos")
    .select("*")
    .eq("cliente_id", id)
    .order("data_pagamento", { ascending: false });

  const totalPago =
    pagamentos?.reduce(
      (total, pagamento) => total + Number(pagamento.valor || 0),
      0
    ) || 0;

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6">
          <a
            href="/clientes"
            className="text-sm font-medium text-pink-600 hover:text-pink-700"
          >
            ← Voltar para clientes
          </a>

          <h1 className="mt-3 text-3xl font-bold text-gray-800">
            {cliente.nome}
          </h1>

          <p className="mt-1 text-gray-600">
            Histórico e informações da cliente
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow">
            <div className="text-sm text-gray-500">
              WhatsApp
            </div>

            <div className="mt-1 text-lg font-bold text-gray-800">
              {cliente.whatsapp}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <div className="text-sm text-gray-500">
              Atendimentos
            </div>

            <div className="mt-1 text-2xl font-bold text-pink-600">
              {agendamentos?.length || 0}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <div className="text-sm text-gray-500">
              Pagamento total
            </div>

            <div className="mt-1 text-2xl font-bold text-green-600">
              {formatarMoeda(totalPago)}
            </div>
          </div>

        </div>

        {cliente.observacoes && (
          <div className="mb-6 rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-2 text-lg font-bold text-gray-800">
              Observações
            </h2>

            <p className="text-gray-600">
              {cliente.observacoes}
            </p>
          </div>
        )}

        <div className="mb-6 rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            📅 Histórico de atendimentos
          </h2>

          {agendamentos && agendamentos.length > 0 ? (
            <div className="space-y-3">
              {agendamentos.map((item) => {
                const servico = servicos?.find(
  (itemServico) => itemServico.id === item.servico_id
);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-pink-200 bg-pink-50 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <div className="font-bold text-gray-800">
                          {formatarData(item.data)}
                        </div>

                        <div className="text-sm text-gray-600">
                          {formatarHora(item.hora_inicio)} às{" "}
                          {formatarHora(item.hora_fim)}
                        </div>

                       <div className="mt-1 font-medium text-pink-700">
  {servico?.nome || "Serviço"}
</div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-gray-800">
                          {formatarMoeda(servico?.preco)}
                        </div>

                        <span className="text-sm text-gray-500">
                          {item.status}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">
              Nenhum atendimento registrado.
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            💰 Pagamentos
          </h2>

          {pagamentos && pagamentos.length > 0 ? (
            <div className="space-y-3">
              {pagamentos.map((pagamento) => (
                <div
                  key={pagamento.id}
                  className="flex flex-col gap-2 rounded-xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-bold text-gray-800">
                      {formatarData(pagamento.data_pagamento)}
                    </div>

                    <div className="text-sm text-gray-600">
                      {pagamento.forma_pagamento}
                    </div>
                  </div>

                  <div className="font-bold text-green-700">
                    {formatarMoeda(pagamento.valor)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              Nenhum pagamento registrado.
            </p>
          )}
        </div>

      </div>
    </main>
  );
}