'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Trophy, Star, Users } from "lucide-react"
import Image from "next/image"

interface SupremaPropagandaProps {
  supremaId: string
  clubName?: string
  variant?: 'default' | 'compact' | 'banner'
  className?: string
}

export function SupremaPropaganda({ 
  supremaId, 
  clubName,
  variant = 'default',
  className = ""
}: SupremaPropagandaProps) {
  const supremaUrl = `https://suprema.com/club/${supremaId}`

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 p-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border border-amber-200 dark:border-amber-800 ${className}`}>
        <Image
          src="/suprema-five-serie.png"
          alt="Suprema"
          width={24}
          height={24}
          className="object-contain"
        />
        <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
          {clubName ? `${clubName} na Suprema` : 'Clube na Suprema'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 ml-auto text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
          onClick={() => window.open(supremaUrl, '_blank')}
        >
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 p-4 rounded-lg text-white shadow-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {clubName ? `${clubName} na Suprema` : 'Torneios na Suprema'}
              </h3>
              <p className="text-white/90 text-sm">
                Participe dos maiores torneios de poker!
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="bg-white text-amber-600 hover:bg-gray-100"
            onClick={() => window.open(supremaUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Acessar
          </Button>
        </div>
      </div>
    )
  }

  // variant === 'default'
  return (
    <Card className={`border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/10 dark:to-yellow-950/10 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
            <Image
              src="/suprema-five-serie.png"
              alt="Suprema Five Series"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg text-amber-900 dark:text-amber-100">
                {clubName ? `${clubName} na Suprema` : 'Torneios na Suprema'}
              </h3>
              <Badge variant="secondary" className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                <Star className="w-3 h-3 mr-1" />
                Oficial
              </Badge>
            </div>
            
            <p className="text-amber-700 dark:text-amber-300 mb-4">
              Participe dos maiores torneios de poker do Brasil! Prêmios em dinheiro, 
              rankings nacionais e a melhor experiência de poker online.
            </p>
            
            <div className="flex items-center gap-4 mb-4 text-sm text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                <span>Torneios Diários</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Milhares de Jogadores</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>Prêmios Reais</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => window.open(supremaUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Acessar Suprema
              </Button>
              <Button
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/20"
                onClick={() => window.open('https://suprema.com/download', '_blank')}
              >
                Download App
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}