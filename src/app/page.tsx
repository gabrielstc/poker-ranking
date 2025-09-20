"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Medal, Award, Users, Calendar, Building2 } from "lucide-react"
import { formatDateToBR } from "@/lib/date-utils"

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

interface Club {
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

export default function HomePage() {
  const [ranking, setRanking] = useState<RankingPlayer[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClub, setSelectedClub] = useState<string>("all")
  const [currentClub, setCurrentClub] = useState<{ id: string; name: string; slug: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  
  // Converter para formato YYYY-MM-DD no timezone local
  const formatDateToLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const fetchRanking = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (fromDate && toDate) {
        params.append('from', fromDate)
        params.append('to', toDate)
      }
      if (selectedClub && selectedClub !== "all") {
        params.append('clubId', selectedClub)
      }

      const response = await fetch(`/api/ranking?${params}`)
      if (response.ok) {
        const data: RankingResponse = await response.json()
        setRanking(data.ranking)
        setCurrentClub(data.club)
      }
    } catch (error) {
      console.error('Erro ao buscar ranking:', error)
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate, selectedClub])

  const fetchClubs = useCallback(async () => {
    try {
      const response = await fetch('/api/public/clubs')
      if (response.ok) {
        const data: Club[] = await response.json()
        setClubs(data)
      }
    } catch (error) {
      console.error('Erro ao buscar clubes:', error)
    }
  }, [])

  useEffect(() => {
    // Carregar clubes na inicialização
    fetchClubs()
    
    // Calcular as datas diretamente no useEffect para evitar dependências desnecessárias
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setFromDate(formatDateToLocal(monthStart))
    setToDate(formatDateToLocal(monthEnd))
  }, [fetchClubs]) // Executar quando fetchClubs estiver disponível

  useEffect(() => {
    if (fromDate && toDate) {
      fetchRanking()
    }
  }, [fromDate, toDate, fetchRanking])

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-muted-foreground" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="h-6 w-6 flex items-center justify-center text-sm font-bold text-muted-foreground">{position}</span>
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
          {currentClub ? `Ranking - ${currentClub.name}` : "Ranking Geral"}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground px-4">
          {currentClub 
            ? `Acompanhe o desempenho dos jogadores do ${currentClub.name}`
            : "Escolha um clube para ver o ranking dos jogadores"
          }
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Seletor de Clube */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="club-select">Clube:</Label>
              <Select value={selectedClub} onValueChange={setSelectedClub}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um clube" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clubes</SelectItem>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4" />
                        <span>{club.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({club._count.players} jogadores)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtros de Data */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="from-date">De:</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full sm:w-40"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="to-date">Até:</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full sm:w-40"
                />
              </div>

              <div className="flex items-end">
                <Button onClick={fetchRanking} disabled={loading} className="w-full sm:w-auto">
                  Atualizar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>
              Ranking {fromDate && toDate &&
                `- ${formatDateToBR(fromDate)} até ${formatDateToBR(toDate)}`
              }
              {currentClub && ` - ${currentClub.name}`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando ranking...</p>
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {selectedClub && selectedClub !== "all" ? "Nenhum dado encontrado para este clube no período selecionado" : "Nenhum dado encontrado para este período"}
              </p>
              {(!selectedClub || selectedClub === "all") && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selecione um clube para ver o ranking específico
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 sm:w-16">Pos.</TableHead>
                    <TableHead>Jogador</TableHead>
                    <TableHead className="text-center">Pontos</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Torneios</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Vitórias</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Pos. Média</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((player) => (
                    <TableRow key={player.player.id} className={player.position <= 3 ? "bg-accent/50" : ""}>
                      <TableCell className="flex items-center justify-center">
                        {getPositionIcon(player.position)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm sm:text-base">{player.player.name}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">@{player.player.nickname}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-base sm:text-lg">
                        {player.totalPoints.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">{player.tournaments}</TableCell>
                      <TableCell className="text-center hidden sm:table-cell">{player.wins}</TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        {player.averagePosition ? player.averagePosition.toFixed(1) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
