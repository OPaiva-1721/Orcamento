import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Buscar destinatários com filtro por nome, se passado
    const { q, clienteId } = req.query;
    
    let where = {};
    
    if (q) {
      where.nome = {
        contains: q,
        mode: 'insensitive', // Ignorar maiúsculas/minúsculas
      };
    }
    
    if (clienteId) {
      where.clienteId = parseInt(clienteId);
    }

    // Buscar todos os destinatários
    const destinatarios = await prisma.destinatario.findMany({
      where,
      include: {
        cliente: true, // Incluir dados do cliente
      },
    });
    return res.status(200).json(destinatarios);
  }

  if (req.method === 'POST') {
    const { nome, email, clienteId } = req.body;

    // Validações básicas
    if (!nome || !email || !clienteId) {
      return res.status(400).json({ 
        error: 'Nome, email e clienteId são obrigatórios' 
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
      // Verificar se o cliente existe
      const cliente = await prisma.cliente.findUnique({
        where: { id: parseInt(clienteId) }
      });

      if (!cliente) {
        return res.status(400).json({ 
          error: `Cliente com ID ${clienteId} não encontrado` 
        });
      }

      // Verificar se já existe um destinatário com este email
      const destinatarioExistente = await prisma.destinatario.findUnique({
        where: { email }
      });

      if (destinatarioExistente) {
        return res.status(400).json({ 
          error: 'Já existe um destinatário com este email' 
        });
      }

      // Criar um novo destinatário
      const destinatario = await prisma.destinatario.create({
        data: {
          nome,
          email,
          clienteId: parseInt(clienteId),
        },
        include: {
          cliente: true, // Incluir dados do cliente
        },
      });
      
      return res.status(201).json({
        message: 'Destinatário criado com sucesso',
        destinatario
      });
    } catch (error) {
      console.error('Erro ao criar destinatário:', error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          error: 'Já existe um destinatário com este email' 
        });
      }
      
      if (error.code === 'P2003') {
        return res.status(400).json({ 
          error: 'Cliente não encontrado' 
        });
      }
      
      return res.status(500).json({ 
        error: 'Erro interno do servidor ao criar destinatário' 
      });
    }
  }

  res.status(405).json({ message: 'Método não permitido' });
}
