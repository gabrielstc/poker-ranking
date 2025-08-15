import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const tournament = await prisma.tournament.findUnique({
            where: { id },
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

        const { name, date, buyIn, description, status } = await request.json()
        const { id } = await params

        if (!name || !date) {
            return NextResponse.json(
                { error: "Nome e data são obrigatórios" },
                { status: 400 }
            )
        }

        // Verificar se o torneio existe
        const existingTournament = await prisma.tournament.findUnique({
            where: { id }
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
                date: new Date(date),
                buyIn: buyIn || null,
                description,
                status,
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

        // Verificar se o torneio existe
        const existingTournament = await prisma.tournament.findUnique({
            where: { id }
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
