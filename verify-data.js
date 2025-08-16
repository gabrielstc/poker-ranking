const { PrismaClient } = require('@prisma/client')
const { withAccelerate } = require('@prisma/extension-accelerate')

async function verifyData() {
    console.log('🔍 Verificando dados no PostgreSQL...')

    const prisma = new PrismaClient().$extends(withAccelerate())

    try {
        // Verificar usuários
        const users = await prisma.user.count()
        console.log(`👤 Usuários: ${users}`)

        // Verificar jogadores
        const players = await prisma.player.count()
        console.log(`🎮 Jogadores: ${players}`)

        // Verificar torneios
        const tournaments = await prisma.tournament.count()
        console.log(`🏆 Torneios: ${tournaments}`)

        // Verificar participações
        const participations = await prisma.tournamentParticipation.count()
        console.log(`🎯 Participações: ${participations}`)

        // Verificar dados específicos
        const adminUser = await prisma.user.findUnique({
            where: { email: 'admin@poker.com' }
        })
        console.log(`✅ Admin existe: ${adminUser ? 'Sim' : 'Não'}`)

        console.log('🎉 Verificação concluída!')

    } catch (error) {
        console.error('❌ Erro:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

verifyData()
