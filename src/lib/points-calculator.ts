// Sistema de pontuação exponencial para torneios de poker
// Quanto mais participantes, mais pontos são distribuídos

interface PointsCalculation {
    position: number
    points: number
}

export function calculateTournamentPoints(totalParticipants: number): PointsCalculation[] {
    if (totalParticipants < 2) {
        return [{ position: 1, points: 100 }]
    }

    // Fórmula exponencial: pontos_base = total_participantes^1.5 * 10
    const basePoints = Math.round(Math.pow(totalParticipants, 1.5) * 10)

    // Calcular quantas posições receberão pontos (pelo menos top 50% ou mínimo 3)
    const payoutPositions = Math.max(3, Math.ceil(totalParticipants * 0.5))

    const pointsDistribution: PointsCalculation[] = []

    for (let position = 1; position <= payoutPositions; position++) {
        // Fórmula de decaimento exponencial para distribuir pontos
        // 1º lugar recebe 100% dos pontos base
        // Cada posição subsequente recebe progressivamente menos
        const decayFactor = Math.pow(0.8, position - 1)
        const points = Math.round(basePoints * decayFactor)

        // Garantir pontos mínimos para posições pagantes
        const minimumPoints = Math.max(10, Math.round(basePoints * 0.1))

        pointsDistribution.push({
            position,
            points: Math.max(points, minimumPoints)
        })
    }

    return pointsDistribution
}

export function getPointsForPosition(position: number, totalParticipants: number): number {
    const distribution = calculateTournamentPoints(totalParticipants)
    const entry = distribution.find(d => d.position === position)
    return entry ? entry.points : 0
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
