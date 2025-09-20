const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function createSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens múltiplos
        .trim('-') // Remove hífens do início e fim
}

async function addClubSlugs() {
    try {
        console.log('Buscando clubes sem slug...')
        
        const clubs = await prisma.club.findMany({
            where: {
                slug: null
            }
        })

        console.log(`Encontrados ${clubs.length} clubes para atualizar`)

        for (const club of clubs) {
            let slug = createSlug(club.name)
            let counter = 1

            // Verificar se o slug já existe e criar um único se necessário
            while (true) {
                const existingClub = await prisma.club.findUnique({
                    where: { slug }
                })

                if (!existingClub) {
                    break
                }

                counter++
                slug = `${createSlug(club.name)}-${counter}`
            }

            await prisma.club.update({
                where: { id: club.id },
                data: { slug }
            })

            console.log(`✅ Clube "${club.name}" -> slug: "${slug}"`)
        }

        console.log('✅ Todos os slugs foram adicionados com sucesso!')
    } catch (error) {
        console.error('❌ Erro ao adicionar slugs:', error)
    } finally {
        await prisma.$disconnect()
    }
}

addClubSlugs()