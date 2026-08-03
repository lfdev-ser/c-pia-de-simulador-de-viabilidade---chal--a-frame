import { useMemo } from 'react';
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

  const visualization = useMemo(() => {
    if (length === 0 || height === 0) {
      return null;
    }

    // Calcula quantos blocos cabem
    const blocksHorizontal = Math.ceil(length / EPS_BLOCK_LENGTH);
    const blocksVertical = Math.ceil(height / EPS_BLOCK_HEIGHT);
    const totalBlocks = blocksHorizontal * blocksVertical;

    // Calcula blocos inteiros e cortados
    const lengthRemainder = length % EPS_BLOCK_LENGTH;
    const heightRemainder = height % EPS_BLOCK_HEIGHT;

    const hasHorizontalCut = lengthRemainder > 0.01;
    const hasVerticalCut = heightRemainder > 0.01;

    // Dimensões do SVG
    const svgWidth = 600;
    const svgHeight = 400;
    const padding = 40;

    // Escala para caber no SVG
    const maxLength = length > 0 ? length : 1;
    const maxHeight = height > 0 ? height : 1;
    const scaleX = (svgWidth - padding * 2) / maxLength;
    const scaleY = (svgHeight - padding * 2) / maxHeight;

    // Gera posições dos blocos
    const blocks: BlockPosition[] = [];
    let blockNumber = 1;

    for (let row = 0; row < blocksVertical; row++) {
      for (let col = 0; col < blocksHorizontal; col++) {
        const x = padding + col * EPS_BLOCK_LENGTH * scaleX;
        const y = padding + row * EPS_BLOCK_HEIGHT * scaleY;

        // Verifica se é bloco inteiro ou cortado
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
  }, [length, height]);

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
            📐 Visualização 2D - Disposição de Blocos EPS
          </h3>
          <p className="text-sm text-[#6b6b6b]">
            Comprimento: {length.toFixed(2)}m × Altura: {height.toFixed(2)}m
          </p>
        </div>

        {/* SVG Visualization */}
        <div className="flex justify-center bg-[#f9f9f9] p-4 rounded-lg overflow-x-auto">
          <svg width={svgWidth} height={svgHeight} className="border border-[#e8e6e1] bg-white">
            {/* Grid background */}
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
                {/* Block number label */}
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

            {/* Dimensions labels */}
            {/* Horizontal dimension */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 10}
              textAnchor="middle"
              fill="#2d2d2d"
              fontSize="12"
              fontWeight="bold"
            >
              {length.toFixed(2)}m
            </text>

            {/* Vertical dimension */}
            <text
              x={15}
              y={svgHeight / 2}
              textAnchor="middle"
              fill="#2d2d2d"
              fontSize="12"
              fontWeight="bold"
              transform={`rotate(-90 15 ${svgHeight / 2})`}
            >
              {height.toFixed(2)}m
            </text>
          </svg>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-xs text-green-600 mb-1">Blocos Inteiros</p>
            <p className="text-2xl font-bold text-green-900">{wholeBlocks}</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <p className="text-xs text-orange-600 mb-1">Blocos Cortados</p>
            <p className="text-2xl font-bold text-orange-900">{cutBlocks}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-600 mb-1">Total de Blocos</p>
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
              <span className="text-[#6b6b6b]">Blocos Cortados</span>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
          <p className="text-blue-900 font-semibold mb-2">💡 Informações Técnicas:</p>
          <ul className="text-blue-800 space-y-1 text-xs">
            <li>• Cada bloco EPS padrão: 1.25m × 0.40m</li>
            <li>• Cada 2 formas = 1m² de parede</li>
            <li>• Total de formas necessárias: <strong>{totalBlocks * 2}</strong></li>
            <li>• Blocos inteiros: <strong>{wholeBlocks}</strong></li>
            <li>• Blocos que precisam corte: <strong>{cutBlocks}</strong></li>
            {cutBlocks > 0 && (
              <li className="text-orange-700 font-semibold">
                ⚠️ Atenção: {cutBlocks} bloco(s) precisará(ão) de corte
              </li>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
}
