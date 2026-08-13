import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './authUtils';

describe('segurança de hash de senha (scrypt)', () => {
  it('gera hash seguro e valida senha correta com sucesso', async () => {
    const password = 'MinhaSenhaSegura123!';
    const hashed = await hashPassword(password);

    expect(hashed).not.toBe(password);
    expect(hashed).toContain(':');

    const isValid = await verifyPassword(password, hashed);
    expect(isValid).toBe(true);
  });

  it('rejeita senha incorreta', async () => {
    const password = 'MinhaSenhaSegura123!';
    const hashed = await hashPassword(password);

    const isValid = await verifyPassword('SenhaErrada', hashed);
    expect(isValid).toBe(false);
  });
});
