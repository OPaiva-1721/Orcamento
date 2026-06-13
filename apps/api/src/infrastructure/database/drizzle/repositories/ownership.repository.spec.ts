import { OrcamentoDrizzleRepository } from './orcamento.drizzle.repository';
import { DestinatarioDrizzleRepository } from './destinatario.drizzle.repository';
import { ForbiddenResourceException } from '../../../../domain/shared/exceptions/forbidden-resource.exception';

function makeMockDb(overrides: Record<string, unknown> = {}) {
  return {
    query: {
      orcamentos: { findFirst: jest.fn(), findMany: jest.fn() },
      clientes: { findFirst: jest.fn() },
      destinatarios: { findFirst: jest.fn(), findMany: jest.fn() },
    },
    transaction: jest.fn(),
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  } as any;
}

describe('Ownership — repositórios (unit, db mockado)', () => {
  describe('OrcamentoDrizzleRepository.findById', () => {
    it('retorna null quando orcamento pertence a outro owner (verificação in-code)', async () => {
      const db = makeMockDb();
      db.query.orcamentos.findFirst.mockResolvedValue({
        id: 1,
        cliente: { ownerId: 'owner-A' },
        destinatarios: [],
        emailsEnviados: [],
        statusHistory: [],
      });

      const repo = new OrcamentoDrizzleRepository(db);
      const result = await repo.findById(1, 'owner-B');

      expect(result).toBeNull();
      expect(db.query.orcamentos.findFirst).toHaveBeenCalledTimes(1);
    });

    it('retorna o orçamento quando owner confere', async () => {
      const db = makeMockDb();
      const row = {
        id: 1,
        cliente: { ownerId: 'owner-A' },
        destinatarios: [],
        emailsEnviados: [],
        statusHistory: [],
      };
      db.query.orcamentos.findFirst.mockResolvedValue(row);

      const repo = new OrcamentoDrizzleRepository(db);
      const result = await repo.findById(1, 'owner-A');

      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
    });
  });

  describe('OrcamentoDrizzleRepository.create', () => {
    it('lança ForbiddenResourceException quando cliente pertence a outro owner', async () => {
      const mockTx = {
        query: {
          clientes: { findFirst: jest.fn().mockResolvedValue(null) },
        },
      };
      const db = makeMockDb();
      db.transaction.mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      const repo = new OrcamentoDrizzleRepository(db);

      await expect(
        repo.create(
          {
            descricao: 'Test',
            preco: 100,
            status: 'Pendente' as any,
            formaPagamento: false,
            dataInicio: '2026-01-01',
            clienteId: 99,
          },
          'owner-B',
        ),
      ).rejects.toBeInstanceOf(ForbiddenResourceException);
    });
  });

  describe('DestinatarioDrizzleRepository.findById', () => {
    it('retorna null quando destinatário pertence a outro owner (verificação in-code)', async () => {
      const db = makeMockDb();
      db.query.destinatarios.findFirst.mockResolvedValue({
        id: 5,
        cliente: { ownerId: 'owner-A' },
      });

      const repo = new DestinatarioDrizzleRepository(db);
      const result = await repo.findById(5, 'owner-B');

      expect(result).toBeNull();
    });

    it('retorna o destinatário quando owner confere', async () => {
      const db = makeMockDb();
      const row = { id: 5, cliente: { ownerId: 'owner-A' } };
      db.query.destinatarios.findFirst.mockResolvedValue(row);

      const repo = new DestinatarioDrizzleRepository(db);
      const result = await repo.findById(5, 'owner-A');

      expect(result).toEqual(row);
    });
  });

  describe('DestinatarioDrizzleRepository.create', () => {
    it('lança ForbiddenResourceException quando cliente pertence a outro owner', async () => {
      const db = makeMockDb();
      db.query.clientes.findFirst.mockResolvedValue(null);

      const repo = new DestinatarioDrizzleRepository(db);

      await expect(
        repo.create({ nome: 'Test', email: 'test@x.com', clienteId: 99 }, 'owner-B'),
      ).rejects.toBeInstanceOf(ForbiddenResourceException);
    });
  });
});
