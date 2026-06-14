import { Inject, Injectable } from '@nestjs/common';
import { eq, count, and, desc, sum } from 'drizzle-orm';
import {
  clientes,
  orcamentos,
  orcamentosDestinatarios,
  statusHistory,
  type Database,
} from '@orcamento/db';
import {
  Orcamento,
  OrcamentoStatus,
  ORCAMENTO_STATUS,
  OrcamentoFilters,
  PaginatedResponse,
} from '@orcamento/shared-types';
import {
  IOrcamentoRepository,
  CreateOrcamentoWithHistory,
  UpdateOrcamentoWithHistory,
} from '../../../../domain/orcamento/repositories/orcamento.repository.interface';
import { DRIZZLE_CONNECTION } from '../drizzle.constants';
import { ForbiddenResourceException } from '../../../../domain/shared/exceptions/forbidden-resource.exception';
import { ResourceNotFoundException } from '../../../../domain/shared/exceptions/resource-not-found.exception';

@Injectable()
export class OrcamentoDrizzleRepository implements IOrcamentoRepository {
  constructor(@Inject(DRIZZLE_CONNECTION) private readonly db: Database) {}

  async findById(id: number, ownerId: string): Promise<Orcamento | null> {
    const row = await this.db.query.orcamentos.findFirst({
      where: eq(orcamentos.id, id),
      with: {
        cliente: true,
        destinatarios: { with: { destinatario: true } },
        emailsEnviados: { with: { destinatario: true } },
        statusHistory: true,
      },
    });
    if (!row) return null;
    if (row.cliente?.ownerId !== ownerId) return null;
    return this.mapRow(row);
  }

