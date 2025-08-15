// Script para criar torneios de exemplo para demonstrar o sistema de pontuação

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const sampleTournaments = [
    {
        name: "Torneio Pequeno - 6 Jogadores",
        date: new Date("2025-08-20"),
        buyIn: 50,
        description: "Torneio pequeno para demonstrar a distribuição de pontos com poucos participantes",
        status: "COMPLETED",
        participants: 6
    },
    {
        name: "Torneio Médio - 12 Jogadores",
        date: new Date("2025-08-22"),
        buyIn: 100,
        description: "Torneio de tamanho médio mostrando como a pontuação escala",
        status: "COMPLETED",
        participants: 12
    },
    {
        name: "Torneio Grande - 20 Jogadores",
        date: new Date("2025-08-25"),
        buyIn: 150,
        description: "Grande torneio demonstrando alta distribuição de pontos",
        status: "COMPLETED",
        participants: 20
    },
    {
        name: "Mega Torneio - 30 Jogadores",
        date: new Date("2025-08-30"),
        buyIn: 200,
        description: "Torneio massivo para mostrar o sistema exponencial em ação",
        status: "COMPLETED",
        participants: 30
    }
]

function calculateTournamentPoints(totalParticipants) {
    if (totalParticipants < 2) {
        return [{ position: 1, points: 100 }]
    }

    const basePoints = Math.round(Math.pow(totalParticipants, 1.5) * 10)
    const payoutPositions = Math.max(3, Math.ceil(totalParticipants * 0.5))

    const pointsDistribution = []

    for (let position = 1; position <= payoutPositions; position++) {
        const decayFactor = Math.pow(0.8, position - 1)
        const points = Math.round(basePoints * decayFactor)
        const minimumPoints = Math.max(10, Math.round(basePoints * 0.1))

        pointsDistribution.push({
            position,
            points: Math.max(points, minimumPoints)
        })
    }

    return pointsDistribution
}

async function createSampleTournaments() {
    console.log('🎯 Criando torneios de exemplo...')

    for (const tournamentData of sampleTournaments) {
        // Criar o torneio
        const tournament = await prisma.tournament.create({
            data: {
                name: tournamentData.name,
                date: tournamentData.date,
                buyIn: tournamentData.buyIn,
                description: tournamentData.description,
                status: tournamentData.status
            }
        })

        console.log(`✅ Criado: ${tournament.name}`)

        // Buscar jogadores disponíveis
        const players = await prisma.player.findMany()

        if (players.length < tournamentData.participants) {
            console.log(`⚠️  Não há jogadores suficientes para ${tournament.name}`)
            continue
        }

        // Selecionar jogadores aleatórios
        const selectedPlayers = players
            .sort(() => Math.random() - 0.5)
            .slice(0, tournamentData.participants)

        // Calcular distribuição de pontos
        const pointsDistribution = calculateTournamentPoints(tournamentData.participants)

        // Criar participações com posições aleatórias
        const shuffledPositions = Array.from(
            { length: tournamentData.participants },
            (_, i) => i + 1
        ).sort(() => Math.random() - 0.5)

        for (let i = 0; i < selectedPlayers.length; i++) {
            const position = shuffledPositions[i]
            const pointsEntry = pointsDistribution.find(p => p.position === position)
            const points = pointsEntry ? pointsEntry.points : 0

            // Simular prêmios para as primeiras posições
            let prize = null
            if (position === 1) prize = tournamentData.buyIn * tournamentData.participants * 0.5
            else if (position === 2) prize = tournamentData.buyIn * tournamentData.participants * 0.3
            else if (position === 3) prize = tournamentData.buyIn * tournamentData.participants * 0.2

            await prisma.tournamentParticipation.create({
                data: {
                    playerId: selectedPlayers[i].id,
                    tournamentId: tournament.id,
                    position: position,
                    points: points,
                    prize: prize
                }
            })
        }

        console.log(`   📊 Adicionados ${selectedPlayers.length} participantes`)
        console.log(`   🏆 1º lugar: ${pointsDistribution[0].points} pontos`)
        console.log(`   💰 Prêmio total: R$ ${tournamentData.buyIn * tournamentData.participants}`)
    }
}

async function main() {
    try {
        await createSampleTournaments()
        console.log('\n🎉 Torneios de exemplo criados com sucesso!')
        console.log('\n📈 Agora você pode testar o sistema de pontuação:')
        console.log('1. Acesse /admin/tournaments')
        console.log('2. Clique em "Ver Participantes" em qualquer torneio')
        console.log('3. Use "Recalcular Pontos" para testar o sistema')
        console.log('4. Visite /admin/points-system para ver a documentação')
    } catch (error) {
        console.error('❌ Erro ao criar torneios:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
