import { supabase } from "@/lib/supabase";

export default async function TesteSupabase() {
  const { data, error } = await supabase
    .from("servicos")
    .select("id, nome, preco, duracao_minutos")
    .order("nome");

  return (
    <main className="min-h-screen bg-pink-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Teste do Supabase
      </h1>

      {error ? (
        <div className="mt-6 rounded-xl bg-red-100 p-5 text-red-800">
          <p className="font-bold">Erro:</p>
          <p>{error.message}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {data?.map((servico) => (
            <div
              key={servico.id}
              className="rounded-xl bg-white p-5 shadow-sm"
            >
              <p className="text-lg font-bold">{servico.nome}</p>
              <p className="text-gray-600">
                R$ {Number(servico.preco).toFixed(2).replace(".", ",")}
              </p>
              <p className="text-sm text-gray-500">
                Duração: {servico.duracao_minutos} minutos
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}