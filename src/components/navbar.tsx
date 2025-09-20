"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, Calendar, User, LogOut, Menu } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useClub } from "@/contexts/ClubContext"

export function Navbar() {
    const { data: session } = useSession()
    const { currentClub } = useClub()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="border-b bg-background">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center space-x-4 lg:space-x-8">
                        <Link href="/" className="flex items-center space-x-2">
                            {currentClub?.logo ? (
                                <Image 
                                    src={currentClub.logo} 
                                    alt={`${currentClub.name} logo`} 
                                    width={96} 
                                    height={96} 
                                    className="h-24 w-24 object-contain"
                                />
                            ) : (
                                <Image 
                                    src="/suprema-five-serie.png" 
                                    alt="Default logo" 
                                    width={96} 
                                    height={96} 
                                    className="h-24 w-24"
                                />
                            )}
                            <span className="font-bold text-lg lg:text-xl text-foreground">
                                {currentClub?.name || "Suprema Five Series"}
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-6">
                            <Link
                                href="/"
                                className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium"
                            >
                                Ranking
                            </Link>

                             <Link
                                href="/tournaments"
                                className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium"
                            >
                                Torneios
                            </Link>

                            <Link
                                href="/points-system"
                                className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium"
                            >
                                Sistema de Pontos
                            </Link>

                            {(!currentClub || currentClub.name?.toLowerCase().includes('five') || currentClub.name?.toLowerCase().includes('suprema')) && (
                                <a
                                    href="/REGULAMENTO RANKING 2025 SUPREMA FIVE SERIES.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium"
                                >
                                    Regulamento
                                </a>
                            )}

                           

                            {session && (
                                <>
                                    {/* Links para Super Admin */}
                                    {session.user.role === 'SUPER_ADMIN' && (
                                        <Link
                                            href="/super-admin"
                                            className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium flex items-center space-x-1"
                                        >
                                            <User className="h-4 w-4" />
                                            <span>Gerenciar Clubes</span>
                                        </Link>
                                    )}

                                    {/* Links para Club Admin */}
                                    <Link
                                        href="/admin/tournaments"
                                        className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium flex items-center space-x-1"
                                    >
                                        <Calendar className="h-4 w-4" />
                                        <span>Torneios</span>
                                    </Link>

                                    <Link
                                        href="/admin/players"
                                        className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium flex items-center space-x-1"
                                    >
                                        <Users className="h-4 w-4" />
                                        <span>Jogadores</span>
                                    </Link>

                                    {/* Usuários apenas para Club Admin */}
                                    {session.user.role === 'CLUB_ADMIN' && (
                                        <Link
                                            href="/admin/users"
                                            className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium flex items-center space-x-1"
                                        >
                                            <User className="h-4 w-4" />
                                            <span>Usuários</span>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Desktop User Menu */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <span className="hidden xl:inline">{session.user?.name || session.user?.email}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {session.user.role === 'CLUB_ADMIN' && session.user.clubName && (
                                        <>
                                            <DropdownMenuItem disabled>
                                                <User className="h-4 w-4 mr-2" />
                                                Clube: {session.user.clubName}
                                            </DropdownMenuItem>
                                            <div className="border-t my-1" />
                                        </>
                                    )}
                                    <DropdownMenuItem onClick={() => signOut()}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/login">
                                <Button variant="outline">Login</Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden border-t bg-background">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link
                                href="/"
                                className="block px-3 py-2 text-muted-foreground hover:text-foreground text-sm font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Ranking
                            </Link>
                            <Link
                                href="/tournaments"
                                className="block px-3 py-2 text-muted-foreground hover:text-foreground text-sm font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Torneios
                            </Link>
                            <Link
                                href="/points-system"
                                className="block px-3 py-2 text-muted-foreground hover:text-foreground text-sm font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Sistema de Pontos
                            </Link>
                            {(!currentClub || currentClub.name?.toLowerCase().includes('five') || currentClub.name?.toLowerCase().includes('suprema')) && (
                                <a
                                    href="/REGULAMENTO RANKING 2025 SUPREMA FIVE SERIES.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-3 py-2 text-muted-foreground hover:text-foreground text-sm font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Regulamento
                                </a>
                            )}

                            {session && (
                                <>
                                    <Link
                                        href="/admin/tournaments"
                                        className="flex px-3 py-2 text-muted-foreground hover:text-foreground text-sm font-medium items-center space-x-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Calendar className="h-4 w-4" />
                                        <span>Torneios Admin</span>
                                    </Link>
                                    <Link
                                        href="/admin/players"
                                        className="flex px-3 py-2 text-muted-foreground hover:text-foreground text-sm font-medium items-center space-x-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Users className="h-4 w-4" />
                                        <span>Jogadores</span>
                                    </Link>
                                    <Link
                                        href="/admin/users"
                                        className="flex px-3 py-2 text-muted-foreground hover:text-foreground text-sm font-medium items-center space-x-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <User className="h-4 w-4" />
                                        <span>Usuários</span>
                                    </Link>
                                </>
                            )}

                            {/* Mobile User Menu */}
                            <div className="border-t pt-3 mt-3">
                                {session ? (
                                    <div className="px-3 py-2">
                                        <div className="text-sm text-muted-foreground mb-2">
                                            {session.user?.name || session.user?.email}
                                        </div>
                                        {session.user.role === 'CLUB_ADMIN' && session.user.clubName && (
                                            <div className="text-xs text-muted-foreground mb-2">
                                                Clube: {session.user.clubName}
                                            </div>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                signOut()
                                                setIsMenuOpen(false)
                                            }}
                                            className="w-full"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Logout
                                        </Button>
                                    </div>
                                ) : (
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="outline" className="w-full mx-3">
                                            Login
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
