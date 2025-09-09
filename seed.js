const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar cliente de teste
  const cliente = await prisma.cliente.upsert({
    where: { email: 'teste@empresa.com' },
    update: {},
    create: {
      nome: 'Empresa Teste Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'teste@empresa.com',
      telefone: '(11) 99999-9999',
    },
  });

  console.log('✅ Cliente criado:', cliente);

  // Criar destinatário de teste
  const destinatario = await prisma.destinatario.upsert({
    where: { 
      email_clienteId: {
        email: 'joao@empresa.com',
        clienteId: cliente.id,
      }
    },
    update: {},
    create: {
      nome: 'João Silva',
      email: 'joao@empresa.com',
      clienteId: cliente.id,
    },
  });

  console.log('✅ Destinatário criado:', destinatario);

  // Criar orçamento de teste
  const orcamento = await prisma.orcamento.create({
    data: {
      descricao: 'Desenvolvimento de Sistema Web',
      preco: 15000.00,
      status: 'Pendente',
      formaPagamento: false, // À vista
      dataInicio: new Date('2024-01-15'),
      dataTermino: new Date('2024-03-15'),
      clienteId: cliente.id,
      destinatarios: {
        connect: {
          id: destinatario.id,
        },
      },
      statusHistory: {
        create: {
          status: 'Pendente',
          observacao: 'Orçamento criado',
        },
      },
    },
  });

  console.log('✅ Orçamento criado:', orcamento);

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
