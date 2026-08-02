import React, { useMemo } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { calculateEPSOptimization, suggestOptimizedDimensions } from '@/lib/epsOptimization';

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

  const getIcon = () => {
    if (!optimization.hasWaste) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (optimization.wastePercentage < 5) return <Lightbulb className="w-5 h-5 text-blue-600" />;
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
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        
        <div className="flex-1">
          <h3 className={`font-semibold ${getTextColor()} mb-2`}>
            Otimização de EPS
          </h3>
          
          <p className={`text-sm ${getTextColor()} mb-3`}>
            {optimization.recommendation}
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div className="bg-white bg-opacity-50 rounded p-2">
              <p className="text-gray-600 text-xs">Área de Parede</p>
              <p className="font-semibold">{optimization.totalWallArea.toFixed(2)} m²</p>
            </div>
            <div className="bg-white bg-opacity-50 rounded p-2">
              <p className="text-gray-600 text-xs">Blocos EPS Necessários</p>
              <p className="font-semibold">{optimization.currentEpsBlocks}</p>
            </div>
            <div className="bg-white bg-opacity-50 rounded p-2">
              <p className="text-gray-600 text-xs">Desperdício</p>
              <p className="font-semibold">{optimization.wastePercentage.toFixed(2)}%</p>
            </div>
            <div className="bg-white bg-opacity-50 rounded p-2">
              <p className="text-gray-600 text-xs">Comprimento × Altura</p>
              <p className="font-semibold">{length.toFixed(2)}m × {height.toFixed(2)}m</p>
            </div>
          </div>

          {optimization.hasWaste && optimization.wastePercentage > 5 && (
            <div className="bg-white bg-opacity-50 rounded p-3 mb-3">
              <p className="text-sm font-semibold mb-2 text-gray-800">
                💡 Dimensões Otimizadas Sugeridas:
              </p>
              <p className="text-sm text-gray-700 mb-2">
                Comprimento: <strong>{suggestedDimensions.length.toFixed(2)}m</strong> (atual: {length.toFixed(2)}m)
              </p>
              <p className="text-sm text-gray-700">
                Altura: <strong>{suggestedDimensions.height.toFixed(2)}m</strong> (atual: {height.toFixed(2)}m)
              </p>
              {onOptimizationSuggested && (
                <button
                  onClick={() =>
                    onOptimizationSuggested(
                      baseWidth,
                      suggestedDimensions.height,
                      suggestedDimensions.length
                    )
                  }
                  className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                >
                  Aplicar Dimensões Otimizadas
                </button>
              )}
            </div>
          )}

          <div className="text-xs text-gray-600 bg-white bg-opacity-50 rounded p-2">
            <p className="font-semibold mb-1">📋 Informações Técnicas:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Blocos EPS padrão: 1.25m × 0.25m</li>
              <li>Cada bloco cobre ~1m² de parede</li>
              <li>2 formas por metro quadrado</li>
              <li>Otimização reduz recortes e desperdício</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
