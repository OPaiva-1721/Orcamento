import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingCard, TableSkeleton } from '@/components/ui/loading';
import { formatDate } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Mail, Users, Building, FileText, Edit, ArrowLeft } from 'lucide-react';

// Componente para listar destinatários
async function DestinatariosList() {
  try {
    const destinatarios = await prisma.destinatario.findMany({
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        orcamentos: {
          select: {
            id: true,
            descricao: true,
            preco: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (destinatarios.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum destinatário encontrado
            </h3>
            <p className="text-gray-500 mb-6">
              Comece criando seu primeiro destinatário
            </p>
            <Button asChild>
              <Link href="/destinatarios/novo">
                <Plus className="mr-2 h-4 w-4" />
                Novo Destinatário
              </Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {destinatarios.map((destinatario) => (
          <Card key={destinatario.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {destinatario.nome}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{destinatario.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>Cliente: {destinatario.cliente.nome}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{destinatario.orcamentos.length} orçamento(s)</span>
                    <span>Criado em {formatDate(destinatario.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/destinatarios/${destinatario.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Erro ao carregar destinatários:', error);
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600">Erro ao carregar destinatários</p>
            <p className="text-sm text-gray-500 mt-2">
              Tente recarregar a página
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default function DestinatariosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Destinatários</h1>
            <p className="text-gray-600">
              Gerencie os destinatários dos seus orçamentos
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/destinatarios/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Destinatário
          </Link>
        </Button>
      </div>

      <Suspense fallback={<TableSkeleton rows={5} />}>
        <DestinatariosList />
      </Suspense>
    </div>
  );
}
