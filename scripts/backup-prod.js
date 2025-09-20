const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Configuração do cliente Prisma para produção
const prodPrisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.PROD_DATABASE_URL
        }
    }
})

async function backupProdData() {
    console.log('💾 Iniciando backup dos dados de produção...\n')

    try {
        // Conectar ao banco de produção
        console.log('📡 Conectando ao banco de produção...')
        await prodPrisma.$connect()
        console.log('✅ Conectado com sucesso\n')

        // Buscar todos os dados
        console.log('📥 Extraindo dados de produção...')
        
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

        console.log(`📊 Dados extraídos:`)
        console.log(`   - ${prodData.clubs.length} clubes`)
        console.log(`   - ${prodData.users.length} usuários`)
        console.log(`   - ${prodData.players.length} jogadores`)
        console.log(`   - ${prodData.tournaments.length} torneios`)
        console.log(`   - ${prodData.participations.length} participações\n`)

        // Gerar nome do arquivo com timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        const backupFileName = `backup-prod-${timestamp}.json`
        const backupPath = path.join(__dirname, '..', 'backups', backupFileName)

        // Criar diretório de backups se não existir
        const backupDir = path.dirname(backupPath)
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true })
        }

        // Adicionar metadados ao backup
        const backupData = {
            metadata: {
                timestamp: new Date().toISOString(),
                version: '1.0',
                source: 'production',
                totalRecords: Object.values(prodData).reduce((total, arr) => total + arr.length, 0)
            },
            data: prodData
        }

        // Salvar backup
        console.log(`💾 Salvando backup em: ${backupPath}`)
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8')
        
        console.log(`✅ Backup salvo com sucesso!`)
        console.log(`📄 Arquivo: ${backupFileName}`)
        console.log(`📁 Localização: ${backupPath}`)
        console.log(`📊 Total de registros: ${backupData.metadata.totalRecords}`)

        // Estatísticas detalhadas
        console.log('\n📈 Estatísticas detalhadas:')
        for (const [table, records] of Object.entries(prodData)) {
            if (records.length > 0) {
                console.log(`   ${table}: ${records.length} registros`)
            }
        }

    } catch (error) {
        console.error('\n❌ Erro durante o backup:', error)
        console.log('\n🔄 Verificações:')
        console.log('1. Confirme se PROD_DATABASE_URL está correto no .env')
        console.log('2. Verifique se você tem acesso ao banco de produção')
        console.log('3. Confirme se as permissões de escrita estão corretas')
    } finally {
        // Fechar conexão
        await prodPrisma.$disconnect()
        console.log('\n📡 Conexão com produção fechada')
    }
}

// Executar backup
backupProdData()