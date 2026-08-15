import React, { useState } from 'react';
import { Download, Loader } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface PDFExportButtonProps {
  simulationName: string;
  base: number;
  height: number;
  length: number;
  angle: number;
  faceLength: number;
  usefulWidth: number;
  utilization: number;
  floorArea: number;
  volume: number;
  wallArea: number;
  concreteVolume: number;
  steelWeight: number;
  epsVolume: number;
  epsWeight: number;
  iceflexQuantity: number;
  icfibraQuantity: number;
  concreteCost: number;
  steelCost: number;
  epsCost: number;
  accessoriesCost: number;
  iceflexCost: number;
  icfibraCost: number;
  laborCost: number;
  totalCost: number;
  obraCinzaCost?: number;
  obraCinzaCostPerM2?: number;
  finishingProductsCost?: number;
  laborServices: Array<{
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }>;
}

export default function PDFExportButton({
  simulationName,
  base,
  height,
  length,
  angle,
  faceLength,
  usefulWidth,
  utilization,
  floorArea,
  volume,
  wallArea,
  concreteVolume,
  steelWeight,
  epsVolume,
  epsWeight,
  iceflexQuantity,
  icfibraQuantity,
  concreteCost,
  steelCost,
  epsCost,
  accessoriesCost,
  iceflexCost,
  icfibraCost,
  laborCost,
  totalCost,
  obraCinzaCost,
  obraCinzaCostPerM2,
  finishingProductsCost,
  laborServices,
}: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;

      // Cabeçalho
      pdf.setFillColor(21, 128, 61);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont(undefined as any, 'bold');
      pdf.text(('Simulador de Chalé A-frame') as any, margin, 15);
      
      pdf.setFontSize(10);
      pdf.setFont(undefined as any, 'normal');
      const headerDate = `Relatório de Viabilidade - ${new Date().toLocaleDateString('pt-BR')}`;
      pdf.text((headerDate) as any, margin, 23);

      yPosition = 40;

      // Título da Simulação
      pdf.setFontSize(16);
      pdf.setFont(undefined as any, 'bold');
      pdf.setTextColor(45, 45, 45);
      pdf.text(((simulationName || 'Simulação sem Nome')) as any, margin, yPosition);
      yPosition += 8;

      // Linha
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Seção 1: Dimensões
      pdf.setFontSize(12);
      pdf.setFont(undefined as any, 'bold');
      pdf.setTextColor(21, 128, 61);
      pdf.text(('1. DIMENSÕES DO PROJETO') as any, margin, yPosition);
      yPosition += 5;

      const dimensionsData = [
        ['Largura da Base', `${base.toFixed(2)} m`],
        ['Altura da Cumeeira', `${height.toFixed(2)} m`],
        ['Comprimento', `${length.toFixed(2)} m`],
        ['Ângulo de Inclinação', `${angle.toFixed(1)}°`],
        ['Comprimento da Face', `${faceLength.toFixed(2)} m`],
        ['Largura Útil (2,10m)', `${usefulWidth.toFixed(2)} m`],
        ['Aproveitamento do Piso', `${(utilization * 100).toFixed(1)}%`],
      ];

      dimensionsData.forEach(([label, value]) => {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text((`${label}:`) as any, margin, yPosition);
        pdf.setTextColor(0, 0, 0);
        pdf.text((value) as any, margin + 80, yPosition);
        yPosition += 6;
      });

      yPosition += 5;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Seção 2: Áreas e Volumes
      pdf.setFontSize(12);
      pdf.setFont(undefined as any, 'bold');
      pdf.setTextColor(21, 128, 61);
      pdf.text(('2. ÁREAS E VOLUMES') as any, margin, yPosition);
      yPosition += 5;

      const areasData = [
        ['Área Total do Piso', `${floorArea.toFixed(2)} m²`],
        ['Volume Aproximado', `${volume.toFixed(2)} m³`],
        ['Área de Paredes', `${wallArea.toFixed(2)} m²`],
      ];

      areasData.forEach(([label, value]) => {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text((`${label}:`) as any, margin, yPosition);
        pdf.setTextColor(0, 0, 0);
        pdf.text((value) as any, margin + 80, yPosition);
        yPosition += 6;
      });

      yPosition += 5;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Seção 3: Materiais ICF
      pdf.setFontSize(12);
      pdf.setFont(undefined as any, 'bold');
      pdf.setTextColor(21, 128, 61);
      pdf.text(('3. MATERIAIS ICF NECESSÁRIOS') as any, margin, yPosition);
      yPosition += 5;

      const materialsData = [
        ['Concreto Necessário', `${concreteVolume.toFixed(2)} m³`],
        ['Aço de Reforço', `${steelWeight} kg`],
        ['EPS (Isolamento)', `${epsVolume.toFixed(2)} m³ (${epsWeight} kg)`],
        ['Iceflex (Revestimento)', `${iceflexQuantity} baldes (18 KG cada)`],
        ['ICFibra (Reforço)', `${icfibraQuantity} rolos (50 m² cada)`],
      ];

      materialsData.forEach(([label, value]) => {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text((`${label}:`) as any, margin, yPosition);
        pdf.setTextColor(0, 0, 0);
        pdf.text((value) as any, margin + 80, yPosition);
        yPosition += 6;
      });

      yPosition += 5;

      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Seção 4: Orçamento de Materiais
      pdf.setFontSize(12);
      pdf.setFont(undefined as any, 'bold');
      pdf.setTextColor(21, 128, 61);
      pdf.text(('4. ORÇAMENTO DE MATERIAIS') as any, margin, yPosition);
      yPosition += 5;

      const budgetData = [
        ['Concreto', `R$ ${concreteCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Aço', `R$ ${steelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['EPS + Acessórios', `R$ ${epsCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Iceflex (Revestimento)', `R$ ${iceflexCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['ICFibra (Reforço)', `R$ ${icfibraCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ];

      budgetData.forEach(([label, value]) => {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text((`${label}:`) as any, margin, yPosition);
        pdf.setTextColor(0, 0, 0);
        pdf.text((value) as any, margin + 80, yPosition);
        yPosition += 6;
      });

      yPosition += 3;
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition - 4, contentWidth, 8, 'F');
      pdf.setFontSize(11);
      pdf.setFont(undefined as any, 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(('Total de Materiais:') as any, margin + 2, yPosition + 1);
      const totalMaterials = 'R$ ' + (concreteCost + steelCost + epsCost + accessoriesCost + iceflexCost + icfibraCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      pdf.text((totalMaterials) as any, margin + 80, yPosition + 1);
      yPosition += 10;

      // Seção 5: Mão de Obra (se houver)
      if (laborServices.length > 0 && laborServices.some(s => s.subtotal > 0)) {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        pdf.setFontSize(12);
        pdf.setFont(undefined as any, 'bold');
        pdf.setTextColor(21, 128, 61);
        pdf.text(('5. ORÇAMENTO DE MÃO DE OBRA') as any, margin, yPosition);
        yPosition += 5;

        laborServices.forEach((service) => {
          if (service.subtotal > 0) {
            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);
            const serviceName = (service.name || 'Serviço') + ':';
            pdf.text((serviceName || '') as any, margin, yPosition);
            pdf.setTextColor(0, 0, 0);
            const serviceText = `${service.quantity} ${service.unit || 'un'} × R$ ${service.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} = R$ ${service.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            pdf.text((serviceText || '') as any, margin + 50, yPosition);
            yPosition += 5;
          }
        });

        yPosition += 3;
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPosition - 4, contentWidth, 8, 'F');
        pdf.setFontSize(11);
        pdf.setFont(undefined as any, 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(('Total de Mão de Obra:') as any, margin + 2, yPosition + 1);
        const totalLabor = 'R$ ' + laborCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        pdf.text((totalLabor) as any, margin + 80, yPosition + 1);
        yPosition += 10;
      }

      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Seção 6: Resumo Financeiro
      pdf.setFontSize(12);
      pdf.setFont(undefined as any, 'bold');
      pdf.setTextColor(21, 128, 61);
      pdf.text(('6. RESUMO FINANCEIRO') as any, margin, yPosition);
      yPosition += 5;

      pdf.setFillColor(21, 128, 61);
      pdf.rect(margin, yPosition - 4, contentWidth, 8, 'F');
      pdf.setFontSize(12);
      pdf.setFont(undefined as any, 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(('ORÇAMENTO TOTAL:') as any, margin + 2, yPosition + 1);
      const totalBudget = 'R$ ' + totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      pdf.text((totalBudget) as any, margin + 80, yPosition + 1);
      yPosition += 8;
      pdf.setFontSize(8);
      pdf.setFont(undefined as any, 'italic');
      pdf.setTextColor(220, 250, 220);
      pdf.text(('* Preço de custo ao expert, sem frete e impostos inclusos.') as any, margin + 2, yPosition);
      yPosition += 10;

      // Custo por m²
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(('Obra cinza — custo por m² de parede:') as any, margin, yPosition);
      pdf.setTextColor(0, 0, 0);
      const costPerM2 = obraCinzaCostPerM2 ?? (wallArea > 0 ? (obraCinzaCost ?? totalCost) / wallArea : 0);
      const costPerM2Text = `R$ ${costPerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      pdf.text((costPerM2Text || '') as any, margin + 80, yPosition);
      yPosition += 8;

      // Rodapé
      yPosition = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      const footerDate = `Relatório gerado em ${new Date().toLocaleString('pt-BR')}`;
      pdf.text((footerDate || '') as any, margin, yPosition);
      pdf.text(('Simulador de Chalé A-frame') as any, pageWidth - margin - 50, yPosition);

      // Salvar PDF
      const fileName = `relatorio_chale_${(simulationName || 'simulacao').toString().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#15803d] to-[#2d5016] text-white rounded-lg hover:from-[#2d5016] hover:to-[#1a3a0f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg"
    >
      {isGenerating ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Exportar PDF
        </>
      )}
    </button>
  );
}
