'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Save, Users } from 'lucide-react';
import Link from 'next/link';
import { isValidEmail, isValidCNPJ } from '@/lib/utils';

interface Cliente {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  destinatarios: Destinatario[];
  orcamentos: Orcamento[];
}

interface Destinatario {
  id: number;
  nome: string;
  email: string;
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

export default function EditarClientePage({ params }: RouteParams) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
  });

  useEffect(() => {
    carregarCliente();
  }, [params.id]);

  const carregarCliente = async () => {
    try {
      const response = await fetch(`/api/clientes/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setCliente(data.data);
        setFormData({
          nome: data.data.nome,
          cnpj: data.data.cnpj,
          email: data.data.email,
          telefone: data.data.telefone,
        });
      } else {
        alert('Cliente não encontrado');
        router.push('/clientes');
      }
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      alert('Erro ao carregar cliente');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/clientes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Cliente atualizado com sucesso!');
        router.push('/clientes');
      } else {
        alert(`Erro ao atualizar cliente: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      alert('Erro ao atualizar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!cliente) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/clientes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
          <p className="text-gray-600">Atualize as informações do cliente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Edição */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
              <CardDescription>
                Atualize os dados do cliente {cliente.nome}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome da Empresa"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Ex: Empresa ABC Ltda"
                    required
                  />
                  
                  <Input
                    label="CNPJ"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                  
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contato@empresa.com"
                    required
                  />
                  
                  <Input
                    label="Telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/clientes">Cancelar</Link>
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
                <Users className="mr-2 h-5 w-5" />
                Destinatários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {cliente.destinatarios.length}
              </p>
              <p className="text-sm text-gray-600">
                destinatário(s) cadastrado(s)
              </p>
              {cliente.destinatarios.length > 0 && (
                <div className="mt-4">
                  <Link 
                    href="/destinatarios" 
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver todos os destinatários →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orçamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {cliente.orcamentos.length}
              </p>
              <p className="text-sm text-gray-600">
                orçamento(s) criado(s)
              </p>
              {cliente.orcamentos.length > 0 && (
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
