import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/permissions"
import bcrypt from "bcryptjs"

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string; userId: string } }
) {
    try {
        await requireSuperAdmin()

        const { name, email, password, role } = await request.json()

        // Validação
        if (name && (typeof name !== 'string' || name.trim().length < 2)) {
            return NextResponse.json(
                { error: "Nome deve ter pelo menos 2 caracteres" },
                { status: 400 }
            )
        }

        if (email && (typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email))) {
            return NextResponse.json(
                { error: "Email inválido" },
                { status: 400 }
            )
        }

        if (password && (typeof password !== 'string' || password.length < 6)) {
            return NextResponse.json(
                { error: "Senha deve ter pelo menos 6 caracteres" },
                { status: 400 }
            )
        }

        if (role && !['CLUB_ADMIN', 'SUPER_ADMIN'].includes(role)) {
            return NextResponse.json(
                { error: "Role inválido" },
                { status: 400 }
            )
        }

        // Verificar se o usuário existe
        const existingUser = await prisma.user.findUnique({
            where: { id: params.userId }
        })

        if (!existingUser) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            )
        }

        // Verificar conflito de email
        if (email) {
            const emailConflict = await prisma.user.findFirst({
                where: { 
                    email: email.trim().toLowerCase(),
                    NOT: { id: params.userId }
                }
            })

            if (emailConflict) {
                return NextResponse.json(
                    { error: "Já existe outro usuário com este email" },
                    { status: 400 }
                )
            }
        }

        // Preparar dados para atualização
        const updateData: {
            name?: string
            email?: string
            role?: 'CLUB_ADMIN' | 'SUPER_ADMIN'
            clubId?: string | null
            password?: string
        } = {}
        
        if (name) updateData.name = name.trim()
        if (email) updateData.email = email.trim().toLowerCase()
        if (role) {
            updateData.role = role as 'CLUB_ADMIN' | 'SUPER_ADMIN'
            updateData.clubId = role === 'CLUB_ADMIN' ? params.id : null
        }
        if (password) {
            updateData.password = await bcrypt.hash(password, 12)
        }

        const user = await prisma.user.update({
            where: { id: params.userId },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: updateData as any, // Usar any aqui devido a complexidade do tipo Prisma
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                club: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error)
        
        if (error instanceof Error && error.message.includes('Acesso negado')) {
            return NextResponse.json(
                { error: error.message },
                { status: 403 }
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
    { params }: { params: { id: string; userId: string } }
) {
    try {
        await requireSuperAdmin()

        // Verificar se o usuário existe
        const user = await prisma.user.findUnique({
            where: { id: params.userId }
        })

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            )
        }

        // Não permitir excluir super admin (proteção)
        if (user.role === 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: "Não é possível excluir usuário super admin" },
                { status: 400 }
            )
        }

        await prisma.user.delete({
            where: { id: params.userId }
        })

        return NextResponse.json({ message: "Usuário excluído com sucesso" })
    } catch (error) {
        console.error("Erro ao excluir usuário:", error)
        
        if (error instanceof Error && error.message.includes('Acesso negado')) {
            return NextResponse.json(
                { error: error.message },
                { status: 403 }
            )
        }

        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}