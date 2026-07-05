/**
 * Intelligent Analysis Module
 * Generates cost-benefit analysis comparing two simulations
 */

interface SimulationData {
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

interface CostData {
  concreteCost: number;
  steelCost: number;
  epsCost: number;
  accessoriesCost: number;
  iceflexCost: number;
  icfibraCost: number;
  laborCost: number;
  customMaterialsCost: number;
  foundationCost: number;
  iceflexBaldesNeeded: number;
  icfibraRolosNeeded: number;
  icfTotalCost: number;
  totalCost: number;
  costPerM2: number;
  costPerM2WithLabor: number;
  laborCostPerM2: number;
}

interface AnalysisResult {
  winner: 'sim1' | 'sim2' | 'tie';
  winnerName: string;
  summary: string;
  metrics: {
    costPerM2Comparison: string;
    costPerM3Comparison: string;
    costPerUsefulM2Comparison: string;
    spaceEfficiencyComparison: string;
    overallRecommendation: string;
  };
  scores: {
    sim1Score: number;
    sim2Score: number;
    sim1Label: string;
    sim2Label: string;
  };
}

export function generateIntelligentAnalysis(
  sim1Name: string,
  sim1Data: SimulationData,
  sim1Costs: CostData,
  sim2Name: string,
  sim2Data: SimulationData,
  sim2Costs: CostData
): AnalysisResult {
  // Calculate key metrics for comparison
  const sim1CostPerM2 = sim1Costs.costPerM2;
  const sim2CostPerM2 = sim2Costs.costPerM2;

  const sim1CostPerM3 = sim1Data.volume > 0 ? sim1Costs.icfTotalCost / sim1Data.volume : 0;
  const sim2CostPerM3 = sim2Data.volume > 0 ? sim2Costs.icfTotalCost / sim2Data.volume : 0;

  const sim1CostPerUsefulM2 = sim1Data.totalArea > 0 ? sim1Costs.icfTotalCost / sim1Data.totalArea : 0;
  const sim2CostPerUsefulM2 = sim2Data.totalArea > 0 ? sim2Costs.icfTotalCost / sim2Data.totalArea : 0;

  const sim1Utilization = sim1Data.utilization;
  const sim2Utilization = sim2Data.utilization;

  // Score each simulation (0-100)
  // Lower cost per m² is better (40 points)
  const costPerM2Score1 = Math.max(0, 40 - (sim1CostPerM2 / 10));
  const costPerM2Score2 = Math.max(0, 40 - (sim2CostPerM2 / 10));

  // Cost per useful m² is better (30 points)
  const costPerUsefulM2Score1 = Math.max(0, 30 - (sim1CostPerUsefulM2 / 15));
  const costPerUsefulM2Score2 = Math.max(0, 30 - (sim2CostPerUsefulM2 / 15));

  // Space utilization is better (20 points)
  const utilizationScore1 = (sim1Utilization / 100) * 20;
  const utilizationScore2 = (sim2Utilization / 100) * 20;

  // Volume efficiency (10 points) - prefer moderate volumes
  const volumeScore1 = Math.max(0, 10 - Math.abs(sim1Data.volume - 80) / 20);
  const volumeScore2 = Math.max(0, 10 - Math.abs(sim2Data.volume - 80) / 20);

  const sim1Score = Math.round(costPerM2Score1 + costPerUsefulM2Score1 + utilizationScore1 + volumeScore1);
  const sim2Score = Math.round(costPerM2Score2 + costPerUsefulM2Score2 + utilizationScore2 + volumeScore2);

  // Determine winner
  let winner: 'sim1' | 'sim2' | 'tie' = 'tie';
  if (sim1Score > sim2Score + 5) winner = 'sim1';
  else if (sim2Score > sim1Score + 5) winner = 'sim2';

  // Generate detailed metrics text
  const costPerM2Diff = sim2CostPerM2 - sim1CostPerM2;
  const costPerM2DiffPercent = (costPerM2Diff / sim1CostPerM2) * 100;
  const costPerM2Comparison =
    costPerM2Diff === 0
      ? `Ambas as simulações têm o mesmo custo por m² de parede: R$ ${sim1CostPerM2.toFixed(2)}.`
      : costPerM2Diff < 0
        ? `${sim2Name} é ${Math.abs(costPerM2DiffPercent).toFixed(1)}% mais barata por m² de parede (R$ ${sim2CostPerM2.toFixed(2)} vs R$ ${sim1CostPerM2.toFixed(2)}).`
        : `${sim1Name} é ${costPerM2DiffPercent.toFixed(1)}% mais barata por m² de parede (R$ ${sim1CostPerM2.toFixed(2)} vs R$ ${sim2CostPerM2.toFixed(2)}).`;

  const costPerM3Diff = sim2CostPerM3 - sim1CostPerM3;
  const costPerM3DiffPercent = (costPerM3Diff / sim1CostPerM3) * 100;
  const costPerM3Comparison =
    costPerM3Diff < 0
      ? `${sim2Name} oferece melhor custo por volume (R$ ${sim2CostPerM3.toFixed(2)}/m³ vs R$ ${sim1CostPerM3.toFixed(2)}/m³).`
      : `${sim1Name} oferece melhor custo por volume (R$ ${sim1CostPerM3.toFixed(2)}/m³ vs R$ ${sim2CostPerM3.toFixed(2)}/m³).`;

  const costPerUsefulM2Diff = sim2CostPerUsefulM2 - sim1CostPerUsefulM2;
  const costPerUsefulM2DiffPercent = (costPerUsefulM2Diff / sim1CostPerUsefulM2) * 100;
  const costPerUsefulM2Comparison =
    costPerUsefulM2Diff < 0
      ? `${sim2Name} é mais econômica considerando a área útil (R$ ${sim2CostPerUsefulM2.toFixed(2)}/m² útil vs R$ ${sim1CostPerUsefulM2.toFixed(2)}/m² útil).`
      : `${sim1Name} é mais econômica considerando a área útil (R$ ${sim1CostPerUsefulM2.toFixed(2)}/m² útil vs R$ ${sim2CostPerUsefulM2.toFixed(2)}/m² útil).`;

  const utilizationDiff = sim2Utilization - sim1Utilization;
  const spaceEfficiencyComparison =
    utilizationDiff > 5
      ? `${sim2Name} oferece melhor aproveitamento de espaço (${sim2Utilization.toFixed(1)}% vs ${sim1Utilization.toFixed(1)}%).`
      : utilizationDiff < -5
        ? `${sim1Name} oferece melhor aproveitamento de espaço (${sim1Utilization.toFixed(1)}% vs ${sim2Utilization.toFixed(1)}%).`
        : `Ambas as simulações têm aproveitamento de espaço similar (${sim1Utilization.toFixed(1)}% vs ${sim2Utilization.toFixed(1)}%).`;

  // Generate overall recommendation
  let overallRecommendation = '';
  if (winner === 'sim1') {
    overallRecommendation = `${sim1Name} apresenta o melhor custo-benefício geral. Recomenda-se esta opção para projetos com orçamento limitado ou quando a eficiência de custos é prioritária.`;
  } else if (winner === 'sim2') {
    overallRecommendation = `${sim2Name} apresenta o melhor custo-benefício geral. Recomenda-se esta opção para projetos que buscam equilibrio entre espaço, conforto e eficiência econômica.`;
  } else {
    overallRecommendation = `Ambas as simulações oferecem bom custo-benefício. A escolha deve considerar outros fatores como preferências de dimensões, localização do terreno e necessidades específicas do projeto.`;
  }

  // Generate summary
  const summary = `
${winner === 'sim1' ? `🏆 ${sim1Name} é a melhor opção` : winner === 'sim2' ? `🏆 ${sim2Name} é a melhor opção` : '⚖️ Ambas são viáveis'}

${costPerM2Comparison}

${costPerM3Comparison}

${costPerUsefulM2Comparison}

${spaceEfficiencyComparison}

${overallRecommendation}

**Pontuação de Custo-Benefício:**
- ${sim1Name}: ${sim1Score}/100
- ${sim2Name}: ${sim2Score}/100
  `.trim();

  return {
    winner,
    winnerName: winner === 'sim1' ? sim1Name : winner === 'sim2' ? sim2Name : 'Ambas',
    summary,
    metrics: {
      costPerM2Comparison,
      costPerM3Comparison,
      costPerUsefulM2Comparison,
      spaceEfficiencyComparison,
      overallRecommendation,
    },
    scores: {
      sim1Score,
      sim2Score,
      sim1Label: sim1Name,
      sim2Label: sim2Name,
    },
  };
}
