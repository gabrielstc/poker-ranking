const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function createSuperAdminDev() {
    console.log('👤 Criando Super Admin no banco de desenvolvimento...\n')

    try {
        // Verificar se já existe um super admin
        const existingSuperAdmin = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' }
        })

        if (existingSuperAdmin) {
            console.log('✅ Super Admin já existe no banco de desenvolvimento:')
            console.log(`   📧 Email: ${existingSuperAdmin.email}`)
            console.log(`   👤 Nome: ${existingSuperAdmin.name}`)
            console.log(`   🆔 ID: ${existingSuperAdmin.id}`)
            return
        }

        // Verificar se existe o clube padrão
        let defaultClub = await prisma.club.findFirst({
            where: { slug: 'clube-principal' }
        })

        if (!defaultClub) {
            console.log('🏢 Criando clube padrão...')
            defaultClub = await prisma.club.create({
                data: {
                    name: 'Clube Principal',
                    slug: 'clube-principal',
                    description: 'Clube principal para desenvolvimento',
                    isActive: true
                }
            })
            console.log('✅ Clube padrão criado')
        }

        // Criar super admin
        const email = process.env.DEV_ADMIN_EMAIL || 'superadmin@poker.com'
        const password = process.env.DEV_ADMIN_PASSWORD || (() => {
            const generatedPassword = crypto.randomBytes(8).toString('hex')
            console.log('⚠️  ATENÇÃO: Senha gerada automaticamente para desenvolvimento')
            return generatedPassword
        })()
        const hashedPassword = await bcrypt.hash(password, 12)

        const superAdmin = await prisma.user.create({
            data: {
                email,
                name: 'Super Admin',
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                clubId: null // Super admin não pertence a clube específico
            }
        })

        console.log('🎉 Super Admin criado com sucesso!')
        console.log('\n📋 Dados de acesso:')
        console.log(`   📧 Email: ${email}`)
        console.log(`   🔑 Senha: ${password}`)
        console.log(`   🆔 ID: ${superAdmin.id}`)
        console.log(`   🎯 Role: ${superAdmin.role}`)

        // Verificar estrutura do banco
        const counts = {
            clubs: await prisma.club.count(),
            users: await prisma.user.count(),
            players: await prisma.player.count(),
            tournaments: await prisma.tournament.count(),
            participations: await prisma.tournamentParticipation.count()
        }

        console.log('\n📊 Estado atual do banco de desenvolvimento:')
        console.log(`   🏢 Clubes: ${counts.clubs}`)
        console.log(`   👥 Usuários: ${counts.users}`)
        console.log(`   🎯 Jogadores: ${counts.players}`)
        console.log(`   🏆 Torneios: ${counts.tournaments}`)
        console.log(`   📊 Participações: ${counts.participations}`)

        console.log('\n🎯 Próximos passos:')
        console.log('1. Acesse http://localhost:3000/login')
        console.log('2. Use as credenciais acima para entrar')
        console.log('3. Acesse /super-admin para gerenciar clubes')
        console.log('4. Teste /clube/clube-principal para ver ranking público')

    } catch (error) {
        console.error('❌ Erro ao criar super admin:', error)

        if (error.code === 'P2002') {
            console.log('💡 Usuário com este email já existe')
        }
    } finally {
        await prisma.$disconnect()
    }
}

createSuperAdminDev()