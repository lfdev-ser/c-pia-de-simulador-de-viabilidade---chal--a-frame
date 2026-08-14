import { describe, it, expect } from 'vitest';
import { selectBestAdForSlot } from './adEngine';

describe('Ad Manager & Geolocalização Engine', () => {
  it('deve exportar a função de seleção de anúncios', () => {
    expect(typeof selectBestAdForSlot).toBe('function');
  });

  it('deve retornar null ou objeto válido ao consultar um slot com contexto geográfico', async () => {
    const result = await selectBestAdForSlot('RIGHT_SLOT_001', {
      city: 'Curitiba',
      state: 'Paraná',
      sessionId: 'test_session_1',
    });
    // Se houver campanhas cadastradas, retorna criativo; se não, null sem quebrar
    if (result) {
      expect(result).toHaveProperty('campaignId');
      expect(result).toHaveProperty('imageUrl');
      expect(result).toHaveProperty('matchType');
    } else {
      expect(result).toBeNull();
    }
  });
});
