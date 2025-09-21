import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseDateFromInput } from "@/lib/date-utils"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id: clubId } = await params
        const { searchParams } = new URL(request.url)
        const month = searchParams.get('month')
        const year = searchParams.get('year')

        // Verificar se o clube existe
        const club = await prisma.club.findUnique({
            where: { id: clubId }
        })

        if (!club) {
            return NextResponse.json(
                { error: "Clube não encontrado" },
                { status: 404 }
            )
        }

        // Acesso público para visualização de torneios - sem verificação de autenticação

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

        const tournaments = await prisma.tournament.findMany({
            where: {
                clubId,
                ...dateFilter
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
        console.error("Erro ao buscar torneios do clube:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const { id: clubId } = await params
        const { name, date, buyIn, description, status, tipo } = await request.json()

        if (!name || !date) {
            return NextResponse.json(
                { error: "Nome e data são obrigatórios" },
                { status: 400 }
            )
        }

        // Verificar se o clube existe
        const club = await prisma.club.findUnique({
            where: { id: clubId }
        })

        if (!club) {
            return NextResponse.json(
                { error: "Clube não encontrado" },
                { status: 404 }
            )
        }

        // Verificar permissão: Super Admin pode criar em qualquer clube, Club Admin só no seu próprio clube
        if (session.user.role !== 'SUPER_ADMIN' && session.user.clubId !== clubId) {
            return NextResponse.json(
                { error: "Sem permissão para criar torneios neste clube" },
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
                clubId
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