import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Mail, FileText } from 'lucide-react';
import { useOrcamentos, useDeleteOrcamento, useSendEmail } from '../../hooks/useOrcamentos';
import { formatCurrency, formatDate } from '../../lib/utils';

const STATUS_COLORS: Record<string, string> = {
  Pendente:      'bg-yellow-100 text-yellow-800',
  Aprovado:      'bg-green-100 text-green-800',
  Rejeitado:     'bg-red-100 text-red-800',
  Cancelado:     'bg-gray-100 text-gray-800',
  'Em Andamento': 'bg-blue-100 text-blue-800',
  'Concluído':   'bg-purple-100 text-purple-800',
};

export function OrcamentosPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrcamentos({ page });
  const deleteOrcamento = useDeleteOrcamento();
  const sendEmail       = useSendEmail();

  async function handleDelete(id: number, descricao: string) {
    if (!confirm(`Deletar orçamento "${descricao}"?`)) return;
    try { await deleteOrcamento.mutateAsync(id); }
    catch (err: any) { alert(err.message); }
  }

  async function handleSendEmail(orcamentoId: number, destinatarioIds: number[]) {
    if (!destinatarioIds.length) { alert('Nenhum destinatário associado.'); return; }
    try {
      await sendEmail.mutateAsync({ orcamentoId, destinatarioIds });
      alert('E-mail(s) enviado(s) com sucesso!');
    } catch (err: any) { alert(err.message); }
  }

  async function handleGerarPDF(orcamentoId: number, editavel = false) {
    const url = `${import.meta.env.VITE_API_BASE_URL}/orcamentos/${orcamentoId}/pdf${editavel ? '?tipo=editavel' : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${await (await import('firebase/auth')).getAuth().currentUser?.getIdToken()}` },
    });
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = objectUrl;
    a.download = `orcamento_${orcamentoId}${editavel ? '_editavel' : ''}.pdf`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
        <Link to="/orcamentos/novo" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Novo
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {data?.data.map((o) => (
            <div key={o.id} className="bg-white border border-gray-100 rounded-lg px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">{o.descricao}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{o.cliente?.nome} • {formatDate(o.dataInicio)}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-800'}`}>{o.status}</span>
                    <span className="text-sm font-semibold">{formatCurrency(o.preco)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleSendEmail(o.id, (o.destinatarios ?? []).map((d) => d.id))} className="p-2 text-gray-400 hover:text-blue-600" title="Enviar email">
                    <Mail size={15} />
                  </button>
                  <button onClick={() => handleGerarPDF(o.id)} className="p-2 text-gray-400 hover:text-blue-600" title="PDF">
                    <FileText size={15} />
                  </button>
                  <Link to={`/orcamentos/${o.id}`} className="p-2 text-gray-400 hover:text-blue-600">
                    <Pencil size={15} />
                  </Link>
                  <button onClick={() => handleDelete(o.id, o.descricao)} className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {data?.data.length === 0 && <div className="text-center py-10 text-gray-500">Nenhum orçamento encontrado.</div>}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="px-3 py-1 text-sm border rounded disabled:opacity-40">Anterior</button>
          <span className="px-3 py-1 text-sm">{page} / {data.totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page === data.totalPages} className="px-3 py-1 text-sm border rounded disabled:opacity-40">Próximo</button>
        </div>
      )}
    </div>
  );
}
