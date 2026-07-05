import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingDown, TrendingUp, Lightbulb, X } from 'lucide-react';
import { toast } from 'sonner';
import { generateIntelligentAnalysis } from '@/lib/intelligentAnalysis';

interface SimulationData {
  base: number;
  height: number;
  length: number;
  angle: number;
  usefulWidth: number;
  utilization: number;
  faceLength: number;
  totalArea: number;
  volume: number;
  wallArea: number;
  concreteVolume: number;
  steelWeight: number;
  epsVolume: number;
  epsWeight: number;
}

interface CostData {
  concreteCost: number;
  steelCost: number;
  epsCost: number;
  accessoriesCost: number;
  iceflexCost: number;
  icfibraCost: number;
  laborCost: number;
  customMaterialsCost: number;
  foundationCost: number;
  iceflexBaldesNeeded: number;
  icfibraRolosNeeded: number;
  icfTotalCost: number;
  totalCost: number;
  costPerM2: number;
  costPerM2WithLabor: number;
  laborCostPerM2: number;
}

interface AdvancedComparisonProps {
  sim1Name: string;
  sim1Data: SimulationData;
  sim1Costs: CostData;
  sim2Name: string;
  sim2Data: SimulationData;
  sim2Costs: CostData;
  onClose: () => void;
}

