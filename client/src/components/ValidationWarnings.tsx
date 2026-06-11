import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface ValidationWarning {
  type: 'base' | 'height' | 'length' | 'angle' | 'utilization';
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

interface ValidationWarningsProps {
  warnings: ValidationWarning[];
  showOnlyWarnings?: boolean;
}

export default function ValidationWarnings({ warnings, showOnlyWarnings = false }: ValidationWarningsProps) {
  if (warnings.length === 0) {
    if (showOnlyWarnings) return null;
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-900">Dimensões Ótimas</p>
          <p className="text-xs text-green-700 mt-1">Todas as dimensões estão dentro dos limites recomendados!</p>
        </div>
      </div>
    );
  }

  // Separar avisos por severidade
  const criticalWarnings = warnings.filter(w => w.severity === 'critical');
  const warningWarnings = warnings.filter(w => w.severity === 'warning');

  return (
    <div className="space-y-3">
      {/* Avisos Críticos */}
      {criticalWarnings.map((warning, idx) => (
        <div key={`critical-${idx}`} className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-900">Aviso Crítico</p>
            <p className="text-xs text-red-700 mt-1">{warning.message}</p>
          </div>
        </div>
      ))}

      {/* Avisos de Atenção */}
      {warningWarnings.map((warning, idx) => (
        <div key={`warning-${idx}`} className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Recomendação</p>
            <p className="text-xs text-amber-700 mt-1">{warning.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
