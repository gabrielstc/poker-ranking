const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
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

async function smartMigrateProdToDev() {
    console.log('🚀 Iniciando migração inteligente de Produção para Desenvolvimento...\n')

    try {
        // Verificar conexões
        console.log('📡 Verificando conexões com os bancos...')
        await prodPrisma.$connect()
        await devPrisma.$connect()
        console.log('✅ Conexões estabelecidas com sucesso\n')

        // Detectar esquema de produção
        console.log('🔍 Analisando esquema de produção...')
        
        const prodTables = await prodPrisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `

        console.log('📋 Tabelas encontradas em produção:')
        prodTables.forEach(table => {
            console.log(`   - ${table.table_name}`)
        })

        const tableNames = prodTables.map(t => t.table_name)
        const hasClubs = tableNames.includes('clubs')
        const hasUsers = tableNames.includes('users') 
        const hasPlayers = tableNames.includes('players')
        const hasTournaments = tableNames.includes('tournaments')
        const hasParticipations = tableNames.includes('tournament_participations')

        console.log(`\n📊 Análise do esquema:`)
        console.log(`   ${hasClubs ? '✅' : '❌'} Tabela clubs`)
        console.log(`   ${hasUsers ? '✅' : '❌'} Tabela users`)
        console.log(`   ${hasPlayers ? '✅' : '❌'} Tabela players`) 
        console.log(`   ${hasTournaments ? '✅' : '❌'} Tabela tournaments`)
        console.log(`   ${hasParticipations ? '✅' : '❌'} Tabela tournament_participations`)

        // Se não tem a estrutura nova, fazer migração legacy
        if (!hasClubs) {
            console.log('\n🔄 Detectado esquema legacy (sem multi-tenant)')
            console.log('💡 Será criado um clube padrão para os dados existentes\n')
        }

        // Buscar dados de produção baseado no que existe
        console.log('📥 Extraindo dados de produção...')
        
        const prodData = {}

        // Clubs - criar padrão se não existir
        if (hasClubs) {
            prodData.clubs = await prodPrisma.club.findMany({
                orderBy: { createdAt: 'asc' }
            })
        } else {
            // Criar clube padrão para dados legacy
            prodData.clubs = [{
                id: 'legacy-club-id',
                name: 'Clube Principal',
                slug: 'clube-principal', 
                description: 'Clube principal para migração dos dados existentes',
                logo: null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }]
        }

        // Users
        if (hasUsers) {
            const rawUsers = await prodPrisma.user.findMany({
                orderBy: { createdAt: 'asc' }
            })
            
            // Se não tem clubId, atribuir ao clube padrão
            prodData.users = rawUsers.map(user => ({
                ...user,
                clubId: user.clubId || 'legacy-club-id'
            }))
        } else {
            prodData.users = []
        }

        // Players  
        if (hasPlayers) {
            const rawPlayers = await prodPrisma.player.findMany({
                orderBy: { createdAt: 'asc' }
            })
            
            // Se não tem clubId, atribuir ao clube padrão
            prodData.players = rawPlayers.map(player => ({
                ...player,
                clubId: player.clubId || 'legacy-club-id'
            }))
        } else {
            prodData.players = []
        }

        // Tournaments
        if (hasTournaments) {
            const rawTournaments = await prodPrisma.tournament.findMany({
                orderBy: { createdAt: 'asc' }
            })
            
            // Se não tem clubId, atribuir ao clube padrão
            prodData.tournaments = rawTournaments.map(tournament => ({
                ...tournament,
                clubId: tournament.clubId || 'legacy-club-id'
            }))
        } else {
            prodData.tournaments = []
        }

        // Participations
        if (hasParticipations) {
            prodData.participations = await prodPrisma.tournamentParticipation.findMany({
                orderBy: { id: 'asc' }
            })
        } else {
            prodData.participations = []
        }

        console.log(`📊 Dados extraídos:`)
        console.log(`   - ${prodData.clubs.length} clubes`)
        console.log(`   - ${prodData.users.length} usuários`)
        console.log(`   - ${prodData.players.length} jogadores`)
        console.log(`   - ${prodData.tournaments.length} torneios`)
        console.log(`   - ${prodData.participations.length} participações\n`)

        // Confirmar migração
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

        // Limpar banco de desenvolvimento
        console.log('🧹 Limpando banco de desenvolvimento...')
        
        await devPrisma.tournamentParticipation.deleteMany({})
        await devPrisma.tournament.deleteMany({})
        await devPrisma.player.deleteMany({})
        await devPrisma.user.deleteMany({})
        await devPrisma.club.deleteMany({})
        
        console.log('✅ Banco de desenvolvimento limpo\n')

        // Migrar dados
        console.log('📤 Migrando dados para desenvolvimento...')

        // Clubes
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

        // Usuários
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

        // Jogadores
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

        // Torneios
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

        // Participações
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

        // Verificar migração
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

        // Salvar log da migração
        const migrationLog = {
            timestamp: new Date().toISOString(),
            source: 'production',
            target: 'development',
            schema: {
                hasClubs,
                hasUsers,
                hasPlayers,
                hasTournaments,
                hasParticipations
            },
            migrated: {
                clubs: prodData.clubs.length,
                users: prodData.users.length,
                players: prodData.players.length,
                tournaments: prodData.tournaments.length,
                participations: prodData.participations.length
            },
            verification: devData,
            success: isValid
        }

        const logPath = path.join(__dirname, '..', 'backups', `migration-log-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.json`)
        fs.writeFileSync(logPath, JSON.stringify(migrationLog, null, 2))
        console.log(`\n📄 Log da migração salvo em: ${logPath}`)

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
smartMigrateProdToDev()