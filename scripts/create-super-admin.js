const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

async function createSuperAdmin() {
  const prisma = new PrismaClient()

  try {
    // Usar variáveis de ambiente ou gerar senha segura
    const email = process.env.ADMIN_EMAIL || 'superadmin@poker.com'
    const password = process.env.ADMIN_PASSWORD || (() => {
      const generatedPassword = crypto.randomBytes(16).toString('hex')
      console.log('⚠️  ATENÇÃO: Senha gerada automaticamente. ANOTE ESTA SENHA:')
      console.log(`🔐 Senha: ${generatedPassword}`)
      return generatedPassword
    })()

    const hashedPassword = await bcrypt.hash(password, 12)
    
    const superAdmin = await prisma.user.create({
      data: {
        email,
        name: 'Super Administrador',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        clubId: null
      }
    })

    console.log('✅ Super admin criado:', superAdmin.email)
    console.log('📧 Email:', email)
    if (!process.env.ADMIN_PASSWORD) {
      console.log('🔐 Senha gerada automaticamente - ANOTE-A!')
    }
  } catch (error) {
    console.log('❌ Erro ou usuário já existe:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()