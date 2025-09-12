import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes CSS usando clsx e tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor monetário para o padrão brasileiro
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma data para o padrão brasileiro
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return '--/--/----';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}


/**
 * Valida se um email é válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida se um CNPJ é válido
 */
export function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    const digit = cleanCNPJ[i];
    if (digit === undefined) return false;
    sum += parseInt(digit) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  const digit12 = cleanCNPJ[12];
  if (digit12 === undefined || parseInt(digit12) !== digit1) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    const digit = cleanCNPJ[i];
    if (digit === undefined) return false;
    sum += parseInt(digit) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  const digit13 = cleanCNPJ[13];
  return digit13 !== undefined && parseInt(digit13) === digit2;
}

