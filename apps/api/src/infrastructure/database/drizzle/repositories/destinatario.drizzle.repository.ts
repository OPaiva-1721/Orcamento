import { Inject, Injectable } from '@nestjs/common';
import { eq, count, inArray, and, desc } from 'drizzle-orm';
import {
  clientes,
  destinatarios,
  orcamentosDestinatarios,
  type Database,
} from '@orcamento/db';
import {
  Destinatario,
  CreateDestinatarioData,
  UpdateDestinatarioData,
  DestinatarioFilters,
  PaginatedResponse,
} from '@orcamento/shared-types';
import { IDestinatarioRepository } from '../../../../domain/destinatario/repositories/destinatario.repository.interface';
import { DRIZZLE_CONNECTION } from '../drizzle.constants';
import { EmailAlreadyInUseException } from '../../../../domain/destinatario/exceptions/email-already-in-use.exception';
import { ForbiddenResourceException } from '../../../../domain/shared/exceptions/forbidden-resource.exception';
import { ResourceNotFoundException } from '../../../../domain/shared/exceptions/resource-not-found.exception';

@Injectable()
export class DestinatarioDrizzleRepository implements IDestinatarioRepository {
  constructor(@Inject(DRIZZLE_CONNECTION) private readonly db: Database) {}

  async findById(id: number, ownerId: string): Promise<Destinatario | null> {
    const row = await this.db.query.destinatarios.findFirst({
      where: eq(destinatarios.id, id),
      with: { cliente: true },
    });
    if (!row) return null;
    if (row.cliente?.ownerId !== ownerId) return null;
    return row;
  }

  async findByEmailAndCliente(
    email: string,
    clienteId: number,
    ownerId: string,
  ): Promise<Destinatario | null> {
    const cliente = await this.assertClienteOwned(clienteId, ownerId);
    if (!cliente) return null;
    const row = await this.db.query.destinatarios.findFirst({
      where: and(
        eq(destinatarios.email, email),
        eq(destinatarios.clienteId, clienteId),
      ),
    });
    return row ?? null;
  }

  async findAll(
    filters: DestinatarioFilters,
  ): Promise<PaginatedResponse<Destinatario>> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 10, 100);
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(clientes.ownerId, filters.ownerId)];
    if (filters.clienteId)
      conditions.push(eq(destinatarios.clienteId, filters.clienteId));
    const whereClause = and(...conditions);

    const [idRows, [totalRow]] = await Promise.all([
      this.db
        .select({ id: destinatarios.id })
        .from(destinatarios)
        .innerJoin(clientes, eq(destinatarios.clienteId, clientes.id))
        .where(whereClause)
        .orderBy(desc(destinatarios.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ value: count() })
        .from(destinatarios)
        .innerJoin(clientes, eq(destinatarios.clienteId, clientes.id))
        .where(whereClause),
    ]);

    const ids: number[] = idRows.map((r: any) => r.id);
    const rows = ids.length
      ? await this.db.query.destinatarios.findMany({
          where: inArray(destinatarios.id, ids),
          with: { cliente: true },
          orderBy: (d: any, { desc }: any) => [desc(d.createdAt)],
        })
      : [];

    const total = Number(totalRow?.value ?? 0);
    return {
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByIds(ids: number[], ownerId: string): Promise<Destinatario[]> {
    if (ids.length === 0) return [];
    const rows = await this.db.query.destinatarios.findMany({
      where: inArray(destinatarios.id, ids),
      with: { cliente: true },
    });
    return rows.filter((r: any) => r.cliente?.ownerId === ownerId);
  }

  async create(
    data: CreateDestinatarioData,
    ownerId: string,
  ): Promise<Destinatario> {
    const cliente = await this.assertClienteOwned(data.clienteId, ownerId);
    if (!cliente)
      throw new ForbiddenResourceException('Cliente não pertence ao usuário');
    try {
      const [row] = await this.db
        .insert(destinatarios)
        .values({
          nome: data.nome,
          email: data.email,
          clienteId: data.clienteId,
        })
        .returning();
      return row;
    } catch (err: any) {
      if (err.code === '23505')
        throw new EmailAlreadyInUseException(data.email);
      throw err;
    }
  }

  async update(
    id: number,
    ownerId: string,
    data: UpdateDestinatarioData,
  ): Promise<Destinatario> {
    const existing = await this.findById(id, ownerId);
    if (!existing)
      throw new ResourceNotFoundException('Destinatário não encontrado');

    if (data.clienteId !== undefined && data.clienteId !== existing.clienteId) {
      const novoCliente = await this.assertClienteOwned(
        data.clienteId,
        ownerId,
      );
      if (!novoCliente)
        throw new ForbiddenResourceException('Cliente não pertence ao usuário');
    }

    try {
      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.clienteId !== undefined) updateData.clienteId = data.clienteId;

      const [row] = await this.db
        .update(destinatarios)
        .set(updateData)
        .where(eq(destinatarios.id, id))
        .returning();
      return row;
    } catch (err: any) {
      if (err.code === '23505')
        throw new EmailAlreadyInUseException(data.email ?? '');
      throw err;
    }
  }

  async delete(id: number, ownerId: string): Promise<void> {
    const existing = await this.findById(id, ownerId);
    if (!existing)
      throw new ResourceNotFoundException('Destinatário não encontrado');
    await this.db.delete(destinatarios).where(eq(destinatarios.id, id));
  }

  async countOrcamentos(
    destinatarioId: number,
    ownerId: string,
  ): Promise<number> {
    const existing = await this.findById(destinatarioId, ownerId);
    if (!existing) return 0;
    const [row] = await this.db
      .select({ value: count() })
      .from(orcamentosDestinatarios)
      .where(eq(orcamentosDestinatarios.destinatarioId, destinatarioId));
    return Number(row?.value ?? 0);
  }

  private async assertClienteOwned(clienteId: number, ownerId: string) {
    return this.db.query.clientes.findFirst({
      where: and(eq(clientes.id, clienteId), eq(clientes.ownerId, ownerId)),
    });
  }
}
