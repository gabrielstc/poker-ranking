import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
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

        const { name, nickname, email, phone } = await request.json()
        const { id } = params

        if (!name || !nickname) {
            return NextResponse.json(
                { error: "Nome e nickname são obrigatórios" },
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
                nickname,
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
                name,
                nickname,
                email,
                phone,
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

        const { id } = params

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
