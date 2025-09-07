"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calculator, Trophy, Medal, Award, Users, TrendingUp, Info } from "lucide-react"
import { calculateTournamentPoints } from "@/lib/points-calculator"

export default function PointsSystemPage() {
    // Exemplos para diferentes números de participantes
    const examples = [
        { participants: 8, name: "Torneio Pequeno" },
        { participants: 16, name: "Torneio Médio" },
        { participants: 32, name: "Torneio Grande" },
        { participants: 64, name: "Torneio Major" }
    ]

    const getPositionIcon = (position: number) => {
        switch (position) {
            case 1:
                return <Trophy className="h-5 w-5 text-yellow-500" />
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />
            case 3:
                return <Award className="h-5 w-5 text-amber-600" />
            default:
                return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-gray-600">{position}</span>
        }
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="text-center space-y-2 sm:space-y-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Sistema de Pontuação</h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
                    Entenda como funciona o sistema de pontuação dos torneios de poker e veja exemplos práticos
                </p>
            </div>

            {/* Como Funciona */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5" />
                        <span>Como Funciona o Sistema</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Fórmula Matemática</h3>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <p className="text-sm font-mono text-blue-800 mb-2">
                                    <strong>Pontos = ROUND(√(participantes) × (participantes - posição + 1)^1.3, 1)</strong>
                                </p>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• √(participantes) = raiz quadrada do número de participantes</li>
                                    <li>• Expoente 1.3 garante distribuição exponencial</li>
                                    <li>• Resultado arredondado para 1 casa decimal</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Características do Sistema</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start space-x-2">
                                    <TrendingUp className="h-4 w-4 mt-0.5 text-green-500" />
                                    <span><strong>Escalável:</strong> Mais participantes = mais pontos distribuídos</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <Trophy className="h-4 w-4 mt-0.5 text-yellow-500" />
                                    <span><strong>Premia liderança:</strong> Primeiras posições recebem muito mais pontos</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <Users className="h-4 w-4 mt-0.5 text-blue-500" />
                                    <span><strong>Inclusivo:</strong> Pelo menos 50% das posições recebem pontos</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <Info className="h-4 w-4 mt-0.5 text-purple-500" />
                                    <span><strong>Justo:</strong> Considera a dificuldade do campo</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Exemplos Práticos */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center">Exemplos Práticos</h2>
                
                {examples.map((example) => {
                    const distribution = calculateTournamentPoints(example.participants)
                    const payoutPositions = Math.ceil(example.participants * 0.5)
                    
                    return (
                        <Card key={example.participants}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{example.name} - {example.participants} Participantes</span>
                                    <span className="text-sm text-gray-500">
                                        {payoutPositions} posições pagantes
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Top 10 */}
                                    <div>
                                        <h4 className="font-semibold mb-3">Top 10 Posições</h4>
                                        <div className="space-y-2">
                                            {distribution.slice(0, 10).map((entry) => (
                                                <div key={entry.position} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <div className="flex items-center space-x-2">
                                                        {getPositionIcon(entry.position)}
                                                        <span className="font-medium">{entry.position}º lugar</span>
                                                    </div>
                                                    <span className="font-bold text-blue-600">{entry.points.toFixed(1)} pts</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Estatísticas */}
                                    <div>
                                        <h4 className="font-semibold mb-3">Estatísticas</h4>
                                        <div className="space-y-3">
                                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                                <div className="flex justify-between">
                                                    <span className="text-yellow-800">Campeão:</span>
                                                    <span className="font-bold text-yellow-900">{distribution[0].points.toFixed(1)} pontos</span>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Vice-campeão:</span>
                                                    <span className="font-bold text-gray-800">{distribution[1].points.toFixed(1)} pontos</span>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                                <div className="flex justify-between">
                                                    <span className="text-blue-700">Total de pontos:</span>
                                                    <span className="font-bold text-blue-800">
                                                        {distribution.reduce((sum, entry) => sum + entry.points, 0).toFixed(1)} pts
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-green-50 p-3 rounded border border-green-200">
                                                <div className="flex justify-between">
                                                    <span className="text-green-700">Última posição paga:</span>
                                                    <span className="font-bold text-green-800">
                                                        {distribution[distribution.length - 1].points.toFixed(1)} pts
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-purple-50 p-3 rounded border border-purple-200">
                                                <div className="flex justify-between">
                                                    <span className="text-purple-700">Média de pontos:</span>
                                                    <span className="font-bold text-purple-800">
                                                        {(distribution.reduce((sum, entry) => sum + entry.points, 0) / distribution.length).toFixed(1)} pts
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabela completa (apenas para torneios menores) */}
                                {example.participants <= 16 && (
                                    <div className="mt-6">
                                        <h4 className="font-semibold mb-3">Distribuição Completa</h4>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Posição</TableHead>
                                                        <TableHead className="text-center">Pontos</TableHead>
                                                        <TableHead className="text-center hidden sm:table-cell">% do Campeão</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {distribution.map((entry) => (
                                                        <TableRow key={entry.position}>
                                                            <TableCell className="flex items-center space-x-2">
                                                                {getPositionIcon(entry.position)}
                                                                <span className="text-sm sm:text-base">{entry.position}º lugar</span>
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-sm sm:text-base">
                                                                {entry.points.toFixed(1)}
                                                            </TableCell>
                                                            <TableCell className="text-center hidden sm:table-cell">
                                                                {((entry.points / distribution[0].points) * 100).toFixed(0)}%
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Comparação entre Torneios */}
            <Card>
                <CardHeader>
                    <CardTitle>Comparação entre Diferentes Tamanhos de Torneio</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tamanho do Torneio</TableHead>
                                <TableHead className="text-center">Campeão</TableHead>
                                <TableHead className="text-center">Vice</TableHead>
                                <TableHead className="text-center">3º Lugar</TableHead>
                                <TableHead className="text-center">Posições Pagas</TableHead>
                                <TableHead className="text-center">Total de Pontos</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {examples.map((example) => {
                                const distribution = calculateTournamentPoints(example.participants)
                                const totalPoints = distribution.reduce((sum, entry) => sum + entry.points, 0)
                                
                                return (
                                    <TableRow key={example.participants}>
                                        <TableCell className="font-medium">
                                            {example.participants} jogadores
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-yellow-600">
                                            {distribution[0].points.toFixed(1)}
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-gray-600">
                                            {distribution[1].points.toFixed(1)}
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-amber-600">
                                            {distribution[2].points.toFixed(1)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {distribution.length}
                                        </TableCell>
                                        <TableCell className="text-center font-bold">
                                            {totalPoints.toFixed(1)}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Vantagens do Sistema */}
            <Card className="bg-green-50 border-green-200">
                <CardHeader>
                    <CardTitle className="text-green-800">Vantagens do Sistema de Pontuação</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-green-800 mb-2">Para Organizadores</h4>
                            <ul className="text-sm text-green-700 space-y-1">
                                <li>• Sistema automático e transparente</li>
                                <li>• Não requer configuração manual</li>
                                <li>• Escalável para qualquer tamanho de torneio</li>
                                <li>• Historicamente testado e aprovado</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-green-800 mb-2">Para Jogadores</h4>
                            <ul className="text-sm text-green-700 space-y-1">
                                <li>• Recompensa consistente pelo desempenho</li>
                                <li>• Incentiva participação em torneios maiores</li>
                                <li>• Sistema justo e matemáticamente correto</li>
                                <li>• Transparência total na pontuação</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
