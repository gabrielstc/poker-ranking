import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const clubs = await prisma.club.findMany({
            where: {
                isActive: true
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                logo: true,
                _count: {
                    select: {
                        players: true,
                        tournaments: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json(clubs)
    } catch (error) {
        console.error("Erro ao buscar clubes:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}