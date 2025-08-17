import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const { name, nickname, email, phone } = await request.json()
        const { id } = await params

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

        // Verificar se o jogador existe
        const existingPlayer = await prisma.player.findUnique({
            where: { id }
        })

        if (!existingPlayer) {
            return NextResponse.json(
                { error: "Jogador não encontrado" },
                { status: 404 }
            )
        }

        // Verificar se o nickname já está em uso por outro jogador
        const nicknameInUse = await prisma.player.findFirst({
            where: {
                nickname: sanitizedNickname,
                id: { not: id }
            }
        })

        if (nicknameInUse) {
            return NextResponse.json(
                { error: "Nickname já está em uso" },
                { status: 400 }
            )
        }

        const player = await prisma.player.update({
            where: { id },
            data: {
                name: sanitizedName,
                nickname: sanitizedNickname,
                email: sanitizedEmail,
                phone: sanitizedPhone,
            },
        })

        return NextResponse.json(player)
    } catch (error) {
        console.error("Erro ao atualizar jogador:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const { id } = await params

        // Verificar se o jogador existe
        const existingPlayer = await prisma.player.findUnique({
            where: { id }
        })

        if (!existingPlayer) {
            return NextResponse.json(
                { error: "Jogador não encontrado" },
                { status: 404 }
            )
        }

        await prisma.player.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Jogador removido com sucesso" })
    } catch (error) {
        console.error("Erro ao remover jogador:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
