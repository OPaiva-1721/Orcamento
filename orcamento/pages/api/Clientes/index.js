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

    // Criar um novo cliente
    try {
      const cliente = await prisma.cliente.create({
        data: {
          nome,
          cnpj,
          email,
          telefone,
        },
      });
      return res.status(201).json(cliente);
    } catch (error) {
      return res.status(400).json({ errors: error.message });
    }
  }

  res.status(405).json({ message: 'Método não permitido' });
}
