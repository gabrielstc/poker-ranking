import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; participationId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const { position, points, prize } = await request.json()
        const { participationId } = await params

        // Verificar se a participação existe
        const existingParticipation = await prisma.tournamentParticipation.findUnique({
            where: { id: participationId }
        })

        if (!existingParticipation) {
            return NextResponse.json(
                { error: "Participação não encontrada" },
                { status: 404 }
            )
        }

        // Verificar se a posição já está ocupada por outro jogador no mesmo torneio
        if (position) {
            const positionTaken = await prisma.tournamentParticipation.findFirst({
                where: {
                    tournamentId: existingParticipation.tournamentId,
                    position: position,
                    id: { not: participationId }
                }
            })

            if (positionTaken) {
                return NextResponse.json(
                    { error: `A posição ${position} já está ocupada` },
                    { status: 400 }
                )
            }
        }

        const participation = await prisma.tournamentParticipation.update({
            where: { id: participationId },
            data: {
                position: position || null,
                points: points || null,
                prize: prize || null,
            },
            include: {
                player: true,
                tournament: true
            }
        })

        return NextResponse.json(participation)
    } catch (error) {
        console.error("Erro ao atualizar participação:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; participationId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const { participationId } = await params

        // Verificar se a participação existe
        const existingParticipation = await prisma.tournamentParticipation.findUnique({
            where: { id: participationId }
        })

        if (!existingParticipation) {
            return NextResponse.json(
                { error: "Participação não encontrada" },
                { status: 404 }
            )
        }

        await prisma.tournamentParticipation.delete({
            where: { id: participationId }
        })

        return NextResponse.json({ message: "Participação removida com sucesso" })
    } catch (error) {
        console.error("Erro ao remover participação:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
