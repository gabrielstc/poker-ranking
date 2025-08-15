import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Populando banco de dados...')

    // Criar usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@poker.com' },
        update: {},
        create: {
            email: 'admin@poker.com',
            name: 'Administrador',
            password: hashedPassword,
        },
    })

    console.log('👤 Usuário admin criado:', admin.email)

    // Criar jogadores
    const players = await Promise.all([
        prisma.player.upsert({
            where: { nickname: 'pokerface' },
            update: {},
            create: {
                name: 'João Silva',
                nickname: 'pokerface',
                email: 'joao@email.com',
                phone: '(11) 99999-9999',
            },
        }),
        prisma.player.upsert({
            where: { nickname: 'allinfox' },
            update: {},
            create: {
                name: 'Maria Santos',
                nickname: 'allinfox',
                email: 'maria@email.com',
                phone: '(11) 88888-8888',
            },
        }),
        prisma.player.upsert({
            where: { nickname: 'bluffking' },
            update: {},
            create: {
                name: 'Pedro Costa',
                nickname: 'bluffking',
                email: 'pedro@email.com',
                phone: '(11) 77777-7777',
            },
        }),
        prisma.player.upsert({
            where: { nickname: 'aceshot' },
            update: {},
            create: {
                name: 'Ana Oliveira',
                nickname: 'aceshot',
                email: 'ana@email.com',
                phone: '(11) 66666-6666',
            },
        }),
        prisma.player.upsert({
            where: { nickname: 'royalflush' },
            update: {},
            create: {
                name: 'Carlos Ferreira',
                nickname: 'royalflush',
                email: 'carlos@email.com',
                phone: '(11) 55555-5555',
            },
        }),
    ])

    console.log('🎮 Jogadores criados:', players.length)

    // Criar torneios
    const tournaments = await Promise.all([
        prisma.tournament.upsert({
            where: { id: 'tournament-1' },
            update: {},
            create: {
                id: 'tournament-1',
                name: 'Torneio de Julho 2025',
                date: new Date('2025-07-15T19:00:00Z'),
                buyIn: 50.00,
                description: 'Torneio mensal de Texas Hold\'em',
                status: 'COMPLETED',
            },
        }),
        prisma.tournament.upsert({
            where: { id: 'tournament-2' },
            update: {},
            create: {
                id: 'tournament-2',
                name: 'Torneio de Agosto 2025',
                date: new Date('2025-08-15T19:00:00Z'),
                buyIn: 75.00,
                description: 'Torneio especial de agosto',
                status: 'COMPLETED',
            },
        }),
        prisma.tournament.upsert({
            where: { id: 'tournament-3' },
            update: {},
            create: {
                id: 'tournament-3',
                name: 'Torneio de Setembro 2025',
                date: new Date('2025-09-15T19:00:00Z'),
                buyIn: 60.00,
                description: 'Torneio de setembro',
                status: 'UPCOMING',
            },
        }),
    ])

    console.log('🏆 Torneios criados:', tournaments.length)

    // Criar participações para o torneio de julho
    const julyParticipations = [
        { playerId: players[0].id, position: 1, points: 100, prize: 200.00 },
        { playerId: players[1].id, position: 2, points: 80, prize: 100.00 },
        { playerId: players[2].id, position: 3, points: 60, prize: 50.00 },
        { playerId: players[3].id, position: 4, points: 40, prize: null },
        { playerId: players[4].id, position: 5, points: 20, prize: null },
    ]

    for (const participation of julyParticipations) {
        await prisma.tournamentParticipation.upsert({
            where: {
                playerId_tournamentId: {
                    playerId: participation.playerId,
                    tournamentId: tournaments[0].id,
                },
            },
            update: {},
            create: {
                playerId: participation.playerId,
                tournamentId: tournaments[0].id,
                position: participation.position,
                points: participation.points,
                prize: participation.prize,
            },
        })
    }

    // Criar participações para o torneio de agosto
    const augustParticipations = [
        { playerId: players[1].id, position: 1, points: 100, prize: 300.00 },
        { playerId: players[3].id, position: 2, points: 80, prize: 150.00 },
        { playerId: players[0].id, position: 3, points: 60, prize: 75.00 },
        { playerId: players[4].id, position: 4, points: 40, prize: null },
        { playerId: players[2].id, position: 5, points: 20, prize: null },
    ]

    for (const participation of augustParticipations) {
        await prisma.tournamentParticipation.upsert({
            where: {
                playerId_tournamentId: {
                    playerId: participation.playerId,
                    tournamentId: tournaments[1].id,
                },
            },
            update: {},
            create: {
                playerId: participation.playerId,
                tournamentId: tournaments[1].id,
                position: participation.position,
                points: participation.points,
                prize: participation.prize,
            },
        })
    }

    console.log('🎯 Participações criadas')
    console.log('✅ Banco de dados populado com sucesso!')
    console.log('📧 Login admin: admin@poker.com')
    console.log('🔒 Senha admin: admin123')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
