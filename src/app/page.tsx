"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Medal, Award, Users, Calendar } from "lucide-react"

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

export default function HomePage() {
  const [ranking, setRanking] = useState<RankingPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  
  const currentDate = new Date()
  const currentMonth = (currentDate.getMonth() + 1).toString()
  const currentYear = currentDate.getFullYear().toString()

  const fetchRanking = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedMonth && selectedYear) {
        params.append('month', selectedMonth)
        params.append('year', selectedYear)
      }

      const response = await fetch(`/api/ranking?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRanking(data)
        // Mover trackRankingView para fora do useCallback
      }
    } catch (error) {
      console.error('Erro ao buscar ranking:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    setSelectedMonth(currentMonth)
    setSelectedYear(currentYear)
  }, [currentMonth, currentYear])

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchRanking()
    }
  }, [selectedMonth, selectedYear, fetchRanking])

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="h-6 w-6 flex items-center justify-center text-sm font-bold text-gray-600">{position}</span>
    }
  }

  const monthOptions = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ]

  const years = []
  for (let year = currentDate.getFullYear(); year >= 2020; year--) {
    years.push(year.toString())
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Ranking Geral</h1>
        <p className="text-base sm:text-lg text-gray-600 px-4">
          Acompanhe o desempenho dos jogadores nos torneios
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Filtrar por Período</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedMonth} onValueChange={(value) => {
              setSelectedMonth(value)
            }}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={(value) => {
              setSelectedYear(value)
            }}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchRanking} disabled={loading} className="w-full sm:w-auto">
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>
              Ranking {selectedMonth && selectedYear &&
                `- ${monthOptions.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
              }
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando ranking...</p>
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum dado encontrado para este período</p>
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
                    <TableRow key={player.player.id} className={player.position <= 3 ? "bg-yellow-50" : ""}>
                      <TableCell className="flex items-center justify-center">
                        {getPositionIcon(player.position)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm sm:text-base">{player.player.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500">@{player.player.nickname}</div>
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
