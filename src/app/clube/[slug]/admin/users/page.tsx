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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash, Users, Eye, EyeOff, ArrowLeft, UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useClub } from "@/contexts/ClubContext"
import Link from "next/link"

interface User {
    id: string
    name: string | null
    email: string
    role: "SUPER_ADMIN" | "CLUB_ADMIN"
    createdAt: string
    updatedAt: string
    clubs?: Array<{
        id: string
        name: string
        slug: string
    }>
}

export default function ClubAdminUsersPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()
    const clubSlug = params.slug as string
    const { currentClub } = useClub()
    
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "CLUB_ADMIN" as "SUPER_ADMIN" | "CLUB_ADMIN"
    })

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    const fetchClubUsers = useCallback(async () => {
        if (!currentClub) return
        
        try {
            setLoading(true)
            const response = await fetch(`/api/clubs/${currentClub.id}/users`)
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            } else {
                toast.error("Erro ao carregar usuários do clube")
            }
        } catch (error) {
            console.error("Erro ao buscar usuários:", error)
            toast.error("Erro ao carregar usuários")
        } finally {
            setLoading(false)
        }
    }, [currentClub])

    useEffect(() => {
        if (session && currentClub) {
            fetchClubUsers()
        }
    }, [session, currentClub, fetchClubUsers])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentClub) return

        try {
            const url = editingUser
                ? `/api/clubs/${currentClub.id}/users/${editingUser.id}`
                : `/api/clubs/${currentClub.id}/users`

            const method = editingUser ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    clubId: currentClub.id
                }),
            })

            if (response.ok) {
                toast.success(editingUser ? "Usuário atualizado!" : "Usuário criado!")
                setDialogOpen(false)
                resetForm()
                fetchClubUsers()
            } else {
                const error = await response.json()
                toast.error(error.error || "Erro ao salvar usuário")
            }
        } catch (error) {
            console.error("Erro:", error)
            toast.error("Erro interno")
        }
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
        setFormData({
            name: user.name || "",
            email: user.email,
            password: "",
            role: user.role
        })
        setDialogOpen(true)
    }

    const handleRemoveFromClub = async (userId: string) => {
        if (!currentClub) return
        
        try {
            const response = await fetch(`/api/clubs/${currentClub.id}/users/${userId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                toast.success("Usuário removido do clube!")
                fetchClubUsers()
            } else {
                const error = await response.json()
                toast.error(error.error || "Erro ao remover usuário")
            }
        } catch (error) {
            console.error("Erro:", error)
            toast.error("Erro interno")
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            role: "CLUB_ADMIN"
        })
        setEditingUser(null)
        setShowPassword(false)
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "SUPER_ADMIN":
                return <Badge variant="destructive">Super Admin</Badge>
            case "CLUB_ADMIN":
                return <Badge variant="default">Admin do Clube</Badge>
            default:
                return <Badge variant="outline">Desconhecido</Badge>
        }
    }

    if (status === "loading" || !currentClub) {
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
                        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
                        <p className="text-muted-foreground">
                            Gerencie administradores e usuários do {currentClub.name}
                        </p>
                    </div>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Usuário
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingUser ? "Editar Usuário" : "Adicionar Usuário ao Clube"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Nome do usuário"
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
                                    placeholder="email@exemplo.com"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="role">Nível de Acesso</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value: "SUPER_ADMIN" | "CLUB_ADMIN") => 
                                        setFormData(prev => ({ ...prev, role: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CLUB_ADMIN">Admin do Clube</SelectItem>
                                        {session?.user.role === "SUPER_ADMIN" && (
                                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="password">
                                    {editingUser ? "Nova Senha (deixe vazio para manter)" : "Senha"}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        placeholder={editingUser ? "Nova senha (opcional)" : "Digite a senha"}
                                        required={!editingUser}
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

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingUser ? "Atualizar" : "Adicionar"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Informações do Clube */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                        <span>Contexto do Clube</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 className="font-semibold text-blue-800">Clube Atual</h4>
                            <p className="text-blue-600">{currentClub.name}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-800">Total de Usuários</h4>
                            <p className="text-blue-600">{users.length}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-800">Administradores</h4>
                            <p className="text-blue-600">
                                {users.filter(u => u.role === "CLUB_ADMIN" || u.role === "SUPER_ADMIN").length}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Usuários do Clube</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-muted-foreground">Carregando usuários...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8">
                            <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Nenhum usuário associado ao clube</p>
                            <p className="text-sm text-muted-foreground/70">Adicione administradores para gerenciar o clube</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Nível</TableHead>
                                    <TableHead>Adicionado em</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name || "-"}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell>
                                            {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {user.role !== "SUPER_ADMIN" && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="outline">
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Remover do clube</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Tem certeza que deseja remover &quot;{user.name || user.email}&quot; 
                                                                    do clube {currentClub.name}? 
                                                                    O usuário perderá acesso às funcionalidades administrativas deste clube.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleRemoveFromClub(user.id)}>
                                                                    Remover
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Informações de Ajuda */}
            <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                    <CardTitle className="text-amber-800">Níveis de Acesso</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Badge variant="destructive">Super Admin</Badge>
                            <span className="text-sm text-amber-700">
                                Acesso total ao sistema, pode gerenciar todos os clubes
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant="default">Admin do Clube</Badge>
                            <span className="text-sm text-amber-700">
                                Pode gerenciar torneios, jogadores e usuários deste clube específico
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}