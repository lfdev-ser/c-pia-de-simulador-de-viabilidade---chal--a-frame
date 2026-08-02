import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

interface PDFCustomizationData {
  companyName: string;
  companyLogo: string | null;
  companyEmail: string;
  companyPhone: string;
  companyWebsite: string;
}

interface PDFCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (customizationData: PDFCustomizationData) => void;
  isExporting?: boolean;
}

export function PDFCustomizationModal({
  isOpen,
  onClose,
  onExport,
  isExporting = false,
}: PDFCustomizationModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    onExport({
      companyName,
      companyLogo: logoPreview,
      companyEmail,
      companyPhone,
      companyWebsite,
    });
  };

  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>🎨 Personalizar PDF</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Logo da Empresa</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                {logoPreview ? (
                  <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain p-2"
                    />
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                  >
                    <Upload size={24} />
                    <span className="text-xs text-center">Clique para fazer upload</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1 text-sm text-gray-600">
                <p className="font-semibold mb-2">Recomendacoes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Formato: PNG, JPG ou SVG</li>
                  <li>Tamanho: ate 5MB</li>
                  <li>Proporcao: quadrada ou retangular</li>
                  <li>Resolucao: minimo 300x300px</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Informacoes da Empresa</Label>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="company-name" className="text-sm">
                  Nome da Empresa *
                </Label>
                <Input
                  id="company-name"
                  placeholder="Ex: ABC Construcoes"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="company-email" className="text-sm">
                    Email
                  </Label>
                  <Input
                    id="company-email"
                    type="email"
                    placeholder="contato@empresa.com"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="company-phone" className="text-sm">
                    Telefone
                  </Label>
                  <Input
                    id="company-phone"
                    placeholder="(11) 99999-9999"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company-website" className="text-sm">
                  Website
                </Label>
                <Input
                  id="company-website"
                  placeholder="www.empresa.com"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <Label className="text-base font-semibold">Preview do Cabecalho</Label>
            <div className="bg-white p-4 border border-gray-300 rounded-lg">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-12 object-contain"
                  />
                )}
                <div>
                  <h3 className="font-bold text-lg">
                    {companyName || 'Sua Empresa'}
                  </h3>
                  {(companyEmail || companyPhone || companyWebsite) && (
                    <p className="text-sm text-gray-600">
                      {[companyEmail, companyPhone, companyWebsite]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Relatorio Comparativo de Simulacoes</p>
                <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-semibold mb-1">💡 Dica:</p>
            <p>Preencha pelo menos o nome da empresa para personalizar o PDF. As informacoes de contato sao opcionais.</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={!companyName.trim() || isExporting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isExporting ? '⏳ Exportando...' : '📄 Exportar PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
