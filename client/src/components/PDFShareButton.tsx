import { useState } from 'react';
import { MessageCircle, Mail, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PDFShareButtonProps {
  fileName: string;
  projectName: string;
  projectDetails: string;
  onGeneratePDF?: () => Promise<Blob>;
}

export function PDFShareButton({
  fileName,
  projectName,
  projectDetails,
  onGeneratePDF,
}: PDFShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleWhatsAppShare = async () => {
    setIsLoading(true);
    try {
      const message = encodeURIComponent(
        `Olá! 👋\n\nGostaria de compartilhar o relatório técnico do projeto:\n\n📋 *${projectName}*\n\n${projectDetails}\n\nPDF: ${fileName}\n\nPor favor, clique no link abaixo para acessar o relatório completo.`
      );

      const whatsappUrl = `https://wa.me/?text=${message}`;
      window.open(whatsappUrl, '_blank');

      toast.success('Abrindo WhatsApp...');
    } catch (error) {
      toast.error('Erro ao abrir WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailShare = async () => {
    setIsLoading(true);
    try {
      const subject = encodeURIComponent(`Relatório Técnico - ${projectName}`);
      const body = encodeURIComponent(
        `Prezado Cliente,\n\nSegue em anexo o relatório técnico detalhado do seu projeto:\n\n${projectName}\n\n${projectDetails}\n\nArquivo: ${fileName}\n\nQualquer dúvida, estou à disposição.\n\nAtenciosamente,\nEquipe de Projetos`
      );

      const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
      window.location.href = mailtoUrl;

      toast.success('Abrindo cliente de e-mail...');
    } catch (error) {
      toast.error('Erro ao abrir e-mail');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}?pdf=${fileName}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  const handleDownloadPDF = async () => {
    if (!onGeneratePDF) {
      toast.error('Função de geração de PDF não disponível');
      return;
    }

    setIsLoading(true);
    try {
      const pdfBlob = await onGeneratePDF();
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao baixar PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleWhatsAppShare}
          disabled={isLoading}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </Button>

        <Button
          onClick={handleEmailShare}
          disabled={isLoading}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <Mail className="w-4 h-4" />
          E-mail
        </Button>

        <Button
          onClick={handleCopyLink}
          disabled={isLoading}
          className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          size="sm"
        >
          <Copy className="w-4 h-4" />
          Copiar Link
        </Button>

        {onGeneratePDF && (
          <Button
            onClick={handleDownloadPDF}
            disabled={isLoading}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Baixar PDF
          </Button>
        )}
      </div>

      <div className="text-xs text-[#6b6b6b] bg-[#f5f3f0] p-3 rounded">
        <p className="font-semibold mb-1">💡 Dica:</p>
        <p>
          Use WhatsApp ou E-mail para compartilhar o relatório técnico com seus clientes.
          O link permite acesso rápido ao documento sem necessidade de download.
        </p>
      </div>
    </div>
  );
}
