import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Grid3x3, AlertTriangle } from 'lucide-react';
import { DetailedBlockBreakdown } from '@/lib/detailedBlockCalculation';

interface DetailedBlockBreakdownProps {
  breakdown: DetailedBlockBreakdown;
}

export function DetailedBlockBreakdownComponent({
  breakdown,
}: DetailedBlockBreakdownProps) {
  const [expandedWall, setExpandedWall] = useState<string | null>(null);

  const toggleWall = (wallName: string) => {
    setExpandedWall(expandedWall === wallName ? null : wallName);
  };

  return (
    <div className="space-y-4">
      {/* Resumo Geral */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-gray-600">Área Total</p>
            <p className="text-lg font-bold text-blue-600">{breakdown.totalArea} m²</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total de Blocos</p>
            <p className="text-lg font-bold text-blue-600">{breakdown.totalBlocks}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Blocos Inteiros</p>
            <p className="text-lg font-bold text-green-600">{breakdown.totalWholeBlocks}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Blocos Cortados</p>
            <p className="text-lg font-bold text-orange-600">{breakdown.totalCutBlocks}</p>
          </div>
        </div>
      </Card>

      {/* Recomendações */}
      {breakdown.recommendations.length > 0 && (
        <div className="space-y-2">
          {breakdown.recommendations.map((rec: string, idx: number) => (
            <div key={idx} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">{rec}</p>
            </div>
          ))}
        </div>
      )}

      {/* Paredes Laterais */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Grid3x3 className="w-4 h-4" />
          Paredes Laterais (Retangulares)
        </h3>
        {breakdown.lateralWalls.map((wall: any) => (
          <div key={wall.wallName} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleWall(wall.wallName)}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <div>
                  <p className="font-semibold text-gray-800">{wall.wallName}</p>
                  <p className="text-xs text-gray-600">
                    {wall.length.toFixed(2)}m × {wall.height.toFixed(2)}m = {wall.area.toFixed(2)}m²
                  </p>
                </div>
              </div>
              {expandedWall === wall.wallName ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {expandedWall === wall.wallName && (
              <div className="p-4 bg-white space-y-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Blocos Inteiros</p>
                    <p className="text-2xl font-bold text-green-600">{wall.wholeBlocks}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Blocos Cortados</p>
                    <p className="text-2xl font-bold text-orange-600">{wall.cutBlocks}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Desperdício</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-800">{wall.wastePercentage.toFixed(1)}%</p>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 transition-all"
                        style={{ width: `${Math.min(wall.wastePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  <strong>Cálculo:</strong> {wall.length.toFixed(2)}m ÷ 1.25m = {(wall.length / 1.25).toFixed(2)} blocos (comprimento)
                  <br />
                  {wall.height.toFixed(2)}m ÷ 0.40m = {(wall.height / 0.40).toFixed(2)} blocos (altura)
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Paredes Triangulares */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Grid3x3 className="w-4 h-4" />
          Paredes Triangulares (A-frame - Frente/Fundo)
        </h3>
        {breakdown.triangularWalls.map((wall: any) => (
          <div key={wall.wallName} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleWall(wall.wallName)}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <div>
                  <p className="font-semibold text-gray-800">{wall.wallName}</p>
                  <p className="text-xs text-gray-600">
                    Base {wall.length.toFixed(2)}m × Altura {wall.height.toFixed(2)}m = {wall.area.toFixed(2)}m²
                  </p>
                </div>
              </div>
              {expandedWall === wall.wallName ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {expandedWall === wall.wallName && (
              <div className="p-4 bg-white space-y-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Blocos Inteiros</p>
                    <p className="text-2xl font-bold text-green-600">{wall.wholeBlocks}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Blocos Cortados</p>
                    <p className="text-2xl font-bold text-orange-600">{wall.cutBlocks}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Desperdício</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-800">{wall.wastePercentage.toFixed(1)}%</p>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 transition-all"
                        style={{ width: `${Math.min(wall.wastePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  <strong>Nota:</strong> Paredes triangulares têm desperdício maior devido à geometria A-frame.
                  <br />
                  Blocos são cortados em ângulo para se ajustar ao telhado.
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumo de Desperdício */}
      <Card className="p-4 bg-red-50 border-red-200">
        <p className="text-sm font-semibold text-red-800 mb-2">Desperdício Médio: {breakdown.averageWastePercentage.toFixed(1)}%</p>
        <p className="text-xs text-red-700">
          Blocos cortados representam {breakdown.totalCutBlocks} do total de {breakdown.totalBlocks} blocos ({((breakdown.totalCutBlocks / breakdown.totalBlocks) * 100).toFixed(1)}%)
        </p>
      </Card>
    </div>
  );
}
