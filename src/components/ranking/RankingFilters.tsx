"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"

interface RankingFiltersProps {
  fromDate: string
  toDate: string
  loading: boolean
  onFromDateChange: (date: string) => void
  onToDateChange: (date: string) => void
  onRefresh: () => void
}

export function RankingFilters({
  fromDate,
  toDate,
  loading,
  onFromDateChange,
  onToDateChange,
  onRefresh
}: RankingFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Filtrar por Período</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="from-date">De:</Label>
            <Input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="to-date">Até:</Label>
            <Input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>

          <div className="flex items-end">
            <Button onClick={onRefresh} disabled={loading} className="w-full sm:w-auto">
              Atualizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}