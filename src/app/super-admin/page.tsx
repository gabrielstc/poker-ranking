'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Users, Trophy, Target, Edit, Trash2, UserPlus, Power, PowerOff, Search } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import ImageUpload from "@/components/ui/image-upload"

interface Club {
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
}

export default function SuperAdminPage() {
    const [clubs, setClubs] = useState<Club[]>([])
    const [filteredClubs, setFilteredClubs] = useState<Club[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [showActiveOnly, setShowActiveOnly] = useState(false)
    const [createClubOpen, setCreateClubOpen] = useState(false)
    const [editClubOpen, setEditClubOpen] = useState(false)
    const [selectedClub, setSelectedClub] = useState<Club | null>(null)
    
    // Formulário de criação/edição
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        logo: ""
    })
    
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
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

        fetchClubs()
    }, [session, status, router])

    useEffect(() => {
        // Filtrar clubes
        let filtered = clubs

        if (searchTerm) {
            filtered = filtered.filter(club => 
                club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }

        if (showActiveOnly) {
            filtered = filtered.filter(club => club.isActive)
        }

        setFilteredClubs(filtered)
    }, [clubs, searchTerm, showActiveOnly])

    const fetchClubs = async () => {
        try {
            const response = await fetch('/api/clubs')
            if (response.ok) {
                const data = await response.json()
                setClubs(data)
            } else {
                toast.error('Erro ao carregar clubes')
            }
        } catch (error) {
            console.error('Erro ao carregar clubes:', error)
            toast.error('Erro ao carregar clubes')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateClub = async (e: React.FormEvent) => {
        e.preventDefault()
        
        try {
            const response = await fetch('/api/clubs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast.success('Clube criado com sucesso!')
                setCreateClubOpen(false)
                setFormData({ name: "", description: "", logo: "" })
                fetchClubs()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Erro ao criar clube')
            }
        } catch (error) {
            console.error('Erro ao criar clube:', error)
            toast.error('Erro ao criar clube')
        }
    }

    const handleEditClub = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!selectedClub) return

        try {
            const response = await fetch(`/api/clubs/${selectedClub.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    isActive: selectedClub.isActive
                }),
            })

            if (response.ok) {
                toast.success('Clube atualizado com sucesso!')
                setEditClubOpen(false)
                setSelectedClub(null)
                setFormData({ name: "", description: "", logo: "" })
                fetchClubs()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Erro ao atualizar clube')
            }
        } catch (error) {
            console.error('Erro ao atualizar clube:', error)
            toast.error('Erro ao atualizar clube')
        }
    }

    const handleToggleClubStatus = async (club: Club) => {
        try {
            const response = await fetch(`/api/clubs/${club.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: club.name,
                    description: club.description,
                    logo: club.logo,
                    isActive: !club.isActive
                }),
            })

            if (response.ok) {
                toast.success(`Clube ${!club.isActive ? 'ativado' : 'desativado'} com sucesso!`)
                fetchClubs()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Erro ao alterar status do clube')
            }
        } catch (error) {
            console.error('Erro ao alterar status:', error)
            toast.error('Erro ao alterar status do clube')
        }
    }

    const handleDeleteClub = async (club: Club) => {
        try {
            const response = await fetch(`/api/clubs/${club.id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Clube excluído com sucesso!')
                fetchClubs()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Erro ao excluir clube')
            }
        } catch (error) {
            console.error('Erro ao excluir clube:', error)
            toast.error('Erro ao excluir clube')
        }
    }

    const openEditModal = (club: Club) => {
        setSelectedClub(club)
        setFormData({
            name: club.name,
            description: club.description || "",
            logo: club.logo || ""
        })
        setEditClubOpen(true)
    }

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Carregando...</div>
            </div>
        )
    }

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return null
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Administração de Clubes</h1>
                    <p className="text-muted-foreground">
                        Gerencie clubes e administradores da plataforma
                    </p>
                </div>
                
                <Dialog open={createClubOpen} onOpenChange={setCreateClubOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Clube
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar Novo Clube</DialogTitle>
                            <DialogDescription>
                                Preencha os dados do novo clube de poker.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateClub} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nome do Clube</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Digite o nome do clube"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Descrição</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descrição do clube (opcional)"
                                />
                            </div>
                            <div>
                                <ImageUpload
                                    label="Logo do Clube"
                                    value={formData.logo}
                                    onChange={(dataUrl) => setFormData(prev => ({ ...prev, logo: dataUrl || "" }))}
                                    placeholder="Clique para selecionar a logo ou arraste aqui"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setCreateClubOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    Criar Clube
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filtros */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Buscar clubes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <Button
                    variant={showActiveOnly ? "default" : "outline"}
                    onClick={() => setShowActiveOnly(!showActiveOnly)}
                >
                    {showActiveOnly ? "Todos" : "Apenas Ativos"}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredClubs.map((club) => (
                    <Card key={club.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-3">
                                    {club.logo && (
                                        <div className="flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={club.logo}
                                                alt={`Logo do ${club.name}`}
                                                className="w-12 h-12 rounded-lg object-contain bg-gray-50 border"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <CardTitle className="text-lg">{club.name}</CardTitle>
                                        {club.description && (
                                            <CardDescription className="mt-1">
                                                {club.description}
                                            </CardDescription>
                                        )}
                                    </div>
                                </div>
                                <Badge variant={club.isActive ? "default" : "secondary"}>
                                    {club.isActive ? "Ativo" : "Inativo"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 text-center mb-4">
                                <div>
                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
                                        <Users className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="text-2xl font-bold">{club._count.users}</div>
                                    <div className="text-xs text-muted-foreground">Admins</div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
                                        <Target className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="text-2xl font-bold">{club._count.players}</div>
                                    <div className="text-xs text-muted-foreground">Jogadores</div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full mx-auto mb-2">
                                        <Trophy className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div className="text-2xl font-bold">{club._count.tournaments}</div>
                                    <div className="text-xs text-muted-foreground">Torneios</div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex-1"
                                        onClick={() => openEditModal(club)}
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Editar
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex-1"
                                        onClick={() => handleToggleClubStatus(club)}
                                    >
                                        {club.isActive ? (
                                            <>
                                                <PowerOff className="w-4 h-4 mr-1" />
                                                Desativar
                                            </>
                                        ) : (
                                            <>
                                                <Power className="w-4 h-4 mr-1" />
                                                Ativar
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => router.push(`/super-admin/clubs/${club.id}/users`)}
                                >
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    Gerenciar Administradores
                                </Button>
                                
                                {/* Botão de excluir apenas se não há dados relacionados */}
                                {club._count.users === 0 && club._count.players === 0 && club._count.tournaments === 0 && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" className="w-full">
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Excluir Clube
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Tem certeza que deseja excluir o clube &quot;{club.name}&quot;? 
                                                    Esta ação não pode ser desfeita.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction 
                                                    onClick={() => handleDeleteClub(club)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Excluir
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal de Edição */}
            <Dialog open={editClubOpen} onOpenChange={setEditClubOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Clube</DialogTitle>
                        <DialogDescription>
                            Altere os dados do clube.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditClub} className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Nome do Clube</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Digite o nome do clube"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description">Descrição</Label>
                            <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Descrição do clube (opcional)"
                            />
                        </div>
                        <div>
                            <ImageUpload
                                label="Logo do Clube"
                                value={formData.logo}
                                onChange={(dataUrl) => setFormData(prev => ({ ...prev, logo: dataUrl || "" }))}
                                placeholder="Clique para selecionar a logo ou arraste aqui"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => {
                                setEditClubOpen(false)
                                setSelectedClub(null)
                                setFormData({ name: "", description: "", logo: "" })
                            }}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                Salvar Alterações
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {filteredClubs.length === 0 && !loading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="text-muted-foreground mb-4">
                            {searchTerm || showActiveOnly ? "Nenhum clube encontrado com os filtros aplicados." : "Nenhum clube encontrado."}
                        </div>
                        {!searchTerm && !showActiveOnly && (
                            <Dialog open={createClubOpen} onOpenChange={setCreateClubOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Criar Primeiro Clube
                                    </Button>
                                </DialogTrigger>
                            </Dialog>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}