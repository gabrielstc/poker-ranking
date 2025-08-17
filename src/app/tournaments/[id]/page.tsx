"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Trophy, Medal, Award, Users, Calendar, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

interface Player {
    id: string
    name: string
    nickname: string
}

interface Participation {
    id: string
    playerId: string
    position: number | null
    points: number | null
    prize: number | null
    player: Player
}

interface Tournament {
    id: string
    name: string
    date: string
    buyIn: number | null
    description: string | null
    status: string
    participations: Participation[]
}

export default function TournamentDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const tournamentId = params.id as string

    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!tournamentId) return

        const fetchTournamentDetails = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/tournaments/${tournamentId}`)
                if (response.ok) {
                    const data = await response.json()
                    setTournament(data)
                } else {
                    router.push("/tournaments")
                }
            } catch (error) {
                console.error("Erro ao buscar torneio:", error)
                router.push("/tournaments")
            } finally {
                setLoading(false)
            }
        }

        fetchTournamentDetails()
    }, [tournamentId, router])

    const getPositionIcon = (position: number | null) => {
        if (!position) return <span className="text-gray-400">-</span>

        switch (position) {
            case 1:
                return <Trophy className="h-5 w-5 text-yellow-500" />
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />
            case 3:
                return <Award className="h-5 w-5 text-amber-600" />
            default:
                return <span className="font-bold text-gray-600">{position}º</span>
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!tournament) {
        return null
    }

    const sortedParticipations = [...tournament.participations].sort((a, b) => {
        if (a.position && b.position) return a.position - b.position
        if (a.position && !b.position) return -1
        if (!a.position && b.position) return 1
        return 0
    })

    const totalPrizePool = tournament.participations.reduce((sum, p) => sum + (p.prize || 0), 0)
    const playersWithPositions = tournament.participations.filter(p => p.position !== null).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/tournaments">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar aos Torneios
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{tournament.name}</h1>
                        <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(tournament.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                            </div>
                            {tournament.buyIn && (
                                <div className="flex items-center space-x-1 text-gray-600">
                                    <DollarSign className="h-4 w-4" />
                                    <span>R$ {tournament.buyIn.toFixed(2)}</span>
                                </div>
                            )}
                            {getStatusBadge(tournament.status)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Informações do Torneio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold">{tournament.participations.length}</p>
                                <p className="text-sm text-gray-600">Participantes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <div>
                                <p className="text-2xl font-bold">{playersWithPositions}</p>
                                <p className="text-sm text-gray-600">Classificados</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold">R$ {totalPrizePool.toFixed(2)}</p>
                                <p className="text-sm text-gray-600">Premiação Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Descrição */}
            {tournament.description && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-gray-600">{tournament.description}</p>
                    </CardContent>
                </Card>
            )}

            {/* Pódio */}
            {sortedParticipations.some(p => p.position && p.position <= 3) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Trophy className="h-5 w-5" />
                            <span>Pódio</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map((position) => {
                                const participant = sortedParticipations.find(p => p.position === position)
                                if (!participant) return null

                                const colors = {
                                    1: "border-yellow-300 bg-yellow-50",
                                    2: "border-gray-300 bg-gray-50", 
                                    3: "border-amber-300 bg-amber-50"
                                }

                                return (
                                    <Card key={position} className={`border-2 ${colors[position as keyof typeof colors]}`}>
                                        <CardContent className="pt-6 text-center">
                                            <div className="flex justify-center mb-2">
                                                {getPositionIcon(position)}
                                            </div>
                                            <h3 className="font-semibold text-lg">{participant.player.name}</h3>
                                            <p className="text-sm text-gray-600">@{participant.player.nickname}</p>
                                            {participant.points && (
                                                <p className="text-sm font-medium mt-1">{participant.points.toFixed(1)} pontos</p>
                                            )}
                                            {participant.prize && (
                                                <p className="text-sm font-medium text-green-600">R$ {participant.prize.toFixed(2)}</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Resultados Completos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Resultados Completos</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {tournament.participations.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Nenhum participante registrado</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Cards para mobile */}
                            <div className="block md:hidden space-y-3">
                                {sortedParticipations.map((participation) => (
                                    <Card key={participation.id} className="border border-gray-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        {getPositionIcon(participation.position)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{participation.player.name}</h4>
                                                        <p className="text-sm text-gray-500">@{participation.player.nickname}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {participation.points && (
                                                        <p className="font-bold text-blue-600">{participation.points.toFixed(1)} pts</p>
                                                    )}
                                                    {participation.prize && (
                                                        <p className="text-sm text-green-600">R$ {participation.prize.toFixed(2)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Tabela para desktop */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">Pos.</TableHead>
                                            <TableHead>Jogador</TableHead>
                                            <TableHead className="text-center">Pontos</TableHead>
                                            <TableHead className="text-center">Prêmio</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedParticipations.map((participation) => (
                                            <TableRow key={participation.id} className={participation.position && participation.position <= 3 ? "bg-yellow-50" : ""}>
                                                <TableCell className="flex items-center justify-center">
                                                    {getPositionIcon(participation.position)}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{participation.player.name}</div>
                                                        <div className="text-sm text-gray-500">@{participation.player.nickname}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-bold">
                                                    {participation.points ? participation.points.toFixed(1) : "-"}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {participation.prize ? `R$ ${participation.prize.toFixed(2)}` : "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
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