export default function AdvancedComparison({
  sim1Name,
  sim1Data,
  sim1Costs,
  sim2Name,
  sim2Data,
  sim2Costs,
  onClose,
}: AdvancedComparisonProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analysis = useMemo(
    () => generateIntelligentAnalysis(sim1Name, sim1Data, sim1Costs, sim2Name, sim2Data, sim2Costs),
    [sim1Name, sim1Data, sim1Costs, sim2Name, sim2Data, sim2Costs]
  );

  // Calcular diferenças
  const differences = useMemo(() => {
    const costDiff = sim2Costs.totalCost - sim1Costs.totalCost;
    const costDiffPercent = (costDiff / sim1Costs.totalCost) * 100;
    const costPerM2Diff = sim2Costs.costPerM2 - sim1Costs.costPerM2;
    const costPerM2WithLaborDiff = sim2Costs.costPerM2WithLabor - sim1Costs.costPerM2WithLabor;
    const areaDiff = sim2Data.totalArea - sim1Data.totalArea;

    return {
      costDiff,
      costDiffPercent,
      areaDiff,
      costPerM2Diff,
      costPerM2WithLaborDiff,
      isSim2More: costDiff > 0,
    };
  }, [sim1Costs, sim2Costs, sim1Data, sim2Data]);

  // Dados para gráfico de custos
  const costChartData = [
    {
      name: 'Concreto',
      [sim1Name]: sim1Costs.concreteCost,
      [sim2Name]: sim2Costs.concreteCost,
    },
    {
      name: 'Aço',
      [sim1Name]: sim1Costs.steelCost,
      [sim2Name]: sim2Costs.steelCost,
    },
    {
      name: 'EPS',
      [sim1Name]: sim1Costs.epsCost,
      [sim2Name]: sim2Costs.epsCost,
    },
    {
      name: 'Acessórios',
      [sim1Name]: sim1Costs.accessoriesCost,
      [sim2Name]: sim2Costs.accessoriesCost,
    },
    {
      name: 'Iceflex',
      [sim1Name]: sim1Costs.iceflexCost,
      [sim2Name]: sim2Costs.iceflexCost,
    },
    {
      name: 'ICFibra',
      [sim1Name]: sim1Costs.icfibraCost,
      [sim2Name]: sim2Costs.icfibraCost,
    },
    {
      name: 'Mão de Obra',
      [sim1Name]: sim1Costs.laborCost,
      [sim2Name]: sim2Costs.laborCost,
    },
    {
      name: 'Materiais Custom',
      [sim1Name]: sim1Costs.customMaterialsCost,
      [sim2Name]: sim2Costs.customMaterialsCost,
    },
    {
      name: 'Fundação',
      [sim1Name]: sim1Costs.foundationCost,
      [sim2Name]: sim2Costs.foundationCost,
    },
  ];

  // Dados para gráfico de pizza (distribuição de custos)
  const sim1PieData = [
    { name: 'Concreto', value: sim1Costs.concreteCost },
    { name: 'Aço', value: sim1Costs.steelCost },
    { name: 'EPS', value: sim1Costs.epsCost },
    { name: 'Iceflex', value: sim1Costs.iceflexCost },
    { name: 'Outros', value: sim1Costs.accessoriesCost + sim1Costs.icfibraCost + sim1Costs.laborCost + sim1Costs.customMaterialsCost + sim1Costs.foundationCost },
  ];

  const sim2PieData = [
    { name: 'Concreto', value: sim2Costs.concreteCost },
    { name: 'Aço', value: sim2Costs.steelCost },
    { name: 'EPS', value: sim2Costs.epsCost },
    { name: 'Iceflex', value: sim2Costs.iceflexCost },
    { name: 'Outros', value: sim2Costs.accessoriesCost + sim2Costs.icfibraCost + sim2Costs.laborCost + sim2Costs.customMaterialsCost + sim2Costs.foundationCost },
  ];

  const COLORS = ['#15803d', '#dc2626', '#2563eb', '#f59e0b', '#8b5cf6'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleExportPDF = async () => {
    try {
      const element = document.getElementById('comparison-content');
      if (!element) {
        toast.error('Elemento de comparação não encontrado');
        return;
      }

      // Usar a função de exportação do navegador
      const printWindow = window.open('', '', 'width=1200,height=800');
      if (!printWindow) {
        toast.error('Não foi possível abrir janela de impressão');
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Comparação de Simulações</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h2 { color: #2d2d2d; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f5f5f5; }
              .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 20px 0; }
              .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
              .positive { color: #15803d; }
              .negative { color: #dc2626; }
            </style>
          </head>
          <body>
            <h2>Comparação de Simulações de Chalé A-frame</h2>
            <p><strong>${sim1Name}</strong> vs <strong>${sim2Name}</strong></p>
            
            <div class="summary">
              <div class="summary-card">
                <h3>Diferença de Custo Total</h3>
                <p class="${differences.isSim2More ? 'negative' : 'positive'}">
                  ${formatCurrency(Math.abs(differences.costDiff))}
                  (${differences.isSim2More ? '+' : '-'}${Math.abs(differences.costDiffPercent).toFixed(1)}%)
                </p>
              </div>
              <div class="summary-card">
                <h3>Custo por m² de Parede (ICF)</h3>
                <p>${formatCurrency(Math.abs(differences.costPerM2Diff))}</p>
              </div>
              <div class="summary-card">
                <h3>Diferença de Área</h3>
                <p>${Math.abs(differences.areaDiff).toFixed(2)} m²</p>
              </div>
            </div>

            <h3>Dimensões</h3>
            <table>
              <tr>
                <th>Dimensão</th>
                <th>${sim1Name}</th>
                <th>${sim2Name}</th>
              </tr>
              <tr>
                <td>Base</td>
                <td>${sim1Data.base.toFixed(2)} m</td>
                <td>${sim2Data.base.toFixed(2)} m</td>
              </tr>
              <tr>
                <td>Altura</td>
                <td>${sim1Data.height.toFixed(2)} m</td>
                <td>${sim2Data.height.toFixed(2)} m</td>
              </tr>
              <tr>
                <td>Comprimento</td>
                <td>${sim1Data.length.toFixed(2)} m</td>
                <td>${sim2Data.length.toFixed(2)} m</td>
              </tr>
              <tr>
                <td>Ângulo</td>
                <td>${sim1Data.angle.toFixed(1)}°</td>
                <td>${sim2Data.angle.toFixed(1)}°</td>
              </tr>
              <tr>
                <td>Área Total</td>
                <td>${sim1Data.totalArea.toFixed(2)} m²</td>
                <td>${sim2Data.totalArea.toFixed(2)} m²</td>
              </tr>
              <tr>
                <td>Área de Paredes</td>
                <td>${sim1Data.wallArea.toFixed(2)} m²</td>
                <td>${sim2Data.wallArea.toFixed(2)} m²</td>
              </tr>
              <tr>
                <td>Volume</td>
                <td>${sim1Data.volume.toFixed(2)} m³</td>
                <td>${sim2Data.volume.toFixed(2)} m³</td>
              </tr>
            </table>

            <h3>Comparação de Custos (Componentes ICF)</h3>
            <table>
              <tr>
                <th>Material</th>
                <th>${sim1Name}</th>
                <th>${sim2Name}</th>
                <th>Diferença</th>
              </tr>
              <tr>
                <td>Concreto</td>
                <td>${formatCurrency(sim1Costs.concreteCost)}</td>
                <td>${formatCurrency(sim2Costs.concreteCost)}</td>
                <td class="${sim2Costs.concreteCost > sim1Costs.concreteCost ? 'negative' : 'positive'}">
                  ${formatCurrency(Math.abs(sim2Costs.concreteCost - sim1Costs.concreteCost))}
                </td>
              </tr>
              <tr>
                <td>Aço</td>
                <td>${formatCurrency(sim1Costs.steelCost)}</td>
                <td>${formatCurrency(sim2Costs.steelCost)}</td>
                <td class="${sim2Costs.steelCost > sim1Costs.steelCost ? 'negative' : 'positive'}">
                  ${formatCurrency(Math.abs(sim2Costs.steelCost - sim1Costs.steelCost))}
                </td>
              </tr>
              <tr>
                <td>EPS (Blocos)</td>
                <td>${formatCurrency(sim1Costs.epsCost)}</td>
                <td>${formatCurrency(sim2Costs.epsCost)}</td>
                <td class="${sim2Costs.epsCost > sim1Costs.epsCost ? 'negative' : 'positive'}">
                  ${formatCurrency(Math.abs(sim2Costs.epsCost - sim1Costs.epsCost))}
                </td>
              </tr>
              <tr>
                <td>Iceflex (Acabamento)</td>
                <td>${formatCurrency(sim1Costs.iceflexCost)}</td>
                <td>${formatCurrency(sim2Costs.iceflexCost)}</td>
                <td class="${sim2Costs.iceflexCost > sim1Costs.iceflexCost ? 'negative' : 'positive'}">
                  ${formatCurrency(Math.abs(sim2Costs.iceflexCost - sim1Costs.iceflexCost))}
                </td>
              </tr>
              <tr>
                <td>Mão de Obra</td>
                <td>${formatCurrency(sim1Costs.laborCost)}</td>
                <td>${formatCurrency(sim2Costs.laborCost)}</td>
                <td class="${sim2Costs.laborCost > sim1Costs.laborCost ? 'negative' : 'positive'}">
                  ${formatCurrency(Math.abs(sim2Costs.laborCost - sim1Costs.laborCost))}
                </td>
              </tr>
              <tr>
                <td>Fundação</td>
                <td>${formatCurrency(sim1Costs.foundationCost)}</td>
                <td>${formatCurrency(sim2Costs.foundationCost)}</td>
                <td class="${sim2Costs.foundationCost > sim1Costs.foundationCost ? 'negative' : 'positive'}">
                  ${formatCurrency(Math.abs(sim2Costs.foundationCost - sim1Costs.foundationCost))}
                </td>
              </tr>
              <tr style="background-color: #f5f5f5; font-weight: bold;">
                <td>TOTAL</td>
                <td>${formatCurrency(sim1Costs.totalCost)}</td>
                <td>${formatCurrency(sim2Costs.totalCost)}</td>
                <td class="${differences.isSim2More ? 'negative' : 'positive'}">
                  ${formatCurrency(Math.abs(differences.costDiff))}
                </td>
              </tr>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  // Show analysis modal if requested
  if (showAnalysis) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-yellow-300" />
              <h2 className="text-2xl font-bold text-white">Análise Inteligente de Custo-Benefício</h2>
            </div>
            <button
              onClick={() => setShowAnalysis(false)}
              className="text-white hover:bg-blue-800 p-2 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Winner Badge */}
            <div className="flex items-center justify-center">
              <div className={`px-6 py-3 rounded-lg text-center ${
                analysis.winner === 'sim1'
                  ? 'bg-green-100 border-2 border-green-500'
                  : analysis.winner === 'sim2'
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-100 border-2 border-gray-500'
              }`}>
                <p className={`text-lg font-bold ${
                  analysis.winner === 'sim1'
                    ? 'text-green-700'
                    : analysis.winner === 'sim2'
                      ? 'text-blue-700'
                      : 'text-gray-700'
                }`}>
                  {analysis.winner === 'sim1'
                    ? `🏆 ${sim1Name} é a melhor opção`
                    : analysis.winner === 'sim2'
                      ? `🏆 ${sim2Name} é a melhor opção`
                      : '⚖️ Ambas as opções são viáveis'}
                </p>
              </div>
            </div>

            {/* Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Pontuação de Custo-Benefício (0-100)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{sim1Name}</span>
                      <span className="text-lg font-bold text-green-600">{analysis.scores.sim1Score}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${analysis.scores.sim1Score}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{sim2Name}</span>
                      <span className="text-lg font-bold text-blue-600">{analysis.scores.sim2Score}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${analysis.scores.sim2Score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Details */}
            <Card>
              <CardHeader>
                <CardTitle>Análise Detalhada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-2">💰 Custo por m² de Parede (ICF)</p>
                    <p className="text-sm text-blue-800">{analysis.metrics.costPerM2Comparison}</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-semibold text-purple-900 mb-2">📦 Custo por Volume</p>
                    <p className="text-sm text-purple-800">{analysis.metrics.costPerM3Comparison}</p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm font-semibold text-orange-900 mb-2">🏠 Custo por Área Útil</p>
                    <p className="text-sm text-orange-800">{analysis.metrics.costPerUsefulM2Comparison}</p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-semibold text-green-900 mb-2">📐 Aproveitamento de Espaço</p>
                    <p className="text-sm text-green-800">{analysis.metrics.spaceEfficiencyComparison}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendation */}
            <Card className="border-2 border-yellow-400 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-900">✨ Recomendação Final</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-900 leading-relaxed">{analysis.metrics.overallRecommendation}</p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowAnalysis(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Voltar para Comparação
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#2d2d2d]">Comparação Detalhada</h2>
          <div className="flex gap-3">
            <Button onClick={() => setShowAnalysis(true)} className="bg-blue-600 hover:bg-blue-700">
              <Lightbulb className="w-4 h-4 mr-2" />
              Análise Inteligente
            </Button>
            <Button onClick={handleExportPDF} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </div>
        </div>

        <div id="comparison-content" className="p-6 space-y-8">
          {/* Resumo de Diferenças */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={`border-l-4 ${differences.isSim2More ? 'border-red-500' : 'border-green-500'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {differences.isSim2More ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  )}
                  Diferença de Custo Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${differences.isSim2More ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(Math.abs(differences.costDiff))}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {differences.isSim2More ? '+' : '-'}{Math.abs(differences.costDiffPercent).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Custo por m² de Parede (ICF)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#2d2d2d]">{formatCurrency(Math.abs(differences.costPerM2Diff))}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {sim1Name}: {formatCurrency(sim1Costs.costPerM2)} | {sim2Name}: {formatCurrency(sim2Costs.costPerM2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Custo por m² com Mão de Obra</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#2d2d2d]">{formatCurrency(Math.abs(differences.costPerM2WithLaborDiff))}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {sim1Name}: {formatCurrency(sim1Costs.costPerM2WithLabor)} | {sim2Name}: {formatCurrency(sim2Costs.costPerM2WithLabor)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Comparação de Dimensões */}
          <Card>
            <CardHeader>
              <CardTitle>Dimensões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-[#2d2d2d]">{sim1Name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base:</span>
                      <span className="font-semibold">{sim1Data.base.toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Altura:</span>
                      <span className="font-semibold">{sim1Data.height.toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comprimento:</span>
                      <span className="font-semibold">{sim1Data.length.toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ângulo:</span>
                      <span className="font-semibold">{sim1Data.angle.toFixed(1)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Área Total:</span>
                      <span className="font-semibold">{sim1Data.totalArea.toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Área de Paredes:</span>
                      <span className="font-semibold">{sim1Data.wallArea.toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volume:</span>
                      <span className="font-semibold">{sim1Data.volume.toFixed(2)} m³</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-[#2d2d2d]">{sim2Name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base:</span>
                      <span className="font-semibold">{sim2Data.base.toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Altura:</span>
                      <span className="font-semibold">{sim2Data.height.toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comprimento:</span>
                      <span className="font-semibold">{sim2Data.length.toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ângulo:</span>
                      <span className="font-semibold">{sim2Data.angle.toFixed(1)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Área Total:</span>
                      <span className="font-semibold">{sim2Data.totalArea.toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Área de Paredes:</span>
                      <span className="font-semibold">{sim2Data.wallArea.toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volume:</span>
                      <span className="font-semibold">{sim2Data.volume.toFixed(2)} m³</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Custos Comparativo */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Custos por Material</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey={sim1Name} fill="#15803d" />
                  <Bar dataKey={sim2Name} fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráficos de Pizza */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{sim1Name} - Distribuição de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sim1PieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sim1PieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{sim2Name} - Distribuição de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sim2PieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sim2PieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Comparação Detalhada de Materiais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Comparação Detalhada de Materiais e Custos por m²
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Ocultar' : 'Mostrar'}
                </Button>
              </CardTitle>
            </CardHeader>
            {showDetails && (
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3">Material</th>
                        <th className="text-right py-2 px-3">{sim1Name}</th>
                        <th className="text-right py-2 px-3">{sim2Name}</th>
                        <th className="text-right py-2 px-3">Diferença</th>
                        <th className="text-right py-2 px-3">% Diferença</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3">Concreto (m³)</td>
                        <td className="text-right">{sim1Data.concreteVolume.toFixed(2)}</td>
                        <td className="text-right">{sim2Data.concreteVolume.toFixed(2)}</td>
                        <td className={`text-right font-semibold ${sim2Data.concreteVolume > sim1Data.concreteVolume ? 'text-red-600' : 'text-green-600'}`}>
                          {(sim2Data.concreteVolume - sim1Data.concreteVolume).toFixed(2)}
                        </td>
                        <td className="text-right">
                          {(((sim2Data.concreteVolume - sim1Data.concreteVolume) / sim1Data.concreteVolume) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3">Aço (kg)</td>
                        <td className="text-right">{sim1Data.steelWeight.toFixed(0)}</td>
                        <td className="text-right">{sim2Data.steelWeight.toFixed(0)}</td>
                        <td className={`text-right font-semibold ${sim2Data.steelWeight > sim1Data.steelWeight ? 'text-red-600' : 'text-green-600'}`}>
                          {(sim2Data.steelWeight - sim1Data.steelWeight).toFixed(0)}
                        </td>
                        <td className="text-right">
                          {(((sim2Data.steelWeight - sim1Data.steelWeight) / sim1Data.steelWeight) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3">EPS (m³)</td>
                        <td className="text-right">{sim1Data.epsVolume.toFixed(2)}</td>
                        <td className="text-right">{sim2Data.epsVolume.toFixed(2)}</td>
                        <td className={`text-right font-semibold ${sim2Data.epsVolume > sim1Data.epsVolume ? 'text-red-600' : 'text-green-600'}`}>
                          {(sim2Data.epsVolume - sim1Data.epsVolume).toFixed(2)}
                        </td>
                        <td className="text-right">
                          {(((sim2Data.epsVolume - sim1Data.epsVolume) / sim1Data.epsVolume) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3">Área de Paredes (m²)</td>
                        <td className="text-right">{sim1Data.wallArea.toFixed(2)}</td>
                        <td className="text-right">{sim2Data.wallArea.toFixed(2)}</td>
                        <td className={`text-right font-semibold ${sim2Data.wallArea > sim1Data.wallArea ? 'text-red-600' : 'text-green-600'}`}>
                          {(sim2Data.wallArea - sim1Data.wallArea).toFixed(2)}
                        </td>
                        <td className="text-right">
                          {(((sim2Data.wallArea - sim1Data.wallArea) / sim1Data.wallArea) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-blue-50">
                        <td className="py-2 px-3 font-semibold">Custo por m² (ICF)</td>
                        <td className="text-right font-semibold">{formatCurrency(sim1Costs.costPerM2)}</td>
                        <td className="text-right font-semibold">{formatCurrency(sim2Costs.costPerM2)}</td>
                        <td className={`text-right font-semibold ${sim2Costs.costPerM2 > sim1Costs.costPerM2 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(Math.abs(sim2Costs.costPerM2 - sim1Costs.costPerM2))}
                        </td>
                        <td className="text-right">
                          {(((sim2Costs.costPerM2 - sim1Costs.costPerM2) / sim1Costs.costPerM2) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-green-50">
                        <td className="py-2 px-3 font-semibold">Custo Mão de Obra por m²</td>
                        <td className="text-right font-semibold">{formatCurrency(sim1Costs.laborCostPerM2)}</td>
                        <td className="text-right font-semibold">{formatCurrency(sim2Costs.laborCostPerM2)}</td>
                        <td className={`text-right font-semibold ${sim2Costs.laborCostPerM2 > sim1Costs.laborCostPerM2 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(Math.abs(sim2Costs.laborCostPerM2 - sim1Costs.laborCostPerM2))}
                        </td>
                        <td className="text-right">
                          {sim1Costs.laborCostPerM2 > 0 ? (((sim2Costs.laborCostPerM2 - sim1Costs.laborCostPerM2) / sim1Costs.laborCostPerM2) * 100).toFixed(1) : 'N/A'}%
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-yellow-50">
                        <td className="py-2 px-3 font-semibold">Custo Total por m² (ICF + Mão de Obra)</td>
                        <td className="text-right font-semibold">{formatCurrency(sim1Costs.costPerM2WithLabor)}</td>
                        <td className="text-right font-semibold">{formatCurrency(sim2Costs.costPerM2WithLabor)}</td>
                        <td className={`text-right font-semibold ${sim2Costs.costPerM2WithLabor > sim1Costs.costPerM2WithLabor ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(Math.abs(sim2Costs.costPerM2WithLabor - sim1Costs.costPerM2WithLabor))}
                        </td>
                        <td className="text-right">
                          {(((sim2Costs.costPerM2WithLabor - sim1Costs.costPerM2WithLabor) / sim1Costs.costPerM2WithLabor) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="bg-gray-50 font-semibold">
                        <td className="py-2 px-3">Custo Total</td>
                        <td className="text-right">{formatCurrency(sim1Costs.totalCost)}</td>
                        <td className="text-right">{formatCurrency(sim2Costs.totalCost)}</td>
                        <td className={`text-right ${differences.isSim2More ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(Math.abs(differences.costDiff))}
                        </td>
                        <td className={`text-right ${differences.isSim2More ? 'text-red-600' : 'text-green-600'}`}>
                          {differences.costDiffPercent.toFixed(1)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Analysis Modal */}
      {showAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#2d2d2d] flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-blue-600" />
                Análise Inteligente
              </h2>
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {analysis && (
                <>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <h3 className="font-semibold text-blue-900 mb-2">Recomendação</h3>
                    <p className="text-blue-800 leading-relaxed">{analysis.summary}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-[#2d2d2d]">Análise Detalhada</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-gray-50 p-4 rounded">
                        <h4 className="font-semibold text-gray-700 mb-2">Custo por m² de Parede</h4>
                        <p className="text-sm text-gray-600">{analysis.metrics.costPerM2Comparison}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded">
                        <h4 className="font-semibold text-gray-700 mb-2">Custo por m³ de Volume</h4>
                        <p className="text-sm text-gray-600">{analysis.metrics.costPerM3Comparison}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded">
                        <h4 className="font-semibold text-gray-700 mb-2">Custo por m² Útil</h4>
                        <p className="text-sm text-gray-600">{analysis.metrics.costPerUsefulM2Comparison}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded">
                        <h4 className="font-semibold text-gray-700 mb-2">Eficiência Espacial</h4>
                        <p className="text-sm text-gray-600">{analysis.metrics.spaceEfficiencyComparison}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <h3 className="font-semibold text-green-900 mb-2">Recomendação Geral</h3>
                    <p className="text-green-800 leading-relaxed">{analysis.metrics.overallRecommendation}</p>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                    <h3 className="font-semibold text-purple-900 mb-3">Pontuação de Custo-Benefício</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-800 font-medium">{analysis.scores.sim1Label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-40 bg-purple-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(analysis.scores.sim1Score / 100) * 100}%` }}></div>
                          </div>
                          <span className="text-purple-900 font-bold">{analysis.scores.sim1Score}/100</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-800 font-medium">{analysis.scores.sim2Label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-40 bg-purple-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(analysis.scores.sim2Score / 100) * 100}%` }}></div>
                          </div>
                          <span className="text-purple-900 font-bold">{analysis.scores.sim2Score}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <Button onClick={() => setShowAnalysis(false)} variant="outline">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
