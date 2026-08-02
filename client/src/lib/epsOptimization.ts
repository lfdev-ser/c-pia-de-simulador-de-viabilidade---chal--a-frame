/**
 * EPS Optimization Utility
 * Calcula múltiplos ideais de EPS baseado nas dimensões da simulação
 * para evitar recortes desnecessários
 */

interface EPSBlockDimensions {
  length: number; // comprimento em metros
  height: number; // altura em metros
  thickness: number; // espessura em metros
}

interface EPSBlockDetails {
  wholeBlocks: number; // blocos inteiros necessários
  cutBlocks: number; // blocos que precisam ser cortados
  totalBlocks: number; // total de blocos
  wastePercentagePerBlock: number; // desperdício por bloco cortado
}

interface EPSOptimizationResult {
  totalWallArea: number; // área total de parede em m²
  currentEpsBlocks: number; // quantidade atual de blocos EPS
  optimalLength: number; // comprimento ideal para evitar recortes
  optimalHeight: number; // altura ideal para evitar recortes
  wastePercentage: number; // percentual de desperdício
  hasWaste: boolean; // se há desperdício
  recommendation: string; // recomendação de otimização
  blocksPerMeter: number; // blocos por metro linear
  blockDetails: EPSBlockDetails; // detalhes de blocos inteiros vs cortados
  optimalBlockDetails: EPSBlockDetails; // detalhes otimizados
  financialSavings: number; // economia financeira em reais
  materialSavings: number; // economia de material em blocos
}

// Dimensões padrão dos blocos EPS (em metros)
const STANDARD_EPS_BLOCK: EPSBlockDimensions = {
  length: 1.25, // comprimento padrão
  height: 0.25, // altura padrão (25cm)
  thickness: 0.30, // espessura padrão (30cm)
};

/**
 * Calcula detalhes de blocos EPS (inteiros vs cortados)
 * @param length - comprimento em metros
 * @param height - altura em metros
 * @returns Detalhes dos blocos
 */
function calculateBlockDetails(length: number, height: number): EPSBlockDetails {
  // Calcular quantos blocos cabem perfeitamente
  const blocksLengthwise = Math.floor(length / STANDARD_EPS_BLOCK.length);
  const blocksHeightwise = Math.floor(height / STANDARD_EPS_BLOCK.height);
  
  // Blocos inteiros
  const wholeBlocks = blocksLengthwise * blocksHeightwise;
  
  // Verificar se há resto (blocos que precisam ser cortados)
  const remainderLength = length % STANDARD_EPS_BLOCK.length;
  const remainderHeight = height % STANDARD_EPS_BLOCK.height;
  
  let cutBlocks = 0;
  let wastePercentagePerBlock = 0;
  
  if (remainderLength > 0.01) {
    cutBlocks += blocksHeightwise; // uma coluna de blocos cortados
  }
  if (remainderHeight > 0.01) {
    cutBlocks += blocksLengthwise; // uma linha de blocos cortados
  }
  if (remainderLength > 0.01 && remainderHeight > 0.01) {
    cutBlocks += 1; // um bloco no canto cortado nos dois lados
  }
  
  // Calcular desperdício por bloco cortado
  if (cutBlocks > 0) {
    const wasteArea = (remainderLength * STANDARD_EPS_BLOCK.height) + 
                      (remainderHeight * STANDARD_EPS_BLOCK.length) - 
                      (remainderLength * remainderHeight);
    const blockArea = STANDARD_EPS_BLOCK.length * STANDARD_EPS_BLOCK.height;
    wastePercentagePerBlock = (wasteArea / blockArea) * 100;
  }
  
  return {
    wholeBlocks,
    cutBlocks,
    totalBlocks: wholeBlocks + cutBlocks,
    wastePercentagePerBlock: Math.round(wastePercentagePerBlock * 100) / 100,
  };
}

/**
 * Calcula a otimização de EPS para uma simulação
 * @param baseWidth - largura da base em metros
 * @param height - altura da cumeeira em metros
 * @param length - comprimento em metros
 * @param epsBlockPrice - preço por forma de EPS
 * @returns Resultado da otimização de EPS
 */
