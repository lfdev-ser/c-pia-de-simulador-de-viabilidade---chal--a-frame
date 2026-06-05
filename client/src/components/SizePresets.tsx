import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home } from 'lucide-react';

interface SizePreset {
  name: string;
  base: number;
  height: number;
  length: number;
  description: string;
}

interface SizePresetsProps {
  onPresetSelect: (preset: SizePreset) => void;
}

const PRESETS: SizePreset[] = [
  {
    name: 'Pequeno',
    base: 3.5,
    height: 3.5,
    length: 5.0,
    description: 'Ideal para retiros, escritório ou estúdio'
  },
  {
    name: 'Médio',
    base: 4.5,
    height: 5.0,
    length: 6.0,
    description: 'Perfeito para residência ou hospedagem'
  },
  {
    name: 'Grande',
    base: 5.5,
    height: 6.0,
    length: 8.0,
    description: 'Espaçoso para família ou eventos'
  }
];

export default function SizePresets({ onPresetSelect }: SizePresetsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Home className="w-4 h-4 text-green-600" />
        <h3 className="text-sm font-semibold text-gray-700">Tamanhos Recomendados</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESETS.map((preset) => (
          <Card
            key={preset.name}
            className="p-3 hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
            onClick={() => onPresetSelect(preset)}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPresetSelect(preset);
              }}
              variant="outline"
              size="sm"
              className="w-full mb-2 text-xs"
            >
              {preset.name}
            </Button>
            <p className="text-xs text-gray-600 font-medium">{preset.description}</p>
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <div>📏 {preset.base.toFixed(2)}m × {preset.height.toFixed(2)}m × {preset.length.toFixed(2)}m</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
