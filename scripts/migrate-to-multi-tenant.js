const { PrismaClient } = require('@prisma/client')

async function migrateToMultiTenant() {
  const prisma = new PrismaClient()

  try {
    console.log('Iniciando migração para multi-tenant...')

    // 1. Criar clube padrão
    const defaultClub = await prisma.club.create({
      data: {
        name: 'Clube Principal',
        description: 'Clube principal para migração dos dados existentes',
        isActive: true
      }
    })

    console.log(`Clube padrão criado: ${defaultClub.name} (ID: ${defaultClub.id})`)

    // 2. Atualizar todos os usuários existentes para serem admin do clube padrão
    const usersUpdated = await prisma.user.updateMany({
      where: {
        clubId: null
      },
      data: {
        clubId: defaultClub.id,
        role: 'CLUB_ADMIN'
      }
    })

    console.log(`${usersUpdated.count} usuários atualizados para o clube padrão`)

    // 3. Atualizar todos os jogadores existentes para pertencerem ao clube padrão
    const playersUpdated = await prisma.player.updateMany({
      where: {
        clubId: null
      },
      data: {
        clubId: defaultClub.id
      }
    })

    console.log(`${playersUpdated.count} jogadores atualizados para o clube padrão`)

    // 4. Atualizar todos os torneios existentes para pertencerem ao clube padrão
    const tournamentsUpdated = await prisma.tournament.updateMany({
      where: {
        clubId: null
      },
      data: {
        clubId: defaultClub.id
      }
    })

    console.log(`${tournamentsUpdated.count} torneios atualizados para o clube padrão`)

    // 5. Criar usuário super-admin
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@poker.com',
        name: 'Super Administrador',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        clubId: null
      }
    })

    console.log(`Super admin criado: ${superAdmin.email}`)

    console.log('Migração concluída com sucesso!')
    console.log('Credenciais do super admin:')
    console.log('Email: superadmin@poker.com')
    console.log('Senha: admin123')
    console.log('IMPORTANTE: Altere a senha após o primeiro login!')

  } catch (error) {
    console.error('Erro durante a migração:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  migrateToMultiTenant()
    .then(() => {
      console.log('Script executado com sucesso!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Falha na execução do script:', error)
      process.exit(1)
    })
}

module.exports = { migrateToMultiTenant }