'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/badge';
import { ArrowLeft, Save, Send, Download, Edit } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

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

interface EmailEnviado {
  id: number;
  status: string;
  dataEnvio: string;
  destinatario: Destinatario;
}

interface StatusHistory {
  id: number;
  status: string;
  dataMudanca: string;
  observacao?: string;
}

interface Orcamento {
  id: number;
  descricao: string;
  preco: number;
  status: string;
  formaPagamento: boolean;
  dataInicio: string;
  dataTermino: string;
  createdAt: string;
  cliente: Cliente;
  destinatarios: Destinatario[];
  emailsEnviados: EmailEnviado[];
  statusHistory: StatusHistory[];
}

interface RouteParams {
  params: {
    id: string;
  };
}

export default function EditarOrcamentoPage({ params }: RouteParams) {
  const router = useRouter();
  const resolvedParams = use(params as unknown as Promise<{ id: string }>);
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
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
    carregarOrcamento(resolvedParams.id);
  }, [resolvedParams.id]);

  const carregarOrcamento = async (id: string) => {
    try {
      const response = await fetch(`/api/orcamentos/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setOrcamento(data.data);
        setFormData({
          descricao: data.data.descricao,
          preco: data.data.preco.toString(),
          status: data.data.status,
          formaPagamento: data.data.formaPagamento,
          dataInicio: data.data.dataInicio ? new Date(data.data.dataInicio).toISOString().split('T')[0] : '',
          dataTermino: data.data.dataTermino ? new Date(data.data.dataTermino).toISOString().split('T')[0] : '',
          clienteId: data.data.clienteId.toString(),
          destinatarioIds: data.data.destinatarios.map((d: Destinatario) => d.id),
        } as typeof formData);
      } else {
        alert('Orçamento não encontrado');
        router.push('/orcamentos');
      }
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error);
      alert('Erro ao carregar orçamento');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação: Data de término obrigatória quando status for "Concluído"
    if (formData.status === 'Concluído' && !formData.dataTermino) {
      alert('A data de término é obrigatória quando o status for "Concluído"');
      return;
    }
    
    setLoading(true);

    try {
      const requestData = {
        ...formData,
        preco: parseFloat(formData.preco),
        clienteId: parseInt(formData.clienteId),
        dataTermino: formData.dataTermino || null,
      };
      
      console.log('Enviando dados:', requestData);
      
      const response = await fetch(`/api/orcamentos/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Orçamento atualizado com sucesso!');
        carregarOrcamento(resolvedParams.id); // Recarregar dados
      } else {
        alert(`Erro ao atualizar orçamento: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      alert('Erro ao atualizar orçamento');
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

  const enviarEmail = async () => {
    if (!orcamento || !orcamento.destinatarios || orcamento.destinatarios.length === 0) return;
    
    setSendingEmail(true);
    
    try {
      const response = await fetch('/api/enviar-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orcamentoId: orcamento.id,
          destinatarioIds: orcamento.destinatarios.map(d => d.id),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Email enviado com sucesso! ${data.message}`);
        carregarOrcamento(resolvedParams.id); // Recarregar dados
      } else {
        alert(`Erro ao enviar email: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      alert('Erro ao enviar email');
    } finally {
      setSendingEmail(false);
    }
  };

  const gerarPDF = async () => {
    if (!orcamento) return;
    
    setGeneratingPDF(true);
    
    try {
      const response = await fetch('/api/gerar-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orcamentoId: orcamento.id,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orcamento_${orcamento.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        alert(`Erro ao gerar PDF: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (!orcamento) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/orcamentos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Orçamento</h1>
            <p className="text-gray-600">Orçamento #{orcamento.id} - {orcamento.descricao}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {orcamento.destinatarios && orcamento.destinatarios.length > 0 && (
            <Button
              variant="outline"
              onClick={enviarEmail}
              disabled={sendingEmail}
            >
              <Send className="mr-2 h-4 w-4" />
              {sendingEmail ? 'Enviando...' : 'Enviar Email'}
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={gerarPDF}
            disabled={generatingPDF}
          >
            <Download className="mr-2 h-4 w-4" />
            {generatingPDF ? 'Gerando...' : 'PDF'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Edição */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Orçamento</CardTitle>
              <CardDescription>
                Atualize os dados do orçamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Descrição"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Ex: Desenvolvimento de Sistema Web"
                    required
                  />
                  
                  <Input
                    label="Preço"
                    name="preco"
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={handleChange}
                    placeholder="15000.00"
                    required
                  />
                  
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
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Aprovado">Aprovado</option>
                      <option value="Rejeitado">Rejeitado</option>
                      <option value="Cancelado">Cancelado</option>
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
                {orcamento.cliente.destinatarios && orcamento.cliente.destinatarios.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Destinatários do Orçamento
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {orcamento.cliente.destinatarios.map((destinatario) => (
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
                
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/orcamentos">Cancelar</Link>
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
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{orcamento.cliente.nome}</p>
                <p className="text-sm text-gray-600">{orcamento.cliente.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Valor:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(orcamento.preco)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <StatusBadge status={orcamento.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Destinatários:</span>
                <span className="font-medium">{orcamento.destinatarios ? orcamento.destinatarios.length : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Emails Enviados:</span>
                <span className="font-medium">{orcamento.emailsEnviados.length}</span>
              </div>
            </CardContent>
          </Card>

          {orcamento.statusHistory && orcamento.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orcamento.statusHistory.map((history) => (
                    <div key={history.id} className="border-l-2 border-blue-200 pl-3">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={history.status} />
                        <span className="text-xs text-gray-500">
                          {formatDate(history.dataMudanca)}
                        </span>
                      </div>
                      {history.observacao && (
                        <p className="text-sm text-gray-600 mt-1">
                          {history.observacao}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
