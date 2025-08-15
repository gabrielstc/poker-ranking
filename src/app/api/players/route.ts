import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
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

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const { name, nickname, email, phone } = await request.json()

        if (!name || !nickname) {
            return NextResponse.json(
                { error: "Nome e nickname são obrigatórios" },
                { status: 400 }
            )
        }

        // Verificar se o nickname já existe
        const existingPlayer = await prisma.player.findUnique({
            where: { nickname }
        })

        if (existingPlayer) {
            return NextResponse.json(
                { error: "Nickname já está em uso" },
                { status: 400 }
            )
        }

        const player = await prisma.player.create({
            data: {
                name,
                nickname,
                email,
                phone,
            },
        })

        return NextResponse.json(player, { status: 201 })
    } catch (error) {
        console.error("Erro ao criar jogador:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
