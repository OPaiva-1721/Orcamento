'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingCard, TableSkeleton } from '@/components/ui/loading';
import { ResponsiveTable, TableActions } from '@/components/ui/responsive-table';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Plus, Users, Mail, Phone, Building, Edit, ArrowLeft } from 'lucide-react';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cnpj: string;
  createdAt: string;
  destinatarios: {
    id: number;
    nome: string;
    email: string;
  }[];
  orcamentos: {
    id: number;
    descricao: string;
    preco: number;
    status: string;
  }[];
}

// Componente para listar clientes
function ClientesList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const response = await fetch('/api/clientes');
      const data = await response.json();
      
      if (data.success) {
        setClientes(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  if (clientes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum cliente encontrado
          </h3>
          <p className="text-gray-500 mb-6">
            Comece criando seu primeiro cliente
          </p>
          <Button asChild>
            <Link href="/clientes/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

    const columns = [
      {
        key: 'nome' as keyof typeof clientes[0],
        label: 'Nome',
        render: (value: string, item: typeof clientes[0]) => (
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{value}</span>
          </div>
        ),
        mobileLabel: 'Cliente'
      },
      {
        key: 'email' as keyof typeof clientes[0],
        label: 'Email',
        render: (value: string) => (
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{value}</span>
          </div>
        ),
        mobileHidden: false
      },
      {
        key: 'telefone' as keyof typeof clientes[0],
        label: 'Telefone',
        render: (value: string) => (
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{value}</span>
          </div>
        ),
        mobileHidden: false
      },
      {
        key: 'cnpj' as keyof typeof clientes[0],
        label: 'CNPJ',
        mobileHidden: false
      },
      {
        key: 'destinatarios' as keyof typeof clientes[0],
        label: 'Destinatários',
        render: (value: Cliente['destinatarios']) => (
          <span className="text-sm text-gray-600">
            {value.length} destinatário(s)
          </span>
        ),
        mobileHidden: true
      },
      {
        key: 'orcamentos' as keyof typeof clientes[0],
        label: 'Orçamentos',
        render: (value: Cliente['orcamentos']) => (
          <span className="text-sm text-gray-600">
            {value.length} orçamento(s)
          </span>
        ),
        mobileHidden: true
      },
      {
        key: 'createdAt' as keyof typeof clientes[0],
        label: 'Criado em',
        render: (value: Date) => (
          <span className="text-sm text-gray-500">
            {formatDate(value)}
          </span>
        ),
        mobileHidden: true
      }
    ];

  return (
    <ResponsiveTable
      data={clientes}
      columns={columns}
      keyField="id"
      emptyMessage="Nenhum cliente encontrado"
      actions={(cliente) => (
        <TableActions
          onEdit={() => window.location.href = `/clientes/${cliente.id}`}
          editLabel="Editar"
        />
      )}
    />
  );
}

export default function ClientesPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-gray-600">
              Gerencie seus clientes e suas informações
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/clientes/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      <ClientesList />
    </div>
  );
}
