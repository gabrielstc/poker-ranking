import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireClubAdmin } from "@/lib/permissions"

export async function GET() {
    try {
        // Para API pública, retornar jogadores de todos os clubes
        // Mas sem informações sensíveis
        const players = await prisma.player.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                nickname: true,
                club: {
                    select: {
                        id: true,
                        name: true
                    }
                },
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
        // Requer que seja admin de clube
        const user = await requireClubAdmin()

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

        // Verificar se o nickname já existe no clube do usuário
        const existingPlayer = await prisma.player.findUnique({
            where: { 
                nickname_clubId: {
                    nickname: sanitizedNickname,
                    clubId: user.clubId!
                }
            }
        })

        if (existingPlayer) {
            return NextResponse.json(
                { error: "Nickname já está em uso neste clube" },
                { status: 400 }
            )
        }

        const player = await prisma.player.create({
            data: {
                name: sanitizedName,
                nickname: sanitizedNickname,
                email: sanitizedEmail,
                phone: sanitizedPhone,
                clubId: user.clubId!, // Associar ao clube do usuário
            },
        })

        return NextResponse.json(player, { status: 201 })
    } catch (error) {
        console.error("Erro ao criar jogador:", error)
        
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