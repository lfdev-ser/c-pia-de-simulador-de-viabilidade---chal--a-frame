import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ShareSimulationProps {
  simulationId: string;
  simulationName: string;
  base: number;
  height: number;
  length: number;
}

export default function ShareSimulation({
  simulationId,
  simulationName,
  base,
  height,
  length,
}: ShareSimulationProps) {
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Gerar link compartilhável com dados codificados em Base64
  const shareLink = useMemo(() => {
    const data = {
      id: simulationId,
      name: simulationName,
      base,
      height,
      length,
      timestamp: new Date().toISOString(),
    };
    const encoded = btoa(JSON.stringify(data));
    return `${window.location.origin}?shared=${encoded}`;
  }, [simulationId, simulationName, base, height, length]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Simulação de Chalé A-frame: ${simulationName}`);
    const body = encodeURIComponent(
      `Olá,\n\nGostaria de compartilhar uma simulação de chalé A-frame com você.\n\n` +
      `Dimensões: ${base.toFixed(2)}m × ${height.toFixed(2)}m × ${length.toFixed(2)}m\n\n` +
      `Acesse o link para visualizar e comentar:\n${shareLink}\n\n` +
      `Atenciosamente`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `Confira minha simulação de chalé A-frame!\n\n` +
      `Dimensões: ${base.toFixed(2)}m × ${height.toFixed(2)}m × ${length.toFixed(2)}m\n\n` +
      `${shareLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <Card className="border-l-4 border-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-600" />
          Compartilhar Simulação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Compartilhe esta simulação com clientes, colegas ou parceiros para colaboração em tempo real.
        </p>

        {!showShare ? (
          <Button
            onClick={() => setShowShare(true)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Gerar Link de Compartilhamento
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Link Compartilhável */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Link de Compartilhamento</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
                />
                <Button
                  onClick={handleCopyLink}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Qualquer pessoa com este link pode visualizar e comentar na simulação
              </p>
            </div>

            {/* Opções de Compartilhamento */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Compartilhar via</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleShareEmail}
                  variant="outline"
                  size="sm"
                  className="justify-center"
                >
                  📧 Email
                </Button>
                <Button
                  onClick={handleShareWhatsApp}
                  variant="outline"
                  size="sm"
                  className="justify-center"
                >
                  💬 WhatsApp
                </Button>
              </div>
            </div>

            {/* Informações de Segurança */}
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>💡 Dica:</strong> O link contém os dados da simulação codificados. 
                Qualquer pessoa com o link pode visualizar, mas não pode editar os dados originais.
              </p>
            </div>

            <Button
              onClick={() => setShowShare(false)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
