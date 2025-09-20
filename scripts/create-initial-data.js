const { PrismaClient } = require('@prisma/client')

async function createInitialData() {
  const prisma = new PrismaClient()

  try {
    console.log('Criando dados iniciais...')

    // 1. Criar clube padrão
    const defaultClub = await prisma.club.create({
      data: {
        name: 'Clube Principal',
        description: 'Clube principal para demonstração',
        isActive: true
      }
    })

    console.log(`Clube padrão criado: ${defaultClub.name} (ID: ${defaultClub.id})`)

    // 2. Criar usuário super-admin
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

    // 3. Criar um admin do clube padrão
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 12)
    
    const clubAdmin = await prisma.user.create({
      data: {
        email: 'admin@clubeprincipal.com',
        name: 'Admin do Clube',
        password: hashedPasswordAdmin,
        role: 'CLUB_ADMIN',
        clubId: defaultClub.id
      }
    })

    console.log(`Admin do clube criado: ${clubAdmin.email}`)

    console.log('\n=== CREDENCIAIS DE ACESSO ===')
    console.log('Super Admin:')
    console.log('Email: superadmin@poker.com')
    console.log('Senha: admin123')
    console.log('\nAdmin do Clube Principal:')
    console.log('Email: admin@clubeprincipal.com')
    console.log('Senha: admin123')
    console.log('\nIMPORTANTE: Altere as senhas após o primeiro login!')

  } catch (error) {
    console.error('Erro durante a criação:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  createInitialData()
    .then(() => {
      console.log('Script executado com sucesso!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Falha na execução do script:', error)
      process.exit(1)
    })
}

module.exports = { createInitialData }