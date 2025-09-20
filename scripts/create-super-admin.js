const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function createSuperAdmin() {
  const prisma = new PrismaClient()

  try {
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

    console.log('Super admin criado:', superAdmin.email)
  } catch (error) {
    console.log('Erro ou usuário já existe:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()