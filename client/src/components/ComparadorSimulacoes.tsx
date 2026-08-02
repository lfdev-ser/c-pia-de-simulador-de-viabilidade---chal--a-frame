import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ArrowRight, TrendingDown, TrendingUp, Download } from 'lucide-react';
import { exportComparisonToPDF } from '@/lib/exportComparationPDF';
import { PDFCustomizationModal } from './PDFCustomizationModal';
import { toast } from 'sonner';

interface SavedSimulation {
  id: string;
  name: string;
  base: number;
  height: number;
  length: number;
  timestamp: number;
}

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

interface ComparadorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedSimulations: SavedSimulation[];
  calculateSimulationData: (base: number, height: number, length: number) => SimulationData;
  calculateCosts: (data: SimulationData) => {
    concreteCost: number;
    steelCost: number;
    epsCost: number;
    accessoriesCost: number;
    iceflexCost: number;
    icfibraCost: number;
    totalCost: number;
    costPerM2: number;
  };
}

export default function ComparadorSimulacoes({
  open,
  onOpenChange,
  savedSimulations,
  calculateSimulationData,
  calculateCosts,
}: ComparadorProps) {
  const [sim1Id, setSim1Id] = useState<string>('');
  const [sim2Id, setSim2Id] = useState<string>('');
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const sim1 = savedSimulations.find(s => s.id === sim1Id);
  const sim2 = savedSimulations.find(s => s.id === sim2Id);

  const data1 = useMemo(() => {
    if (!sim1) return null;
    return calculateSimulationData(sim1.base, sim1.height, sim1.length);
  }, [sim1, calculateSimulationData]);

  const data2 = useMemo(() => {
    if (!sim2) return null;
    return calculateSimulationData(sim2.base, sim2.height, sim2.length);
  }, [sim2, calculateSimulationData]);

  const costs1 = useMemo(() => {
    if (!data1) return null;
    return calculateCosts(data1);
  }, [data1, calculateCosts]);

  const costs2 = useMemo(() => {
    if (!data2) return null;
    return calculateCosts(data2);
  }, [data2, calculateCosts]);

  const DifferenceIndicator = ({ value1, value2, format = 'number' }: { value1: number; value2: number; format?: string }) => {
    if (!value1 || !value2) return null;
    const diff = value2 - value1;
    const percentage = ((diff / value1) * 100).toFixed(1);
    const isPositive = diff > 0;

    return (
      <div className="flex items-center gap-2 text-xs">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-red-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-green-500" />
        )}
        <span className={isPositive ? 'text-red-500' : 'text-green-500'}>
          {isPositive ? '+' : ''}{percentage}%
        </span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Comparador de Simulações</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-semibold text-[#2d2d2d] mb-2 block">Simulação 1</label>
            <Select value={sim1Id} onValueChange={setSim1Id}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma simulação" />
              </SelectTrigger>
              <SelectContent>
                {savedSimulations.map(sim => (
                  <SelectItem key={sim.id} value={sim.id}>
                    {sim.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#2d2d2d] mb-2 block">Simulação 2</label>
            <Select value={sim2Id} onValueChange={setSim2Id}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma simulação" />
              </SelectTrigger>
              <SelectContent>
                {savedSimulations.map(sim => (
                  <SelectItem key={sim.id} value={sim.id}>
                    {sim.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {sim1 && sim2 && data1 && data2 && costs1 && costs2 && (
          <div className="space-y-6">
            {/* Dimensões */}
            <Card className="p-4">
              <h3 className="font-semibold text-[#2d2d2d] mb-4">📐 Dimensões</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Largura da Base</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">{sim1.base.toFixed(2)}m</span>
                    <ArrowRight className="w-4 h-4 text-[#999]" />
                    <span className="font-bold text-[#15803d]">{sim2.base.toFixed(2)}m</span>
                  </div>
                  <DifferenceIndicator value1={sim1.base} value2={sim2.base} />
                </div>

                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Altura da Cumeeira</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">{sim1.height.toFixed(2)}m</span>
                    <ArrowRight className="w-4 h-4 text-[#999]" />
                    <span className="font-bold text-[#15803d]">{sim2.height.toFixed(2)}m</span>
                  </div>
                  <DifferenceIndicator value1={sim1.height} value2={sim2.height} />
                </div>

                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Comprimento</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">{sim1.length.toFixed(2)}m</span>
                    <ArrowRight className="w-4 h-4 text-[#999]" />
                    <span className="font-bold text-[#15803d]">{sim2.length.toFixed(2)}m</span>
                  </div>
                  <DifferenceIndicator value1={sim1.length} value2={sim2.length} />
                </div>
              </div>
            </Card>

            {/* Resultados */}
            <Card className="p-4">
              <h3 className="font-semibold text-[#2d2d2d] mb-4">📊 Resultados</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Ângulo de Inclinação</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">{data1.angle.toFixed(1)}°</span>
                    <ArrowRight className="w-4 h-4 text-[#999]" />
                    <span className="font-bold text-[#15803d]">{data2.angle.toFixed(1)}°</span>
                  </div>
                  <DifferenceIndicator value1={data1.angle} value2={data2.angle} />
                </div>

                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Aproveitamento do Piso</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">{data1.utilization.toFixed(1)}%</span>
                    <ArrowRight className="w-4 h-4 text-[#999]" />
                    <span className="font-bold text-[#15803d]">{data2.utilization.toFixed(1)}%</span>
                  </div>
                  <DifferenceIndicator value1={data1.utilization} value2={data2.utilization} />
                </div>

                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Volume Aproximado</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">{data1.volume.toFixed(2)}m³</span>
                    <ArrowRight className="w-4 h-4 text-[#999]" />
                    <span className="font-bold text-[#15803d]">{data2.volume.toFixed(2)}m³</span>
                  </div>
                  <DifferenceIndicator value1={data1.volume} value2={data2.volume} />
                </div>
              </div>
            </Card>

            {/* Materiais */}
            <Card className="p-4">
              <h3 className="font-semibold text-[#2d2d2d] mb-4">🏗️ Materiais ICF</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Concreto Necessário</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">{data1.concreteVolume.toFixed(2)}m³</span>
                    <ArrowRight className="w-4 h-4 text-[#999]" />
                    <span className="font-bold text-[#15803d]">{data2.concreteVolume.toFixed(2)}m³</span>
                  </div>
                  <DifferenceIndicator value1={data1.concreteVolume} value2={data2.concreteVolume} />
                </div>

                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Aço de Reforço</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">{Math.round(data1.steelWeight)}kg</span>
                    <ArrowRight className="w-4 h-4 text-[#999]" />
                    <span className="font-bold text-[#15803d]">{Math.round(data2.steelWeight)}kg</span>
                  </div>
                  <DifferenceIndicator value1={data1.steelWeight} value2={data2.steelWeight} />
                </div>

                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Área de Paredes</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">{data1.wallArea.toFixed(2)}m²</span>
                    <ArrowRight className="w-4 h-4 text-[#999]" />
                    <span className="font-bold text-[#15803d]">{data2.wallArea.toFixed(2)}m²</span>
                  </div>
                  <DifferenceIndicator value1={data1.wallArea} value2={data2.wallArea} />
                </div>
              </div>
            </Card>

            {/* Orçamento */}
            <Card className="p-4 bg-gradient-to-r from-[#f0fdf4] to-[#f5f5f5]">
              <h3 className="font-semibold text-[#2d2d2d] mb-4">💰 Orçamento Estimado</h3>
              
              {/* Detalhamento de Custos */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Concreto</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">R$ {costs1.concreteCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <ArrowRight className="w-3 h-3 text-[#999]" />
                    <span className="font-bold text-[#15803d]">R$ {costs2.concreteCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Aço</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">R$ {costs1.steelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <ArrowRight className="w-3 h-3 text-[#999]" />
                    <span className="font-bold text-[#15803d]">R$ {costs2.steelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">EPS + Acessórios</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">R$ {(costs1.epsCost + costs1.accessoriesCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <ArrowRight className="w-3 h-3 text-[#999]" />
                    <span className="font-bold text-[#15803d]">R$ {(costs2.epsCost + costs2.accessoriesCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Iceflex (Revestimento)</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">R$ {costs1.iceflexCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <ArrowRight className="w-3 h-3 text-[#999]" />
                    <span className="font-bold text-[#15803d]">R$ {costs2.iceflexCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">ICFibra (Reforço)</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">R$ {costs1.icfibraCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <ArrowRight className="w-3 h-3 text-[#999]" />
                    <span className="font-bold text-[#15803d]">R$ {costs2.icfibraCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Resumo Total */}
              <div className="border-t border-[#e8e6e1] pt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Total de Materiais</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">R$ {costs1.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <ArrowRight className="w-4 h-4 text-[#999]" />
                    <span className="font-bold text-[#15803d]">R$ {costs2.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <DifferenceIndicator value1={costs1.totalCost} value2={costs2.totalCost} />
                </div>

                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Custo por m² de Parede</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15803d]">R$ {costs1.costPerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <ArrowRight className="w-4 h-4 text-[#999]" />
                    <span className="font-bold text-[#15803d]">R$ {costs2.costPerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <DifferenceIndicator value1={costs1.costPerM2} value2={costs2.costPerM2} />
                </div>

                <div>
                  <p className="text-xs text-[#6b6b6b] mb-1">Diferença Total</p>
                  <div className="flex items-center justify-center">
                    <span className={`font-bold text-lg ${costs2.totalCost > costs1.totalCost ? 'text-red-500' : 'text-green-500'}`}>
                      {costs2.totalCost > costs1.totalCost ? '+' : ''}R$ {(costs2.totalCost - costs1.totalCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {(!sim1 || !sim2) && (
          <div className="text-center py-8 text-[#6b6b6b]">
            Selecione duas simulações para comparar
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          {sim1 && sim2 && data1 && data2 && costs1 && costs2 && (
            <Button 
              onClick={() => setShowCustomizationModal(true)}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>

        {/* PDF Customization Modal */}
        <PDFCustomizationModal
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          isExporting={isExporting}
          onExport={(customizationData: any) => {
            if (!data1 || !data2 || !costs1 || !costs2 || !sim1 || !sim2) {
              toast.error('Dados de simulacao invalidos');
              return;
            }
            setIsExporting(true);
            try {
              const costPerM2Sim1 = costs1.totalCost / (data1.totalArea || 1);
              const costPerM2Sim2 = costs2.totalCost / (data2.totalArea || 1);
              const bestOption = costPerM2Sim1 < costPerM2Sim2 
                ? `Simulação 1 (${data1.base}m × ${data1.height}m × ${data1.length}m)` 
                : `Simulação 2 (${data2.base}m × ${data2.height}m × ${data2.length}m)`;
              
              const recommendation = costPerM2Sim1 < costPerM2Sim2
                ? `A Simulação 1 oferece melhor custo-benefício com R$ ${costPerM2Sim1.toFixed(2)}/m² útil, contra R$ ${costPerM2Sim2.toFixed(2)}/m² da Simulação 2.`
                : `A Simulação 2 oferece melhor custo-benefício com R$ ${costPerM2Sim2.toFixed(2)}/m² útil, contra R$ ${costPerM2Sim1.toFixed(2)}/m² da Simulação 1.`;

              const comparisonData = {
                sim1: {
                  name: sim1.name,
                  base: sim1.base,
                  height: sim1.height,
                  length: sim1.length,
                  angle: data1.angle,
                  utilization: data1.utilization,
                  volume: data1.volume,
                  concreteVolume: data1.concreteVolume,
                  steelWeight: data1.steelWeight,
                  wallArea: data1.wallArea,
                  totalCost: costs1.totalCost,
                  costPerM2: costs1.costPerM2,
                  iceflex: Math.ceil(data1.wallArea / 7),
                  icfibra: Math.ceil(data1.wallArea / 50),
                },
                sim2: {
                  name: sim2.name,
                  base: sim2.base,
                  height: sim2.height,
                  length: sim2.length,
                  angle: data2.angle,
                  utilization: data2.utilization,
                  volume: data2.volume,
                  concreteVolume: data2.concreteVolume,
                  steelWeight: data2.steelWeight,
                  wallArea: data2.wallArea,
                  totalCost: costs2.totalCost,
                  costPerM2: costs2.costPerM2,
                  iceflex: Math.ceil(data2.wallArea / 7),
                  icfibra: Math.ceil(data2.wallArea / 50),
                },
                analysis: {
                  recommendation,
                  bestOption,
                  costPerUsefulM2Sim1: costPerM2Sim1,
                  costPerUsefulM2Sim2: costPerM2Sim2,
                  costPerVolumeM3Sim1: costs1.totalCost / (data1.volume || 1),
                  costPerVolumeM3Sim2: costs2.totalCost / (data2.volume || 1),
                  spacialEfficiencySim1: data1.utilization,
                  spacialEfficiencySim2: data2.utilization,
                },
              };
              exportComparisonToPDF(comparisonData, customizationData);
              setShowCustomizationModal(false);
              toast.success('PDF exportado com sucesso!');
            } catch (error) {
              toast.error('Erro ao exportar PDF');
              console.error(error);
            } finally {
              setIsExporting(false);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
