import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Tentar buscar por ID primeiro, depois por slug
        let club = await prisma.club.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                logo: true,
                supremaId: true,
                isActive: true,
                _count: {
                    select: {
                        players: true,
                        tournaments: true
                    }
                }
            }
        })

        // Se não encontrou por ID, tentar por slug
        if (!club) {
            club = await prisma.club.findUnique({
                where: { slug: id },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    logo: true,
                    supremaId: true,
                    isActive: true,
                    _count: {
                        select: {
                            players: true,
                            tournaments: true
                        }
                    }
                }
            })
        }

        if (!club || !club.isActive) {
            return NextResponse.json(
                { error: "Clube não encontrado" },
                { status: 404 }
            )
        }

        return NextResponse.json(club)
    } catch (error) {
        console.error("Erro ao buscar clube:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}