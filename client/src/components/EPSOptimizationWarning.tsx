import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { calculateEPSOptimization, suggestOptimizedDimensions } from '@/lib/epsOptimization';
import { EPSBlockDetailsTooltip } from './EPSBlockDetailsTooltip';
import { EPSSavingsChart } from './EPSSavingsChart';

interface EPSOptimizationWarningProps {
  baseWidth: number;
  height: number;
  length: number;
  onOptimizationSuggested?: (newBase: number, newHeight: number, newLength: number) => void;
}

export function EPSOptimizationWarning({
  baseWidth,
  height,
  length,
  onOptimizationSuggested,
}: EPSOptimizationWarningProps) {
  const [showSavingsChart, setShowSavingsChart] = useState(false);

  const optimization = useMemo(() => {
    return calculateEPSOptimization(baseWidth, height, length);
  }, [baseWidth, height, length]);

  const suggestedDimensions = useMemo(() => {
    return suggestOptimizedDimensions(length, height);
  }, [length, height]);

  const getAlertColor = () => {
    if (!optimization.hasWaste) return 'bg-green-50 border-green-200';
    if (optimization.wastePercentage < 5) return 'bg-blue-50 border-blue-200';
    if (optimization.wastePercentage < 15) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getAlertIcon = () => {
    if (!optimization.hasWaste) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (optimization.wastePercentage < 5) return <CheckCircle className="w-5 h-5 text-blue-600" />;
    if (optimization.wastePercentage < 15) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  const getTextColor = () => {
    if (!optimization.hasWaste) return 'text-green-800';
    if (optimization.wastePercentage < 5) return 'text-blue-800';
    if (optimization.wastePercentage < 15) return 'text-yellow-800';
    return 'text-red-800';
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${getAlertColor()}`}>
      <div className="flex items-start gap-3">
        {getAlertIcon()}
        <div className="flex-1">
          <h3 className={`font-semibold mb-2 ${getTextColor()}`}>
            🔧 Otimização de EPS
          </h3>
          <p className={`text-sm mb-3 ${getTextColor()}`}>
            {optimization.recommendation}
          </p>

          {/* Current Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
            <div className="bg-white bg-opacity-70 rounded p-2">
              <p className="text-gray-600 text-xs">Área de Parede</p>
              <p className="font-bold text-gray-800">{optimization.totalWallArea} m²</p>
            </div>
            <div className="bg-white bg-opacity-70 rounded p-2">
              <p className="text-gray-600 text-xs">Blocos EPS</p>
              <p className="font-bold text-gray-800">{optimization.blockDetails.totalBlocks}</p>
            </div>
            <div className="bg-white bg-opacity-70 rounded p-2">
              <p className="text-gray-600 text-xs">Blocos Cortados</p>
              <p className="font-bold text-orange-600">{optimization.blockDetails.cutBlocks}</p>
            </div>
            <div className="bg-white bg-opacity-70 rounded p-2">
              <p className="text-gray-600 text-xs">Desperdício</p>
              <p className="font-bold text-red-600">{optimization.wastePercentage.toFixed(1)}%</p>
            </div>
          </div>

          {/* Optimization Suggestion */}
          {optimization.hasWaste && optimization.wastePercentage > 5 && (
            <div className="bg-white bg-opacity-50 rounded p-3 mb-3">
              <p className="text-sm font-semibold mb-2 text-gray-800">
                💡 Dimensões Otimizadas Sugeridas:
              </p>
              <p className="text-sm text-gray-700 mb-2">
                Comprimento: <strong>{suggestedDimensions.length.toFixed(2)}m</strong> (atual: {length.toFixed(2)}m)
              </p>
              <p className="text-sm text-gray-700 mb-2">
                Altura: <strong>{suggestedDimensions.height.toFixed(2)}m</strong> (atual: {height.toFixed(2)}m)
              </p>
              <p className="text-sm text-green-700 font-semibold mb-3">
                💰 Economia Estimada: R$ {optimization.financialSavings.toFixed(2)}
              </p>
              <div className="flex gap-2 flex-wrap">
                {onOptimizationSuggested && (
                  <button
                    onClick={() =>
                      onOptimizationSuggested(
                        baseWidth,
                        suggestedDimensions.height,
                        suggestedDimensions.length
                      )
                    }
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                  >
                    Aplicar Dimensões Otimizadas
                  </button>
                )}
                <button
                  onClick={() => setShowSavingsChart(!showSavingsChart)}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                >
                  {showSavingsChart ? 'Ocultar' : 'Ver'} Gráfico de Economia
                </button>
              </div>
            </div>
          )}

          {/* Technical Info with Tooltip */}
          <div className="text-xs text-gray-600 bg-white bg-opacity-50 rounded p-2 mb-3">
            <p className="font-semibold mb-1">📋 Informações Técnicas:</p>
            <ul className="list-disc list-inside space-y-1 mb-2">
              <li>Blocos EPS padrão: 1.25m × 0.40m</li>
              <li>Cada 2 formas = 1m² de parede</li>
              <li>72 litros de concreto por m² de parede</li>
              <li>~5 kg de aço por m² de parede</li>
              <li>Otimização reduz recortes e desperdício</li>
            </ul>
            <div className="pt-2 border-t border-gray-300">
              <EPSBlockDetailsTooltip
                currentBlocks={optimization.blockDetails}
                optimalBlocks={optimization.optimalBlockDetails}
                currentLength={length}
                currentHeight={height}
                optimalLength={optimization.optimalLength}
                optimalHeight={optimization.optimalHeight}
              />
            </div>
          </div>

          {/* Savings Chart */}
          {showSavingsChart && (
            <EPSSavingsChart
              currentTotalCost={optimization.blockDetails.totalBlocks * 75.70 * 2}
              optimizedTotalCost={optimization.optimalBlockDetails.totalBlocks * 75.70 * 2}
              currentBlockCount={optimization.blockDetails.totalBlocks}
              optimizedBlockCount={optimization.optimalBlockDetails.totalBlocks}
              financialSavings={optimization.financialSavings}
              materialSavings={optimization.materialSavings}
            />
          )}
        </div>
      </div>
    </div>
  );
}
