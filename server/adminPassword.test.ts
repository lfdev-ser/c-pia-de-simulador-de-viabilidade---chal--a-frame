import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './authUtils';

describe('Segurança de Senha do Administrador (Scrypt Hash)', () => {
  it('deve gerar hash scrypt seguro e verificar corretamente', async () => {
    const password = 'AdminSecurePassword123!';
    const hashed = await hashPassword(password);
    expect(hashed).toBeTypeOf('string');
    expect(hashed).not.toBe(password);

    const isValid = await verifyPassword(password, hashed);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword('WrongPassword', hashed);
    expect(isInvalid).toBe(false);
  });
});
