"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Dado = {
  data: string;
  valor: number;
};

type Props = {
  dados: Dado[];
};

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function GraficoFaturamento({ dados }: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900">
        Faturamento por dia
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Receitas recebidas no mês atual
      </p>

      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="data" />

            <YAxis
              tickFormatter={(valor) =>
                `R$ ${valor}`
              }
            />

            <Tooltip
              formatter={(valor) =>
                moeda(Number(valor))
              }
            />

            <Bar
              dataKey="valor"
              name="Faturamento"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}