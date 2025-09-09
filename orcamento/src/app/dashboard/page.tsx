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
  cliente: {
    id: number;
    nome: string;
  };
  destinatarios: {
    id: number;
    nome: string;
  }[];
}

// Componente para estatísticas
async function StatsCards() {
  try {
    const [totalClientes, totalOrcamentos, totalDestinatarios, orcamentosAprovados] = await Promise.all([
      prisma.cliente.count(),
      prisma.orcamento.count(),
      prisma.destinatario.count(),
      prisma.orcamento.count({
        where: { status: 'Aprovado' }
      })
    ]);

    const valorTotalAprovado = await prisma.orcamento.aggregate({
      where: { status: 'Aprovado' },
      _sum: { preco: true }
    });

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrcamentos}</div>
            <p className="text-xs text-muted-foreground">
              {orcamentosAprovados} aprovados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destinatários</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDestinatarios}</div>
            <p className="text-xs text-muted-foreground">
              Emails cadastrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Aprovado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(valorTotalAprovado._sum.preco || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Em orçamentos aprovados
            </p>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
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
}

// Componente para orçamentos recentes
async function RecentOrcamentos() {
  try {
    const orcamentos = await prisma.orcamento.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: {
          select: {
            nome: true,
          }
        },
        destinatarios: {
          select: {
            nome: true,
          }
        }
      }
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos Recentes</CardTitle>
          <CardDescription>
            Últimos orçamentos criados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orcamentos.map((orcamento: OrcamentoWithRelations) => (
              <div key={orcamento.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{orcamento.descricao}</p>
                  <p className="text-sm text-gray-500">
                    Cliente: {orcamento.cliente.nome}
                  </p>
                  <p className="text-sm text-gray-500">
                    {orcamento.destinatarios.length} destinatário(s)
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-semibold">{formatCurrency(orcamento.preco)}</p>
                  <p className="text-sm text-gray-500">{formatDate(orcamento.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/orcamentos">
                Ver todos os orçamentos
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Erro ao carregar orçamentos recentes:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos Recentes</CardTitle>
          <CardDescription>
            Últimos orçamentos criados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={3} />
        </CardContent>
      </Card>
    );
  }
}

// Componente para ações rápidas
function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>
          Acesso rápido às principais funcionalidades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <Button asChild>
            <Link href="/clientes/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/orcamentos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/clientes">
              <Eye className="mr-2 h-4 w-4" />
              Ver Clientes
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/orcamentos">
              <Eye className="mr-2 h-4 w-4" />
              Ver Orçamentos
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-600">
          Visão geral do seu sistema de orçamentos
        </p>
      </div>

      <Suspense fallback={<LoadingCard />}>
        <StatsCards />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<LoadingCard />}>
          <RecentOrcamentos />
        </Suspense>
        
        <QuickActions />
      </div>
    </div>
  );
}
