import { useMemo } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { calculateEPSWaste, suggestOptimizedDimensions } from '@/lib/epsOptimization';

interface EPSMultipleValidationProps {
  length: number;
  height: number;
  onSuggestedDimensionsChange?: (length: number, height: number) => void;
}

export function EPSMultipleValidation({
  length,
  height,
  onSuggestedDimensionsChange,
}: EPSMultipleValidationProps) {
  // Dimensões padrão dos blocos EPS
  const EPS_BLOCK_LENGTH = 1.25; // comprimento
  const EPS_BLOCK_HEIGHT = 0.40; // altura (CORRIGIDO: era 0.25)

  const validation = useMemo(() => {
    if (length === 0 || height === 0) {
      return null;
    }

    const wastePercentage = calculateEPSWaste(length, height);
    const isLengthMultiple = Math.abs(length % EPS_BLOCK_LENGTH) < 0.01;
    const isHeightMultiple = Math.abs(height % EPS_BLOCK_HEIGHT) < 0.01;
    const isBothMultiples = isLengthMultiple && isHeightMultiple;

    const suggested = suggestOptimizedDimensions(length, height);

    return {
      wastePercentage,
      isLengthMultiple,
      isHeightMultiple,
      isBothMultiples,
      suggested,
      lengthRemainder: length % EPS_BLOCK_LENGTH,
      heightRemainder: height % EPS_BLOCK_HEIGHT,
    };
  }, [length, height]);

  if (!validation || (validation.isBothMultiples && validation.wastePercentage < 0.5)) {
    return null; // Sem avisos se as dimensões são perfeitas
  }

  const getSeverity = () => {
    if (validation.isBothMultiples) return 'success';
    if (validation.wastePercentage < 5) return 'info';
    if (validation.wastePercentage < 15) return 'warning';
    return 'error';
  };

  const getColors = () => {
    const severity = getSeverity();
    switch (severity) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'text-green-800',
          button: 'bg-green-600 hover:bg-green-700',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
          text: 'text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          text: 'text-yellow-800',
          button: 'bg-yellow-600 hover:bg-yellow-700',
        };
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          text: 'text-red-800',
          button: 'bg-red-600 hover:bg-red-700',
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`border rounded-lg p-4 mb-4 ${colors.bg} ${colors.border}`}>
      <div className="flex items-start gap-3">
        {colors.icon}
        <div className="flex-1">
          <h3 className={`font-semibold mb-2 ${colors.text}`}>
            📏 Validação de Múltiplos de EPS
          </h3>

          {/* Current Status */}
          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
            <div className="bg-white bg-opacity-70 rounded p-2">
              <p className="text-gray-600 text-xs">Comprimento</p>
              <p className={`font-bold ${validation.isLengthMultiple ? 'text-green-600' : 'text-orange-600'}`}>
                {length.toFixed(2)}m
                {validation.isLengthMultiple ? ' ✓' : ` (resto: ${validation.lengthRemainder.toFixed(3)}m)`}
              </p>
              <p className="text-xs text-gray-500">Múltiplo de {EPS_BLOCK_LENGTH}m?</p>
            </div>

            <div className="bg-white bg-opacity-70 rounded p-2">
              <p className="text-gray-600 text-xs">Altura</p>
              <p className={`font-bold ${validation.isHeightMultiple ? 'text-green-600' : 'text-orange-600'}`}>
                {height.toFixed(2)}m
                {validation.isHeightMultiple ? ' ✓' : ` (resto: ${validation.heightRemainder.toFixed(3)}m)`}
              </p>
              <p className="text-xs text-gray-500">Múltiplo de {EPS_BLOCK_HEIGHT}m?</p>
            </div>

            <div className="bg-white bg-opacity-70 rounded p-2 col-span-2">
              <p className="text-gray-600 text-xs">Desperdício Estimado</p>
              <p className={`font-bold ${validation.wastePercentage > 10 ? 'text-red-600' : 'text-orange-600'}`}>
                {validation.wastePercentage.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Message */}
          <p className={`text-sm mb-3 ${colors.text}`}>
            {validation.isBothMultiples ? (
              '✅ Dimensões perfeitas! Sem desperdício de EPS.'
            ) : validation.wastePercentage < 5 ? (
              '✅ Desperdício mínimo. Dimensões otimizadas para EPS.'
            ) : validation.wastePercentage < 15 ? (
              `⚠️ Desperdício moderado (${validation.wastePercentage.toFixed(1)}%). Considere ajustar as dimensões.`
            ) : (
              `🔴 Desperdício alto (${validation.wastePercentage.toFixed(1)}%). Recomenda-se ajustar as dimensões para evitar recortes desnecessários.`
            )}
          </p>

          {/* Suggested Dimensions */}
          {!validation.isBothMultiples && validation.wastePercentage > 2 && (
            <div className="bg-white bg-opacity-50 rounded p-3 mb-3">
              <p className="text-sm font-semibold mb-2 text-gray-800 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Dimensões Otimizadas Sugeridas:
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <p className="text-xs text-gray-600">Comprimento Atual</p>
                  <p className="font-semibold text-gray-800">{length.toFixed(2)}m</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Comprimento Otimizado</p>
                  <p className="font-semibold text-green-700">{validation.suggested.length.toFixed(2)}m</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Altura Atual</p>
                  <p className="font-semibold text-gray-800">{height.toFixed(2)}m</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Altura Otimizada</p>
                  <p className="font-semibold text-green-700">{validation.suggested.height.toFixed(2)}m</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-3">
                Ajustando para essas dimensões, você evitará recortes desnecessários de blocos EPS.
              </p>

              {onSuggestedDimensionsChange && (
                <button
                  onClick={() =>
                    onSuggestedDimensionsChange(
                      validation.suggested.length,
                      validation.suggested.height
                    )
                  }
                  className={`px-4 py-2 ${colors.button} text-white text-sm rounded transition font-semibold`}
                >
                  Aplicar Dimensões Otimizadas
                </button>
              )}
            </div>
          )}

          {/* Technical Info */}
          <div className="text-xs text-gray-600 bg-white bg-opacity-50 rounded p-2">
            <p className="font-semibold mb-1">📋 Informações Técnicas:</p>
            <ul className="list-disc list-inside space-y-1">
            <li>Blocos EPS padrão: {EPS_BLOCK_LENGTH}m × {EPS_BLOCK_HEIGHT}m (CORRIGIDO)</li>
            <li>Cada 2 formas = 1m² de parede</li>
            <li>72 litros de concreto por m² de parede</li>
            <li>~5 kg de aço por m² de parede</li>
            <li>Múltiplos perfeitos eliminam recortes</li>
            <li>Reduz desperdício e custos de material</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
