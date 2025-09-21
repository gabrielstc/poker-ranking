"use client"

import { useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Medal, Award, Users } from "lucide-react"

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

interface RankingTableProps {
  ranking: RankingPlayer[]
  loading: boolean
  title: string
}

export function RankingTable({ ranking, loading, title }: RankingTableProps) {
  const getPositionIcon = useCallback((position: number) => {
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
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>{title}</span>
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
              Nenhum dado encontrado para este período
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Verifique se existem torneios realizados no período selecionado
            </p>
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
  )
}