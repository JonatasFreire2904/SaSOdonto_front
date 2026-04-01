/**
 * Utilitários de FORMATAÇÃO de CPF para a interface do usuário.
 *
 * VALIDAÇÃO DE CPF REMOVIDA:
 * A validação do algoritmo módulo-11 é responsabilidade do backend.
 * O frontend NÃO deve ser a única barreira de validação de documentos.
 * O backend deve retornar erro 400 com mensagem clara para CPFs inválidos.
 */

export const normalizeCpf = (value: string): string =>
  value.replace(/\D/g, "").slice(0, 11);

export const formatCpf = (value: string): string => {
  const digits = normalizeCpf(value);
  if (!digits) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

/** Validação de formato apenas (UX) — não valida algoritmo de dígitos verificadores */
export const isCpfFormatComplete = (value: string): boolean =>
  normalizeCpf(value).length === 11;
