const { exec } = require('child_process')
const util = require('util')
require('dotenv').config()

const execAsync = util.promisify(exec)

async function setupDevDatabase() {
    console.log('🔧 Configurando banco de desenvolvimento...\n')

    try {
        // Salvar URL atual
        const originalUrl = process.env.DATABASE_URL
        
        // Usar URL de desenvolvimento
        process.env.DATABASE_URL = process.env.DEV_DATABASE_URL
        
        console.log('📡 Conectando ao banco de desenvolvimento...')
        console.log(`🌐 URL: ${process.env.DEV_DATABASE_URL?.split('@')[1] || 'hidden'}`)

        // Executar migrações
        console.log('\n🚀 Aplicando migrações...')
        const { stdout, stderr } = await execAsync('npx prisma migrate deploy')
        
        if (stderr && !stderr.includes('Environment variables loaded')) {
            console.error('⚠️ Avisos:', stderr)
        }
        
        console.log(stdout)
        
        // Gerar Prisma Client
        console.log('🔄 Gerando Prisma Client...')
        const { stdout: generateOutput } = await execAsync('npx prisma generate')
        console.log(generateOutput)
        
        // Restaurar URL original
        process.env.DATABASE_URL = originalUrl
        
        console.log('✅ Banco de desenvolvimento configurado com sucesso!')
        console.log('\n💡 Agora você pode executar:')
        console.log('   node scripts/legacy-migrate.js')
        
    } catch (error) {
        console.error('❌ Erro ao configurar banco:', error.message)
        
        if (error.message.includes('P1001')) {
            console.log('\n🔍 Verificações:')
            console.log('1. Confirme se DEV_DATABASE_URL está correto no .env')
            console.log('2. Verifique se você tem acesso ao banco de desenvolvimento')
            console.log('3. Teste a conexão manualmente')
        }
    }
}

// Executar configuração
setupDevDatabase()