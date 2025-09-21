import { z } from 'zod'

// Schema para criação de jogador
export const CreatePlayerSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  nickname: z.string()
    .min(2, 'Nickname deve ter pelo menos 2 caracteres')
    .max(50, 'Nickname deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Nickname deve conter apenas letras, números, underscore e hífen')
    .trim()
    .toLowerCase(),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]{10,20}$/, 'Telefone inválido')
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal(''))
})

// Schema para criação de torneio
export const CreateTournamentSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .trim(),
  date: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Data inválida'),
  buyIn: z.number()
    .positive('Buy-in deve ser positivo')
    .max(999999, 'Buy-in muito alto')
    .optional(),
  description: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  status: z.enum(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    .default('UPCOMING'),
  type: z.enum(['FIXO', 'EXPONENCIAL'])
    .default('EXPONENCIAL'),
  clubId: z.string()
    .uuid('ClubId deve ser um UUID válido')
    .optional() // Apenas para super admin
})

// Schema para criação de clube
export const CreateClubSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  description: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  logo: z.string()
    .url('Logo deve ser uma URL válida')
    .optional()
    .or(z.literal('')),
  supremaId: z.string()
    .max(50, 'SupremaId deve ter no máximo 50 caracteres')
    .optional()
    .or(z.literal(''))
})

// Schema para participação em torneio
export const TournamentParticipationSchema = z.object({
  playerId: z.string()
    .uuid('PlayerId deve ser um UUID válido'),
  position: z.number()
    .int('Posição deve ser um número inteiro')
    .positive('Posição deve ser positiva')
    .max(500, 'Posição muito alta')
    .optional(),
  points: z.number()
    .min(0, 'Pontos devem ser positivos')
    .max(999999, 'Pontos muito altos')
    .optional(),
  prize: z.number()
    .min(0, 'Prêmio deve ser positivo')
    .max(999999999, 'Prêmio muito alto')
    .optional(),
  eliminated: z.boolean()
    .default(false)
})

// Schema para login
export const LoginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .max(128, 'Senha muito longa')
})

// Schema para criação de usuário
export const CreateUserSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .trim(),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  role: z.enum(['SUPER_ADMIN', 'CLUB_ADMIN'])
    .default('CLUB_ADMIN'),
  clubId: z.string()
    .uuid('ClubId deve ser um UUID válido')
    .optional()
})

// Schema para query de ranking
export const RankingQuerySchema = z.object({
  from: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Data de início inválida')
    .optional(),
  to: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Data de fim inválida')
    .optional(),
  clubId: z.string()
    .uuid('ClubId deve ser um UUID válido')
    .optional(),
  clubSlug: z.string()
    .min(1, 'ClubSlug não pode estar vazio')
    .max(100, 'ClubSlug muito longo')
    .optional()
})

// Função helper para validar dados
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: z.ZodIssue) => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      throw new Error(`Dados inválidos: ${errorMessages}`)
    }
    throw error
  }
}

// Função helper para validar dados de forma não-blocante
export function safeValidateSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  error?: string
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: z.ZodIssue) => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      return { success: false, error: `Dados inválidos: ${errorMessages}` }
    }
    return { success: false, error: 'Erro de validação desconhecido' }
  }
}