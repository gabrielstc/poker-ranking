import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseDateFromInput } from "@/lib/date-utils"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const { id } = await params

        // Construir filtro baseado no clube do usuário
        const whereClause = session.user.role !== 'SUPER_ADMIN' && session.user.clubId
            ? { id, clubId: session.user.clubId }
            : { id }

        const tournament = await prisma.tournament.findUnique({
            where: whereClause,
            include: {
                participations: {
                    include: {
                        player: true
                    },
                    orderBy: { position: 'asc' }
                }
            }
        })

        if (!tournament) {
            return NextResponse.json(
                { error: "Torneio não encontrado" },
                { status: 404 }
            )
        }

        return NextResponse.json(tournament)
    } catch (error) {
        console.error("Erro ao buscar torneio:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}

export async function PUT(
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

        const { name, date, buyIn, description, status, tipo } = await request.json()
        const { id } = await params

        if (!name || !date) {
            return NextResponse.json(
                { error: "Nome e data são obrigatórios" },
                { status: 400 }
            )
        }

        // Verificar se o torneio existe e pertence ao clube do usuário
        const whereClause = session.user.role !== 'SUPER_ADMIN' && session.user.clubId
            ? { id, clubId: session.user.clubId }
            : { id }

        const existingTournament = await prisma.tournament.findUnique({
            where: whereClause
        })

        if (!existingTournament) {
            return NextResponse.json(
                { error: "Torneio não encontrado" },
                { status: 404 }
            )
        }

        const tournament = await prisma.tournament.update({
            where: { id },
            data: {
                name,
                date: parseDateFromInput(date),
                buyIn: buyIn || null,
                description,
                status,
                type: (tipo === 'FIXO' || tipo === 'EXPONENCIAL') ? tipo : undefined,
            },
        })

        return NextResponse.json(tournament)
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

        const { id } = await params

        // Verificar se o torneio existe e pertence ao clube do usuário
        const whereClause = session.user.role !== 'SUPER_ADMIN' && session.user.clubId
            ? { id, clubId: session.user.clubId }
            : { id }

        const existingTournament = await prisma.tournament.findUnique({
            where: whereClause
        })

        if (!existingTournament) {
            return NextResponse.json(
                { error: "Torneio não encontrado" },
                { status: 404 }
            )
        }

        await prisma.tournament.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Torneio removido com sucesso" })
    } catch (error) {
        console.error("Erro ao remover torneio:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
