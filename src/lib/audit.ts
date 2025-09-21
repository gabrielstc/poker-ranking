/**
 * Sistema de logs de auditoria para multi-tenant
 * Registra ações críticas para segurança e compliance
 */

export interface AuditLogEntry {
  timestamp: Date
  userId: string
  userEmail: string
  action: string
  resource: string
  resourceId?: string
  clubId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'
}

export type AuditAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_PLAYER'
  | 'UPDATE_PLAYER'
  | 'DELETE_PLAYER'
  | 'CREATE_TOURNAMENT'
  | 'UPDATE_TOURNAMENT'
  | 'DELETE_TOURNAMENT'
  | 'CREATE_CLUB'
  | 'UPDATE_CLUB'
  | 'DELETE_CLUB'
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'ACCESS_CLUB_DATA'
  | 'EXPORT_DATA'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'

export class AuditLogger {
  private static instance: AuditLogger
  
  private constructor() {}
  
  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }
  
  /**
   * Registra uma ação de auditoria
   */
  public log(entry: Omit<AuditLogEntry, 'timestamp'>): void {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date()
    }
    
    // Log para console com formatação
    this.logToConsole(fullEntry)
    
    // Em produção, enviar para serviço de logs
    if (process.env.NODE_ENV === 'production') {
      this.logToService(fullEntry)
    }
  }
  
  /**
   * Log formatado para console
   */
  private logToConsole(entry: AuditLogEntry): void {
    const emoji = this.getEmojiForAction(entry.action)
    const level = this.getLevelColor(entry.level)
    
    console.log(
      `${level} ${emoji} AUDIT: ${entry.action} | User: ${entry.userEmail} | Resource: ${entry.resource}${
        entry.resourceId ? ` (${entry.resourceId})` : ''
      }${entry.clubId ? ` | Club: ${entry.clubId}` : ''}`
    )
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.log(`   📋 Metadata:`, entry.metadata)
    }
  }
  
  /**
   * Enviar para serviço de logs em produção
   */
  private async logToService(entry: AuditLogEntry): Promise<void> {
    try {
      // Aqui você implementaria o envio para um serviço como:
      // - CloudWatch
      // - DataDog
      // - Splunk
      // - ElasticSearch
      // - Seu próprio banco de auditoria
      
      // Exemplo de estrutura para envio:
      const logData = {
        auditTimestamp: entry.timestamp.toISOString(),
        application: 'poker-ranking',
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version,
        userId: entry.userId,
        userEmail: entry.userEmail,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        clubId: entry.clubId,
        level: entry.level,
        metadata: entry.metadata
      }
      
      // Implementar envio real aqui
      // await externalLogService.send(logData)
      console.log('📤 Audit log prepared for external service:', JSON.stringify(logData, null, 2))
      
    } catch (error) {
      console.error('❌ Erro ao enviar log de auditoria:', error)
    }
  }
  
  /**
   * Obter emoji para a ação
   */
  private getEmojiForAction(action: string): string {
    const emojiMap: Record<string, string> = {
      'LOGIN': '🔑',
      'LOGOUT': '🚪',
      'CREATE_PLAYER': '👤',
      'UPDATE_PLAYER': '✏️',
      'DELETE_PLAYER': '🗑️',
      'CREATE_TOURNAMENT': '🏆',
      'UPDATE_TOURNAMENT': '📝',
      'DELETE_TOURNAMENT': '❌',
      'CREATE_CLUB': '🏢',
      'UPDATE_CLUB': '🔧',
      'DELETE_CLUB': '💥',
      'CREATE_USER': '👥',
      'UPDATE_USER': '⚙️',
      'DELETE_USER': '🚫',
      'ACCESS_CLUB_DATA': '📊',
      'EXPORT_DATA': '📤',
      'UNAUTHORIZED_ACCESS_ATTEMPT': '🚨'
    }
    
    return emojiMap[action] || '📋'
  }
  
  /**
   * Obter cor para o nível
   */
  private getLevelColor(level: string): string {
    const colorMap: Record<string, string> = {
      'INFO': '💙',
      'WARN': '⚠️',
      'ERROR': '❌',
      'CRITICAL': '🚨'
    }
    
    return colorMap[level] || '📋'
  }
}

// Funções helper para facilitar o uso
export const auditLogger = AuditLogger.getInstance()

/**
 * Helper para logar login
 */
export function logLogin(userEmail: string, userId: string, metadata?: Record<string, unknown>): void {
  auditLogger.log({
    userId,
    userEmail,
    action: 'LOGIN',
    resource: 'auth',
    level: 'INFO',
    metadata
  })
}

/**
 * Helper para logar tentativa de acesso não autorizado
 */
export function logUnauthorizedAccess(
  userEmail: string, 
  userId: string, 
  attemptedResource: string, 
  attemptedClubId?: string,
  metadata?: Record<string, unknown>
): void {
  auditLogger.log({
    userId,
    userEmail,
    action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    resource: attemptedResource,
    clubId: attemptedClubId,
    level: 'CRITICAL',
    metadata
  })
}

/**
 * Helper para logar acesso a dados de clube
 */
export function logClubDataAccess(
  userEmail: string,
  userId: string,
  clubId: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, unknown>
): void {
  auditLogger.log({
    userId,
    userEmail,
    action: 'ACCESS_CLUB_DATA',
    resource,
    resourceId,
    clubId,
    level: 'INFO',
    metadata
  })
}

/**
 * Helper para logar criação de recursos
 */
export function logResourceCreation(
  userEmail: string,
  userId: string,
  resource: string,
  resourceId: string,
  clubId?: string,
  metadata?: Record<string, unknown>
): void {
  const action = `CREATE_${resource.toUpperCase()}` as AuditAction
  
  auditLogger.log({
    userId,
    userEmail,
    action,
    resource,
    resourceId,
    clubId,
    level: 'INFO',
    metadata
  })
}