'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface ClubContextData {
  id: string
  name: string
  slug: string
  logo: string | null
  supremaId: string | null
}

interface ClubContextType {
  currentClub: ClubContextData | null
  setCurrentClub: (club: ClubContextData | null) => void
  isLoading: boolean
}

const ClubContext = createContext<ClubContextType | undefined>(undefined)

export function ClubProvider({ children }: { children: ReactNode }) {
  const [currentClub, setCurrentClub] = useState<ClubContextData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()
  const pathname = usePathname()

  useEffect(() => {
    const loadClub = async () => {
      setIsLoading(true)
      
      try {
        // 1. Verificar se estamos em uma página de clube específico (/clube/[slug])
        const clubPageMatch = pathname.match(/^\/clube\/([^\/]+)/)
        if (clubPageMatch) {
          const slug = clubPageMatch[1]
          const response = await fetch('/api/public/clubs')
          if (response.ok) {
            const clubs = await response.json()
            const club = clubs.find((c: { id: string; name: string; slug: string; logo: string | null }) => c.slug === slug)
            if (club) {
              setCurrentClub({
                id: club.id,
                name: club.name,
                slug: club.slug,
                logo: club.logo,
                supremaId: club.supremaId
              })
              return
            }
          }
        }

        // 2. Se o usuário está logado como CLUB_ADMIN, usar seu clube
        if (session?.user?.role === 'CLUB_ADMIN' && session.user.clubId && session.user.clubName) {
          // Buscar informações completas do clube
          const response = await fetch(`/api/public/clubs/${session.user.clubId}`)
          if (response.ok) {
            const club = await response.json()
            setCurrentClub({
              id: club.id,
              name: club.name,
              slug: club.slug,
              logo: club.logo,
              supremaId: club.supremaId
            })
          } else {
            // Fallback com dados da sessão
            setCurrentClub({
              id: session.user.clubId,
              name: session.user.clubName,
              slug: session.user.clubName.toLowerCase().replace(/\s+/g, '-'),
              logo: null,
              supremaId: null
            })
          }
          return
        }

        // 3. Para outras situações, não definir clube (usar logo padrão)
        setCurrentClub(null)

      } catch (error) {
        console.error('Erro ao carregar clube:', error)
        setCurrentClub(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadClub()
  }, [pathname, session])

  return (
    <ClubContext.Provider value={{ currentClub, setCurrentClub, isLoading }}>
      {children}
    </ClubContext.Provider>
  )
}

export function useClub() {
  const context = useContext(ClubContext)
  if (context === undefined) {
    throw new Error('useClub must be used within a ClubProvider')
  }
  return context
}