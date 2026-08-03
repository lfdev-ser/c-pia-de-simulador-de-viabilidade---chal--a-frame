/**
 * Comparison History Management
 * Gerencia o histórico de comparações de simulações com persistência em localStorage
 */

export interface ComparisonRecord {
  id: string;
  timestamp: number;
  name: string;
  description: string;
  sim1: {
    name: string;
    base: number;
    height: number;
    length: number;
    totalCost: number;
    costPerM2: number;
    utilization: number;
  };
  sim2: {
    name: string;
    base: number;
    height: number;
    length: number;
    totalCost: number;
    costPerM2: number;
    utilization: number;
  };
  analysis: {
    bestOption: string;
    recommendation: string;
    costDifference: number;
  };
  companyName?: string;
}

const STORAGE_KEY = 'chale-comparison-history';
const MAX_RECORDS = 50; // Máximo de registros a manter

/**
 * Salva uma comparação no histórico
 */
export function saveComparison(record: Omit<ComparisonRecord, 'id' | 'timestamp'>): ComparisonRecord {
  const history = getHistory();
  
  const newRecord: ComparisonRecord = {
    ...record,
    id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  
  // Adiciona no início do array
  history.unshift(newRecord);
  
  // Mantém apenas os últimos MAX_RECORDS
  if (history.length > MAX_RECORDS) {
    history.splice(MAX_RECORDS);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newRecord;
}

/**
 * Recupera o histórico completo de comparações
 */
export function getHistory(): ComparisonRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao recuperar histórico:', error);
    return [];
  }
}

/**
 * Recupera uma comparação específica pelo ID
 */
export function getComparisonById(id: string): ComparisonRecord | null {
  const history = getHistory();
  return history.find(record => record.id === id) || null;
}

/**
 * Deleta uma comparação do histórico
 */
export function deleteComparison(id: string): boolean {
  const history = getHistory();
  const filtered = history.filter(record => record.id !== id);
  
  if (filtered.length === history.length) {
    return false; // Não encontrou
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Limpa todo o histórico
 */
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Exporta o histórico como JSON
 */
export function exportHistory(): string {
  const history = getHistory();
  return JSON.stringify(history, null, 2);
}

/**
 * Importa histórico de um arquivo JSON
 */
export function importHistory(jsonData: string): boolean {
  try {
    const imported = JSON.parse(jsonData);
    
    if (!Array.isArray(imported)) {
      throw new Error('Formato inválido: esperado um array');
    }
    
    // Validação básica
    const valid = imported.every(record => 
      record.id && 
      record.timestamp && 
      record.name && 
      record.sim1 && 
      record.sim2 && 
      record.analysis
    );
    
    if (!valid) {
      throw new Error('Alguns registros estão incompletos');
    }
    
    const history = getHistory();
    const merged = [...imported, ...history];
    
    // Remove duplicatas e mantém limite
    const unique = Array.from(
      new Map(merged.map(item => [item.id, item])).values()
    ).slice(0, MAX_RECORDS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    return true;
  } catch (error) {
    console.error('Erro ao importar histórico:', error);
    return false;
  }
}

/**
 * Formata a data de um registro para exibição
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calcula estatísticas do histórico
 */
export function getHistoryStats() {
  const history = getHistory();
  
  if (history.length === 0) {
    return {
      totalComparisons: 0,
      averageCostDifference: 0,
      mostCommonBestOption: '',
    };
  }
  
  const totalComparisons = history.length;
  const averageCostDifference = history.reduce((sum, record) => sum + Math.abs(record.analysis.costDifference), 0) / totalComparisons;
  
  // Conta qual simulação foi mais frequentemente a melhor
  const bestOptions = history.map(r => r.analysis.bestOption);
  const mostCommon = bestOptions.reduce((a, b) => 
    bestOptions.filter(x => x === a).length > bestOptions.filter(x => x === b).length ? a : b
  );
  
  return {
    totalComparisons,
    averageCostDifference: Math.round(averageCostDifference * 100) / 100,
    mostCommonBestOption: mostCommon,
  };
}
