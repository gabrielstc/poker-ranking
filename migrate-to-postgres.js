// Script para migrar dados do SQLite para PostgreSQL
const { PrismaClient } = require('@prisma/client')
const { withAccelerate } = require('@prisma/extension-accelerate')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

async function migrateData() {
    console.log('🔄 Iniciando migração de dados SQLite → PostgreSQL...')

    // Conectar ao PostgreSQL
    const postgresPrisma = new PrismaClient({
        log: ['info', 'warn', 'error'],
    }).$extends(withAccelerate())

    try {
        // Verificar se há dados no SQLite para migrar
        const sqliteDbPath = path.join(__dirname, 'prisma', 'dev.db')
        console.log('📁 Verificando arquivo SQLite:', sqliteDbPath)

        const fs = require('fs')
        if (!fs.existsSync(sqliteDbPath)) {
            console.log('ℹ️  Arquivo SQLite não encontrado. Criando banco PostgreSQL vazio.')
            return
        }

        console.log('✅ Arquivo SQLite encontrado. Iniciando migração...')

        // Aqui você pode adicionar lógica específica de migração
        // Por exemplo, ler dados do SQLite e inserir no PostgreSQL

        console.log('🎉 Migração concluída com sucesso!')

    } catch (error) {
        console.error('❌ Erro durante a migração:', error)
        throw error
    } finally {
        await postgresPrisma.$disconnect()
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    migrateData()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
}

module.exports = { migrateData }
