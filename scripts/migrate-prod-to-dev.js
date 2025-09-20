const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

// Configuração dos clientes Prisma
const prodPrisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.PROD_DATABASE_URL
        }
    }
})

const devPrisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DEV_DATABASE_URL
        }
    }
})

async function migrateProdToDev() {
    console.log('🚀 Iniciando migração de Produção para Desenvolvimento...\n')

    try {
        // 1. Verificar conexões
        console.log('📡 Verificando conexões com os bancos...')
        await prodPrisma.$connect()
        await devPrisma.$connect()
        console.log('✅ Conexões estabelecidas com sucesso\n')

        // 2. Buscar dados de produção
        console.log('📥 Buscando dados de produção...')
        
        const prodData = {
            clubs: await prodPrisma.club.findMany({
                orderBy: { createdAt: 'asc' }
            }),
            users: await prodPrisma.user.findMany({
                orderBy: { createdAt: 'asc' }
            }),
            players: await prodPrisma.player.findMany({
                orderBy: { createdAt: 'asc' }
            }),
            tournaments: await prodPrisma.tournament.findMany({
                orderBy: { createdAt: 'asc' }
            }),
            participations: await prodPrisma.tournamentParticipation.findMany({
                orderBy: { id: 'asc' }
            })
        }

        console.log(`📊 Dados encontrados em produção:`)
        console.log(`   - ${prodData.clubs.length} clubes`)
        console.log(`   - ${prodData.users.length} usuários`)
        console.log(`   - ${prodData.players.length} jogadores`)
        console.log(`   - ${prodData.tournaments.length} torneios`)
        console.log(`   - ${prodData.participations.length} participações\n`)

        // 3. Confirmar migração
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        })

        const confirmMigration = await new Promise((resolve) => {
            readline.question('⚠️  ATENÇÃO: Isso irá SUBSTITUIR todos os dados em desenvolvimento. Continuar? (digite "SIM" para confirmar): ', (answer) => {
                readline.close()
                resolve(answer.toUpperCase() === 'SIM')
            })
        })

        if (!confirmMigration) {
            console.log('❌ Migração cancelada pelo usuário')
            return
        }

        // 4. Limpar banco de desenvolvimento
        console.log('🧹 Limpando banco de desenvolvimento...')
        
        // Ordem de deleção respeitando foreign keys
        await devPrisma.tournamentParticipation.deleteMany({})
        await devPrisma.tournament.deleteMany({})
        await devPrisma.player.deleteMany({})
        await devPrisma.user.deleteMany({})
        await devPrisma.club.deleteMany({})
        
        console.log('✅ Banco de desenvolvimento limpo\n')

        // 5. Migrar dados (respeitando ordem de dependências)
        console.log('📤 Migrando dados para desenvolvimento...')

        // 5.1 Migrar clubes
        if (prodData.clubs.length > 0) {
            console.log(`   🏢 Migrando ${prodData.clubs.length} clubes...`)
            for (const club of prodData.clubs) {
                await devPrisma.club.create({
                    data: {
                        id: club.id,
                        name: club.name,
                        slug: club.slug,
                        description: club.description,
                        logo: club.logo,
                        isActive: club.isActive,
                        createdAt: club.createdAt,
                        updatedAt: club.updatedAt
                    }
                })
            }
            console.log('   ✅ Clubes migrados')
        }

        // 5.2 Migrar usuários
        if (prodData.users.length > 0) {
            console.log(`   👥 Migrando ${prodData.users.length} usuários...`)
            for (const user of prodData.users) {
                await devPrisma.user.create({
                    data: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        password: user.password,
                        role: user.role,
                        clubId: user.clubId,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                })
            }
            console.log('   ✅ Usuários migrados')
        }

        // 5.3 Migrar jogadores
        if (prodData.players.length > 0) {
            console.log(`   🎯 Migrando ${prodData.players.length} jogadores...`)
            for (const player of prodData.players) {
                await devPrisma.player.create({
                    data: {
                        id: player.id,
                        name: player.name,
                        nickname: player.nickname,
                        email: player.email,
                        phone: player.phone,
                        clubId: player.clubId,
                        createdAt: player.createdAt,
                        updatedAt: player.updatedAt
                    }
                })
            }
            console.log('   ✅ Jogadores migrados')
        }

        // 5.4 Migrar torneios
        if (prodData.tournaments.length > 0) {
            console.log(`   🏆 Migrando ${prodData.tournaments.length} torneios...`)
            for (const tournament of prodData.tournaments) {
                await devPrisma.tournament.create({
                    data: {
                        id: tournament.id,
                        name: tournament.name,
                        date: tournament.date,
                        buyIn: tournament.buyIn,
                        description: tournament.description,
                        status: tournament.status,
                        type: tournament.type,
                        clubId: tournament.clubId,
                        createdAt: tournament.createdAt,
                        updatedAt: tournament.updatedAt
                    }
                })
            }
            console.log('   ✅ Torneios migrados')
        }

        // 5.5 Migrar participações
        if (prodData.participations.length > 0) {
            console.log(`   📊 Migrando ${prodData.participations.length} participações...`)
            for (const participation of prodData.participations) {
                await devPrisma.tournamentParticipation.create({
                    data: {
                        id: participation.id,
                        playerId: participation.playerId,
                        tournamentId: participation.tournamentId,
                        position: participation.position,
                        points: participation.points,
                        prize: participation.prize,
                        eliminated: participation.eliminated,
                        eliminatedAt: participation.eliminatedAt
                    }
                })
            }
            console.log('   ✅ Participações migradas')
        }

        // 6. Verificar migração
        console.log('\n🔍 Verificando integridade da migração...')
        
        const devData = {
            clubs: await devPrisma.club.count(),
            users: await devPrisma.user.count(),
            players: await devPrisma.player.count(),
            tournaments: await devPrisma.tournament.count(),
            participations: await devPrisma.tournamentParticipation.count()
        }

        console.log(`📊 Dados em desenvolvimento após migração:`)
        console.log(`   - ${devData.clubs} clubes (era ${prodData.clubs.length})`)
        console.log(`   - ${devData.users} usuários (era ${prodData.users.length})`)
        console.log(`   - ${devData.players} jogadores (era ${prodData.players.length})`)
        console.log(`   - ${devData.tournaments} torneios (era ${prodData.tournaments.length})`)
        console.log(`   - ${devData.participations} participações (era ${prodData.participations.length})`)

        // Verificar se os números conferem
        const isValid = 
            devData.clubs === prodData.clubs.length &&
            devData.users === prodData.users.length &&
            devData.players === prodData.players.length &&
            devData.tournaments === prodData.tournaments.length &&
            devData.participations === prodData.participations.length

        if (isValid) {
            console.log('\n🎉 Migração concluída com SUCESSO!')
            console.log('✅ Todos os dados foram migrados corretamente')
        } else {
            console.log('\n⚠️  Migração concluída com DIVERGÊNCIAS!')
            console.log('❗ Verifique os logs acima para possíveis problemas')
        }

    } catch (error) {
        console.error('\n❌ Erro durante a migração:', error)
        console.log('\n🔄 Recomendações:')
        console.log('1. Verifique as conexões com os bancos')
        console.log('2. Confirme se as variáveis de ambiente estão corretas')
        console.log('3. Execute novamente o script se necessário')
    } finally {
        // Fechar conexões
        await prodPrisma.$disconnect()
        await devPrisma.$disconnect()
        console.log('\n📡 Conexões fechadas')
    }
}

// Executar migração
migrateProdToDev()