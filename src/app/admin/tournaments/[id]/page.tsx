"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ArrowLeft, Plus, Edit, Trash, Trophy, Medal, Award, Users, Calendar, DollarSign, Calculator } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { createLocalDate } from "@/lib/date-utils"
import { calculateTournamentPoints } from "@/lib/points-calculator"
import Link from "next/link"

interface Player {
    id: string
    name: string
    nickname: string
    email: string | null
    phone: string | null
}

interface Participation {
    id: string
    playerId: string
    position: number | null
    points: number | null
    prize: number | null
    player: Player
}

interface Tournament {
    id: string
    name: string
    date: string
    buyIn: number | null
    description: string | null
    status: string
    participations: Participation[]
}

export default function TournamentDetailsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()
    const tournamentId = params.id as string

    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [allPlayers, setAllPlayers] = useState<Player[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingParticipation, setEditingParticipation] = useState<Participation | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedPlayerName, setSelectedPlayerName] = useState("")
    const [showAddPlayerForm, setShowAddPlayerForm] = useState(false)
    const [newPlayerData, setNewPlayerData] = useState({
        name: "",
        nickname: "",
        email: "",
        phone: ""
    })
    const [formData, setFormData] = useState({
        playerId: "",
        position: "",
        points: "",
        prize: ""
    })

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    useEffect(() => {
        if (!session || !tournamentId) return

        const fetchTournamentDetails = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/tournaments/${tournamentId}`)
                if (response.ok) {
                    const data = await response.json()
                    setTournament(data)
                } else {
                    toast.error("Torneio não encontrado")
                    router.push("/admin/tournaments")
                }
            } catch (error) {
                console.error("Erro ao buscar torneio:", error)
                toast.error("Erro ao carregar torneio")
            } finally {
                setLoading(false)
            }
        }

        const fetchAllPlayers = async () => {
            try {
                const response = await fetch("/api/players")
                if (response.ok) {
                    const data = await response.json()
                    setAllPlayers(data)
                }
            } catch (error) {
                console.error("Erro ao buscar jogadores:", error)
            }
        }

        const fetchData = async () => {
            await Promise.all([
                fetchTournamentDetails(),
                fetchAllPlayers()
            ])
        }

        fetchData()
    }, [session, tournamentId, router])

    const refetchTournament = async () => {
        try {
            const response = await fetch(`/api/tournaments/${tournamentId}`)
            if (response.ok) {
                const data = await response.json()
                setTournament(data)
            }
        } catch (error) {
            console.error("Erro ao recarregar torneio:", error)
        }
    }

    const handleSubmitParticipation = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.playerId) {
            toast.error("Selecione um jogador")
            return
        }

        try {
            const url = editingParticipation
                ? `/api/tournaments/${tournamentId}/participations/${editingParticipation.id}`
                : `/api/tournaments/${tournamentId}/participations`

            const method = editingParticipation ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    playerId: formData.playerId,
                    position: formData.position ? parseInt(formData.position) : null,
                    points: formData.points ? parseFloat(formData.points) : null,
                    prize: formData.prize ? parseFloat(formData.prize) : null,
                }),
            })

            if (response.ok) {
                toast.success(editingParticipation ? "Participação atualizada!" : "Participação adicionada!")
                setDialogOpen(false)
                resetForm()
                refetchTournament()
            } else {
                const error = await response.json()
                toast.error(error.error || "Erro ao salvar participação")
            }
        } catch (error) {
            console.error("Erro:", error)
            toast.error("Erro interno")
        }
    }

    const handleEditParticipation = (participation: Participation) => {
        setEditingParticipation(participation)
        setFormData({
            playerId: participation.playerId,
            position: participation.position?.toString() || "",
            points: participation.points?.toString() || "",
            prize: participation.prize?.toString() || ""
        })
        setDialogOpen(true)
    }

    const handleDeleteParticipation = async (participationId: string) => {
        try {
            const response = await fetch(`/api/tournaments/${tournamentId}/participations/${participationId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                toast.success("Participação removida!")
                refetchTournament()
            } else {
                const error = await response.json()
                toast.error(error.error || "Erro ao remover participação")
            }
        } catch (error) {
            console.error("Erro:", error)
            toast.error("Erro interno")
        }
    }

    const handleRecalculatePoints = async () => {
        try {
            const response = await fetch(`/api/tournaments/${tournamentId}/recalculate-points`, {
                method: "POST",
            })

            if (response.ok) {
                toast.success("Pontos recalculados automaticamente!")
                refetchTournament()
            } else {
                const error = await response.json()
                toast.error(error.error || "Erro ao recalcular pontos")
            }
        } catch (error) {
            console.error("Erro:", error)
            toast.error("Erro interno")
        }
    }

    const resetForm = () => {
        setFormData({
            playerId: "",
            position: "",
            points: "",
            prize: ""
        })
        setEditingParticipation(null)
        setSearchTerm("")
        setShowDropdown(false)
        setSelectedPlayerName("")
        setShowAddPlayerForm(false)
        setNewPlayerData({ name: "", nickname: "", email: "", phone: "" })
    }

    const getPositionIcon = (position: number | null) => {
        if (!position) return <span className="text-gray-400">-</span>

        switch (position) {
            case 1:
                return <Trophy className="h-5 w-5 text-yellow-500" />
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />
            case 3:
                return <Award className="h-5 w-5 text-amber-600" />
            default:
                return <span className="font-bold text-gray-600">{position}º</span>
        }
    }

    const getStatusBadge = (status: string) => {
        const badges = {
            UPCOMING: "bg-blue-100 text-blue-800",
            IN_PROGRESS: "bg-yellow-100 text-yellow-800",
            COMPLETED: "bg-green-100 text-green-800",
            CANCELLED: "bg-red-100 text-red-800"
        }

        const labels = {
            UPCOMING: "Próximo",
            IN_PROGRESS: "Em Andamento",
            COMPLETED: "Finalizado",
            CANCELLED: "Cancelado"
        }

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        )
    }

    const getAvailablePlayers = () => {
        const participatingPlayerIds = tournament?.participations.map(p => p.playerId) || []
        return allPlayers.filter(player =>
            !participatingPlayerIds.includes(player.id) ||
            (editingParticipation && player.id === editingParticipation.playerId)
        )
    }

    const getFilteredPlayers = () => {
        const availablePlayers = getAvailablePlayers()
        if (!searchTerm) return availablePlayers

        return availablePlayers.filter(player =>
            player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (player.email && player.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    }

    const handleAddNewPlayer = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newPlayerData.name || !newPlayerData.nickname) {
            toast.error("Nome e nickname são obrigatórios")
            return
        }

        try {
            const response = await fetch("/api/players", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newPlayerData),
            })

            if (response.ok) {
                const newPlayer = await response.json()
                setAllPlayers(prev => [...prev, newPlayer])
                setFormData(prev => ({ ...prev, playerId: newPlayer.id }))
                setNewPlayerData({ name: "", nickname: "", email: "", phone: "" })
                setShowAddPlayerForm(false)
                setSearchTerm("")
                toast.success("Jogador adicionado e selecionado!")
            } else {
                const error = await response.json()
                toast.error(error.error || "Erro ao adicionar jogador")
            }
        } catch (error) {
            console.error("Erro:", error)
            toast.error("Erro interno")
        }
    }

    const resetAddPlayerForm = () => {
        setNewPlayerData({ name: "", nickname: "", email: "", phone: "" })
        setShowAddPlayerForm(false)
        setSearchTerm("")
    }

    const handleSelectPlayer = (player: Player) => {
        setFormData(prev => ({ ...prev, playerId: player.id }))
        setSelectedPlayerName(`${player.name} (@${player.nickname})`)
        setSearchTerm("")
        setShowDropdown(false)
    }

    const handleSearchInputChange = (value: string) => {
        setSearchTerm(value)
        setShowDropdown(value.length > 0)
        if (value.length === 0) {
            setFormData(prev => ({ ...prev, playerId: "" }))
            setSelectedPlayerName("")
        }
    }

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!session || !tournament) {
        return null
    }

    const sortedParticipations = [...tournament.participations].sort((a, b) => {
        if (a.position && b.position) return a.position - b.position
        if (a.position && !b.position) return -1
        if (!a.position && b.position) return 1
        return 0
    })

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
                        <h1 className="text-3xl font-bold">{tournament.name}</h1>
                        <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{format(createLocalDate(tournament.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                            </div>
                            {tournament.buyIn && (
                                <div className="flex items-center space-x-1 text-gray-600">
                                    <DollarSign className="h-4 w-4" />
                                    <span>R$ {tournament.buyIn.toFixed(2)}</span>
                                </div>
                            )}
                            {getStatusBadge(tournament.status)}
                        </div>
                    </div>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Participante
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingParticipation ? "Editar Participação" : "Nova Participação"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmitParticipation} className="space-y-4">
                            <div>
                                <Label htmlFor="playerId">Jogador</Label>

                                {/* Input com autocomplete */}
                                <div className="relative">
                                    <Input
                                        placeholder="Digite para pesquisar jogador por nome, nickname ou email..."
                                        value={formData.playerId ? selectedPlayerName : searchTerm}
                                        onChange={(e) => handleSearchInputChange(e.target.value)}
                                        onFocus={() => {
                                            if (searchTerm) setShowDropdown(true)
                                        }}
                                        className="mb-2"
                                    />

                                    {/* Dropdown de resultados */}
                                    {showDropdown && searchTerm && (
                                        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {getFilteredPlayers().length > 0 ? (
                                                getFilteredPlayers().map((player) => (
                                                    <div
                                                        key={player.id}
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                        onClick={() => handleSelectPlayer(player)}
                                                    >
                                                        <div className="font-medium">{player.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            @{player.nickname}
                                                            {player.email && <span className="ml-2">• {player.email}</span>}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-3 py-2 text-sm text-gray-500">
                                                    Nenhum jogador encontrado
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Indicador de jogador selecionado */}
                                    {formData.playerId && (
                                        <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded-md">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-green-800">
                                                    ✓ Jogador selecionado: {selectedPlayerName}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, playerId: "" }))
                                                        setSelectedPlayerName("")
                                                        setSearchTerm("")
                                                    }}
                                                    className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Botão para adicionar novo jogador */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddPlayerForm(!showAddPlayerForm)}
                                    className="w-full mt-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {showAddPlayerForm ? "Cancelar" : "Adicionar Novo Jogador"}
                                </Button>

                                {/* Formulário para adicionar novo jogador */}
                                {showAddPlayerForm && (
                                    <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                                        <h4 className="font-medium text-sm">Adicionar Novo Jogador</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label htmlFor="newPlayerName" className="text-xs">Nome *</Label>
                                                <Input
                                                    id="newPlayerName"
                                                    placeholder="Nome completo"
                                                    value={newPlayerData.name}
                                                    onChange={(e) => setNewPlayerData(prev => ({ ...prev, name: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="newPlayerNickname" className="text-xs">Nickname *</Label>
                                                <Input
                                                    id="newPlayerNickname"
                                                    placeholder="@nickname"
                                                    value={newPlayerData.nickname}
                                                    onChange={(e) => setNewPlayerData(prev => ({ ...prev, nickname: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label htmlFor="newPlayerEmail" className="text-xs">Email</Label>
                                                <Input
                                                    id="newPlayerEmail"
                                                    type="email"
                                                    placeholder="email@exemplo.com"
                                                    value={newPlayerData.email}
                                                    onChange={(e) => setNewPlayerData(prev => ({ ...prev, email: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="newPlayerPhone" className="text-xs">Telefone</Label>
                                                <Input
                                                    id="newPlayerPhone"
                                                    placeholder="(11) 99999-9999"
                                                    value={newPlayerData.phone}
                                                    onChange={(e) => setNewPlayerData(prev => ({ ...prev, phone: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button type="button" variant="outline" size="sm" onClick={resetAddPlayerForm}>
                                                Cancelar
                                            </Button>
                                            <Button type="button" size="sm" onClick={handleAddNewPlayer}>
                                                Adicionar Jogador
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="position">Posição Final</Label>
                                    <Input
                                        id="position"
                                        type="number"
                                        min="1"
                                        value={formData.position}
                                        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                                        placeholder="Ex: 1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="points">Pontos</Label>
                                    <Input
                                        id="points"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formData.points}
                                        onChange={(e) => setFormData(prev => ({ ...prev, points: e.target.value }))}
                                        placeholder="Deixe vazio para cálculo automático"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Se não informado, será calculado automaticamente baseado na posição e número de participantes
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="prize">Prêmio (R$)</Label>
                                <Input
                                    id="prize"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.prize}
                                    onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
                                    placeholder="Ex: 150.00"
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingParticipation ? "Atualizar" : "Adicionar"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Informações do Torneio */}
            {tournament.description && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-gray-600">{tournament.description}</p>
                    </CardContent>
                </Card>
            )}

            {/* Sistema de Pontuação */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                        <Calculator className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">Sistema de Pontuação Automática</h3>
                            <p className="text-sm text-blue-700 mb-2">
                                Os pontos são calculados automaticamente com base no número de participantes usando uma fórmula exponencial.
                            </p>
                            <ul className="text-xs text-blue-600 space-y-1">
                                <li>• Mais participantes = mais pontos distribuídos</li>
                                <li>• Primeiras posições recebem mais pontos</li>
                                <li>• Use &ldquo;Recalcular Pontos&rdquo; após adicionar/remover participantes</li>
                                <li>• Pontos manuais substituem o cálculo automático</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Participações */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Participantes ({tournament.participations.length})</span>
                        </CardTitle>
                        {tournament.participations.length > 0 && (
                            <div className="flex space-x-2">
                                <Link href="/admin/points-system">
                                    <Button variant="outline" size="sm">
                                        <Calculator className="h-4 w-4 mr-2" />
                                        Como Funciona
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRecalculatePoints}
                                    className="flex items-center space-x-2"
                                >
                                    <Calculator className="h-4 w-4" />
                                    <span>Recalcular Pontos</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {tournament.participations.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Nenhum participante ainda</p>
                            <p className="text-sm text-gray-500">Adicione jogadores para começar</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Posição</TableHead>
                                    <TableHead>Jogador</TableHead>
                                    <TableHead className="text-center">Pontos</TableHead>
                                    <TableHead className="text-center">Prêmio</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedParticipations.map((participation) => (
                                    <TableRow key={participation.id}>
                                        <TableCell className="flex items-center justify-center">
                                            {getPositionIcon(participation.position)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{participation.player.name}</div>
                                                <div className="text-sm text-gray-500">@{participation.player.nickname}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-bold">
                                            {participation.points ? participation.points.toFixed(1) : "-"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {participation.prize ? `R$ ${participation.prize.toFixed(2)}` : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditParticipation(participation)}
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
                                                            <AlertDialogTitle>Remover Participação</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tem certeza que deseja remover &quot;{participation.player.name}&quot; deste torneio?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteParticipation(participation.id)}>
                                                                Remover
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Prévia da Distribuição de Pontos */}
            {tournament.participations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Calculator className="h-5 w-5" />
                            <span>Prévia da Distribuição de Pontos</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2">Distribuição Automática</h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    Com {tournament.participations.length} participantes:
                                </p>
                                <div className="space-y-2">
                                    {calculateTournamentPoints(tournament.participations.length).slice(0, 5).map((entry) => (
                                        <div key={entry.position} className="flex justify-between text-sm">
                                            <span className="flex items-center space-x-1">
                                                {entry.position <= 3 && (
                                                    <>
                                                        {entry.position === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                                                        {entry.position === 2 && <Medal className="h-4 w-4 text-gray-400" />}
                                                        {entry.position === 3 && <Award className="h-4 w-4 text-amber-600" />}
                                                    </>
                                                )}
                                                <span>{entry.position}º lugar</span>
                                            </span>
                                            <span className="font-medium">{entry.points.toFixed(1)} pontos</span>
                                        </div>
                                    ))}
                                    {calculateTournamentPoints(tournament.participations.length).length > 5 && (
                                        <div className="text-xs text-gray-500 mt-2">
                                            E mais {calculateTournamentPoints(tournament.participations.length).length - 5} posições...
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Como Funciona</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Fórmula exponencial: participantes^1.5 × 10</li>
                                    <li>• Pelo menos 50% das posições recebem pontos</li>
                                    <li>• 1º lugar recebe 100% dos pontos base</li>
                                    <li>• Cada posição seguinte recebe 80% da anterior</li>
                                    <li>• Pontos mínimos garantidos para posições pagantes</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
