import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Download, Upload, Eye, MoreVertical, BarChart3 } from 'lucide-react';
import { ComparisonCostChart } from './ComparisonCostChart';
import { formatDate, ComparisonRecord } from '@/lib/comparisonHistory';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ComparisonHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectComparison?: (comparison: ComparisonRecord) => void;
}

function calculateStats(history: ComparisonRecord[]) {
  if (history.length === 0) {
    return { totalComparisons: 0, averageCostDifference: 0, mostCommonBestOption: '' };
  }

  const averageCostDifference = history.reduce(
    (sum, record) => sum + Math.abs(record.analysis?.costDifference ?? 0),
    0,
  ) / history.length;
  const counts = new Map<string, number>();
  history.forEach(record => {
    const option = record.analysis?.bestOption ?? '';
    counts.set(option, (counts.get(option) ?? 0) + 1);
  });
  const mostCommonBestOption = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

  return {
    totalComparisons: history.length,
    averageCostDifference: Math.round(averageCostDifference * 100) / 100,
    mostCommonBestOption,
  };
}

export function ComparisonHistory({ open, onOpenChange, onSelectComparison }: ComparisonHistoryProps) {
  const [history, setHistory] = useState<ComparisonRecord[]>([]);
  const [stats, setStats] = useState({ totalComparisons: 0, averageCostDifference: 0, mostCommonBestOption: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);
  const historyQuery = trpc.persistence.comparisons.list.useQuery(undefined, { enabled: open, retry: false });
  const deleteMutation = trpc.persistence.comparisons.delete.useMutation();
  const clearMutation = trpc.persistence.comparisons.clear.useMutation();
  const saveMutation = trpc.persistence.comparisons.save.useMutation();

  useEffect(() => {
    if (!historyQuery.data) return;
    const records = historyQuery.data as unknown as ComparisonRecord[];
    setHistory(records);
    setStats(calculateStats(records));
  }, [historyQuery.data]);

  const refresh = async () => {
    const result = await historyQuery.refetch();
    const records = (result.data ?? []) as unknown as ComparisonRecord[];
    setHistory(records);
    setStats(calculateStats(records));
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id: Number(id) });
      await refresh();
      toast.success('Comparação removida do banco de dados.');
    } catch (error) {
      console.error('Erro ao excluir comparação:', error);
      toast.error('Não foi possível excluir a comparação.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Tem certeza que deseja limpar todo o histórico?')) return;
    try {
      await clearMutation.mutateAsync();
      setHistory([]);
      setStats(calculateStats([]));
      toast.success('Histórico limpo no banco de dados.');
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      toast.error('Não foi possível limpar o histórico.');
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(history, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', `chale-comparisons-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Histórico exportado.');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const imported = JSON.parse(String(reader.result)) as unknown;
          if (!Array.isArray(imported)) throw new Error('Formato inválido');
          await Promise.all(imported.map(record => {
            if (!record || typeof record !== 'object') throw new Error('Registro inválido');
            const data = record as Record<string, unknown>;
            const title = typeof data.name === 'string' ? data.name : 'Comparação importada';
            return saveMutation.mutateAsync({ title, data });
          }));
          await refresh();
          toast.success('Histórico importado para o banco com sucesso.');
        } catch (error) {
          console.error('Erro ao importar histórico:', error);
          toast.error('Arquivo inválido ou não foi possível importar.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📊 Histórico de Comparações</DialogTitle>
        </DialogHeader>

        {stats.totalComparisons > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-xs text-blue-600 mb-1">Total de Comparações</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalComparisons}</p>
            </Card>
            <Card className="p-4 bg-green-50 border-green-200">
              <p className="text-xs text-green-600 mb-1">Diferença Média de Custo</p>
              <p className="text-2xl font-bold text-green-900">R$ {stats.averageCostDifference.toLocaleString('pt-BR')}</p>
            </Card>
            <Card className="p-4 bg-purple-50 border-purple-200">
              <p className="text-xs text-purple-600 mb-1">Melhor Opção Mais Comum</p>
              <p className="text-sm font-bold text-purple-900">{stats.mostCommonBestOption || 'N/A'}</p>
            </Card>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          <Button onClick={handleExport} variant="outline" className="gap-2" disabled={history.length === 0}>
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <Button onClick={handleImport} variant="outline" className="gap-2">
            <Upload className="w-4 h-4" /> Importar
          </Button>
          <Button onClick={() => setShowChart(!showChart)} variant="outline" className="gap-2" disabled={history.length === 0}>
            <BarChart3 className="w-4 h-4" /> {showChart ? 'Ocultar' : 'Ver'} Gráficos
          </Button>
          <Button onClick={handleClearAll} variant="destructive" className="gap-2 ml-auto" disabled={history.length === 0 || clearMutation.isPending}>
            <Trash2 className="w-4 h-4" /> Limpar Tudo
          </Button>
        </div>

        {showChart && history.length > 0 && (
          <div className="mb-6 border-t border-[#e8e6e1] pt-6">
            <ComparisonCostChart comparisons={history} />
          </div>
        )}

        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((record) => (
              <Card key={record.id} className="p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#2d2d2d]">{record.name}</h3>
                    <p className="text-xs text-[#6b6b6b]">{formatDate(record.timestamp)}</p>
                    {record.description && <p className="text-sm text-[#555] mt-1">{record.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    {onSelectComparison && (
                      <Button onClick={() => { onSelectComparison(record); onOpenChange(false); }} size="sm" className="gap-1">
                        <Eye className="w-4 h-4" /> Ver
                      </Button>
                    )}
                    <Button onClick={() => handleDelete(record.id)} size="sm" variant="destructive" className="gap-1" disabled={deleteMutation.isPending}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <button onClick={() => setExpandedId(expandedId === record.id ? null : record.id)} className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                  <MoreVertical className="w-3 h-3" /> {expandedId === record.id ? 'Ocultar' : 'Mostrar'} Detalhes
                </button>

                {expandedId === record.id && record.sim1 && record.sim2 && record.analysis && (
                  <div className="mt-4 pt-4 border-t border-[#e8e6e1] grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[#6b6b6b] font-semibold mb-2">Simulação 1: {record.sim1.name}</p>
                      <ul className="text-xs space-y-1 text-[#555]">
                        <li>Base: {record.sim1.base}m</li><li>Altura: {record.sim1.height}m</li><li>Comprimento: {record.sim1.length}m</li>
                        <li>Custo Total: R$ {record.sim1.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                        <li>Custo/m²: R$ {record.sim1.costPerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                        <li>Aproveitamento: {record.sim1.utilization.toFixed(1)}%</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-[#6b6b6b] font-semibold mb-2">Simulação 2: {record.sim2.name}</p>
                      <ul className="text-xs space-y-1 text-[#555]">
                        <li>Base: {record.sim2.base}m</li><li>Altura: {record.sim2.height}m</li><li>Comprimento: {record.sim2.length}m</li>
                        <li>Custo Total: R$ {record.sim2.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                        <li>Custo/m²: R$ {record.sim2.costPerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                        <li>Aproveitamento: {record.sim2.utilization.toFixed(1)}%</li>
                      </ul>
                    </div>
                    <div className="col-span-2 bg-[#f5f5f5] p-3 rounded">
                      <p className="text-xs text-[#6b6b6b] font-semibold mb-2">Análise</p>
                      <p className="text-xs text-[#555] mb-2"><strong>Melhor Opção:</strong> {record.analysis.bestOption}</p>
                      <p className="text-xs text-[#555]"><strong>Diferença de Custo:</strong> R$ {record.analysis.costDifference.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#6b6b6b]">
            <p className="text-lg font-semibold mb-2">Nenhuma comparação salva</p>
            <p className="text-sm">Crie uma comparação e salve-a para acessar aqui</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
