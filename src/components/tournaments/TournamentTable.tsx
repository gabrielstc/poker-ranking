"use client"

import { useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Edit, Trash, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { createLocalDate } from "@/lib/date-utils"
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

interface TournamentTableProps {
    tournaments: Tournament[]
    clubSlug: string
    currentPage: number
    totalPages: number
    tournamentPerPage: number
    onEdit: (tournament: Tournament) => void
    onDelete: (id: string) => void
    onPageChange: (page: number) => void
}

export function TournamentTable({
    tournaments,
    clubSlug,
    currentPage,
    totalPages,
    tournamentPerPage,
    onEdit,
    onDelete,
    onPageChange
}: TournamentTableProps) {
    const getStatusBadge = useCallback((status: string) => {
        const badges = {
            UPCOMING: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
            IN_PROGRESS: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
            COMPLETED: "bg-green-500/20 text-green-300 border border-green-500/30",
            CANCELLED: "bg-red-500/20 text-red-300 border border-red-500/30"
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
    }, [])

    const paginatedTournaments = tournaments.slice(
        (currentPage - 1) * tournamentPerPage,
        currentPage * tournamentPerPage
    )

    const totalTournaments = tournaments.length

    return (
        <>
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
                    {paginatedTournaments.map((tournament) => (
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
                                    <Link href={`/clube/${clubSlug}/admin/tournaments/${tournament.id}`}>
                                        <Button size="sm" variant="default">
                                            <Users className="h-4 w-4 mr-1" />
                                            Participantes
                                        </Button>
                                    </Link>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onEdit(tournament)}
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
                                                <AlertDialogAction onClick={() => onDelete(tournament.id)}>
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

            {/* Controles de Paginação */}
            {totalTournaments > tournamentPerPage && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {(currentPage - 1) * tournamentPerPage + 1} a{" "}
                        {Math.min(currentPage * tournamentPerPage, totalTournaments)} de{" "}
                        {totalTournaments} torneios
                    </p>
                    <div className="flex items-center space-x-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                        </Button>
                        <span className="text-sm">
                            Página {currentPage} de {totalPages}
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Próxima
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}