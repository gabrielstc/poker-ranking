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
                            Entenda como funciona o novo cálculo automático de pontos
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
                            <h3 className="font-semibold mb-2">Fórmula Otimizada</h3>
                            <p className="text-sm text-gray-600">
                                Nova fórmula: ROUND(SQRT(participantes) × (participantes - posição + 1)^1.3, 1)
                            </p>
                        </div>
                        <div className="text-center">
                            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <h3 className="font-semibold mb-2">Distribuição Equilibrada</h3>
                            <p className="text-sm text-gray-600">
                                Pontuação proporcional ao número de participantes,
                                favorecendo torneios maiores
                            </p>
                        </div>
                        <div className="text-center">
                            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <h3 className="font-semibold mb-2">Precisão Decimal</h3>
                            <p className="text-sm text-gray-600">
                                Pontos calculados com 1 casa decimal para
                                maior precisão na classificação
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Exemplos Práticos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {exampleTournaments.map((tournament) => {
                    const distribution = calculateTournamentPoints(tournament.participants)

                    return (
                        <Card key={tournament.participants}>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {tournament.name} ({tournament.participants} jogadores)
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    Fórmula: ROUND(SQRT({tournament.participants}) × (participantes - posição + 1)^1.3, 1)
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

            {/* Tabela de Comparação */}
            <Card>
                <CardHeader>
                    <CardTitle>Comparação de Pontos - Nova Fórmula</CardTitle>
                    <p className="text-sm text-gray-600">
                        Valores exatos calculados com a nova fórmula matemática
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Participantes</TableHead>
                                    <TableHead className="text-right">1º Lugar</TableHead>
                                    <TableHead className="text-right">2º Lugar</TableHead>
                                    <TableHead className="text-right">3º Lugar</TableHead>
                                    <TableHead className="text-right">Último Lugar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[4, 6, 8, 10, 12, 15, 20].map((participants) => {
                                    const distribution = calculateTournamentPoints(participants)
                                    const first = distribution.find(d => d.position === 1)?.points || 0
                                    const second = distribution.find(d => d.position === 2)?.points || 0
                                    const third = distribution.find(d => d.position === 3)?.points || 0
                                    const last = distribution.find(d => d.position === participants)?.points || 0

                                    return (
                                        <TableRow key={participants}>
                                            <TableCell className="font-medium">{participants}</TableCell>
                                            <TableCell className="text-right font-medium text-yellow-600">{first}</TableCell>
                                            <TableCell className="text-right">{second}</TableCell>
                                            <TableCell className="text-right">{third}</TableCell>
                                            <TableCell className="text-right text-gray-600">{last}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Destaque:</strong> Para 12 participantes, o 1º lugar recebe exatamente <strong>87.6 pontos</strong>, conforme a nova fórmula matemática.
                        </p>
                    </div>
                </CardContent>
            </Card>

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
                            <h4 className="font-semibold mb-2">Fórmula Matemática</h4>
                            <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                                PONTOS = ROUND(SQRT(total_participantes) × POWER(total_participantes - posição + 1, 1.3), 1)
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                Esta fórmula garante uma distribuição equilibrada de pontos,
                                favorecendo torneios com mais participantes e premiando melhor as primeiras posições.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Componentes da Fórmula</h4>
                            <ul className="space-y-2 text-sm">
                                <li><strong>SQRT(total_participantes):</strong> Raiz quadrada que cria a base proporcional ao tamanho do torneio</li>
                                <li><strong>total_participantes - posição + 1:</strong> Calcula a &ldquo;distância inversa&rdquo; da posição (quanto maior a posição, menor o valor)</li>
                                <li><strong>POWER(..., 1.3):</strong> Potência de 1.3 que cria uma curva de distribuição suave</li>
                                <li><strong>ROUND(..., 1):</strong> Arredonda para 1 casa decimal para precisão</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Exemplo de Cálculo (12 participantes, 1º lugar)</h4>
                            <div className="bg-gray-100 p-3 rounded text-sm space-y-1">
                                <div>1. SQRT(12) = 3.464</div>
                                <div>2. 12 - 1 + 1 = 12</div>
                                <div>3. POWER(12, 1.3) = 25.289</div>
                                <div>4. 3.464 × 25.289 = 87.64</div>
                                <div>5. ROUND(87.64, 1) = <strong>87.6 pontos</strong></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
