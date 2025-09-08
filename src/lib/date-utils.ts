/**
 * Utilitários para trabalhar com datas evitando problemas de timezone
 */

/**
 * Cria um objeto Date a partir de uma string de data no timezone local
 * Evita problemas de timezone quando a string é interpretada como UTC
 */
export const createLocalDate = (dateString: string): Date => {
  if (dateString.includes('T')) {
    // Se já tem horário, usar normalmente
    return new Date(dateString)
  }
  
  // Se for apenas uma data (YYYY-MM-DD), criar no timezone local
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day) // month - 1 porque Date usa 0-indexing para meses
}

/**
 * Formatar data para input HTML do tipo date (YYYY-MM-DD)
 * Usa timezone local para evitar problemas
 */
export const formatDateForInput = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? createLocalDate(date) : date
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Converte string de data para formato brasileiro (DD/MM/YYYY)
 * Usa timezone local para evitar problemas
 */
export const formatDateToBR = (dateString: string): string => {
  return createLocalDate(dateString).toLocaleDateString('pt-BR')
}

/**
 * Converte data do input (YYYY-MM-DD) para Date no timezone local
 * Usado quando recebemos data de formulários HTML
 */
export const parseDateFromInput = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}
