import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin, requireClubAdmin } from "@/lib/permissions"

export async function GET() {
    try {
        // Qualquer usuário autenticado pode ver a lista de clubes
        const user = await requireClubAdmin()
        
        // Se for super admin, pode ver todos os clubes
        // Se for club admin, só vê seu próprio clube
        const whereClause = user.role === 'SUPER_ADMIN' ? {} : { id: user.clubId! }
        
        const clubs = await prisma.club.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                description: true,
                logo: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: {
                        users: true,
                        players: true,
                        tournaments: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(clubs)
    } catch (error) {
        console.error("Erro ao buscar clubes:", error)
        
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

export async function POST(request: NextRequest) {
    try {
        // Apenas super admin pode criar clubes
        await requireSuperAdmin()

        const { name, description, logo } = await request.json()

        // Validação
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return NextResponse.json(
                { error: "Nome deve ter pelo menos 2 caracteres" },
                { status: 400 }
            )
        }

        const sanitizedName = name.trim()
        const sanitizedDescription = description?.trim() || null
        const sanitizedLogo = logo?.trim() || null

        // Verificar se já existe clube com esse nome
        const existingClub = await prisma.club.findUnique({
            where: { name: sanitizedName }
        })

        if (existingClub) {
            return NextResponse.json(
                { error: "Já existe um clube com este nome" },
                { status: 400 }
            )
        }

        // Criar slug automaticamente
        const slug = sanitizedName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
            .replace(/\s+/g, '-') // Substitui espaços por hífens
            .replace(/-+/g, '-') // Remove hífens múltiplos
            .replace(/^-+|-+$/g, '') // Remove hífens do início e fim

        // Verificar se o slug já existe e criar um único se necessário
        let finalSlug = slug
        let counter = 1
        while (true) {
            const existingSlug = await prisma.club.findUnique({
                where: { slug: finalSlug }
            })

            if (!existingSlug) {
                break
            }

            counter++
            finalSlug = `${slug}-${counter}`
        }

        const club = await prisma.club.create({
            data: {
                name: sanitizedName,
                slug: finalSlug,
                description: sanitizedDescription,
                logo: sanitizedLogo,
                isActive: true
            }
        })

        return NextResponse.json(club, { status: 201 })
    } catch (error) {
        console.error("Erro ao criar clube:", error)
        
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