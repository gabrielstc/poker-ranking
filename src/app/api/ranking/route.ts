import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseDateFromInput } from "@/lib/date-utils"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const fromDate = searchParams.get('from')
        const toDate = searchParams.get('to')
        const clubId = searchParams.get('clubId')
        const clubSlug = searchParams.get('clubSlug')

        let dateFilter = {}
        let clubFilter = {}

        if (fromDate && toDate) {
            const startDate = parseDateFromInput(fromDate)
            const endDate = parseDateFromInput(toDate)
            endDate.setHours(23, 59, 59, 999) // Fim do dia

            dateFilter = {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        }

        // Filtro por clube via ID ou slug
        if (clubId || clubSlug) {
            if (clubSlug) {
                // Buscar clube pelo slug primeiro
                const club = await prisma.club.findUnique({
                    where: { slug: clubSlug },
                    select: { id: true }
                })
                
                if (!club) {
                    return NextResponse.json(
                        { error: "Clube não encontrado" },
                        { status: 404 }
                    )
                }
                
                clubFilter = { clubId: club.id }
            } else {
                clubFilter = { clubId }
            }
        }

        // Buscar todas as participações com filtro de data e clube
        const participations = await prisma.tournamentParticipation.findMany({
            where: {
                tournament: {
                    ...dateFilter,
                    ...clubFilter,
                },
                points: { not: null }
            },
            include: {
                player: true,
                tournament: {
                    include: {
                        club: {
                            select: {
                                id: true,
                                name: true,
                                slug: true
                            }
                        }
                    }
                }
            }
        })

        // Agrupar por jogador e calcular pontuação total
        const playerStats = new Map()

        participations.forEach(participation => {
            const playerId = participation.player.id
            const points = participation.points || 0

            if (!playerStats.has(playerId)) {
                playerStats.set(playerId, {
                    player: participation.player,
                    totalPoints: 0,
                    tournaments: 0,
                    wins: 0,
                    positions: []
                })
            }

            const stats = playerStats.get(playerId)
            stats.totalPoints += points
            stats.tournaments += 1

            if (participation.position === 1) {
                stats.wins += 1
            }

            if (participation.position) {
                stats.positions.push(participation.position)
            }
        })

        // Converter para array e ordenar por pontuação
        const ranking = Array.from(playerStats.values())
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .map((stats, index) => ({
                position: index + 1,
                ...stats,
                averagePosition: stats.positions.length > 0
                    ? stats.positions.reduce((sum: number, pos: number) => sum + pos, 0) / stats.positions.length
                    : null
            }))

        // Incluir informações do clube se disponível
        const response = {
            ranking,
            club: participations.length > 0 && participations[0].tournament.club 
                ? {
                    id: participations[0].tournament.club.id,
                    name: participations[0].tournament.club.name,
                    slug: participations[0].tournament.club.slug
                } 
                : null
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Erro ao buscar ranking:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
