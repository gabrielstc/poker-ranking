"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Trophy, Users, DollarSign, Eye } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { createLocalDate } from "@/lib/date-utils"
import Link from "next/link"

interface Tournament {
    id: string
    name: string
    date: string
    buyIn: number | null
    description: string | null
    status: string
    participations: Array<{
        id: string
        player: {
            id: string
            name: string
            nickname: string
        }
        position: number | null
        points: number | null
    }>
}

export default function TournamentsPage() {
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMonth, setSelectedMonth] = useState<string>("")
    const [selectedYear, setSelectedYear] = useState<string>("")

    const currentDate = new Date()
    const currentMonth = (currentDate.getMonth() + 1).toString()
    const currentYear = currentDate.getFullYear().toString()

    useEffect(() => {
        setSelectedMonth(currentMonth)
        setSelectedYear(currentYear)
    }, [currentMonth, currentYear])

    useEffect(() => {
        if (selectedMonth && selectedYear) {
            const fetchTournaments = async () => {
                try {
                    setLoading(true)
                    const params = new URLSearchParams()
                    if (selectedMonth && selectedYear) {
                        params.append('month', selectedMonth)
                        params.append('year', selectedYear)
                    }

                    const response = await fetch(`/api/tournaments?${params}`)
                    if (response.ok) {
                        const data = await response.json()
                        setTournaments(data)
                    }
                } catch (error) {
                    console.error('Erro ao buscar torneios:', error)
                } finally {
                    setLoading(false)
                }
            }
            
            fetchTournaments()
        }
    }, [selectedMonth, selectedYear])

    const refetchTournaments = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (selectedMonth && selectedYear) {
                params.append('month', selectedMonth)
                params.append('year', selectedYear)
            }

            const response = await fetch(`/api/tournaments?${params}`)
            if (response.ok) {
                const data = await response.json()
                setTournaments(data)
            }
        } catch (error) {
            console.error('Erro ao buscar torneios:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const badges = {
            UPCOMING: "bg-blue-100 text-blue-800",
            IN_PROGRESS: "bg-yellow-100 text-yellow-800",
            COMPLETED: "bg-green-100 text-green-800",
            CANCELLED: "bg-red-100 text-red-800"
        }

        const labels = {
            UPCOMING: "Próximo",
            IN_PROGRESS: "Em Andamento",
            COMPLETED: "Finalizado",
            CANCELLED: "Cancelado"
        }

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        )
    }

    const getWinner = (tournament: Tournament) => {
        const winner = tournament.participations.find(p => p.position === 1)
        return winner ? winner.player : null
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
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Torneios de Poker</h1>
                <p className="text-base sm:text-lg text-gray-600 px-4">
                    Explore os torneios realizados e veja os resultados detalhados
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
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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

                        <Select value={selectedYear} onValueChange={setSelectedYear}>
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

                        <Button onClick={refetchTournaments} disabled={loading} className="w-full sm:w-auto">
                            Atualizar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Torneios */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Trophy className="h-5 w-5" />
                        <span>
                            Torneios {selectedMonth && selectedYear &&
                                `- ${monthOptions.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
                            }
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-gray-600">Carregando torneios...</p>
                        </div>
                    ) : tournaments.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Nenhum torneio encontrado para este período</p>
                            <p className="text-sm text-gray-500">Tente selecionar outro mês/ano</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Cards para mobile/tablet */}
                            <div className="block md:hidden space-y-4">
                                {tournaments.map((tournament) => {
                                    const winner = getWinner(tournament)
                                    return (
                                        <Card key={tournament.id} className="border border-gray-200">
                                            <CardContent className="p-4">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-semibold text-lg">{tournament.name}</h3>
                                                        {getStatusBadge(tournament.status)}
                                                    </div>
                                                    
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{format(createLocalDate(tournament.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                                                        </div>
                                                        
                                                        {tournament.buyIn && (
                                                            <div className="flex items-center space-x-2">
                                                                <DollarSign className="h-4 w-4" />
                                                                <span>R$ {tournament.buyIn.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex items-center space-x-2">
                                                            <Users className="h-4 w-4" />
                                                            <span>{tournament.participations.length} participantes</span>
                                                        </div>
                                                        
                                                        {winner && (
                                                            <div className="flex items-center space-x-2">
                                                                <Trophy className="h-4 w-4 text-yellow-500" />
                                                                <span className="font-medium">{winner.name} (@{winner.nickname})</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="pt-2">
                                                        <Link href={`/tournaments/${tournament.id}`}>
                                                            <Button size="sm" className="w-full">
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Visualizar Detalhes
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>

                            {/* Tabela para desktop */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Buy-in</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Participantes</TableHead>
                                            <TableHead>Campeão</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tournaments.map((tournament) => {
                                            const winner = getWinner(tournament)
                                            return (
                                                <TableRow key={tournament.id}>
                                                    <TableCell className="font-medium">{tournament.name}</TableCell>
                                                    <TableCell>
                                                        {format(createLocalDate(tournament.date), "dd/MM/yyyy", { locale: ptBR })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {tournament.buyIn ? `R$ ${tournament.buyIn.toFixed(2)}` : "-"}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(tournament.status)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-1">
                                                            <Users className="h-4 w-4" />
                                                            <span>{tournament.participations.length}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {winner ? (
                                                            <div className="flex items-center space-x-2">
                                                                <Trophy className="h-4 w-4 text-yellow-500" />
                                                                <div>
                                                                    <div className="font-medium">{winner.name}</div>
                                                                    <div className="text-xs text-gray-500">@{winner.nickname}</div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link href={`/tournaments/${tournament.id}`}>
                                                            <Button size="sm" variant="outline">
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Visualizar
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
