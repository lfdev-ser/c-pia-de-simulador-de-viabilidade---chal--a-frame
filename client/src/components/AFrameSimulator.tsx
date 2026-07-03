import { useState, useMemo, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowRight, Ruler, Home } from 'lucide-react';
import { toast } from 'sonner';
import PriceConfigModal from './PriceConfigModal';
import SizePresets from './SizePresets';
import ComparadorSimulacoes from './ComparadorSimulacoes';
import ValidationWarnings from './ValidationWarnings';
import LaborCosts, { LaborService } from './LaborCosts';
import CostAnalysisCharts from './CostAnalysisCharts';
import PDFExportButton from './PDFExportButton';
import CustomMaterials, { CustomMaterial } from './CustomMaterials';
import Foundation, { FoundationBase } from './Foundation';
import GeoTechnicalAnalysis from './GeoTechnicalAnalysis';
import AFrame3DViewer from './AFrame3DViewer';

interface SimulatorData {
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

interface MaterialPrices {
  concretePerM3: number;
  steelPerKg: number;
  epsPerForm: number; // Preco por forma de EPS (2 formas = 1 m² de parede)
  accessories: number;
  iceflex: number; // Preco por balde de Iceflex (18 KG) - rendimento ~7 m² por balde
  icfibra: number; // Preco por rolo de ICFibra (50 m²) - reforco para Iceflex
}

interface SavedSimulation {
  id: string;
  name: string;
  base: number;
  height: number;
  length: number;
  timestamp: number;
}

interface ValidationWarning {
  type: 'base' | 'height' | 'length' | 'angle' | 'utilization';
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

const MIN_BASE = 0.0;
const MAX_BASE = 10.0;
const MIN_HEIGHT = 0.0;
const MAX_HEIGHT = 10.0;
const MIN_LENGTH = 0.0;
const DEFAULT_MIN_FOOT = 3.0; // Pé direito mínimo para cabanas (maior que NBR 15575)
const MAX_LENGTH = 10.0;
const MIN_COMFORT = 2.1;

// Validação de Dimensões
const VALIDATION_LIMITS = {
  base: {
    minimum: 2.0,
    optimal: { min: 4.0, max: 6.0 },
    warning: 8.0,
  },
  height: {
    minimum: 2.1,
    optimal: { min: 4.5, max: 6.0 },
    warning: 8.0,
  },
  length: {
    minimum: 3.0,
    optimal: { min: 5.0, max: 8.0 },
    warning: 9.0,
  },
  angle: {
    optimal: { min: 66, max: 68 },
    warning: { min: 66, max: 70 },
  },
  utilization: {
    minimum: 0.4,
    optimal: 0.55,
  },
};

const ICF_CONCRETE_PER_M2 = 0.10;
const ICF_STEEL_PER_M2 = 4.0;
const ICF_EPS_PER_M2 = 0.13;
const ICF_EPS_DENSITY = 22;

const DEFAULT_PRICES: MaterialPrices = {
  concretePerM3: 500,
  steelPerKg: 6.0,
  epsPerForm: 75.70, // R$ 75,70 por forma (2 formas = 1 m² = R$ 151,40)
  accessories: 20,
  iceflex: 0, // Preco por balde de Iceflex (18 KG) - rendimento ~7 m² por balde
  icfibra: 0, // Preco por rolo de ICFibra (50 m²) - reforco para Iceflex
};

// Função de Validação de Dimensões
function getValidationWarnings(
  base: number,
  height: number,
  length: number,
  angle: number,
  utilization: number
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Validação de Base
  if (base > 0 && base < VALIDATION_LIMITS.base.minimum) {
    warnings.push({
      type: 'base',
      severity: 'critical',
      message: `Base muito pequena. Recomendamos mínimo ${VALIDATION_LIMITS.base.minimum}m para aproveitamento mínimo.`,
    });
  } else if (base > VALIDATION_LIMITS.base.warning) {
    warnings.push({
      type: 'base',
      severity: 'warning',
      message: `Base muito grande (${base.toFixed(2)}m). Pode aumentar custos significativamente.`,
    });
  }

  // Validação de Altura
  if (height > 0 && height < VALIDATION_LIMITS.height.minimum) {
    warnings.push({
      type: 'height',
      severity: 'critical',
      message: `Altura insuficiente. Mínimo recomendado é ${VALIDATION_LIMITS.height.minimum}m para pé-direito.`,
    });
  } else if (height > VALIDATION_LIMITS.height.warning) {
    warnings.push({
      type: 'height',
      severity: 'warning',
      message: `Altura muito grande (${height.toFixed(2)}m). Pode comprometer a estrutura e estética.`,
    });
  }

  // Validação de Comprimento
  if (length > 0 && length < VALIDATION_LIMITS.length.minimum) {
    warnings.push({
      type: 'length',
      severity: 'critical',
      message: `Comprimento muito pequeno. Recomendamos mínimo ${VALIDATION_LIMITS.length.minimum}m.`,
    });
  } else if (length > VALIDATION_LIMITS.length.warning) {
    warnings.push({
      type: 'length',
      severity: 'warning',
      message: `Comprimento muito grande (${length.toFixed(2)}m). Pode aumentar custos estruturais.`,
    });
  }

  // Validação de Ângulo
  if (angle > 0) {
    if (angle < VALIDATION_LIMITS.angle.optimal.min) {
      warnings.push({
        type: 'angle',
        severity: 'warning',
        message: `Ângulo ${angle.toFixed(1)}° abaixo do ideal (66-68°). Pode prejudicar escoamento de água.`,
      });
    } else if (angle > VALIDATION_LIMITS.angle.warning.max) {
      warnings.push({
        type: 'angle',
        severity: 'warning',
        message: `Ângulo ${angle.toFixed(1)}° muito inclinado. Pode comprometer a estética.`,
      });
    }
  }

  // Validação de Aproveitamento
  if (utilization > 0) {
    if (utilization < VALIDATION_LIMITS.utilization.minimum * 100) {
      warnings.push({
        type: 'utilization',
        severity: 'critical',
        message: `Aproveitamento ${utilization.toFixed(1)}% muito baixo. Considere aumentar a altura.`,
      });
    } else if (utilization < VALIDATION_LIMITS.utilization.optimal * 100) {
      warnings.push({
        type: 'utilization',
        severity: 'warning',
        message: `Aproveitamento ${utilization.toFixed(1)}% abaixo do recomendado (55%).`,
      });
    }
  }

  return warnings;
}

export default function AFrameSimulator() {
  const [base, setBase] = useState(0.0);
  const [height, setHeight] = useState(0.0);
  const [length, setLength] = useState(0.0);
  
  // Carregar preços do localStorage ou usar padrão
  const [prices, setPrices] = useState<MaterialPrices>(() => {
    try {
      const saved = localStorage.getItem('chalePrices');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          concretePerM3: parsed.concretePerM3 ?? DEFAULT_PRICES.concretePerM3,
          steelPerKg: parsed.steelPerKg ?? DEFAULT_PRICES.steelPerKg,
          epsPerForm: parsed.epsPerForm ?? DEFAULT_PRICES.epsPerForm,
          accessories: parsed.accessories ?? DEFAULT_PRICES.accessories,
          iceflex: parsed.iceflex ?? DEFAULT_PRICES.iceflex,
          icfibra: parsed.icfibra ?? DEFAULT_PRICES.icfibra,
        };
      }
      return DEFAULT_PRICES;
    } catch {
      return DEFAULT_PRICES;
    }
  });
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showResults, setShowResults] = useState(true);
  const [showComparador, setShowComparador] = useState(false);
  
  // Carregar serviços de mão de obra do localStorage
  const [laborServices, setLaborServices] = useState<LaborService[]>(() => {
    try {
      const saved = localStorage.getItem('chaleLabor');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Carregar materiais customizáveis do localStorage
  const [customMaterials, setCustomMaterials] = useState<CustomMaterial[]>(() => {
    try {
      const saved = localStorage.getItem('chaleCustomMaterials');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Carregar fundação do localStorage
  const [foundation, setFoundation] = useState<FoundationBase | null>(() => {
    try {
      const saved = localStorage.getItem('chaleFoundation');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  // Pé direito customizável
  const [minFootHeight, setMinFootHeight] = useState<number>(DEFAULT_MIN_FOOT);
  
  // Dados geotécnicos
  const [geoTechnicalData, setGeoTechnicalData] = useState(() => {
    try {
      const saved = localStorage.getItem('chaleGeoTechnical');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  // Salvar preços no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('chalePrices', JSON.stringify(prices));
  }, [prices]);
  
  // Salvar serviços de mão de obra no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('chaleLabor', JSON.stringify(laborServices));
  }, [laborServices]);
  
  // Salvar materiais customizáveis no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('chaleCustomMaterials', JSON.stringify(customMaterials));
  }, [customMaterials]);
  
  // Salvar fundação no localStorage quando mudar
  useEffect(() => {
    if (foundation) {
      localStorage.setItem('chaleFoundation', JSON.stringify(foundation));
    }
  }, [foundation]);
  
  // Salvar dados geotécnicos no localStorage quando mudarem
  useEffect(() => {
    if (geoTechnicalData) {
      localStorage.setItem('chaleGeoTechnical', JSON.stringify(geoTechnicalData));
    }
  }, [geoTechnicalData]);

  const handleResetSimulation = () => {
    setBase(0.0);
    setHeight(0.0);
    setLength(0.0);
    setPrices(DEFAULT_PRICES);
    setShowSaved(false);
    // Limpa os resultados - usuário precisa ajustar os sliders
    setShowResults(false);
    // Força re-renderização completa dos sliders
    setResetTrigger(prev => prev + 1);
    // Notificação de sucesso
    toast.success('Simulação resetada! Ajuste os sliders para ver os novos resultados.', {
      duration: 3000,
      position: 'top-center',
    });
    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSliderChange = (value: number) => {
    // Mostra resultados quando o usuário começa a ajustar
    if (!showResults) {
      setShowResults(true);
    }
  };

  const handleSaveSimulation = () => {
    if (!showResults) {
      toast.error('Ajuste os sliders antes de salvar a simulação.', {
        duration: 2000,
        position: 'top-center',
      });
      return;
    }
    const newSimulation: SavedSimulation = {
      id: Date.now().toString(),
      name: `Simulação ${new Date().toLocaleDateString('pt-BR')} - ${base.toFixed(2)}x${height.toFixed(2)}x${length.toFixed(2)}m`,
      base,
      height,
      length,
      timestamp: Date.now(),
    };
    setSavedSimulations([...savedSimulations, newSimulation]);
    toast.success('Simulação salva com sucesso!', {
      duration: 2000,
      position: 'top-center',
    });
  };

  const handleLoadSimulation = (sim: SavedSimulation) => {
    setBase(sim.base);
    setHeight(sim.height);
    setLength(sim.length);
    setShowSaved(false);
    setShowResults(true);
  };

  const handleDeleteSimulation = (id: string) => {
    setSavedSimulations(savedSimulations.filter(sim => sim.id !== id));
  };

  const data = useMemo(() => {
    const b = base / 2;
    const h = height;
    
    // Ângulo em graus
    const angleRad = Math.atan(h / b);
    const angleDeg = (angleRad * 180) / Math.PI;
    
    // Comprimento da face inclinada
    const faceLength = Math.sqrt(b * b + h * h);
    
    // Largura útil
    const usefulWidthHalf = (b * (h - MIN_COMFORT)) / h;
    const usefulWidth = usefulWidthHalf * 2;
    
    // Aproveitamento percentual
    const utilization = (usefulWidth / base) * 100;
    
    // Área total do piso
    const totalArea = base * length;
    
    // Volume aproximado (triângulo * comprimento)
    const triangleArea = (base * h) / 2;
    const volume = triangleArea * length;
    
    // Cálculo de área de paredes para ICF
    const lateralWallArea = 2 * (faceLength * length);
    const frontalWallArea = 2 * triangleArea;
    const wallArea = lateralWallArea + frontalWallArea;
    
    // Consumo de materiais ICF
    const concreteVolume = wallArea * ICF_CONCRETE_PER_M2;
    const steelWeight = wallArea * ICF_STEEL_PER_M2;
    const epsVolume = wallArea * ICF_EPS_PER_M2;
    const epsWeight = epsVolume * ICF_EPS_DENSITY;
    
    return {
      base,
      height,
      length,
      angle: angleDeg,
      usefulWidth,
      utilization,
      faceLength,
      totalArea,
      volume,
      wallArea,
      concreteVolume,
      steelWeight,
      epsVolume,
      epsWeight,
    };
  }, [base, height, length]);

  // Cálculo de custos
  const costs = useMemo(() => {
    const concreteCost = data.concreteVolume * prices.concretePerM3;
    const steelCost = data.steelWeight * prices.steelPerKg;
    // EPS: 2 formas por m² de parede
    const epsFormsNeeded = data.wallArea * 2;
    const epsCost = epsFormsNeeded * prices.epsPerForm;
    const accessoriesCost = data.wallArea * prices.accessories;
    
    // Iceflex: rendimento ~7 m² por balde (18 KG)
    const iceflexBaldesNeeded = Math.ceil(data.wallArea / 7);
    const iceflexCost = iceflexBaldesNeeded * prices.iceflex;
    
    // ICFibra: 1 rolo cobre 50 m²
    const icfibraRolosNeeded = Math.ceil(data.wallArea / 50);
    const icfibraCost = icfibraRolosNeeded * prices.icfibra;
    
    // Cálculo de mão de obra
    const laborCost = laborServices.reduce((sum, service) => sum + (service.quantity * service.unitPrice), 0);
    
    // Cálculo de materiais customizáveis
    const customMaterialsCost = customMaterials.reduce((sum, material) => sum + (material.quantity * material.unitPrice), 0);
    
    // Cálculo de fundação
    const foundationCost = foundation ? foundation.totalCost : 0;
    
    const totalCost = concreteCost + steelCost + epsCost + accessoriesCost + iceflexCost + icfibraCost + laborCost + customMaterialsCost + foundationCost;
    
    return {
      concreteCost,
      steelCost,
      epsCost,
      accessoriesCost,
      iceflexCost,
      icfibraCost,
      laborCost,
      customMaterialsCost,
      foundationCost,
      iceflexBaldesNeeded,
      icfibraRolosNeeded,
      totalCost,
      costPerM2: Math.round((totalCost / data.wallArea) * 100) / 100,
    };
  }, [data, prices, laborServices, customMaterials, foundation]);

  // Gerar dados para o gráfico de aproveitamento
  const chartData = useMemo(() => {
    const heights = Array.from({ length: 41 }, (_, i) => 3.0 + i * 0.1);
    return heights.map((h) => {
      const b = base / 2;
      const usefulWidthHalf = (b * (h - MIN_COMFORT)) / h;
      const usefulWidth = usefulWidthHalf * 2;
      const util = (usefulWidth / base) * 100;
      return {
        height: parseFloat(h.toFixed(1)),
        utilization: parseFloat(util.toFixed(1)),
      };
    });
  }, [base]);

  // Obter avisos de validacao
  const validationWarnings = useMemo(() => {
    return getValidationWarnings(base, height, length, data.angle, data.utilization);
  }, [base, height, length, data.angle, data.utilization]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#f5f3f0] to-[#faf8f3] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Home className="w-8 h-8 text-[#15803d]" />
            <h1 className="text-4xl font-bold text-[#2d2d2d]">Simulador de Chalé A-frame</h1>
          </div>
          <p className="text-lg text-[#6b6b6b]">Explore as dimensões ideais para seu projeto</p>
          
          {/* Action Buttons */}
          <div className="flex gap-3 justify-center mt-6 flex-wrap">
            <button
              type="button"
              onClick={handleResetSimulation}
              className="px-6 py-2 bg-[#15803d] text-white rounded-lg font-semibold hover:bg-[#0f5c2e] transition-colors"
            >
              ↻ Nova Simulação
            </button>
            <button
              type="button"
              onClick={handleSaveSimulation}
              className="px-6 py-2 bg-[#d97706] text-white rounded-lg font-semibold hover:bg-[#b45309] transition-colors"
            >
              💾 Salvar Simulação
            </button>
            <PriceConfigModal
              prices={prices}
              onPricesChange={setPrices}
            />
            {savedSimulations.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setShowSaved(!showSaved)}
                  className="px-6 py-2 bg-[#6366f1] text-white rounded-lg font-semibold hover:bg-[#4f46e5] transition-colors"
                >
                  📊 Simulações Salvas ({savedSimulations.length})
                </button>
                {savedSimulations.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => setShowComparador(true)}
                    className="px-6 py-2 bg-[#8b5cf6] text-white rounded-lg font-semibold hover:bg-[#7c3aed] transition-colors"
                  >
                    ⚖️ Comparar Simulações
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Saved Simulations Panel */}
        {showSaved && savedSimulations.length > 0 && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md border-l-4 border-[#6366f1]">
            <h2 className="text-xl font-bold text-[#2d2d2d] mb-4">Simulações Salvas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedSimulations.map((sim) => (
                <div key={sim.id} className="p-4 bg-[#f5f3f0] rounded-lg border border-[#e8e6e1]">
                  <p className="font-semibold text-[#2d2d2d] mb-2 text-sm">{sim.name}</p>
                  <p className="text-xs text-[#6b6b6b] mb-3">
                    {sim.base.toFixed(2)}m × {sim.height.toFixed(2)}m × {sim.length.toFixed(2)}m
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadSimulation(sim)}
                      className="flex-1 px-3 py-2 bg-[#15803d] text-white text-xs rounded hover:bg-[#0f5c2e] transition-colors"
                    >
                      Carregar
                    </button>
                    <button
                      onClick={() => handleDeleteSimulation(sim.id)}
                      className="flex-1 px-3 py-2 bg-[#dc2626] text-white text-xs rounded hover:bg-[#b91c1c] transition-colors"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Painel de Controle */}
          <div className="lg:col-span-1">
            <Card className="p-8 bg-white border-[#e8e6e1] shadow-lg rounded-2xl">
              <h2 className="text-2xl font-bold text-[#2d2d2d] mb-6">Dimensões</h2>
              
              {/* Size Presets */}
              <div className="mb-8 pb-6 border-b border-[#e8e6e1]">
                <SizePresets onPresetSelect={(preset) => {
                  setBase(preset.base);
                  setHeight(preset.height);
                  setLength(preset.length);
                  setResetTrigger(prev => prev + 1);
                  handleSliderChange(preset.base);
                  toast.success(`Preset "${preset.name}" aplicado!`, {
                    duration: 2000,
                    position: 'top-center',
                  });
                }} />
              </div>
              
              {/* Base Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-[#2d2d2d]">Largura da Base</label>
                  <span className="text-lg font-bold text-[#15803d]">{base.toFixed(2)} m</span>
                </div>
                <Slider
                  key={`base-${resetTrigger}`}
                  value={[base]}
                  onValueChange={(value) => {
                    setBase(value[0]);
                    handleSliderChange(value[0]);
                  }}
                  min={MIN_BASE}
                  max={MAX_BASE}
                  step={0.01}
                  className="w-full"
                />
                <p className="text-xs text-[#6b6b6b] mt-2">Recomendado: 4,00 m</p>
              </div>

              {/* Height Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-[#2d2d2d]">Altura da Cumeeira</label>
                  <span className="text-lg font-bold text-[#15803d]">{height.toFixed(2)} m</span>
                </div>
                <Slider
                  key={`height-${resetTrigger}`}
                  value={[height]}
                  onValueChange={(value) => {
                    setHeight(value[0]);
                    handleSliderChange(value[0]);
                  }}
                  min={MIN_HEIGHT}
                  max={MAX_HEIGHT}
                  step={0.01}
                  className="w-full"
                />
                <p className="text-xs text-[#6b6b6b] mt-2">Recomendado: 5,00 m</p>
              </div>

              {/* Length Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-[#2d2d2d]">Comprimento</label>
                  <span className="text-lg font-bold text-[#15803d]">{length.toFixed(2)} m</span>
                </div>
                <Slider
                  key={`length-${resetTrigger}`}
                  value={[length]}
                  onValueChange={(value) => {
                    setLength(value[0]);
                    handleSliderChange(value[0]);
                  }}
                  min={MIN_LENGTH}
                  max={MAX_LENGTH}
                  step={0.01}
                  className="w-full"
                />
                <p className="text-xs text-[#6b6b6b] mt-2">Recomendado: 5,00 m - 6,00 m</p>
              </div>

              {/* Validação de Dimensões */}
              {showResults && (
                <div className="mb-6">
                  <ValidationWarnings warnings={validationWarnings} />
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-[#e8e6e1] my-6"></div>

              {/* Resultados */}
              {!showResults ? (
                <div className="p-6 bg-[#fef3c7] border-2 border-[#fcd34d] rounded-lg text-center">
                  <p className="text-[#92400e] font-semibold">👆 Ajuste os sliders acima para ver os resultados</p>
                </div>
              ) : (
              <>
              <h3 className="text-lg font-bold text-[#2d2d2d] mb-4">Resultados</h3>
              
              <div className="space-y-4">
                <div className="bg-[#f5f3f0] p-4 rounded-lg">
                  <p className="text-xs text-[#6b6b6b] mb-1">Ângulo de Inclinação</p>
                  <p className="text-2xl font-bold text-[#15803d]">{data.angle.toFixed(1)}°</p>
                </div>

                <div className="bg-[#f5f3f0] p-4 rounded-lg">
                  <p className="text-xs text-[#6b6b6b] mb-1">Comprimento da Face</p>
                  <p className="text-2xl font-bold text-[#15803d]">{data.faceLength.toFixed(2)} m</p>
                </div>

                <div className="bg-[#f5f3f0] p-4 rounded-lg">
                  <p className="text-xs text-[#6b6b6b] mb-1">Largura Útil (2,10m)</p>
                  <p className="text-2xl font-bold text-[#15803d]">{data.usefulWidth.toFixed(2)} m</p>
                </div>

                <div className="bg-gradient-to-r from-[#15803d] to-[#2d5016] p-4 rounded-lg">
                  <p className="text-xs text-white mb-1">Aproveitamento do Piso</p>
                  <p className="text-2xl font-bold text-white">{data.utilization.toFixed(1)}%</p>
                </div>

                <div className="bg-[#f5f3f0] p-4 rounded-lg">
                  <p className="text-xs text-[#6b6b6b] mb-1">Área Total do Piso</p>
                  <p className="text-2xl font-bold text-[#15803d]">{data.totalArea.toFixed(2)} m²</p>
                </div>

                <div className="bg-[#f5f3f0] p-4 rounded-lg">
                  <p className="text-xs text-[#6b6b6b] mb-1">Volume Aproximado</p>
                  <p className="text-2xl font-bold text-[#15803d]">{data.volume.toFixed(2)} m³</p>
                </div>
              </div>

              {/* Recomendação */}
              <div className="mt-6 p-4 bg-[#fef3c7] border border-[#fcd34d] rounded-lg">
                <p className="text-sm text-[#92400e]">
                  <strong>💡 Dica:</strong> Para máximo conforto, mantenha o aproveitamento acima de 55%.
                </p>
              </div>
              </>
              )}
            </Card>
          </div>

          {/* Visualizações */}
          {showResults && (
          <div className="lg:col-span-2 space-y-8">
            {/* Gráfico de Aproveitamento */}
            <Card className="p-8 bg-white border-[#e8e6e1] shadow-lg rounded-2xl">
              <h3 className="text-xl font-bold text-[#2d2d2d] mb-4">Aproveitamento vs Altura</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e1" />
                  <XAxis 
                    dataKey="height" 
                    stroke="#6b6b6b"
                    label={{ value: 'Altura da Cumeeira (m)', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis 
                    stroke="#6b6b6b"
                    label={{ value: 'Aproveitamento (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e8e6e1' }}
                    formatter={(value: any) => `${(value as number).toFixed(1)}%`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="utilization" 
                    stroke="#15803d" 
                    dot={false}
                    strokeWidth={3}
                    isAnimationActive={true}
                  />
                  {/* Marcador do valor atual */}
                  <Line
                    type="monotone"
                    dataKey="utilization"
                    stroke="#d97706"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Visualização 2D do Corte Transversal */}
            <Card className="p-8 bg-white border-[#e8e6e1] shadow-lg rounded-2xl">
              <h3 className="text-xl font-bold text-[#2d2d2d] mb-6">Corte Transversal</h3>
              <div className="flex justify-center">
                <svg width="400" height="300" viewBox="0 0 400 300" className="drop-shadow-lg">
                  {/* Radier */}
                  <rect x="50" y="200" width="300" height="20" fill="#8b6f47" stroke="#6b5a3a" strokeWidth="2" />
                  
                  {/* Piso */}
                  <line x1="50" y1="200" x2="350" y2="200" stroke="#6b5a3a" strokeWidth="2" />
                  
                  {/* Paredes/Telhado A-frame */}
                  <polygon 
                    points="50,200 200,50 350,200" 
                    fill="none" 
                    stroke="#15803d" 
                    strokeWidth="3"
                  />
                  
                  {/* Preenchimento do A-frame */}
                  <polygon 
                    points="50,200 200,50 350,200" 
                    fill="#d4e8d4" 
                    opacity="0.3"
                  />
                  
                  {/* Linha de pé-direito mínimo */}
                  <line 
                    x1="50" 
                    y1={200 - (MIN_COMFORT / data.height) * 150} 
                    x2="350" 
                    y2={200 - (MIN_COMFORT / data.height) * 150} 
                    stroke="#d97706" 
                    strokeWidth="2" 
                    strokeDasharray="5,5"
                  />
                  
                  {/* Cumeeira */}
                  <circle cx="200" cy="50" r="4" fill="#15803d" />
                  
                  {/* Dimensões */}
                  <text x="200" y="30" textAnchor="middle" fontSize="12" fill="#2d2d2d" fontWeight="bold">
                    {height.toFixed(2)}m
                  </text>
                  <text x="20" y="210" textAnchor="middle" fontSize="12" fill="#2d2d2d" fontWeight="bold">
                    {base.toFixed(2)}m
                  </text>
                  
                  {/* Legenda de pé-direito */}
                  <text x="360" y={200 - (MIN_COMFORT / data.height) * 150} fontSize="11" fill="#d97706" fontWeight="bold">
                    2.10m
                  </text>
                </svg>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-[#f5f3f0] rounded-lg">
                  <p className="text-xs text-[#6b6b6b]">Ângulo</p>
                  <p className="text-lg font-bold text-[#15803d]">{data.angle.toFixed(1)}°</p>
                </div>
                <div className="p-3 bg-[#f5f3f0] rounded-lg">
                  <p className="text-xs text-[#6b6b6b]">Largura Útil</p>
                  <p className="text-lg font-bold text-[#15803d]">{data.usefulWidth.toFixed(2)}m</p>
                </div>
                <div className="p-3 bg-[#f5f3f0] rounded-lg">
                  <p className="text-xs text-[#6b6b6b]">Comprimento</p>
                  <p className="text-lg font-bold text-[#15803d]">{data.length.toFixed(2)}m</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#e8e6e1] my-6"></div>

              {/* Materiais ICF */}
              <h3 className="text-lg font-bold text-[#2d2d2d] mb-4">Materiais ICF</h3>

              <div className="space-y-4">
                <div className="bg-[#f5f3f0] p-4 rounded-lg">
                  <p className="text-xs text-[#6b6b6b] mb-1">Área de Paredes</p>
                  <p className="text-2xl font-bold text-[#15803d]">{data.wallArea.toFixed(2)} m²</p>
                </div>

                <div className="bg-[#f5f3f0] p-4 rounded-lg">
                  <p className="text-xs text-[#6b6b6b] mb-1">Concreto Necessário</p>
                  <p className="text-2xl font-bold text-[#15803d]">{data.concreteVolume.toFixed(2)} m³</p>
                </div>

                <div className="bg-[#f5f3f0] p-4 rounded-lg">
                  <p className="text-xs text-[#6b6b6b] mb-1">Aço de Reforço</p>
                  <p className="text-2xl font-bold text-[#15803d]">{data.steelWeight.toFixed(0)} kg</p>
                </div>

                <div className="bg-[#f5f3f0] p-4 rounded-lg">
                  <p className="text-xs text-[#6b6b6b] mb-1">EPS (Isolamento)</p>
                  <p className="text-2xl font-bold text-[#15803d]">{data.epsVolume.toFixed(2)} m³</p>
                  <p className="text-xs text-[#6b6b6b] mt-1">({data.epsWeight.toFixed(0)} kg)</p>
                </div>

                <div className="bg-[#f5f3f0] p-4 rounded-lg">
                  <p className="text-xs text-[#6b6b6b] mb-1">Iceflex (Revestimento)</p>
                  <p className="text-2xl font-bold text-[#15803d]">{costs.iceflexBaldesNeeded} baldes</p>
                  <p className="text-xs text-[#6b6b6b] mt-1">(18 KG cada - ~7 m² por balde)</p>
                </div>

                <div className="bg-[#f5f3f0] p-4 rounded-lg">
                  <p className="text-xs text-[#6b6b6b] mb-1">ICFibra (Reforço)</p>
                  <p className="text-2xl font-bold text-[#15803d]">{costs.icfibraRolosNeeded} rolos</p>
                  <p className="text-xs text-[#6b6b6b] mt-1">(50 m² cada - 1m × 50m)</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#e8e6e1] my-6"></div>

              {/* Orçamento */}
              <h3 className="text-lg font-bold text-[#2d2d2d] mb-4">Orçamento Estimado</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[#f5f3f0] rounded-lg">
                  <p className="text-sm text-[#6b6b6b]">Concreto</p>
                  <p className="font-bold text-[#15803d]">R$ {costs.concreteCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#f5f3f0] rounded-lg">
                  <p className="text-sm text-[#6b6b6b]">Aço</p>
                  <p className="font-bold text-[#15803d]">R$ {costs.steelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#f5f3f0] rounded-lg">
                  <p className="text-sm text-[#6b6b6b]">EPS + Acessórios</p>
                  <p className="font-bold text-[#15803d]">R$ {(costs.epsCost + costs.accessoriesCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#f5f3f0] rounded-lg">
                  <p className="text-sm text-[#6b6b6b]">Iceflex (Revestimento)</p>
                  <p className="font-bold text-[#15803d]">R$ {costs.iceflexCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#f5f3f0] rounded-lg">
                  <p className="text-sm text-[#6b6b6b]">ICFibra (Reforço)</p>
                  <p className="font-bold text-[#15803d]">R$ {costs.icfibraCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#15803d] to-[#2d5016] rounded-lg">
                  <p className="font-bold text-white">Total de Materiais</p>
                  <p className="text-2xl font-bold text-white">R$ {costs.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#fef3c7] rounded-lg">
                  <p className="text-sm text-[#92400e] font-semibold">Custo por m² de parede</p>
                  <p className="font-bold text-[#92400e]">R$ {costs.costPerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </Card>
          </div>
          )}
        </div>

        {/* Seção de Mão de Obra */}
        {showResults && (
        <div className="mt-8">
          <LaborCosts
            services={laborServices}
            onServicesChange={setLaborServices}
          />
        </div>
        )}

        {/* Seção de Materiais Customizáveis */}
        {showResults && (
        <div className="mt-8">
          <CustomMaterials
            materials={customMaterials}
            onMaterialsChange={setCustomMaterials}
          />
        </div>
        )}

        {/* Seção de Fundação */}
        {showResults && (
        <div className="mt-8">
          <Foundation
            foundation={foundation}
            onFoundationChange={setFoundation}
            projectArea={data.totalArea}
          />
        </div>
        )}

        {/* Gráficos de Análise de Custos */}
        {showResults && (
        <CostAnalysisCharts
          concreteCost={costs.concreteCost}
          steelCost={costs.steelCost}
          epsCost={costs.epsCost}
          accessoriesCost={costs.accessoriesCost}
          iceflexCost={costs.iceflexCost}
          icfibraCost={costs.icfibraCost}
          laborCost={costs.laborCost}
          totalCost={costs.totalCost}
        />
        )}

        {/* Visualização 3D */}
        {showResults && (
        <AFrame3DViewer
          base={base}
          height={height}
          length={length}
        />
        )}

        {/* Análise Geotécnica */}
        {showResults && (
        <GeoTechnicalAnalysis
          base={base}
          height={height}
          length={length}
          foundationType={foundation?.type || 'radié'}
          onGeoDataChange={setGeoTechnicalData}
        />
        )}

        {/* Botão de Exportação PDF */}
        {showResults && (
        <div className="flex justify-center mt-8">
          <PDFExportButton
            simulationName="Simulacao de Chale A-frame"
            base={base}
            height={height}
            length={length}
            angle={data.angle}
            faceLength={data.faceLength}
            usefulWidth={data.usefulWidth}
            utilization={data.utilization}
            floorArea={data.totalArea}
            volume={data.volume}
            wallArea={data.wallArea}
            concreteVolume={data.concreteVolume}
            steelWeight={data.steelWeight}
            epsVolume={data.epsVolume}
            epsWeight={data.epsWeight}
            iceflexQuantity={Math.ceil(data.wallArea / 7)}
            icfibraQuantity={Math.ceil(data.wallArea / 50)}
            concreteCost={costs.concreteCost}
            steelCost={costs.steelCost}
            epsCost={costs.epsCost}
            accessoriesCost={costs.accessoriesCost}
            iceflexCost={costs.iceflexCost}
            icfibraCost={costs.icfibraCost}
            laborCost={costs.laborCost}
            totalCost={costs.totalCost}
            laborServices={laborServices.map(s => ({
              name: s.name,
              quantity: s.quantity,
              unit: s.unit,
              unitPrice: s.unitPrice,
              subtotal: s.quantity * s.unitPrice
            }))}
          />
        </div>
        )}

        {/* Informações Normativas */}
        {showResults && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border-[#e8e6e1] shadow-lg rounded-2xl">
            <div className="flex items-start gap-4">
              <Ruler className="w-6 h-6 text-[#15803d] mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-[#2d2d2d] mb-2">Pé-direito Mínimo</h4>
                <p className="text-sm text-[#6b6b6b]">NBR 15575 recomenda 2,40m para permanência prolongada e 2,10m para transição.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-[#e8e6e1] shadow-lg rounded-2xl">
            <div className="flex items-start gap-4">
              <ArrowRight className="w-6 h-6 text-[#15803d] mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-[#2d2d2d] mb-2">Ângulo Ideal</h4>
                <p className="text-sm text-[#6b6b6b]">Entre 66° e 68° garante bom escoamento de água e visual estético.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-[#e8e6e1] shadow-lg rounded-2xl">
            <div className="flex items-start gap-4">
              <Home className="w-6 h-6 text-[#15803d] mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-[#2d2d2d] mb-2">Recomendação</h4>
                <p className="text-sm text-[#6b6b6b]">
                  Base {base.toFixed(2)}m com altura {height.toFixed(2)}m oferece excelente equilíbrio entre conforto e design.
                  {data.usefulWidth < 2.1 && " Considere aumentar a altura para melhor aproveitamento."}
                  {data.angle < 66 && " O ângulo está abaixo do ideal (66-68°)."}
                  {data.angle > 68 && " O ângulo está acima do ideal (66-68°)."}
                </p>
              </div>
            </div>
          </Card>
        </div>
        )}

        {/* Comparador Modal */}
        <ComparadorSimulacoes
          open={showComparador}
          onOpenChange={setShowComparador}
          savedSimulations={savedSimulations}
          calculateSimulationData={(base, height, length) => {
            const b = base / 2;
            const h = height;
            const angleRad = Math.atan(h / b);
            const angleDeg = (angleRad * 180) / Math.PI;
            const faceLength = Math.sqrt(b * b + h * h);
            const usefulWidthHalf = (b * (h - MIN_COMFORT)) / h;
            const usefulWidth = usefulWidthHalf * 2;
            const utilization = (usefulWidth / base) * 100;
            const totalArea = base * length;
            const triangleArea = (base * h) / 2;
            const volume = triangleArea * length;
            const lateralWallArea = 2 * (faceLength * length);
            const frontalWallArea = 2 * triangleArea;
            const wallArea = lateralWallArea + frontalWallArea;
            const concreteVolume = wallArea * ICF_CONCRETE_PER_M2;
            const steelWeight = wallArea * ICF_STEEL_PER_M2;
            const epsVolume = wallArea * ICF_EPS_PER_M2;
            const epsWeight = epsVolume * ICF_EPS_DENSITY;
            return {
              base,
              height,
              length,
              angle: angleDeg,
              usefulWidth,
              utilization,
              faceLength,
              totalArea,
              volume,
              wallArea,
              concreteVolume,
              steelWeight,
              epsVolume,
              epsWeight,
            };
          }}
          calculateCosts={(data) => {
            const concreteCost = data.concreteVolume * prices.concretePerM3;
            const steelCost = data.steelWeight * prices.steelPerKg;
            const epsCost = data.wallArea * 2 * prices.epsPerForm;
            const accessoriesCost = data.wallArea * prices.accessories;
            const iceflexBaldesNeeded = Math.ceil(data.wallArea / 7);
            const iceflexCost = iceflexBaldesNeeded * prices.iceflex;
            const icfibraRolosNeeded = Math.ceil(data.wallArea / 50);
            const icfibraCost = icfibraRolosNeeded * prices.icfibra;
            const totalCost = concreteCost + steelCost + epsCost + accessoriesCost + iceflexCost + icfibraCost;
            const costPerM2 = Math.round((totalCost / data.wallArea) * 100) / 100;
            return {
              concreteCost,
              steelCost,
              epsCost,
              accessoriesCost,
              iceflexCost,
              icfibraCost,
              totalCost,
              costPerM2,
            };
          }}
        />
      </div>
    </div>
  );
}
