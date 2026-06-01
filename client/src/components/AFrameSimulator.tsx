import { useState, useMemo, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowRight, Ruler, Home } from 'lucide-react';
import { toast } from 'sonner';

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
  epsPerM3: number;
  accessories: number;
}

interface SavedSimulation {
  id: string;
  name: string;
  base: number;
  height: number;
  length: number;
  timestamp: number;
}

const MIN_BASE = 3.5;
const MAX_BASE = 6.0;
const MIN_HEIGHT = 3.0;
const MAX_HEIGHT = 7.0;
const MIN_LENGTH = 4.0;
const MAX_LENGTH = 10.0;
const MIN_COMFORT = 2.1;

const ICF_CONCRETE_PER_M2 = 0.10;
const ICF_STEEL_PER_M2 = 4.0;
const ICF_EPS_PER_M2 = 0.13;
const ICF_EPS_DENSITY = 22;

const DEFAULT_PRICES: MaterialPrices = {
  concretePerM3: 500,
  steelPerKg: 6.0,
  epsPerM3: 100,
  accessories: 20,
};

export default function AFrameSimulator() {
  const [base, setBase] = useState(4.0);
  const [height, setHeight] = useState(5.0);
  const [length, setLength] = useState(5.0);
  const [prices, setPrices] = useState<MaterialPrices>(DEFAULT_PRICES);
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showResults, setShowResults] = useState(true);

  const handleResetSimulation = () => {
    setBase(4.0);
    setHeight(5.0);
    setLength(5.0);
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
    const epsCost = data.epsVolume * prices.epsPerM3;
    const accessoriesCost = data.wallArea * prices.accessories;
    const totalCost = concreteCost + steelCost + epsCost + accessoriesCost;
    
    return {
      concreteCost,
      steelCost,
      epsCost,
      accessoriesCost,
      totalCost,
      costPerM2: Math.round((totalCost / data.wallArea) * 100) / 100,
    };
  }, [data, prices]);

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
            {savedSimulations.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSaved(!showSaved)}
                className="px-6 py-2 bg-[#6366f1] text-white rounded-lg font-semibold hover:bg-[#4f46e5] transition-colors"
              >
                📊 Simulações Salvas ({savedSimulations.length})
              </button>
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
                  step={0.1}
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
                  step={0.1}
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
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-[#6b6b6b] mt-2">Recomendado: 5,00 m - 6,00 m</p>
              </div>

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
                <p className="text-sm text-[#6b6b6b]">Base 4,00m com altura 5,00m oferece excelente equilíbrio entre conforto e design.</p>
              </div>
            </div>
          </Card>
        </div>
        )}
      </div>
    </div>
  );
}
