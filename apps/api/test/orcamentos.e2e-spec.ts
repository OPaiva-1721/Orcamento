/**
 * E2E — fluxo crítico de orçamentos
 *
 * Usa TestingModule com use cases reais + repositórios mockados + guard de UID via header.
 * Não exige Firebase, PostgreSQL nem variáveis de ambiente externas.
 */
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import request from 'supertest';
import { App } from 'supertest/types';
import { ORCAMENTO_STATUS } from '@orcamento/shared-types';

import { OrcamentosController } from '../src/presentation/http/orcamentos/orcamentos.controller';
import { CreateOrcamentoUseCase } from '../src/application/orcamento/use-cases/create-orcamento/create-orcamento.use-case';
import { UpdateOrcamentoUseCase } from '../src/application/orcamento/use-cases/update-orcamento/update-orcamento.use-case';
import { DeleteOrcamentoUseCase } from '../src/application/orcamento/use-cases/delete-orcamento/delete-orcamento.use-case';
import { FindOrcamentoByIdUseCase } from '../src/application/orcamento/use-cases/find-orcamento/find-orcamento-by-id.use-case';
import { ListOrcamentosUseCase } from '../src/application/orcamento/use-cases/find-orcamento/list-orcamentos.use-case';
import { StatusTransitionDomainService } from '../src/domain/orcamento/domain-services/status-transition.domain-service';
import { ORCAMENTO_REPOSITORY } from '../src/domain/orcamento/repositories/orcamento.repository.interface';
import { CLIENTE_REPOSITORY } from '../src/domain/cliente/repositories/cliente.repository.interface';
import { DESTINATARIO_REPOSITORY } from '../src/domain/destinatario/repositories/destinatario.repository.interface';
import { DomainExceptionFilter } from '../src/presentation/http/filters/domain-exception.filter';
import { AllExceptionsFilter } from '../src/presentation/http/filters/all-exceptions.filter';
import { ResponseTransformInterceptor } from '../src/presentation/http/interceptors/response-transform.interceptor';
import { ResourceNotFoundException } from '../src/domain/shared/exceptions/resource-not-found.exception';

class UidHeaderGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    req.user = { uid: req.headers['x-uid'] ?? 'default-uid' };
    return true;
  }
}

