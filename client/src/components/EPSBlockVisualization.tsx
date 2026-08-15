import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';

interface EPSBlockVisualizationProps {
  length: number;
  height: number;
  baseWidth?: number;
}

interface BlockPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  isWhole: boolean;
  blockNumber: number;
}

export function EPSBlockVisualization({
  length,
  height,
  baseWidth = 4,
}: EPSBlockVisualizationProps) {
  const EPS_BLOCK_LENGTH = 1.25; // metros
  const EPS_BLOCK_HEIGHT = 0.40; // metros

  const [activeFace, setActiveFace] = useState<'side' | 'front_rear'>('side');

  const currentDim = activeFace === 'side' 
    ? { l: length, h: height } 
    : { l: baseWidth, h: height };

  const visualization = useMemo(() => {
    const l = currentDim.l;
    const h = currentDim.h;
    if (l === 0 || h === 0) {
      return null;
    }

    const blocksHorizontal = Math.ceil(l / EPS_BLOCK_LENGTH);
    const blocksVertical = Math.ceil(h / EPS_BLOCK_HEIGHT);
    const totalBlocks = blocksHorizontal * blocksVertical;

    const lengthRemainder = l % EPS_BLOCK_LENGTH;
    const heightRemainder = h % EPS_BLOCK_HEIGHT;

    const hasHorizontalCut = lengthRemainder > 0.01;
    const hasVerticalCut = heightRemainder > 0.01;

    const svgWidth = 600;
    const svgHeight = 400;
    const padding = 40;

    const maxLength = l > 0 ? l : 1;
    const maxHeight = h > 0 ? h : 1;
    const scaleX = (svgWidth - padding * 2) / maxLength;
    const scaleY = (svgHeight - padding * 2) / maxHeight;

    const blocks: BlockPosition[] = [];
    let blockNumber = 1;

    for (let row = 0; row < blocksVertical; row++) {
      for (let col = 0; col < blocksHorizontal; col++) {
        const x = padding + col * EPS_BLOCK_LENGTH * scaleX;
        const y = padding + row * EPS_BLOCK_HEIGHT * scaleY;

        const isLastCol = col === blocksHorizontal - 1;
        const isLastRow = row === blocksVertical - 1;

        const blockWidth = isLastCol && hasHorizontalCut
          ? lengthRemainder * scaleX
          : EPS_BLOCK_LENGTH * scaleX;

        const blockHeight = isLastRow && hasVerticalCut
          ? heightRemainder * scaleY
          : EPS_BLOCK_HEIGHT * scaleY;

        const isWhole = !((isLastCol && hasHorizontalCut) || (isLastRow && hasVerticalCut));

        blocks.push({
          x,
          y,
          width: blockWidth,
          height: blockHeight,
          isWhole,
          blockNumber,
        });

        blockNumber++;
      }
    }

    return {
      blocks,
      svgWidth,
      svgHeight,
      totalBlocks,
      wholeBlocks: blocks.filter(b => b.isWhole).length,
      cutBlocks: blocks.filter(b => !b.isWhole).length,
      blocksHorizontal,
      blocksVertical,
    };
  }, [currentDim.l, currentDim.h]);

  if (!visualization) {
    return (
      <Card className="p-6 bg-white border-[#e8e6e1] text-center">
        <p className="text-[#6b6b6b]">Defina as dimensões para visualizar os blocos</p>
      </Card>
    );
  }

  const { blocks, svgWidth, svgHeight, totalBlocks, wholeBlocks, cutBlocks, blocksHorizontal, blocksVertical } = visualization;

  return (
    <Card className="p-6 bg-white border-[#e8e6e1]">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#2d2d2d] mb-2">
            📐 Visualização 2D — Disposição de Blocos EPS (4 Faces do A-Frame)
          </h3>
          <p className="text-sm text-[#6b6b6b]">
            O A-Frame é composto por <strong>2 lados inclinados</strong> (laterais) e <strong>2 paredes</strong> (frente e fundo). Selecione abaixo qual face deseja inspecionar em detalhe:
          </p>
        </div>

        {/* Seletor de Faces */}
        <div className="flex gap-2 border-b border-[#e8e6e1] pb-3">
          <button
            onClick={() => setActiveFace('side')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeFace === 'side'
                ? 'bg-[#15803d] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lados Inclinados (2x)
          </button>
          <button
            onClick={() => setActiveFace('front_rear')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeFace === 'front_rear'
                ? 'bg-[#15803d] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Frente e Fundo (2x)
          </button>
        </div>

        <div className="text-xs text-[#6b6b6b] bg-[#f9f9f9] p-2 rounded">
          {activeFace === 'side' ? (
            <span>Exibindo 1 dos 2 lados inclinados (Comprimento: <strong>{length.toFixed(2)}m</strong> × Altura: <strong>{height.toFixed(2)}m</strong>). O cálculo total considera <strong>2 paredes laterais</strong>.</span>
          ) : (
            <span>Exibindo as paredes de Frente/Fundo (Base: <strong>{baseWidth.toFixed(2)}m</strong> × Altura: <strong>{height.toFixed(2)}m</strong>). O cálculo total considera <strong>2 paredes frontais/traseiras</strong> com cortes em ângulo.</span>
          )}
        </div>

        {/* SVG Visualization */}
        <div className="flex justify-center bg-[#f9f9f9] p-4 rounded-lg overflow-x-auto">
          <svg width={svgWidth} height={svgHeight} className="border border-[#e8e6e1] bg-white">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#f0f0f0"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

            {/* Blocks */}
            {blocks.map((block) => (
              <g key={`block-${block.blockNumber}`}>
                <rect
                  x={block.x}
                  y={block.y}
                  width={block.width}
                  height={block.height}
                  fill={block.isWhole ? '#15803d' : '#f97316'}
                  stroke="#2d2d2d"
                  strokeWidth="1.5"
                  opacity="0.8"
                />
                {block.width > 30 && block.height > 20 && (
                  <text
                    x={block.x + block.width / 2}
                    y={block.y + block.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {block.blockNumber}
                  </text>
                )}
              </g>
            ))}

            <text
              x={svgWidth / 2}
              y={svgHeight - 10}
              textAnchor="middle"
              fill="#2d2d2d"
              fontSize="12"
              fontWeight="bold"
            >
              Comprimento da face: {currentDim.l.toFixed(2)}m
            </text>

            <text
              x={15}
              y={svgHeight / 2}
              textAnchor="middle"
              fill="#2d2d2d"
              fontSize="12"
              fontWeight="bold"
              transform={`rotate(-90 15 ${svgHeight / 2})`}
            >
              Altura: {currentDim.h.toFixed(2)}m
            </text>
          </svg>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-xs text-green-600 mb-1">Blocos Inteiros (Esta Face)</p>
            <p className="text-2xl font-bold text-green-900">{wholeBlocks}</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <p className="text-xs text-orange-600 mb-1">Blocos Cortados (Esta Face)</p>
            <p className="text-2xl font-bold text-orange-900">{cutBlocks}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-600 mb-1">Total de Blocos (Esta Face)</p>
            <p className="text-2xl font-bold text-blue-900">{totalBlocks}</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded p-3">
            <p className="text-xs text-purple-600 mb-1">Grid</p>
            <p className="text-2xl font-bold text-purple-900">
              {blocksHorizontal}×{blocksVertical}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-[#f5f3f0] p-4 rounded space-y-2">
          <p className="text-sm font-semibold text-[#2d2d2d]">📋 Legenda:</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-600 border border-[#2d2d2d]"></div>
              <span className="text-[#6b6b6b]">Blocos Inteiros (1.25m × 0.40m)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 border border-[#2d2d2d]"></div>
              <span className="text-[#6b6b6b]">Blocos Cortados (Ajuste/Ângulo)</span>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
          <p className="text-blue-900 font-semibold mb-2">💡 Súmula das 4 Faces do A-Frame (EPS 1.25m × 0.40m):</p>
          <ul className="text-blue-800 space-y-1 text-xs">
            <li>• <strong>2 Lados Inclinados</strong> (laterais do telhado): Comprimento {length.toFixed(2)}m × Altura {height.toFixed(2)}m cada.</li>
            <li>• <strong>2 Paredes Frontais/Traseiras</strong>: Base {baseWidth.toFixed(2)}m × Altura {height.toFixed(2)}m cada (com corte triangular).</li>
            <li>• Cada 2 formas = 1m² de parede. Concreto: 78 L/m² de parede. Aço: ~5 kg/m² de parede.</li>
            <li>• O simulador global soma todas as 4 faces para gerar os custos da obra cinza e o quantitativo exato de blocos.</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
