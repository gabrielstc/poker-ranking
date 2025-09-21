"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, ArrowLeft, ExternalLink, Users, Trophy } from "lucide-react"
import Link from "next/link"

interface ClubInfo {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  _count: {
    players: number
    tournaments: number
  }
}

interface ClubHeaderProps {
  clubInfo: ClubInfo | null
  slug: string
}

export function ClubHeader({ clubInfo, slug }: ClubHeaderProps) {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              {clubInfo?.name || 'Carregando...'}
            </h1>
            {clubInfo?.description && (
              <p className="text-sm text-muted-foreground">{clubInfo.description}</p>
            )}
          </div>
        </div>

        <a 
          href={`/clube/${slug}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center"
        >
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </a>
      </div>

      {clubInfo && (
        <div className="flex justify-center gap-4 flex-wrap">
          <Badge variant="secondary" className="text-sm">
            <Users className="w-4 h-4 mr-1" />
            {clubInfo._count.players} jogadores
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Trophy className="w-4 h-4 mr-1" />
            {clubInfo._count.tournaments} torneios
          </Badge>
        </div>
      )}
    </div>
  )
}