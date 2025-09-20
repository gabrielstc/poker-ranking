import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export interface UserSession {
  id: string
  email: string
  name?: string | null
  role: string
  clubId: string | null
  clubName: string | null
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const session = await getServerSession(authOptions)
  return session?.user as UserSession || null
}

export async function requireAuth(): Promise<UserSession> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Usuário não autenticado')
  }
  return user
}

export async function requireSuperAdmin(): Promise<UserSession> {
  const user = await requireAuth()
  if (user.role !== 'SUPER_ADMIN') {
    throw new Error('Acesso negado: Requer super admin')
  }
  return user
}

export async function requireClubAdmin(clubId?: string): Promise<UserSession> {
  const user = await requireAuth()
  
  if (user.role === 'SUPER_ADMIN') {
    return user // Super admin tem acesso a tudo
  }
  
  if (user.role !== 'CLUB_ADMIN') {
    throw new Error('Acesso negado: Requer admin do clube')
  }
  
  // Se clubId foi especificado, verificar se o usuário pertence ao clube
  if (clubId && user.clubId !== clubId) {
    throw new Error('Acesso negado: Usuário não pertence a este clube')
  }
  
  return user
}

export function isSuperAdmin(user: UserSession): boolean {
  return user.role === 'SUPER_ADMIN'
}

export function isClubAdmin(user: UserSession): boolean {
  return user.role === 'CLUB_ADMIN'
}

export function canAccessClub(user: UserSession, clubId: string): boolean {
  return user.role === 'SUPER_ADMIN' || user.clubId === clubId
}

export function getUserClubFilter(user: UserSession): { clubId?: string } {
  // Super admin pode ver tudo, club admin só vê seu clube
  return user.role === 'SUPER_ADMIN' ? {} : { clubId: user.clubId! }
}