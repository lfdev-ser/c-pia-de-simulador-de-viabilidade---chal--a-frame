import React, { useState } from 'react';
import { HelpCircle, Grid3x3, Scissors } from 'lucide-react';
import { EPSBlockDetails } from '@/lib/epsOptimization';

interface EPSBlockDetailsTooltipProps {
  currentBlocks: EPSBlockDetails;
  optimalBlocks: EPSBlockDetails;
  currentLength: number;
  currentHeight: number;
  optimalLength: number;
  optimalHeight: number;
}

export function EPSBlockDetailsTooltip({
  currentBlocks,
  optimalBlocks,
  currentLength,
  currentHeight,
  optimalLength,
  optimalHeight,
}: EPSBlockDetailsTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const blockSavings = currentBlocks.totalBlocks - optimalBlocks.totalBlocks;
  const cutBlocksSavings = currentBlocks.cutBlocks - optimalBlocks.cutBlocks;

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
        title="Clique para ver detalhes de blocos EPS"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="text-xs underline">Detalhes de Blocos</span>
      </button>

      {showTooltip && (
        <div className="absolute left-0 top-full mt-2 w-96 bg-white border border-blue-200 rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-4">
            {/* Current Configuration */}
            <div className="border-b pb-3">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Grid3x3 className="w-4 h-4 text-blue-600" />
                Configuração Atual: {currentLength.toFixed(2)}m × {currentHeight.toFixed(2)}m
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-blue-50 p-2 rounded">
                  <p className="text-gray-600">Blocos Inteiros</p>
                  <p className="text-lg font-bold text-blue-600">{currentBlocks.wholeBlocks}</p>
                </div>
                <div className="bg-orange-50 p-2 rounded">
                  <p className="text-gray-600 flex items-center gap-1">
                    <Scissors className="w-3 h-3" /> Blocos Cortados
                  </p>
                  <p className="text-lg font-bold text-orange-600">{currentBlocks.cutBlocks}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded col-span-2">
                  <p className="text-gray-600">Total de Blocos</p>
                  <p className="text-lg font-bold text-gray-800">{currentBlocks.totalBlocks}</p>
                </div>
              </div>
              {currentBlocks.cutBlocks > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  ⚠️ Desperdício por bloco cortado: {currentBlocks.wastePercentagePerBlock.toFixed(1)}%
                </p>
              )}
            </div>

            {/* Optimal Configuration */}
            <div className="border-b pb-3">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Grid3x3 className="w-4 h-4 text-green-600" />
                Configuração Otimizada: {optimalLength.toFixed(2)}m × {optimalHeight.toFixed(2)}m
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-green-50 p-2 rounded">
                  <p className="text-gray-600">Blocos Inteiros</p>
                  <p className="text-lg font-bold text-green-600">{optimalBlocks.wholeBlocks}</p>
                </div>
                <div className="bg-orange-50 p-2 rounded">
                  <p className="text-gray-600 flex items-center gap-1">
                    <Scissors className="w-3 h-3" /> Blocos Cortados
                  </p>
                  <p className="text-lg font-bold text-orange-600">{optimalBlocks.cutBlocks}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded col-span-2">
                  <p className="text-gray-600">Total de Blocos</p>
                  <p className="text-lg font-bold text-gray-800">{optimalBlocks.totalBlocks}</p>
                </div>
              </div>
              {optimalBlocks.cutBlocks === 0 && (
                <p className="text-xs text-green-600 mt-2">
                  ✅ Sem blocos cortados! Aproveitamento 100%
                </p>
              )}
            </div>

            {/* Savings Summary */}
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <h4 className="font-semibold text-green-800 mb-2">💰 Economia com Otimização</h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <strong>Blocos Economizados:</strong> {blockSavings}
                </p>
                <p className="text-gray-700">
                  <strong>Blocos Cortados Eliminados:</strong> {cutBlocksSavings}
                </p>
                <p className="text-gray-700">
                  <strong>Redução de Desperdício:</strong> {(currentBlocks.wastePercentagePerBlock * currentBlocks.cutBlocks - optimalBlocks.wastePercentagePerBlock * optimalBlocks.cutBlocks).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Technical Info */}
            <div className="bg-gray-50 rounded p-2 text-xs text-gray-600">
              <p className="font-semibold mb-1">📋 Dimensões Padrão de Blocos EPS:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Comprimento: 1.25m</li>
                <li>Altura: 0.40m (40cm) - CORRIGIDO</li>
                <li>Espessura: 0.30m (30cm)</li>
                <li>Cada 2 formas = 1m² de parede</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
