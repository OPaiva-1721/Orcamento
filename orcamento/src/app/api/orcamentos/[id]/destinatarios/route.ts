import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/orcamentos/[id]/destinatarios - Listar destinatários do orçamento
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const orcamentoId = parseInt(resolvedParams.id);

    if (isNaN(orcamentoId)) {
      return NextResponse.json(
        { success: false, error: 'ID do orçamento inválido' },
        { status: 400 }
      );
    }

    // Verificar se o orçamento existe
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: orcamentoId },
    });

    if (!orcamento) {
      return NextResponse.json(
        { success: false, error: 'Orçamento não encontrado' },
        { status: 404 }
      );
    }

    // Buscar destinatários do orçamento
    const destinatarios = await prisma.destinatario.findMany({
      where: {
        orcamentos: {
          some: {
            id: orcamentoId,
          },
        },
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        orcamentos: {
          where: {
            id: orcamentoId,
          },
          select: {
            id: true,
            descricao: true,
            preco: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: destinatarios,
    });
  } catch (error) {
    console.error('Erro ao buscar destinatários do orçamento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
