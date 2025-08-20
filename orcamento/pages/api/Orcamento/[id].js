import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  const orcamentoId = parseInt(id);

  if (req.method === 'GET') {
    try {
      const orcamento = await prisma.orcamento.findUnique({
        where: { id: orcamentoId },
        include: {
          cliente: true,
          destinatario: true,
        },
      });

      if (!orcamento) {
        return res.status(404).json({ message: 'Orçamento não encontrado' });
      }

      return res.status(200).json(orcamento);
    } catch (error) {
      return res.status(400).json({ errors: error.message });
    }
  }

  if (req.method === 'PUT') {
    const {
      clienteId,
      destinatarioId,
      descricao,
      preco,
      status,
      formaPagamento,
      dataInicio,
      dataTermino,
    } = req.body;

    try {
      const orcamento = await prisma.orcamento.update({
        where: { id: orcamentoId },
        data: {
          clienteId: parseInt(clienteId),
          destinatarioId: parseInt(destinatarioId),
          descricao,
          preco,
          status,
          formaPagamento,
          dataInicio: new Date(dataInicio),
          dataTermino: new Date(dataTermino),
        },
        include: {
          cliente: true,
          destinatario: true,
        },
      });
      return res.status(200).json(orcamento);
    } catch (error) {
      return res.status(400).json({ errors: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.orcamento.delete({
        where: { id: orcamentoId },
      });
      return res.status(204).end();
    } catch (error) {
      return res.status(400).json({ errors: error.message });
    }
  }

  res.status(405).json({ message: 'Método não permitido' });
}
