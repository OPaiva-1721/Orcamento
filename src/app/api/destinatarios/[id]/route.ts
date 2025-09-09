import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateDestinatarioData } from '@/types';
import { isValidEmail } from '@/lib/utils';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/destinatarios/[id] - Buscar destinatário por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    const destinatario = await prisma.destinatario.findUnique({
      where: { id },
      include: {
        cliente: true,
        orcamentos: {
          include: {
            cliente: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
    });

    if (!destinatario) {
      return NextResponse.json(
        { success: false, error: 'Destinatário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: destinatario,
    });
  } catch (error) {
    console.error('Erro ao buscar destinatário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/destinatarios/[id] - Atualizar destinatário
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body: UpdateDestinatarioData = await request.json();
    const { nome, email, clienteId } = body;

    // Verificar se o destinatário existe
    const destinatarioExistente = await prisma.destinatario.findUnique({
      where: { id },
    });

    if (!destinatarioExistente) {
      return NextResponse.json(
        { success: false, error: 'Destinatário não encontrado' },
        { status: 404 }
      );
    }

    // Validações condicionais
    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Verificar se o cliente existe (se clienteId estiver sendo atualizado)
    if (clienteId && clienteId !== destinatarioExistente.clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
      });

      if (!cliente) {
        return NextResponse.json(
          { success: false, error: 'Cliente não encontrado' },
          { status: 404 }
        );
      }
    }

    // Verificar se o email já está sendo usado por outro destinatário do mesmo cliente
    if (email && email !== destinatarioExistente.email) {
      const emailEmUso = await prisma.destinatario.findFirst({
        where: {
          email,
          clienteId: clienteId || destinatarioExistente.clienteId,
          id: { not: id },
        },
      });

      if (emailEmUso) {
        return NextResponse.json(
          { success: false, error: 'Já existe um destinatário com este email para este cliente' },
          { status: 400 }
        );
      }
    }

    // Atualizar destinatário
    const destinatario = await prisma.destinatario.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(email && { email }),
        ...(clienteId && { clienteId }),
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        orcamentos: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: destinatario,
      message: 'Destinatário atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar destinatário:', error);
    
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Já existe um destinatário com este email' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/destinatarios/[id] - Deletar destinatário
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se o destinatário existe
    const destinatarioExistente = await prisma.destinatario.findUnique({
      where: { id },
      include: {
        orcamentos: true,
      },
    });

    if (!destinatarioExistente) {
      return NextResponse.json(
        { success: false, error: 'Destinatário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o destinatário tem orçamentos
    if (destinatarioExistente.orcamentos.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Não é possível deletar destinatário com orçamentos associados' 
        },
        { status: 400 }
      );
    }

    // Deletar destinatário
    await prisma.destinatario.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Destinatário deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar destinatário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
