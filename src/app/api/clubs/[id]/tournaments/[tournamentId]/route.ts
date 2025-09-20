import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseDateFromInput } from "@/lib/date-utils"

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string; tournamentId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const { id: clubId, tournamentId } = params
        const { name, date, buyIn, description, status, tipo } = await request.json()

        // Verificar se o torneio existe e pertence ao clube
        const tournament = await prisma.tournament.findFirst({
            where: {
                id: tournamentId,
                clubId
            }
        })

        if (!tournament) {
            return NextResponse.json(
                { error: "Torneio não encontrado" },
                { status: 404 }
            )
        }

        // Verificar permissão: Super Admin pode editar em qualquer clube, Club Admin só no seu próprio clube
        if (session.user.role !== 'SUPER_ADMIN' && session.user.clubId !== clubId) {
            return NextResponse.json(
                { error: "Sem permissão para editar torneios neste clube" },
                { status: 403 }
            )
        }

        const updatedTournament = await prisma.tournament.update({
            where: { id: tournamentId },
            data: {
                name: name || tournament.name,
                date: date ? parseDateFromInput(date) : tournament.date,
                buyIn: buyIn !== undefined ? (buyIn || null) : tournament.buyIn,
                description: description !== undefined ? description : tournament.description,
                status: status || tournament.status,
                type: tipo || tournament.type,
            },
        })

        return NextResponse.json(updatedTournament)
    } catch (error) {
        console.error("Erro ao atualizar torneio:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; tournamentId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const { id: clubId, tournamentId } = params

        // Verificar se o torneio existe e pertence ao clube
        const tournament = await prisma.tournament.findFirst({
            where: {
                id: tournamentId,
                clubId
            }
        })

        if (!tournament) {
            return NextResponse.json(
                { error: "Torneio não encontrado" },
                { status: 404 }
            )
        }

        // Verificar permissão: Super Admin pode deletar em qualquer clube, Club Admin só no seu próprio clube
        if (session.user.role !== 'SUPER_ADMIN' && session.user.clubId !== clubId) {
            return NextResponse.json(
                { error: "Sem permissão para deletar torneios neste clube" },
                { status: 403 }
            )
        }

        await prisma.tournament.delete({
            where: { id: tournamentId }
        })

        return NextResponse.json({ message: "Torneio removido com sucesso" })
    } catch (error) {
        console.error("Erro ao deletar torneio:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}