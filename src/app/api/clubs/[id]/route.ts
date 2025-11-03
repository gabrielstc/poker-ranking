import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/permissions"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireSuperAdmin()
        
        const club = await prisma.club.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: {
                        users: true,
                        players: true,
                        tournaments: true
                    }
                },
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true
                    }
                }
            }
        })

        if (!club) {
            return NextResponse.json(
                { error: "Clube não encontrado" },
                { status: 404 }
            )
        }

        return NextResponse.json(club)
    } catch (error) {
        console.error("Erro ao buscar clube:", error)
        
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

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireSuperAdmin()

        const { name, description, logo, supremaId, whatsapp, isActive } = await request.json()

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
        const sanitizedSupremaId = supremaId?.trim() || null
        const sanitizedWhatsapp = whatsapp?.trim() || null

        // Verificar se já existe outro clube com esse nome
        const existingClub = await prisma.club.findFirst({
            where: { 
                name: sanitizedName,
                NOT: { id: params.id }
            }
        })

        if (existingClub) {
            return NextResponse.json(
                { error: "Já existe outro clube com este nome" },
                { status: 400 }
            )
        }

        const club = await prisma.club.update({
            where: { id: params.id },
            data: {
                name: sanitizedName,
                description: sanitizedDescription,
                logo: sanitizedLogo,
                supremaId: sanitizedSupremaId,
                whatsapp: sanitizedWhatsapp,
                isActive: isActive !== undefined ? Boolean(isActive) : undefined,
            }
        })

        return NextResponse.json(club)
    } catch (error) {
        console.error("Erro ao atualizar clube:", error)
        
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
    { params }: { params: { id: string } }
) {
    try {
        await requireSuperAdmin()

        // Verificar se existem dados relacionados
        const club = await prisma.club.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: {
                        users: true,
                        players: true,
                        tournaments: true
                    }
                }
            }
        })

        if (!club) {
            return NextResponse.json(
                { error: "Clube não encontrado" },
                { status: 404 }
            )
        }

        // Verificar se há dados que impedem a exclusão
        if (club._count.users > 0 || club._count.players > 0 || club._count.tournaments > 0) {
            return NextResponse.json(
                { 
                    error: "Não é possível excluir o clube pois há dados relacionados",
                    details: {
                        users: club._count.users,
                        players: club._count.players,
                        tournaments: club._count.tournaments
                    }
                },
                { status: 400 }
            )
        }

        await prisma.club.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: "Clube excluído com sucesso" })
    } catch (error) {
        console.error("Erro ao excluir clube:", error)
        
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