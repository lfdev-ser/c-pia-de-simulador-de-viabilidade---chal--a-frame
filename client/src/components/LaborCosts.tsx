import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export interface LaborService {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface LaborCostsProps {
  services: LaborService[];
  onServicesChange: (services: LaborService[]) => void;
}

const DEFAULT_SERVICES: LaborService[] = [
  { id: '1', name: 'Preparação do Terreno', quantity: 0, unit: 'dia', unitPrice: 0 },
  { id: '2', name: 'Montagem da Estrutura ICF', quantity: 0, unit: 'dia', unitPrice: 0 },
  { id: '3', name: 'Concretagem', quantity: 0, unit: 'dia', unitPrice: 0 },
  { id: '4', name: 'Revestimento (Iceflex)', quantity: 0, unit: 'dia', unitPrice: 0 },
  { id: '5', name: 'Acabamentos Finais', quantity: 0, unit: 'dia', unitPrice: 0 },
];

export default function LaborCosts({ services, onServicesChange }: LaborCostsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localServices, setLocalServices] = useState<LaborService[]>(
    services.length > 0 ? services : DEFAULT_SERVICES
  );

  const handleServiceChange = (id: string, field: keyof LaborService, value: any) => {
    const updated = localServices.map(service =>
      service.id === id ? { ...service, [field]: value } : service
    );
    setLocalServices(updated);
    onServicesChange(updated);
  };

  const handleAddService = () => {
    const newService: LaborService = {
      id: Date.now().toString(),
      name: 'Novo Serviço',
      quantity: 0,
      unit: 'dia',
      unitPrice: 0,
    };
    const updated = [...localServices, newService];
    setLocalServices(updated);
    onServicesChange(updated);
  };

  const handleRemoveService = (id: string) => {
    const updated = localServices.filter(service => service.id !== id);
    setLocalServices(updated);
    onServicesChange(updated);
  };

  const totalLaborCost = localServices.reduce(
    (sum, service) => sum + (service.quantity * service.unitPrice),
    0
  );

  return (
    <Card className="p-4 bg-gradient-to-r from-[#fff8f0] to-[#f5f5f5]">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[#2d2d2d]">👷 Mão de Obra Customizável</h3>
          <span className="text-sm text-[#6b6b6b]">({localServices.length} serviços)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#d97706]">
            R$ {totalLaborCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
          {localServices.map((service) => (
            <div
              key={service.id}
              className="grid grid-cols-12 gap-2 items-center p-3 bg-white rounded-lg border border-[#e8e6e1]"
            >
              {/* Service Name */}
              <input
                type="text"
                value={service.name}
                onChange={(e) => handleServiceChange(service.id, 'name', e.target.value)}
                className="col-span-4 px-2 py-1 text-sm border border-[#ddd] rounded bg-white text-[#2d2d2d] focus:outline-none focus:border-[#15803d]"
                placeholder="Nome do serviço"
              />

              {/* Quantity */}
              <input
                type="number"
                value={service.quantity}
                onChange={(e) => handleServiceChange(service.id, 'quantity', parseFloat(e.target.value) || 0)}
                className="col-span-2 px-2 py-1 text-sm border border-[#ddd] rounded bg-white text-[#2d2d2d] focus:outline-none focus:border-[#15803d]"
                placeholder="Qtd"
                min="0"
                step="0.5"
              />

              {/* Unit */}
              <select
                value={service.unit}
                onChange={(e) => handleServiceChange(service.id, 'unit', e.target.value)}
                className="col-span-2 px-2 py-1 text-sm border border-[#ddd] rounded bg-white text-[#2d2d2d] focus:outline-none focus:border-[#15803d]"
              >
                <option value="dia">dia</option>
                <option value="hora">hora</option>
                <option value="m²">m²</option>
                <option value="m³">m³</option>
                <option value="un">un</option>
              </select>

              {/* Unit Price */}
              <input
                type="number"
                value={service.unitPrice}
                onChange={(e) => handleServiceChange(service.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                className="col-span-2 px-2 py-1 text-sm border border-[#ddd] rounded bg-white text-[#2d2d2d] focus:outline-none focus:border-[#15803d]"
                placeholder="Preço"
                min="0"
                step="0.01"
              />

              {/* Subtotal */}
              <div className="col-span-1 text-right">
                <span className="text-sm font-bold text-[#15803d]">
                  R$ {(service.quantity * service.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleRemoveService(service.id)}
                className="col-span-1 flex justify-center items-center p-1 hover:bg-red-50 rounded transition-colors"
                title="Remover serviço"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}

          {/* Add Service Button */}
          <button
            onClick={handleAddService}
            className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-[#d97706] rounded-lg text-[#d97706] hover:bg-[#fff8f0] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Adicionar Serviço</span>
          </button>

          {/* Total Summary */}
          <div className="mt-4 p-3 bg-[#f0fdf4] rounded-lg border border-[#15803d]">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#2d2d2d]">Total de Mão de Obra:</span>
              <span className="font-bold text-lg text-[#15803d]">
                R$ {totalLaborCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
