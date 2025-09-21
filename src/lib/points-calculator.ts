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


const FIXED_POINTS_TABLE: Record<number, number> = {
    1: 155,
    2: 125,
    3: 110,
    4: 95,
    5: 90,
    6: 85,
    7: 80,
    8: 75,
    9: 70,
    10: 65,
    11: 55,
    12: 52,
    13: 50,
    14: 48,
    15: 46,
    16: 44,
    17: 42,
    18: 40,
    19: 38,
    20: 36,
    21: 35,
    22: 34,
    23: 33,
    24: 32,
    25: 31,
    26: 30,
    27: 29,
    28: 28,
    29: 27,
    30: 26,
}

export function getFixedPointsForPosition(position: number): number {
    return FIXED_POINTS_TABLE[position] ?? 0
}

export function getPointsForPosition(position: number, totalParticipants: number): number {
    // Nova fórmula direta: ROUND(SQRT(total_jogadores) * POWER(total_jogadores - posição + 1, 1.3), 1)
    if (position > totalParticipants) return 0

    const sqrtTotal = Math.sqrt(totalParticipants)
    const powerFactor = Math.pow(totalParticipants - position + 1, 1.3)
    const points = Math.round(sqrtTotal * powerFactor * 10) / 10 // Arredonda para 1 casa decimal

    return Math.max(points, 0)
}

export function calculateExponentialPoints(position: number, totalParticipants: number): number {
    // Nova fórmula exponencial: 10 + SE(posição <= 0,4 * participantes; participantes * (1/(1+LOG(posição))); 0)
    if (position <= 0 || position > totalParticipants) return 0

    const threshold = 0.4 * totalParticipants
    
    if (position <= threshold) {
        // Para posições dentro do top 40%: participantes * (1/(1+LOG(posição)))
        const logComponent = 1 / (1 + Math.log10(position))
        const points = 10 + (totalParticipants * logComponent)
        return Math.round(points * 100) / 100 // Arredonda para 2 casas decimais
    } else {
        // Para posições fora do top 40%: apenas 10 pontos base
        return 10
    }
}

export function getPointsForPositionByType(
    position: number,
    totalParticipants: number,
    type: "FIXO" | "EXPONENCIAL" | "EXPONENCIAL_NEW"
): number {
    if (type === "FIXO") {
        return getFixedPointsForPosition(position)
    }
    if (type === "EXPONENCIAL_NEW") {
        return calculateExponentialPoints(position, totalParticipants)
    }
    return getPointsForPosition(position, totalParticipants)
}

// Função para recalcular automaticamente todos os pontos de um torneio
export function recalculateAllTournamentPoints(participations: Array<{
    id: string
    position: number | null
    points: number | null
}>, type: "FIXO" | "EXPONENCIAL" | "EXPONENCIAL_NEW" = "EXPONENCIAL"): Array<{
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

        const calculatedPoints = getPointsForPositionByType(participation.position, totalParticipants, type)

        return {
            id: participation.id,
            position: participation.position,
            points: calculatedPoints
        }
    })
}
