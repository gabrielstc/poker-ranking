import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/permissions"
import bcrypt from "bcryptjs"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireSuperAdmin()
        
        const users = await prisma.user.findMany({
            where: { clubId: params.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                club: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("Erro ao buscar usuários do clube:", error)
        
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

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireSuperAdmin()

        const { name, email, password, role = 'CLUB_ADMIN' } = await request.json()

        // Validação
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return NextResponse.json(
                { error: "Nome deve ter pelo menos 2 caracteres" },
                { status: 400 }
            )
        }

        if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
            return NextResponse.json(
                { error: "Email inválido" },
                { status: 400 }
            )
        }

        if (!password || typeof password !== 'string' || password.length < 6) {
            return NextResponse.json(
                { error: "Senha deve ter pelo menos 6 caracteres" },
                { status: 400 }
            )
        }

        if (!['CLUB_ADMIN', 'SUPER_ADMIN'].includes(role)) {
            return NextResponse.json(
                { error: "Role inválido" },
                { status: 400 }
            )
        }

        // Verificar se o clube existe
        const club = await prisma.club.findUnique({
            where: { id: params.id }
        })

        if (!club) {
            return NextResponse.json(
                { error: "Clube não encontrado" },
                { status: 404 }
            )
        }

        const sanitizedName = name.trim()
        const sanitizedEmail = email.trim().toLowerCase()

        // Verificar se já existe usuário com este email
        const existingUser = await prisma.user.findUnique({
            where: { email: sanitizedEmail }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Já existe um usuário com este email" },
                { status: 400 }
            )
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await prisma.user.create({
            data: {
                name: sanitizedName,
                email: sanitizedEmail,
                password: hashedPassword,
                role,
                clubId: role === 'CLUB_ADMIN' ? params.id : null
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                club: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        console.error("Erro ao criar usuário:", error)
        
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