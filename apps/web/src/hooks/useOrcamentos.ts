import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type { Orcamento, CreateOrcamentoData, UpdateOrcamentoData, PaginatedResponse, OrcamentoFilterParams } from '@orcamento/shared-types';

export function useOrcamentos(filters?: OrcamentoFilterParams) {
  const query = new URLSearchParams();
  if (filters?.clienteId) query.set('clienteId', String(filters.clienteId));
  if (filters?.status)    query.set('status',    filters.status);
  if (filters?.page)      query.set('page',      String(filters.page));
  if (filters?.limit)     query.set('limit',     String(filters.limit));

  return useQuery<PaginatedResponse<Orcamento>>({
    queryKey: ['orcamentos', filters],
    queryFn:  () => api.get(`/orcamentos?${query}`),
  });
}

export function useOrcamento(id: number) {
  return useQuery<Orcamento>({
    queryKey: ['orcamentos', id],
    queryFn:  () => api.get(`/orcamentos/${id}`),
    enabled:  !!id,
  });
}

export function useCreateOrcamento() {
  const qc = useQueryClient();
  return useMutation<Orcamento, Error, CreateOrcamentoData>({
    mutationFn: (data) => api.post('/orcamentos', data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['orcamentos'] }),
  });
}

export function useUpdateOrcamento() {
  const qc = useQueryClient();
  return useMutation<Orcamento, Error, { id: number; data: UpdateOrcamentoData }>({
    mutationFn: ({ id, data }) => api.put(`/orcamentos/${id}`, data),
    onSuccess:  (_r, { id }) => {
      qc.invalidateQueries({ queryKey: ['orcamentos'] });
      qc.invalidateQueries({ queryKey: ['orcamentos', id] });
    },
  });
}

export function useDeleteOrcamento() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/orcamentos/${id}`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['orcamentos'] }),
  });
}

export function useSendEmail() {
  return useMutation<any, Error, { orcamentoId: number; destinatarioIds: number[] }>({
    mutationFn: ({ orcamentoId, destinatarioIds }) =>
      api.post(`/orcamentos/${orcamentoId}/emails`, { destinatarioIds }),
  });
}
