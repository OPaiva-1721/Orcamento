import { PrismaClient } from '../../../../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  const orcamentoId = parseInt(id);

  if (req.method === 'GET') {
    // Buscar todos os destinatários de um orçamento
    try {
      const orcamento = await prisma.orcamento.findUnique({
        where: { id: orcamentoId },
        include: {
          orcamentoDestinatarios: {
            include: {
              destinatario: true
            }
          }
        }
      });

      if (!orcamento) {
        return res.status(404).json({ message: 'Orçamento não encontrado' });
      }

      return res.status(200).json(orcamento.orcamentoDestinatarios);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    // Adicionar destinatários a um orçamento
    const { destinatarioIds } = req.body;

    if (!destinatarioIds || !Array.isArray(destinatarioIds)) {
      return res.status(400).json({ error: 'destinatarioIds deve ser um array' });
    }

    try {
      // Verificar se o orçamento existe
      const orcamento = await prisma.orcamento.findUnique({
        where: { id: orcamentoId }
      });

      if (!orcamento) {
        return res.status(404).json({ message: 'Orçamento não encontrado' });
      }

      // Adicionar os novos destinatários
      const novosDestinatarios = await prisma.orcamentoDestinatario.createMany({
        data: destinatarioIds.map(destinatarioId => ({
          orcamentoId,
          destinatarioId: parseInt(destinatarioId)
        })),
        skipDuplicates: true // Pular se já existir
      });

      // Buscar os destinatários adicionados
      const destinatariosAdicionados = await prisma.orcamentoDestinatario.findMany({
        where: {
          orcamentoId,
          destinatarioId: {
            in: destinatarioIds.map(id => parseInt(id))
          }
        },
        include: {
          destinatario: true
        }
      });

      return res.status(201).json({
        message: `${novosDestinatarios.count} destinatário(s) adicionado(s) com sucesso`,
        destinatarios: destinatariosAdicionados
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    // Remover destinatários de um orçamento
    const { destinatarioIds } = req.body;

    if (!destinatarioIds || !Array.isArray(destinatarioIds)) {
      return res.status(400).json({ error: 'destinatarioIds deve ser um array' });
    }

    try {
      // Verificar se o orçamento existe
      const orcamento = await prisma.orcamento.findUnique({
        where: { id: orcamentoId }
      });

      if (!orcamento) {
        return res.status(404).json({ message: 'Orçamento não encontrado' });
      }

      // Remover os destinatários
      const destinatariosRemovidos = await prisma.orcamentoDestinatario.deleteMany({
        where: {
          orcamentoId,
          destinatarioId: {
            in: destinatarioIds.map(id => parseInt(id))
          }
        }
      });

      return res.status(200).json({
        message: `${destinatariosRemovidos.count} destinatário(s) removido(s) com sucesso`
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ message: 'Método não permitido' });
}
