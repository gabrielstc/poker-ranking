'use client'

import { useState, useEffect, useCallback, use, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { formatDateToBR } from "@/lib/date-utils"
import { useRouter } from "next/navigation"
import { useClub } from "@/contexts/ClubContext"
import { useDebounce } from "@/hooks/useDebounce"
import { ClubHeader } from "@/components/ranking/ClubHeader"
import { RankingFilters } from "@/components/ranking/RankingFilters"
import { RankingTable } from "@/components/ranking/RankingTable"
import Link from "next/link"

interface RankingPlayer {
  position: number
  player: {
    id: string
    name: string
    nickname: string
  }
  totalPoints: number
  tournaments: number
  wins: number
  averagePosition: number | null
}

interface ClubInfo {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  _count: {
    players: number
    tournaments: number
  }
}

interface RankingResponse {
  ranking: RankingPlayer[]
  club: {
    id: string
    name: string
    slug: string
  } | null
}

export default function ClubRankingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { currentClub } = useClub()
  const [ranking, setRanking] = useState<RankingPlayer[]>([])
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  
  const router = useRouter()

  // Debounce das datas para evitar múltiplas requisições
  const debouncedFromDate = useDebounce(fromDate, 500)
  const debouncedToDate = useDebounce(toDate, 500)

  // Refs para cache e controle de requests
  const abortControllerRef = useRef<AbortController | null>(null)
  const rankingCacheRef = useRef<Map<string, { data: RankingPlayer[], timestamp: number }>>(new Map())
  const clubInfoCacheRef = useRef<ClubInfo | null>(null)
  const cacheExpiryTime = 5 * 60 * 1000 // 5 minutos

  // Converter para formato YYYY-MM-DD no timezone local
  const formatDateToLocal = useCallback((date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  const fetchClubInfo = useCallback(async () => {
    // Verificar cache primeiro
    if (clubInfoCacheRef.current && clubInfoCacheRef.current.slug === slug) {
      setClubInfo(clubInfoCacheRef.current)
      return
    }

    if (currentClub && currentClub.slug === slug) {
      // Club loaded from context, but we need to fetch complete info with counts
      try {
        const response = await fetch(`/api/public/clubs/${currentClub.id}`)
        if (response.ok) {
          const clubData = await response.json()
          setClubInfo(clubData)
          clubInfoCacheRef.current = clubData // Cache dos dados
        } else {
          // Fallback to context data without counts
          const fallbackData = {
            id: currentClub.id,
            name: currentClub.name,
            slug: currentClub.slug,
            description: null,
            logo: currentClub.logo,
            _count: { players: 0, tournaments: 0 }
          }
          setClubInfo(fallbackData)
          clubInfoCacheRef.current = fallbackData
        }
      } catch (error) {
        console.error('Erro ao buscar informações completas do clube:', error)
        // Fallback to context data
        const fallbackData = {
          id: currentClub.id,
          name: currentClub.name,
          slug: currentClub.slug,
          description: null,
          logo: currentClub.logo,
          _count: { players: 0, tournaments: 0 }
        }
        setClubInfo(fallbackData)
        clubInfoCacheRef.current = fallbackData
      }
      return
    }
    
    try {
      const response = await fetch('/api/public/clubs')
      if (response.ok) {
        const clubs: ClubInfo[] = await response.json()
        const club = clubs.find(c => c.slug === slug)
        if (club) {
          setClubInfo(club)
          clubInfoCacheRef.current = club // Cache dos dados
        } else {
          router.push('/') // Redirecionar se clube não encontrado
        }
      }
    } catch (error) {
      console.error('Erro ao buscar informações do clube:', error)
      router.push('/')
    }
  }, [slug, router, currentClub])

  const fetchRanking = useCallback(async () => {
    if (!clubInfo) return
    
    // Criar chave de cache baseada nos parâmetros
    const cacheKey = `${clubInfo.id}-${debouncedFromDate}-${debouncedToDate}`
    
    // Verificar cache primeiro
    const cachedData = rankingCacheRef.current.get(cacheKey)
    if (cachedData && Date.now() - cachedData.timestamp < cacheExpiryTime) {
      setRanking(cachedData.data)
      setLoading(false)
      return
    }

    // Cancelar request anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Criar novo AbortController
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (debouncedFromDate && debouncedToDate) {
        params.append('from', debouncedFromDate)
        params.append('to', debouncedToDate)
      }
      params.append('clubId', clubInfo.id)

      const response = await fetch(`/api/ranking?${params}`, {
        signal: abortController.signal
      })
      
      if (response.ok) {
        const data: RankingResponse = await response.json()
        if (!abortController.signal.aborted) {
          setRanking(data.ranking)
          // Cache dos dados
          rankingCacheRef.current.set(cacheKey, {
            data: data.ranking,
            timestamp: Date.now()
          })
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Request foi cancelado
      }
      console.error('Erro ao buscar ranking:', error)
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false)
      }
    }
  }, [debouncedFromDate, debouncedToDate, clubInfo, cacheExpiryTime])

  useEffect(() => {
    fetchClubInfo()
  }, [fetchClubInfo])

  useEffect(() => {
    if (!clubInfo) return
    
    // Calcular as datas do mês atual
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setFromDate(formatDateToLocal(monthStart))
    setToDate(formatDateToLocal(monthEnd))
  }, [clubInfo, formatDateToLocal])

  useEffect(() => {
    if (debouncedFromDate && debouncedToDate && clubInfo) {
      fetchRanking()
    }
  }, [debouncedFromDate, debouncedToDate, clubInfo, fetchRanking])

  // Memoizar o título do ranking
  const rankingTitle = useMemo(() => {
    if (debouncedFromDate && debouncedToDate) {
      return `Ranking - ${formatDateToBR(debouncedFromDate)} até ${formatDateToBR(debouncedToDate)}`
    }
    return "Ranking"
  }, [debouncedFromDate, debouncedToDate])

  if (!clubInfo && !loading) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Clube não encontrado</h1>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <ClubHeader clubInfo={clubInfo} slug={slug} />

      {/* Filtros */}
      <RankingFilters
        fromDate={fromDate}
        toDate={toDate}
        loading={loading}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onRefresh={fetchRanking}
      />

      {/* Ranking */}
      <RankingTable
        ranking={ranking}
        loading={loading}
        title={rankingTitle}
      />
    </div>
  )
}