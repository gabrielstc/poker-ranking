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

async function legacyMigration() {
    console.log('🚀 Iniciando migração Legacy para Multi-Tenant...\n')

    try {
        // Verificar conexões
        console.log('📡 Verificando conexões...')
        await prodPrisma.$connect()
        await devPrisma.$connect()
        console.log('✅ Conexões estabelecidas\n')

        // Analisar estrutura das tabelas existentes
        console.log('🔍 Analisando estrutura do banco de produção...')
        
        // Verificar colunas da tabela users
        const userColumns = await prodPrisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
        `

        console.log('📋 Colunas da tabela users:')
        userColumns.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`)
        })

        // Verificar colunas da tabela players  
        const playerColumns = await prodPrisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'players' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
        `

        console.log('\n📋 Colunas da tabela players:')
        playerColumns.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`)
        })

        // Confirmar migração
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        })

        const confirmMigration = await new Promise((resolve) => {
            readline.question('\n⚠️  Continuar com migração legacy? (digite "SIM" para confirmar): ', (answer) => {
                readline.close()
                resolve(answer.toUpperCase() === 'SIM')
            })
        })

        if (!confirmMigration) {
            console.log('❌ Migração cancelada')
            return
        }

        // Criar clube padrão
        const defaultClub = {
            id: 'cmfsdgux30000vvbgqqbmg9tz', // ID fixo para compatibilidade
            name: 'Five Series',
            slug: 'five-series',
            supremaId: "39906",
            description: 'Suprema Five Series Poker Club',
            logo: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        // Buscar dados usando SQL direto
        console.log('\n📥 Extraindo dados de produção...')

        // Usuários (sem role e clubId)
        const rawUsers = await prodPrisma.$queryRaw`
            SELECT id, email, name, password, "createdAt", "updatedAt"
            FROM users
            ORDER BY "createdAt";
        `

        // Jogadores (sem clubId)  
        const rawPlayers = await prodPrisma.$queryRaw`
            SELECT id, name, nickname, email, phone, "createdAt", "updatedAt"
            FROM players
            ORDER BY "createdAt";
        `

        // Torneios (sem clubId)
        const rawTournaments = await prodPrisma.$queryRaw`
            SELECT id, name, date, "buyIn", description, status, type, "createdAt", "updatedAt"
            FROM tournaments
            ORDER BY "createdAt";
        `

        // Participações
        const rawParticipations = await prodPrisma.$queryRaw`
            SELECT id, "playerId", "tournamentId", position, points, prize, eliminated, "eliminatedAt"
            FROM tournament_participations
            ORDER BY id;
        `

        console.log(`📊 Dados extraídos:`)
        console.log(`   - 1 clube (padrão)`)
        console.log(`   - ${rawUsers.length} usuários`)
        console.log(`   - ${rawPlayers.length} jogadores`)
        console.log(`   - ${rawTournaments.length} torneios`)
        console.log(`   - ${rawParticipations.length} participações`)

        // Limpar desenvolvimento
        console.log('\n🧹 Limpando banco de desenvolvimento...')
        
        await devPrisma.tournamentParticipation.deleteMany({})
        await devPrisma.tournament.deleteMany({})
        await devPrisma.player.deleteMany({})
        await devPrisma.user.deleteMany({})
        await devPrisma.club.deleteMany({})
        
        console.log('✅ Banco limpo')

        // Migrar dados
        console.log('\n📤 Migrando para desenvolvimento...')

        // 1. Criar clube padrão
        console.log('   🏢 Criando clube padrão...')
        await devPrisma.club.create({
            data: defaultClub
        })
        console.log('   ✅ Clube criado')

        // 2. Migrar usuários (adicionar role e clubId)
        if (rawUsers.length > 0) {
            console.log(`   👥 Migrando ${rawUsers.length} usuários...`)
            
            for (const user of rawUsers) {
                await devPrisma.user.create({
                    data: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        password: user.password,
                        role: 'CLUB_ADMIN', // Padrão para migração
                        clubId: defaultClub.id,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                })
            }
            console.log('   ✅ Usuários migrados')
        }

        // 3. Migrar jogadores (adicionar clubId)
        if (rawPlayers.length > 0) {
            console.log(`   🎯 Migrando ${rawPlayers.length} jogadores...`)
            
            for (const player of rawPlayers) {
                await devPrisma.player.create({
                    data: {
                        id: player.id,
                        name: player.name,
                        nickname: player.nickname,
                        email: player.email,
                        phone: player.phone,
                        clubId: defaultClub.id,
                        createdAt: player.createdAt,
                        updatedAt: player.updatedAt
                    }
                })
            }
            console.log('   ✅ Jogadores migrados')
        }

        // 4. Migrar torneios (adicionar clubId)
        if (rawTournaments.length > 0) {
            console.log(`   🏆 Migrando ${rawTournaments.length} torneios...`)
            
            for (const tournament of rawTournaments) {
                await devPrisma.tournament.create({
                    data: {
                        id: tournament.id,
                        name: tournament.name,
                        date: tournament.date,
                        buyIn: tournament.buyIn,
                        description: tournament.description,
                        status: tournament.status,
                        type: tournament.type,
                        clubId: defaultClub.id,
                        createdAt: tournament.createdAt,
                        updatedAt: tournament.updatedAt
                    }
                })
            }
            console.log('   ✅ Torneios migrados')
        }

        // 5. Migrar participações (sem alterações)
        if (rawParticipations.length > 0) {
            console.log(`   📊 Migrando ${rawParticipations.length} participações...`)
            
            for (const participation of rawParticipations) {
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
        console.log('\n🔍 Verificando migração...')
        
        const devCounts = {
            clubs: await devPrisma.club.count(),
            users: await devPrisma.user.count(),
            players: await devPrisma.player.count(),
            tournaments: await devPrisma.tournament.count(),
            participations: await devPrisma.tournamentParticipation.count()
        }

        console.log(`📊 Resultado final:`)
        console.log(`   - ${devCounts.clubs} clubes`)
        console.log(`   - ${devCounts.users} usuários`)
        console.log(`   - ${devCounts.players} jogadores`)
        console.log(`   - ${devCounts.tournaments} torneios`)
        console.log(`   - ${devCounts.participations} participações`)

        const success = 
            devCounts.clubs === 1 &&
            devCounts.users === rawUsers.length &&
            devCounts.players === rawPlayers.length &&
            devCounts.tournaments === rawTournaments.length &&
            devCounts.participations === rawParticipations.length

        if (success) {
            console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!')
            console.log('✅ Todos os dados legacy foram migrados para multi-tenant')
            console.log(`\n📋 Resumo da migração:`)
            console.log(`   - Criado clube padrão: "${defaultClub.name}"`)
            console.log(`   - Todos os usuários definidos como CLUB_ADMIN`)
            console.log(`   - Todas as entidades vinculadas ao clube padrão`)
            console.log(`   - Sistema agora é multi-tenant compatível`)
        } else {
            console.log('\n⚠️  Migração com divergências!')
        }

        // Salvar relatório
        const report = {
            timestamp: new Date().toISOString(),
            migration: 'legacy-to-multitenant',
            defaultClub,
            extracted: {
                users: rawUsers.length,
                players: rawPlayers.length,
                tournaments: rawTournaments.length,
                participations: rawParticipations.length
            },
            migrated: devCounts,
            success
        }

        const reportPath = path.join(__dirname, '..', 'backups', `legacy-migration-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.json`)
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
        console.log(`\n📄 Relatório salvo: ${reportPath}`)

    } catch (error) {
        console.error('\n❌ Erro durante migração:', error)
    } finally {
        await prodPrisma.$disconnect()
        await devPrisma.$disconnect()
        console.log('\n📡 Conexões fechadas')
    }
}

// Executar migração
legacyMigration()