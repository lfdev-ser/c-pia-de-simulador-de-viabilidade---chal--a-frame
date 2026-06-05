import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';

interface MaterialPrices {
  concretePerM3: number;
  steelPerKg: number;
  epsPerForm: number;
  accessories: number;
  fixedCost: number;
}

interface PriceConfigModalProps {
  prices: MaterialPrices;
  onPricesChange: (prices: MaterialPrices) => void;
}

export default function PriceConfigModal({ prices, onPricesChange }: PriceConfigModalProps) {
  const [open, setOpen] = useState(false);
  const [localPrices, setLocalPrices] = useState<MaterialPrices>(prices);

  const handleInputChange = (field: keyof MaterialPrices, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLocalPrices(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSave = () => {
    onPricesChange(localPrices);
    toast.success('Preços atualizados com sucesso!', {
      duration: 2000,
      position: 'top-center',
    });
    setOpen(false);
  };

  const handleReset = () => {
    setLocalPrices(prices);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Settings className="w-4 h-4" />
        Configurar Preços
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurar Preços dos Materiais</DialogTitle>
            <DialogDescription>
              Ajuste os preços unitários para calcular o orçamento com precisão
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Concreto */}
            <div className="space-y-2">
              <Label htmlFor="concrete" className="text-sm font-semibold">
                Concreto
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="concrete"
                  type="number"
                  step="0.01"
                  value={localPrices.concretePerM3}
                  onChange={(e) => handleInputChange('concretePerM3', e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">R$/m³</span>
              </div>
              <p className="text-xs text-gray-500">Preço por metro cúbico</p>
            </div>

            {/* Aço */}
            <div className="space-y-2">
              <Label htmlFor="steel" className="text-sm font-semibold">
                Aço de Reforço
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="steel"
                  type="number"
                  step="0.01"
                  value={localPrices.steelPerKg}
                  onChange={(e) => handleInputChange('steelPerKg', e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">R$/kg</span>
              </div>
              <p className="text-xs text-gray-500">Preço por quilograma</p>
            </div>

            {/* EPS */}
            <div className="space-y-2">
              <Label htmlFor="eps" className="text-sm font-semibold">
                EPS (Isolamento)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="eps"
                  type="number"
                  step="0.01"
                  value={localPrices.epsPerForm}
                  onChange={(e) => handleInputChange('epsPerForm', e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">R$/forma</span>
              </div>
              <p className="text-xs text-gray-500">
                Preço por forma (2 formas = 1 m² de parede)
              </p>
              <p className="text-xs text-green-600 font-semibold">
                2 formas = R$ {(localPrices.epsPerForm * 2).toFixed(2)}
              </p>
            </div>

            {/* Acessórios */}
            <div className="space-y-2">
              <Label htmlFor="accessories" className="text-sm font-semibold">
                Acessórios
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="accessories"
                  type="number"
                  step="0.01"
                  value={localPrices.accessories}
                  onChange={(e) => handleInputChange('accessories', e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">R$/m²</span>
              </div>
              <p className="text-xs text-gray-500">Preço por metro quadrado de parede</p>
            </div>

            {/* Custo Fixo */}
            <div className="space-y-2">
              <Label htmlFor="fixedCost" className="text-sm font-semibold">
                Custo Fixo
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="fixedCost"
                  type="number"
                  step="0.01"
                  value={localPrices.fixedCost}
                  onChange={(e) => handleInputChange('fixedCost', e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">R$</span>
              </div>
              <p className="text-xs text-gray-500">Mão de obra, mobilização, etc. (não varia com tamanho)</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              Salvar Preços
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
