import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { OrcamentosController } from './orcamentos.controller';
import { CreateOrcamentoUseCase } from '../../../application/orcamento/use-cases/create-orcamento/create-orcamento.use-case';
import { UpdateOrcamentoUseCase } from '../../../application/orcamento/use-cases/update-orcamento/update-orcamento.use-case';
import { DeleteOrcamentoUseCase } from '../../../application/orcamento/use-cases/delete-orcamento/delete-orcamento.use-case';
import { FindOrcamentoByIdUseCase } from '../../../application/orcamento/use-cases/find-orcamento/find-orcamento-by-id.use-case';
import { ListOrcamentosUseCase } from '../../../application/orcamento/use-cases/find-orcamento/list-orcamentos.use-case';
import { ClientesController } from '../clientes/clientes.controller';
import { CreateClienteUseCase } from '../../../application/cliente/use-cases/create-cliente/create-cliente.use-case';
import { UpdateClienteUseCase } from '../../../application/cliente/use-cases/update-cliente/update-cliente.use-case';
import { DeleteClienteUseCase } from '../../../application/cliente/use-cases/delete-cliente/delete-cliente.use-case';
import { FindClienteByIdUseCase } from '../../../application/cliente/use-cases/find-cliente/find-cliente-by-id.use-case';
import { ListClientesUseCase } from '../../../application/cliente/use-cases/find-cliente/list-clientes.use-case';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { AllExceptionsFilter } from '../filters/all-exceptions.filter';
import { OrcamentoNotFoundException } from '../../../domain/orcamento/exceptions/orcamento-not-found.exception';
import { ClienteNotFoundException } from '../../../domain/cliente/exceptions/cliente-not-found.exception';
import { ForbiddenResourceException } from '../../../domain/shared/exceptions/forbidden-resource.exception';

/** Guard que lê X-UID para simular usuários diferentes sem Firebase. */
class UidHeaderGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const uid = req.headers['x-uid'] ?? 'default-uid';
    req.user = { uid, email: `${uid}@test.com`, name: uid };
    return true;
  }
}

