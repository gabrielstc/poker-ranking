const { PrismaClient } = require('@prisma/client')
const { withAccelerate } = require('@prisma/extension-accelerate')

async function testConnection() {
    console.log('🔄 Testando conexão com PostgreSQL + Prisma Accelerate...')

    try {
        const prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        }).$extends(withAccelerate())

        // Teste simples de conexão
        console.log('📡 Verificando conexão...')
        await prisma.$queryRaw`SELECT 1 as test`
        console.log('✅ Conexão estabelecida com sucesso!')

        // Teste de criação de tabelas
        console.log('📋 Verificando schema do banco...')
        const users = await prisma.user.findMany({ take: 1 })
        console.log('✅ Tabelas criadas com sucesso!')
        console.log(`📊 Usuários encontrados: ${users.length}`)

        await prisma.$disconnect()
        console.log('🎉 Todos os testes passaram! PostgreSQL + Prisma Accelerate configurado corretamente.')

    } catch (error) {
        console.error('❌ Erro na conexão:', error.message)
        process.exit(1)
    }
}

testConnection()
