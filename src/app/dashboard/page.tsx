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
  cliente: {
    nome: string;
  };
  destinatarios: {
    nome: string;
  }[];
}

// Componente para estatísticas
async function StatsCards() {
  try {
    // Verificar se há conexão com o banco
    if (!process.env.DATABASE_URL) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Banco não configurado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Banco não configurado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Destinatários</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Banco não configurado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Aprovado</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Banco não configurado
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

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
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalOrcamentos}</div>
            <p className="text-xs text-muted-foreground">
              {orcamentosAprovados} aprovados
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destinatários</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalDestinatarios}</div>
            <p className="text-xs text-muted-foreground">
              Emails cadastrados
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Aprovado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
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
    // Verificar se há conexão com o banco
    if (!process.env.DATABASE_URL) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos Recentes</CardTitle>
            <CardDescription>
              Últimos orçamentos criados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">Banco de dados não configurado</p>
              <p className="text-sm text-gray-400 mt-2">
                Configure as variáveis de ambiente para conectar ao banco
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

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
          <div className="space-y-3 sm:space-y-4">
            {orcamentos.map((orcamento: OrcamentoWithRelations, idx: number) => (
              <div key={orcamento.id ?? idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="space-y-1 flex-1">
                  <p className="font-medium text-sm sm:text-base">{orcamento.descricao}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Cliente: {orcamento.cliente?.nome ?? 'Desconhecido'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {orcamento.destinatarios?.length ?? 0} destinatário(s)
                  </p>
                </div>
                <div className="text-left sm:text-right space-y-1 mt-2 sm:mt-0 sm:ml-4">
                  <p className="font-semibold text-sm sm:text-base">{formatCurrency(orcamento.preco)}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {orcamento.createdAt ? formatDate(orcamento.createdAt as Date) : ''}
                  </p>
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
        <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          <Button asChild className="h-10 sm:h-auto">
            <Link href="/clientes/novo">
              <Plus className="mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Novo Cliente</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 sm:h-auto">
            <Link href="/orcamentos/novo">
              <Plus className="mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Novo Orçamento</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 sm:h-auto">
            <Link href="/clientes">
              <Eye className="mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Ver Clientes</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 sm:h-auto">
            <Link href="/orcamentos">
              <Eye className="mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Ver Orçamentos</span>
            </Link>
          </Button>
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
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Visão geral do seu sistema de orçamentos
        </p>
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
