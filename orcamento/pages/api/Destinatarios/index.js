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

    // Criar um novo destinatário
    try {
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
      return res.status(201).json(destinatario);
    } catch (error) {
      return res.status(400).json({ errors: error.message });
    }
  }

  res.status(405).json({ message: 'Método não permitido' });
}
