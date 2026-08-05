/**
 * Detailed Block Calculation Utility
 * Calcula blocos EPS detalhados por tipo de parede (lateral vs triangular)
 */

interface WallBlockDetails {
  wallType: 'lateral' | 'triangular';
  wallName: string;
  length: number; // comprimento ou base
  height: number; // altura
  area: number; // m²
  totalBlocks: number;
  wholeBlocks: number;
  cutBlocks: number;
  wastePercentage: number;
}

export interface DetailedBlockBreakdown {
  lateralWalls: WallBlockDetails[];
  triangularWalls: WallBlockDetails[];
  totalArea: number;
  totalBlocks: number;
  totalWholeBlocks: number;
  totalCutBlocks: number;
  averageWastePercentage: number;
  recommendations: string[];
}

// Dimensões padrão dos blocos EPS (em metros)
const STANDARD_EPS_BLOCK = {
  length: 1.25,
  height: 0.40,
};

/**
 * Calcula detalhes de blocos para uma parede específica
 */
function calculateWallBlockDetails(
  wallLength: number,
  wallHeight: number,
  wallType: 'lateral' | 'triangular',
  wallName: string
): WallBlockDetails {
  // Calcular quantos blocos cabem perfeitamente
  const blocksLengthwise = Math.floor(wallLength / STANDARD_EPS_BLOCK.length);
  const blocksHeightwise = Math.floor(wallHeight / STANDARD_EPS_BLOCK.height);

  // Blocos inteiros
  const wholeBlocks = blocksLengthwise * blocksHeightwise;

  // Verificar se há resto (blocos que precisam ser cortados)
  const remainderLength = wallLength % STANDARD_EPS_BLOCK.length;
  const remainderHeight = wallHeight % STANDARD_EPS_BLOCK.height;

  let cutBlocks = 0;

  if (remainderLength > 0.01) {
    cutBlocks += blocksHeightwise; // uma coluna de blocos cortados
  }
  if (remainderHeight > 0.01) {
    cutBlocks += blocksLengthwise; // uma linha de blocos cortados
  }
  if (remainderLength > 0.01 && remainderHeight > 0.01) {
    cutBlocks += 1; // um bloco no canto cortado nos dois lados
  }

  // Calcular desperdício
  const area = wallLength * wallHeight;
  const totalBlocks = wholeBlocks + cutBlocks;
  const blockArea = STANDARD_EPS_BLOCK.length * STANDARD_EPS_BLOCK.height;
  const totalBlockArea = totalBlocks * blockArea;
  const wasteArea = totalBlockArea - area;
  const wastePercentage = area > 0 ? (wasteArea / area) * 100 : 0;

  return {
    wallType,
    wallName,
    length: wallLength,
    height: wallHeight,
    area,
    totalBlocks,
    wholeBlocks,
    cutBlocks,
    wastePercentage: Math.round(wastePercentage * 100) / 100,
  };
}

/**
 * Calcula detalhamento completo de blocos por tipo de parede
 */
export function calculateDetailedBlockBreakdown(
  baseWidth: number,
  height: number,
  length: number
): DetailedBlockBreakdown {
  const lateralWalls: WallBlockDetails[] = [];
  const triangularWalls: WallBlockDetails[] = [];

  // Calcular paredes laterais (2 paredes retangulares)
  // Cada parede lateral: comprimento × altura
  const lateralWall1 = calculateWallBlockDetails(
    length,
    height,
    'lateral',
    'Parede Lateral 1 (Lado A)'
  );
  const lateralWall2 = calculateWallBlockDetails(
    length,
    height,
    'lateral',
    'Parede Lateral 2 (Lado B)'
  );
  lateralWalls.push(lateralWall1, lateralWall2);

  // Calcular paredes triangulares (2 paredes A-frame)
  // Para parede triangular, precisamos calcular blocos por linha
  // Cada linha tem altura 0.40m e comprimento variável (base no topo = 0, base no pé = baseWidth)
  
  // Aproximação: usar a base como comprimento médio e altura como altura total
  const triangularWall1 = calculateWallBlockDetails(
    baseWidth,
    height,
    'triangular',
    'Parede Triangular 1 (Frente)'
  );
  const triangularWall2 = calculateWallBlockDetails(
    baseWidth,
    height,
    'triangular',
    'Parede Triangular 2 (Fundo)'
  );
  triangularWalls.push(triangularWall1, triangularWall2);

  // Consolidar totais
  const allWalls = [...lateralWalls, ...triangularWalls];
  const totalArea = allWalls.reduce((sum, wall) => sum + wall.area, 0);
  const totalBlocks = allWalls.reduce((sum, wall) => sum + wall.totalBlocks, 0);
  const totalWholeBlocks = allWalls.reduce((sum, wall) => sum + wall.wholeBlocks, 0);
  const totalCutBlocks = allWalls.reduce((sum, wall) => sum + wall.cutBlocks, 0);
  const averageWastePercentage = allWalls.length > 0
    ? allWalls.reduce((sum, wall) => sum + wall.wastePercentage, 0) / allWalls.length
    : 0;

  // Gerar recomendações
  const recommendations: string[] = [];
  
  if (totalCutBlocks === 0) {
    recommendations.push('✅ Perfeito! Nenhum bloco precisa ser cortado.');
  } else {
    const cutPercentage = (totalCutBlocks / totalBlocks) * 100;
    if (cutPercentage > 30) {
      recommendations.push(
        `⚠️ Alto número de blocos cortados (${cutPercentage.toFixed(0)}%). Considere ajustar as dimensões.`
      );
    }
  }

  // Verificar se há paredes triangulares com muitos cortes
  const triangularCutPercentage = triangularWalls.length > 0
    ? (triangularWalls.reduce((sum, w) => sum + w.cutBlocks, 0) / 
       triangularWalls.reduce((sum, w) => sum + w.totalBlocks, 0)) * 100
    : 0;

  if (triangularCutPercentage > 50) {
    recommendations.push(
      `⚠️ Paredes triangulares (frente/fundo) têm alto desperdício (${triangularCutPercentage.toFixed(0)}%). Isso é esperado devido à geometria A-frame.`
    );
  }

  return {
    lateralWalls,
    triangularWalls,
    totalArea: Math.round(totalArea * 100) / 100,
    totalBlocks,
    totalWholeBlocks,
    totalCutBlocks,
    averageWastePercentage: Math.round(averageWastePercentage * 100) / 100,
    recommendations,
  };
}

/**
 * Calcula economia potencial ao otimizar dimensões
 */
export function calculateOptimizationSavings(
  current: DetailedBlockBreakdown,
  optimized: DetailedBlockBreakdown,
  pricePerForm: number = 75.70
): {
  blocksSaved: number;
  formsSaved: number;
  financialSavings: number;
} {
  const blocksSaved = current.totalBlocks - optimized.totalBlocks;
  const formsSaved = blocksSaved * 2; // 2 formas por bloco
  const financialSavings = formsSaved * pricePerForm;

  return {
    blocksSaved,
    formsSaved,
    financialSavings: Math.round(financialSavings * 100) / 100,
  };
}
