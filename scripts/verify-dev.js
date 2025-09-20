const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyDevSetup() {
    console.log('🔍 Verificando configuração do banco de desenvolvimento...\n')

    try {
        // Testar conexão
        await prisma.$connect()
        console.log('✅ Conexão com banco estabelecida')

        // Verificar tabelas
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `
        
        console.log(`\n📋 Tabelas no banco (${tables.length}):`)
        tables.forEach(table => {
            console.log(`   ✅ ${table.table_name}`)
        })

        // Contar registros
        const counts = {
            clubs: await prisma.club.count(),
            users: await prisma.user.count(),
            players: await prisma.player.count(),
            tournaments: await prisma.tournament.count(),
            participations: await prisma.tournamentParticipation.count()
        }

        console.log('\n📊 Contagem de registros:')
        Object.entries(counts).forEach(([table, count]) => {
            console.log(`   ${table}: ${count}`)
        })

        // Verificar super admin
        const superAdmin = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' }
        })

        console.log('\n👤 Super Admin:')
        if (superAdmin) {
            console.log(`   ✅ Encontrado: ${superAdmin.email}`)
            console.log(`   🆔 ID: ${superAdmin.id}`)
        } else {
            console.log('   ❌ Não encontrado')
        }

        // Verificar clubes
        const clubs = await prisma.club.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        players: true,
                        tournaments: true
                    }
                }
            }
        })

        console.log('\n🏢 Clubes:')
        clubs.forEach(club => {
            console.log(`   ✅ ${club.name} (${club.slug})`)
            console.log(`      - ${club._count.users} usuários`)
            console.log(`      - ${club._count.players} jogadores`)
            console.log(`      - ${club._count.tournaments} torneios`)
        })

        // Verificar funcionalidades
        console.log('\n🎯 Verificações de funcionalidade:')
        
        const hasMultiTenant = await prisma.club.count() > 0
        console.log(`   ${hasMultiTenant ? '✅' : '❌'} Multi-tenant habilitado`)
        
        const hasSlug = clubs.every(club => club.slug)
        console.log(`   ${hasSlug ? '✅' : '❌'} URLs amigáveis configuradas`)
        
        const hasUsers = await prisma.user.count() > 0
        console.log(`   ${hasUsers ? '✅' : '❌'} Sistema de usuários`)
        
        const hasRanking = await prisma.tournamentParticipation.count() > 0
        console.log(`   ${hasRanking ? '✅' : '❌'} Dados de ranking`)

        console.log('\n🎉 Banco de desenvolvimento configurado e funcionando!')
        console.log('\n📝 URLs para testar:')
        console.log('   🏠 Home: http://localhost:3000/')
        console.log('   🔐 Login: http://localhost:3000/login')
        console.log('   ⚙️  Super Admin: http://localhost:3000/super-admin')
        
        if (clubs.length > 0) {
            clubs.forEach(club => {
                console.log(`   🏢 ${club.name}: http://localhost:3000/clube/${club.slug}`)
            })
        }

    } catch (error) {
        console.error('❌ Erro na verificação:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

verifyDevSetup()