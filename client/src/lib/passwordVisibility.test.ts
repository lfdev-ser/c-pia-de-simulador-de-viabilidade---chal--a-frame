import { describe, expect, it } from 'vitest';
import { getPasswordInputType } from './passwordVisibility';

describe('getPasswordInputType', () => {
  it('mantém a senha oculta por padrão', () => {
    expect(getPasswordInputType(false)).toBe('password');
  });

  it('exibe a senha quando a visibilidade está ativada', () => {
    expect(getPasswordInputType(true)).toBe('text');
  });
});
