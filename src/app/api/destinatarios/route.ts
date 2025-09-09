import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateDestinatarioData } from '@/types';
import { isValidEmail } from '@/lib/utils';

// GET /api/destinatarios - Listar destinatários
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = clienteId ? {
      clienteId: parseInt(clienteId),
    } : {};

    const [destinatarios, total] = await Promise.all([
      prisma.destinatario.findMany({
        where,
        include: {
          cliente: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          orcamentos: {
            select: {
              id: true,
              descricao: true,
              preco: true,
              status: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.destinatario.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: destinatarios,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar destinatários:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/destinatarios - Criar destinatário
export async function POST(request: NextRequest) {
  try {
    const body: CreateDestinatarioData = await request.json();
    const { nome, email, clienteId } = body;

    // Validações
    if (!nome || !email || !clienteId) {
      return NextResponse.json(
        { success: false, error: 'Nome, email e clienteId são obrigatórios' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

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

    // Verificar se já existe um destinatário com este email para este cliente
    const destinatarioExistente = await prisma.destinatario.findFirst({
      where: {
        email,
        clienteId,
      },
    });

    if (destinatarioExistente) {
      return NextResponse.json(
        { success: false, error: 'Já existe um destinatário com este email para este cliente' },
        { status: 400 }
      );
    }

    // Criar destinatário
    const destinatario = await prisma.destinatario.create({
      data: {
        nome,
        email,
        clienteId,
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

    return NextResponse.json(
      {
        success: true,
        data: destinatario,
        message: 'Destinatário criado com sucesso',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar destinatário:', error);
    
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
