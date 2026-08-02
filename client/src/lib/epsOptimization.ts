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

interface EPSOptimizationResult {
  totalWallArea: number; // área total de parede em m²
  currentEpsBlocks: number; // quantidade atual de blocos EPS
  optimalLength: number; // comprimento ideal para evitar recortes
  optimalHeight: number; // altura ideal para evitar recortes
  wastePercentage: number; // percentual de desperdício
  hasWaste: boolean; // se há desperdício
  recommendation: string; // recomendação de otimização
  blocksPerMeter: number; // blocos por metro linear
}

// Dimensões padrão dos blocos EPS (em metros)
const STANDARD_EPS_BLOCK: EPSBlockDimensions = {
  length: 1.25, // comprimento padrão
  height: 0.25, // altura padrão (25cm)
  thickness: 0.30, // espessura padrão (30cm)
};

/**
 * Calcula a otimização de EPS para uma simulação
 * @param baseWidth - largura da base em metros
 * @param height - altura da cumeeira em metros
 * @param length - comprimento em metros
 * @returns Resultado da otimização de EPS
 */
export function calculateEPSOptimization(
  baseWidth: number,
  height: number,
  length: number
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
  
  // Gerar recomendação
  let recommendation = '';
  if (hasWaste && wastePercentage < 5) {
    recommendation = `✅ Desperdício mínimo (${wastePercentage.toFixed(1)}%). Dimensões otimizadas para EPS.`;
  } else if (hasWaste && wastePercentage < 15) {
    recommendation = `⚠️ Desperdício moderado (${wastePercentage.toFixed(1)}%). Considere ajustar para ${optimalLength.toFixed(2)}m × ${optimalHeight.toFixed(2)}m para otimizar.`;
  } else if (hasWaste) {
    recommendation = `🔴 Desperdício alto (${wastePercentage.toFixed(1)}%). Recomenda-se ajustar para ${optimalLength.toFixed(2)}m × ${optimalHeight.toFixed(2)}m para evitar recortes.`;
  } else {
    recommendation = `✅ Dimensões perfeitas! Sem desperdício de EPS.`;
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
