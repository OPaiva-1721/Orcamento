import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateClienteData, ClienteFilters } from '@/types';
import { isValidEmail, isValidCNPJ } from '@/lib/utils';

// GET /api/clientes - Listar clientes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = q ? {
      nome: {
        contains: q,
        mode: 'insensitive' as const,
      },
    } : {};

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        include: {
          destinatarios: true,
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
      prisma.cliente.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: clientes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/clientes - Criar cliente
export async function POST(request: NextRequest) {
  try {
    const body: CreateClienteData = await request.json();
    const { nome, cnpj, email, telefone } = body;

    // Validações
    if (!nome || !cnpj || !email || !telefone) {
      return NextResponse.json(
        { success: false, error: 'Nome, CNPJ, email e telefone são obrigatórios' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    if (!isValidCNPJ(cnpj)) {
      return NextResponse.json(
        { success: false, error: 'CNPJ inválido' },
        { status: 400 }
      );
    }

    // Verificar se já existe um cliente com este email
    const clienteExistente = await prisma.cliente.findUnique({
      where: { email },
    });

    if (clienteExistente) {
      return NextResponse.json(
        { success: false, error: 'Já existe um cliente com este email' },
        { status: 400 }
      );
    }

    // Criar cliente
    const cliente = await prisma.cliente.create({
      data: {
        nome,
        cnpj,
        email,
        telefone,
      },
      include: {
        destinatarios: true,
        orcamentos: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: cliente,
        message: 'Cliente criado com sucesso',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    
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
