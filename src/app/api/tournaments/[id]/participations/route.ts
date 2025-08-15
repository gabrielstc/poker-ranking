import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPointsForPosition } from "@/lib/points-calculator"

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

        const { playerId, position, points, prize } = await request.json()
        const { id: tournamentId } = await params

        if (!playerId) {
            return NextResponse.json(
                { error: "ID do jogador é obrigatório" },
                { status: 400 }
            )
        }

        // Verificar se o torneio existe
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId }
        })

        if (!tournament) {
            return NextResponse.json(
                { error: "Torneio não encontrado" },
                { status: 404 }
            )
        }

        // Verificar se o jogador existe
        const player = await prisma.player.findUnique({
            where: { id: playerId }
        })

        if (!player) {
            return NextResponse.json(
                { error: "Jogador não encontrado" },
                { status: 404 }
            )
        }

        // Verificar se a participação já existe
        const existingParticipation = await prisma.tournamentParticipation.findUnique({
            where: {
                playerId_tournamentId: {
                    playerId,
                    tournamentId
                }
            }
        })

        if (existingParticipation) {
            return NextResponse.json(
                { error: "Jogador já está participando deste torneio" },
                { status: 400 }
            )
        }

        // Verificar se a posição já está ocupada
        if (position) {
            const positionTaken = await prisma.tournamentParticipation.findFirst({
                where: {
                    tournamentId,
                    position: position
                }
            })

            if (positionTaken) {
                return NextResponse.json(
                    { error: `A posição ${position} já está ocupada` },
                    { status: 400 }
                )
            }
        }

        // Calcular total de participantes para o cálculo de pontos
        const totalParticipants = await prisma.tournamentParticipation.count({
            where: { tournamentId }
        }) + 1 // +1 porque estamos adicionando este participante

        // Calcular pontos automaticamente se uma posição foi definida
        let calculatedPoints = points || null
        if (position && !points) {
            calculatedPoints = getPointsForPosition(position, totalParticipants)
        }

        const participation = await prisma.tournamentParticipation.create({
            data: {
                playerId,
                tournamentId,
                position: position || null,
                points: calculatedPoints,
                prize: prize || null,
            },
            include: {
                player: true,
                tournament: true
            }
        })

        return NextResponse.json(participation, { status: 201 })
    } catch (error) {
        console.error("Erro ao adicionar participação:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
