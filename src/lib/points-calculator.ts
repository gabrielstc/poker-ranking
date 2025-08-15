// Sistema de pontuação para torneios de poker
// Nova fórmula: ROUND(SQRT(total_jogadores) * POWER(total_jogadores - posição + 1, 1.3), 1)

interface PointsCalculation {
    position: number
    points: number
}

export function calculateTournamentPoints(totalParticipants: number): PointsCalculation[] {
    if (totalParticipants < 2) {
        return [{ position: 1, points: 100 }]
    }

    // Calcular quantas posições receberão pontos (pelo menos top 50% ou mínimo 3)
    const payoutPositions = Math.max(3, Math.ceil(totalParticipants * 0.5))

    const pointsDistribution: PointsCalculation[] = []

    for (let position = 1; position <= payoutPositions; position++) {
        // Nova fórmula: ROUND(SQRT(total_jogadores) * POWER(total_jogadores - posição + 1, 1.3), 1)
        const sqrtTotal = Math.sqrt(totalParticipants)
        const powerFactor = Math.pow(totalParticipants - position + 1, 1.3)
        const points = Math.round(sqrtTotal * powerFactor * 10) / 10 // Arredonda para 1 casa decimal

        pointsDistribution.push({
            position,
            points: Math.max(points, 1) // Garantir pelo menos 1 ponto
        })
    }

    return pointsDistribution
}

export function getPointsForPosition(position: number, totalParticipants: number): number {
    // Nova fórmula direta: ROUND(SQRT(total_jogadores) * POWER(total_jogadores - posição + 1, 1.3), 1)
    if (position > totalParticipants) return 0

    const sqrtTotal = Math.sqrt(totalParticipants)
    const powerFactor = Math.pow(totalParticipants - position + 1, 1.3)
    const points = Math.round(sqrtTotal * powerFactor * 10) / 10 // Arredonda para 1 casa decimal

    return Math.max(points, 0)
}

// Função para recalcular automaticamente todos os pontos de um torneio
export function recalculateAllTournamentPoints(participations: Array<{
    id: string
    position: number | null
    points: number | null
}>): Array<{
    id: string
    position: number | null
    points: number
}> {
    const totalParticipants = participations.length

    return participations.map(participation => {
        if (participation.position === null) {
            return {
                id: participation.id,
                position: participation.position,
                points: 0
            }
        }

        const calculatedPoints = getPointsForPosition(participation.position, totalParticipants)

        return {
            id: participation.id,
            position: participation.position,
            points: calculatedPoints
        }
    })
}
