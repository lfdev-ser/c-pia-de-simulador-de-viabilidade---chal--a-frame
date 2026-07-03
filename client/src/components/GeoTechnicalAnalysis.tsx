import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface GeoTechnicalData {
  soilType: 'argila' | 'areia' | 'silte' | 'rocha' | 'misto';
  waterTable: number; // em metros
  bearingCapacity: number; // kPa
  foundationDepth: number; // em metros
  observations: string;
}

interface GeoTechnicalAnalysisProps {
  base: number;
  height: number;
  length: number;
  foundationType: string;
  onGeoDataChange: (data: GeoTechnicalData) => void;
}

const SOIL_PROPERTIES = {
  argila: {
    name: 'Argila',
    bearingCapacity: 100,
    minDepth: 0.8,
    maxDepth: 1.5,
    recommendations: 'Fundação em sapata ou radié. Risco de recalque diferencial.',
    color: '#8B7355',
  },
  areia: {
    name: 'Areia',
    bearingCapacity: 150,
    minDepth: 0.6,
    maxDepth: 1.2,
    recommendations: 'Fundação em sapata ou radié. Boa drenagem. Risco de erosão.',
    color: '#D2B48C',
  },
  silte: {
    name: 'Silte',
    bearingCapacity: 120,
    minDepth: 0.7,
    maxDepth: 1.3,
    recommendations: 'Fundação em sapata ou baldrame. Verificar compactação.',
    color: '#A0826D',
  },
  rocha: {
    name: 'Rocha',
    bearingCapacity: 500,
    minDepth: 0.3,
    maxDepth: 0.6,
    recommendations: 'Fundação rasa. Excelente capacidade de carga. Verificar fissuras.',
    color: '#696969',
  },
  misto: {
    name: 'Solo Misto',
    bearingCapacity: 130,
    minDepth: 0.7,
    maxDepth: 1.4,
    recommendations: 'Fundação em sapata ou baldrame. Fazer sondagem complementar.',
    color: '#9B8B7E',
  },
};

export default function GeoTechnicalAnalysis({
  base,
  height,
  length,
  foundationType,
  onGeoDataChange,
}: GeoTechnicalAnalysisProps) {
  const [soilType, setSoilType] = useState<'argila' | 'areia' | 'silte' | 'rocha' | 'misto'>('argila');
  const [waterTable, setWaterTable] = useState(2);
  const [observations, setObservations] = useState('');

  const soilData = SOIL_PROPERTIES[soilType];
  const totalArea = base * length;
  const estimatedLoad = (totalArea * 5) / 1000; // kN/m² (estimativa para ICF)

  const analysis = useMemo(() => {
    const requiredBearing = estimatedLoad * 10; // conversão para kPa
    const isSuitable = soilData.bearingCapacity >= requiredBearing;
    const riskLevel = waterTable < 1 ? 'alto' : waterTable < 2 ? 'médio' : 'baixo';

    const recommendations = [];
    recommendations.push(soilData.recommendations);

    if (waterTable < 1) {
      recommendations.push('⚠️ Nível freático muito alto. Considere drenagem superficial e impermeabilização.');
    } else if (waterTable < 2) {
      recommendations.push('⚠️ Nível freático moderado. Recomenda-se drenagem perimetral.');
    } else {
      recommendations.push('✓ Nível freático adequado para construção.');
    }

    if (!isSuitable) {
      recommendations.push('❌ Capacidade de carga insuficiente. Considere fundação mais profunda ou reforçada.');
    }

    return {
      isSuitable,
      riskLevel,
      requiredBearing,
      recommendations,
    };
  }, [soilType, waterTable, soilData, estimatedLoad]);

  const handleUpdate = () => {
    onGeoDataChange({
      soilType,
      waterTable,
      bearingCapacity: soilData.bearingCapacity,
      foundationDepth: soilData.minDepth,
      observations,
    });
  };

  React.useEffect(() => {
    handleUpdate();
  }, [soilType, waterTable, observations]);

  return (
    <Card className="border-l-4" style={{ borderLeftColor: soilData.color }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <span>🌍 Análise Geotécnica</span>
          {analysis.isSuitable ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo de Solo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Solo</label>
          <Select value={soilType} onValueChange={(value: any) => setSoilType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="argila">Argila</SelectItem>
              <SelectItem value="areia">Areia</SelectItem>
              <SelectItem value="silte">Silte</SelectItem>
              <SelectItem value="rocha">Rocha</SelectItem>
              <SelectItem value="misto">Solo Misto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nível Freático */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nível Freático (m)</label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={waterTable}
            onChange={(e) => setWaterTable(parseFloat(e.target.value))}
            placeholder="Profundidade em metros"
          />
          <p className="text-xs text-gray-600">
            Risco: <span className={`font-semibold ${
              analysis.riskLevel === 'alto' ? 'text-red-600' :
              analysis.riskLevel === 'médio' ? 'text-yellow-600' :
              'text-green-600'
            }`}>{analysis.riskLevel.toUpperCase()}</span>
          </p>
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Observações Técnicas</label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ex: Solo compactado, presença de matacões, histórico de inundações..."
            className="w-full p-2 border rounded-md text-sm"
            rows={3}
          />
        </div>

        {/* Resumo da Análise */}
        <div className="bg-blue-50 p-3 rounded-md space-y-2">
          <div className="flex justify-between text-sm">
            <span>Capacidade de Carga do Solo:</span>
            <span className="font-semibold">{soilData.bearingCapacity} kPa</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Carga Estimada da Estrutura:</span>
            <span className="font-semibold">{analysis.requiredBearing.toFixed(1)} kPa</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Profundidade Recomendada:</span>
            <span className="font-semibold">{soilData.minDepth}m - {soilData.maxDepth}m</span>
          </div>
        </div>

        {/* Recomendações */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Recomendações de Fundação
          </h4>
          <ul className="space-y-1 text-sm text-gray-700">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-2">
                <span>•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Status */}
        {!analysis.isSuitable && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Atenção:</strong> A capacidade de carga do solo pode ser insuficiente. Recomenda-se consultar um engenheiro geotécnico.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
