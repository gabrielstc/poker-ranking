"use client"

import { usePathname, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
    Trophy, 
    Users, 
    Calculator, 
    UserCheck, 
    ArrowLeft,
    Settings
} from "lucide-react"
import { useClub } from "@/contexts/ClubContext"

interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname()
    const params = useParams()
    const clubSlug = params.slug as string
    const { currentClub } = useClub()

    const adminRoutes = [
        {
            href: `/clube/${clubSlug}/admin/tournaments`,
            label: "Torneios",
            icon: Trophy,
            description: "Gerenciar torneios e resultados"
        },
        {
            href: `/clube/${clubSlug}/admin/players`,
            label: "Jogadores",
            icon: Users,
            description: "Administrar jogadores do clube"
        },
        {
            href: `/clube/${clubSlug}/admin/points-system`,
            label: "Sistema de Pontos",
            icon: Calculator,
            description: "Entender como funciona a pontuação"
        },
        {
            href: `/clube/${clubSlug}/admin/users`,
            label: "Usuários",
            icon: UserCheck,
            description: "Gerenciar administradores do clube"
        }
    ]

    if (!currentClub) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href={`/clube/${clubSlug}`}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Voltar ao Clube
                                </Button>
                            </Link>
                            <div className="flex items-center space-x-2">
                                <Settings className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <h1 className="text-xl font-bold text-foreground">Painel Administrativo</h1>
                                    <p className="text-sm text-muted-foreground">{currentClub.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="p-4">
                                <h2 className="font-semibold mb-4">Administração</h2>
                                <nav className="space-y-2">
                                    {adminRoutes.map((route) => {
                                        const isActive = pathname === route.href
                                        const Icon = route.icon
                                        
                                        return (
                                            <Link key={route.href} href={route.href}>
                                                <Button
                                                    variant={isActive ? "default" : "ghost"}
                                                    className={`w-full justify-start h-auto p-3 ${
                                                        isActive ? "" : "hover:bg-accent"
                                                    }`}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <Icon className={`h-5 w-5 mt-0.5 ${
                                                            isActive ? "text-primary-foreground" : "text-muted-foreground"
                                                        }`} />
                                                        <div className="text-left">
                                                            <div className={`font-medium ${
                                                                isActive ? "text-primary-foreground" : "text-foreground"
                                                            }`}>
                                                                {route.label}
                                                            </div>
                                                            <div className={`text-xs ${
                                                                isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                                                            }`}>
                                                                {route.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Button>
                                            </Link>
                                        )
                                    })}
                                </nav>
                                
                                <hr className="my-4 border-border" />
                                
                                {/* Quick Stats */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-foreground">Resumo</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Clube:</span>
                                            <span className="font-medium text-foreground">{currentClub.name}</span>
                                        </div>
                                        {currentClub.supremaId && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Suprema ID:</span>
                                                <span className="font-medium text-foreground">{currentClub.supremaId}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}