// Script para demonstrar o sistema de pontuação automática

import { calculateTournamentPoints, getPointsForPosition } from './points-calculator'

console.log('=== SISTEMA DE PONTUAÇÃO EXPONENCIAL ===\n')

// Demonstração com diferentes números de participantes
const participantCounts = [4, 8, 12, 16, 20, 30]

participantCounts.forEach(count => {
    console.log(`\n📊 TORNEIO COM ${count} PARTICIPANTES:`)
    console.log('─'.repeat(40))

    const distribution = calculateTournamentPoints(count)
    const basePoints = Math.round(Math.pow(count, 1.5) * 10)

    console.log(`Pontos base: ${basePoints}`)
    console.log(`Posições pagas: ${distribution.length}`)
    console.log('\nDistribuição de pontos:')

    distribution.slice(0, Math.min(10, distribution.length)).forEach((entry, index) => {
        const emoji = index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  '
        console.log(`${emoji} ${entry.position}º lugar: ${entry.points} pontos`)
    })

    if (distribution.length > 10) {
        console.log(`   ... e mais ${distribution.length - 10} posições`)
    }
})

console.log('\n\n=== EXEMPLOS PRÁTICOS ===\n')

// Exemplo de torneio pequeno (8 jogadores)
console.log('🎯 TORNEIO PEQUENO (8 jogadores):')
console.log('• 1º lugar: 226 pontos')
console.log('• 2º lugar: 181 pontos')
console.log('• 3º lugar: 145 pontos')
console.log('• 4º lugar: 116 pontos')
console.log('• Último lugar pago (4º): 116 pontos')

// Exemplo de torneio grande (20 jogadores)
console.log('\n🎯 TORNEIO GRANDE (20 jogadores):')
console.log('• 1º lugar: 894 pontos')
console.log('• 2º lugar: 715 pontos')
console.log('• 3º lugar: 572 pontos')
console.log('• 5º lugar: 366 pontos')
console.log('• 10º lugar: 134 pontos')
console.log('• Último lugar pago (10º): 134 pontos')

console.log('\n✨ Características do sistema:')
console.log('• Crescimento exponencial baseado no número de participantes')
console.log('• Pelo menos 50% das posições recebem pontos')
console.log('• Distribuição progressiva (cada posição recebe 80% da anterior)')
console.log('• Pontos mínimos garantidos para todas as posições pagas')
console.log('• Fórmula: pontos_base = participantes^1.5 × 10')

export { }
