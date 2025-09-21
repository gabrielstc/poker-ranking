"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Plus, Trophy } from "lucide-react"
import { toast } from "sonner"
import { useClub } from "@/contexts/ClubContext"
import { SupremaPropaganda } from "@/components/suprema-propaganda"
import { TournamentDialog } from "@/components/tournaments/TournamentDialog"
import { TournamentTable } from "@/components/tournaments/TournamentTable"

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

interface FormData {
    name: string
    date: string
    buyIn: string
    description: string
    status: string
    tipo: "FIXO" | "EXPONENCIAL"
}

export default function ClubAdminTournamentsPage() {
    const { currentClub } = useClub()
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()
    const clubSlug = params.slug as string
    
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingTournament, setEditingTournament] = useState<Tournament | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const tournamentPerPage = 10
    const abortControllerRef = useRef<AbortController | null>(null)
    const lastFetchedClubId = useRef<string | null>(null)

    // Verificar se o usuário pode gerenciar torneios deste clube
    const canManageTournaments = session && currentClub && (
        session.user.role === 'SUPER_ADMIN' || 
        (session.user.role === 'CLUB_ADMIN' && session.user.clubId === currentClub.id)
    )

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    useEffect(() => {
        if (!canManageTournaments) {
            router.push(`/clube/${clubSlug}`)
            return
        }
    }, [canManageTournaments, router, clubSlug])

    useEffect(() => {
        if (session && currentClub && canManageTournaments) {
            // Se já buscamos dados para este clube, não busque novamente
            if (lastFetchedClubId.current === currentClub.id) return
            
            // Cancelar requisição anterior se existir
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            
            const fetchData = async () => {
                if (!currentClub) return
                
                // Criar novo AbortController para esta requisição
                const abortController = new AbortController()
                abortControllerRef.current = abortController
                
                try {
                    setLoading(true)
                    const response = await fetch(`/api/clubs/${currentClub.id}/tournaments`, {
                        signal: abortController.signal
                    })
                    
                    if (response.ok) {
                        const data = await response.json()
                        if (!abortController.signal.aborted) {
                            setTournaments(data)
                            lastFetchedClubId.current = currentClub.id
                        }
                    }
                } catch (error) {
                    if (error instanceof Error && error.name === 'AbortError') {
                        return // Requisição foi cancelada, não mostrar erro
                    }
                    console.error("Erro ao buscar torneios:", error)
                    toast.error("Erro ao carregar torneios")
                } finally {
                    if (!abortController.signal.aborted) {
                        setLoading(false)
                    }
                }
            }
            
            fetchData()
        }
    }, [session, currentClub, canManageTournaments])

    const fetchTournaments = useCallback(async () => {
        if (!currentClub) return
        
        // Cancelar requisição anterior se existir
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        
        // Criar novo AbortController
        const abortController = new AbortController()
        abortControllerRef.current = abortController
        
        try {
            setLoading(true)
            const response = await fetch(`/api/clubs/${currentClub.id}/tournaments`, {
                signal: abortController.signal
            })
            
            if (response.ok) {
                const data = await response.json()
                if (!abortController.signal.aborted) {
                    setTournaments(data)
                    lastFetchedClubId.current = currentClub.id
                }
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return // Requisição foi cancelada
            }
            console.error("Erro ao buscar torneios:", error)
            toast.error("Erro ao carregar torneios")
        } finally {
            if (!abortController.signal.aborted) {
                setLoading(false)
            }
        }
    }, [currentClub])

    const resetForm = useCallback(() => {
        setEditingTournament(null)
    }, [])

    // Paginação local dos torneios
    const totalPagesCalculated = useMemo(() => {
        return Math.ceil(tournaments.length / tournamentPerPage)
    }, [tournaments.length, tournamentPerPage])

    // Atualizar total de páginas quando necessário
    useEffect(() => {
        setTotalPages(totalPagesCalculated)
        if (currentPage > totalPagesCalculated && totalPagesCalculated > 0) {
            setCurrentPage(1)
        }
    }, [totalPagesCalculated, currentPage])

    const handleSubmit = useCallback(async (formData: FormData) => {
        if (!currentClub) return

        try {
            const url = editingTournament
                ? `/api/clubs/${currentClub.id}/tournaments/${editingTournament.id}`
                : `/api/clubs/${currentClub.id}/tournaments`

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
    }, [currentClub, editingTournament, fetchTournaments, resetForm])

    const handleEdit = useCallback((tournament: Tournament) => {
        setEditingTournament(tournament)
        setDialogOpen(true)
    }, [])

    const handleDelete = useCallback(async (id: string) => {
        if (!currentClub) return
        
        try {
            const response = await fetch(`/api/clubs/${currentClub.id}/tournaments/${id}`, {
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
    }, [currentClub, fetchTournaments])

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!session || !canManageTournaments) {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Gerenciar Torneios</h1>
                    <p className="text-muted-foreground">
                        Crie e gerencie torneios do {currentClub?.name}
                    </p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Torneio
                        </Button>
                    </DialogTrigger>
                </Dialog>
            </div>

            {/* Propaganda da Suprema */}
            {currentClub?.supremaId && (
                <SupremaPropaganda 
                    supremaId={currentClub.supremaId}
                    clubName={currentClub.name}
                    variant="default"
                />
            )}

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
                            <p className="mt-2 text-muted-foreground">Carregando torneios...</p>
                        </div>
                    ) : tournaments.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Nenhum torneio encontrado</p>
                            <p className="text-sm text-muted-foreground/70">Crie seu primeiro torneio para começar</p>
                        </div>
                    ) : (
                        <TournamentTable
                            tournaments={tournaments}
                            clubSlug={clubSlug}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            tournamentPerPage={tournamentPerPage}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </CardContent>
            </Card>

            <TournamentDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingTournament={editingTournament}
                onSubmit={handleSubmit}
                onReset={resetForm}
            />
        </div>
    )
}