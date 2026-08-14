import { describe, expect, it, vi } from 'vitest';
import { appRouter } from './routers';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

vi.mock('./db', () => ({
  listActiveSponsors: vi.fn(async () => [
    { id: 1, name: 'Parceiro A', title: 'Blocos EPS Top', description: 'Melhor EPS', imageUrl: 'https://example.com/logo.png', externalLink: 'https://example.com', displayOrder: 0, isActive: 1 }
  ]),
  listSponsors: vi.fn(async () => [
    { id: 1, name: 'Parceiro A', title: 'Blocos EPS Top', description: 'Melhor EPS', imageUrl: 'https://example.com/logo.png', externalLink: 'https://example.com', displayOrder: 0, isActive: 1 }
  ]),
  createSponsor: vi.fn(async () => 2),
  deleteSponsor: vi.fn(async () => {}),
  updateSponsor: vi.fn(async () => {}),
  getDb: vi.fn(async () => ({})),
}));

describe('Sponsors API Router', () => {
  it('allows public users to list active sponsors', async () => {
    const caller = appRouter.createCaller({
      user: undefined,
      req: {} as any,
      res: {} as any,
    });

    const sponsors = await caller.admin.listSponsors();
    expect(sponsors).toHaveLength(1);
    expect(sponsors[0].name).toBe('Parceiro A');
  });

  it('allows admins to list all sponsors', async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: 'admin1', role: 'admin', email: 'admin@test.com' } as any,
      req: {} as any,
      res: {} as any,
    });

    const sponsors = await caller.admin.listAllSponsors();
    expect(sponsors).toHaveLength(1);
  });
});