export function calculateEPSOptimization(
  baseWidth: number,
  height: number,
  length: number,
  epsBlockPrice: number = 75.70 // preço padrão por forma de EPS
): EPSOptimizationResult {
  // Calcular área total de parede (4 paredes)
  // Duas paredes triangulares (telhado) + duas paredes retangulares
  const triangularArea = (baseWidth * height) / 2; // área de um triângulo
  const rectangularArea = length * 2.1; // altura mínima de pé-direito (2.1m)
  
  const totalWallArea = (triangularArea * 2) + (rectangularArea * 2);
  
  // Calcular quantidade atual de blocos EPS
  // Cada bloco EPS cobre 2 formas por metro quadrado
  const currentEpsBlocks = Math.ceil((totalWallArea / 2) * 2);
  
  // Calcular múltiplos ideais para evitar recortes
  const optimalLengthMultiples = Math.ceil(length / STANDARD_EPS_BLOCK.length);
  const optimalHeightMultiples = Math.ceil(height / STANDARD_EPS_BLOCK.height);
  
  const optimalLength = optimalLengthMultiples * STANDARD_EPS_BLOCK.length;
  const optimalHeight = optimalHeightMultiples * STANDARD_EPS_BLOCK.height;
  
  // Calcular desperdício
  const currentArea = length * height;
  const optimalArea = optimalLength * optimalHeight;
  const wasteArea = optimalArea - currentArea;
  const wastePercentage = (wasteArea / currentArea) * 100;
  
  const hasWaste = wastePercentage > 0.5; // considerar desperdício se > 0.5%
  
  // Calcular detalhes de blocos
  const blockDetails = calculateBlockDetails(length, height);
  const optimalBlockDetails = calculateBlockDetails(optimalLength, optimalHeight);
  
  // Calcular economia
  const blocksSaved = blockDetails.totalBlocks - optimalBlockDetails.totalBlocks;
  const financialSavings = blocksSaved * epsBlockPrice * 2; // 2 formas por bloco
  const materialSavings = blocksSaved;
  
  // Gerar recomendação
  let recommendation = '';
  if (!hasWaste) {
    recommendation = `✅ Dimensões perfeitas! Sem desperdício de EPS.`;
  } else if (wastePercentage < 5) {
    recommendation = `✅ Desperdício mínimo (${wastePercentage.toFixed(1)}%). Dimensões otimizadas para EPS.`;
  } else if (wastePercentage < 15) {
    recommendation = `⚠️ Desperdício moderado (${wastePercentage.toFixed(1)}%). Considere ajustar para ${optimalLength.toFixed(2)}m × ${optimalHeight.toFixed(2)}m para otimizar e economizar R$ ${financialSavings.toFixed(2)}.`;
  } else {
    recommendation = `🔴 Desperdício alto (${wastePercentage.toFixed(1)}%). Recomenda-se ajustar para ${optimalLength.toFixed(2)}m × ${optimalHeight.toFixed(2)}m para evitar recortes e economizar R$ ${financialSavings.toFixed(2)}.`;
  }
  
  return {
    totalWallArea: Math.round(totalWallArea * 100) / 100,
    currentEpsBlocks,
    optimalLength: Math.round(optimalLength * 100) / 100,
    optimalHeight: Math.round(optimalHeight * 100) / 100,
    wastePercentage: Math.round(wastePercentage * 100) / 100,
    hasWaste,
    recommendation,
    blocksPerMeter: 2, // 2 formas por metro quadrado
    blockDetails,
    optimalBlockDetails,
    financialSavings: Math.round(financialSavings * 100) / 100,
    materialSavings,
  };
}

/**
 * Calcula o número de blocos EPS necessários
 * @param wallArea - área total de parede em m²
 * @returns Número de blocos EPS necessários
 */
export function calculateEPSBlocksNeeded(wallArea: number): number {
  // Cada bloco EPS cobre aproximadamente 1m² (2 formas por metro)
  return Math.ceil(wallArea / 1);
}

/**
 * Calcula o desperdício de EPS para dimensões específicas
 * @param actualLength - comprimento real em metros
 * @param actualHeight - altura real em metros
 * @returns Percentual de desperdício
 */
export function calculateEPSWaste(actualLength: number, actualHeight: number): number {
  const optimalLengthMultiples = Math.ceil(actualLength / STANDARD_EPS_BLOCK.length);
  const optimalHeightMultiples = Math.ceil(actualHeight / STANDARD_EPS_BLOCK.height);
  
  const optimalLength = optimalLengthMultiples * STANDARD_EPS_BLOCK.length;
  const optimalHeight = optimalHeightMultiples * STANDARD_EPS_BLOCK.height;
  
  const actualArea = actualLength * actualHeight;
  const optimalArea = optimalLength * optimalHeight;
  const wasteArea = optimalArea - actualArea;
  
  return (wasteArea / actualArea) * 100;
}

/**
 * Gera sugestão de dimensões otimizadas
 * @param currentLength - comprimento atual em metros
 * @param currentHeight - altura atual em metros
 * @returns Dimensões otimizadas
 */
export function suggestOptimizedDimensions(
  currentLength: number,
  currentHeight: number
): { length: number; height: number; savings: number } {
  const optimalLengthMultiples = Math.ceil(currentLength / STANDARD_EPS_BLOCK.length);
  const optimalHeightMultiples = Math.ceil(currentHeight / STANDARD_EPS_BLOCK.height);
  
  const optimalLength = optimalLengthMultiples * STANDARD_EPS_BLOCK.length;
  const optimalHeight = optimalHeightMultiples * STANDARD_EPS_BLOCK.height;
  
  const currentArea = currentLength * currentHeight;
  const optimalArea = optimalLength * optimalHeight;
  const savings = ((optimalArea - currentArea) / currentArea) * 100;
  
  return {
    length: optimalLength,
    height: optimalHeight,
    savings: Math.round(savings * 100) / 100,
  };
}

export type { EPSBlockDetails, EPSOptimizationResult };
