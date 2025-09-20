import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireClubAdmin, getUserClubFilter } from "@/lib/permissions"

export async function GET() {
    try {
        const user = await requireClubAdmin()
        const clubFilter = getUserClubFilter(user)

        const players = await prisma.player.findMany({
            where: clubFilter,
            orderBy: { name: 'asc' },
            include: {
                club: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                participations: {
                    include: {
                        tournament: {
                            select: {
                                id: true,
                                name: true,
                                date: true,
                                clubId: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json(players)
    } catch (error) {
        console.error("Erro ao buscar jogadores:", error)
        
        if (error instanceof Error && error.message.includes('Acesso negado')) {
            return NextResponse.json(
                { error: error.message },
                { status: 403 }
            )
        }
        
        if (error instanceof Error && error.message.includes('não autenticado')) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
