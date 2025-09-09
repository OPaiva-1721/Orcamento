import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateClienteData } from '@/types';
import { isValidEmail, isValidCNPJ } from '@/lib/utils';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/clientes/[id] - Buscar cliente por ID
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

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        destinatarios: true,
        orcamentos: {
          include: {
            destinatarios: true,
          },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { success: false, error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cliente,
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/clientes/[id] - Atualizar cliente
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

    const body: UpdateClienteData = await request.json();
    const { nome, cnpj, email, telefone } = body;

    // Verificar se o cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteExistente) {
      return NextResponse.json(
        { success: false, error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Validações condicionais (apenas se os campos estiverem sendo atualizados)
    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    if (cnpj && !isValidCNPJ(cnpj)) {
      return NextResponse.json(
        { success: false, error: 'CNPJ inválido' },
        { status: 400 }
      );
    }

    // Verificar se o email já está sendo usado por outro cliente
    if (email && email !== clienteExistente.email) {
      const emailEmUso = await prisma.cliente.findUnique({
        where: { email },
      });

      if (emailEmUso) {
        return NextResponse.json(
          { success: false, error: 'Já existe um cliente com este email' },
          { status: 400 }
        );
      }
    }

    // Atualizar cliente
    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(cnpj && { cnpj }),
        ...(email && { email }),
        ...(telefone && { telefone }),
      },
      include: {
        destinatarios: true,
        orcamentos: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: cliente,
      message: 'Cliente atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Já existe um cliente com este email' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/clientes/[id] - Deletar cliente
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

    // Verificar se o cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        orcamentos: true,
      },
    });

    if (!clienteExistente) {
      return NextResponse.json(
        { success: false, error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o cliente tem orçamentos
    if (clienteExistente.orcamentos.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Não é possível deletar cliente com orçamentos associados' 
        },
        { status: 400 }
      );
    }

    // Deletar cliente (destinatários serão deletados em cascata)
    await prisma.cliente.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Cliente deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
