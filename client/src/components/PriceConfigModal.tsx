import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Settings, Info } from 'lucide-react';
import { toast } from 'sonner';
import type { FinishingProductPrice, MaterialPrices } from '@/lib/materialPrices';

interface PriceConfigModalProps {
  prices: MaterialPrices;
  onPricesChange: (prices: MaterialPrices) => void;
}

const formatPrice = (value: number) => value.toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

export default function PriceConfigModal({ prices, onPricesChange }: PriceConfigModalProps) {
  const [open, setOpen] = useState(false);
  const [localPrices, setLocalPrices] = useState<MaterialPrices>(prices);

  useEffect(() => {
    if (open) setLocalPrices(prices);
  }, [open, prices]);

  const handleInputChange = (field: keyof Omit<MaterialPrices, 'finishingProducts'>, value: string) => {
    const numValue = Number.parseFloat(value.replace(',', '.')) || 0;
    setLocalPrices((previous) => ({ ...previous, [field]: numValue }));
  };

  const updateProduct = (id: string, patch: Partial<FinishingProductPrice>) => {
    setLocalPrices((previous) => ({
      ...previous,
      finishingProducts: previous.finishingProducts.map((product) => (
        product.id === id ? { ...product, ...patch } : product
      )),
    }));
  };

  const handleSave = () => {
    onPricesChange(localPrices);
    toast.success('Preços e rendimentos atualizados com sucesso!', {
      duration: 2200,
      position: 'top-center',
    });
    setOpen(false);
  };

  const handleReset = () => setLocalPrices(prices);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" size="sm" className="gap-2">
        <Settings className="w-4 h-4" />
        Configurar Preços
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preços, acabamentos e rendimentos</DialogTitle>
            <DialogDescription>
              Atualize os preços unitários e informe o consumo real por m². O simulador grava esses valores neste navegador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="concrete">Concreto (R$/m³)</Label>
                <Input id="concrete" type="number" step="0.001" value={localPrices.concretePerM3} onChange={(event) => handleInputChange('concretePerM3', event.target.value)} />
                <p className="text-xs text-muted-foreground">Consumo fixo: 78 litros/m².</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="steel">Aço (R$/kg)</Label>
                <Input id="steel" type="number" step="0.001" value={localPrices.steelPerKg} onChange={(event) => handleInputChange('steelPerKg', event.target.value)} />
                <p className="text-xs text-muted-foreground">Consumo fixo aproximado: 5 kg/m².</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eps">EPS (R$/forma)</Label>
                <Input id="eps" type="number" step="0.001" value={localPrices.epsPerForm} onChange={(event) => handleInputChange('epsPerForm', event.target.value)} />
                <p className="text-xs text-muted-foreground">Consumo fixo: 2 formas/m².</p>
              </div>
            </section>

            <section className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <div className="flex gap-2">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>
                  A obra cinza considera somente EPS, concreto, aço e os produtos marcados como acabamento. Como os rendimentos reais podem variar, os campos <strong>un./m²</strong> começam com uma referência aproximada: 0,25 embalagem/m² para cada lado do ICFlex (1 embalagem/4 m²) e 2 m/m² de ICFibra/tela nos dois lados. Ajuste-os conforme a ficha técnica ou medição da obra.
                </p>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">Produtos informados</h3>
                  <p className="text-xs text-muted-foreground">Preços efetivos fornecidos; ICFibra e AquaICF já incluem os acréscimos informados.</p>
                </div>
                <span className="text-xs text-muted-foreground">Valores em R$</span>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-[820px] w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="p-3 font-semibold">Produto</th>
                      <th className="p-3 font-semibold">Preço/un.</th>
                      <th className="p-3 font-semibold">Qtd. referência</th>
                      <th className="p-3 font-semibold">Consumo/un./m²</th>
                      <th className="p-3 font-semibold">Obra cinza</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localPrices.finishingProducts.map((product) => (
                      <tr key={product.id} className="border-t align-top">
                        <td className="p-3">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">Unidade: {product.unit} · Lado: {product.side === 'external' ? 'externo' : product.side === 'internal' ? 'interno' : 'apoio'}</div>
                          {product.priceNote && <div className="mt-1 text-[11px] text-blue-700">{product.priceNote}</div>}
                        </td>
                        <td className="p-3 w-32">
                          <Input type="number" step="0.001" value={product.unitPrice} onChange={(event) => updateProduct(product.id, { unitPrice: Number.parseFloat(event.target.value.replace(',', '.')) || 0 })} />
                        </td>
                        <td className="p-3 w-32">
                          <Input type="number" step="1" min="0" value={product.referenceQuantity} onChange={(event) => updateProduct(product.id, { referenceQuantity: Number.parseFloat(event.target.value) || 0 })} />
                        </td>
                        <td className="p-3 w-36">
                          <Input type="number" step="0.001" min="0" value={product.unitsPerM2} onChange={(event) => updateProduct(product.id, { unitsPerM2: Number.parseFloat(event.target.value.replace(',', '.')) || 0 })} />
                          <div className="mt-1 text-[11px] text-muted-foreground">{product.unit}/m²</div>
                        </td>
                        <td className="p-3 w-24 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-green-700"
                            checked={product.includeInObraCinza}
                            onChange={(event) => updateProduct(product.id, { includeInObraCinza: event.target.checked })}
                            aria-label={`Incluir ${product.name} na obra cinza`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="accessories">Acessórios legados (R$/m²)</Label>
                <Input id="accessories" type="number" step="0.001" value={localPrices.accessories} onChange={(event) => handleInputChange('accessories', event.target.value)} />
                <p className="text-xs text-muted-foreground">Mantido para compatibilidade; não entra na obra cinza.</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Itens legados</p>
                <p>Os campos antigos de Iceflex e ICFibra continuam salvos para compatibilidade com simulações anteriores. Para o novo cálculo, use a tabela acima e informe o consumo por m².</p>
              </div>
            </section>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleReset}>Cancelar</Button>
            <Button type="button" onClick={handleSave} className="bg-green-600 hover:bg-green-700">Salvar preços</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
