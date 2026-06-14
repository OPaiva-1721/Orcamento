import { EventEmitter2 } from '@nestjs/event-emitter';
import { ORCAMENTO_STATUS } from '@orcamento/shared-types';
import { CreateOrcamentoUseCase } from './create-orcamento.use-case';
import { CreateOrcamentoDto } from './create-orcamento.dto';
import { IOrcamentoRepository } from '../../../../domain/orcamento/repositories/orcamento.repository.interface';
import { IClienteRepository } from '../../../../domain/cliente/repositories/cliente.repository.interface';
import { IDestinatarioRepository } from '../../../../domain/destinatario/repositories/destinatario.repository.interface';
import { StatusTransitionDomainService } from '../../../../domain/orcamento/domain-services/status-transition.domain-service';
import { ClienteNotFoundException } from '../../../../domain/cliente/exceptions/cliente-not-found.exception';

describe('CreateOrcamentoUseCase (escopo multi-tenant)', () => {
  let orcamentoRepo: jest.Mocked<IOrcamentoRepository>;
  let clienteRepo: jest.Mocked<IClienteRepository>;
  let destRepo: jest.Mocked<IDestinatarioRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let useCase: CreateOrcamentoUseCase;

  const ownerId = 'owner-abc';
  const baseDto: CreateOrcamentoDto = {
    descricao: 'Serviço X',
    preco: 100,
    formaPagamento: false,
    dataInicio: '2026-01-01',
    clienteId: 1,
    destinatarioIds: [],
  };

  beforeEach(() => {
    orcamentoRepo = {
      create: jest.fn(),
    } as unknown as jest.Mocked<IOrcamentoRepository>;
    clienteRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IClienteRepository>;
    destRepo = {
      findByIds: jest.fn(),
    } as unknown as jest.Mocked<IDestinatarioRepository>;
    eventEmitter = { emit: jest.fn() } as unknown as jest.Mocked<EventEmitter2>;

    useCase = new CreateOrcamentoUseCase(
      orcamentoRepo,
      clienteRepo,
      destRepo,
      new StatusTransitionDomainService(),
      eventEmitter,
    );
  });

  it('rejeita quando o cliente não pertence ao owner (findById retorna null)', async () => {
    clienteRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(baseDto, ownerId)).rejects.toBeInstanceOf(
      ClienteNotFoundException,
    );
    expect(clienteRepo.findById).toHaveBeenCalledWith(
      baseDto.clienteId,
      ownerId,
    );
    expect(orcamentoRepo.create).not.toHaveBeenCalled();
  });

  it('cria o orçamento e dispara o evento quando o cliente pertence ao owner', async () => {
    clienteRepo.findById.mockResolvedValue({ id: 1, ownerId } as any);
    orcamentoRepo.create.mockResolvedValue({ id: 42 } as any);

    const result = await useCase.execute(baseDto, ownerId);

    expect(result.id).toBe(42);
    // o ownerId é propagado para o repositório (escopo de tenant)
    expect(orcamentoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: ORCAMENTO_STATUS.PENDENTE }),
      ownerId,
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'orcamento.created',
      expect.objectContaining({ orcamentoId: 42, ownerId }),
    );
  });
});
