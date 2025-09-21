import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseDateFromInput } from "@/lib/date-utils"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const month = searchParams.get('month')
        const year = searchParams.get('year')
        const clubId = searchParams.get('clubId')

        // Para acesso público, clubId deve ser fornecido
        if (!clubId) {
            return NextResponse.json(
                { error: "ClubId é obrigatório para acesso público aos torneios" },
                { status: 400 }
            )
        }

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

        // Buscar torneios apenas do clube especificado
        const tournaments = await prisma.tournament.findMany({
            where: {
                ...dateFilter,
                clubId: clubId // FILTRO OBRIGATÓRIO POR CLUBE
            },
            orderBy: { date: 'desc' },
            include: {
                club: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                participations: {
                    include: {
                        player: {
                            select: {
                                id: true,
                                name: true,
                                nickname: true
                                // Removido email e phone por segurança
                            }
                        }
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

        // Verificar se o usuário tem um clube associado (exceto super admin)
        if (session.user.role !== 'SUPER_ADMIN' && !session.user.clubId) {
            return NextResponse.json(
                { error: "Usuário não está associado a nenhum clube" },
                { status: 403 }
            )
        }

        // Super admin pode criar torneis para qualquer clube se clubId for fornecido
        let targetClubId = session.user.clubId
        
        if (session.user.role === 'SUPER_ADMIN') {
            const { clubId } = await request.json()
            if (clubId) {
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
                targetClubId = clubId
            }
        }

        if (!targetClubId) {
            return NextResponse.json(
                { error: "Clube deve ser especificado" },
                { status: 400 }
            )
        }

        const tournament = await prisma.tournament.create({
            data: {
                name,
                date: parseDateFromInput(date),
                buyIn: buyIn || null,
                description,
                status: status || 'UPCOMING',
                type: (tipo === 'FIXO' || tipo === 'EXPONENCIAL' || tipo === 'EXPONENCIAL_NEW') ? tipo : 'EXPONENCIAL_NEW',
                clubId: targetClubId
            },
        })

        // Log de auditoria
        console.log(`🏆 Torneio criado - User: ${session.user.email}, Club: ${targetClubId}, Tournament: ${tournament.id}`)

        return NextResponse.json(tournament, { status: 201 })
    } catch (error) {
        console.error("Erro ao criar torneio:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
