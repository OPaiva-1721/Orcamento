import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  const clienteId = parseInt(id);

  if (req.method === 'GET') {
    try {
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
        include: {
          destinatarios: true,
          orcamentos: {
            include: {
              destinatario: true,
            },
          },
        },
      });

      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }

      return res.status(200).json(cliente);
    } catch (error) {
      return res.status(400).json({ errors: error.message });
    }
  }

  if (req.method === 'PUT') {
    const { nome, cnpj, email, telefone } = req.body;

    try {
      const cliente = await prisma.cliente.update({
        where: { id: clienteId },
        data: {
          nome,
          cnpj,
          email,
          telefone,
        },
      });
      return res.status(200).json(cliente);
    } catch (error) {
      return res.status(400).json({ errors: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.cliente.delete({
        where: { id: clienteId },
      });
      return res.status(204).end();
    } catch (error) {
      return res.status(400).json({ errors: error.message });
    }
  }

  res.status(405).json({ message: 'Método não permitido' });
}
