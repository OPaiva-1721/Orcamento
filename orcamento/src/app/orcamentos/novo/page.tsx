'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  destinatarios: Destinatario[];
}

interface Destinatario {
  id: number;
  nome: string;
  email: string;
}

export default function NovoOrcamentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState({
    descricao: '',
    preco: '',
    status: 'Pendente',
    formaPagamento: false,
    dataInicio: '',
    dataTermino: '',
    clienteId: '',
    destinatarioIds: [] as number[],
  });

  useEffect(() => {
    // Carregar clientes com destinatários
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
    
    // Validação: Data de término obrigatória quando status for "Concluído"
    if (formData.status === 'Concluído' && !formData.dataTermino) {
      alert('A data de término é obrigatória quando o status for "Concluído"');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/orcamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          preco: parseFloat(formData.preco),
          clienteId: parseInt(formData.clienteId),
        }),
      });

      if (response.ok) {
        router.push('/orcamentos');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar orçamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar orçamento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDestinatarioChange = (destinatarioId: number, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        destinatarioIds: [...formData.destinatarioIds, destinatarioId],
      });
    } else {
      setFormData({
        ...formData,
        destinatarioIds: formData.destinatarioIds.filter(id => id !== destinatarioId),
      });
    }
  };

  const selectedCliente = clientes.find(c => c.id === parseInt(formData.clienteId));

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/orcamentos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Orçamento</h1>
          <p className="text-gray-600">
            Crie um novo orçamento para um cliente
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Orçamento</CardTitle>
          <CardDescription>
            Preencha os dados do orçamento que será criado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Descrição"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Ex: Desenvolvimento de Sistema Web"
                  required
                />
              </div>
              
              <Input
                label="Preço"
                name="preco"
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
              
              <div>
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
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Rejeitado">Rejeitado</option>
                  <option value="Cancelado">Cancelado</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                </select>
                {formData.status === 'Concluído' && (
                  <p className="text-xs text-green-600 mt-1">
                    ℹ️ Status "Concluído" automaticamente marca como "Aprovado"
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="formaPagamento"
                    name="formaPagamento"
                    checked={formData.formaPagamento}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="formaPagamento" className="text-sm font-medium text-gray-700">
                    7 dias após o vencimento da nota
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Marque esta opção se o pagamento será feito 7 dias após o vencimento da nota
                </p>
              </div>
              
              <Input
                label="Data de Início"
                name="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={handleChange}
                required
              />
              
              <Input
                label={formData.status === 'Concluído' ? 'Data de Término *' : 'Data de Término (Opcional)'}
                name="dataTermino"
                type="date"
                value={formData.dataTermino}
                onChange={handleChange}
                required={formData.status === 'Concluído'}
              />
            </div>
            
            {/* Seleção de Destinatários */}
            {selectedCliente && selectedCliente.destinatarios.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Destinatários do Orçamento
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Selecione os destinatários que receberão este orçamento
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCliente.destinatarios.map((destinatario) => (
                    <div key={destinatario.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        id={`destinatario-${destinatario.id}`}
                        checked={formData.destinatarioIds.includes(destinatario.id)}
                        onChange={(e) => handleDestinatarioChange(destinatario.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={`destinatario-${destinatario.id}`}
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          {destinatario.nome}
                        </label>
                        <p className="text-xs text-gray-500">{destinatario.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedCliente && selectedCliente.destinatarios.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Este cliente não possui destinatários cadastrados. 
                  <Link href="/destinatarios/novo" className="text-blue-600 hover:underline ml-1">
                    Cadastre destinatários
                  </Link>
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/orcamentos">Cancelar</Link>
              </Button>
              <Button type="submit" loading={loading}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Orçamento
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
