import { createClient } from "@/lib/supabase/server";
import GraficoFaturamento from "./dashboard/GraficoFaturamento";
import GraficoReceitasDespesas from "./dashboard/GraficoReceitasDespesas";

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function nomeServico(nome: string | null | undefined) {
  if (!nome) return "Serviço";

  return nome.replace(/ponta/gi, "tip");
}

export default async function Home() {
  const supabase = await createClient();

  const hoje = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  const inicioMes = `${hoje.slice(0, 7)}-01`;

  const { data: agendamentos, error } = await supabase
    .from("agendamentos")
    .select(`
      id,
      data,
      hora_inicio,
      hora_fim,
      status,
      clientes!inner (
        nome,
        whatsapp
      ),
      servicos!inner (
        nome,
        preco
      )
    `)
    .eq("data", hoje)
    .order("hora_inicio");

  const { data: pagamentosMes } = await supabase
    .from("pagamentos")
    .select(`
      valor,
      data_pagamento,
      forma_pagamento,
      cliente_id,
      servico_id,
      servicos (
        nome
      )
    `)
    .gte("data_pagamento", inicioMes)
    .lte("data_pagamento", hoje)
    .eq("status", "recebido");

  const { data: pagamentosHoje } = await supabase
    .from("pagamentos")
    .select("valor")
    .eq("data_pagamento", hoje)
    .eq("status", "recebido");

  const { data: despesasMes } = await supabase
    .from("despesas")
    .select("valor, data")
    .gte("data", inicioMes)
    .lte("data", hoje);

  const { count: totalClientes } = await supabase
    .from("clientes")
    .select("*", { count: "exact", head: true });

  const { count: totalAtendimentosMes } = await supabase
    .from("agendamentos")
    .select("*", { count: "exact", head: true })
    .gte("data", inicioMes)
    .lte("data", hoje)
    .eq("status", "concluido");

  const faturamentoHoje =
    pagamentosHoje?.reduce(
      (total, pagamento) =>
        total + Number(pagamento.valor || 0),
      0
    ) ?? 0;

  const faturamentoMes =
    pagamentosMes?.reduce(
      (total, pagamento) =>
        total + Number(pagamento.valor || 0),
      0
    ) ?? 0;

  const despesasMesTotal =
    despesasMes?.reduce(
      (total, despesa) =>
        total + Number(despesa.valor || 0),
      0
    ) ?? 0;

  const lucroMes = faturamentoMes - despesasMesTotal;

  const totalAtendimentosHoje = agendamentos?.length ?? 0;

  const ticketMedio =
    pagamentosMes && pagamentosMes.length > 0
      ? faturamentoMes / pagamentosMes.length
      : 0;

  const clientesAtendidasMes = new Set(
    (pagamentosMes || [])
      .map((pagamento) => pagamento.cliente_id)
      .filter(Boolean)
  ).size;

  const faturamentoPorServico = new Map<string, number>();

  (pagamentosMes || []).forEach((pagamento) => {
    const servico = Array.isArray(pagamento.servicos)
      ? pagamento.servicos[0]

      : pagamento.servicos;
if (!servico?.nome) {
  return;
}
    const nome = nomeServico(servico?.nome);

    faturamentoPorServico.set(
      nome,
      (faturamentoPorServico.get(nome) || 0) +
        Number(pagamento.valor || 0)
    );
  });

  const faturamentoPorPagamento = new Map<string, number>();

  (pagamentosMes || []).forEach((pagamento) => {
    const forma = pagamento.forma_pagamento || "Não informado";

    faturamentoPorPagamento.set(
      forma,
      (faturamentoPorPagamento.get(forma) || 0) +
        Number(pagamento.valor || 0)
    );
  });
const faturamentoPorDia = new Map<string, number>();

(pagamentosMes || []).forEach((pagamento) => {
  const data = pagamento.data_pagamento;

  faturamentoPorDia.set(
    data,
    (faturamentoPorDia.get(data) || 0) +
      Number(pagamento.valor || 0)
  );
});

const diasDoMes: string[] = [];

const dataAtual = new Date(`${inicioMes}T12:00:00`);

while (
  dataAtual.toISOString().slice(0, 7) === hoje.slice(0, 7)
) {
  diasDoMes.push(
    dataAtual.toISOString().slice(0, 10)
  );

  dataAtual.setDate(dataAtual.getDate() + 1);
}

const dadosGraficoFaturamento = diasDoMes.map((data) => ({
  data: data.split("-")[2],
  valor: faturamentoPorDia.get(data) || 0,
}));  
const despesasPorDia = new Map<string, number>();

(despesasMes || []).forEach((despesa) => {
  despesasPorDia.set(
    despesa.data,
    (despesasPorDia.get(despesa.data) || 0) +
      Number(despesa.valor || 0)
  );
});

const dadosGraficoReceitasDespesas = diasDoMes.map(
  (data) => ({
    data: data.split("-")[2],
    receitas: faturamentoPorDia.get(data) || 0,
    despesas: despesasPorDia.get(data) || 0,
  })
);
return (
    <main className="min-h-screen bg-pink-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Débora Kelly Nails Designer
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Painel administrativo
            </p>
          </div>

          <div className="rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700">
            Administrador
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Visão geral
          </h2>

          <p className="mt-1 text-gray-500">
            Resumo financeiro e operacional.
          </p>
        </div>

        {/* RESUMO FINANCEIRO */}

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Faturamento hoje
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {moeda(faturamentoHoje)}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Pagamentos recebidos hoje
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Faturamento do mês
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {moeda(faturamentoMes)}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Desde {inicioMes.split("-").reverse().join("/")}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Despesas do mês
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {moeda(despesasMesTotal)}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Despesas registradas
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Lucro do mês
            </p>

            <p
              className={`mt-2 text-3xl font-bold ${
                lucroMes >= 0
                  ? "text-pink-600"
                  : "text-red-600"
              }`}
            >
              {moeda(lucroMes)}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Receitas menos despesas
            </p>
          </div>
        </section>

        {/* ATENDIMENTOS E CLIENTES */}

        <section className="mt-5 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Atendimentos hoje
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalAtendimentosHoje}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Agendamentos do dia
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Atendimentos concluídos
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {totalAtendimentosMes ?? 0}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              No mês atual
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Clientes cadastradas
            </p>

            <p className="mt-2 text-3xl font-bold text-pink-600">
              {totalClientes ?? 0}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Base de clientes
            </p>
          </div>
        </section>

        {/* INDICADORES */}

        <section className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Ticket médio
            </p>

            <p className="mt-2 text-3xl font-bold text-pink-600">
              {moeda(ticketMedio)}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Média por atendimento pago
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Clientes atendidas
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {clientesAtendidasMes}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Clientes com pagamento no mês
            </p>
          </div>
        </section>

{/* GRÃFICO DE FATURAMENTO */}

<section className="mt-8">
  <GraficoFaturamento
    dados={dadosGraficoFaturamento}
  />
</section>
<section className="mt-8">
  <GraficoReceitasDespesas
    dados={dadosGraficoReceitasDespesas}
  />
</section>
        {/* FATURAMENTO POR SERVIÇO E PAGAMENTO */}

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">
              Faturamento por serviço
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Resultado do mês atual
            </p>

            <div className="mt-5 space-y-3">
              {Array.from(
                faturamentoPorServico.entries()
              ).map(([servico, valor]) => (
                <div
                  key={servico}
                  className="flex items-center justify-between rounded-xl bg-pink-50 p-4"
                >
                  <span className="font-medium text-gray-700">
                    {servico}
                  </span>

                  <span className="font-bold text-pink-700">
                    {moeda(valor)}
                  </span>
                </div>
              ))}

              {faturamentoPorServico.size === 0 && (
                <p className="text-gray-500">
                  Nenhum faturamento registrado no mês.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">
              Faturamento por pagamento
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Distribuição por forma de pagamento
            </p>

            <div className="mt-5 space-y-3">
              {Array.from(
                faturamentoPorPagamento.entries()
              ).map(([forma, valor]) => (
                <div
                  key={forma}
                  className="flex items-center justify-between rounded-xl bg-green-50 p-4"
                >
                  <span className="font-medium text-gray-700">
                    {forma}
                  </span>

                  <span className="font-bold text-green-700">
                    {moeda(valor)}
                  </span>
                </div>
              ))}

              {faturamentoPorPagamento.size === 0 && (
                <p className="text-gray-500">
                  Nenhum pagamento registrado no mês.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* AGENDA */}

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Agenda de hoje
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {hoje.split("-").reverse().join("/")}
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-red-100 p-4 text-red-800">
              Erro ao carregar os agendamentos:
              <br />
              {error.message}
            </div>
          )}

          {!error && agendamentos?.length === 0 && (
            <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
              <p className="font-medium text-gray-700">
                Nenhum agendamento para hoje.
              </p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {agendamentos?.map((agendamento) => (
              <div
                key={agendamento.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-100 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {agendamento.hora_inicio} —{" "}
                    {agendamento.hora_fim}
                  </p>

                  <p className="mt-1 font-medium text-gray-700">
                    {agendamento.clientes?.[0]?.nome}
                  </p>

                  <p className="text-sm text-gray-500">
                    {nomeServico(agendamento.servicos?.[0]?.nome)}
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {moeda(
                      Number(
                        agendamento.servicos?.[0]?.preco ?? 0
                      )
                    )}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
                    agendamento.status === "confirmado"
                      ? "bg-green-100 text-green-700"
                      : agendamento.status === "concluido"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {agendamento.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* TOLERÃ‚NCIA */}

        <div className="mt-8 rounded-2xl border border-pink-200 bg-pink-100 p-5">
          <p className="font-semibold text-pink-900">
            â° Tolerância para atrasos: 15 minutos.
          </p>

          <p className="mt-1 text-sm text-pink-800">
            Após esse período, o atendimento poderá ser
            reagendado conforme a disponibilidade.
          </p>
        </div>
      </div>
    </main>
  );
}

