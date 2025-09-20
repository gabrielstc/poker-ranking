import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseDateFromInput } from "@/lib/date-utils"

export async function GET(request: NextRequest) {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

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

        // Filtrar por clube do usuário (se não for SUPER_ADMIN)
        let clubFilter = {}
        if (session.user.role !== 'SUPER_ADMIN' && session.user.clubId) {
            clubFilter = { clubId: session.user.clubId }
        }

        const tournaments = await prisma.tournament.findMany({
            where: {
                ...dateFilter,
                ...clubFilter
            },
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

        const { name, date, buyIn, description, status, tipo } = await request.json()

        if (!name || !date) {
            return NextResponse.json(
                { error: "Nome e data são obrigatórios" },
                { status: 400 }
            )
        }

        // Verificar se o usuário tem um clube associado
        if (session.user.role !== 'SUPER_ADMIN' && !session.user.clubId) {
            return NextResponse.json(
                { error: "Usuário não está associado a nenhum clube" },
                { status: 403 }
            )
        }

        const tournament = await prisma.tournament.create({
            data: {
                name,
                date: parseDateFromInput(date),
                buyIn: buyIn || null,
                description,
                status: status || 'UPCOMING',
                type: (tipo === 'FIXO' || tipo === 'EXPONENCIAL') ? tipo : 'EXPONENCIAL',
                clubId: session.user.clubId! // Garantido pelo check acima
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
