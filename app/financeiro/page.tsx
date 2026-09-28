"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Cliente = {
  id: string;
  nome: string;
  whatsapp: string;
};

type Servico = {
  id: string;
  nome: string;
  preco: number;
};

type Pagamento = {
  id: string;
  data_pagamento: string;
  valor: number;
  forma_pagamento: string;
  descricao: string | null;
};

type Despesa = {
  id: string;
  data: string;
  descricao: string;
  categoria: string | null;
  valor: number;
  forma_pagamento: string | null;
};

export default function Financeiro() {
  const supabase = createClient();

  const hoje = new Date().toISOString().slice(0, 10);

  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);

  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [valorPagamento, setValorPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Pix");

  const [descricaoDespesa, setDescricaoDespesa] = useState("");
  const [categoriaDespesa, setCategoriaDespesa] = useState("");
  const [valorDespesa, setValorDespesa] = useState("");
  const [formaDespesa, setFormaDespesa] = useState("Pix");

  const [mensagem, setMensagem] = useState("");

  async function carregarDados() {
    const { data: pagamentosData } = await supabase
      .from("pagamentos")
      .select("*")
      .gte("data_pagamento", dataInicio)
      .lte("data_pagamento", dataFim)
      .order("data_pagamento", { ascending: false });

    const { data: despesasData } = await supabase
      .from("despesas")
      .select("*")
      .gte("data", dataInicio)
      .lte("data", dataFim)
      .order("data", { ascending: false });

    setPagamentos(pagamentosData || []);
    setDespesas(despesasData || []);
  }

  async function carregarCadastros() {
    const { data: clientesData } = await supabase
      .from("clientes")
      .select("id, nome, whatsapp")
      .order("nome");

    const { data: servicosData } = await supabase
      .from("servicos")
      .select("id, nome, preco")
      .eq("ativo", true)
      .order("nome");

    setClientes(clientesData || []);
    setServicos(servicosData || []);
  }

  useEffect(() => {
    carregarDados();
  }, [dataInicio, dataFim]);

  useEffect(() => {
    carregarCadastros();
  }, []);

  function selecionarServico(id: string) {
    setServicoId(id);

    const servico = servicos.find((item) => item.id === id);

    if (servico) {
      setValorPagamento(String(servico.preco));
    }
  }

  async function cadastrarPagamento() {
    setMensagem("");

    const valor = Number(valorPagamento.replace(",", "."));

    if (!clienteId) {
      setMensagem("Selecione o cliente.");
      return;
    }

    if (!servicoId) {
      setMensagem("Selecione o serviço.");
      return;
    }

    if (!valor || valor <= 0) {
      setMensagem("Informe um valor válido para o pagamento.");
      return;
    }

    const cliente = clientes.find((item) => item.id === clienteId);
    const servico = servicos.find((item) => item.id === servicoId);

    const { error } = await supabase
      .from("pagamentos")
      .insert({
        cliente_id: clienteId,
        servico_id: servicoId,
        data_pagamento: hoje,
        valor,
        forma_pagamento: formaPagamento,
        status: "recebido",
        descricao: cliente && servico
          ? `${cliente.nome} - ${servico.nome}`
          : null,
      });

    if (error) {
      console.error(error);
      setMensagem("Não foi possível cadastrar o pagamento.");
      return;
    }

    setClienteId("");
    setServicoId("");
    setValorPagamento("");

    setMensagem("Pagamento cadastrado com sucesso!");

    await carregarDados();
  }

  async function cadastrarDespesa() {
    setMensagem("");

    const valor = Number(valorDespesa.replace(",", "."));

    if (!descricaoDespesa.trim()) {
      setMensagem("Informe a descrição da despesa.");
      return;
    }

    if (!valor || valor <= 0) {
      setMensagem("Informe um valor válido para a despesa.");
      return;
    }

    const { error } = await supabase
      .from("despesas")
      .insert({
        data: hoje,
        descricao: descricaoDespesa.trim(),
        categoria: categoriaDespesa.trim() || null,
        valor,
        forma_pagamento: formaDespesa,
      });

    if (error) {
      console.error(error);
      setMensagem("Não foi possível cadastrar a despesa.");
      return;
    }

    setDescricaoDespesa("");
    setCategoriaDespesa("");
    setValorDespesa("");

    setMensagem("Despesa cadastrada com sucesso!");

    await carregarDados();
  }

  const totalReceitas = pagamentos.reduce(
    (total, item) => total + Number(item.valor || 0),
    0
  );

  const totalDespesas = despesas.reduce(
    (total, item) => total + Number(item.valor || 0),
    0
  );

  const saldo = totalReceitas - totalDespesas;

  function moeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-6xl">

        <a
          href="/"
          className="text-sm font-medium text-pink-600"
        >
          ← Voltar para o dashboard
        </a>

        <h1 className="mt-3 text-3xl font-bold text-gray-800">
          Financeiro
        </h1>

        <p className="mt-1 text-gray-600">
          Controle de receitas, despesas e resultados.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow">
            <div className="text-sm text-gray-500">
              Receitas
            </div>

            <div className="mt-2 text-2xl font-bold text-green-600">
              {moeda(totalReceitas)}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <div className="text-sm text-gray-500">
              Despesas
            </div>

            <div className="mt-2 text-2xl font-bold text-red-600">
              {moeda(totalDespesas)}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <div className="text-sm text-gray-500">
              Resultado
            </div>

            <div className="mt-2 text-2xl font-bold text-pink-600">
              {moeda(saldo)}
            </div>
          </div>

        </div>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow">

          <h2 className="text-xl font-bold text-gray-800">
            Período
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Data inicial
              </label>

              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Data final
              </label>

              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

          </div>

        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">

          <div className="rounded-2xl bg-white p-5 shadow">

            <h2 className="text-xl font-bold text-gray-800">
              Registrar receita
            </h2>

            <div className="mt-4 space-y-3">

              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">
                  Selecione o cliente
                </option>

                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} - {cliente.whatsapp}
                  </option>
                ))}
              </select>

              <select
                value={servicoId}
                onChange={(e) => selecionarServico(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">
                  Selecione o serviço
                </option>

               {servicos.map((servico) => (
  <option key={servico.id} value={servico.id}>
    {servico.nome
      .replace(/ponta/gi, "tip")} - {moeda(Number(servico.preco))}
  </option>
))}
              </select>

              <input
                type="text"
                value={valorPagamento}
                onChange={(e) => setValorPagamento(e.target.value)}
                placeholder="Valor"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />

              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option>Pix</option>
                <option>Dinheiro</option>
                <option>Cartão de débito</option>
                <option>Cartão de crédito</option>
              </select>

              <button
                onClick={cadastrarPagamento}
                className="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white"
              >
                Registrar receita
              </button>

            </div>

          </div>

          <div className="rounded-2xl bg-white p-5 shadow">

            <h2 className="text-xl font-bold text-gray-800">
              Registrar despesa
            </h2>

            <div className="mt-4 space-y-3">

              <input
                type="text"
                value={descricaoDespesa}
                onChange={(e) => setDescricaoDespesa(e.target.value)}
                placeholder="Descrição"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />

              <input
                type="text"
                value={categoriaDespesa}
                onChange={(e) => setCategoriaDespesa(e.target.value)}
                placeholder="Categoria"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />

              <input
                type="text"
                value={valorDespesa}
                onChange={(e) => setValorDespesa(e.target.value)}
                placeholder="Valor"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />

              <select
                value={formaDespesa}
                onChange={(e) => setFormaDespesa(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option>Pix</option>
                <option>Dinheiro</option>
                <option>Cartão de débito</option>
                <option>Cartão de crédito</option>
              </select>

              <button
                onClick={cadastrarDespesa}
                className="w-full rounded-lg bg-red-600 px-4 py-2 font-medium text-white"
              >
                Registrar despesa
              </button>

            </div>

          </div>

        </div>

        {mensagem && (
          <div className="mt-6 rounded-lg bg-white p-4 text-center font-medium text-gray-700 shadow">
            {mensagem}
          </div>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">

          <div className="rounded-2xl bg-white p-5 shadow">

            <h2 className="text-xl font-bold text-gray-800">
              Receitas lançadas
            </h2>

            <div className="mt-4 space-y-3">

              {pagamentos.length === 0 ? (
                <p className="text-gray-500">
                  Nenhuma receita no período.
                </p>
              ) : (
                pagamentos.map((pagamento) => (
                  <div
                    key={pagamento.id}
                    className="rounded-xl border border-green-200 bg-green-50 p-4"
                  >
                    <div className="flex justify-between gap-4">

                      <div>
                        <div className="font-bold">
                          {pagamento.descricao || "Receita"}
                        </div>

                        <div className="text-sm text-gray-600">
                          {pagamento.forma_pagamento}
                        </div>
                      </div>

                      <div className="font-bold text-green-700">
                        {moeda(Number(pagamento.valor))}
                      </div>

                    </div>
                  </div>
                ))
              )}

            </div>

          </div>

          <div className="rounded-2xl bg-white p-5 shadow">

            <h2 className="text-xl font-bold text-gray-800">
              Despesas lançadas
            </h2>

            <div className="mt-4 space-y-3">

              {despesas.length === 0 ? (
                <p className="text-gray-500">
                  Nenhuma despesa no período.
                </p>
              ) : (
                despesas.map((despesa) => (
                  <div
                    key={despesa.id}
                    className="rounded-xl border border-red-200 bg-red-50 p-4"
                  >
                    <div className="flex justify-between gap-4">

                      <div>
                        <div className="font-bold">
                          {despesa.descricao}
                        </div>

                        <div className="text-sm text-gray-600">
                          {despesa.categoria || "Sem categoria"}
                        </div>

                        <div className="text-sm text-gray-500">
                          {despesa.forma_pagamento || ""}
                        </div>
                      </div>

                      <div className="font-bold text-red-700">
                        {moeda(Number(despesa.valor))}
                      </div>

                    </div>
                  </div>
                ))
              )}

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}