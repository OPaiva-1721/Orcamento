import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateOrcamentoData } from '@/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/orcamentos/[id] - Buscar orçamento por ID
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

    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: {
        cliente: true,
        destinatarios: true,
        emailsEnviados: {
          include: {
            destinatario: true,
          },
        },
      },
    });

    if (!orcamento) {
      return NextResponse.json(
        { success: false, error: 'Orçamento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: orcamento,
    });
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/orcamentos/[id] - Atualizar orçamento
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

    const body: UpdateOrcamentoData = await request.json();
    const { 
      descricao, 
      preco, 
      status, 
      formaPagamento, 
      dataInicio, 
      dataTermino, 
      clienteId, 
      destinatarioIds 
    } = body;

    // Verificar se o orçamento existe
    const orcamentoExistente = await prisma.orcamento.findUnique({
      where: { id },
    });

    if (!orcamentoExistente) {
      return NextResponse.json(
        { success: false, error: 'Orçamento não encontrado' },
        { status: 404 }
      );
    }

    // Validações condicionais
    if (preco && preco <= 0) {
      return NextResponse.json(
        { success: false, error: 'Preço deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Validação: Data de término obrigatória quando status for "Concluído"
    if (status === 'Concluído' && !dataTermino) {
      return NextResponse.json(
        { success: false, error: 'A data de término é obrigatória quando o status for "Concluído"' },
        { status: 400 }
      );
    }

    // Lógica: Se status for "Concluído", automaticamente também é "Aprovado"
    let finalStatus = status;
    if (status === 'Concluído') {
      finalStatus = 'Aprovado'; // Concluído = Aprovado automaticamente
    }

    if (dataInicio && dataTermino && new Date(dataInicio) >= new Date(dataTermino)) {
      return NextResponse.json(
        { success: false, error: 'Data de início deve ser anterior à data de término' },
        { status: 400 }
      );
    }

    // Verificar se o cliente existe (se clienteId estiver sendo atualizado)
    if (clienteId && clienteId !== orcamentoExistente.clienteId) {
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

    // Verificar se os destinatários existem e pertencem ao cliente
    if (destinatarioIds && destinatarioIds.length > 0) {
      const clienteIdParaValidacao = clienteId || orcamentoExistente.clienteId;
      const destinatarios = await prisma.destinatario.findMany({
        where: {
          id: { in: destinatarioIds },
          clienteId: clienteIdParaValidacao,
        },
      });

      if (destinatarios.length !== destinatarioIds.length) {
        return NextResponse.json(
          { success: false, error: 'Um ou mais destinatários não foram encontrados ou não pertencem ao cliente' },
          { status: 400 }
        );
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};
    
    if (descricao) updateData.descricao = descricao;
    if (preco) updateData.preco = preco;
    if (status) updateData.status = finalStatus; // Usar o status final (Aprovado se Concluído)
    if (formaPagamento !== undefined) updateData.formaPagamento = formaPagamento;
    if (dataInicio) updateData.dataInicio = new Date(dataInicio);
    if (dataTermino !== undefined) updateData.dataTermino = dataTermino ? new Date(dataTermino) : null;
    if (clienteId) updateData.clienteId = clienteId;

    // Atualizar orçamento
    const orcamento = await prisma.orcamento.update({
      where: { id },
      data: {
        ...updateData,
        // Adicionar histórico de status se o status mudou
        ...(status && status !== orcamentoExistente.status ? {
          statusHistory: {
            create: [
              {
                status: finalStatus,
                observacao: 'Status atualizado',
              },
              // Se foi Concluído, adicionar também o histórico de Aprovado
              ...(status === 'Concluído' ? [{
                status: 'Aprovado',
                observacao: 'Status automaticamente aprovado por estar concluído',
              }] : []),
            ],
          },
        } : {}),
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        destinatarios: true,
        emailsEnviados: true,
      },
    });

    // Atualizar destinatários se fornecidos
    if (destinatarioIds) {
      await prisma.orcamento.update({
        where: { id },
        data: {
          destinatarios: {
            set: destinatarioIds.map(id => ({ id })),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: orcamento,
      message: 'Orçamento atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/orcamentos/[id] - Deletar orçamento
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

    // Verificar se o orçamento existe
    const orcamentoExistente = await prisma.orcamento.findUnique({
      where: { id },
    });

    if (!orcamentoExistente) {
      return NextResponse.json(
        { success: false, error: 'Orçamento não encontrado' },
        { status: 404 }
      );
    }

    // Deletar orçamento (emails enviados serão deletados em cascata)
    await prisma.orcamento.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Orçamento deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar orçamento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
