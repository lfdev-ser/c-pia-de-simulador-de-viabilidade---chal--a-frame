import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export interface CustomMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface CustomMaterialsProps {
  materials: CustomMaterial[];
  onMaterialsChange: (materials: CustomMaterial[]) => void;
}

const DEFAULT_MATERIALS: CustomMaterial[] = [];

export default function CustomMaterials({ materials, onMaterialsChange }: CustomMaterialsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localMaterials, setLocalMaterials] = useState<CustomMaterial[]>(
    materials.length > 0 ? materials : DEFAULT_MATERIALS
  );

  const handleMaterialChange = (id: string, field: keyof CustomMaterial, value: any) => {
    const updated = localMaterials.map(material =>
      material.id === id ? { ...material, [field]: value } : material
    );
    setLocalMaterials(updated);
    onMaterialsChange(updated);
  };

  const handleAddMaterial = () => {
    const newMaterial: CustomMaterial = {
      id: Date.now().toString(),
      name: 'Novo Material',
      quantity: 0,
      unit: 'un',
      unitPrice: 0,
    };
    const updated = [...localMaterials, newMaterial];
    setLocalMaterials(updated);
    onMaterialsChange(updated);
  };

  const handleRemoveMaterial = (id: string) => {
    const updated = localMaterials.filter(material => material.id !== id);
    setLocalMaterials(updated);
    onMaterialsChange(updated);
  };

  const totalCustomCost = localMaterials.reduce(
    (sum, material) => sum + (material.quantity * material.unitPrice),
    0
  );

  return (
    <Card className="p-4 bg-gradient-to-r from-[#f0f8ff] to-[#f5f5f5]">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[#2d2d2d]">📦 Materiais e Insumos Customizáveis</h3>
          <span className="text-sm text-[#6b6b6b]">({localMaterials.length} itens)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0891b2]">
            R$ {totalCustomCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[#6b6b6b]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#6b6b6b]" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {localMaterials.map((material) => (
            <div key={material.id} className="flex gap-2 items-end bg-white p-3 rounded-lg border border-[#e8e6e1]">
              <div className="flex-1">
                <label className="text-xs text-[#6b6b6b] font-semibold">Nome do Material</label>
                <Input
                  value={material.name}
                  onChange={(e) => handleMaterialChange(material.id, 'name', e.target.value)}
                  placeholder="Ex: Telha Cerâmica"
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-20">
                <label className="text-xs text-[#6b6b6b] font-semibold">Qtd</label>
                <Input
                  type="number"
                  value={material.quantity}
                  onChange={(e) => handleMaterialChange(material.id, 'quantity', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-24">
                <label className="text-xs text-[#6b6b6b] font-semibold">Unidade</label>
                <Input
                  value={material.unit}
                  onChange={(e) => handleMaterialChange(material.id, 'unit', e.target.value)}
                  placeholder="un"
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-32">
                <label className="text-xs text-[#6b6b6b] font-semibold">Preço Unitário (R$)</label>
                <Input
                  type="number"
                  value={material.unitPrice}
                  onChange={(e) => handleMaterialChange(material.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-20">
                <label className="text-xs text-[#6b6b6b] font-semibold">Subtotal</label>
                <div className="h-8 flex items-center text-sm font-semibold text-[#0891b2]">
                  R$ {(material.quantity * material.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <Button
                onClick={() => handleRemoveMaterial(material.id)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            onClick={handleAddMaterial}
            variant="outline"
            size="sm"
            className="w-full mt-2 border-[#0891b2] text-[#0891b2] hover:bg-[#f0f8ff]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Material
          </Button>
        </div>
      )}
    </Card>
  );
}
