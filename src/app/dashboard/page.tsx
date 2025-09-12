import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingCard, TableSkeleton } from '@/components/ui/loading';
import { formatCurrency, formatDate } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  Mail, 
  TrendingUp,
  Plus,
  Eye
} from 'lucide-react';

interface OrcamentoWithRelations {
  id: number;
  descricao: string;
  preco: number;
  status: string;
  createdAt: Date;
  cliente: { nome: string };
  destinatarios: { nome: string }[];
}

// Componente de Card Estatísticas
const StatsCard = ({ title, value, description, icon }: { title: string, value: any, description: string, icon: JSX.Element }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-xl sm:text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

async function fetchStats() {
  try {
    // Verificação de banco de dados
    if (!process.env.DATABASE_URL) return null;

    const [totalClientes, totalOrcamentos, totalDestinatarios, orcamentosAprovados] = await Promise.all([
      prisma.cliente.count(),
      prisma.orcamento.count(),
      prisma.destinatario.count(),
      prisma.orcamento.count({ where: { status: 'Aprovado' } })
    ]);

    const valorTotalAprovado = await prisma.orcamento.aggregate({
      where: { status: 'Aprovado' },
      _sum: { preco: true }
    });

    return { totalClientes, totalOrcamentos, totalDestinatarios, orcamentosAprovados, valorTotalAprovado };
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
    return null;
  }
}

// Componente de Estatísticas
async function StatsCards() {
  const data = await fetchStats();

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { totalClientes, totalOrcamentos, totalDestinatarios, orcamentosAprovados, valorTotalAprovado } = data;

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard title="Total de Clientes" value={totalClientes} description="Clientes cadastrados" icon={<Users className="h-4 w-4 text-muted-foreground" />} />
      <StatsCard title="Orçamentos" value={totalOrcamentos} description={`${orcamentosAprovados} aprovados`} icon={<FileText className="h-4 w-4 text-muted-foreground" />} />
      <StatsCard title="Destinatários" value={totalDestinatarios} description="Emails cadastrados" icon={<Mail className="h-4 w-4 text-muted-foreground" />} />
      <StatsCard title="Valor Aprovado" value={formatCurrency(valorTotalAprovado._sum.preco || 0)} description="Em orçamentos aprovados" icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} />
    </div>
  );
}

async function fetchRecentOrcamentos() {
  try {
    if (!process.env.DATABASE_URL) return null;

    return await prisma.orcamento.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: { select: { nome: true } },
        destinatarios: { select: { nome: true } }
      }
    });
  } catch (error) {
    console.error('Erro ao carregar orçamentos recentes:', error);
    return null;
  }
}

async function RecentOrcamentos() {
  const orcamentos = await fetchRecentOrcamentos();

  if (!orcamentos) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos Recentes</CardTitle>
          <CardDescription>Últimos orçamentos criados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={3} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamentos Recentes</CardTitle>
        <CardDescription>Últimos orçamentos criados no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {orcamentos.map((orcamento, idx) => (
            <div key={orcamento.id ?? idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="space-y-1 flex-1">
                <p className="font-medium text-sm sm:text-base">{orcamento.descricao}</p>
                <p className="text-xs sm:text-sm text-gray-500">Cliente: {orcamento.cliente?.nome ?? 'Desconhecido'}</p>
                <p className="text-xs sm:text-sm text-gray-500">{orcamento.destinatarios?.length ?? 0} destinatário(s)</p>
              </div>
              <div className="text-left sm:text-right space-y-1 mt-2 sm:mt-0 sm:ml-4">
                <p className="font-semibold text-sm sm:text-base">{formatCurrency(orcamento.preco)}</p>
                <p className="text-xs sm:text-sm text-gray-500">{formatDate(orcamento.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/orcamentos">Ver todos os orçamentos</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          {['/clientes/novo', '/orcamentos/novo', '/clientes', '/orcamentos'].map((href, idx) => (
            <Button asChild variant={idx % 2 === 0 ? 'default' : 'outline'} key={href} className="h-10 sm:h-auto">
              <Link href={href}>
                <Plus className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Novo {idx % 2 === 0 ? 'Cliente' : 'Orçamento'}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Visão geral do seu sistema de orçamentos</p>
      </div>

      <Suspense fallback={<LoadingCard />}>
        <StatsCards />
      </Suspense>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Suspense fallback={<LoadingCard />}>
          <RecentOrcamentos />
        </Suspense>

        <QuickActions />
      </div>
    </div>
  );
}
