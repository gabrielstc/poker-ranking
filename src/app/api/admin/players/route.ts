import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const players = await prisma.player.findMany({
            orderBy: { name: 'asc' },
            include: {
                participations: {
                    include: {
                        tournament: true
                    }
                }
            }
        })

        return NextResponse.json(players)
    } catch (error) {
        console.error("Erro ao buscar jogadores:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
