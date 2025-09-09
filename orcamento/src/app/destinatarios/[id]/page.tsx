'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, User, Mail } from 'lucide-react';
import Link from 'next/link';
import { isValidEmail } from '@/lib/utils';

interface Cliente {
  id: number;
  nome: string;
  email: string;
}

interface Destinatario {
  id: number;
  nome: string;
  email: string;
  clienteId: number;
  cliente: Cliente;
  orcamentos: Orcamento[];
}

interface Orcamento {
  id: number;
  descricao: string;
  preco: number;
  status: string;
}

interface RouteParams {
  params: {
    id: string;
  };
}

export default function EditarDestinatarioPage({ params }: RouteParams) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [destinatario, setDestinatario] = useState<Destinatario | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    clienteId: '',
  });

  useEffect(() => {
    carregarDestinatario();
    carregarClientes();
  }, [params.id]);

  const carregarDestinatario = async () => {
    try {
      const response = await fetch(`/api/destinatarios/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setDestinatario(data.data);
        setFormData({
          nome: data.data.nome,
          email: data.data.email,
          clienteId: data.data.clienteId.toString(),
        });
      } else {
        alert('Destinatário não encontrado');
        router.push('/destinatarios');
      }
    } catch (error) {
      console.error('Erro ao carregar destinatário:', error);
      alert('Erro ao carregar destinatário');
    }
  };

  const carregarClientes = async () => {
    try {
      const response = await fetch('/api/clientes');
      const data = await response.json();
      
      if (data.success) {
        setClientes(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/destinatarios/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          clienteId: parseInt(formData.clienteId),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Destinatário atualizado com sucesso!');
        router.push('/destinatarios');
      } else {
        alert(`Erro ao atualizar destinatário: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar destinatário:', error);
      alert('Erro ao atualizar destinatário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!destinatario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando destinatário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/destinatarios">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Destinatário</h1>
          <p className="text-gray-600">Atualize as informações do destinatário</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Edição */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Destinatário</CardTitle>
              <CardDescription>
                Atualize os dados do destinatário {destinatario.nome}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Ex: João Silva"
                    required
                  />
                  
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="joao@empresa.com"
                    required
                  />
                  
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Cliente
                    </label>
                    <select
                      name="clienteId"
                      value={formData.clienteId}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      required
                    >
                      <option value="">Selecione um cliente</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/destinatarios">Cancelar</Link>
                  </Button>
                  <Button type="submit" loading={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Cliente Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{destinatario.cliente.nome}</p>
                <p className="text-sm text-gray-600 flex items-center">
                  <Mail className="mr-1 h-4 w-4" />
                  {destinatario.cliente.email}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orçamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {destinatario.orcamentos.length}
              </p>
              <p className="text-sm text-gray-600">
                orçamento(s) associado(s)
              </p>
              {destinatario.orcamentos.length > 0 && (
                <div className="mt-4">
                  <Link 
                    href="/orcamentos" 
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver todos os orçamentos →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
