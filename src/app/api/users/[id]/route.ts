import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

        const { id } = await params
        const { name, email, password } = await request.json()

        const updateData: {
            name: string
            email: string
            password?: string
        } = {
            name,
            email
        }

        // Se uma nova senha foi fornecida, hash ela
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 12)
            updateData.password = hashedPassword
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error)
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

        await prisma.user.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Erro ao excluir usuário:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
