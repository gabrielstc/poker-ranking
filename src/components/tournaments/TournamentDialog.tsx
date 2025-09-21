"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Tournament {
    id: string
    name: string
    date: string
    buyIn: number | null
    description: string | null
    status: string
    type?: "FIXO" | "EXPONENCIAL"
}

interface FormData {
    name: string
    date: string
    buyIn: string
    description: string
    status: string
    tipo: "FIXO" | "EXPONENCIAL"
}

interface TournamentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingTournament: Tournament | null
    onSubmit: (formData: FormData) => void
    onReset: () => void
}

export function TournamentDialog({
    open,
    onOpenChange,
    editingTournament,
    onSubmit,
    onReset
}: TournamentDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        buyIn: "",
        description: "",
        status: "UPCOMING",
        tipo: "EXPONENCIAL" as "FIXO" | "EXPONENCIAL",
    })

    useEffect(() => {
        if (editingTournament) {
            const formatDateForInput = (dateString: string) => {
                const date = new Date(dateString)
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}`
            }
            
            setFormData({
                name: editingTournament.name,
                date: formatDateForInput(editingTournament.date),
                buyIn: editingTournament.buyIn?.toString() || "",
                description: editingTournament.description || "",
                status: editingTournament.status,
                tipo: editingTournament.type || "EXPONENCIAL",
            })
        } else {
            setFormData({
                name: "",
                date: "",
                buyIn: "",
                description: "",
                status: "UPCOMING",
                tipo: "EXPONENCIAL",
            })
        }
    }, [editingTournament])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    const handleClose = () => {
        onOpenChange(false)
        onReset()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {editingTournament ? "Atualizar" : "Criar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}