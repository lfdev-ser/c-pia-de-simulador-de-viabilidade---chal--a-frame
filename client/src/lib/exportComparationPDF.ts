import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { generateTechnicalReport } from './technicalReport';
import { ICF_ICEFLEX_M2_PER_PACKAGE } from './wallCostConstants';

interface EPSOptimizationInfo {
  wastePercentage: number;
  wholeBlocks: number;
  cutBlocks: number;
  totalBlocks: number;
  optimalLength: number;
  optimalHeight: number;
  financialSavings: number;
  materialSavings: number;
}

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
    epsOptimization?: EPSOptimizationInfo;
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
    epsOptimization?: EPSOptimizationInfo;
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

interface CustomizationData {
  companyName: string;
  companyLogo: string | null;
  companyEmail: string;
  companyPhone: string;
  companyWebsite: string;
}

export function exportComparisonToPDF(data: ComparisonData, customization?: CustomizationData) {
  try {
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

  // Header with Company Info
  let headerXPosition = margin;
  
  // Add logo if provided
  if (customization?.companyLogo) {
    try {
      // Check if logo is a valid data URL or file path
      if (typeof customization.companyLogo === 'string' && (customization.companyLogo.startsWith('data:') || customization.companyLogo.startsWith('blob:'))) {
        try {
          doc.addImage(customization.companyLogo, 'PNG', headerXPosition, yPosition, 20, 20);
          headerXPosition += 25;
        } catch (imgError) {
          // Logo failed to load, skip it
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar logo:', error);
    }
  }
  
  // Company name and info
  doc.setFontSize(16);
  (doc as any).setFont(undefined, 'bold');
  const companyName = customization?.companyName && customization.companyName.trim() ? customization.companyName : 'Relatório Comparativo';
  doc.text(companyName, headerXPosition, yPosition + 5);
  
  doc.setFontSize(9);
  (doc as any).setFont(undefined, 'normal');
  let contactInfo = [];
  if (customization?.companyEmail) contactInfo.push(customization.companyEmail);
  if (customization?.companyPhone) contactInfo.push(customization.companyPhone);
  if (customization?.companyWebsite) contactInfo.push(customization.companyWebsite);
  
  if (contactInfo.length > 0) {
    try {
      doc.text(contactInfo.join(' • '), headerXPosition, yPosition + 12);
    } catch (error) {
      console.error('Erro ao adicionar informações de contato:', error);
    }
  }
  
  yPosition += 30;
  
  // Report title and date
  doc.setFontSize(12);
  (doc as any).setFont(undefined, 'bold');
  doc.text('Relatório Comparativo de Simulações', margin, yPosition);
  yPosition += 5;
  
  doc.setFontSize(9);
  (doc as any).setFont(undefined, 'normal');
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')} - Hora: ${new Date().toLocaleTimeString('pt-BR')}`, margin, yPosition);
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

  // EPS Optimization Analysis
  if (data.sim1.epsOptimization || data.sim2.epsOptimization) {
    checkPageBreak(80);
    addSectionTitle('🔧 Otimização de EPS (ICF)');

    // Simulation 1 EPS Optimization
    if (data.sim1.epsOptimization) {
      const eps1 = data.sim1.epsOptimization;
      doc.setFontSize(11);
      (doc as any).setFont(undefined, 'bold');
      doc.text(`${data.sim1.name} - Análise de Blocos EPS`, margin, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      (doc as any).setFont(undefined, 'normal');
      (doc as any).text(`• Desperdício Atual: ${eps1.wastePercentage.toFixed(1)}%`, margin + 5, yPosition);
      yPosition += 4;
      (doc as any).text(`• Blocos Inteiros: ${eps1.wholeBlocks}`, margin + 5, yPosition);
      yPosition += 4;
      (doc as any).text(`• Blocos Cortados: ${eps1.cutBlocks}`, margin + 5, yPosition);
      yPosition += 4;
      (doc as any).text(`• Total de Blocos: ${eps1.totalBlocks}`, margin + 5, yPosition);
      yPosition += 4;
      (doc as any).text(`• Dimensões Otimizadas: ${eps1.optimalLength.toFixed(2)}m × ${eps1.optimalHeight.toFixed(2)}m`, margin + 5, yPosition);
      yPosition += 4;
      (doc as any).text(`• Economia Financeira: R$ ${eps1.financialSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 5, yPosition);
      yPosition += 4;
      (doc as any).text(`• Economia de Material: ${eps1.materialSavings.toFixed(0)} blocos`, margin + 5, yPosition);
      yPosition += 8;
    }

    // Simulation 2 EPS Optimization
    if (data.sim2.epsOptimization) {
      const eps2 = data.sim2.epsOptimization;
      doc.setFontSize(11);
      (doc as any).setFont(undefined, 'bold');
      doc.text(`${data.sim2.name} - Análise de Blocos EPS`, margin, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      (doc as any).setFont(undefined, 'normal');
      (doc as any).text(`• Desperdício Atual: ${eps2.wastePercentage.toFixed(1)}%`, margin + 5, yPosition);
      yPosition += 4;
      (doc as any).text(`• Blocos Inteiros: ${eps2.wholeBlocks}`, margin + 5, yPosition);
      yPosition += 4;
      (doc as any).text(`• Blocos Cortados: ${eps2.cutBlocks}`, margin + 5, yPosition);
      yPosition += 4;
      (doc as any).text(`• Total de Blocos: ${eps2.totalBlocks}`, margin + 5, yPosition);
      yPosition += 4;
      (doc as any).text(`• Dimensões Otimizadas: ${eps2.optimalLength.toFixed(2)}m × ${eps2.optimalHeight.toFixed(2)}m`, margin + 5, yPosition);
      yPosition += 4;
      (doc as any).text(`• Economia Financeira: R$ ${eps2.financialSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 5, yPosition);
      yPosition += 4;
      (doc as any).text(`• Economia de Material: ${eps2.materialSavings.toFixed(0)} blocos`, margin + 5, yPosition);
      yPosition += 8;
    }
  }

  // Technical Report Section - Best Option
  const bestSim = data.analysis.bestOption.includes('Simulação 1') ? data.sim1 : data.sim2;
  const bestData = data.analysis.bestOption.includes('Simulação 1') ? data.sim1 : data.sim2;
  
  checkPageBreak(100);
  addSectionTitle('📋 Relatório Técnico Detalhado');
  
  // Generate technical report for best option
  const technicalReport = generateTechnicalReport(
    bestSim.name,
    bestSim.base,
    bestSim.height,
    bestSim.length,
    bestSim.wallArea * 1.5, // aproximado
    bestSim.wallArea,
    bestSim.volume,
    bestSim.concreteVolume,
    bestSim.steelWeight,
    Math.ceil(bestSim.wallArea / ICF_ICEFLEX_M2_PER_PACKAGE),
    Math.ceil(bestSim.wallArea / 50),
    bestSim.totalCost,
    bestSim.costPerM2
  );
  
  // Especificações de Materiais
  doc.setFontSize(11);
  (doc as any).setFont(undefined, 'bold');
  doc.text('Especificações de Materiais:', margin, yPosition);
  yPosition += 6;
  
  const materialTableData = [
    ['Material', 'Quantidade', 'Unidade', 'Preço Unit.', 'Total'],
    ...technicalReport.materials.map(m => [
      m.name,
      m.quantity.toFixed(2),
      m.unit,
      `R$ ${m.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `R$ ${m.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ]),
  ];
  
  (doc as any).autoTable({
    head: [materialTableData[0]],
    body: materialTableData.slice(1),
    startY: yPosition,
    margin: margin,
    theme: 'grid',
    headStyles: { fillColor: [100, 150, 200], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: 0, fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });
  
  yPosition = ((doc as any).lastAutoTable?.finalY || yPosition) + 8;
  
  // Cronograma de Construção
  checkPageBreak(80);
  addSectionTitle('⏱️ Cronograma de Construção');
  
  doc.setFontSize(10);
  (doc as any).setFont(undefined, 'normal');
  doc.text(`Duração Total Estimada: ${technicalReport.totalDuration} dias`, margin, yPosition);
  yPosition += 6;
  
  const timelineTableData = [
    ['Fase', 'Descrição', 'Duração', 'Dias'],
    ...technicalReport.constructionTimeline.map(phase => [
      `${phase.phase}. ${phase.name}`,
      phase.description,
      `${phase.duration} dias`,
      `${phase.startDay}-${phase.endDay}`,
    ]),
  ];
  
  (doc as any).autoTable({
    head: [timelineTableData[0]],
    body: timelineTableData.slice(1),
    startY: yPosition,
    margin: margin,
    theme: 'grid',
    headStyles: { fillColor: [76, 175, 80], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: 0, fontSize: 8 },
    alternateRowStyles: { fillColor: [240, 248, 240] },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
    },
  });
  
  yPosition = ((doc as any).lastAutoTable?.finalY || yPosition) + 8;
  
  // Padrões de Qualidade
  checkPageBreak(60);
  addSectionTitle('✅ Padrões de Qualidade');
  
  doc.setFontSize(9);
  (doc as any).setFont(undefined, 'normal');
  technicalReport.qualityStandards.forEach((standard, index) => {
    if (yPosition > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(`${index + 1}. ${standard}`, margin + 5, yPosition);
    yPosition += 4;
  });
  
  // Requisitos de Segurança
  checkPageBreak(60);
  addSectionTitle('🛡️ Requisitos de Segurança');
  
  doc.setFontSize(9);
  (doc as any).setFont(undefined, 'normal');
  technicalReport.safetyRequirements.forEach((requirement, index) => {
    if (yPosition > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(`${index + 1}. ${requirement}`, margin + 5, yPosition);
    yPosition += 4;
  });
  
  // Considerações Ambientais
  checkPageBreak(60);
  addSectionTitle('🌱 Considerações Ambientais');
  
  doc.setFontSize(9);
  (doc as any).setFont(undefined, 'normal');
  technicalReport.environmentalConsiderations.forEach((consideration, index) => {
    if (yPosition > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(`${index + 1}. ${consideration}`, margin + 5, yPosition);
    yPosition += 4;
  });

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
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error(`Erro ao exportar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
