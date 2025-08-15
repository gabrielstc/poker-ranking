"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calculator, Trophy, TrendingUp, Users, ArrowLeft, Lightbulb } from "lucide-react"
import { calculateTournamentPoints } from "@/lib/points-calculator"
import Link from "next/link"

export default function PointsSystemPage() {
    const exampleTournaments = [
        { participants: 4, name: "Torneio Pequeno" },
        { participants: 8, name: "Torneio Médio" },
        { participants: 12, name: "Torneio Grande" },
        { participants: 20, name: "Torneio Muito Grande" },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/tournaments">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Sistema de Pontuação</h1>
                        <p className="text-gray-600 mt-2">
                            Entenda como funciona o cálculo automático e exponencial de pontos
                        </p>
                    </div>
                </div>
            </div>

            {/* Resumo do Sistema */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5 text-blue-600" />
                        <span>Como Funciona</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <h3 className="font-semibold mb-2">Crescimento Exponencial</h3>
                            <p className="text-sm text-gray-600">
                                Quanto mais participantes, mais pontos são distribuídos.
                                Fórmula: participantes^1.5 × 10
                            </p>
                        </div>
                        <div className="text-center">
                            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <h3 className="font-semibold mb-2">Distribuição Justa</h3>
                            <p className="text-sm text-gray-600">
                                Pelo menos 50% das posições recebem pontos, com decaimento
                                progressivo de 80% por posição
                            </p>
                        </div>
                        <div className="text-center">
                            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <h3 className="font-semibold mb-2">Adaptável</h3>
                            <p className="text-sm text-gray-600">
                                O sistema se adapta automaticamente ao tamanho do torneio,
                                garantindo competitividade justa
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Exemplos Práticos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {exampleTournaments.map((tournament) => {
                    const distribution = calculateTournamentPoints(tournament.participants)
                    const basePoints = Math.round(Math.pow(tournament.participants, 1.5) * 10)

                    return (
                        <Card key={tournament.participants}>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {tournament.name} ({tournament.participants} jogadores)
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    Pontos base: {basePoints} | Posições pagas: {distribution.length}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Posição</TableHead>
                                            <TableHead className="text-right">Pontos</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {distribution.slice(0, 6).map((entry) => (
                                            <TableRow key={entry.position}>
                                                <TableCell className="flex items-center space-x-2">
                                                    {entry.position === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                                                    {entry.position === 2 && <span className="text-gray-400">🥈</span>}
                                                    {entry.position === 3 && <span className="text-amber-600">🥉</span>}
                                                    <span>{entry.position}º lugar</span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {entry.points}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {distribution.length > 6 && (
                                            <TableRow>
                                                <TableCell className="text-gray-500 italic">
                                                    ... e mais {distribution.length - 6} posições
                                                </TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Dicas de Uso */}
            <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-yellow-800">
                        <Lightbulb className="h-5 w-5" />
                        <span>Dicas de Uso</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-yellow-800">
                    <ul className="space-y-2">
                        <li className="flex items-start space-x-2">
                            <span className="text-yellow-600 mt-1">•</span>
                            <span>
                                <strong>Cálculo Automático:</strong> Deixe o campo &ldquo;Pontos&rdquo; vazio ao adicionar
                                uma participação para usar o cálculo automático baseado na posição
                            </span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-yellow-600 mt-1">•</span>
                            <span>
                                <strong>Recalculo Manual:</strong> Use o botão &ldquo;Recalcular Pontos&rdquo; após
                                adicionar/remover participantes para atualizar todos os pontos
                            </span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-yellow-600 mt-1">•</span>
                            <span>
                                <strong>Pontos Manuais:</strong> Se você inserir pontos manualmente,
                                eles não serão sobrescritos pelo cálculo automático
                            </span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-yellow-600 mt-1">•</span>
                            <span>
                                <strong>Competitividade:</strong> O sistema garante que torneios maiores
                                tenham mais peso no ranking geral, incentivando a participação
                            </span>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            {/* Fórmula Técnica */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalhes Técnicos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Fórmula Base</h4>
                            <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                                pontos_base = participantes^1.5 × 10
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Distribuição por Posição</h4>
                            <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                                pontos_posição = pontos_base × (0.8)^(posição - 1)
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Posições Pagas</h4>
                            <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                                posições_pagas = max(3, ceil(participantes × 0.5))
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Pontos Mínimos</h4>
                            <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                                pontos_mínimos = max(10, pontos_base × 0.1)
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