  async findAll(
    filters: OrcamentoFilters,
  ): Promise<PaginatedResponse<Orcamento>> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 10, 100);
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(clientes.ownerId, filters.ownerId)];
    if (filters.clienteId)
      conditions.push(eq(orcamentos.clienteId, filters.clienteId));
    if (filters.status) conditions.push(eq(orcamentos.status, filters.status));
    const whereClause = and(...conditions);

    const [idRows, [totalRow]] = await Promise.all([
      this.db
        .select({ id: orcamentos.id })
        .from(orcamentos)
        .innerJoin(clientes, eq(orcamentos.clienteId, clientes.id))
        .where(whereClause)
        .orderBy(desc(orcamentos.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ value: count() })
        .from(orcamentos)
        .innerJoin(clientes, eq(orcamentos.clienteId, clientes.id))
        .where(whereClause),
    ]);

    const ids: number[] = idRows.map((r: any) => r.id);
    const rows = ids.length
      ? await this.db.query.orcamentos.findMany({
          where: (o: any, { inArray }: any) => inArray(o.id, ids),
          with: {
            cliente: true,
            destinatarios: { with: { destinatario: true } },
            emailsEnviados: { with: { destinatario: true } },
            statusHistory: true,
          },
          orderBy: (o: any, { desc }: any) => [desc(o.createdAt)],
        })
      : [];

    const total = Number(totalRow?.value ?? 0);
    return {
      data: rows.map((r: any) => this.mapRow(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(
    data: CreateOrcamentoWithHistory,
    ownerId: string,
  ): Promise<Orcamento> {
    return this.db.transaction(async (tx: any) => {
      // Validar que cliente pertence ao owner antes inserir
      const cliente = await tx.query.clientes.findFirst({
        where: and(
          eq(clientes.id, data.clienteId),
          eq(clientes.ownerId, ownerId),
        ),
      });
      if (!cliente)
        throw new ForbiddenResourceException('Cliente não pertence ao usuário');

      const [row] = await tx
        .insert(orcamentos)
        .values({
          descricao: data.descricao,
          preco: data.preco,
          status: data.status ?? ORCAMENTO_STATUS.PENDENTE,
          formaPagamento: data.formaPagamento,
          dataInicio: new Date(data.dataInicio),
          dataTermino: data.dataTermino ? new Date(data.dataTermino) : null,
          clienteId: data.clienteId,
        })
        .returning();

      if (data.destinatarioIds?.length) {
        // Garantir que destinatários pertencem ao mesmo cliente do orçamento
        const destRows = await tx.query.destinatarios.findMany({
          where: (d: any, { inArray }: any) =>
            inArray(d.id, data.destinatarioIds),
        });
        const validDest = destRows.filter(
          (d: any) => d.clienteId === data.clienteId,
        );
        if (validDest.length !== data.destinatarioIds.length) {
          throw new ForbiddenResourceException(
            'Destinatário não pertence ao usuário',
          );
        }
        await tx.insert(orcamentosDestinatarios).values(
          data.destinatarioIds.map((did) => ({
            orcamentoId: row.id,
            destinatarioId: did,
          })),
        );
      }

      if (data.initialHistoryEntries?.length) {
        await tx.insert(statusHistory).values(
          data.initialHistoryEntries.map((e) => ({
            orcamentoId: row.id,
            status: e.status,
            observacao: e.observacao,
          })),
        );
      }

      return this.findById(row.id, ownerId) as Promise<Orcamento>;
    });
  }

  async update(
    id: number,
    ownerId: string,
    data: UpdateOrcamentoWithHistory,
  ): Promise<Orcamento> {
    return this.db.transaction(async (tx: any) => {
      const existing = await tx.query.orcamentos.findFirst({
        where: eq(orcamentos.id, id),
        with: { cliente: true },
      });
      if (!existing || existing.cliente?.ownerId !== ownerId)
        throw new ResourceNotFoundException('Orçamento não encontrado');

      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (data.descricao !== undefined) updateData.descricao = data.descricao;
      if (data.preco !== undefined) updateData.preco = data.preco;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.formaPagamento !== undefined)
        updateData.formaPagamento = data.formaPagamento;
      if (data.dataInicio !== undefined)
        updateData.dataInicio = new Date(data.dataInicio);
      if (data.dataTermino !== undefined)
        updateData.dataTermino = data.dataTermino
          ? new Date(data.dataTermino)
          : null;
      if (data.clienteId !== undefined) {
        // Não permite mover orçamento entre owners
        const novoCliente = await tx.query.clientes.findFirst({
          where: and(
            eq(clientes.id, data.clienteId),
            eq(clientes.ownerId, ownerId),
          ),
        });
        if (!novoCliente)
          throw new ForbiddenResourceException(
            'Cliente não pertence ao usuário',
          );
        updateData.clienteId = data.clienteId;
      }

      await tx.update(orcamentos).set(updateData).where(eq(orcamentos.id, id));

      if (data.destinatarioIds !== undefined) {
        await tx
          .delete(orcamentosDestinatarios)
          .where(eq(orcamentosDestinatarios.orcamentoId, id));
        if (data.destinatarioIds.length) {
          const targetClienteId = updateData.clienteId ?? existing.clienteId;
          const destRows = await tx.query.destinatarios.findMany({
            where: (d: any, { inArray }: any) =>
              inArray(d.id, data.destinatarioIds!),
          });
          const validDest = destRows.filter(
            (d: any) => d.clienteId === targetClienteId,
          );
          if (validDest.length !== data.destinatarioIds.length) {
            throw new ForbiddenResourceException(
              'Destinatário não pertence ao usuário',
            );
          }
          await tx.insert(orcamentosDestinatarios).values(
            data.destinatarioIds.map((did) => ({
              orcamentoId: id,
              destinatarioId: did,
            })),
          );
        }
      }

      if (data.newHistoryEntries?.length) {
        await tx.insert(statusHistory).values(
          data.newHistoryEntries.map((e) => ({
            orcamentoId: id,
            status: e.status,
            observacao: e.observacao,
          })),
        );
      }

      return this.findById(id, ownerId) as Promise<Orcamento>;
    });
  }

  async delete(id: number, ownerId: string): Promise<void> {
    await this.db.transaction(async (tx: any) => {
      const existing = await tx.query.orcamentos.findFirst({
        where: eq(orcamentos.id, id),
        with: { cliente: true },
      });
      if (!existing || existing.cliente?.ownerId !== ownerId)
        throw new ResourceNotFoundException('Orçamento não encontrado');
      await tx.delete(orcamentos).where(eq(orcamentos.id, id));
    });
  }

  async setDestinatarios(
    orcamentoId: number,
    destinatarioIds: number[],
    ownerId: string,
  ): Promise<void> {
    await this.db.transaction(async (tx: any) => {
      const orcamento = await tx.query.orcamentos.findFirst({
        where: eq(orcamentos.id, orcamentoId),
        with: { cliente: true },
      });
      if (!orcamento || orcamento.cliente?.ownerId !== ownerId)
        throw new ResourceNotFoundException('Orçamento não encontrado');

      if (destinatarioIds.length) {
        const destRows = await tx.query.destinatarios.findMany({
          where: (d: any, { inArray }: any) => inArray(d.id, destinatarioIds),
        });
        const validDest = destRows.filter(
          (d: any) => d.clienteId === orcamento.clienteId,
        );
        if (validDest.length !== destinatarioIds.length)
          throw new ForbiddenResourceException(
            'Destinatário não pertence ao usuário',
          );
      }

      await tx
        .delete(orcamentosDestinatarios)
        .where(eq(orcamentosDestinatarios.orcamentoId, orcamentoId));
      if (destinatarioIds.length) {
        await tx.insert(orcamentosDestinatarios).values(
          destinatarioIds.map((did) => ({
            orcamentoId,
            destinatarioId: did,
          })),
        );
      }
    });
  }

  async countByClienteId(clienteId: number, ownerId: string): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(orcamentos)
      .innerJoin(clientes, eq(orcamentos.clienteId, clientes.id))
      .where(
        and(eq(orcamentos.clienteId, clienteId), eq(clientes.ownerId, ownerId)),
      );
    return Number(row?.value ?? 0);
  }

  async getStatusAggregate(
    ownerId: string,
    status: OrcamentoStatus,
  ): Promise<{ total: number; valorTotal: number }> {
    const [row] = await this.db
      .select({ total: count(), valorTotal: sum(orcamentos.preco) })
      .from(orcamentos)
      .innerJoin(clientes, eq(orcamentos.clienteId, clientes.id))
      .where(and(eq(clientes.ownerId, ownerId), eq(orcamentos.status, status)));
    return {
      total: Number(row?.total ?? 0),
      valorTotal: Number(row?.valorTotal ?? 0),
    };
  }

  private mapRow(row: any): Orcamento {
    return {
      ...row,
      destinatarios: row.destinatarios?.map((jn: any) => jn.destinatario) ?? [],
      emailsEnviados: row.emailsEnviados ?? [],
      statusHistory: row.statusHistory ?? [],
    };
  }
}
