"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Trophy, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { useClub } from "@/contexts/ClubContext"
import Image from "next/image"

interface Club {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  supremaId: string | null
  _count: {
    players: number
    tournaments: number
  }
}

export default function HomePage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { setCurrentClub } = useClub()

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/public/clubs')
      if (response.ok) {
        const data: Club[] = await response.json()
        setClubs(data)
      }
    } catch (error) {
      console.error('Erro ao buscar clubes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClubClick = (club: Club) => {
    // Definir o contexto do clube
    setCurrentClub({
      id: club.id,
      name: club.name,
      slug: club.slug,
      logo: club.logo,
      supremaId: club.supremaId
    })
    
    // Navegar para a página do clube
    router.push(`/clube/${club.slug}`)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
          Clubes de Poker
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground px-4">
          Selecione um clube para acessar seus torneios e rankings
        </p>
      </div>

      {/* Lista de Clubes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando clubes...</p>
          </div>
        ) : clubs.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum clube encontrado</p>
          </div>
        ) : (
          clubs.map((club) => (
            <Card 
              key={club.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
              onClick={() => handleClubClick(club)}
            >
              <CardHeader className="text-center space-y-4">
                {club.logo ? (
                  <div className="mx-auto">
                    <Image 
                      src={club.logo} 
                      alt={`${club.name} logo`} 
                      width={80} 
                      height={80} 
                      className="h-20 w-20 object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="mx-auto bg-muted rounded-lg w-20 h-20 flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <CardTitle className="text-xl">{club.name}</CardTitle>
                {club.description && (
                  <p className="text-sm text-muted-foreground">{club.description}</p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Estatísticas do clube */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Jogadores</span>
                    </div>
                    <p className="text-lg font-bold">{club._count.players}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-1">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Torneios</span>
                    </div>
                    <p className="text-lg font-bold">{club._count.tournaments}</p>
                  </div>
                </div>

                {/* Suprema ID */}
                {club.supremaId && (
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <span className="text-muted-foreground">Suprema ID:</span>
                      <span className="font-mono font-semibold text-primary">{club.supremaId}</span>
                    </div>
                  </div>
                )}

                {/* Botão de acesso */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-primary">
                    <span>Acessar clube</span>
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Informações adicionais */}
      {clubs.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              Total de <strong>{clubs.length}</strong> clube{clubs.length !== 1 ? 's' : ''} disponível{clubs.length !== 1 ? 'eis' : ''}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
