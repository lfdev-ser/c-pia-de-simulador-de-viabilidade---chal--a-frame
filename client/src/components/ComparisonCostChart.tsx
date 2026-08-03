import { useMemo } from 'react';
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
  LineChart,
  Line,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { ComparisonRecord } from '@/lib/comparisonHistory';

interface ComparisonCostChartProps {
  comparisons: ComparisonRecord[];
}

export function ComparisonCostChart({ comparisons }: ComparisonCostChartProps) {
  const chartData = useMemo(() => {
    if (comparisons.length === 0) return [];

    return comparisons.slice(0, 10).map((comp, idx) => ({
      name: `${idx + 1}. ${comp.name.substring(0, 15)}...`,
      sim1Cost: comp.sim1.totalCost,
      sim2Cost: comp.sim2.totalCost,
      difference: Math.abs(comp.analysis.costDifference),
      bestOption: comp.analysis.bestOption,
    }));
  }, [comparisons]);

  const timelineData = useMemo(() => {
    if (comparisons.length === 0) return [];

    return comparisons
      .slice()
      .reverse()
      .slice(0, 10)
      .map((comp, idx) => ({
        date: new Date(comp.timestamp).toLocaleDateString('pt-BR', {
          month: 'short',
          day: 'numeric',
        }),
        sim1: comp.sim1.totalCost,
        sim2: comp.sim2.totalCost,
        difference: Math.abs(comp.analysis.costDifference),
      }));
  }, [comparisons]);

  const costDistribution = useMemo(() => {
    if (comparisons.length === 0) return [];

    const sim1Total = comparisons.reduce((sum, c) => sum + c.sim1.totalCost, 0);
    const sim2Total = comparisons.reduce((sum, c) => sum + c.sim2.totalCost, 0);

    return [
      { name: 'Simulação 1', value: sim1Total, color: '#15803d' },
      { name: 'Simulação 2', value: sim2Total, color: '#0891b2' },
    ];
  }, [comparisons]);

  const stats = useMemo(() => {
    if (comparisons.length === 0) return null;

    const avgDifference =
      comparisons.reduce((sum, c) => sum + Math.abs(c.analysis.costDifference), 0) /
      comparisons.length;
    const maxDifference = Math.max(
      ...comparisons.map(c => Math.abs(c.analysis.costDifference))
    );
    const minDifference = Math.min(
      ...comparisons.map(c => Math.abs(c.analysis.costDifference))
    );

    return {
      avgDifference,
      maxDifference,
      minDifference,
      totalComparisons: comparisons.length,
    };
  }, [comparisons]);

  if (comparisons.length === 0) {
    return (
      <Card className="p-6 bg-white border-[#e8e6e1] text-center">
        <p className="text-[#6b6b6b]">Nenhuma comparação para exibir gráficos</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-xs text-blue-600 mb-1">Total de Comparações</p>
            <p className="text-2xl font-bold text-blue-900">{stats.totalComparisons}</p>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-xs text-green-600 mb-1">Diferença Média</p>
            <p className="text-2xl font-bold text-green-900">
              R$ {stats.avgDifference.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
          </Card>
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <p className="text-xs text-yellow-600 mb-1">Diferença Máxima</p>
            <p className="text-2xl font-bold text-yellow-900">
              R$ {stats.maxDifference.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200">
            <p className="text-xs text-purple-600 mb-1">Diferença Mínima</p>
            <p className="text-2xl font-bold text-purple-900">
              R$ {stats.minDifference.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
          </Card>
        </div>
      )}

      {/* Cost Comparison Bar Chart */}
      <Card className="p-6 bg-white border-[#e8e6e1]">
        <h3 className="text-lg font-bold text-[#2d2d2d] mb-4">📊 Comparação de Custos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e1" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis
              label={{ value: 'Custo (R$)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: any) =>
                `R$ ${(value as number).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
              }
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e8e6e1' }}
            />
            <Legend />
            <Bar dataKey="sim1Cost" fill="#15803d" name="Simulação 1" />
            <Bar dataKey="sim2Cost" fill="#0891b2" name="Simulação 2" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Timeline Chart */}
      <Card className="p-6 bg-white border-[#e8e6e1]">
        <h3 className="text-lg font-bold text-[#2d2d2d] mb-4">📈 Evolução de Custos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e1" />
            <XAxis dataKey="date" />
            <YAxis
              label={{ value: 'Custo (R$)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: any) =>
                `R$ ${(value as number).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
              }
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e8e6e1' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="sim1"
              stroke="#15803d"
              name="Simulação 1"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="sim2"
              stroke="#0891b2"
              name="Simulação 2"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="difference"
              stroke="#d97706"
              name="Diferença"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Cost Distribution Pie Chart */}
      <Card className="p-6 bg-white border-[#e8e6e1]">
        <h3 className="text-lg font-bold text-[#2d2d2d] mb-4">💰 Distribuição de Custos Totais</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={costDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) =>
                `${name}: R$ ${(value / 1000).toFixed(0)}k (${(percent * 100).toFixed(0)}%)`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {costDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) =>
                `R$ ${(value as number).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
              }
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e8e6e1' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Summary Table */}
      <Card className="p-6 bg-white border-[#e8e6e1]">
        <h3 className="text-lg font-bold text-[#2d2d2d] mb-4">📋 Resumo Detalhado</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e6e1]">
                <th className="text-left py-2 px-2 font-semibold text-[#2d2d2d]">Comparação</th>
                <th className="text-right py-2 px-2 font-semibold text-[#2d2d2d]">Sim 1</th>
                <th className="text-right py-2 px-2 font-semibold text-[#2d2d2d]">Sim 2</th>
                <th className="text-right py-2 px-2 font-semibold text-[#2d2d2d]">Diferença</th>
                <th className="text-center py-2 px-2 font-semibold text-[#2d2d2d]">Melhor</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.slice(0, 5).map((comp, idx) => (
                <tr key={comp.id} className="border-b border-[#f0f0f0] hover:bg-[#f9f9f9]">
                  <td className="py-2 px-2 text-[#6b6b6b]">{idx + 1}. {comp.name}</td>
                  <td className="text-right py-2 px-2 text-[#2d2d2d]">
                    R$ {comp.sim1.totalCost.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="text-right py-2 px-2 text-[#2d2d2d]">
                    R$ {comp.sim2.totalCost.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="text-right py-2 px-2 font-semibold text-orange-600">
                    R$ {Math.abs(comp.analysis.costDifference).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="text-center py-2 px-2">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                      {comp.analysis.bestOption.includes('1') ? 'Sim 1' : 'Sim 2'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
