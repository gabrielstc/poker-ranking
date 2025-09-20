"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Users, Plus, Edit, Trash, Trophy, Award } from "lucide-react"
import { toast } from "sonner"
import { useClub } from "@/contexts/ClubContext"

interface Player {
    id: string
    name: string
    nickname: string
    email: string | null
    phone: string | null
    participations: Array<{
        id: string
        tournament: {
            id: string
            name: string
            date: string
        }
        position: number | null
        points: number | null
    }>
}

export default function ClubAdminPlayersPage() {
    const { currentClub } = useClub()
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()
    const clubSlug = params.slug as string
    
    const [players, setPlayers] = useState<Player[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        nickname: "",
        email: "",
        phone: ""
    })

    // Verificação de autenticação e permissão
    useEffect(() => {
        if (status === "loading") return
        
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "CLUB_ADMIN")) {
            router.push(`/clube/${clubSlug}`)
            return
        }

        if (!currentClub) {
            toast.error("Clube não encontrado")
            router.push("/")
            return
        }
    }, [session, status, router, clubSlug, currentClub])

    const fetchPlayers = useCallback(async () => {
        try {
            setLoading(true)
            console.log("🐛 Carregando jogadores - currentClub:", currentClub)
            console.log("🐛 URL da API:", `/api/clubs/${currentClub?.id}/players`)
            
            if (!currentClub?.id) {
                console.error("❌ ID do clube não encontrado")
                toast.error("ID do clube não encontrado")
                return
            }
            
            const response = await fetch(`/api/clubs/${currentClub.id}/players`)
            console.log("🐛 Response status:", response.status)
            
            if (response.ok) {
                const data = await response.json()
                console.log("✅ Jogadores carregados:", data)
                setPlayers(data)
            } else {
                const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
                console.error("❌ Erro na API:", errorData)
                throw new Error(errorData.error || "Erro ao carregar jogadores")
            }
        } catch (error) {
            console.error("❌ Erro ao buscar jogadores:", error)
            toast.error("Erro ao carregar jogadores: " + (error instanceof Error ? error.message : "Erro desconhecido"))
        } finally {
            setLoading(false)
        }
    }, [currentClub])

    useEffect(() => {
        if (currentClub && clubSlug) {
            fetchPlayers()
        }
    }, [currentClub, clubSlug, fetchPlayers])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingPlayer
                ? `/api/clubs/${currentClub?.id}/players/${editingPlayer.id}`
                : `/api/clubs/${currentClub?.id}/players`

            const method = editingPlayer ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast.success(editingPlayer ? "Jogador atualizado!" : "Jogador criado!")
                setDialogOpen(false)
                resetForm()
                fetchPlayers()
            } else {
                const error = await response.json()
                toast.error(error.error || "Erro ao salvar jogador")
            }
        } catch (error) {
            console.error("Erro:", error)
            toast.error("Erro interno")
        }
    }

    const handleEdit = (player: Player) => {
        setEditingPlayer(player)
        setFormData({
            name: player.name,
            nickname: player.nickname,
            email: player.email || "",
            phone: player.phone || ""
        })
        setDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/clubs/${currentClub?.id}/players/${id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                toast.success("Jogador removido!")
                fetchPlayers()
            } else {
                const error = await response.json()
                toast.error(error.error || "Erro ao remover jogador")
            }
        } catch (error) {
            console.error("Erro:", error)
            toast.error("Erro interno")
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            nickname: "",
            email: "",
            phone: ""
        })
        setEditingPlayer(null)
    }

    const getPlayerStats = (player: Player) => {
        const totalPoints = player.participations.reduce((sum, p) => sum + (p.points || 0), 0)
        const tournaments = player.participations.length
        const wins = player.participations.filter(p => p.position === 1).length

        return { totalPoints, tournaments, wins }
    }

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "CLUB_ADMIN")) {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Gerenciar Jogadores</h1>
                    <p className="text-muted-foreground">
                        Cadastre e gerencie jogadores do {currentClub?.name}
                    </p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Jogador
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingPlayer ? "Editar Jogador" : "Novo Jogador"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: João Silva"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="nickname">Nickname</Label>
                                <Input
                                    id="nickname"
                                    value={formData.nickname}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                                    placeholder="Ex: joaopoker"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Ex: joao@email.com"
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">Telefone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Ex: (11) 99999-9999"
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingPlayer ? "Atualizar" : "Criar"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Jogadores do {currentClub?.name}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-muted-foreground">Carregando jogadores...</p>
                        </div>
                    ) : players.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Nenhum jogador encontrado</p>
                            <p className="text-sm text-muted-foreground/70">Cadastre o primeiro jogador para começar</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Nickname</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead className="text-center">Torneios</TableHead>
                                    <TableHead className="text-center">Pontos</TableHead>
                                    <TableHead className="text-center">Vitórias</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {players.map((player) => {
                                    const stats = getPlayerStats(player)
                                    return (
                                        <TableRow key={player.id}>
                                            <TableCell className="font-medium">{player.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1">
                                                    <span className="text-muted-foreground">@</span>
                                                    <span>{player.nickname}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{player.email || "-"}</TableCell>
                                            <TableCell>{player.phone || "-"}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center space-x-1">
                                                    <Trophy className="h-4 w-4" />
                                                    <span>{stats.tournaments}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-bold">
                                                {stats.totalPoints.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center space-x-1">
                                                    <Award className="h-4 w-4 text-yellow-500" />
                                                    <span>{stats.wins}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(player)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="outline">
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Tem certeza que deseja excluir o jogador &quot;{player.name}&quot;?
                                                                    Esta ação removerá também todas as participações em torneios.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(player.id)}>
                                                                    Excluir
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}