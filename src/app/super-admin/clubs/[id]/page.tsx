'use client'

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Trophy, Target, Calendar, TrendingUp, Activity } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

interface ClubDetails {
    id: string
    name: string
    description: string | null
    logo: string | null
    isActive: boolean
    createdAt: string
    _count: {
        users: number
        players: number
        tournaments: number
    }
    users: Array<{
        id: string
        name: string
        email: string
        role: string
        createdAt: string
    }>
    recentTournaments: Array<{
        id: string
        name: string
        date: string
        status: string
        _count: {
            participations: number
        }
    }>
    topPlayers: Array<{
        id: string
        name: string
        nickname: string
        totalPoints: number
        tournamentsPlayed: number
    }>
}

export default function ClubDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [club, setClub] = useState<ClubDetails | null>(null)
    const [loading, setLoading] = useState(true)
    
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        const fetchClubDetails = async () => {
            try {
                const response = await fetch(`/api/clubs/${id}`)
                if (response.ok) {
                    const data = await response.json()
                    setClub(data)
                } else {
                    toast.error('Clube não encontrado')
                    router.push('/super-admin')
                }
            } catch (error) {
                console.error('Erro ao carregar detalhes do clube:', error)
                toast.error('Erro ao carregar detalhes do clube')
            } finally {
                setLoading(false)
            }
        }

        const initPage = async () => {
            if (status === 'loading') return

            if (!session) {
                router.push('/login')
                return
            }

            // Verificar se é super admin
            if (session.user.role !== 'SUPER_ADMIN') {
                router.push('/admin/tournaments')
                return
            }

            await fetchClubDetails()
        }

        initPage()
    }, [session, status, router, id])

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Carregando...</div>
            </div>
        )
    }

    if (!session || session.user.role !== 'SUPER_ADMIN' || !club) {
        return null
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/super-admin">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">{club.name}</h1>
                        <Badge variant={club.isActive ? "default" : "secondary"}>
                            {club.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                    </div>
                    {club.description && (
                        <p className="text-muted-foreground">{club.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                        Criado em {new Date(club.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                </div>
                <Button onClick={() => router.push(`/super-admin/clubs/${club.id}/users`)}>
                    <Users className="w-4 h-4 mr-2" />
                    Gerenciar Administradores
                </Button>
            </div>

            {/* Estatísticas Gerais */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Administradores</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{club._count.users}</div>
                        <p className="text-xs text-muted-foreground">
                            Usuários com acesso administrativo
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Jogadores</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{club._count.players}</div>
                        <p className="text-xs text-muted-foreground">
                            Jogadores cadastrados no clube
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Torneios</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{club._count.tournaments}</div>
                        <p className="text-xs text-muted-foreground">
                            Torneios organizados pelo clube
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Administradores */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Administradores
                        </CardTitle>
                        <CardDescription>
                            Usuários com acesso administrativo ao clube
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {club.users.length > 0 ? (
                            <div className="space-y-3">
                                {club.users.slice(0, 5).map((user) => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                        <Badge variant={user.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                                            {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                                        </Badge>
                                    </div>
                                ))}
                                {club.users.length > 5 && (
                                    <div className="text-center pt-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => router.push(`/super-admin/clubs/${club.id}/users`)}
                                        >
                                            Ver todos ({club.users.length})
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhum administrador cadastrado
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Atividade Recente */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Atividade Recente
                        </CardTitle>
                        <CardDescription>
                            Estatísticas e atividades do clube
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <div className="font-medium">Status do Clube</div>
                                    <div className="text-sm text-muted-foreground">
                                        {club.isActive ? 'Ativo e funcionando' : 'Temporariamente inativo'}
                                    </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${club.isActive ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <div className="font-medium">Data de Criação</div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(club.createdAt).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <div className="font-medium">Proporção Admin/Jogador</div>
                                    <div className="text-sm text-muted-foreground">
                                        {club._count.players > 0 
                                            ? `1 admin para cada ${Math.round(club._count.players / club._count.users)} jogadores`
                                            : 'Nenhum jogador cadastrado'
                                        }
                                    </div>
                                </div>
                                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ações Rápidas */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                    <CardDescription>
                        Operações comuns para gerenciar este clube
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                        <Button 
                            variant="outline" 
                            className="h-auto p-4 justify-start"
                            onClick={() => router.push(`/super-admin/clubs/${club.id}/users`)}
                        >
                            <Users className="w-5 h-5 mr-3" />
                            <div className="text-left">
                                <div className="font-medium">Gerenciar Usuários</div>
                                <div className="text-sm text-muted-foreground">Adicionar ou remover administradores</div>
                            </div>
                        </Button>

                        <Button 
                            variant="outline" 
                            className="h-auto p-4 justify-start"
                            onClick={() => {
                                // TODO: Implementar navegação para página de edição
                                toast.info('Funcionalidade em desenvolvimento')
                            }}
                        >
                            <Trophy className="w-5 h-5 mr-3" />
                            <div className="text-left">
                                <div className="font-medium">Ver Torneios</div>
                                <div className="text-sm text-muted-foreground">Visualizar torneios do clube</div>
                            </div>
                        </Button>

                        <Button 
                            variant="outline" 
                            className="h-auto p-4 justify-start"
                            onClick={() => {
                                // TODO: Implementar navegação para página de jogadores
                                toast.info('Funcionalidade em desenvolvimento')
                            }}
                        >
                            <Target className="w-5 h-5 mr-3" />
                            <div className="text-left">
                                <div className="font-medium">Ver Jogadores</div>
                                <div className="text-sm text-muted-foreground">Listar jogadores do clube</div>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}