'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, User, Mail, Calendar, Trash2, Edit, Eye, EyeOff } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

interface ClubUser {
    id: string
    name: string
    email: string
    role: 'SUPER_ADMIN' | 'CLUB_ADMIN'
    createdAt: string
    club: {
        id: string
        name: string
    } | null
}

interface Club {
    id: string
    name: string
    description: string | null
    isActive: boolean
}

export default function ClubUsersPage({ params }: { params: { id: string } }) {
    const [users, setUsers] = useState<ClubUser[]>([])
    const [club, setClub] = useState<Club | null>(null)
    const [loading, setLoading] = useState(true)
    const [createUserOpen, setCreateUserOpen] = useState(false)
    const [editUserOpen, setEditUserOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<ClubUser | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    
    // Formulário de criação/edição
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "CLUB_ADMIN" as "CLUB_ADMIN" | "SUPER_ADMIN"
    })
    
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        const fetchClub = async () => {
            try {
                const response = await fetch(`/api/clubs/${params.id}`)
                if (response.ok) {
                    const data = await response.json()
                    setClub(data)
                } else {
                    toast.error('Clube não encontrado')
                    router.push('/super-admin')
                }
            } catch (error) {
                console.error('Erro ao carregar clube:', error)
                toast.error('Erro ao carregar clube')
            }
        }

        const fetchUsers = async () => {
            try {
                const response = await fetch(`/api/clubs/${params.id}/users`)
                if (response.ok) {
                    const data = await response.json()
                    setUsers(data)
                } else {
                    toast.error('Erro ao carregar usuários')
                }
            } catch (error) {
                console.error('Erro ao carregar usuários:', error)
                toast.error('Erro ao carregar usuários')
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

            await fetchClub()
            await fetchUsers()
        }

        initPage()
    }, [session, status, router, params.id])

    const fetchUsersRefresh = async () => {
        try {
            const response = await fetch(`/api/clubs/${params.id}/users`)
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            } else {
                toast.error('Erro ao carregar usuários')
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error)
            toast.error('Erro ao carregar usuários')
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        
        try {
            const response = await fetch(`/api/clubs/${params.id}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast.success('Usuário criado com sucesso!')
                setCreateUserOpen(false)
                setFormData({ name: "", email: "", password: "", role: "CLUB_ADMIN" })
                fetchUsersRefresh()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Erro ao criar usuário')
            }
        } catch (error) {
            console.error('Erro ao criar usuário:', error)
            toast.error('Erro ao criar usuário')
        }
    }

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!selectedUser) return

        try {
            const updateData = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                ...(formData.password && { password: formData.password })
            }

            const response = await fetch(`/api/clubs/${params.id}/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            })

            if (response.ok) {
                toast.success('Usuário atualizado com sucesso!')
                setEditUserOpen(false)
                setSelectedUser(null)
                setFormData({ name: "", email: "", password: "", role: "CLUB_ADMIN" })
                fetchUsersRefresh()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Erro ao atualizar usuário')
            }
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error)
            toast.error('Erro ao atualizar usuário')
        }
    }

    const handleDeleteUser = async (user: ClubUser) => {
        try {
            const response = await fetch(`/api/clubs/${params.id}/users/${user.id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Usuário excluído com sucesso!')
                fetchUsersRefresh()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Erro ao excluir usuário')
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error)
            toast.error('Erro ao excluir usuário')
        }
    }

    const openEditModal = (user: ClubUser) => {
        setSelectedUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role
        })
        setEditUserOpen(true)
    }

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
                    <h1 className="text-3xl font-bold">Administradores - {club.name}</h1>
                    <p className="text-muted-foreground">
                        Gerencie os usuários administradores deste clube
                    </p>
                </div>
                
                <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Administrador
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar Novo Administrador</DialogTitle>
                            <DialogDescription>
                                Adicione um novo usuário administrador ao clube {club.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Digite o nome completo"
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
                                    placeholder="Digite o email"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        placeholder="Digite a senha (mín. 6 caracteres)"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="role">Tipo de Usuário</Label>
                                <Select value={formData.role} onValueChange={(value: "CLUB_ADMIN" | "SUPER_ADMIN") => setFormData(prev => ({ ...prev, role: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CLUB_ADMIN">Administrador do Clube</SelectItem>
                                        <SelectItem value="SUPER_ADMIN">Super Administrador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setCreateUserOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    Criar Usuário
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {users.map((user) => (
                    <Card key={user.id}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{user.name}</h3>
                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                            <div className="flex items-center space-x-1">
                                                <Mail className="w-4 h-4" />
                                                <span>{user.email}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant={user.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                                        {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin do Clube'}
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditModal(user)}
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Editar
                                    </Button>
                                    {user.role !== 'SUPER_ADMIN' && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Excluir
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Tem certeza que deseja excluir o usuário &quot;{user.name}&quot;? 
                                                        Esta ação não pode ser desfeita.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction 
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Excluir
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal de Edição */}
            <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                        <DialogDescription>
                            Altere os dados do usuário.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditUser} className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Nome Completo</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Digite o nome completo"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="Digite o email"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-password">Nova Senha (opcional)</Label>
                            <div className="relative">
                                <Input
                                    id="edit-password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="Deixe em branco para manter a atual"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-role">Tipo de Usuário</Label>
                            <Select value={formData.role} onValueChange={(value: "CLUB_ADMIN" | "SUPER_ADMIN") => setFormData(prev => ({ ...prev, role: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CLUB_ADMIN">Administrador do Clube</SelectItem>
                                    <SelectItem value="SUPER_ADMIN">Super Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => {
                                setEditUserOpen(false)
                                setSelectedUser(null)
                                setFormData({ name: "", email: "", password: "", role: "CLUB_ADMIN" })
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

            {users.length === 0 && !loading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="text-muted-foreground mb-4">
                            Nenhum administrador encontrado para este clube.
                        </div>
                        <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Criar Primeiro Administrador
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}