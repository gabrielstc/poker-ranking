"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Calendar, Plus, Edit, Trash, Users, Trophy } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatDateForInput, createLocalDate } from "@/lib/date-utils"
import Link from "next/link"

interface Tournament {
    id: string
    name: string
    date: string
    buyIn: number | null
    description: string | null
    status: string
    type?: "FIXO" | "EXPONENCIAL"
    participations: Array<{
        id: string
        player: {
            id: string
            name: string
            nickname: string
        }
        position: number | null
        points: number | null
    }>
}

export default function TournamentsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingTournament, setEditingTournament] = useState<Tournament | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        buyIn: "",
        description: "",
        status: "UPCOMING",
        tipo: "EXPONENCIAL" as "FIXO" | "EXPONENCIAL",
    })

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    useEffect(() => {
        if (session) {
            fetchTournaments()
        }
    }, [session])

    const fetchTournaments = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/tournaments")
            if (response.ok) {
                const data = await response.json()
                setTournaments(data)
            }
        } catch (error) {
            console.error("Erro ao buscar torneios:", error)
            toast.error("Erro ao carregar torneios")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingTournament
                ? `/api/tournaments/${editingTournament.id}`
                : "/api/tournaments"

            const method = editingTournament ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    buyIn: formData.buyIn ? parseFloat(formData.buyIn) : null,
                }),
            })

            if (response.ok) {
                toast.success(editingTournament ? "Torneio atualizado!" : "Torneio criado!")
                setDialogOpen(false)
                resetForm()
                fetchTournaments()
            } else {
                const error = await response.json()
                toast.error(error.error || "Erro ao salvar torneio")
            }
        } catch (error) {
            console.error("Erro:", error)
            toast.error("Erro interno")
        }
    }

    const handleEdit = (tournament: Tournament) => {
        setEditingTournament(tournament)
        setFormData({
            name: tournament.name,
            date: formatDateForInput(tournament.date),
            buyIn: tournament.buyIn?.toString() || "",
            description: tournament.description || "",
            status: tournament.status,
            tipo: tournament.type || "EXPONENCIAL",
        })
        setDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/tournaments/${id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                toast.success("Torneio removido!")
                fetchTournaments()
            } else {
                const error = await response.json()
                toast.error(error.error || "Erro ao remover torneio")
            }
        } catch (error) {
            console.error("Erro:", error)
            toast.error("Erro interno")
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            date: "",
            buyIn: "",
            description: "",
            status: "UPCOMING",
            tipo: "EXPONENCIAL",
        })
        setEditingTournament(null)
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

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Gerenciar Torneios</h1>
                    <p className="text-gray-600">Crie e gerencie torneios de poker</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Torneio
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingTournament ? "Editar Torneio" : "Novo Torneio"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nome do Torneio</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: Torneio de Agosto"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="date">Data</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="buyIn">Buy-in (R$)</Label>
                                <Input
                                    id="buyIn"
                                    type="number"
                                    step="0.01"
                                    value={formData.buyIn}
                                    onChange={(e) => setFormData(prev => ({ ...prev, buyIn: e.target.value }))}
                                    placeholder="Ex: 50.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UPCOMING">Próximo</SelectItem>
                                        <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                                        <SelectItem value="COMPLETED">Finalizado</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="tipo">Tipo</Label>
                                <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as "FIXO" | "EXPONENCIAL" }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EXPONENCIAL">Exponencial</SelectItem>
                                        <SelectItem value="FIXO">Fixo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="description">Descrição</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descrição opcional"
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingTournament ? "Atualizar" : "Criar"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Trophy className="h-5 w-5" />
                        <span>Torneios</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-gray-600">Carregando torneios...</p>
                        </div>
                    ) : tournaments.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Nenhum torneio encontrado</p>
                            <p className="text-sm text-gray-500">Crie seu primeiro torneio para começar</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Buy-in</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Participantes</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tournaments.map((tournament) => (
                                    <TableRow key={tournament.id}>
                                        <TableCell className="font-medium">{tournament.name}</TableCell>
                                        <TableCell>
                                            {format(createLocalDate(tournament.date), "dd/MM/yyyy", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>
                                            {tournament.buyIn ? `R$ ${tournament.buyIn.toFixed(2)}` : "-"}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(tournament.status)}</TableCell>
                                        <TableCell>{tournament.type === "FIXO" ? "Fixo" : "Exponencial"}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <Users className="h-4 w-4" />
                                                <span>{tournament.participations.length}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={`/admin/tournaments/${tournament.id}`}>
                                                    <Button size="sm" variant="default">
                                                        <Users className="h-4 w-4 mr-1" />
                                                        Participantes
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(tournament)}
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
                                                                Tem certeza que deseja excluir o torneio &quot;{tournament.name}&quot;?
                                                                Esta ação não pode ser desfeita.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(tournament.id)}>
                                                                Excluir
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
        </div>
    )
}
