import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const tournaments = await prisma.tournament.findMany({
            orderBy: { date: 'desc' },
            include: {
                participations: {
                    include: {
                        player: true
                    },
                    orderBy: { position: 'asc' }
                }
            }
        })

        return NextResponse.json(tournaments)
    } catch (error) {
        console.error("Erro ao buscar torneios:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const { name, date, buyIn, description, status } = await request.json()

        if (!name || !date) {
            return NextResponse.json(
                { error: "Nome e data são obrigatórios" },
                { status: 400 }
            )
        }

        const tournament = await prisma.tournament.create({
            data: {
                name,
                date: new Date(date),
                buyIn: buyIn || null,
                description,
                status: status || 'UPCOMING',
            },
        })

        return NextResponse.json(tournament, { status: 201 })
    } catch (error) {
        console.error("Erro ao criar torneio:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
