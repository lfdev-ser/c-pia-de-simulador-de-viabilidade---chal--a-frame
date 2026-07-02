import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface FoundationBase {
  type: 'radié' | 'baldrame' | 'sapata' | 'estaca' | 'outro';
  description: string;
  depth: number; // profundidade em metros
  width: number; // largura em metros
  length: number; // comprimento em metros
  concreteVolume: number; // m³
  steelWeight: number; // kg
  unitPrice: number; // preço por m³ ou kg
  totalCost: number;
}

interface FoundationProps {
  foundation: FoundationBase | null;
  onFoundationChange: (foundation: FoundationBase | null) => void;
  projectArea: number; // área do projeto em m²
}

const FOUNDATION_TYPES = [
  { value: 'radié', label: 'Radié (Laje Única)' },
  { value: 'baldrame', label: 'Baldrame (Viga de Fundação)' },
  { value: 'sapata', label: 'Sapata Isolada' },
  { value: 'estaca', label: 'Estaca' },
  { value: 'outro', label: 'Outro' },
];

export default function Foundation({ foundation, onFoundationChange, projectArea }: FoundationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFoundation, setLocalFoundation] = useState<FoundationBase | null>(
    foundation || {
      type: 'radié',
      description: '',
      depth: 0.15,
      width: 0,
      length: 0,
      concreteVolume: 0,
      steelWeight: 0,
      unitPrice: 0,
      totalCost: 0,
    }
  );

  const handleFoundationChange = (field: keyof FoundationBase, value: any) => {
    if (!localFoundation) return;

    let updated = { ...localFoundation, [field]: value };

    // Auto-calculate concrete volume for radié
    if (updated.type === 'radié' && updated.depth > 0) {
      updated.concreteVolume = projectArea * updated.depth;
    }

    // Auto-calculate for baldrame
    if (updated.type === 'baldrame' && updated.depth > 0 && updated.width > 0) {
      updated.concreteVolume = (projectArea * 0.3) * updated.depth * updated.width; // 30% of perimeter
    }

    // Calculate total cost
    if (updated.type === 'radié' || updated.type === 'baldrame') {
      updated.totalCost = updated.concreteVolume * updated.unitPrice;
    } else {
      updated.totalCost = updated.steelWeight * updated.unitPrice;
    }

    setLocalFoundation(updated);
    onFoundationChange(updated);
  };

  if (!localFoundation) return null;

  return (
    <Card className="p-4 bg-gradient-to-r from-[#f5e6d3] to-[#f5f5f5]">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[#2d2d2d]">🏗️ Estrutura de Base/Fundação</h3>
          <span className="text-sm text-[#6b6b6b]">{localFoundation.type.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#92400e]">
            R$ {localFoundation.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[#6b6b6b]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#6b6b6b]" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 bg-white p-4 rounded-lg border border-[#e8e6e1]">
          {/* Tipo de Fundação */}
          <div>
            <label className="text-sm font-semibold text-[#2d2d2d]">Tipo de Fundação</label>
            <select
              value={localFoundation.type}
              onChange={(e) => handleFoundationChange('type', e.target.value as any)}
              className="w-full mt-1 p-2 border border-[#d1c7b8] rounded-lg text-sm"
            >
              {FOUNDATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-semibold text-[#2d2d2d]">Descrição/Observações</label>
            <Input
              value={localFoundation.description}
              onChange={(e) => handleFoundationChange('description', e.target.value)}
              placeholder="Ex: Solo tipo argila, nível freático 2m"
              className="mt-1"
            />
          </div>

          {/* Dimensões */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-[#6b6b6b]">Profundidade (m)</label>
              <Input
                type="number"
                step="0.01"
                value={localFoundation.depth}
                onChange={(e) => handleFoundationChange('depth', parseFloat(e.target.value) || 0)}
                placeholder="0.15"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6b6b6b]">Largura (m)</label>
              <Input
                type="number"
                step="0.01"
                value={localFoundation.width}
                onChange={(e) => handleFoundationChange('width', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6b6b6b]">Comprimento (m)</label>
              <Input
                type="number"
                step="0.01"
                value={localFoundation.length}
                onChange={(e) => handleFoundationChange('length', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>

          {/* Volume de Concreto */}
          <div>
            <label className="text-sm font-semibold text-[#2d2d2d]">Volume de Concreto (m³)</label>
            <div className="mt-1 p-2 bg-[#f5f5f5] rounded-lg text-sm font-semibold text-[#92400e]">
              {localFoundation.concreteVolume.toFixed(2)} m³
            </div>
          </div>

          {/* Peso de Aço */}
          <div>
            <label className="text-sm font-semibold text-[#2d2d2d]">Peso de Aço (kg)</label>
            <Input
              type="number"
              step="0.1"
              value={localFoundation.steelWeight}
              onChange={(e) => handleFoundationChange('steelWeight', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="mt-1 h-8 text-sm"
            />
          </div>

          {/* Preço Unitário */}
          <div>
            <label className="text-sm font-semibold text-[#2d2d2d]">
              Preço Unitário (R$ por {localFoundation.type === 'radié' || localFoundation.type === 'baldrame' ? 'm³' : 'kg'})
            </label>
            <Input
              type="number"
              step="0.01"
              value={localFoundation.unitPrice}
              onChange={(e) => handleFoundationChange('unitPrice', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className="mt-1 h-8 text-sm"
            />
          </div>

          {/* Total */}
          <div className="bg-[#f5e6d3] p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#2d2d2d]">Total da Fundação:</span>
              <span className="font-bold text-[#92400e] text-lg">
                R$ {localFoundation.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
