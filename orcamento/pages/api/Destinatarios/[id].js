import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  const destinatarioId = parseInt(id);

  if (req.method === 'GET') {
    try {
      const destinatario = await prisma.destinatario.findUnique({
        where: { id: destinatarioId },
        include: {
          cliente: true,
          orcamentos: true,
        },
      });

      if (!destinatario) {
        return res.status(404).json({ message: 'Destinatário não encontrado' });
      }

      return res.status(200).json(destinatario);
    } catch (error) {
      return res.status(400).json({ errors: error.message });
    }
  }

  if (req.method === 'PUT') {
    const { nome, email, clienteId } = req.body;

    try {
      const destinatario = await prisma.destinatario.update({
        where: { id: destinatarioId },
        data: {
          nome,
          email,
          clienteId: parseInt(clienteId),
        },
        include: {
          cliente: true,
        },
      });
      return res.status(200).json(destinatario);
    } catch (error) {
      return res.status(400).json({ errors: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.destinatario.delete({
        where: { id: destinatarioId },
      });
      return res.status(204).end();
    } catch (error) {
      return res.status(400).json({ errors: error.message });
    }
  }

  res.status(405).json({ message: 'Método não permitido' });
}
