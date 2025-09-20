"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calculator, Trophy, TrendingUp, Users, ArrowLeft, Lightbulb } from "lucide-react"
import { calculateTournamentPoints } from "@/lib/points-calculator"
import { useClub } from "@/contexts/ClubContext"
import { SupremaPropaganda } from "@/components/suprema-propaganda"
import Link from "next/link"

export default function ClubAdminPointsSystemPage() {
    const { currentClub } = useClub()
    const params = useParams()
    const clubSlug = params.slug as string

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
                    <Link href={`/clube/${clubSlug}/admin/tournaments`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Sistema de Pontuação</h1>
                        <p className="text-gray-600 mt-2">
                            Entenda como funciona o cálculo automático de pontos do {currentClub?.name}
                        </p>
                    </div>
                </div>
            </div>

            {/* Propaganda da Suprema */}
            {currentClub?.supremaId && (
                <SupremaPropaganda 
                    supremaId={currentClub.supremaId}
                    clubName={currentClub.name}
                    variant="default"
                />
            )}

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
                                Sistema matemático baseado no número de participantes usando fórmula exponencial
                            </p>
                        </div>
                        <div className="text-center">
                            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                            <h3 className="font-semibold mb-2">Escalabilidade</h3>
                            <p className="text-sm text-gray-600">
                                Mais participantes = mais pontos distribuídos, incentivando torneios maiores
                            </p>
                        </div>
                        <div className="text-center">
                            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <h3 className="font-semibold mb-2">Justiça</h3>
                            <p className="text-sm text-gray-600">
                                Distribuição proporcional que recompensa conquistas e consistência
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Fórmula Detalhada */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5" />
                        <span>Fórmula Matemática</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Pontos Base do Torneio:</h4>
                            <code className="text-lg">participantes^1.5 × 10</code>
                            <p className="text-sm text-gray-600 mt-1">
                                Exemplo: 8 participantes = 8^1.5 × 10 = 22.6 × 10 = 226 pontos base
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2">Distribuição:</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• 1º lugar: 100% dos pontos base</li>
                                    <li>• 2º lugar: 80% do anterior</li>
                                    <li>• 3º lugar: 80% do anterior</li>
                                    <li>• E assim sucessivamente...</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Regras:</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• Pelo menos 50% das posições recebem pontos</li>
                                    <li>• Pontos mínimos garantidos</li>
                                    <li>• Arredondamento para 1 casa decimal</li>
                                    <li>• Cálculo automático em tempo real</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Exemplos Práticos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {exampleTournaments.map((tournament) => {
                    const points = calculateTournamentPoints(tournament.participants)
                    return (
                        <Card key={tournament.participants}>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {tournament.name} ({tournament.participants} jogadores)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="text-sm text-gray-600">
                                        Pontos base: {tournament.participants}^1.5 × 10 = <strong>{points[0]?.points.toFixed(1)}</strong>
                                    </div>
                                    
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-16">Pos.</TableHead>
                                                <TableHead>Pontos</TableHead>
                                                <TableHead>% do 1º</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {points.slice(0, Math.min(5, points.length)).map((entry) => (
                                                <TableRow key={entry.position}>
                                                    <TableCell className="flex items-center">
                                                        {entry.position === 1 && <Trophy className="h-4 w-4 text-yellow-500 mr-1" />}
                                                        {entry.position}º
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {entry.points.toFixed(1)}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {((entry.points / points[0].points) * 100).toFixed(0)}%
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {points.length > 5 && (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center text-gray-500 text-sm">
                                                        E mais {points.length - 5} posições...
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Dicas e Boas Práticas */}
            <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                        <span>Dicas para Administradores</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold mb-2">✅ Boas Práticas:</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Use "Recalcular Pontos" após mudanças</li>
                                <li>• Deixe a posição em branco se não finalizada</li>
                                <li>• Use pontos manuais apenas em casos especiais</li>
                                <li>• Mantenha consistência entre torneios</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">⚠️ Cuidados:</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Pontos manuais sobrescrevem o cálculo automático</li>
                                <li>• Posições duplicadas podem causar inconsistências</li>
                                <li>• Sempre confira antes de finalizar resultados</li>
                                <li>• Comunique mudanças aos jogadores</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Comparação com Sistema Anterior */}
            <Card>
                <CardHeader>
                    <CardTitle>Vantagens do Novo Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
                            <div className="text-sm font-medium">Automático</div>
                            <div className="text-xs text-gray-600">Sem cálculos manuais</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 mb-1">∞</div>
                            <div className="text-sm font-medium">Escalável</div>
                            <div className="text-xs text-gray-600">Funciona com qualquer quantidade</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 mb-1">⚖️</div>
                            <div className="text-sm font-medium">Justo</div>
                            <div className="text-xs text-gray-600">Distribuição proporcional</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}