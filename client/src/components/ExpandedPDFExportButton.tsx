import React, { useState } from 'react';
import { Download, Loader } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface GeoTechnicalData {
  soilType: string;
  waterTable: number;
  bearingCapacity: number;
  foundationDepth: number;
  observations: string;
}

interface FoundationBase {
  type: 'radié' | 'baldrame' | 'sapata' | 'estaca' | 'outro';
  description: string;
  depth: number;
  width: number;
  length: number;
  concreteVolume: number;
  steelWeight: number;
  unitPrice: number;
  totalCost: number;
}

interface ExpandedPDFExportButtonProps {
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
  finishingProductsCost?: number;
  customMaterialsCost: number;
  foundationCost: number;
  laborServices: Array<{
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }>;
  geoTechnicalData?: GeoTechnicalData;
  foundation?: FoundationBase;
}

export default function ExpandedPDFExportButton({
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
  finishingProductsCost,
  customMaterialsCost,
  foundationCost,
  laborServices,
  geoTechnicalData,
  foundation,
}: ExpandedPDFExportButtonProps) {
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
      const headerDate = `Relatório Técnico Completo - ${new Date().toLocaleDateString('pt-BR')}`;
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
        ['Área de Paredes', `${wallArea.toFixed(2)} m²`],
        ['Volume Aproximado', `${volume.toFixed(2)} m³`],
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
        ['Aço de Reforço', `${steelWeight.toFixed(0)} kg`],
        ['EPS (Isolamento)', `${epsVolume.toFixed(2)} m³ (${epsWeight.toFixed(0)} kg)`],
        ['Iceflex (Revestimento)', `${iceflexQuantity} baldes`],
        ['ICFibra (Reforço)', `${icfibraQuantity} rolos`],
      ];

      materialsData.forEach(([label, value]) => {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text((`${label}:`) as any, margin, yPosition);
        pdf.setTextColor(0, 0, 0);
        pdf.text((value) as any, margin + 80, yPosition);
        yPosition += 6;
      });

      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      yPosition += 5;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Seção 4: Análise Geotécnica
      if (geoTechnicalData) {
        pdf.setFontSize(12);
        pdf.setFont(undefined as any, 'bold');
        pdf.setTextColor(21, 128, 61);
        pdf.text(('4. ANÁLISE GEOTÉCNICA') as any, margin, yPosition);
        yPosition += 5;

        const geoData = [
          ['Tipo de Solo', geoTechnicalData.soilType],
          ['Nível Freático', `${geoTechnicalData.waterTable.toFixed(1)} m`],
          ['Capacidade de Carga', `${geoTechnicalData.bearingCapacity} kPa`],
          ['Profundidade Recomendada', `${geoTechnicalData.foundationDepth.toFixed(1)} m`],
        ];

        geoData.forEach(([label, value]) => {
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text((`${label}:`) as any, margin, yPosition);
          pdf.setTextColor(0, 0, 0);
          pdf.text((value) as any, margin + 80, yPosition);
          yPosition += 6;
        });

        if (geoTechnicalData.observations) {
          yPosition += 3;
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(('Observações:') as any, margin, yPosition);
          yPosition += 4;
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(9);
          const obsLines = pdf.splitTextToSize(geoTechnicalData.observations, contentWidth - 10);
          pdf.text((obsLines) as any, margin + 5, yPosition);
          yPosition += obsLines.length * 4 + 3;
        }

        yPosition += 3;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      }

      // Seção 5: Estrutura de Base/Fundação
      if (foundation) {
        pdf.setFontSize(12);
        pdf.setFont(undefined as any, 'bold');
        pdf.setTextColor(21, 128, 61);
        pdf.text(('5. ESTRUTURA DE BASE/FUNDAÇÃO') as any, margin, yPosition);
        yPosition += 5;

        const foundationData = [
          ['Tipo de Fundação', foundation.type.toUpperCase()],
          ['Profundidade', `${foundation.depth.toFixed(2)} m`],
          ['Largura', `${foundation.width.toFixed(2)} m`],
          ['Comprimento', `${foundation.length.toFixed(2)} m`],
          ['Volume de Concreto', `${foundation.concreteVolume.toFixed(2)} m³`],
          ['Custo Estimado', `R$ ${foundation.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ];

        foundationData.forEach(([label, value]) => {
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text((`${label}:`) as any, margin, yPosition);
          pdf.setTextColor(0, 0, 0);
          pdf.text((value) as any, margin + 80, yPosition);
          yPosition += 6;
        });

        yPosition += 3;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      }

      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      // Seção 6: Orçamento Detalhado
      pdf.setFontSize(12);
      pdf.setFont(undefined as any, 'bold');
      pdf.setTextColor(21, 128, 61);
      pdf.text(('6. ORÇAMENTO DETALHADO') as any, margin, yPosition);
      yPosition += 5;

      const calculatedObraCinzaCost = obraCinzaCost ?? (concreteCost + steelCost + epsCost + (finishingProductsCost ?? 0));
      const obraCinzaCostPerM2 = wallArea > 0 ? calculatedObraCinzaCost / wallArea : 0;
      const budgetData = [
        ['Concreto', `R$ ${concreteCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Aço', `R$ ${steelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['EPS', `R$ ${epsCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Acabamento selecionado', `R$ ${(finishingProductsCost ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Obra cinza — subtotal', `R$ ${calculatedObraCinzaCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Obra cinza — custo por m² de parede', `R$ ${obraCinzaCostPerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Iceflex legado', `R$ ${iceflexCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['ICFibra (Reforço)', `R$ ${icfibraCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Fundação', `R$ ${foundationCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Materiais Customizados', `R$ ${customMaterialsCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
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
      pdf.setFillColor(230, 230, 230);
      pdf.rect(margin, yPosition - 3, contentWidth, 8, 'F');
      pdf.setFontSize(11);
      pdf.setFont(undefined as any, 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(('Total de Materiais') as any, margin + 5, yPosition + 2);
      pdf.text((
        `R$ ${(calculatedObraCinzaCost + accessoriesCost + iceflexCost + icfibraCost + foundationCost + customMaterialsCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ) as any, margin + 80, yPosition + 2);
      yPosition += 10;

      // Mão de Obra
      if (laborServices && laborServices.length > 0) {
        yPosition += 3;
        pdf.setFontSize(11);
        pdf.setFont(undefined as any, 'bold');
        pdf.setTextColor(21, 128, 61);
        pdf.text(('Mão de Obra:') as any, margin, yPosition);
        yPosition += 5;

        laborServices.forEach((service) => {
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text((`${service.name}:`) as any, margin + 5, yPosition);
          pdf.setTextColor(0, 0, 0);
          pdf.text((
            `${service.quantity} ${service.unit} × R$ ${service.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} = R$ ${service.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          ) as any, margin + 50, yPosition);
          yPosition += 5;
        });

        yPosition += 2;
        pdf.setFillColor(230, 230, 230);
        pdf.rect(margin, yPosition - 3, contentWidth, 8, 'F');
        pdf.setFontSize(10);
        pdf.setFont(undefined as any, 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(('Total de Mão de Obra') as any, margin + 5, yPosition + 2);
        pdf.text((
          `R$ ${laborCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        ) as any, margin + 80, yPosition + 2);
        yPosition += 10;
      }

      // Orçamento Total
      yPosition += 3;
      pdf.setFillColor(21, 128, 61);
      pdf.rect(margin, yPosition - 3, contentWidth, 10, 'F');
      pdf.setFontSize(12);
      pdf.setFont(undefined as any, 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(('ORÇAMENTO TOTAL') as any, margin + 5, yPosition + 2);
      pdf.text((
        `R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ) as any, margin + 80, yPosition + 2);

      // Rodapé
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        (
          'Este relatório foi gerado automaticamente pelo Simulador de Chalé A-frame. ' +
          'Os valores são estimativas baseadas nos parâmetros fornecidos.'
        ) as any,
        margin,
        pageHeight - 10
      );

      // Salvar PDF
      const fileName = `relatorio_chale_${simulationName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao exportar PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#15803d] to-[#059669] text-white rounded-lg hover:from-[#166534] hover:to-[#047857] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      {isGenerating ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          Exportar Relatório Técnico Completo
        </>
      )}
    </button>
  );
}
