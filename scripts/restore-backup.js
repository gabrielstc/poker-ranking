const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Configuração do cliente Prisma para desenvolvimento
const devPrisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DEV_DATABASE_URL
        }
    }
})

async function restoreBackupToDev() {
    console.log('🔄 Iniciando restauração de backup para desenvolvimento...\n')

    try {
        // Listar backups disponíveis
        const backupDir = path.join(__dirname, '..', 'backups')
        
        if (!fs.existsSync(backupDir)) {
            console.log('❌ Diretório de backups não encontrado')
            console.log('💡 Execute primeiro: node scripts/backup-prod.js')
            return
        }

        const backupFiles = fs.readdirSync(backupDir)
            .filter(file => file.startsWith('backup-prod-') && file.endsWith('.json'))
            .sort().reverse() // Mais recente primeiro

        if (backupFiles.length === 0) {
            console.log('❌ Nenhum backup encontrado')
            console.log('💡 Execute primeiro: node scripts/backup-prod.js')
            return
        }

        console.log('📋 Backups disponíveis:')
        backupFiles.forEach((file, index) => {
            const filePath = path.join(backupDir, file)
            const stats = fs.statSync(filePath)
            console.log(`   ${index + 1}. ${file} (${Math.round(stats.size / 1024)}KB - ${stats.mtime.toLocaleString()})`)
        })

        // Usar o backup mais recente por padrão
        const latestBackup = backupFiles[0]
        const backupPath = path.join(backupDir, latestBackup)

        console.log(`\n📂 Usando backup mais recente: ${latestBackup}`)

        // Ler arquivo de backup
        console.log('📖 Lendo arquivo de backup...')
        const backupContent = fs.readFileSync(backupPath, 'utf8')
        const backupData = JSON.parse(backupContent)

        if (!backupData.data) {
            console.log('❌ Formato de backup inválido')
            return
        }

        const { clubs, users, players, tournaments, participations } = backupData.data

        console.log(`📊 Dados no backup:`)
        console.log(`   - ${clubs.length} clubes`)
        console.log(`   - ${users.length} usuários`)
        console.log(`   - ${players.length} jogadores`)
        console.log(`   - ${tournaments.length} torneios`)
        console.log(`   - ${participations.length} participações`)
        console.log(`   - Criado em: ${backupData.metadata.timestamp}\n`)

        // Confirmar restauração
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        })

        const confirmRestore = await new Promise((resolve) => {
            readline.question('⚠️  ATENÇÃO: Isso irá SUBSTITUIR todos os dados em desenvolvimento. Continuar? (digite "SIM" para confirmar): ', (answer) => {
                readline.close()
                resolve(answer.toUpperCase() === 'SIM')
            })
        })

        if (!confirmRestore) {
            console.log('❌ Restauração cancelada pelo usuário')
            return
        }

        // Conectar ao banco de desenvolvimento
        console.log('📡 Conectando ao banco de desenvolvimento...')
        await devPrisma.$connect()
        console.log('✅ Conectado com sucesso')

        // Limpar banco de desenvolvimento
        console.log('🧹 Limpando banco de desenvolvimento...')
        
        await devPrisma.tournamentParticipation.deleteMany({})
        await devPrisma.tournament.deleteMany({})
        await devPrisma.player.deleteMany({})
        await devPrisma.user.deleteMany({})
        await devPrisma.club.deleteMany({})
        
        console.log('✅ Banco limpo\n')

        // Restaurar dados
        console.log('🔄 Restaurando dados do backup...')

        // Restaurar clubes
        if (clubs.length > 0) {
            console.log(`   🏢 Restaurando ${clubs.length} clubes...`)
            for (const club of clubs) {
                await devPrisma.club.create({
                    data: {
                        id: club.id,
                        name: club.name,
                        slug: club.slug,
                        description: club.description,
                        logo: club.logo,
                        isActive: club.isActive,
                        createdAt: new Date(club.createdAt),
                        updatedAt: new Date(club.updatedAt)
                    }
                })
            }
            console.log('   ✅ Clubes restaurados')
        }

        // Restaurar usuários
        if (users.length > 0) {
            console.log(`   👥 Restaurando ${users.length} usuários...`)
            for (const user of users) {
                await devPrisma.user.create({
                    data: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        password: user.password,
                        role: user.role,
                        clubId: user.clubId,
                        createdAt: new Date(user.createdAt),
                        updatedAt: new Date(user.updatedAt)
                    }
                })
            }
            console.log('   ✅ Usuários restaurados')
        }

        // Restaurar jogadores
        if (players.length > 0) {
            console.log(`   🎯 Restaurando ${players.length} jogadores...`)
            for (const player of players) {
                await devPrisma.player.create({
                    data: {
                        id: player.id,
                        name: player.name,
                        nickname: player.nickname,
                        email: player.email,
                        phone: player.phone,
                        clubId: player.clubId,
                        createdAt: new Date(player.createdAt),
                        updatedAt: new Date(player.updatedAt)
                    }
                })
            }
            console.log('   ✅ Jogadores restaurados')
        }

        // Restaurar torneios
        if (tournaments.length > 0) {
            console.log(`   🏆 Restaurando ${tournaments.length} torneios...`)
            for (const tournament of tournaments) {
                await devPrisma.tournament.create({
                    data: {
                        id: tournament.id,
                        name: tournament.name,
                        date: new Date(tournament.date),
                        buyIn: tournament.buyIn,
                        description: tournament.description,
                        status: tournament.status,
                        type: tournament.type,
                        clubId: tournament.clubId,
                        createdAt: new Date(tournament.createdAt),
                        updatedAt: new Date(tournament.updatedAt)
                    }
                })
            }
            console.log('   ✅ Torneios restaurados')
        }

        // Restaurar participações
        if (participations.length > 0) {
            console.log(`   📊 Restaurando ${participations.length} participações...`)
            for (const participation of participations) {
                await devPrisma.tournamentParticipation.create({
                    data: {
                        id: participation.id,
                        playerId: participation.playerId,
                        tournamentId: participation.tournamentId,
                        position: participation.position,
                        points: participation.points,
                        prize: participation.prize,
                        eliminated: participation.eliminated,
                        eliminatedAt: participation.eliminatedAt ? new Date(participation.eliminatedAt) : null
                    }
                })
            }
            console.log('   ✅ Participações restauradas')
        }

        console.log('\n🎉 Restauração concluída com SUCESSO!')
        console.log('✅ Todos os dados do backup foram restaurados em desenvolvimento')

    } catch (error) {
        console.error('\n❌ Erro durante a restauração:', error)
        console.log('\n🔄 Verificações:')
        console.log('1. Confirme se o arquivo de backup existe e é válido')
        console.log('2. Verifique se DEV_DATABASE_URL está correto no .env')
        console.log('3. Confirme se você tem acesso ao banco de desenvolvimento')
    } finally {
        // Fechar conexão
        await devPrisma.$disconnect()
        console.log('\n📡 Conexão com desenvolvimento fechada')
    }
}

// Executar restauração
restoreBackupToDev()