describe('Orçamentos — fluxo crítico (e2e)', () => {
  let app: INestApplication<App>;

  // Repositório em memória mínimo para o fluxo
  let store: Map<number, { id: number; status: string; clienteId: number; ownerId: string }>;
  let nextId: number;
  let orcamentoRepo: Record<string, jest.Mock>;
  let clienteRepo: Record<string, jest.Mock>;
  let destRepo: Record<string, jest.Mock>;

  beforeEach(async () => {
    store = new Map();
    nextId = 1;

    orcamentoRepo = {
      create: jest.fn(async (data: any, ownerId: string) => {
        const id = nextId++;
        const o = {
          id,
          ...data,
          status: data.status ?? ORCAMENTO_STATUS.PENDENTE,
          ownerId,
          cliente: { id: data.clienteId, nome: 'Acme', ownerId },
          destinatarios: [],
          emailsEnviados: [],
          statusHistory: data.initialHistoryEntries ?? [],
        };
        store.set(id, o);
        return o;
      }),
      findById: jest.fn(async (id: number, ownerId: string) => {
        const o = store.get(id);
        if (!o || o.ownerId !== ownerId) return null;
        return o;
      }),
      update: jest.fn(async (id: number, ownerId: string, data: any) => {
        const o = store.get(id);
        if (!o || o.ownerId !== ownerId) throw new ResourceNotFoundException('Orçamento não encontrado');
        const updated = { ...o, ...data };
        store.set(id, updated);
        return updated;
      }),
      delete: jest.fn(async (id: number, ownerId: string) => {
        const o = store.get(id);
        if (!o || o.ownerId !== ownerId) throw new ResourceNotFoundException('Orçamento não encontrado');
        store.delete(id);
      }),
      findAll: jest.fn(async () => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 })),
      getStatusAggregate: jest.fn(async () => ({ total: 0, valorTotal: 0 })),
    };

    clienteRepo = {
      findById: jest.fn(async (id: number, ownerId: string) => {
        if (id === 1 && ownerId === 'user-A') {
          return { id: 1, nome: 'Acme', ownerId };
        }
        return null;
      }),
    };

    destRepo = {
      findByIds: jest.fn(async () => []),
    };

    const module = await Test.createTestingModule({
      controllers: [OrcamentosController],
      providers: [
        { provide: APP_GUARD, useClass: UidHeaderGuard },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_FILTER, useClass: DomainExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
        { provide: ORCAMENTO_REPOSITORY, useValue: orcamentoRepo },
        { provide: CLIENTE_REPOSITORY, useValue: clienteRepo },
        { provide: DESTINATARIO_REPOSITORY, useValue: destRepo },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        StatusTransitionDomainService,
        CreateOrcamentoUseCase,
        UpdateOrcamentoUseCase,
        DeleteOrcamentoUseCase,
        FindOrcamentoByIdUseCase,
        ListOrcamentosUseCase,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('passo 1 — cria orçamento com status Pendente', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/orcamentos')
      .set('x-uid', 'user-A')
      .send({
        descricao: 'Serviço de TI',
        preco: 1500,
        formaPagamento: false,
        dataInicio: '2026-01-01',
        clienteId: 1,
        destinatarioIds: [],
      })
      .expect(201);

    expect(body.data.status).toBe(ORCAMENTO_STATUS.PENDENTE);
    expect(body.data.id).toBeDefined();
  });

  it('passo 2 — busca orçamento criado e confirma dados', async () => {
    // Cria primeiro
    const { body: created } = await request(app.getHttpServer())
      .post('/orcamentos')
      .set('x-uid', 'user-A')
      .send({
        descricao: 'Serviço de TI',
        preco: 1500,
        formaPagamento: false,
        dataInicio: '2026-01-01',
        clienteId: 1,
        destinatarioIds: [],
      })
      .expect(201);

    const id: number = created.data.id;

    const { body } = await request(app.getHttpServer())
      .get(`/orcamentos/${id}`)
      .set('x-uid', 'user-A')
      .expect(200);

    expect(body.data.id).toBe(id);
    expect(body.data.status).toBe(ORCAMENTO_STATUS.PENDENTE);
  });

  it('passo 3 — user-B não consegue acessar orçamento de user-A (isolamento)', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/orcamentos')
      .set('x-uid', 'user-A')
      .send({
        descricao: 'Serviço de TI',
        preco: 1500,
        formaPagamento: false,
        dataInicio: '2026-01-01',
        clienteId: 1,
        destinatarioIds: [],
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/orcamentos/${created.data.id}`)
      .set('x-uid', 'user-B')
      .expect(404);
  });

  it('passo 4 — atualiza status para Aprovado (transição válida RN-01)', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/orcamentos')
      .set('x-uid', 'user-A')
      .send({
        descricao: 'Serviço de TI',
        preco: 1500,
        formaPagamento: false,
        dataInicio: '2026-01-01',
        clienteId: 1,
        destinatarioIds: [],
      })
      .expect(201);

    const id: number = created.data.id;

    const { body } = await request(app.getHttpServer())
      .put(`/orcamentos/${id}`)
      .set('x-uid', 'user-A')
      .send({ status: ORCAMENTO_STATUS.APROVADO })
      .expect(200);

    expect(body.data.status).toBe(ORCAMENTO_STATUS.APROVADO);
  });

  it('passo 5 — RN-01: status Concluído persiste como Aprovado', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/orcamentos')
      .set('x-uid', 'user-A')
      .send({
        descricao: 'Serviço de TI',
        preco: 1500,
        formaPagamento: false,
        dataInicio: '2026-01-01',
        dataTermino: '2026-06-01',
        clienteId: 1,
        destinatarioIds: [],
      })
      .expect(201);

    const id: number = created.data.id;

    const { body } = await request(app.getHttpServer())
      .put(`/orcamentos/${id}`)
      .set('x-uid', 'user-A')
      .send({ status: ORCAMENTO_STATUS.CONCLUIDO, dataTermino: '2026-06-01' })
      .expect(200);

    // RN-01: Concluído é persistido como Aprovado
    expect(body.data.status).toBe(ORCAMENTO_STATUS.APROVADO);
  });

  it('passo 6 — status inválido retorna 400 (validado no DTO antes do domínio)', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post('/orcamentos')
      .set('x-uid', 'user-A')
      .send({
        descricao: 'Serviço de TI',
        preco: 1500,
        formaPagamento: false,
        dataInicio: '2026-01-01',
        clienteId: 1,
        destinatarioIds: [],
      })
      .expect(201);

    await request(app.getHttpServer())
      .put(`/orcamentos/${created.data.id}`)
      .set('x-uid', 'user-A')
      .send({ status: 'StatusInvalido' })
      .expect(400);
  });
});
