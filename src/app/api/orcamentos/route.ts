import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateOrcamentoData } from '@/types';

// GET /api/orcamentos - Listar orçamentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (clienteId) {
      where.clienteId = parseInt(clienteId);
    }
    
    if (status) {
      where.status = status;
    }

    const [orcamentos, total] = await Promise.all([
      prisma.orcamento.findMany({
        where,
        include: {
          cliente: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          destinatarios: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          emailsEnviados: {
            select: {
              id: true,
              dataEnvio: true,
              status: true,
              destinatario: {
                select: {
                  nome: true,
                  email: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.orcamento.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orcamentos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/orcamentos - Criar orçamento
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrcamentoData = await request.json();
    const { 
      descricao, 
      preco, 
      status = 'Pendente', 
      formaPagamento, 
      dataInicio, 
      dataTermino, 
      clienteId, 
      destinatarioIds 
    } = body;

    // Validações
    if (!descricao || !preco || dataInicio === undefined || !clienteId) {
      return NextResponse.json(
        { success: false, error: 'Descrição, preço, data de início e cliente são obrigatórios' },
        { status: 400 }
      );
    }

    if (preco <= 0) {
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

    if (dataTermino && new Date(dataInicio) >= new Date(dataTermino)) {
      return NextResponse.json(
        { success: false, error: 'Data de início deve ser anterior à data de término' },
        { status: 400 }
      );
    }

    // Tratar dataTermino vazia como null
    const finalDataTermino = (!dataTermino || (typeof dataTermino === 'string' && dataTermino === '')) ? null : dataTermino;

    // Verificar se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      return NextResponse.json(
        { success: false, error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se os destinatários existem e pertencem ao cliente
    if (destinatarioIds && destinatarioIds.length > 0) {
      const destinatarios = await prisma.destinatario.findMany({
        where: {
          id: { in: destinatarioIds },
          clienteId,
        },
      });

      if (destinatarios.length !== destinatarioIds.length) {
        return NextResponse.json(
          { success: false, error: 'Um ou mais destinatários não foram encontrados ou não pertencem ao cliente' },
          { status: 400 }
        );
      }
    }

    // Criar orçamento
    const orcamentoData: any = {
      descricao,
      preco,
      status: finalStatus, // Usar o status final (Aprovado se Concluído)
      formaPagamento: formaPagamento || false,
      dataInicio: new Date(dataInicio),
      clienteId,
      destinatarios: destinatarioIds && destinatarioIds.length > 0 ? {
        connect: destinatarioIds.map(id => ({ id })),
      } : undefined,
      statusHistory: {
        create: [
          {
            status: finalStatus,
            observacao: 'Orçamento criado',
          },
          // Se foi Concluído, adicionar também o histórico de Aprovado
          ...(status === 'Concluído' ? [{
            status: 'Aprovado',
            observacao: 'Status automaticamente aprovado por estar concluído',
          }] : []),
        ],
      },
    };

    if (finalDataTermino) {
      orcamentoData.dataTermino = new Date(finalDataTermino);
    }

    const orcamento = await prisma.orcamento.create({
      data: orcamentoData,
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
        statusHistory: {
          orderBy: {
            dataMudanca: 'desc',
          },
        },
      },
    });

    // Enviar emails automaticamente se houver destinatários
    let emailResult = null;
    if (destinatarioIds && destinatarioIds.length > 0) {
      try {
        console.log('=== ENVIO AUTOMÁTICO DE EMAIL ===');
        console.log('Orçamento ID:', orcamento.id);
        console.log('Destinatários:', destinatarioIds);
        console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
        console.log('SMTP configurado:', !!process.env.SMTP_HOST);
        console.log('SMTP_HOST:', process.env.SMTP_HOST);
        console.log('SMTP_USER:', process.env.SMTP_USER);
        console.log('SMTP_FROM:', process.env.SMTP_FROM);
        
        const emailUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/enviar-email`;
        console.log('URL do endpoint de email:', emailUrl);
        
        const emailResponse = await fetch(emailUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orcamentoId: orcamento.id,
            destinatarioIds: destinatarioIds,
          }),
        });

        console.log('Status da resposta:', emailResponse.status);
        console.log('Headers da resposta:', Object.fromEntries(emailResponse.headers.entries()));
        
        if (emailResponse.ok) {
          emailResult = await emailResponse.json();
          console.log('✅ Emails enviados com sucesso:', emailResult);
        } else {
          const errorData = await emailResponse.json();
          console.error('❌ Erro ao enviar emails:', errorData);
          console.error('Status:', emailResponse.status);
          console.error('Status Text:', emailResponse.statusText);
        }
      } catch (error) {
        console.error('❌ Erro ao enviar emails automaticamente:', error);
        console.error('Tipo do erro:', typeof error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
        // Não falha a criação do orçamento se o email falhar
      }
    } else {
      console.log('ℹ️ Nenhum destinatário selecionado para envio automático');
    }

    return NextResponse.json(
      {
        success: true,
        data: orcamento,
        message: emailResult 
          ? `Orçamento criado e ${emailResult.data.emailsEnviados.length} email(s) enviado(s) com sucesso!`
          : 'Orçamento criado com sucesso!',
        emailResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
