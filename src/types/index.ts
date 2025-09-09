// Tipos principais do sistema de orçamentos

export interface Cliente {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  createdAt: Date;
  updatedAt: Date;
  destinatarios?: Destinatario[];
  orcamentos?: Orcamento[];
}

export interface Destinatario {
  id: number;
  nome: string;
  email: string;
  clienteId: number;
  createdAt: Date;
  updatedAt: Date;
  cliente?: Cliente;
  orcamentos?: Orcamento[];
}

export interface Orcamento {
  id: number;
  descricao: string;
  preco: number;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Cancelado' | 'Em Andamento' | 'Concluído';
  formaPagamento: boolean; // true = "7 dias após o vencimento da nota"
  dataInicio: Date;
  dataTermino: Date | null;
  clienteId: number;
  createdAt: Date;
  updatedAt: Date;
  cliente?: Cliente;
  destinatarios?: Destinatario[];
  emailsEnviados?: EmailEnviado[];
  statusHistory?: StatusHistory[];
}

export interface StatusHistory {
  id: number;
  orcamentoId: number;
  status: string;
  dataMudanca: Date;
  observacao?: string;
  orcamento?: Orcamento;
}

export interface EmailEnviado {
  id: number;
  orcamentoId: number;
  destinatarioId: number;
  dataEnvio: Date;
  status: 'Enviado' | 'Falhou' | 'Pendente';
  orcamento?: Orcamento;
  destinatario?: Destinatario;
}

// Tipos para criação/atualização
export interface CreateClienteData {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
}

export interface UpdateClienteData extends Partial<CreateClienteData> {}

export interface CreateDestinatarioData {
  nome: string;
  email: string;
  clienteId: number;
}

export interface UpdateDestinatarioData extends Partial<CreateDestinatarioData> {}

export interface CreateOrcamentoData {
  descricao: string;
  preco: number;
  status?: 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Cancelado' | 'Em Andamento' | 'Concluído';
  formaPagamento: boolean; // true = "7 dias após o vencimento da nota"
  dataInicio: Date;
  dataTermino?: Date;
  clienteId: number;
  destinatarioIds: number[];
}

export interface UpdateOrcamentoData extends Partial<CreateOrcamentoData> {}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para PDF
export interface PDFData {
  orcamentoId: number;
  tipo: 'padrao' | 'editavel' | 'simples';
}

// Tipos para Email
export interface EmailData {
  orcamentoId: number;
  destinatarioIds: number[];
}

// Tipos para filtros e busca
export interface ClienteFilters {
  q?: string; // busca por nome
  page?: number;
  limit?: number;
}

export interface DestinatarioFilters {
  clienteId?: number;
  page?: number;
  limit?: number;
}

export interface OrcamentoFilters {
  clienteId?: number;
  status?: string;
  page?: number;
  limit?: number;
}
