'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/badge';
import { LoadingCard, TableSkeleton } from '@/components/ui/loading';
import { ResponsiveTable, TableActions } from '@/components/ui/responsive-table';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Plus, FileText, Users, Calendar, DollarSign, Send, Download, Edit, FileEdit, ArrowLeft } from 'lucide-react';

interface Cliente {
  id: number;
  nome: string;
  email: string;
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
}

interface Orcamento {
  id: number;
  descricao: string;
  preco: number;
  status: string;
  formaPagamento: boolean;
  dataInicio: string;
  dataTermino: string | null;
  createdAt: string;
  cliente: Cliente;
  destinatarios: Destinatario[];
  emailsEnviados: EmailEnviado[];
}

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState<number | null>(null);

  useEffect(() => {
    carregarOrcamentos();
  }, []);

  const carregarOrcamentos = async () => {
    try {
      const response = await fetch('/api/orcamentos');
      const data = await response.json();
      
      if (data.success) {
        setOrcamentos(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const enviarEmail = async (orcamentoId: number, destinatarioIds: number[]) => {
    setSendingEmail(orcamentoId);
    
    try {
      const response = await fetch('/api/enviar-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orcamentoId,
          destinatarioIds,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Email enviado com sucesso! ${data.message}`);
        // Recarregar orçamentos para atualizar status
        carregarOrcamentos();
      } else {
        alert(`Erro ao enviar email: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      alert('Erro ao enviar email');
    } finally {
      setSendingEmail(null);
    }
  };

  const gerarPDF = async (orcamentoId: number) => {
    setGeneratingPDF(orcamentoId);
    
    try {
      const response = await fetch('/api/gerar-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orcamentoId,
        }),
      });

      if (response.ok) {
        // Criar blob e fazer download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orcamento_aguia_${orcamentoId}.pdf`;
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
      setGeneratingPDF(null);
    }
  };

  const gerarPDFEditavel = async (orcamentoId: number) => {
    setGeneratingPDF(orcamentoId);
    
    try {
      const response = await fetch('/api/gerar-pdf-editavel-simples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orcamentoId,
        }),
      });

      if (response.ok) {
        // Criar blob e fazer download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orcamento_aguia_editavel_${orcamentoId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        alert(`Erro ao gerar PDF editável: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF editável:', error);
      alert('Erro ao gerar PDF editável');
    } finally {
      setGeneratingPDF(null);
    }
  };

  if (loading) {
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
              <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
              <p className="text-gray-600">Gerencie todos os orçamentos do sistema</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/orcamentos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={carregarOrcamentos}>
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
              <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
              <p className="text-gray-600">Gerencie todos os orçamentos do sistema</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/orcamentos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Link>
          </Button>
        </div>

      {orcamentos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento encontrado</h3>
            <p className="text-gray-500 text-center mb-6">
              Comece criando seu primeiro orçamento para gerenciar suas propostas comerciais.
            </p>
            <Button asChild>
              <Link href="/orcamentos/novo">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Orçamento
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ResponsiveTable
          data={orcamentos}
          columns={[
            {
              key: 'descricao',
              label: 'Descrição',
              render: (value: string, item: Orcamento) => (
                <div className="space-y-1">
                  <div className="font-medium">{value}</div>
                  <StatusBadge status={item.status} />
                </div>
              ),
              mobileLabel: 'Orçamento'
            },
            {
              key: 'cliente',
              label: 'Cliente',
              render: (value: Cliente) => (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{value.nome}</span>
                </div>
              ),
              mobileHidden: false
            },
            {
              key: 'preco',
              label: 'Valor',
              render: (value: number) => (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {formatCurrency(value)}
                  </span>
                </div>
              ),
              mobileHidden: false
            },
            {
              key: 'dataInicio',
              label: 'Data Início',
              render: (value: string) => (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{formatDate(value)}</span>
                </div>
              ),
              mobileHidden: true
            },
            {
              key: 'dataTermino',
              label: 'Data Término',
              render: (value: string) => (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{formatDate(value)}</span>
                </div>
              ),
              mobileHidden: true
            },
            {
              key: 'destinatarios',
              label: 'Destinatários',
              render: (value: Destinatario[]) => (
                <span className="text-sm text-gray-600">
                  {value.length} destinatário(s)
                </span>
              ),
              mobileHidden: true
            },
            {
              key: 'createdAt',
              label: 'Criado em',
              render: (value: string) => (
                <span className="text-sm text-gray-500">
                  {formatDate(value)}
                </span>
              ),
              mobileHidden: true
            }
          ]}
          keyField="id"
          emptyMessage="Nenhum orçamento encontrado"
          actions={(orcamento) => (
            <div className="flex flex-wrap gap-2">
              {orcamento.destinatarios.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => enviarEmail(orcamento.id, orcamento.destinatarios.map(d => d.id))}
                  disabled={sendingEmail === orcamento.id}
                  className="flex items-center space-x-1"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {sendingEmail === orcamento.id ? 'Enviando...' : 'Email'}
                  </span>
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => gerarPDF(orcamento.id)}
                disabled={generatingPDF === orcamento.id}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {generatingPDF === orcamento.id ? 'Gerando...' : 'PDF'}
                </span>
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => gerarPDFEditavel(orcamento.id)}
                disabled={generatingPDF === orcamento.id}
                className="flex items-center space-x-1"
              >
                <FileEdit className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {generatingPDF === orcamento.id ? 'Gerando...' : 'Editável'}
                </span>
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                asChild
                className="flex items-center space-x-1"
              >
                <Link href={`/orcamentos/${orcamento.id}`}>
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Link>
              </Button>
            </div>
          )}
        />
      )}
      </div>
    </PullToRefresh>
  );
}