import { ORCAMENTO_STATUS } from '@orcamento/shared-types';
import { GetDashboardStatsUseCase } from './get-dashboard-stats.use-case';
import { IOrcamentoRepository } from '../../../domain/orcamento/repositories/orcamento.repository.interface';
import { IClienteRepository } from '../../../domain/cliente/repositories/cliente.repository.interface';
import { IDestinatarioRepository } from '../../../domain/destinatario/repositories/destinatario.repository.interface';

function paginated<T>(total: number, data: T[] = []) {
  return { data, total, page: 1, limit: data.length, totalPages: 1 };
}

describe('GetDashboardStatsUseCase', () => {
  let orcamentoRepo: jest.Mocked<IOrcamentoRepository>;
  let clienteRepo: jest.Mocked<IClienteRepository>;
  let destRepo: jest.Mocked<IDestinatarioRepository>;
  let useCase: GetDashboardStatsUseCase;

  const ownerId = 'owner-123';

  beforeEach(() => {
    orcamentoRepo = {
      findAll: jest.fn(),
      getStatusAggregate: jest.fn(),
    } as unknown as jest.Mocked<IOrcamentoRepository>;
    clienteRepo = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<IClienteRepository>;
    destRepo = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<IDestinatarioRepository>;

    useCase = new GetDashboardStatsUseCase(
      orcamentoRepo,
      clienteRepo,
      destRepo,
    );
  });

  it('usa a agregação do banco para o valor total aprovado (sem teto de 100)', async () => {
    clienteRepo.findAll.mockResolvedValue(paginated(7));
    destRepo.findAll.mockResolvedValue(paginated(12));
    orcamentoRepo.findAll.mockResolvedValue(paginated(250, [{ id: 1 }] as any));
    orcamentoRepo.getStatusAggregate.mockResolvedValue({
      total: 180,
      valorTotal: 999999.99,
    });

    const stats = await useCase.execute(ownerId);

    expect(orcamentoRepo.getStatusAggregate).toHaveBeenCalledWith(
      ownerId,
      ORCAMENTO_STATUS.APROVADO,
    );
    expect(stats.totalClientes).toBe(7);
    expect(stats.totalDestinatarios).toBe(12);
    expect(stats.totalOrcamentos).toBe(250);
    expect(stats.totalOrcamentosAprovados).toBe(180);
    // valor vem da agregação, não de soma em memória limitada
    expect(stats.valorTotalAprovado).toBe(999999.99);
  });

  it('escopa todas as consultas pelo ownerId', async () => {
    clienteRepo.findAll.mockResolvedValue(paginated(0));
    destRepo.findAll.mockResolvedValue(paginated(0));
    orcamentoRepo.findAll.mockResolvedValue(paginated(0));
    orcamentoRepo.getStatusAggregate.mockResolvedValue({
      total: 0,
      valorTotal: 0,
    });

    await useCase.execute(ownerId);

    expect(clienteRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId }),
    );
    expect(destRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId }),
    );
    expect(orcamentoRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId }),
    );
  });
});