async function buildApp(
  extraProviders: Record<string, unknown>[],
): Promise<INestApplication<App>> {
  const module = await Test.createTestingModule({
    controllers: [OrcamentosController, ClientesController],
    providers: [
      { provide: APP_GUARD, useClass: UidHeaderGuard },
      { provide: APP_FILTER, useClass: AllExceptionsFilter },
      { provide: APP_FILTER, useClass: DomainExceptionFilter },
      ...extraProviders,
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  await app.init();
  return app;
}

describe('Ownership — controllers (integração HTTP)', () => {
  let app: INestApplication<App>;

  afterEach(async () => {
    await app?.close();
  });

  describe('GET /orcamentos/:id — acesso cross-tenant', () => {
    it('retorna 404 quando orçamento não pertence ao uid do request', async () => {
      const findOrcamento = { execute: jest.fn().mockRejectedValue(new OrcamentoNotFoundException(42)) };
      app = await buildApp([
        { provide: FindOrcamentoByIdUseCase, useValue: findOrcamento },
        { provide: CreateOrcamentoUseCase, useValue: {} },
        { provide: UpdateOrcamentoUseCase, useValue: {} },
        { provide: DeleteOrcamentoUseCase, useValue: {} },
        { provide: ListOrcamentosUseCase, useValue: {} },
        { provide: CreateClienteUseCase, useValue: {} },
        { provide: UpdateClienteUseCase, useValue: {} },
        { provide: DeleteClienteUseCase, useValue: {} },
        { provide: FindClienteByIdUseCase, useValue: {} },
        { provide: ListClientesUseCase, useValue: {} },
      ]);

      await request(app.getHttpServer())
        .get('/orcamentos/42')
        .set('x-uid', 'owner-B')
        .expect(404);

      expect(findOrcamento.execute).toHaveBeenCalledWith(42, 'owner-B');
    });
  });

  describe('PUT /orcamentos/:id — acesso cross-tenant', () => {
    it('retorna 404 quando orçamento não pertence ao uid do request', async () => {
      const updateOrcamento = { execute: jest.fn().mockRejectedValue(new OrcamentoNotFoundException(10)) };
      app = await buildApp([
        { provide: FindOrcamentoByIdUseCase, useValue: {} },
        { provide: CreateOrcamentoUseCase, useValue: {} },
        { provide: UpdateOrcamentoUseCase, useValue: updateOrcamento },
        { provide: DeleteOrcamentoUseCase, useValue: {} },
        { provide: ListOrcamentosUseCase, useValue: {} },
        { provide: CreateClienteUseCase, useValue: {} },
        { provide: UpdateClienteUseCase, useValue: {} },
        { provide: DeleteClienteUseCase, useValue: {} },
        { provide: FindClienteByIdUseCase, useValue: {} },
        { provide: ListClientesUseCase, useValue: {} },
      ]);

      await request(app.getHttpServer())
        .put('/orcamentos/10')
        .set('x-uid', 'owner-B')
        .send({})
        .expect(404);

      expect(updateOrcamento.execute).toHaveBeenCalledWith(10, expect.anything(), 'owner-B');
    });
  });

  describe('DELETE /clientes/:id — acesso cross-tenant', () => {
    it('retorna 404 quando cliente não pertence ao uid do request', async () => {
      const deleteCliente = { execute: jest.fn().mockRejectedValue(new ClienteNotFoundException(7)) };
      app = await buildApp([
        { provide: FindOrcamentoByIdUseCase, useValue: {} },
        { provide: CreateOrcamentoUseCase, useValue: {} },
        { provide: UpdateOrcamentoUseCase, useValue: {} },
        { provide: DeleteOrcamentoUseCase, useValue: {} },
        { provide: ListOrcamentosUseCase, useValue: {} },
        { provide: CreateClienteUseCase, useValue: {} },
        { provide: UpdateClienteUseCase, useValue: {} },
        { provide: DeleteClienteUseCase, useValue: deleteCliente },
        { provide: FindClienteByIdUseCase, useValue: {} },
        { provide: ListClientesUseCase, useValue: {} },
      ]);

      await request(app.getHttpServer())
        .delete('/clientes/7')
        .set('x-uid', 'owner-B')
        .expect(404);

      expect(deleteCliente.execute).toHaveBeenCalledWith(7, 'owner-B');
    });
  });

  describe('POST /orcamentos — cliente de outro owner → 403', () => {
    it('retorna 403 quando use case lança ForbiddenResourceException', async () => {
      const createOrcamento = {
        execute: jest.fn().mockRejectedValue(new ForbiddenResourceException('Cliente não pertence ao usuário')),
      };
      app = await buildApp([
        { provide: FindOrcamentoByIdUseCase, useValue: {} },
        { provide: CreateOrcamentoUseCase, useValue: createOrcamento },
        { provide: UpdateOrcamentoUseCase, useValue: {} },
        { provide: DeleteOrcamentoUseCase, useValue: {} },
        { provide: ListOrcamentosUseCase, useValue: {} },
        { provide: CreateClienteUseCase, useValue: {} },
        { provide: UpdateClienteUseCase, useValue: {} },
        { provide: DeleteClienteUseCase, useValue: {} },
        { provide: FindClienteByIdUseCase, useValue: {} },
        { provide: ListClientesUseCase, useValue: {} },
      ]);

      await request(app.getHttpServer())
        .post('/orcamentos')
        .set('x-uid', 'owner-B')
        .send({
          descricao: 'Test',
          preco: 100,
          formaPagamento: false,
          dataInicio: '2026-01-01',
          clienteId: 99,
          destinatarioIds: [],
        })
        .expect(403);

      expect(createOrcamento.execute).toHaveBeenCalledWith(
        expect.anything(),
        'owner-B',
      );
    });
  });
});
