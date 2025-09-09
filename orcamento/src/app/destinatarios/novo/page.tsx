'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface Cliente {
  id: number;
  nome: string;
  email: string;
}

export default function NovoDestinatarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    clienteId: '',
  });

  useEffect(() => {
    // Carregar clientes
    fetch('/api/clientes')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setClientes(data.data);
        }
      })
      .catch(error => {
        console.error('Erro ao carregar clientes:', error);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/destinatarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          clienteId: parseInt(formData.clienteId),
        }),
      });

      if (response.ok) {
        router.push('/destinatarios');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar destinatário');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar destinatário');
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
          <h1 className="text-3xl font-bold tracking-tight">Novo Destinatário</h1>
          <p className="text-gray-600">
            Cadastre um novo destinatário para receber orçamentos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Destinatário</CardTitle>
          <CardDescription>
            Preencha os dados do destinatário que será cadastrado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Salvar Destinatário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
