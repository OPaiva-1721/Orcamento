import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Buscar clientes com filtro por nome, se passado
    const { q } = req.query;
    if (q) {
      const clientes = await prisma.cliente.findMany({
        where: {
          nome: {
            contains: q,
            mode: 'insensitive', // Ignorar maiúsculas/minúsculas
          },
        },
      });
      return res.status(200).json(clientes);
    }

    // Buscar todos os clientes
    const clientes = await prisma.cliente.findMany({
      include: {
        destinatarios: true, // Incluir destinatários
        orcamentos: true, // Incluir orçamentos
      },
    });
    return res.status(200).json(clientes);
  }

  if (req.method === 'POST') {
    const { nome, cnpj, email, telefone } = req.body;

    // Validações básicas
    if (!nome || !cnpj || !email || !telefone) {
      return res.status(400).json({ 
        error: 'Nome, CNPJ, email e telefone são obrigatórios' 
      });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Formato de email inválido' 
      });
    }

    try {
      // Verificar se já existe um cliente com este email
      const clienteExistente = await prisma.cliente.findUnique({
        where: { email }
      });

      if (clienteExistente) {
        return res.status(400).json({ 
          error: 'Já existe um cliente com este email' 
        });
      }

      // Criar um novo cliente
      const cliente = await prisma.cliente.create({
        data: {
          nome,
          cnpj,
          email,
          telefone,
        },
      });
      
      return res.status(201).json({
        message: 'Cliente criado com sucesso',
        cliente
      });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          error: 'Já existe um cliente com este email' 
        });
      }
      
      return res.status(500).json({ 
        error: 'Erro interno do servidor ao criar cliente' 
      });
    }
  }

  res.status(405).json({ message: 'Método não permitido' });
}
