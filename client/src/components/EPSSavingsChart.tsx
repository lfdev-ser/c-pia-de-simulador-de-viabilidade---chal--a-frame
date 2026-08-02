import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingDown } from 'lucide-react';

interface EPSSavingsChartProps {
  currentTotalCost: number;
  optimizedTotalCost: number;
  currentBlockCount: number;
  optimizedBlockCount: number;
  financialSavings: number;
  materialSavings: number;
}

export function EPSSavingsChart({
  currentTotalCost,
  optimizedTotalCost,
  currentBlockCount,
  optimizedBlockCount,
  financialSavings,
  materialSavings,
}: EPSSavingsChartProps) {
  const costData = [
    {
      name: 'Atual',
      custo: currentTotalCost,
      fill: '#ef4444',
    },
    {
      name: 'Otimizado',
      custo: optimizedTotalCost,
      fill: '#22c55e',
    },
  ];

  const blockData = [
    {
      name: 'Atual',
      blocos: currentBlockCount,
      fill: '#ef4444',
    },
    {
      name: 'Otimizado',
      blocos: optimizedBlockCount,
      fill: '#22c55e',
    },
  ];

  const savingsPercentage = ((financialSavings / currentTotalCost) * 100).toFixed(1);
  const blockReductionPercentage = ((materialSavings / currentBlockCount) * 100).toFixed(1);

  const pieData = [
    { name: 'Economia', value: parseFloat(savingsPercentage) },
    { name: 'Custo Otimizado', value: 100 - parseFloat(savingsPercentage) },
  ];

  const COLORS = ['#22c55e', '#e5e7eb'];

  return (
    <div className="w-full space-y-6 bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-bold text-gray-800">Análise de Economia com EPS Otimizado</h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Economia Financeira</p>
          <p className="text-2xl font-bold text-green-600">R$ {financialSavings.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{savingsPercentage}% de redução</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Blocos Economizados</p>
          <p className="text-2xl font-bold text-blue-600">{materialSavings}</p>
          <p className="text-xs text-gray-500 mt-1">{blockReductionPercentage}% menos blocos</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Custo por Bloco</p>
          <p className="text-2xl font-bold text-orange-600">R$ {(financialSavings / materialSavings).toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Economia média</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Comparison */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-4">Comparação de Custos</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => `R$ ${(value as number).toFixed(2)}`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Bar dataKey="custo" fill="#8884d8" radius={[8, 8, 0, 0]}>
                {costData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-sm text-gray-600 text-center">
            <strong>Economia Total:</strong> R$ {financialSavings.toFixed(2)}
          </div>
        </div>

        {/* Block Reduction */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-4">Redução de Blocos</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={blockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => `${value} blocos`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Bar dataKey="blocos" fill="#8884d8" radius={[8, 8, 0, 0]}>
                {blockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-sm text-gray-600 text-center">
            <strong>Blocos Economizados:</strong> {materialSavings}
          </div>
        </div>
      </div>

      {/* Savings Percentage Pie */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">Proporção de Economia</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Summary */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">📊 Resumo Detalhado</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Custo Atual (EPS)</p>
            <p className="text-lg font-bold text-gray-800">R$ {currentTotalCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Custo Otimizado (EPS)</p>
            <p className="text-lg font-bold text-green-600">R$ {optimizedTotalCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Blocos Atuais</p>
            <p className="text-lg font-bold text-gray-800">{currentBlockCount}</p>
          </div>
          <div>
            <p className="text-gray-600">Blocos Otimizados</p>
            <p className="text-lg font-bold text-green-600">{optimizedBlockCount}</p>
          </div>
        </div>
      </div>

      {/* ROI Message */}
      <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-center">
        <p className="text-green-800 font-semibold">
          ✅ Ao aplicar as dimensões otimizadas, você economiza <strong>R$ {financialSavings.toFixed(2)}</strong> e reduz o desperdício em <strong>{blockReductionPercentage}%</strong>!
        </p>
      </div>
    </div>
  );
}
