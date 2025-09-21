import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { recalculateAllTournamentPoints } from "@/lib/points-calculator"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const { id: tournamentId } = await params

        // Buscar todas as participações do torneio
        const participations = await prisma.tournamentParticipation.findMany({
            where: {
                tournamentId
            },
            select: {
                id: true,
                position: true,
                points: true
            }
        })

        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            select: { type: true }
        })

        // Calcular novos pontos
        const updatedParticipations = recalculateAllTournamentPoints(
            participations,
            tournament?.type === 'FIXO' ? 'FIXO' : 
            tournament?.type === 'EXPONENCIAL_NEW' ? 'EXPONENCIAL_NEW' : 'EXPONENCIAL'
        )

        // Atualizar no banco de dados
        const updatePromises = updatedParticipations.map(participation =>
            prisma.tournamentParticipation.update({
                where: {
                    id: participation.id
                },
                data: {
                    points: participation.points
                }
            })
        )

        await Promise.all(updatePromises)

        // Buscar dados atualizados para retornar
        const updatedTournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            include: {
                participations: {
                    include: {
                        player: true
                    },
                    orderBy: {
                        position: 'asc'
                    }
                }
            }
        })

        return NextResponse.json(updatedTournament)
    } catch (error) {
        console.error("Erro ao recalcular pontos:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
