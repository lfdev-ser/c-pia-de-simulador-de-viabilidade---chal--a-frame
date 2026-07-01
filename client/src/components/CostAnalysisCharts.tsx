import React, { useMemo } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';

interface CostAnalysisChartsProps {
  concreteCost: number;
  steelCost: number;
  epsCost: number;
  accessoriesCost: number;
  iceflexCost: number;
  icfibraCost: number;
  laborCost: number;
  totalCost: number;
}

export default function CostAnalysisCharts({
  concreteCost,
  steelCost,
  epsCost,
  accessoriesCost,
  iceflexCost,
  icfibraCost,
  laborCost,
  totalCost,
}: CostAnalysisChartsProps) {
  // Cores para os gráficos
  const COLORS = {
    concrete: '#8b7355',
    steel: '#6b7280',
    eps: '#3b82f6',
    accessories: '#f59e0b',
    iceflex: '#10b981',
    icfibra: '#8b5cf6',
    labor: '#ef4444',
  };

  // Dados para gráfico de pizza - Materiais vs Mão de Obra
  const overviewData = useMemo(() => {
    const totalMaterials = concreteCost + steelCost + epsCost + accessoriesCost + iceflexCost + icfibraCost;
    return [
      { name: 'Materiais ICF', value: totalMaterials, percentage: totalCost > 0 ? ((totalMaterials / totalCost) * 100).toFixed(1) : 0 },
      { name: 'Mão de Obra', value: laborCost, percentage: totalCost > 0 ? ((laborCost / totalCost) * 100).toFixed(1) : 0 },
    ].filter(item => item.value > 0);
  }, [concreteCost, steelCost, epsCost, accessoriesCost, iceflexCost, icfibraCost, laborCost, totalCost]);

  // Dados para gráfico de barras - Detalhamento de materiais
  const materialsData = useMemo(() => {
    return [
      { name: 'Concreto', value: concreteCost, color: COLORS.concrete },
      { name: 'Aço', value: steelCost, color: COLORS.steel },
      { name: 'EPS', value: epsCost, color: COLORS.eps },
      { name: 'Acessórios', value: accessoriesCost, color: COLORS.accessories },
      { name: 'Iceflex', value: iceflexCost, color: COLORS.iceflex },
      { name: 'ICFibra', value: icfibraCost, color: COLORS.icfibra },
    ].filter(item => item.value > 0);
  }, [concreteCost, steelCost, epsCost, accessoriesCost, iceflexCost, icfibraCost]);

  // Dados para gráfico de barras - Comparação Materiais vs Mão de Obra
  const comparisonData = useMemo(() => {
    const totalMaterials = concreteCost + steelCost + epsCost + accessoriesCost + iceflexCost + icfibraCost;
    return [
      { name: 'Materiais', value: totalMaterials },
      { name: 'Mão de Obra', value: laborCost },
    ].filter(item => item.value > 0);
  }, [concreteCost, steelCost, epsCost, accessoriesCost, iceflexCost, icfibraCost, laborCost]);

  const overviewColors = ['#10b981', '#ef4444'];

  // Se não houver custos, não exibir gráficos
  if (totalCost === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-bold text-[#2d2d2d]">📊 Análise de Custos</h3>

      {/* Gráfico de Pizza - Visão Geral */}
      {overviewData.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-[#f5f3f0] to-[#faf8f3]">
          <h4 className="font-semibold text-[#2d2d2d] mb-4">Distribuição Geral: Materiais vs Mão de Obra</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={overviewData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {overviewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={overviewColors[index % overviewColors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {overviewData.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-[#e8e6e1]">
                <p className="text-xs text-[#6b6b6b]">{item.name}</p>
                <p className="text-lg font-bold text-[#2d2d2d]">
                  R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-[#15803d] font-semibold">{item.percentage}% do total</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Gráfico de Barras - Detalhamento de Materiais */}
      {materialsData.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-[#f5f3f0] to-[#faf8f3]">
          <h4 className="font-semibold text-[#2d2d2d] mb-4">Detalhamento de Materiais ICF</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={materialsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e1" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b6b6b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b6b6b' }} />
              <Tooltip
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e8e6e1', borderRadius: '8px' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {materialsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {materialsData.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-[#e8e6e1]">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <p className="text-xs text-[#6b6b6b]">{item.name}</p>
                </div>
                <p className="text-sm font-bold text-[#2d2d2d]">
                  R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Gráfico de Barras - Comparação */}
      {comparisonData.length > 1 && (
        <Card className="p-6 bg-gradient-to-br from-[#f5f3f0] to-[#faf8f3]">
          <h4 className="font-semibold text-[#2d2d2d] mb-4">Comparação: Materiais vs Mão de Obra</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e1" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b6b6b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b6b6b' }} />
              <Tooltip
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e8e6e1', borderRadius: '8px' }}
              />
              <Bar dataKey="value" fill="#15803d" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {comparisonData.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-[#e8e6e1]">
                <p className="text-xs text-[#6b6b6b]">{item.name}</p>
                <p className="text-lg font-bold text-[#2d2d2d]">
                  R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-[#15803d] font-semibold">
                  {totalCost > 0 ? ((item.value / totalCost) * 100).toFixed(1) : 0}% do total
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Resumo Total */}
      <Card className="p-6 bg-gradient-to-r from-[#15803d] to-[#2d5016]">
        <div className="grid grid-cols-3 gap-4 text-white">
          <div>
            <p className="text-xs opacity-90">Total de Materiais</p>
            <p className="text-2xl font-bold">
              R$ {(concreteCost + steelCost + epsCost + accessoriesCost + iceflexCost + icfibraCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs opacity-90">Total de Mão de Obra</p>
            <p className="text-2xl font-bold">
              R$ {laborCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs opacity-90">Orçamento Total</p>
            <p className="text-2xl font-bold">
              R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
