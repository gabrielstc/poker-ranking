import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireClubAdmin } from "@/lib/permissions"

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string; playerId: string } }
) {
    try {
        const user = await requireClubAdmin(params.id)
        const clubId = params.id
        const playerId = params.playerId

        // Verificação adicional para CLUB_ADMIN
        if (user.role === "CLUB_ADMIN" && user.clubId !== clubId) {
            return NextResponse.json(
                { error: "Acesso negado a este clube" },
                { status: 403 }
            )
        }

        // Verificar se o jogador pertence ao clube
        const existingPlayer = await prisma.player.findFirst({
            where: {
                id: playerId,
                clubId: clubId
            }
        })

        if (!existingPlayer) {
            return NextResponse.json(
                { error: "Jogador não encontrado neste clube" },
                { status: 404 }
            )
        }

        const { name, nickname, email, phone } = await request.json()

        // Validação de entrada
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

        // Verificar se o nickname já existe no clube (exceto para o próprio jogador)
        if (sanitizedNickname !== existingPlayer.nickname) {
            const nicknameConflict = await prisma.player.findUnique({
                where: { 
                    nickname_clubId: {
                        nickname: sanitizedNickname,
                        clubId: clubId
                    }
                }
            })

            if (nicknameConflict) {
                return NextResponse.json(
                    { error: "Nickname já está em uso neste clube" },
                    { status: 400 }
                )
            }
        }

        const player = await prisma.player.update({
            where: { id: playerId },
            data: {
                name: sanitizedName,
                nickname: sanitizedNickname,
                email: sanitizedEmail,
                phone: sanitizedPhone,
            },
            include: {
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

        return NextResponse.json(player)
    } catch (error) {
        console.error("Erro ao atualizar jogador:", error)
        
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; playerId: string } }
) {
    try {
        const user = await requireClubAdmin(params.id)
        const clubId = params.id
        const playerId = params.playerId

        // Verificação adicional para CLUB_ADMIN
        if (user.role === "CLUB_ADMIN" && user.clubId !== clubId) {
            return NextResponse.json(
                { error: "Acesso negado a este clube" },
                { status: 403 }
            )
        }

        // Verificar se o jogador pertence ao clube
        const existingPlayer = await prisma.player.findFirst({
            where: {
                id: playerId,
                clubId: clubId
            }
        })

        if (!existingPlayer) {
            return NextResponse.json(
                { error: "Jogador não encontrado neste clube" },
                { status: 404 }
            )
        }

        // Deletar o jogador (as participações serão deletadas em cascata)
        await prisma.player.delete({
            where: { id: playerId }
        })

        return NextResponse.json({ message: "Jogador removido com sucesso" })
    } catch (error) {
        console.error("Erro ao deletar jogador:", error)
        
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