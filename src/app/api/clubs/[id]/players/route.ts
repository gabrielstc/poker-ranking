import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireClubAdmin, validateClubAccess } from "@/lib/permissions"
import { CreatePlayerSchema, validateSchema } from "@/lib/validation"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireClubAdmin()
        const clubId = params.id

        // Validação de acesso ao clube
        validateClubAccess(user, clubId)

        const players = await prisma.player.findMany({
            where: { clubId },
            orderBy: { name: 'asc' },
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

        // Log de auditoria
        console.log(`📊 Players listados - User: ${user.email}, Club: ${clubId}, Count: ${players.length}`)

        return NextResponse.json(players)
    } catch (error) {
        console.error("Erro ao buscar jogadores do clube:", error)
        
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

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireClubAdmin()
        const clubId = params.id

        // Validação de acesso ao clube
        validateClubAccess(user, clubId)

        const body = await request.json()
        
        // Validação rigorosa com Zod
        const validatedData = validateSchema(CreatePlayerSchema, body)

        // Verificar se o nickname já existe no clube
        const existingPlayer = await prisma.player.findUnique({
            where: { 
                nickname_clubId: {
                    nickname: validatedData.nickname,
                    clubId: clubId
                }
            }
        })

        if (existingPlayer) {
            return NextResponse.json(
                { error: "Nickname já está em uso neste clube" },
                { status: 400 }
            )
        }

        const player = await prisma.player.create({
            data: {
                name: validatedData.name,
                nickname: validatedData.nickname,
                email: validatedData.email || null,
                phone: validatedData.phone || null,
                clubId: clubId,
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

        // Log de auditoria
        console.log(`👤 Player criado - User: ${user.email}, Club: ${clubId}, Player: ${player.id}`)

        return NextResponse.json(player, { status: 201 })
    } catch (error) {
        console.error("Erro ao criar jogador:", error)
        
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