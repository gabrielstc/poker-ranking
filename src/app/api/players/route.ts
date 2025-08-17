import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const players = await prisma.player.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                nickname: true,
                // Removido email e phone por segurança na API pública
                participations: {
                    select: {
                        id: true,
                        position: true,
                        points: true,
                        tournament: {
                            select: {
                                id: true,
                                name: true,
                                date: true
                            }
                        }
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

        // Validação de entrada mais rigorosa
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return NextResponse.json(
                { error: "Nome deve ter pelo menos 2 caracteres" },
                { status: 400 }
            )
        }

        if (!nickname || typeof nickname !== 'string' || nickname.trim().length < 2) {
            return NextResponse.json(
                { error: "Nickname deve ter pelo menos 2 caracteres" },
                { status: 400 }
            )
        }

        // Sanitizar dados
        const sanitizedName = name.trim()
        const sanitizedNickname = nickname.trim().toLowerCase()
        const sanitizedEmail = email?.trim() || null
        const sanitizedPhone = phone?.trim() || null

        // Validar email se fornecido
        if (sanitizedEmail && !/\S+@\S+\.\S+/.test(sanitizedEmail)) {
            return NextResponse.json(
                { error: "Email inválido" },
                { status: 400 }
            )
        }

        // Verificar se o nickname já existe
        const existingPlayer = await prisma.player.findUnique({
            where: { nickname: sanitizedNickname }
        })

        if (existingPlayer) {
            return NextResponse.json(
                { error: "Nickname já está em uso" },
                { status: 400 }
            )
        }

        const player = await prisma.player.create({
            data: {
                name: sanitizedName,
                nickname: sanitizedNickname,
                email: sanitizedEmail,
                phone: sanitizedPhone,
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
