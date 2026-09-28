"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Cliente = {
  id: string;
  nome: string;
  whatsapp: string;
  observacoes: string | null;
  created_at: string;
};

export default function Clientes() {
  const supabase = createClient();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function carregarClientes() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nome");

    if (!error && data) {
      setClientes(data);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  async function cadastrarCliente() {
    setMensagem("");

    if (!nome.trim() || !whatsapp.trim()) {
      setMensagem("Informe o nome e o WhatsApp.");
      return;
    }

    setCarregando(true);

    const { error } = await supabase
      .from("clientes")
      .insert({
        nome: nome.trim(),
        whatsapp: whatsapp.trim(),
        observacoes: observacoes.trim() || null,
      });

    setCarregando(false);

    if (error) {
      if (error.code === "23505") {
        setMensagem("Este WhatsApp já está cadastrado.");
      } else {
        setMensagem("Não foi possível cadastrar o cliente.");
      }

      return;
    }

    setNome("");
    setWhatsapp("");
    setObservacoes("");
    setMensagem("Cliente cadastrado com sucesso!");

    carregarClientes();
  }

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Clientes
          </h1>

          <p className="mt-1 text-gray-600">
            Cadastro e histórico dos clientes da Débora
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Novo cliente
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nome
              </label>

              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome da cliente"
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                WhatsApp
              </label>

              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex.: 81999999999"
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Observações
              </label>

              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações sobre a cliente"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>

          </div>

          <button
            onClick={cadastrarCliente}
            disabled={carregando}
            className="mt-4 rounded-lg bg-pink-600 px-5 py-2 font-medium text-white hover:bg-pink-700 disabled:opacity-50"
          >
            {carregando ? "Cadastrando..." : "Cadastrar cliente"}
          </button>

          {mensagem && (
            <p className="mt-3 font-medium text-gray-700">
              {mensagem}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Clientes cadastrados
          </h2>

          {clientes.length === 0 ? (
            <p className="text-gray-500">
              Nenhum cliente cadastrado.
            </p>
          ) : (
            <div className="space-y-3">
              {clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        {cliente.nome}
                      </div>

                      <div className="text-sm text-gray-600">
                        WhatsApp: {cliente.whatsapp}
                      </div>

                      {cliente.observacoes && (
                        <div className="mt-1 text-sm text-gray-600">
                          Observações: {cliente.observacoes}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/clientes/${cliente.id}`}
                      className="inline-block rounded-lg bg-pink-600 px-4 py-2 text-center font-medium text-white hover:bg-pink-700"
                    >
                      Ver detalhes
                    </Link>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}