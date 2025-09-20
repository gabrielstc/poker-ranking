'use client'

import { useClub } from '@/contexts/ClubContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function TestClubContext() {
  const { currentClub, isLoading } = useClub()
  const router = useRouter()

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Teste do Contexto de Clube</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Status atual:</h3>
            {isLoading ? (
              <p>Carregando informações do clube...</p>
            ) : currentClub ? (
              <div className="space-y-2">
                <p><strong>Nome:</strong> {currentClub.name}</p>
                <p><strong>Slug:</strong> {currentClub.slug}</p>
                <p><strong>ID:</strong> {currentClub.id}</p>
                <p><strong>Logo:</strong> {currentClub.logo ? 'Configurada' : 'Não configurada'}</p>
                <p><strong>Suprema ID:</strong> {currentClub.supremaId || 'Não configurado'}</p>
                {currentClub.supremaId && (
                  <p className="text-green-600"><strong>🎯 Propaganda ativa!</strong></p>
                )}
              </div>
            ) : (
              <p>Nenhum clube detectado no contexto atual</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Testar navegação:</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
              >
                Página Inicial
              </Button>
              <Button 
                onClick={() => router.push('/clube/five-series')}
                variant="outline"
              >
                /clube/five-series
              </Button>
              <Button 
                onClick={() => router.push('/admin/tournaments')}
                variant="outline"
              >
                Admin Torneios
              </Button>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Como funciona:</h4>
            <ul className="text-sm space-y-1">
              <li>• <strong>URL /clube/[slug]:</strong> Detecta clube pela URL</li>
              <li>• <strong>Admin logado:</strong> Usa clube da sessão</li>
              <li>• <strong>Página inicial:</strong> Sem clube específico</li>
              <li>• <strong>Navbar:</strong> Mostra logo e nome do clube atual</li>
              <li>• <strong>Suprema ID:</strong> Quando configurado, exibe propaganda nas telas de torneios</li>
            </ul>
          </div>

          {currentClub?.supremaId && (
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">
                🎯 Preview da Propaganda Ativa:
              </h4>
              <div className="space-y-2">
                <div className="text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                  Variante: Banner (usado em listas de torneios)
                </div>
                <div className="text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                  Variante: Compact (usado em detalhes de torneio)
                </div>
                <div className="text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                  Variante: Default (usado em admin)
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}