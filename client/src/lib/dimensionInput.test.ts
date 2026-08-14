import { describe, expect, it } from 'vitest';
import { parseDimensionInput } from './dimensionInput';

describe('parseDimensionInput', () => {
  it('aceita vírgula e ponto como separador decimal', () => {
    expect(parseDimensionInput('3,50')).toBe(3.5);
    expect(parseDimensionInput('6.25')).toBe(6.25);
  });

  it('permite medidas acima de 10 metros', () => {
    expect(parseDimensionInput('25,75')).toBe(25.75);
  });

  it('mantém o fallback para texto vazio, negativo ou inválido', () => {
    expect(parseDimensionInput('', 4)).toBe(4);
    expect(parseDimensionInput('-2', 4)).toBe(4);
    expect(parseDimensionInput('medida', 4)).toBe(4);
  });
});
