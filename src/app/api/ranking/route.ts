import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const month = searchParams.get('month')
        const year = searchParams.get('year')

        let dateFilter = {}

        if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

            dateFilter = {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        }

        // Buscar todas as participações com filtro de data se fornecido
        const participations = await prisma.tournamentParticipation.findMany({
            where: {
                tournament: dateFilter,
                points: { not: null }
            },
            include: {
                player: true,
                tournament: true
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

        return NextResponse.json(ranking)
    } catch (error) {
        console.error("Erro ao buscar ranking:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
