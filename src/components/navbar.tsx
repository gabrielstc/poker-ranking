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

export function Navbar() {
    const { data: session } = useSession()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="border-b bg-white">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center space-x-4 lg:space-x-8">
                        <Link href="/" className="flex items-center space-x-2">
                            <Image 
                                src="/suprema-five-serie.png" 
                                alt="Suprema Five Series" 
                                width={96} 
                                height={96} 
                                className="h-24 w-24"
                            />
                            <span className="font-bold text-lg lg:text-xl">Suprema Five Series</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-6">
                            <Link
                                href="/"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                            >
                                Ranking
                            </Link>

                             <Link
                                href="/tournaments"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                            >
                                Torneios
                            </Link>

                            <Link
                                href="/points-system"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                            >
                                Sistema de Pontos
                            </Link>

                            <a
                                href="/REGULAMENTO RANKING 2025 SUPREMA FIVE SERIES.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                            >
                                Regulamento
                            </a>

                           

                            {session && (
                                <>
                                    <Link
                                        href="/admin/tournaments"
                                        className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center space-x-1"
                                    >
                                        <Calendar className="h-4 w-4" />
                                        <span>Torneios</span>
                                    </Link>

                                    <Link
                                        href="/admin/players"
                                        className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center space-x-1"
                                    >
                                        <Users className="h-4 w-4" />
                                        <span>Jogadores</span>
                                    </Link>

                                    <Link
                                        href="/admin/users"
                                        className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center space-x-1"
                                    >
                                        <User className="h-4 w-4" />
                                        <span>Usuários</span>
                                    </Link>
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
                    <div className="lg:hidden border-t bg-white">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link
                                href="/"
                                className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Ranking
                            </Link>
                            <Link
                                href="/tournaments"
                                className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Torneios
                            </Link>
                            <Link
                                href="/points-system"
                                className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Sistema de Pontos
                            </Link>
                            <a
                                href="/REGULAMENTO RANKING 2025 SUPREMA FIVE SERIES.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Regulamento
                            </a>

                            {session && (
                                <>
                                    <Link
                                        href="/admin/tournaments"
                                        className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center space-x-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Calendar className="h-4 w-4" />
                                        <span>Torneios Admin</span>
                                    </Link>
                                    <Link
                                        href="/admin/players"
                                        className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center space-x-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Users className="h-4 w-4" />
                                        <span>Jogadores</span>
                                    </Link>
                                    <Link
                                        href="/admin/users"
                                        className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center space-x-2"
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
                                        <div className="text-sm text-gray-500 mb-2">
                                            {session.user?.name || session.user?.email}
                                        </div>
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
