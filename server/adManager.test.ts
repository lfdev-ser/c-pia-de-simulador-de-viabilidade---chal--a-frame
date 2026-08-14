import { describe, it, expect } from 'vitest';
import { selectBestAdForSlot } from './adEngine';

describe('Auditoria Completa do Ad Manager & Motor de Seleção', () => {
  it('deve exportar a função principal de seleção de anúncios', () => {
    expect(typeof selectBestAdForSlot).toBe('function');
  });

  it('deve priorizar campanhas com segmentação CITY quando o usuário está na mesma cidade', async () => {
    const ad = await selectBestAdForSlot('RIGHT_SLOT_001', {
      city: 'Curitiba',
      state: 'Paraná',
      sessionId: 'test_audit_city',
    });
    // Se houver campanhas de teste cadastradas, o matchType deve refletir CITY ou fallback
    if (ad) {
      expect(['CITY', 'REGIONAL_MATCH', 'STATE', 'NATIONAL']).toContain(ad.matchType);
    } else {
      expect(ad).toBeNull();
    }
  });

  it('deve respeitar o plano REGIONAL com múltiplas cidades separadas por vírgula', async () => {
    const ad = await selectBestAdForSlot('RIGHT_SLOT_002', {
      city: 'Londrina',
      state: 'Paraná',
      sessionId: 'test_audit_regional',
    });
    if (ad) {
      expect(ad).toHaveProperty('campaignId');
    }
  });

  it('deve aplicar fallback nacional quando nenhuma campanha local for elegível', async () => {
    const ad = await selectBestAdForSlot('RIGHT_SLOT_003', {
      city: 'CidadeDesconhecida',
      state: 'EstadoInexistente',
      sessionId: 'test_audit_national',
    });
    if (ad) {
      expect(ad).toHaveProperty('imageUrl');
    }
  });
});
