import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ComparisonData {
  sim1: {
    name: string;
    base: number;
    height: number;
    length: number;
    angle: number;
    utilization: number;
    volume: number;
    concreteVolume: number;
    steelWeight: number;
    wallArea: number;
    totalCost: number;
    costPerM2: number;
    iceflex: number;
    icfibra: number;
  };
  sim2: {
    name: string;
    base: number;
    height: number;
    length: number;
    angle: number;
    utilization: number;
    volume: number;
    concreteVolume: number;
    steelWeight: number;
    wallArea: number;
    totalCost: number;
    costPerM2: number;
    iceflex: number;
    icfibra: number;
  };
  analysis: {
    recommendation: string;
    bestOption: string;
    costPerUsefulM2Sim1: number;
    costPerUsefulM2Sim2: number;
    costPerVolumeM3Sim1: number;
    costPerVolumeM3Sim2: number;
    spacialEfficiencySim1: number;
    spacialEfficiencySim2: number;
  };
}

export function exportComparisonToPDF(data: ComparisonData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Helper function to add a section title
  const addSectionTitle = (title: string) => {
    doc.setFontSize(14);
    (doc as any).setFont(undefined, 'bold');
    doc.text(title, margin, yPosition);
    yPosition += 8;
    doc.setDrawColor(100, 150, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
  };

  // Helper function to check if we need a new page
  const checkPageBreak = (spaceNeeded: number) => {
    if (yPosition + spaceNeeded > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Header
  doc.setFontSize(18);
  (doc as any).setFont(undefined, 'bold');
  doc.text('Relatório Comparativo de Simulações', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  (doc as any).setFont(undefined, 'normal');
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Hora: ${new Date().toLocaleTimeString('pt-BR')}`, margin, yPosition);
  yPosition += 10;

  // Simulation Names
  addSectionTitle('Simulações Comparadas');
  doc.setFontSize(11);
  (doc as any).setFont(undefined, 'normal');
  doc.text(`Simulação 1: ${data.sim1.name}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Simulação 2: ${data.sim2.name}`, margin, yPosition);
  yPosition += 10;

  // Dimensions Comparison
  checkPageBreak(40);
  addSectionTitle('📐 Comparação de Dimensões');
  
  const dimensionsData = [
    ['Parâmetro', 'Simulação 1', 'Simulação 2', 'Diferença'],
    [
      'Largura da Base',
      `${data.sim1.base.toFixed(2)}m`,
      `${data.sim2.base.toFixed(2)}m`,
      `${((data.sim2.base - data.sim1.base) / data.sim1.base * 100).toFixed(1)}%`
    ],
    [
      'Altura da Cumeeira',
      `${data.sim1.height.toFixed(2)}m`,
      `${data.sim2.height.toFixed(2)}m`,
      `${((data.sim2.height - data.sim1.height) / data.sim1.height * 100).toFixed(1)}%`
    ],
    [
      'Comprimento',
      `${data.sim1.length.toFixed(2)}m`,
      `${data.sim2.length.toFixed(2)}m`,
      `${((data.sim2.length - data.sim1.length) / data.sim1.length * 100).toFixed(1)}%`
    ],
    [
      'Ângulo de Inclinação',
      `${data.sim1.angle.toFixed(1)}°`,
      `${data.sim2.angle.toFixed(1)}°`,
      `${(data.sim2.angle - data.sim1.angle).toFixed(1)}°`
    ],
  ];

  (doc as any).autoTable({
    head: [dimensionsData[0]],
    body: dimensionsData.slice(1),
    startY: yPosition,
    margin: margin,
    theme: 'grid',
    headStyles: { fillColor: [100, 150, 200], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: 0 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  yPosition = ((doc as any).lastAutoTable?.finalY || yPosition) + 8;

  // Results Comparison
  checkPageBreak(40);
  addSectionTitle('📊 Comparação de Resultados');

  const resultsData = [
    ['Parâmetro', 'Simulação 1', 'Simulação 2', 'Diferença'],
    [
      'Aproveitamento do Piso',
      `${data.sim1.utilization.toFixed(1)}%`,
      `${data.sim2.utilization.toFixed(1)}%`,
      `${((data.sim2.utilization - data.sim1.utilization) / data.sim1.utilization * 100).toFixed(1)}%`
    ],
    [
      'Volume Aproximado',
      `${data.sim1.volume.toFixed(2)}m³`,
      `${data.sim2.volume.toFixed(2)}m³`,
      `${((data.sim2.volume - data.sim1.volume) / data.sim1.volume * 100).toFixed(1)}%`
    ],
    [
      'Área de Paredes',
      `${data.sim1.wallArea.toFixed(2)}m²`,
      `${data.sim2.wallArea.toFixed(2)}m²`,
      `${((data.sim2.wallArea - data.sim1.wallArea) / data.sim1.wallArea * 100).toFixed(1)}%`
    ],
  ];

  (doc as any).autoTable({
    head: [resultsData[0]],
    body: resultsData.slice(1),
    startY: yPosition,
    margin: margin,
    theme: 'grid',
    headStyles: { fillColor: [100, 150, 200], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: 0 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  yPosition = ((doc as any).lastAutoTable?.finalY || yPosition) + 8;

  // Materials Comparison
  checkPageBreak(40);
  addSectionTitle('🏗️ Comparação de Materiais ICF');

  const materialsData = [
    ['Material', 'Simulação 1', 'Simulação 2', 'Diferença'],
    [
      'Concreto',
      `${data.sim1.concreteVolume.toFixed(2)}m³`,
      `${data.sim2.concreteVolume.toFixed(2)}m³`,
      `${((data.sim2.concreteVolume - data.sim1.concreteVolume) / data.sim1.concreteVolume * 100).toFixed(1)}%`
    ],
    [
      'Aço de Reforço',
      `${data.sim1.steelWeight.toFixed(0)}kg`,
      `${data.sim2.steelWeight.toFixed(0)}kg`,
      `${((data.sim2.steelWeight - data.sim1.steelWeight) / data.sim1.steelWeight * 100).toFixed(1)}%`
    ],
    [
      'Iceflex (baldes)',
      `${data.sim1.iceflex.toFixed(0)}`,
      `${data.sim2.iceflex.toFixed(0)}`,
      `${((data.sim2.iceflex - data.sim1.iceflex) / data.sim1.iceflex * 100).toFixed(1)}%`
    ],
    [
      'ICFibra (rolos)',
      `${data.sim1.icfibra.toFixed(0)}`,
      `${data.sim2.icfibra.toFixed(0)}`,
      `${((data.sim2.icfibra - data.sim1.icfibra) / data.sim1.icfibra * 100).toFixed(1)}%`
    ],
  ];

  (doc as any).autoTable({
    head: [materialsData[0]],
    body: materialsData.slice(1),
    startY: yPosition,
    margin: margin,
    theme: 'grid',
    headStyles: { fillColor: [100, 150, 200], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: 0 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  yPosition = ((doc as any).lastAutoTable?.finalY || yPosition) + 8;

  // Budget Comparison
  checkPageBreak(40);
  addSectionTitle('💰 Comparação de Orçamento');

  const budgetData = [
    ['Item', 'Simulação 1', 'Simulação 2', 'Diferença'],
    [
      'Custo Total',
      `R$ ${data.sim1.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `R$ ${data.sim2.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `R$ ${(data.sim2.totalCost - data.sim1.totalCost).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ],
    [
      'Custo por m² de Parede',
      `R$ ${data.sim1.costPerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `R$ ${data.sim2.costPerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${((data.sim2.costPerM2 - data.sim1.costPerM2) / data.sim1.costPerM2 * 100).toFixed(1)}%`
    ],
    [
      'Custo por m² Útil',
      `R$ ${data.analysis.costPerUsefulM2Sim1.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `R$ ${data.analysis.costPerUsefulM2Sim2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${((data.analysis.costPerUsefulM2Sim2 - data.analysis.costPerUsefulM2Sim1) / data.analysis.costPerUsefulM2Sim1 * 100).toFixed(1)}%`
    ],
    [
      'Custo por m³ de Volume',
      `R$ ${data.analysis.costPerVolumeM3Sim1.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `R$ ${data.analysis.costPerVolumeM3Sim2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${((data.analysis.costPerVolumeM3Sim2 - data.analysis.costPerVolumeM3Sim1) / data.analysis.costPerVolumeM3Sim1 * 100).toFixed(1)}%`
    ],
  ];

  (doc as any).autoTable({
    head: [budgetData[0]],
    body: budgetData.slice(1),
    startY: yPosition,
    margin: margin,
    theme: 'grid',
    headStyles: { fillColor: [100, 150, 200], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: 0 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  yPosition = ((doc as any).lastAutoTable?.finalY || yPosition) + 8;

  // Intelligent Analysis
  checkPageBreak(60);
  addSectionTitle('💡 Análise Inteligente de Custo-Benefício');

  doc.setFontSize(11);
  (doc as any).setFont(undefined, 'bold');
  doc.text(`Melhor Opção: ${data.analysis.bestOption}`, margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  (doc as any).setFont(undefined, 'normal');
  
  // Wrap text for recommendation
  const recommendationText = (doc as any).splitTextToSize(data.analysis.recommendation, pageWidth - 2 * margin) as string[];
  (doc as any).text(recommendationText, margin, yPosition);
  yPosition += recommendationText.length * 5 + 5;

  // Efficiency metrics
  doc.setFontSize(10);
  (doc as any).setFont(undefined, 'bold');
  doc.text('Métricas de Eficiência:', margin, yPosition);
  yPosition += 5;

  (doc as any).setFont(undefined, 'normal');
  (doc as any).text(`• Eficiência Espacial Sim 1: ${data.analysis.spacialEfficiencySim1.toFixed(1)}%`, margin + 5, yPosition);
  yPosition += 4;
  (doc as any).text(`• Eficiência Espacial Sim 2: ${data.analysis.spacialEfficiencySim2.toFixed(1)}%`, margin + 5, yPosition);
  yPosition += 4;
  (doc as any).text(`• Custo por m² Útil Sim 1: R$ ${data.analysis.costPerUsefulM2Sim1.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 5, yPosition);
  yPosition += 4;
  (doc as any).text(`• Custo por m² Útil Sim 2: R$ ${data.analysis.costPerUsefulM2Sim2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 5, yPosition);
  yPosition += 4;
  (doc as any).text(`• Custo por m³ Sim 1: R$ ${data.analysis.costPerVolumeM3Sim1.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 5, yPosition);
  yPosition += 4;
  (doc as any).text(`• Custo por m³ Sim 2: R$ ${data.analysis.costPerVolumeM3Sim2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 5, yPosition);

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    (doc as any).setFont(undefined, 'normal');
    doc.setTextColor(128);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' } as any
    );
    doc.text(
      'Simulador de Chalé A-frame | Relatório Gerado Automaticamente',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' } as any
    );
  }

  // Save PDF
  const fileName = `Comparacao_${data.sim1.name.replace(/\s+/g, '_')}_vs_${data.sim2.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
